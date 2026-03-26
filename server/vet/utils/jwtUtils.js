import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'petcare_dev_secret_cambiar_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Genera un token JWT para un usuario autenticado.
 * @param {Object} usuario - Datos del usuario (debe tener id y email)
 * @param {string} tipoUsuario - Tipo: 'cliente', 'veterinaria', 'paseador', 'cuidador'
 * @returns {string} Token JWT firmado
 */
export function generarToken(usuario, tipoUsuario) {
    const payload = {
        id: usuario.id,
        email: usuario.email,
        tipoUsuario: tipoUsuario
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es invalido o expiro
 */
export function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
