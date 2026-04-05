import { generarToken } from '../utils/jwtUtils.js';
import { generarRefreshToken } from '../utils/refreshTokenUtils.js';
import logger from '../utils/logger.js';

export class AdminController {
    constructor(adminService, adminDashboardService) {
        this.adminService = adminService;
        this.adminDashboardService = adminDashboardService;
    }

    async logIn(req, res, next) {
        try {
            const datos = req.body;
            const usuario = await this.adminService.logIn(datos);
            const token = generarToken(usuario, 'admin');

            let refreshToken = null;
            try {
                refreshToken = await generarRefreshToken(usuario.id, 'admin');
            } catch (e) {
                logger.warn('No se pudo generar refresh token para admin', { error: e.message });
            }

            res.json({ data: usuario, token, refreshToken });
        } catch (error) {
            next(error);
        }
    }

    async getMetricas(req, res, next) {
        try {
            const metricas = await this.adminDashboardService.getMetricas();
            res.json(metricas);
        } catch (error) {
            next(error);
        }
    }

    async getUsuarios(req, res, next) {
        try {
            const { tipo } = req.params;
            const { page, limit, search } = req.query;
            const resultado = await this.adminDashboardService.getUsuarios(tipo, { page, limit, search });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async suspenderUsuario(req, res, next) {
        try {
            const { tipo, id } = req.params;
            const { motivo } = req.body;
            await this.adminDashboardService.suspenderUsuario(tipo, id, motivo);
            res.json({ message: 'Usuario suspendido exitosamente' });
        } catch (error) {
            next(error);
        }
    }

    async reactivarUsuario(req, res, next) {
        try {
            const { tipo, id } = req.params;
            await this.adminDashboardService.reactivarUsuario(tipo, id);
            res.json({ message: 'Usuario reactivado exitosamente' });
        } catch (error) {
            next(error);
        }
    }

    async eliminarUsuario(req, res, next) {
        try {
            const { tipo, id } = req.params;
            await this.adminDashboardService.eliminarUsuario(tipo, id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getServicios(req, res, next) {
        try {
            const { tipo } = req.params;
            const { page, limit, estado } = req.query;
            const resultado = await this.adminDashboardService.getServicios(tipo, { page, limit, estado });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async moderarServicio(req, res, next) {
        try {
            const { tipo, id } = req.params;
            const { accion } = req.body;
            await this.adminDashboardService.moderarServicio(tipo, id, accion);
            res.json({ message: `Servicio ${accion} exitosamente` });
        } catch (error) {
            next(error);
        }
    }

    async getConfiguracion(req, res, next) {
        try {
            const config = await this.adminDashboardService.getConfiguracion();
            res.json(config);
        } catch (error) {
            next(error);
        }
    }

    async updateConfiguracion(req, res, next) {
        try {
            const datos = req.body;
            const adminId = req.usuario.id;
            const config = await this.adminDashboardService.updateConfiguracion(datos, adminId);
            res.json(config);
        } catch (error) {
            next(error);
        }
    }
}
