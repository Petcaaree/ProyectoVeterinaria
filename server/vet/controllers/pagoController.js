export class PagoController {
  constructor(pagoService, reservaService) {
    this.pagoService = pagoService;
    this.reservaService = reservaService;
  }

  // POST /petcare/pagos/webhook — llamado por MercadoPago, sin auth
  async webhook(req, res, next) {
    try {
      const { type, action, data } = req.body;

      // Webhooks v2 (nuevo): { action: "payment.updated", data: { id: "123" } }
      // IPN (legacy):         query params ?topic=payment&id=123
      let paymentId = data?.id || req.query.id;

      const esEventoPago =
        type === "payment" ||
        action === "payment.created" ||
        action === "payment.updated" ||
        req.query.topic === "payment";

      if (!esEventoPago || !paymentId) {
        return res.sendStatus(200);
      }

      await this.pagoService.procesarWebhook(paymentId);
      res.sendStatus(200);
    } catch (error) {
      // Responder 200 igual para que MP no reintente indefinidamente
      console.error("Error procesando webhook de MercadoPago:", error.message);
      res.sendStatus(200);
    }
  }
}
