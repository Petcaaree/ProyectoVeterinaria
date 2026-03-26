import { jest } from '@jest/globals';
import { authMiddleware, authorizationMiddleware } from '../../vet/middlewares/authMiddleware.js';
import { generarToken } from '../../vet/utils/jwtUtils.js';

// ─── Helpers ────────────────────────────────────────────────
function crearReqResMock(headers = {}) {
    const req = {
        headers: headers
    };
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        }
    };
    const next = jest.fn();
    return { req, res, next };
}

describe('authMiddleware', () => {

    it('retorna 401 si no hay header Authorization', () => {
        const { req, res, next } = crearReqResMock();
        authMiddleware(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/Token de autenticacion requerido/);
        expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 si el header no empieza con "Bearer "', () => {
        const { req, res, next } = crearReqResMock({ authorization: 'Basic abc123' });
        authMiddleware(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 si el token es inválido', () => {
        const { req, res, next } = crearReqResMock({ authorization: 'Bearer token.invalido.xyz' });
        authMiddleware(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/Token invalido/);
    });

    it('llama a next() y setea req.usuario con token válido', () => {
        const token = generarToken({ id: '123', email: 'test@test.com' }, 'cliente');
        const { req, res, next } = crearReqResMock({ authorization: `Bearer ${token}` });

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.usuario).toBeDefined();
        expect(req.usuario.id).toBe('123');
        expect(req.usuario.email).toBe('test@test.com');
        expect(req.usuario.tipoUsuario).toBe('cliente');
    });
});

describe('authorizationMiddleware', () => {
    it('retorna 401 si req.usuario no existe', () => {
        const { req, res, next } = crearReqResMock();
        const middleware = authorizationMiddleware('cliente');
        middleware(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('retorna 403 si el rol no está permitido', () => {
        const { req, res, next } = crearReqResMock();
        req.usuario = { id: '1', tipoUsuario: 'cliente' };
        const middleware = authorizationMiddleware('veterinaria', 'paseador');
        middleware(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/Acceso denegado/);
    });

    it('llama a next() si el rol está permitido', () => {
        const { req, res, next } = crearReqResMock();
        req.usuario = { id: '1', tipoUsuario: 'veterinaria' };
        const middleware = authorizationMiddleware('veterinaria', 'paseador');
        middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it('acepta múltiples roles', () => {
        const { req, res, next } = crearReqResMock();
        req.usuario = { id: '1', tipoUsuario: 'cuidador' };
        const middleware = authorizationMiddleware('veterinaria', 'paseador', 'cuidador');
        middleware(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
