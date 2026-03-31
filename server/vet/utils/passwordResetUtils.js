import crypto from 'crypto';
import { PasswordResetTokenModel } from '../models/schemas/passwordResetTokenSchema.js';
import logger from './logger.js';

const RESET_TOKEN_EXPIRY_MINUTES = 60;

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Genera un token de reset de contraseña.
 * Revoca tokens previos del usuario y almacena el hash en MongoDB.
 * @returns {Promise<string>} El token plano (se envía por email)
 */
export async function generarPasswordResetToken(userId, tipoUsuario) {
    // Revocar tokens previos del usuario
    await revocarTodosPasswordResetTokens(userId);

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(token);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + RESET_TOKEN_EXPIRY_MINUTES);

    await PasswordResetTokenModel.create({
        token: hashedToken,
        userId,
        tipoUsuario,
        expiresAt
    });

    logger.debug('Password reset token generado', { userId, tipoUsuario });
    return token;
}

/**
 * Valida un token de reset: debe existir en la BD y no estar expirado.
 * @param {string} token - Token plano a validar
 * @returns {Promise<{userId: string, tipoUsuario: string}|null>}
 */
export async function validarPasswordResetToken(token) {
    const hashedToken = hashToken(token);

    const doc = await PasswordResetTokenModel.findOne({
        token: hashedToken,
        expiresAt: { $gt: new Date() }
    });

    if (!doc) return null;

    return {
        userId: doc.userId.toString(),
        tipoUsuario: doc.tipoUsuario
    };
}

/**
 * Revoca (elimina) un token de reset específico por su valor plano.
 */
export async function revocarPasswordResetToken(token) {
    const hashedToken = hashToken(token);
    await PasswordResetTokenModel.deleteOne({ token: hashedToken });
}

/**
 * Revoca todos los tokens de reset de un usuario.
 */
export async function revocarTodosPasswordResetTokens(userId) {
    const result = await PasswordResetTokenModel.deleteMany({ userId });
    if (result.deletedCount > 0) {
        logger.debug('Password reset tokens revocados', { userId, count: result.deletedCount });
    }
}
