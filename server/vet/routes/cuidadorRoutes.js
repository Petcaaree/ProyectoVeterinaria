import express from "express"
import { CuidadorController } from "../controllers/cuidadorController.js"

export default function cuidadorRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/cuidadores", (req, res, next) => {
        getController(CuidadorController).findAll(req, res, next)
    })

    router.post("/petcare/login/cuidador", (req, res, next) => {
        getController(CuidadorController).logIn(req, res, next)
    })

    router.post("/petcare/signin/cuidador", (req, res, next) =>
        getController(CuidadorController).create(req, res, next)
    )

    router.delete("/petcare/cuidador/:id", (req, res, next)=>
        getController(CuidadorController).delete(req, res, next)
    )

    router.put("/petcare/cuidador/:id", (req, res, next) =>
        getController(CuidadorController).update(req, res, next)
    )

    router.put("/petcare/cuidador/:id/reserva", (req, res, next) =>
        getController(CuidadorController).updateReserva(req, res, next)
    )

    router.put("/petcare/cuidador/:id/cancelar/:idReserva", (req, res, next) =>
        getController(CuidadorController).cancelReserva(req, res, next)
    )

    router.put("/petcare/cuidador/:id/activar/:idServicio", (req, res, next) =>
        getController(CuidadorController).activarServicio(req, res, next)
    )

    router.put("/petcare/cuidador/:id/desactivar/:idServicio", (req, res, next) =>
        getController(CuidadorController).desactivarServicio(req, res, next)
    )

    router.put("/petcare/cuidador/:id/notificaciones/:idNotificacion", (req, res, next) =>
            getController(CuidadorController).marcarLeidaNotificacion(req, res, next)
    )

    router.put("/petcare/cuidador/:id/marcarNotificacionLeidas", (req, res, next) =>
                getController(CuidadorController).marcarTodasLasNotificacionesLeidas(req, res, next)
    )
    
    // Nueva ruta para obtener solo el contador de notificaciones no leídas
    router.get("/petcare/cuidador/:id/notificaciones/contador", (req, res, next) =>
        getController(CuidadorController).obtenerContadorNotificacionesNoLeidas(req, res, next)
    )

    router.get("/petcare/cuidador/:id/notificaciones/:leida", (req, res, next) =>
        getController(CuidadorController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
    )

    router.get("/petcare/cuidador/:id/notificaciones", (req, res, next) => {
                    getController(CuidadorController).obtenerTodasLasNotificaciones(req, res, next)
    })

    

    return router
}