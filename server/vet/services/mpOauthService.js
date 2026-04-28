import jwt from "jsonwebtoken";
import { ValidationError, NotFoundError } from "../errors/AppError.js";
import { encryptMP, decryptMP, CryptoConfigError } from "../utils/cryptoMP.js";
import logger from "../utils/logger.js";

const MP_AUTH_URL = "https://auth.mercadopago.com.ar/authorization";
const MP_TOKEN_URL = "https://api.mercadopago.com/oauth/token";
const STATE_EXPIRES_IN = "10m";
const TIPOS_VALIDOS = ["veterinaria", "paseador", "cuidador"];

// Secret dedicado al state OAuth: si MP_OAUTH_STATE_SECRET está seteado lo usamos
// (más seguro, aislado del secret de sesión). Si no, caemos a JWT_SECRET para compartir
// la misma fuente que jwtUtils.js. Nunca usamos un default hardcodeado —en ningún
// entorno— porque un valor predecible permitiría forjar state y asociar un code OAuth
// a otro proveedor.
function getStateSecret() {
    const secret = process.env.MP_OAUTH_STATE_SECRET || process.env.JWT_SECRET;
    if (!secret) {
        logger.error(
            "Configuración insegura de OAuth: falta MP_OAUTH_STATE_SECRET o JWT_SECRET para firmar el state"
        );
        throw new Error(
            "MP_OAUTH_STATE_SECRET (o JWT_SECRET) es obligatorio para firmar el state OAuth"
        );
    }
    return secret;
}

// Margen de seguridad para considerar el token "por expirar" y refrescarlo proactivamente.
const REFRESH_LEEWAY_MS = 60 * 1000;

// Quita campos sensibles antes de loguear payloads de error de MP. La respuesta puede
// incluir access_token/refresh_token aún en errores parciales, y los logs son persistidos.
function sanitizarErrorMP(data) {
    if (!data || typeof data !== "object") return undefined;
    return {
        error: data.error,
        error_description: data.error_description,
        message: data.message,
        cause: Array.isArray(data.cause)
            ? data.cause.map((c) =>
                  c && typeof c === "object" ? { code: c.code, description: c.description } : c
              )
            : undefined,
    };
}

function requireMpAppCredentials() {
    const appId = process.env.MP_APP_ID;
    const clientSecret = process.env.MP_CLIENT_SECRET;
    if (!appId || !clientSecret) {
        throw new Error(
            "Configuración MP incompleta: MP_APP_ID y MP_CLIENT_SECRET son obligatorios"
        );
    }
    return { appId, clientSecret };
}

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

    // Lookup liviano para flujos MP: evita el populate de dirección/ciudad que hacen
    // los repos en findById(). Trae solo los campos MP necesarios y mantiene el doc
    // hidratado (no .lean()) porque luego mutamos campos y llamamos save().
    async _findProveedorParaMp({ proveedorId, tipo }) {
        const repo = this._getRepo(tipo);
        const Model = repo.model;
        if (!Model?.findById) {
            // Fallback defensivo: si algún repo no expone .model, usamos findById regular.
            return repo.findById(proveedorId);
        }
        // mpAccessToken/mpRefreshToken/mpTokenExpiresAt tienen select:false; requieren
        // prefijo "+" para incluirlos. Sin el prefijo, getAccessTokenValido vería mpAccessToken
        // como undefined y lanzaría MP_NO_CONECTADO incorrectamente.
        return Model.findById(proveedorId).select(
            "_id mpConectado mpUserId +mpAccessToken +mpRefreshToken +mpTokenExpiresAt mpConectadoAt"
        );
    }

    // Genera la URL de autorización OAuth de MP. El state es un JWT firmado con el
    // proveedorId+tipo para que el callback pueda asociar el code al proveedor sin
    // confiar en sesión ni cookies (MP redirige sin contexto).
    generarAuthUrl({ proveedorId, tipo }) {
        if (!TIPOS_VALIDOS.includes(tipo)) {
            throw new ValidationError("tipo de proveedor inválido");
        }
        // Falla rápido y con mensaje claro si la app de MP no está configurada,
        // en vez de mandar un client_id vacío y dejar que MP responda con un error genérico.
        const { appId } = requireMpAppCredentials();
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

        const state = jwt.sign({ proveedorId, tipo }, getStateSecret(), {
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
            payload = jwt.verify(state, getStateSecret());
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
        // Validar credenciales antes de llamar a MP: si falta config, fallar con un
        // mensaje claro en vez de mandar strings vacíos y recibir un error de MP que
        // parece relacionado al code cuando en realidad es config faltante.
        const { appId, clientSecret } = requireMpAppCredentials();
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
        const body = new URLSearchParams({
            client_id: appId,
            client_secret: clientSecret,
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
            logger.error("MP rechazó el intercambio OAuth", {
                status: res.status,
                error: sanitizarErrorMP(data),
            });
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
        const proveedor = await this._findProveedorParaMp({ proveedorId, tipo });
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

    // Resuelve un access token vigente buscando al proveedor por mpUserId (== collector_id
    // en MP). Pensado para el fallback del webhook donde sólo se conoce el collector.
    // Devuelve null si ningún proveedor matchea, lanza si encuentra pero no se puede resolver token.
    async getAccessTokenValidoPorMpUserId(mpUserId) {
        if (!mpUserId) return null;
        const tipos = ["veterinaria", "paseador", "cuidador"];
        for (const tipo of tipos) {
            const repo = this.repos[tipo];
            const Model = repo?.model;
            if (!Model?.findOne) continue;
            const proveedor = await Model.findOne({ mpUserId }).select("_id").lean();
            if (!proveedor) continue;
            return this.getAccessTokenValido({
                proveedorId: proveedor._id.toString(),
                tipo,
            });
        }
        return null;
    }

    // Garantiza un access token vigente para el proveedor: si está por expirar y hay
    // refresh_token, intercambia con MP y persiste los nuevos tokens. Si no se puede
    // refrescar, lanza un error específico para forzar reconexión por parte del proveedor.
    async getAccessTokenValido({ proveedorId, tipo }) {
        const proveedor = await this._findProveedorParaMp({ proveedorId, tipo });
        if (!proveedor) throw new NotFoundError("Proveedor no encontrado");
        if (!proveedor.mpConectado || !proveedor.mpAccessToken) {
            const err = new ValidationError("MP_NO_CONECTADO");
            err.code = "MP_NO_CONECTADO";
            throw err;
        }

        const expiresAt = proveedor.mpTokenExpiresAt ? new Date(proveedor.mpTokenExpiresAt).getTime() : null;
        const expirado = expiresAt !== null && (expiresAt - Date.now()) < REFRESH_LEEWAY_MS;
        if (!expirado) {
            // Si el decrypt falla por payload corrupto o rotación de MP_TOKEN_ENCRYPTION_KEY,
            // forzamos reconexión. Si falla por misconfiguración del servidor (key faltante/inválida),
            // re-lanzamos el error sin tocar al proveedor: re-vincular no solucionaría nada.
            try {
                return decryptMP(proveedor.mpAccessToken);
            } catch (err) {
                if (err instanceof CryptoConfigError) {
                    throw err;
                }
                logger.error("Falló decrypt de access token MP", {
                    tipo, proveedorId, error: err.message,
                });
                await this._marcarDesconectado(proveedor);
                const e = new ValidationError("MP_REAUTORIZACION_REQUERIDA");
                e.code = "MP_REAUTORIZACION_REQUERIDA";
                throw e;
            }
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
            if (err instanceof CryptoConfigError) {
                // Misconfiguración del servidor: no desconectar al proveedor.
                throw err;
            }
            logger.error("Falló refresh de token MP", { tipo, proveedorId, error: err.message });
            await this._marcarDesconectado(proveedor);
            const e = new ValidationError("MP_REAUTORIZACION_REQUERIDA");
            e.code = "MP_REAUTORIZACION_REQUERIDA";
            throw e;
        }
    }

    async _refrescarToken(refreshToken) {
        const { appId, clientSecret } = requireMpAppCredentials();
        const body = new URLSearchParams({
            client_id: appId,
            client_secret: clientSecret,
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
            logger.error("MP rechazó el refresh token", {
                status: res.status,
                error: sanitizarErrorMP(data),
            });
            throw new Error("MP rechazó el refresh token");
        }
        return data;
    }

    async _marcarDesconectado(proveedor) {
        // Mantener consistencia con desconectar(): el frontend usa mpConectadoAt para
        // mostrar "conectado desde X", así que dejarlo intacto cuando ya estamos
        // desconectados induce a error.
        proveedor.mpConectado = false;
        proveedor.mpUserId = null;
        proveedor.mpAccessToken = null;
        proveedor.mpRefreshToken = null;
        proveedor.mpTokenExpiresAt = null;
        proveedor.mpConectadoAt = null;
        await proveedor.save();
    }
}
