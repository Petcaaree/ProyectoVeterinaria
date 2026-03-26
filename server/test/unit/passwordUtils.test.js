import { jest } from '@jest/globals';
import { validatePasswordComplexity, hashPassword, comparePassword } from '../../vet/utils/passwordUtils.js';

describe('passwordUtils', () => {

    // ─── validatePasswordComplexity ─────────────────────────────
    describe('validatePasswordComplexity', () => {
        it('acepta una contraseña válida con mayúscula, minúscula, dígito y especial', () => {
            expect(validatePasswordComplexity('MiPass1!')).toBe(true);
        });

        it('rechaza contraseña sin mayúsculas', () => {
            expect(validatePasswordComplexity('mipass1!')).toBe(false);
        });

        it('rechaza contraseña sin minúsculas', () => {
            expect(validatePasswordComplexity('MIPASS1!')).toBe(false);
        });

        it('rechaza contraseña sin dígitos', () => {
            expect(validatePasswordComplexity('MiPasss!')).toBe(false);
        });

        it('rechaza contraseña sin caracteres especiales', () => {
            expect(validatePasswordComplexity('MiPass12')).toBe(false);
        });

        it('rechaza contraseña con menos de 8 caracteres', () => {
            expect(validatePasswordComplexity('Mp1!')).toBe(false);
        });

        it('acepta contraseña larga y compleja', () => {
            expect(validatePasswordComplexity('SuperSegura123!@#Larga')).toBe(true);
        });
    });

    // ─── hashPassword ───────────────────────────────────────────
    describe('hashPassword', () => {
        it('devuelve un hash diferente al texto plano', async () => {
            const hash = await hashPassword('MiPass1!');
            expect(hash).not.toBe('MiPass1!');
            expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt prefix
        });

        it('lanza error si la contraseña no cumple complejidad', async () => {
            await expect(hashPassword('simple')).rejects.toThrow(
                'La contrasena debe tener minimo 8 caracteres'
            );
        });

        it('genera hashes distintos para la misma contraseña (salt aleatorio)', async () => {
            const hash1 = await hashPassword('MiPass1!');
            const hash2 = await hashPassword('MiPass1!');
            expect(hash1).not.toBe(hash2);
        });
    });

    // ─── comparePassword ────────────────────────────────────────
    describe('comparePassword', () => {
        it('retorna true cuando la contraseña coincide con el hash', async () => {
            const hash = await hashPassword('MiPass1!');
            const resultado = await comparePassword('MiPass1!', hash);
            expect(resultado).toBe(true);
        });

        it('retorna false cuando la contraseña no coincide', async () => {
            const hash = await hashPassword('MiPass1!');
            const resultado = await comparePassword('OtraPass2@', hash);
            expect(resultado).toBe(false);
        });
    });
});
