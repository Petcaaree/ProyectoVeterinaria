import crypto from "crypto";

// AES-256-GCM para credenciales MP (access/refresh token de cada proveedor).
// La clave se carga una vez al startup; rotarla invalida todos los tokens almacenados.
// Para generar una nueva: openssl rand -hex 32

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recomendado: 96 bits
const KEY_LENGTH = 32; // 256 bits

function getKey() {
    const hex = process.env.MP_TOKEN_ENCRYPTION_KEY;
    if (!hex || typeof hex !== "string") {
        throw new Error("MP_TOKEN_ENCRYPTION_KEY no está definida (debe ser hex de 32 bytes)");
    }
    const buf = Buffer.from(hex, "hex");
    if (buf.length !== KEY_LENGTH) {
        throw new Error(`MP_TOKEN_ENCRYPTION_KEY debe tener ${KEY_LENGTH} bytes (64 chars hex), recibió ${buf.length}`);
    }
    return buf;
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
    if (typeof payload !== "string" || !payload.includes(":")) {
        throw new Error("decryptMP: formato inválido");
    }
    const [ivHex, authTagHex, dataHex] = payload.split(":");
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
}
