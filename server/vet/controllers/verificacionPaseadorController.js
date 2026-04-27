export class VerificacionPaseadorController {
    constructor(verificacionPaseadorService) {
        this.verificacionPaseadorService = verificacionPaseadorService;
    }

    async crear(req, res, next) {
        try {
            const paseadorId = req.usuario.id;
            const resultado = await this.verificacionPaseadorService.crear(paseadorId, req.body);
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async consultarEstado(req, res, next) {
        try {
            const paseadorId = req.usuario.id;
            const resultado = await this.verificacionPaseadorService.consultarEstado(paseadorId);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async reenviar(req, res, next) {
        try {
            const paseadorId = req.usuario.id;
            const resultado = await this.verificacionPaseadorService.reenviar(paseadorId, req.body);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // Admin
    async listarPendientes(req, res, next) {
        try {
            const { page, limit } = req.query;
            const resultado = await this.verificacionPaseadorService.listarPendientes({ page, limit });
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async contarPendientes(req, res, next) {
        try {
            const resultado = await this.verificacionPaseadorService.contarPendientes();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async resolver(req, res, next) {
        try {
            const resultado = await this.verificacionPaseadorService.resolver(req.params.paseadorId, req.body);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
