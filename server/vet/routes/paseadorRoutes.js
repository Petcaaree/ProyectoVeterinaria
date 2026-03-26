import express from "express"
import { PaseadorController } from "../controllers/paseadorController.js"
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js"
import { validate } from "../middlewares/validateMiddleware.js"
import { loginSchema, registroPaseadorSchema, paginationSchema } from "../validators/schemas.js"

export default function paseadorRoutes(getController) {
    const router = express.Router()

    // --- Rutas publicas ---
    router.get("/petcare/paseadores", validate(paginationSchema, 'query'), (req, res, next) => {
        getController(PaseadorController).findAll(req, res, next)
    })

    router.post("/petcare/login/paseador", validate(loginSchema), (req, res, next) => {
        getController(PaseadorController).logIn(req, res, next)
    })

    router.post("/petcare/signin/paseador", validate(registroPaseadorSchema), (req, res, next) =>
        getController(PaseadorController).create(req, res, next)
    )

    // --- Rutas protegidas (solo paseador) ---
    router.delete("/petcare/paseador/:id", authMiddleware, authorizationMiddleware('paseador'), (req, res, next)=>
        getController(PaseadorController).delete(req, res, next)
    )

    router.put("/petcare/paseador/:id", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
        getController(PaseadorController).update(req, res, next)
    )

    router.put("/petcare/paseador/:id/reserva", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
        getController(PaseadorController).updateReserva(req, res, next)
    )

    router.put("/petcare/paseador/:id/cancelar/:idReserva", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
        getController(PaseadorController).cancelReserva(req, res, next)
    )

    router.put("/petcare/paseador/:id/activar/:idServicio", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
        getController(PaseadorController).activarServicio(req, res, next)
    )

    router.put("/petcare/paseador/:id/desactivar/:idServicio", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
        getController(PaseadorController).desactivarServicio(req, res, next)
    )

    router.put("/petcare/paseador/:id/notificaciones/:idNotificacion", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
            getController(PaseadorController).marcarLeidaNotificacion(req, res, next)
    )

    router.put("/petcare/paseador/:id/marcarNotificacionLeidas", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
                getController(PaseadorController).marcarTodasLasNotificacionesLeidas(req, res, next)
    )

    // Nueva ruta para obtener solo el contador de notificaciones no leídas
    router.get("/petcare/paseador/:id/notificaciones/contador", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
        getController(PaseadorController).obtenerContadorNotificacionesNoLeidas(req, res, next)
    )

    router.get("/petcare/paseador/:id/notificaciones/:leida", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) =>
            getController(PaseadorController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
        )

        router.get("/petcare/paseador/:id/notificaciones", authMiddleware, authorizationMiddleware('paseador'), (req, res, next) => {
                        getController(PaseadorController).obtenerTodasLasNotificaciones(req, res, next)
        })

    

    return router
}