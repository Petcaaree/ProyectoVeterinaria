export class VerificacionController {
    constructor(verificacionService) {
        this.verificacionService = verificacionService;
    }

    async crear(req, res, next) {
        try {
            const veterinariaId = req.usuario.id;
            const resultado = await this.verificacionService.crear(veterinariaId, req.body);
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async consultarEstado(req, res, next) {
        try {
            const veterinariaId = req.usuario.id;
            const resultado = await this.verificacionService.consultarEstado(veterinariaId);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async reenviar(req, res, next) {
        try {
            const veterinariaId = req.usuario.id;
            const resultado = await this.verificacionService.reenviar(veterinariaId, req.body);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // Admin
    async listarPendientes(req, res, next) {
        try {
            const resultado = await this.verificacionService.listarPendientes();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async resolver(req, res, next) {
        try {
            const resultado = await this.verificacionService.resolver(req.params.veterinariaId, req.body);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
