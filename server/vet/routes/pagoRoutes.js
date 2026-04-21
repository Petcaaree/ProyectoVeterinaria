import express from "express";
import { PagoController } from "../controllers/pagoController.js";

export default function pagoRoutes(getController) {
  const router = express.Router();

  // Webhook de MercadoPago — sin authMiddleware ni rate limiter
  router.post("/petcare/pagos/webhook", (req, res, next) => {
    getController(PagoController).webhook(req, res, next);
  });

  return router;
}
