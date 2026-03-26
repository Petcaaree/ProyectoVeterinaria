import rateLimit from 'express-rate-limit';

/**
 * Limiter general: aplica a todas las rutas de la API.
 * 100 requests por IP cada 15 minutos.
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    standardHeaders: true,  // Devuelve info en headers RateLimit-*
    legacyHeaders: false,
    message: {
        message: 'Demasiadas peticiones desde esta IP. Intentá de nuevo en 15 minutos.'
    }
});

/**
 * Limiter estricto para rutas de autenticacion (login / signin).
 * 10 intentos por IP cada 15 minutos — previene brute-force.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Demasiados intentos de autenticación. Intentá de nuevo en 15 minutos.'
    }
});
