import express from "express"
import { ServicioCuidadorController } from "../controllers/servicioCuidadorController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"

export default function servicioCuidadorRoutes(getController) {
    const router = express.Router()

    // --- Rutas publicas (browse) ---
    router.get("/petcare/serviciosCuidadores", (req, res, next) => {
        getController(ServicioCuidadorController).findAll(req, res, next)
    })

    router.get("/petcare/servicioCuidador/:id", (req, res, next) => {
        getController(ServicioCuidadorController).findById(req, res, next)
    })

    router.get("/petcare/serviciosCuidador/cuidador/:id", (req, res, next) => {
        getController(ServicioCuidadorController).getByCuidador(req, res, next)
    })

    router.get("/petcare/cuidador/:id/serviciosCuidador/:estado", (req, res, next) => {
        getController(ServicioCuidadorController).findByEstadoServicioCuidador(req, res, next)
    })

    // --- Rutas protegidas ---
    router.post("/petcare/servicioCuidador", authMiddleware, (req, res, next) => {
        getController(ServicioCuidadorController).create(req, res, next)
    })

    router.delete("/petcare/servicioCuidador/:id", authMiddleware, (req, res, next) => {
        getController(ServicioCuidadorController).delete(req, res, next)
    })

    router.post("/petcare/serviciosCuidadores/array", authMiddleware, (req, res, next) => {
        getController(ServicioCuidadorController).importArray(req, res, next)
    })

    router.put("/petcare/cuidador/:id/servicioCuidador/:nuevoEstado", authMiddleware, (req, res, next) =>
        getController(ServicioCuidadorController).cambiarEstadoCuidador(req, res, next)
    )

    router.get("/petcare/cuidador/:id/notificaciones", authMiddleware, (req, res, next) => {
                getController(ServicioCuidadorController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
        })

    return router
}
       