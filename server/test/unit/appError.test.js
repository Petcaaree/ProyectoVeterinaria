import { AppError, NotFoundError, ValidationError, ConflictError } from '../../vet/errors/AppError.js';

describe('AppError classes', () => {

    describe('AppError', () => {
        it('crea error con statusCode y message', () => {
            const err = new AppError('algo falló', 500);
            expect(err.message).toBe('algo falló');
            expect(err.statusCode).toBe(500);
            expect(err.isOperational).toBe(true);
        });

        it('status es "fail" para 4xx', () => {
            const err = new AppError('bad', 400);
            expect(err.status).toBe('fail');
        });

        it('status es "error" para 5xx', () => {
            const err = new AppError('server', 500);
            expect(err.status).toBe('error');
        });

        it('es instancia de Error', () => {
            const err = new AppError('test', 400);
            expect(err).toBeInstanceOf(Error);
        });
    });

    describe('NotFoundError', () => {
        it('tiene statusCode 404', () => {
            const err = new NotFoundError('no encontrado');
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe('no encontrado');
        });

        it('tiene mensaje por defecto', () => {
            const err = new NotFoundError();
            expect(err.message).toBe('Recurso no encontrado');
        });
    });

    describe('ValidationError', () => {
        it('tiene statusCode 400', () => {
            const err = new ValidationError('dato inválido');
            expect(err.statusCode).toBe(400);
        });
    });

    describe('ConflictError', () => {
        it('tiene statusCode 409', () => {
            const err = new ConflictError('ya existe');
            expect(err.statusCode).toBe(409);
        });
    });
});
