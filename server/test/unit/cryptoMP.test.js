import { jest } from "@jest/globals";

// La key se lee al invocar encrypt/decrypt (no al import), así que podemos mutar
// process.env entre tests para validar errores de configuración.
const VALID_KEY_HEX = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 32 bytes hex

const { encryptMP, decryptMP } = await import("../../vet/utils/cryptoMP.js");

describe("cryptoMP", () => {
    let originalKey;

    beforeAll(() => {
        originalKey = process.env.MP_TOKEN_ENCRYPTION_KEY;
    });

    afterAll(() => {
        if (originalKey === undefined) delete process.env.MP_TOKEN_ENCRYPTION_KEY;
        else process.env.MP_TOKEN_ENCRYPTION_KEY = originalKey;
    });

    beforeEach(() => {
        process.env.MP_TOKEN_ENCRYPTION_KEY = VALID_KEY_HEX;
    });

    // ─── round-trip ──────────────────────────────────────────────
    describe("round-trip", () => {
        it("encrypt+decrypt devuelve el plaintext original", () => {
            const plaintext = "APP_USR-1234567890-test-token";
            const encrypted = encryptMP(plaintext);
            expect(decryptMP(encrypted)).toBe(plaintext);
        });

        it("genera ciphertexts distintos para el mismo plaintext (IV random)", () => {
            const plaintext = "mismo-token";
            const a = encryptMP(plaintext);
            const b = encryptMP(plaintext);
            expect(a).not.toBe(b);
            expect(decryptMP(a)).toBe(plaintext);
            expect(decryptMP(b)).toBe(plaintext);
        });

        it("formato del payload es <iv_hex>:<authTag_hex>:<ciphertext_hex>", () => {
            const encrypted = encryptMP("hola");
            const partes = encrypted.split(":");
            expect(partes).toHaveLength(3);
            expect(partes[0]).toMatch(/^[0-9a-f]{24}$/); // 12 bytes hex = 24 chars
            expect(partes[1]).toMatch(/^[0-9a-f]{32}$/); // 16 bytes hex = 32 chars
            expect(partes[2]).toMatch(/^[0-9a-f]+$/);
        });
    });

    // ─── encryptMP: validación de inputs ─────────────────────────
    describe("encryptMP", () => {
        it("rechaza plaintext no string", () => {
            expect(() => encryptMP(null)).toThrow(/string no vacío/);
            expect(() => encryptMP(123)).toThrow(/string no vacío/);
            expect(() => encryptMP(undefined)).toThrow(/string no vacío/);
        });

        it("rechaza plaintext vacío", () => {
            expect(() => encryptMP("")).toThrow(/string no vacío/);
        });
    });

    // ─── decryptMP: validación de inputs ─────────────────────────
    describe("decryptMP", () => {
        it("rechaza payload no string o vacío", () => {
            expect(() => decryptMP(null)).toThrow(/formato inválido/);
            expect(() => decryptMP("")).toThrow(/formato inválido/);
        });

        it("rechaza payload con cantidad de partes incorrecta", () => {
            expect(() => decryptMP("solo:dos")).toThrow(/3 partes/);
            expect(() => decryptMP("a:b:c:d")).toThrow(/3 partes/);
            expect(() => decryptMP("sinSeparador")).toThrow(/formato inválido/);
        });

        it("rechaza partes no hex", () => {
            expect(() => decryptMP("xyz:0123:abcd")).toThrow(/no hex/);
        });

        it("rechaza IV de longitud incorrecta", () => {
            // IV válido sería 24 chars hex (12 bytes); aquí pasamos 8 chars.
            expect(() => decryptMP("0123456789ab:00112233445566778899aabbccddeeff:aa")).toThrow(/IV/);
        });

        it("rechaza authTag de longitud incorrecta", () => {
            const ivHex = "0123456789abcdef01234567"; // 12 bytes
            const tagHexCorto = "00112233"; // 4 bytes
            expect(() => decryptMP(`${ivHex}:${tagHexCorto}:aa`)).toThrow(/authTag/);
        });

        it("falla si se modifica el ciphertext (auth tag mismatch)", () => {
            const encrypted = encryptMP("token-original");
            const partes = encrypted.split(":");
            // alteramos el último char del ciphertext
            const ultimoCharAlterado = partes[2].endsWith("0") ? "1" : "0";
            partes[2] = partes[2].slice(0, -1) + ultimoCharAlterado;
            const tampered = partes.join(":");
            expect(() => decryptMP(tampered)).toThrow();
        });
    });

    // ─── validación de la key ────────────────────────────────────
    describe("MP_TOKEN_ENCRYPTION_KEY", () => {
        it("falla si no está definida", () => {
            delete process.env.MP_TOKEN_ENCRYPTION_KEY;
            expect(() => encryptMP("x")).toThrow(/MP_TOKEN_ENCRYPTION_KEY no está definida/);
        });

        it("falla si tiene caracteres no hex", () => {
            process.env.MP_TOKEN_ENCRYPTION_KEY = "ZZZZ" + VALID_KEY_HEX.slice(4);
            expect(() => encryptMP("x")).toThrow(/hexadecimal/);
        });

        it("falla si tiene longitud incorrecta", () => {
            process.env.MP_TOKEN_ENCRYPTION_KEY = "0123456789abcdef"; // 8 bytes
            expect(() => encryptMP("x")).toThrow(/hexadecimal/);
        });
    });
});
