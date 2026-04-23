import express from "express";
import { VerificacionController } from "../controllers/verificacionController.js";
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js";

export default function verificacionRoutes(getController) {
    const router = express.Router();

    // Veterinaria autenticada
    router.post(
        "/petcare/veterinaria/verificacion",
        authMiddleware,
        authorizationMiddleware("veterinaria"),
        (req, res, next) => getController(VerificacionController).crear(req, res, next)
    );

    router.get(
        "/petcare/veterinaria/verificacion/estado",
        authMiddleware,
        authorizationMiddleware("veterinaria"),
        (req, res, next) => getController(VerificacionController).consultarEstado(req, res, next)
    );

    router.put(
        "/petcare/veterinaria/verificacion/reenviar",
        authMiddleware,
        authorizationMiddleware("veterinaria"),
        (req, res, next) => getController(VerificacionController).reenviar(req, res, next)
    );

    // Admin: aprobar/rechazar
    router.patch(
        "/petcare/admin/verificaciones/:id",
        authMiddleware,
        authorizationMiddleware("admin"),
        (req, res, next) => getController(VerificacionController).resolver(req, res, next)
    );

    return router;
}
