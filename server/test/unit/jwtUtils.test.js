import { jest } from '@jest/globals';
import { generarToken, verificarToken } from '../../vet/utils/jwtUtils.js';

describe('jwtUtils', () => {

    const mockUsuario = { id: '507f1f77bcf86cd799439011', email: 'test@example.com' };

    // ─── generarToken ───────────────────────────────────────────
    describe('generarToken', () => {
        it('genera un token JWT válido', () => {
            const token = generarToken(mockUsuario, 'cliente');
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT tiene 3 partes
        });

        it('incluye el tipoUsuario en el payload', () => {
            const token = generarToken(mockUsuario, 'veterinaria');
            const decoded = verificarToken(token);
            expect(decoded.tipoUsuario).toBe('veterinaria');
        });

        it('incluye id y email en el payload', () => {
            const token = generarToken(mockUsuario, 'cliente');
            const decoded = verificarToken(token);
            expect(decoded.id).toBe(mockUsuario.id);
            expect(decoded.email).toBe(mockUsuario.email);
        });

        it('incluye timestamps de emisión y expiración', () => {
            const token = generarToken(mockUsuario, 'paseador');
            const decoded = verificarToken(token);
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });

    // ─── verificarToken ─────────────────────────────────────────
    describe('verificarToken', () => {
        it('decodifica un token válido correctamente', () => {
            const token = generarToken(mockUsuario, 'cuidador');
            const decoded = verificarToken(token);
            expect(decoded.email).toBe('test@example.com');
            expect(decoded.tipoUsuario).toBe('cuidador');
        });

        it('lanza error con un token inválido', () => {
            expect(() => verificarToken('token.invalido.xyz')).toThrow();
        });

        it('lanza error con un token manipulado', () => {
            const token = generarToken(mockUsuario, 'cliente');
            const partes = token.split('.');
            // Manipulamos el payload
            partes[1] = 'eyJpZCI6ImhhY2tlZCIsImVtYWlsIjoiaGFja0B0ZXN0LmNvbSJ9';
            const tokenManipulado = partes.join('.');
            expect(() => verificarToken(tokenManipulado)).toThrow();
        });
    });
});
