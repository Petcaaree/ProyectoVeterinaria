import jwt from "jsonwebtoken";
import { ValidationError, NotFoundError } from "../errors/AppError.js";
import { encryptMP, decryptMP } from "../utils/cryptoMP.js";
import logger from "../utils/logger.js";

const MP_AUTH_URL = "https://auth.mercadopago.com.ar/authorization";
const MP_TOKEN_URL = "https://api.mercadopago.com/oauth/token";
const STATE_EXPIRES_IN = "10m";
const TIPOS_VALIDOS = ["veterinaria", "paseador", "cuidador"];

// Misma fuente de verdad que jwtUtils.js para evitar fallas si JWT_SECRET no está seteado.
const JWT_SECRET = process.env.JWT_SECRET || "petcare_dev_secret_cambiar_en_produccion";

// Margen de seguridad para considerar el token "por expirar" y refrescarlo proactivamente.
const REFRESH_LEEWAY_MS = 60 * 1000;

export class MpOauthService {
    constructor({ veterinariaRepository, paseadorRepository, cuidadorRepository }) {
        this.repos = {
            veterinaria: veterinariaRepository,
            paseador: paseadorRepository,
            cuidador: cuidadorRepository,
        };
    }

    _getRepo(tipo) {
        const repo = this.repos[tipo];
        if (!repo) throw new ValidationError(`tipo de proveedor inválido: ${tipo}`);
        return repo;
    }

    // Genera la URL de autorización OAuth de MP. El state es un JWT firmado con el
    // proveedorId+tipo para que el callback pueda asociar el code al proveedor sin
    // confiar en sesión ni cookies (MP redirige sin contexto).
    generarAuthUrl({ proveedorId, tipo }) {
        if (!TIPOS_VALIDOS.includes(tipo)) {
            throw new ValidationError("tipo de proveedor inválido");
        }
        const appId = process.env.MP_APP_ID;
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
        if (!appId) {
            throw new Error("MP_APP_ID no configurado");
        }

        const state = jwt.sign({ proveedorId, tipo }, JWT_SECRET, {
            expiresIn: STATE_EXPIRES_IN,
        });

        const params = new URLSearchParams({
            client_id: appId,
            response_type: "code",
            platform_id: "mp",
            redirect_uri: `${backendUrl}/petcare/proveedor/callback-mp`,
            state,
        });

        return `${MP_AUTH_URL}?${params.toString()}`;
    }

    async procesarCallback({ code, state }) {
        if (!code || !state) {
            throw new ValidationError("code y state son requeridos");
        }

        let payload;
        try {
            payload = jwt.verify(state, JWT_SECRET);
        } catch {
            throw new ValidationError("state inválido o expirado");
        }
        const { proveedorId, tipo } = payload;
        if (!proveedorId || !TIPOS_VALIDOS.includes(tipo)) {
            throw new ValidationError("state mal formado");
        }

        const repo = this._getRepo(tipo);
        const proveedor = await repo.findById(proveedorId);
        if (!proveedor) throw new NotFoundError("Proveedor no encontrado");

        const tokenData = await this._intercambiarCode(code);

        proveedor.mpConectado = true;
        proveedor.mpUserId = String(tokenData.user_id);
        proveedor.mpAccessToken = encryptMP(tokenData.access_token);
        proveedor.mpRefreshToken = tokenData.refresh_token ? encryptMP(tokenData.refresh_token) : null;
        proveedor.mpTokenExpiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null;
        proveedor.mpConectadoAt = new Date();
        await proveedor.save();

        logger.info("Proveedor vinculó cuenta MP", { tipo, proveedorId, mpUserId: proveedor.mpUserId });
        return { tipo, proveedorId, mpUserId: proveedor.mpUserId };
    }

    async _intercambiarCode(code) {
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
        const body = new URLSearchParams({
            client_id: process.env.MP_APP_ID || "",
            client_secret: process.env.MP_CLIENT_SECRET || "",
            grant_type: "authorization_code",
            code,
            redirect_uri: `${backendUrl}/petcare/proveedor/callback-mp`,
        });

        const res = await fetch(MP_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });
        const data = await res.json();
        if (!res.ok || !data.access_token) {
            logger.error("MP rechazó el intercambio OAuth", { status: res.status, data });
            throw new ValidationError("MercadoPago rechazó el código de autorización");
        }
        return data;
    }

    async desconectar({ proveedorId, tipo }) {
        const repo = this._getRepo(tipo);
        const proveedor = await repo.findById(proveedorId);
        if (!proveedor) throw new NotFoundError("Proveedor no encontrado");

        proveedor.mpConectado = false;
        proveedor.mpUserId = null;
        proveedor.mpAccessToken = null;
        proveedor.mpRefreshToken = null;
        proveedor.mpTokenExpiresAt = null;
        proveedor.mpConectadoAt = null;
        await proveedor.save();
        return { ok: true };
    }

    async obtenerEstado({ proveedorId, tipo }) {
        const repo = this._getRepo(tipo);
        const proveedor = await repo.findById(proveedorId);
        if (!proveedor) throw new NotFoundError("Proveedor no encontrado");
        return {
            mpConectado: !!proveedor.mpConectado,
            mpUserId: proveedor.mpUserId || null,
            mpConectadoAt: proveedor.mpConectadoAt || null,
        };
    }

    // Devuelve el access token desencriptado de un proveedor ya cargado (no DB hit).
    // No considera expiración: usar getAccessTokenValido() si se necesita refresh automático.
    static getAccessTokenDecrypted(proveedorDoc) {
        if (!proveedorDoc?.mpConectado || !proveedorDoc?.mpAccessToken) return null;
        try {
            return decryptMP(proveedorDoc.mpAccessToken);
        } catch (err) {
            logger.error("No se pudo desencriptar mpAccessToken", { error: err.message });
            return null;
        }
    }

    // Garantiza un access token vigente para el proveedor: si está por expirar y hay
    // refresh_token, intercambia con MP y persiste los nuevos tokens. Si no se puede
    // refrescar, lanza un error específico para forzar reconexión por parte del proveedor.
    async getAccessTokenValido({ proveedorId, tipo }) {
        const repo = this._getRepo(tipo);
        const proveedor = await repo.findById(proveedorId);
        if (!proveedor) throw new NotFoundError("Proveedor no encontrado");
        if (!proveedor.mpConectado || !proveedor.mpAccessToken) {
            const err = new ValidationError("MP_NO_CONECTADO");
            err.code = "MP_NO_CONECTADO";
            throw err;
        }

        const expiresAt = proveedor.mpTokenExpiresAt ? new Date(proveedor.mpTokenExpiresAt).getTime() : null;
        const expirado = expiresAt !== null && (expiresAt - Date.now()) < REFRESH_LEEWAY_MS;
        if (!expirado) {
            return decryptMP(proveedor.mpAccessToken);
        }

        if (!proveedor.mpRefreshToken) {
            // Sin refresh_token no podemos renovar: marcamos como desconectado.
            await this._marcarDesconectado(proveedor);
            const err = new ValidationError("MP_REAUTORIZACION_REQUERIDA");
            err.code = "MP_REAUTORIZACION_REQUERIDA";
            throw err;
        }

        try {
            const refreshTokenPlano = decryptMP(proveedor.mpRefreshToken);
            const tokenData = await this._refrescarToken(refreshTokenPlano);
            proveedor.mpAccessToken = encryptMP(tokenData.access_token);
            if (tokenData.refresh_token) {
                proveedor.mpRefreshToken = encryptMP(tokenData.refresh_token);
            }
            proveedor.mpTokenExpiresAt = tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000)
                : null;
            await proveedor.save();
            return tokenData.access_token;
        } catch (err) {
            logger.error("Falló refresh de token MP", { tipo, proveedorId, error: err.message });
            await this._marcarDesconectado(proveedor);
            const e = new ValidationError("MP_REAUTORIZACION_REQUERIDA");
            e.code = "MP_REAUTORIZACION_REQUERIDA";
            throw e;
        }
    }

    async _refrescarToken(refreshToken) {
        const body = new URLSearchParams({
            client_id: process.env.MP_APP_ID || "",
            client_secret: process.env.MP_CLIENT_SECRET || "",
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        });
        const res = await fetch(MP_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });
        const data = await res.json();
        if (!res.ok || !data.access_token) {
            logger.error("MP rechazó el refresh token", { status: res.status, data });
            throw new Error("MP rechazó el refresh token");
        }
        return data;
    }

    async _marcarDesconectado(proveedor) {
        proveedor.mpConectado = false;
        proveedor.mpAccessToken = null;
        proveedor.mpRefreshToken = null;
        proveedor.mpTokenExpiresAt = null;
        await proveedor.save();
    }
}
