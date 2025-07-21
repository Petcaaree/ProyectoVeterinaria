import express from "express"
import { ServicioCuidadorController } from "../controllers/servicioCuidadorController.js"

export default function servicioCuidadorRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/serviciosCuidadores", (req, res, next) => {
        getController(ServicioCuidadorController).findAll(req, res, next)
    })

    router.get("/petcare/servicioCuidador/:id", (req, res, next) => {
        getController(ServicioCuidadorController).findById(req, res, next)
    })

    router.post("/petcare/servicioCuidador", (req, res, next) => {
        getController(ServicioCuidadorController).create(req, res, next)
    })

    router.delete("/petcare/servicioCuidador/:id", (req, res, next) => {
        getController(ServicioCuidadorController).delete(req, res, next)
    })

    router.post("/petcare/serviciosCuidadores/array", (req, res, next) => {
        getController(ServicioCuidadorController).importArray(req, res, next)
    })

    router.get("/petcare/serviciosCuidador/cuidador/:id", (req, res, next) => {
        getController(ServicioCuidadorController).getByCuidador(req, res, next)
    })

    router.put("/petcare/cuidador/:id/servicioCuidador/:nuevoEstado", (req, res, next) =>
        getController(ServicioCuidadorController).cambiarEstadoCuidador(req, res, next)
    )

    return router
}
       