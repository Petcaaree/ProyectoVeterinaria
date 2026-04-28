import crypto from "crypto";

// AES-256-GCM para credenciales MP (access/refresh token de cada proveedor).
// La clave se lee de MP_TOKEN_ENCRYPTION_KEY en cada llamada a encryptMP/decryptMP
// (no se cachea), para permitir rotación en runtime sin reiniciar el proceso.
// Rotarla invalida todos los tokens almacenados.
// Para generar una nueva: openssl rand -hex 32

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recomendado: 96 bits
const KEY_LENGTH = 32; // 256 bits
const AUTH_TAG_LENGTH = 16; // GCM auth tag: 128 bits
const KEY_HEX_LENGTH = KEY_LENGTH * 2;
const HEX_REGEX = /^[0-9a-fA-F]+$/;

// Subclase para que los callers puedan distinguir misconfiguración del servidor
// (donde re-vincular la cuenta MP no soluciona nada) de errores de payload
// (token corrupto / rotación de key — sí requiere re-vincular).
export class CryptoConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = "CryptoConfigError";
    }
}

function getKey() {
    const hex = process.env.MP_TOKEN_ENCRYPTION_KEY;
    if (!hex || typeof hex !== "string") {
        throw new CryptoConfigError("MP_TOKEN_ENCRYPTION_KEY no está definida (debe ser hex de 32 bytes)");
    }
    if (hex.length !== KEY_HEX_LENGTH || !HEX_REGEX.test(hex)) {
        throw new CryptoConfigError(
            `MP_TOKEN_ENCRYPTION_KEY debe ser un string hexadecimal de ${KEY_HEX_LENGTH} caracteres (${KEY_LENGTH} bytes)`
        );
    }
    return Buffer.from(hex, "hex");
}

// Devuelve un string compacto: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
export function encryptMP(plaintext) {
    if (typeof plaintext !== "string" || plaintext.length === 0) {
        throw new Error("encryptMP: plaintext debe ser string no vacío");
    }
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptMP(payload) {
    if (typeof payload !== "string" || payload.length === 0) {
        throw new Error("decryptMP: formato inválido");
    }
    const parts = payload.split(":");
    if (parts.length !== 3) {
        throw new Error("decryptMP: formato inválido (se esperaban 3 partes separadas por ':')");
    }
    const [ivHex, authTagHex, dataHex] = parts;
    if (
        !ivHex || !authTagHex || !dataHex ||
        !HEX_REGEX.test(ivHex) || !HEX_REGEX.test(authTagHex) || !HEX_REGEX.test(dataHex)
    ) {
        throw new Error("decryptMP: formato inválido (partes no hex)");
    }
    // Hex válido por bytes: longitud par. Sin esto, Buffer.from(hex, "hex") puede
    // normalizar silenciosamente y el error final llega más adelante con mensaje confuso.
    if (ivHex.length % 2 !== 0 || authTagHex.length % 2 !== 0 || dataHex.length % 2 !== 0) {
        throw new Error("decryptMP: formato inválido (longitud hex impar)");
    }
    if (ivHex.length !== IV_LENGTH * 2) {
        throw new Error(`decryptMP: IV debe ser ${IV_LENGTH} bytes (${IV_LENGTH * 2} chars hex)`);
    }
    if (authTagHex.length !== AUTH_TAG_LENGTH * 2) {
        throw new Error(`decryptMP: authTag debe ser ${AUTH_TAG_LENGTH} bytes (${AUTH_TAG_LENGTH * 2} chars hex)`);
    }

    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
}
