import crypto from 'crypto';
import { RefreshTokenModel } from '../models/schemas/refreshTokenSchema.js';
import logger from './logger.js';

const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '7', 10);

/**
 * Genera un refresh token opaco (no JWT), lo almacena en MongoDB.
 * @param {string} userId - ID del usuario
 * @param {string} tipoUsuario - Tipo de usuario
 * @returns {Promise<string>} El refresh token generado
 */
export async function generarRefreshToken(userId, tipoUsuario) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await RefreshTokenModel.create({
        token,
        userId,
        tipoUsuario,
        expiresAt
    });

    logger.debug('Refresh token generado', { userId, tipoUsuario });
    return token;
}

/**
 * Valida un refresh token: debe existir en la BD y no estar expirado.
 * @param {string} token - Refresh token a validar
 * @returns {Promise<{userId: string, tipoUsuario: string}|null>}
 */
export async function validarRefreshToken(token) {
    const doc = await RefreshTokenModel.findOne({
        token,
        expiresAt: { $gt: new Date() }
    });

    if (!doc) return null;

    return {
        userId: doc.userId.toString(),
        tipoUsuario: doc.tipoUsuario
    };
}

/**
 * Revoca (elimina) un refresh token especifico.
 * @param {string} token - Refresh token a revocar
 */
export async function revocarRefreshToken(token) {
    await RefreshTokenModel.deleteOne({ token });
}

/**
 * Revoca todos los refresh tokens de un usuario (logout total).
 * @param {string} userId
 */
export async function revocarTodosRefreshTokens(userId) {
    const result = await RefreshTokenModel.deleteMany({ userId });
    logger.debug('Refresh tokens revocados', { userId, count: result.deletedCount });
}

/**
 * Rota un refresh token: revoca el viejo y genera uno nuevo.
 * Protege contra reutilización de tokens robados.
 * @param {string} oldToken - Token viejo a revocar
 * @param {string} userId
 * @param {string} tipoUsuario
 * @returns {Promise<string>} Nuevo refresh token
 */
export async function rotarRefreshToken(oldToken, userId, tipoUsuario) {
    await revocarRefreshToken(oldToken);
    return generarRefreshToken(userId, tipoUsuario);
}
