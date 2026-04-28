export class PagoController {
  constructor(pagoService, reservaService) {
    this.pagoService = pagoService;
    this.reservaService = reservaService;
  }

  // POST /petcare/pagos/webhook — llamado por MercadoPago, sin auth
  async webhook(req, res, next) {
    try {
      const { type, action, data, user_id } = req.body;

      // Webhooks v2 (nuevo): { action: "payment.updated", data: { id: "123" }, user_id: "..." }
      // IPN (legacy):         query params ?topic=payment&id=123
      let paymentId = data?.id || req.query.id;
      // user_id es el dueño del pago (proveedor en marketplace) — útil como fallback
      // si el token de plataforma no puede consultar el pago.
      const collectorId = user_id ? String(user_id) : null;

      const esEventoPago =
        type === "payment" ||
        action === "payment.created" ||
        action === "payment.updated" ||
        req.query.topic === "payment";

      if (!esEventoPago || !paymentId) {
        return res.sendStatus(200);
      }

      await this.pagoService.procesarWebhook(paymentId, { collectorId });
      res.sendStatus(200);
    } catch (error) {
      // Responder 200 igual para que MP no reintente indefinidamente
      console.error("Error procesando webhook de MercadoPago:", error.message);
      res.sendStatus(200);
    }
  }
}
