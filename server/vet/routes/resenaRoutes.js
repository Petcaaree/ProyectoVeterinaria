import express from "express";
import { ResenaController } from "../controllers/resenaController.js";
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { resenaSchema, paginationSchema } from "../validators/schemas.js";

export default function resenaRoutes(getController) {
  const router = express.Router();

  // Solo clientes autenticados pueden crear reseñas.
  router.post(
    "/petcare/resena",
    authMiddleware,
    authorizationMiddleware("cliente"),
    validate(resenaSchema),
    (req, res, next) => {
      getController(ResenaController).create(req, res, next);
    }
  );

  // Listado público (ver reseñas sin loguearse).
  router.get(
    "/petcare/resenas/servicio/:id",
    validate(paginationSchema, "query"),
    (req, res, next) => {
      getController(ResenaController).listByServicio(req, res, next);
    }
  );

  return router;
}
