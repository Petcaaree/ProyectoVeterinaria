export class PagoController {
  constructor(pagoService) {
    this.pagoService = pagoService;
  }

  // POST /petcare/pagos/webhook — llamado por MercadoPago, sin auth
  async webhook(req, res, next) {
    try {
      const { type, action, data } = req.body;

      // Webhooks v2 (nuevo): { action: "payment.updated", data: { id: "123" } }
      // IPN (legacy):         query params ?topic=payment&id=123
      let paymentId = data?.id || req.query.id;

      // Solo procesar eventos de pago
      const esEventoPago =
        type === "payment" ||
        action === "payment.created" ||
        action === "payment.updated" ||
        req.query.topic === "payment";

      if (!esEventoPago || !paymentId) {
        // Otros eventos (merchant_orders, etc.) — responder OK sin procesar
        return res.sendStatus(200);
      }

      await this.pagoService.procesarWebhook(paymentId);
      res.sendStatus(200);
    } catch (error) {
      // Responder 200 igual para no hacer que MP reintente indefinidamente
      console.error("Error procesando webhook de MercadoPago:", error.message);
      res.sendStatus(200);
    }
  }
}
