import express from 'express';
import { generarToken, verificarToken } from '../utils/jwtUtils.js';
import {
    validarRefreshToken,
    rotarRefreshToken,
    revocarRefreshToken,
    revocarTodosRefreshTokens
} from '../utils/refreshTokenUtils.js';
import {
    generarPasswordResetToken,
    validarPasswordResetToken,
    revocarPasswordResetToken
} from '../utils/passwordResetUtils.js';
import { enviarEmailResetPassword } from '../services/emailService.js';
import { hashPassword } from '../utils/passwordUtils.js';
import { ClienteModel } from '../models/schemas/clienteSchema.js';
import { VeterinariaModel } from '../models/schemas/veterinariaSchema.js';
import { PaseadorModel } from '../models/schemas/paseadorSchema.js';
import { CuidadorModel } from '../models/schemas/cuidadorSchema.js';
import { AdminModel } from '../models/schemas/adminSchema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import logger from '../utils/logger.js';

const modelsPorTipo = {
    cliente: ClienteModel,
    veterinaria: VeterinariaModel,
    paseador: PaseadorModel,
    cuidador: CuidadorModel,
    admin: AdminModel
};

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

/**
 * POST /petcare/auth/forgot-password
 * Genera un token de reset y envía email con el link.
 * Siempre responde 200 para no revelar si el email existe.
 */
router.post('/petcare/auth/forgot-password', async (req, res, next) => {
    try {
        const { email, tipoUsuario } = req.body;

        if (!email || !tipoUsuario) {
            return res.status(400).json({ message: 'Email y tipo de usuario son requeridos' });
        }

        const model = modelsPorTipo[tipoUsuario];
        if (!model) {
            return res.status(400).json({ message: 'Tipo de usuario inválido' });
        }

        // Siempre responder 200 (no revelar si el email existe)
        const usuario = await model.findOne({ email });

        if (usuario) {
            const token = await generarPasswordResetToken(usuario._id, tipoUsuario);
            const nombreUsuario = usuario.nombreUsuario || usuario.email;

            try {
                await enviarEmailResetPassword(email, token, nombreUsuario);
            } catch (emailError) {
                logger.error('Error al enviar email de reset', { email, error: emailError.message });
            }
        }

        logger.info('Solicitud de reset de contraseña', { email, tipoUsuario, encontrado: !!usuario });

        res.json({ message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /petcare/auth/reset-password
 * Valida el token y actualiza la contraseña del usuario.
 */
router.post('/petcare/auth/reset-password', async (req, res, next) => {
    try {
        const { token, contrasenia } = req.body;

        if (!token || !contrasenia) {
            return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
        }

        const tokenData = await validarPasswordResetToken(token);
        if (!tokenData) {
            return res.status(400).json({ message: 'El enlace es inválido o ha expirado. Solicitá uno nuevo.' });
        }

        const model = modelsPorTipo[tokenData.tipoUsuario];
        if (!model) {
            return res.status(400).json({ message: 'Tipo de usuario inválido' });
        }

        // hashPassword valida complejidad internamente
        const hashedPassword = await hashPassword(contrasenia);

        await model.findByIdAndUpdate(tokenData.userId, { contrasenia: hashedPassword });

        // Revocar el token usado
        await revocarPasswordResetToken(token);

        logger.info('Contraseña restablecida exitosamente', { userId: tokenData.userId, tipoUsuario: tokenData.tipoUsuario });

        res.json({ message: 'Tu contraseña fue actualizada exitosamente.' });
    } catch (error) {
        // Si hashPassword lanza por complejidad, devolver 400
        if (error.message && error.message.includes('contrasena')) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});

export default router;
