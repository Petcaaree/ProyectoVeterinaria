import express from "express";
import { VerificacionPaseadorController } from "../controllers/verificacionPaseadorController.js";
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js";

export default function verificacionPaseadorRoutes(getController) {
    const router = express.Router();

    // Paseador autenticado
    router.post(
        "/petcare/paseador/verificacion",
        authMiddleware,
        authorizationMiddleware("paseador"),
        (req, res, next) => getController(VerificacionPaseadorController).crear(req, res, next)
    );

    router.get(
        "/petcare/paseador/verificacion/estado",
        authMiddleware,
        authorizationMiddleware("paseador"),
        (req, res, next) => getController(VerificacionPaseadorController).consultarEstado(req, res, next)
    );

    router.put(
        "/petcare/paseador/verificacion/reenviar",
        authMiddleware,
        authorizationMiddleware("paseador"),
        (req, res, next) => getController(VerificacionPaseadorController).reenviar(req, res, next)
    );

    // Admin
    router.get(
        "/petcare/admin/paseadores/verificacion/pendientes",
        authMiddleware,
        authorizationMiddleware("admin"),
        (req, res, next) => getController(VerificacionPaseadorController).listarPendientes(req, res, next)
    );

    router.get(
        "/petcare/admin/paseadores/verificacion/pendientes/count",
        authMiddleware,
        authorizationMiddleware("admin"),
        (req, res, next) => getController(VerificacionPaseadorController).contarPendientes(req, res, next)
    );

    router.patch(
        "/petcare/admin/paseadores/:paseadorId/verificacion",
        authMiddleware,
        authorizationMiddleware("admin"),
        (req, res, next) => getController(VerificacionPaseadorController).resolver(req, res, next)
    );

    return router;
}
