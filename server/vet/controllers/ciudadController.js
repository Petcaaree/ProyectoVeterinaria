export class CiudadController {
   constructor(ciudadService) {
    this.ciudadService = ciudadService
  } 

    

  async findAll(req, res, next) {
    try {
      const { page, limit } = req.query;
      const localidades = await this.ciudadService.findAll({ page, limit });

      res.json(localidades);
    } catch (error) {
      next(error);
    }
  }

}