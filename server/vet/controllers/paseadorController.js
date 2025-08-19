export class PaseadorController {
   constructor(paseadorService, reservaService) {
    this.paseadorService = paseadorService
    this.reservaService = reservaService
  } 

   /*  constructor(paseadorService) {
    this.paseadorService = paseadorService
    
  } */

  async findAll(req, res, next) {
    try {
      const { page, limit } = req.query;
      const paseador = await this.paseadorService.findAll({ page, limit });

      res.json(paseador);
    } catch (error) {
      next(error);
    }
  }

  async logIn(req, res, next) {
    try {
      const datos = req.body
      const usuario = await this.paseadorService.logIn(datos)

      res.json(usuario)
    } catch (error) {
      next(error)
    }
  }

  async create(req, res, next) {
    try {
      const paseador = req.body;
      const nuevo = await this.paseadorService.create(paseador);

      res.status(201).json(nuevo);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.paseadorService.delete(req.params.id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id;
      const { nombreUsuario, email } = req.body;

      const actualizado = await this.paseadorService.update(id, { nombreUsuario, email });

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

async marcarLeidaNotificacion(req, res, next) {
    try {
      const { id, idNotificacion} = req.params

      const actualizado = await this.paseadorService.leerNotificacion(id, idNotificacion);

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

  async marcarTodasLasNotificacionesLeidas(req, res, next) {
    try {
      const { id } = req.params

      const actualizado = await this.paseadorService.marcarTodasLeidas(id);

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

  // Nuevo endpoint para obtener solo el contador de notificaciones no leídas
  async obtenerContadorNotificacionesNoLeidas(req, res, next) {
    try {
      const { id } = req.params;
      
      const contador = await this.paseadorService.getContadorNotificacionesNoLeidas(id);
      
      res.json({ contador });
    } catch (error) {
      next(error);
    }
  }

   async updateReserva(req, res, next) {
    try {
      const { id, idNotificacion} = req.params

      const nuevaReserva = await this.reservaService.update(id, idNotificacion)

      res.json(nuevaReserva)
    } catch(error) {
      next(error)
    }
  }
 
  async cancelReserva(req, res, next) {
    try {
      const { id, idReserva} = req.params

      const motivo = req.body && req.body.motivo ? req.body.motivo : null;
  
      await this.reservaService.modificarEstado(id, idReserva, "CANCELADA", motivo);

      return res.status(200).send();
    } catch(error) {
      next(error)
    }
  } 

  async obtenerNotificacionesLeidasOnoLeidas(req, res, next) {
        try {
            const id = req.params.id;
            const leida = req.params.leida;
            const { page = 1, limit = 5 } = req.query;
            const result = await this.paseadorService.getNotificacionesLeidasOnoLeidas(id, leida, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodasLasNotificaciones(req, res, next) {
        try {
            const id = req.params.id;
            const { page = 1, limit = 5 } = req.query;
            const result = await this.paseadorService.getAllNotificaciones(id, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    
}
