import express from "express"
import { ReservaController } from "../controllers/reservaController.js";
import { authMiddleware, authorizationMiddleware } from "../middlewares/authMiddleware.js"

export default function reservaRoutes(getController) {
  const router = express.Router()

  // Solo clientes pueden crear reservas
  router.post("/petcare/reservar", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) => {
    getController(ReservaController).create(req, res, next)
  })

  // Cualquier usuario autenticado puede actualizar/gestionar reservas
  router.put("/petcare/reserva/update", authMiddleware, authorizationMiddleware('cliente', 'veterinaria', 'paseador', 'cuidador'), (req, res, next) => {
    getController(ReservaController).update(req, res, next)
  })

  router.get("/petcare/reservas", authMiddleware, authorizationMiddleware('cliente', 'veterinaria', 'paseador', 'cuidador'), (req,res,next) => {
    getController(ReservaController).findAll(req, res, next)
  })

  // Solo clientes ven sus reservas como cliente
  router.get("/petcare/reservas/cliente/:id/:estado", authMiddleware, authorizationMiddleware('cliente'), (req, res, next) => {
    getController(ReservaController).findByCliente(req, res, next)
  })

  // Solo proveedores ven sus reservas como proveedor
  router.get("/petcare/reservas/proveedor/:id/:estado", authMiddleware, authorizationMiddleware('veterinaria', 'paseador', 'cuidador'), (req, res, next) => {
    getController(ReservaController).findByProveedor(req, res, next)
  })

  // Cualquier usuario autenticado puede cambiar estado de reserva (aceptar, cancelar, etc.)
  router.put("/petcare/usuario/:idUsuario/reserva/:idReserva/:estado", authMiddleware, authorizationMiddleware('cliente', 'veterinaria', 'paseador', 'cuidador'), (req, res, next) => {
    getController(ReservaController).updateEstadoReserva(req, res, next)
  })



  return router
}