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

      const actualizado = await this.cuidadorService.updateNotificacionLeida(id, idNotificacion);

      res.json(actualizado);
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

  async getNotificaciones(req, res, next) {
    try {
      const { id, tipoLeida } = req.params
      const { page, limit } = req.query

      const notificaciones = await this.cuidadorService.getNotificaciones(id, tipoLeida, page, limit)

      res.json(notificaciones)
    } catch(error) {
      next(error)
    }
  }

    
}
