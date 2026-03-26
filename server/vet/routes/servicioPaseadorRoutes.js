import express from "express"
import { ServicioPaseadorController } from "../controllers/servicioPaseadorController.js"
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js"
import { validate } from "../middlewares/validateMiddleware.js"
import { servicioPaseadorSchema, paginationSchema } from "../validators/schemas.js"

export default function servicioPaseadorRoutes(getController) {
    const router = express.Router()

    // --- Rutas publicas (browse) ---
    router.get("/petcare/serviciosPaseadores", validate(paginationSchema, 'query'), (req, res, next) => {
        getController(ServicioPaseadorController).findAll(req, res, next)
    })

    router.get("/petcare/serviciosPaseadores/:id", (req, res, next) => {
        getController(ServicioPaseadorController).findById(req, res, next)
    })

    router.get("/petcare/serviciosPaseadores/paseador/:id", (req, res, next) => {
        getController(ServicioPaseadorController).getByPaseador(req, res, next)
    })

    router.get("/petcare/paseador/:id/serviciosPaseador/:estado", (req, res, next) => {
            getController(ServicioPaseadorController).findByEstadoServicioPaseador(req, res, next)
    })

    // --- Rutas protegidas (solo paseador) ---
    router.post("/petcare/servicioPaseadores", authMiddleware, authorizationMiddleware('paseador'), validate(servicioPaseadorSchema), (req, res, next) => {
        getController(ServicioPaseadorController).create(req, res, next)
    })

    router.delete("/petcare/servicios/:id", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) => {
        getController(ServicioPaseadorController).delete(req, res, next)
    })

    router.post("/petcare/serviciosPaseadores/array", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) => {
        getController(ServicioPaseadorController).importArray(req, res, next)
    })

    router.put("/petcare/paseador/:id/servicioPaseador/:nuevoEstado", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
        getController(ServicioPaseadorController).cambiarEstadoPaseador(req, res, next)
    )

    router.get("/petcare/paseador/:id/notificaciones", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) => {
                getController(ServicioPaseadorController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
        })

    return router
}
