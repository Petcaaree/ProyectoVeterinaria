import express from "express";
import { MpOauthController } from "../controllers/mpOauthController.js";
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js";

export default function mpOauthRoutes(getController) {
    const router = express.Router();

    // Proveedor autenticado: pedir URL de autorización.
    router.get(
        "/petcare/proveedor/conectar-mp",
        authMiddleware,
        authorizationMiddleware("veterinaria", "paseador", "cuidador"),
        (req, res, next) => getController(MpOauthController).conectar(req, res, next)
    );

    // Estado de conexión MP del proveedor logueado.
    router.get(
        "/petcare/proveedor/mp-status",
        authMiddleware,
        authorizationMiddleware("veterinaria", "paseador", "cuidador"),
        (req, res, next) => getController(MpOauthController).estado(req, res, next)
    );

    // Desconectar (borra tokens almacenados).
    router.delete(
        "/petcare/proveedor/desconectar-mp",
        authMiddleware,
        authorizationMiddleware("veterinaria", "paseador", "cuidador"),
        (req, res, next) => getController(MpOauthController).desconectar(req, res, next)
    );

    // Callback público de MP — la auth se hace contra el JWT en `state`.
    router.get(
        "/petcare/proveedor/callback-mp",
        (req, res, next) => getController(MpOauthController).callback(req, res, next)
    );

    return router;
}
