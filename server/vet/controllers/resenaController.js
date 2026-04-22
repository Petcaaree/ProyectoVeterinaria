export class ResenaController {
  constructor(resenaService) {
    this.resenaService = resenaService;
  }

  async create(req, res, next) {
    try {
      const { reservaId, puntuacion, comentario } = req.body;
      const clienteId = req.usuario.id;
      const resena = await this.resenaService.crear({
        clienteId,
        reservaId,
        puntuacion,
        comentario,
      });
      res.status(201).json(resena);
    } catch (error) {
      next(error);
    }
  }

  async listByServicio(req, res, next) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      const resultado = await this.resenaService.listarPorServicio(id, { page, limit });
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}
