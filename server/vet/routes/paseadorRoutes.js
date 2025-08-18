import express from "express"
import { PaseadorController } from "../controllers/paseadorController.js"

export default function paseadorRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/paseadores", (req, res, next) => {
        getController(PaseadorController).findAll(req, res, next)
    })

    router.post("/petcare/login/paseador", (req, res, next) => {
        getController(PaseadorController).logIn(req, res, next)
    })

    router.post("/petcare/signin/paseador", (req, res, next) =>
        getController(PaseadorController).create(req, res, next)
    )

    router.delete("/petcare/paseador/:id", (req, res, next)=>
        getController(PaseadorController).delete(req, res, next)
    )

    router.put("/petcare/paseador/:id", (req, res, next) =>
        getController(PaseadorController).update(req, res, next)
    )

    router.put("/petcare/paseador/:id/reserva", (req, res, next) =>
        getController(PaseadorController).updateReserva(req, res, next)
    )

    router.put("/petcare/paseador/:id/cancelar/:idReserva", (req, res, next) =>
        getController(PaseadorController).cancelReserva(req, res, next)
    )

    router.put("/petcare/paseador/:id/activar/:idServicio", (req, res, next) =>
        getController(PaseadorController).activarServicio(req, res, next)
    )

    router.put("/petcare/paseador/:id/desactivar/:idServicio", (req, res, next) =>
        getController(PaseadorController).desactivarServicio(req, res, next)
    )

    router.put("/petcare/paseador/:id/notificaciones/:idNotificacion", (req, res, next) =>
            getController(PaseadorController).marcarLeidaNotificacion(req, res, next)
    )

    router.put("/petcare/paseador/:id/marcarNotificacionLeidas", (req, res, next) =>
                getController(PaseadorController).marcarTodasLasNotificacionesLeidas(req, res, next)
    )

    router.get("/petcare/paseador/:id/notificaciones/:leida", (req, res, next) =>
            getController(PaseadorController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
        )

        router.get("/petcare/paseador/:id/notificaciones", (req, res, next) => {
                        getController(PaseadorController).obtenerTodasLasNotificaciones(req, res, next)
        })

    

    return router
}