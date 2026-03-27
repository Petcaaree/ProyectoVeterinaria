import express from 'express';
import { generarToken, verificarToken } from '../utils/jwtUtils.js';
import {
    validarRefreshToken,
    rotarRefreshToken,
    revocarRefreshToken,
    revocarTodosRefreshTokens
} from '../utils/refreshTokenUtils.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /petcare/auth/refresh
 * Renueva el access token usando un refresh token valido.
 * Rota el refresh token por seguridad (el viejo se invalida).
 */
router.post('/petcare/auth/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'refreshToken es requerido' });
        }

        const userData = await validarRefreshToken(refreshToken);
        if (!userData) {
            return res.status(401).json({ message: 'Refresh token invalido o expirado' });
        }

        // Generar nuevo access token
        const newAccessToken = generarToken(
            { id: userData.userId, email: '' },
            userData.tipoUsuario
        );

        // Rotar refresh token (seguridad: el viejo se invalida)
        const newRefreshToken = await rotarRefreshToken(
            refreshToken,
            userData.userId,
            userData.tipoUsuario
        );

        logger.info('Token renovado', { userId: userData.userId, tipo: userData.tipoUsuario });

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /petcare/auth/logout
 * Revoca el refresh token (cierre de sesion).
 * Opcionalmente revoca TODOS los tokens del usuario con ?all=true.
 */
router.post('/petcare/auth/logout', authMiddleware, async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const revocarTodos = req.query.all === 'true';

        if (revocarTodos && req.usuario) {
            await revocarTodosRefreshTokens(req.usuario.id);
            logger.info('Logout total - todos los tokens revocados', { userId: req.usuario.id });
        } else if (refreshToken) {
            await revocarRefreshToken(refreshToken);
            logger.info('Logout - token revocado', { userId: req.usuario?.id });
        }

        res.json({ message: 'Sesion cerrada exitosamente' });
    } catch (error) {
        next(error);
    }
});

export default router;
