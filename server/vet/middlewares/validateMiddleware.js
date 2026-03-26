import { ValidationError } from '../errors/AppError.js';

/**
 * Middleware factory que valida req.body, req.query o req.params contra un schema Joi.
 *
 * @param {import('joi').Schema} schema - Schema Joi a validar
 * @param {'body'|'query'|'params'} source - De dónde tomar los datos (default: 'body')
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post('/petcare/login/cliente', validate(loginSchema), (req, res, next) => { ... })
 *   router.get('/petcare/reservas', validate(paginationSchema, 'query'), (req, res, next) => { ... })
 */
export function validate(schema, source = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,     // reportar TODOS los errores, no solo el primero
            stripUnknown: source === 'body', // limpiar campos desconocidos solo en body
            allowUnknown: source !== 'body'  // permitir params/query extras
        });

        if (error) {
            const mensajes = error.details.map(d => d.message).join(' | ');
            return next(new ValidationError(mensajes));
        }

        // Reemplazar con los valores sanitizados por Joi (trim, defaults, etc.)
        req[source] = value;
        next();
    };
}
