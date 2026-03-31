export class PagoController {
  constructor(pagoService, reservaService) {
    this.pagoService = pagoService;
    this.reservaService = reservaService;
  }

  // POST /petcare/pagos/reintentar/:reservaId — llamado por el cliente cuando no tiene preferenceId
  async reintentarPago(req, res, next) {
    try {
      const { reservaId } = req.params;
      const reservaDTO = await this.reservaService.findById(reservaId);
      if (!reservaDTO) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }
      const pagoInfo = await this.pagoService.crearPreferencia(reservaDTO);
      res.json(pagoInfo);
    } catch (error) {
      next(error);
    }
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
