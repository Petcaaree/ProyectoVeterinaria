import express from "express"
import { ClienteController } from "../controllers/clienteController.js"

export default function clienteRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/clientes", (req, res, next) => {
        getController(ClienteController).findAll(req, res, next)
    })

    router.post("/petcare/login/cliente", (req, res, next) => {
        getController(ClienteController).logIn(req, res, next)
    })

    router.post("/petcare/signin/cliente", (req, res, next) =>
        getController(ClienteController).create(req, res, next)
    )

    router.delete("/petcare/cliente/:id", (req, res, next)=>
        getController(ClienteController).delete(req, res, next)
    )

    router.put("/petcare/cliente/:id", (req, res, next) =>
        getController(ClienteController).update(req, res, next)
    )

    router.put("/petcare/cliente/:id/reserva", (req, res, next) =>
        getController(ClienteController).updateReserva(req, res, next)
    )

    router.put("/petcare/cliente/:id/cancelar/:idReserva", (req, res, next) =>
        getController(ClienteController).cancelReserva(req, res, next)
    )

    router.get("/petcare/cliente/:id/notificaciones", (req, res, next) => {
                getController(ClienteController).obtenerTodasLasNotificaciones(req, res, next)
    })

    // Nueva ruta para obtener solo el contador de notificaciones no leídas (DEBE IR ANTES de las rutas con parámetros)
    router.get("/petcare/cliente/:id/notificaciones/contador", (req, res, next) =>
        getController(ClienteController).obtenerContadorNotificacionesNoLeidas(req, res, next)
    )

    router.get("/petcare/cliente/:id/notificaciones/:leida", (req, res, next) => {
                getController(ClienteController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
    })

    router.put("/petcare/cliente/:id/notificaciones/:idNotificacion", (req, res, next) =>
            getController(ClienteController).marcarLeidaNotificacion(req, res, next)
    )

    router.put("/petcare/cliente/:id/marcarNotificacionLeidas", (req, res, next) =>
            getController(ClienteController).marcarTodasLasNotificacionesLeidas(req, res, next)
    )

    router.get("/petcare/cliente/:id/notificaciones/:tipoLeida", (req, res, next) =>
        getController(ClienteController).getNotificaciones(req, res, next)
    )

    router.get("/petcare/cliente/:id/mismascotas", (req, res, next) =>
        getController(ClienteController).findMascotasByCliente(req, res, next)
    )
    router.post("/petcare/cliente/:id/mascota", (req, res, next) =>
        getController(ClienteController).addMascota(req, res, next)
    )
    router.delete("/petcare/cliente/:id/mascota/:idMascota", (req, res, next) =>
        getController(ClienteController).deleteMascota(req, res, next)
    )
    

    return router
}