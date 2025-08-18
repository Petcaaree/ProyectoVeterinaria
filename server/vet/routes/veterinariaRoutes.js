import express from "express"
import { VeterinariaController } from "../controllers/veterinariaController.js"

export default function veterinariaRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/veterinarias", (req, res, next) => {
        getController(VeterinariaController).findAll(req, res, next)
    })

    router.post("/petcare/login/veterinaria", (req, res, next) => {
        getController(VeterinariaController).logIn(req, res, next)
    })

    router.post("/petcare/signin/veterinaria", (req, res, next) =>
        getController(VeterinariaController).create(req, res, next)
    )

    router.delete("/petcare/veterinaria/:id", (req, res, next)=>
        getController(VeterinariaController).delete(req, res, next)
    )

    router.put("/petcare/veterinaria/:id", (req, res, next) =>
        getController(VeterinariaController).update(req, res, next)
    )

    router.put("/petcare/veterinaria/:id/reserva", (req, res, next) =>
        getController(VeterinariaController).updateReserva(req, res, next)
    )

    router.put("/petcare/veterinaria/:id/cancelar/:idReserva", (req, res, next) =>
        getController(VeterinariaController).cancelReserva(req, res, next)
    )

    router.put("/petcare/veterinaria/:id/activar/:idServicio", (req, res, next) =>
        getController(VeterinariaController).activarServicio(req, res, next)
    )

    router.put("/petcare/veterinaria/:id/desactivar/:idServicio", (req, res, next) =>
        getController(VeterinariaController).desactivarServicio(req, res, next)
    )

    router.put("/petcare/veterinaria/:id/notificaciones/:idNotificacion", (req, res, next) =>
            getController(VeterinariaController).marcarLeidaNotificacion(req, res, next)
    )

    router.put("/petcare/veterinaria/:id/marcarNotificacionLeidas", (req, res, next) =>
            getController(VeterinariaController).marcarTodasLasNotificacionesLeidas(req, res, next)
    )

    // Ruta específica para notificaciones leídas/no leídas (debe ir antes que la general)
    router.get("/petcare/veterinaria/:id/notificaciones/:leida", (req, res, next) =>
            getController(VeterinariaController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
        )

    // Ruta general para todas las notificaciones (debe ir después de la específica)
    router.get("/petcare/veterinaria/:id/notificaciones", (req, res, next) => {
            getController(VeterinariaController).obtenerTodasLasNotificaciones(req, res, next)
    })

    

    return router
}