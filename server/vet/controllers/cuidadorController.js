export class CuidadorController {
   constructor(cuidadorService, reservaService) {
    this.cuidadorService = cuidadorService
    this.reservaService = reservaService
  } 

    /* constructor(cuidadorService) {
    this.cuidadorService = cuidadorService
    
  } */

  async findAll(req, res, next) {
    try {
      const { page, limit } = req.query;
      const cuidador = await this.cuidadorService.findAll({ page, limit });

      res.json(cuidador);
    } catch (error) {
      next(error);
    }
  }

  async logIn(req, res, next) {
    try {
      const datos = req.body
      const usuario = await this.cuidadorService.logIn(datos)

      res.json(usuario)
    } catch (error) {
      next(error)
    }
  }

  async create(req, res, next) {
    try {
      const cuidador = req.body;
      const nuevo = await this.cuidadorService.create(cuidador);

      res.status(201).json(nuevo);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.cuidadorService.delete(req.params.id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id;
      const { nombreUsuario, email } = req.body;

      const actualizado = await this.cuidadorService.update(id, { nombreUsuario, email });

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

async marcarLeidaNotificacion(req, res, next) {
    try {
      const { id, idNotificacion} = req.params

      const actualizado = await this.cuidadorService.leerNotificacion(id, idNotificacion);

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

  async marcarTodasLasNotificacionesLeidas(req, res, next) {
    try {
      const { id } = req.params

      const actualizado = await this.cuidadorService.marcarTodasLeidas(id);

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

  // Nuevo endpoint para obtener solo el contador de notificaciones no leídas
  async obtenerContadorNotificacionesNoLeidas(req, res, next) {
    try {
      const { id } = req.params;
      
      const contador = await this.cuidadorService.getContadorNotificacionesNoLeidas(id);
      
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
            const result = await this.cuidadorService.getNotificacionesLeidasOnoLeidas(id, leida, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodasLasNotificaciones(req, res, next) {
        try {
            const id = req.params.id;
            const { page = 1, limit = 5 } = req.query;
            const result = await this.cuidadorService.getAllNotificaciones(id, { page, limit });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    
}
