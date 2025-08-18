import express from "express"
import { ServicioPaseadorController } from "../controllers/servicioPaseadorController.js"

export default function servicioPaseadorRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/serviciosPaseadores", (req, res, next) => {
        getController(ServicioPaseadorController).findAll(req, res, next)
    })

    router.get("/petcare/serviciosPaseadores/:id", (req, res, next) => {
        getController(ServicioPaseadorController).findById(req, res, next)
    })

    router.post("/petcare/servicioPaseadores", (req, res, next) => {
        getController(ServicioPaseadorController).create(req, res, next)
    })

    router.delete("/petcare/servicios/:id", (req, res, next) => {
        getController(ServicioPaseadorController).delete(req, res, next)
    })

    router.post("/petcare/serviciosPaseadores/array", (req, res, next) => {
        getController(ServicioPaseadorController).importArray(req, res, next)
    })

    router.get("/petcare/serviciosPaseadores/paseador/:id", (req, res, next) => {
        getController(ServicioPaseadorController).getByPaseador(req, res, next)
    })

    router.put("/petcare/paseador/:id/servicioPaseador/:nuevoEstado", (req, res, next) =>
        getController(ServicioPaseadorController).cambiarEstadoPaseador(req, res, next)
    )

    router.get("/petcare/paseador/:id/serviciosPaseador/:estado", (req, res, next) => {
            getController(ServicioPaseadorController).findByEstadoServicioPaseador(req, res, next)
    })

    router.get("/petcare/paseador/:id/notificaciones", (req, res, next) => {
                getController(ServicioPaseadorController).obtenerNotificacionesLeidasOnoLeidas(req, res, next)
        })

    return router
}
