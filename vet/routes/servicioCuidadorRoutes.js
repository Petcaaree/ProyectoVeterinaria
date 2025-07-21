import express from "express"
import { ServicioCuidadorController } from "../controllers/servicioCuidadorController.js"

export default function servicioCuidadorRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/serviciosVet", (req, res, next) => {
        getController(ServicioCuidadorController).findAll(req, res, next)
    })

    router.get("/petcare/serviciosVet/:id", (req, res, next) => {
        getController(ServicioCuidadorController).findById(req, res, next)
    })

    router.post("/petcare/servicioVet", (req, res, next) => {
        getController(ServicioCuidadorController).create(req, res, next)
    })

    router.delete("/petcare/servicios/:id", (req, res, next) => {
        getController(ServicioCuidadorController).delete(req, res, next)
    })

    router.post("/petcare/serviciosVet/array", (req, res, next) => {
        getController(ServicioCuidadorController).importArray(req, res, next)
    })

    router.get("/petcare/serviciosVet/cuidador/:id", (req, res, next) => {
        getController(ServicioCuidadorController).getByCuidador(req, res, next)
    })

    router.put("/petcare/cuidador/:id/notificaciones/:nuevoEstado", (req, res, next) =>
        getController(ServicioCuidadorController).cambiarEstadoCuidador(req, res, next)
    )

    return router
}
       