import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { ValidationError } from "../errors/AppError.js";
import { enviarEmailPagoConfirmado } from "./emailService.js";
import { ServicioOfrecido } from "../models/entidades/enums/ServiciOfrecido.js";
import logger from "../utils/logger.js";

export class PagoService {
  constructor(reservaService, pagoRepository, configuracionRepo, mpOauthService) {
    this.reservaService = reservaService;
    this.pagoRepository = pagoRepository;
    this.configuracionRepo = configuracionRepo;
    this.mpOauthService = mpOauthService;
    // Cliente "plataforma" — se usa exclusivamente para el webhook (consultar pagos por id).
    // Las preferencias de pago se crean siempre con el token del proveedor; no hay
    // fallback automático a este cliente si la resolución del token del proveedor falla.
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || "",
    });
  }

  // Crea la preferencia de MP para una ReservaPendiente. La Reserva definitiva
  // se crea recién cuando llegue el webhook con status=approved (ver procesarWebhook).
  async crearPreferenciaParaPendiente(pendienteDTO) {
    const pendienteId = (pendienteDTO._id || pendienteDTO.id)?.toString();
    if (!pendienteId) {
      throw new ValidationError("ID de reserva pendiente inválido para crear preferencia de pago");
    }

    const nombreServicio =
      pendienteDTO.servicioReservado?.nombreServicio ||
      pendienteDTO.serviciOfrecido ||
      "Servicio PetConnect";

    const precioBase = pendienteDTO.precioTotal || pendienteDTO.servicioReservado?.precio || 0;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // El cliente paga precioBase + comisión; el proveedor recibe precioBase.
    // Debe coincidir con el desglose mostrado en el modal.
    const config = await this.configuracionRepo.getConfig();
    const porcentaje = config.comisionPorcentaje || 0;
    const fija = config.comisionFija || 0;
    const comision = Math.round(((precioBase * porcentaje) / 100 + fija) * 100) / 100;
    const montoTotal = precioBase + comision;

    // Resolver el proveedor de la reserva pendiente: el cobro lo hace su cuenta MP
    // (split payment), y la plataforma retiene marketplace_fee = comisión.
    const proveedor = pendienteDTO.servicioReservado?.usuarioProveedor;
    const proveedorId = (proveedor?._id || proveedor?.id)?.toString();
    const tipo = this._resolverTipoProveedor(pendienteDTO.serviciOfrecido);
    if (!proveedorId || !tipo) {
      throw new ValidationError("No se pudo resolver el proveedor del servicio");
    }

    // getAccessTokenValido refresca el token si está por expirar; si no se puede
    // refrescar (sin refresh_token o MP rechaza), marca al proveedor como desconectado
    // y lanza MP_REAUTORIZACION_REQUERIDA para forzar nueva vinculación.
    let proveedorAccessToken;
    try {
      proveedorAccessToken = await this.mpOauthService.getAccessTokenValido({ proveedorId, tipo });
    } catch (err) {
      if (err.code === "MP_NO_CONECTADO" || err.code === "MP_REAUTORIZACION_REQUERIDA") {
        throw new ValidationError(
          err.code === "MP_REAUTORIZACION_REQUERIDA"
            ? "El proveedor debe re-vincular su cuenta de MercadoPago. No se puede procesar el pago."
            : "El proveedor no tiene su cuenta de MercadoPago vinculada. No se puede procesar el pago."
        );
      }
      throw err;
    }
    const proveedorClient = new MercadoPagoConfig({ accessToken: proveedorAccessToken });

    const preferenceBody = {
      items: [
        {
          id: pendienteId,
          title: nombreServicio,
          quantity: 1,
          unit_price: montoTotal,
          currency_id: "ARS",
        },
      ],
      // Marketplace: el cliente paga montoTotal (precioBase + comisión) al proveedor;
      // MP retiene `marketplace_fee` para la plataforma de forma automática.
      marketplace_fee: comision,
      back_urls: {
        success: `${frontendUrl}?payment_status=approved&pendiente_id=${pendienteId}`,
        failure: `${frontendUrl}?payment_status=failure&pendiente_id=${pendienteId}`,
        pending: `${frontendUrl}?payment_status=pending&pendiente_id=${pendienteId}`,
      },
      external_reference: pendienteId,
      notification_url: `${process.env.BACKEND_URL || "http://localhost:3000"}/petcare/pagos/webhook`,
      statement_descriptor: "PetConnect",
    };

    const preference = new Preference(proveedorClient);
    const result = await preference.create({ body: preferenceBody });

    const nuevoPago = {
      reservaPendienteId: pendienteId,
      monto: montoTotal,
      montoComision: comision,
      montoProveedor: precioBase,
      comisionPorcentajeAplicado: porcentaje,
      comisionFijaAplicada: fija,
      marketplaceFee: comision,
      mpCollectorId: proveedor.mpUserId || null,
      estado: "PENDIENTE",
      mercadoPagoPreferenceId: result.id,
    };
    await this.pagoRepository.save(nuevoPago);

    await this.reservaService.guardarPreferenceIdPendiente(pendienteId, result.id);

    return {
      preferenceId: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    };
  }

  async procesarWebhook(paymentId, { collectorId = null } = {}) {
    if (!paymentId) {
      throw new ValidationError("ID de pago requerido");
    }

    // Idempotencia: si este paymentId ya fue procesado y aprobado, salir sin side effects.
    // MP reintenta webhooks ante errores de red; sin esta guarda se aplicaría comisión 2 veces.
    const pagoExistente = await this.pagoRepository.findByPaymentId(paymentId.toString());
    if (pagoExistente && pagoExistente.estado === "APROBADO") {
      logger.info("Webhook duplicado ignorado", {
        paymentId: paymentId.toString(),
        pagoId: (pagoExistente._id || pagoExistente.id)?.toString(),
      });
      return { status: "approved", deduplicated: true };
    }

    // Estrategia: el marketplace_owner (plataforma) está autorizado por MP a consultar
    // pagos donde retiene marketplace_fee, así que probamos primero con su token
    // (no requiere DB hit). Si MP lo rechaza —p.ej. cuentas con políticas más
    // restrictivas— caemos al token del proveedor que cobró.
    let paymentData;
    try {
      paymentData = await new Payment(this.client).get({ id: paymentId });
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if ((status === 401 || status === 403 || status === 404) && collectorId) {
        logger.warn("Payment.get con token plataforma falló, reintentando con token del proveedor", {
          paymentId: paymentId.toString(), status, collectorId,
        });
        paymentData = await this._getPaymentConTokenProveedor(paymentId, collectorId);
      } else {
        throw err;
      }
    }

    const externalReference = paymentData.external_reference;
    if (!externalReference) {
      throw new ValidationError("Referencia externa no encontrada en el pago");
    }

    // external_reference puede ser un reservaPendienteId (flujo nuevo) o un reservaId
    // (pagos creados antes del refactor). Buscamos primero como pendiente.
    let pago = await this.pagoRepository.findByReservaPendienteId(externalReference);
    if (!pago) {
      pago = await this.pagoRepository.findByReservaId(externalReference);
    }

    // Dedupe: MP envía payment.created y payment.updated para el mismo pago.
    const yaProcesado =
      pago &&
      pago.mercadoPagoPaymentId === paymentId.toString() &&
      pago.mercadoPagoStatus === paymentData.status;
    if (yaProcesado) {
      return { status: paymentData.status, externalReference, deduplicated: true };
    }

    if (pago) {
      pago.mercadoPagoPaymentId = paymentId.toString();
      pago.mercadoPagoStatus = paymentData.status;
      pago.mercadoPagoStatusDetail = paymentData.status_detail;
      pago.estado = this._mapearEstadoMP(paymentData.status);
    }

    if (paymentData.status === "approved") {
      const pendienteId = pago?.reservaPendienteId?.toString() || externalReference;
      const reservaDTO = await this.reservaService.crearDesdePendiente(
        pendienteId,
        paymentId.toString(),
        pago?.mercadoPagoPreferenceId,
      );

      // Asociar el pago a la Reserva recién creada (y limpiar el link al pendiente).
      if (pago && reservaDTO) {
        pago.reservaId = reservaDTO._id || reservaDTO.id;
        pago.reservaPendienteId = null;
      }

      // Email de comprobante al cliente: fire-and-forget para no demorar la
      // respuesta al webhook de MP (MP reintenta si tardamos mucho).
      if (reservaDTO) {
        const referencia = (reservaDTO._id || reservaDTO.id)?.toString();
        enviarEmailPagoConfirmado(reservaDTO, pago?.monto, referencia).catch((emailError) => {
          logger.error("Error al enviar email de pago confirmado", {
            paymentId,
            error: emailError.message,
          });
        });
      }
    } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
      const pendienteId = pago?.reservaPendienteId?.toString() || externalReference;
      await this.reservaService.revertirPendiente(pendienteId);
    }
    // Para "pending" / "in_process" no hacemos nada — el pendiente sigue vivo
    // hasta que expire o se reciba un estado final.

    if (pago) {
      await this.pagoRepository.save(pago);
    }

    return { status: paymentData.status, externalReference };
  }

  // Consulta Payment.get usando el token del proveedor cuyo mpUserId == collectorId.
  // Delega la resolución a MpOauthService para mantener encapsulada la estructura repos.
  async _getPaymentConTokenProveedor(paymentId, mpUserId) {
    const accessToken = await this.mpOauthService.getAccessTokenValidoPorMpUserId(mpUserId);
    if (!accessToken) {
      throw new ValidationError(
        `No se encontró proveedor con mpUserId=${mpUserId} para resolver token`
      );
    }
    const proveedorClient = new MercadoPagoConfig({ accessToken });
    return new Payment(proveedorClient).get({ id: paymentId });
  }

  _resolverTipoProveedor(serviciOfrecido) {
    // Mapea los VALORES del enum ServicioOfrecido (no las keys) a los tipos
    // que espera MpOauthService (clave del dict de repos).
    const map = {
      [ServicioOfrecido.SERVICIOVETERINARIA]: "veterinaria",
      [ServicioOfrecido.SERVICIOPASEADOR]: "paseador",
      [ServicioOfrecido.SERVICIOCUIDADOR]: "cuidador",
    };
    return map[serviciOfrecido] || null;
  }

  _mapearEstadoMP(mpStatus) {
    switch (mpStatus) {
      case "approved":
        return "APROBADO";
      case "rejected":
      case "cancelled":
        return "RECHAZADO";
      case "pending":
      case "in_process":
        return "EN_PROCESO";
      case "refunded":
        return "DEVUELTO";
      default:
        return "PENDIENTE";
    }
  }
}
