import { verificarToken } from '../utils/jwtUtils.js';

/**
 * Middleware de autenticacion JWT.
 * Verifica que el request tenga un token valido en el header Authorization.
 * Si es valido, agrega req.usuario con los datos del token.
 */
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticacion requerido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verificarToken(token);
        req.usuario = decoded; // { id, email, tipoUsuario }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Inicia sesion nuevamente.' });
        }
        return res.status(401).json({ message: 'Token invalido' });
    }
}

/**
 * Middleware de autorizacion por roles.
 * Requiere que authMiddleware haya sido ejecutado antes.
 * @param  {...string} rolesPermitidos - Roles que pueden acceder ('cliente', 'veterinaria', 'paseador', 'cuidador')
 * @returns {Function} Middleware de Express
 */
export function authorizationMiddleware(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (!rolesPermitidos.includes(req.usuario.tipoUsuario)) {
            return res.status(403).json({
                message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`
            });
        }

        next();
    };
}
