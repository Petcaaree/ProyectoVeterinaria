import express from "express"
import { ServicioCuidadorController } from "../controllers/servicioCuidadorController.js"
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js"
import { validate } from "../middlewares/validateMiddleware.js"
import { servicioCuidadorSchema, paginationSchema } from "../validators/schemas.js"

export default function servicioCuidadorRoutes(getController) {
    const router = express.Router()

    // --- Rutas publicas (browse) ---
    router.get("/petcare/serviciosCuidadores", validate(paginationSchema, 'query'), (req, res, next) => {
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

    // --- Rutas protegidas (solo cuidador) ---
    router.post("/petcare/servicioCuidador", authMiddleware, authorizationMiddleware('cuidador'), validate(servicioCuidadorSchema), (req, res, next) => {
        getController(ServicioCuidadorController).create(req, res, next)
    })

    router.delete("/petcare/servicioCuidador/:id", authMiddleware, authorizationMiddleware('cuidador'), (req, res, next) => {
        getController(ServicioCuidadorController).delete(req, res, next)
    })

    router.post("/petcare/serviciosCuidadores/array", authMiddleware, authorizationMiddleware('cuidador'), (req, res, next) => {
        getController(ServicioCuidadorController).importArray(req, res, next)
    })

    router.put("/petcare/cuidador/:id/servicioCuidador/:nuevoEstado", authMiddleware, authorizationMiddleware('cuidador'), (req, res, next) =>
        getController(ServicioCuidadorController).cambiarEstadoCuidador(req, res, next)
    )

    router.get("/petcare/cuidador/:id/notificaciones", authMiddleware, authorizationMiddleware('cuidador'), (req, res, next) => {
                getController(ServicioCuidadorController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
        })

    return router
}
       