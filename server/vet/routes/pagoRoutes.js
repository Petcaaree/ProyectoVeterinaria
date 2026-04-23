import express from "express";
import { PagoController } from "../controllers/pagoController.js";
import { verificarFirmaMP } from "../middlewares/verificarFirmaMP.js";

export default function pagoRoutes(getController) {
  const router = express.Router();

  // Webhook de MercadoPago — sin authMiddleware ni rate limiter,
  // la autenticidad se valida con firma HMAC.
  router.post("/petcare/pagos/webhook", verificarFirmaMP, (req, res, next) => {
    getController(PagoController).webhook(req, res, next);
  });

  return router;
}
