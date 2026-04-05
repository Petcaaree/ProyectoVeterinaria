import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { loginSchema } from "../validators/schemas.js";

export default function adminRoutes(getController) {
    const router = express.Router();

    // --- Login admin (publico, sin registro) ---
    router.post("/petcare/login/admin", validate(loginSchema), (req, res, next) => {
        getController(AdminController).logIn(req, res, next);
    });

    // --- Rutas protegidas (solo admin) ---
    router.get("/petcare/admin/metricas", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).getMetricas(req, res, next);
    });

    // --- Gestion de usuarios ---
    router.get("/petcare/admin/usuarios/:tipo", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).getUsuarios(req, res, next);
    });

    router.put("/petcare/admin/usuarios/:tipo/:id/suspender", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).suspenderUsuario(req, res, next);
    });

    router.put("/petcare/admin/usuarios/:tipo/:id/reactivar", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).reactivarUsuario(req, res, next);
    });

    router.delete("/petcare/admin/usuarios/:tipo/:id", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).eliminarUsuario(req, res, next);
    });

    // --- Gestion de servicios ---
    router.get("/petcare/admin/servicios/:tipo", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).getServicios(req, res, next);
    });

    router.put("/petcare/admin/servicios/:tipo/:id/moderar", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).moderarServicio(req, res, next);
    });

    // --- Configuracion ---
    router.get("/petcare/admin/configuracion", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).getConfiguracion(req, res, next);
    });

    router.put("/petcare/admin/configuracion", authMiddleware, authorizationMiddleware('admin'), (req, res, next) => {
        getController(AdminController).updateConfiguracion(req, res, next);
    });

    return router;
}
