import MercadoPagoConfig, { Preference, Payment } from "mercadopago";
import { ValidationError, NotFoundError } from "../errors/AppError.js";

export class PagoService {
  constructor(reservaService, pagoRepository) {
    this.reservaService = reservaService;
    this.pagoRepository = pagoRepository;
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || "",
    });
  }

  async crearPreferencia(reservaDTO) {
    const reservaId = (reservaDTO._id || reservaDTO.id)?.toString();
    if (!reservaId) {
      throw new ValidationError("ID de reserva inválido para crear preferencia de pago");
    }

    const nombreServicio =
      reservaDTO.servicioReservado?.nombreServicio ||
      reservaDTO.serviciOfrecido ||
      "Servicio PetConnect";

    const precioTotal = reservaDTO.precioTotal || reservaDTO.servicioReservado?.precio || 0;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const preferenceBody = {
      items: [
        {
          id: reservaId,
          title: nombreServicio,
          quantity: 1,
          unit_price: precioTotal,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${frontendUrl}?payment_status=approved&reserva_id=${reservaId}`,
        failure: `${frontendUrl}?payment_status=failure&reserva_id=${reservaId}`,
        pending: `${frontendUrl}?payment_status=pending&reserva_id=${reservaId}`,
      },
      auto_return: "approved",
      external_reference: reservaId,
      notification_url: `${process.env.BACKEND_URL || "http://localhost:3000"}/petcare/pagos/webhook`,
      statement_descriptor: "PetConnect",
    };

    const preference = new Preference(this.client);
    const result = await preference.create({ body: preferenceBody });

    // Guardar registro de pago
    const nuevoPago = {
      reservaId,
      monto: precioTotal,
      estado: "PENDIENTE",
      mercadoPagoPreferenceId: result.id,
    };
    await this.pagoRepository.save(nuevoPago);

    // Guardar preferenceId en la reserva
    await this.reservaService.guardarPreferenceId(reservaId, result.id);

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

    const paymentClient = new Payment(this.client);
    const paymentData = await paymentClient.get({ id: paymentId });

    const reservaId = paymentData.external_reference;
    if (!reservaId) {
      throw new ValidationError("Referencia externa no encontrada en el pago");
    }

    // Actualizar registro de pago
    const pagoExistente = await this.pagoRepository.findByPreferenceId(
      paymentData.preference_id
    );
    if (pagoExistente) {
      pagoExistente.mercadoPagoPaymentId = paymentId.toString();
      pagoExistente.mercadoPagoStatus = paymentData.status;
      pagoExistente.mercadoPagoStatusDetail = paymentData.status_detail;
      pagoExistente.estado = this._mapearEstadoMP(paymentData.status);
      await this.pagoRepository.save(pagoExistente);
    }

    if (paymentData.status === "approved") {
      await this.reservaService.confirmarPorPago(reservaId, paymentId.toString());
    } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
      await this.reservaService.cancelarPorPago(reservaId);
    }
    // Para "pending" e "in_process" no hacemos nada — la reserva sigue en PENDIENTE_PAGO

    return { status: paymentData.status, reservaId };
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
