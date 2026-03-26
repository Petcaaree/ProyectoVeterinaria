import { jest } from '@jest/globals';
import { validate } from '../../vet/middlewares/validateMiddleware.js';
import { loginSchema, paginationSchema } from '../../vet/validators/schemas.js';

function crearReqResMock(body = {}, query = {}) {
    return {
        req: { body, query },
        res: {},
        next: jest.fn()
    };
}

describe('validateMiddleware', () => {

    describe('validate body (loginSchema)', () => {
        it('llama a next() con datos válidos', () => {
            const { req, res, next } = crearReqResMock({
                email: 'test@example.com',
                contrasenia: 'micontraseña'
            });
            const middleware = validate(loginSchema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            // Debe llamar sin error (no es ValidationError)
            const callArg = next.mock.calls[0][0];
            expect(callArg).toBeUndefined();
        });

        it('pasa ValidationError a next() con email inválido', () => {
            const { req, res, next } = crearReqResMock({
                email: 'no-es-email',
                contrasenia: 'pass'
            });
            const middleware = validate(loginSchema);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(400);
        });

        it('pasa ValidationError a next() sin email', () => {
            const { req, res, next } = crearReqResMock({
                contrasenia: 'pass'
            });
            const middleware = validate(loginSchema);
            middleware(req, res, next);

            const error = next.mock.calls[0][0];
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(400);
        });

        it('stripea campos desconocidos en body', () => {
            const { req, res, next } = crearReqResMock({
                email: 'test@example.com',
                contrasenia: 'pass',
                campoExtra: 'hacker'
            });
            const middleware = validate(loginSchema);
            middleware(req, res, next);

            expect(req.body.campoExtra).toBeUndefined();
        });
    });

    describe('validate query (paginationSchema)', () => {
        it('aplica defaults cuando no se envían page y limit', () => {
            const { req, res, next } = crearReqResMock({}, {});
            const middleware = validate(paginationSchema, 'query');
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith(); // sin error
            expect(req.query.page).toBe(1);
            expect(req.query.limit).toBe(10);
        });

        it('acepta page y limit válidos', () => {
            const { req, res, next } = crearReqResMock({}, { page: 2, limit: 25 });
            const middleware = validate(paginationSchema, 'query');
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });
    });
});
