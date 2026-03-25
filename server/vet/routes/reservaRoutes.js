import express from "express"
import { ReservaController } from "../controllers/reservaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"

export default function reservaRoutes(getController) {
  const router = express.Router()

  router.post("/petcare/reservar", authMiddleware, (req, res, next) => {
    getController(ReservaController).create(req, res, next)
  })

  router.put("/petcare/reserva/update", authMiddleware, (req, res, next) => {
    getController(ReservaController).update(req, res, next)
  })

  router.get("/petcare/reservas", authMiddleware, (req,res,next) => {
    getController(ReservaController).findAll(req, res, next)
  })

  router.get("/petcare/reservas/cliente/:id/:estado", authMiddleware, (req, res, next) => {
    getController(ReservaController).findByCliente(req, res, next)
  })

  router.get("/petcare/reservas/proveedor/:id/:estado", authMiddleware, (req, res, next) => {
    getController(ReservaController).findByProveedor(req, res, next)
  })



  router.put("/petcare/usuario/:idUsuario/reserva/:idReserva/:estado", authMiddleware, (req, res, next) => {
    getController(ReservaController).updateEstadoReserva(req, res, next)
  })



  return router
}