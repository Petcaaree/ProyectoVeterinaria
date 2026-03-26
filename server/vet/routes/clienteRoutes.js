import express from "express"
import { ClienteController } from "../controllers/clienteController.js"
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js"

export default function clienteRoutes(getController) {
    const router = express.Router()

    // --- Rutas publicas ---
    router.get("/petcare/clientes", (req, res, next) => {
        getController(ClienteController).findAll(req, res, next)
    })

    router.post("/petcare/login/cliente", (req, res, next) => {
        getController(ClienteController).logIn(req, res, next)
    })

    router.post("/petcare/signin/cliente", (req, res, next) =>
        getController(ClienteController).create(req, res, next)
    )

    // --- Rutas protegidas (solo cliente) ---
    router.delete("/petcare/cliente/:id", authMiddleware, authorizationMiddleware('cliente'), (req, res, next)=>
        getController(ClienteController).delete(req, res, next)
    )

    router.put("/petcare/cliente/:id", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).update(req, res, next)
    )

    router.put("/petcare/cliente/:id/reserva", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).updateReserva(req, res, next)
    )

    router.put("/petcare/cliente/:id/cancelar/:idReserva", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).cancelReserva(req, res, next)
    )

    router.get("/petcare/cliente/:id/notificaciones", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) => {
                getController(ClienteController).obtenerTodasLasNotificaciones(req, res, next)
    })

    // Nueva ruta para obtener solo el contador de notificaciones no leídas (DEBE IR ANTES de las rutas con parámetros)
    router.get("/petcare/cliente/:id/notificaciones/contador", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).obtenerContadorNotificacionesNoLeidas(req, res, next)
    )

    router.get("/petcare/cliente/:id/notificaciones/:leida", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) => {
                getController(ClienteController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
    })

    router.put("/petcare/cliente/:id/notificaciones/:idNotificacion", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
            getController(ClienteController).marcarLeidaNotificacion(req, res, next)
    )

    router.put("/petcare/cliente/:id/marcarNotificacionLeidas", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
            getController(ClienteController).marcarTodasLasNotificacionesLeidas(req, res, next)
    )

    router.get("/petcare/cliente/:id/notificaciones/:tipoLeida", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).getNotificaciones(req, res, next)
    )

    router.get("/petcare/cliente/:id/mismascotas", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).findMascotasByCliente(req, res, next)
    )
    router.post("/petcare/cliente/:id/mascota", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).addMascota(req, res, next)
    )
    router.delete("/petcare/cliente/:id/mascota/:idMascota", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) =>
        getController(ClienteController).deleteMascota(req, res, next)
    )
    

    return router
}