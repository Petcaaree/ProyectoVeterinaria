import express from "express"
import { ServicioVeterinariaController } from "../controllers/servicioVeterinariaController.js"

export default function servicioVeterinariaRoutes(getController) {
    const router = express.Router()

    router.get("/petcare/serviciosVet", (req, res, next) => {
        getController(ServicioVeterinariaController).findAll(req, res, next)
    })

    router.get("/petcare/serviciosVet/:id", (req, res, next) => {
        getController(ServicioVeterinariaController).findById(req, res, next)
    })

    router.post("/petcare/servicioVet", (req, res, next) => {
        getController(ServicioVeterinariaController).create(req, res, next)
    })

    router.delete("/petcare/servicios/:id", (req, res, next) => {
        getController(ServicioVeterinariaController).delete(req, res, next)
    })

    router.post("/petcare/serviciosVet/array", (req, res, next) => {
        getController(ServicioVeterinariaController).importArray(req, res, next)
    })

    router.get("/petcare/serviciosVet/veterinaria/:id", (req, res, next) => {
        getController(ServicioVeterinariaController).getByVeterinaria(req, res, next)
    })

    router.put("/petcare/veterinaria/:id/servicioVet/:nuevoEstado", (req, res, next) =>
        getController(ServicioVeterinariaController).cambiarEstadoVeterinaria(req, res, next)
    )

    router.get("/petcare/paseador/:id/serviciosVet/:estado", (req, res, next) => {
                getController(ServicioVeterinariaController).findByEstadoServicioVeterinaria(req, res, next)
    })

    router.get("/petcare/veterinaria/:id/serviciosVeterinaria/:estado", (req, res, next) => {
            getController(ServicioVeterinariaController).findByEstadoServicioVeterinaria(req, res, next)
    })

    return router
}
    