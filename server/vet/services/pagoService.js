import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { ValidationError } from "../errors/AppError.js";
import { enviarEmailPagoConfirmado } from "./emailService.js";
import { MpOauthService } from "./mpOauthService.js";
import logger from "../utils/logger.js";

export class PagoService {
  constructor(reservaService, pagoRepository, configuracionRepo) {
    this.reservaService = reservaService;
    this.pagoRepository = pagoRepository;
    this.configuracionRepo = configuracionRepo;
    // Cliente "plataforma" — solo se usa para el webhook (consultar pagos por id) y
    // como fallback. Las preferencias de pago se crean con el token del proveedor.
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
    const proveedorAccessToken = MpOauthService.getAccessTokenDecrypted(proveedor);
    if (!proveedorAccessToken) {
      // Bloqueo duro (alineado con requireMpConectado): no se puede crear preferencia
      // si el proveedor no vinculó MP. requireMpConectado debería haber prevenido la
      // publicación del servicio, pero validamos defensivamente.
      throw new ValidationError(
        "El proveedor no tiene su cuenta de MercadoPago vinculada. No se puede procesar el pago."
      );
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

  async procesarWebhook(paymentId) {
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

    const paymentClient = new Payment(this.client);
    const paymentData = await paymentClient.get({ id: paymentId });

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
