import { VeterinariaModel } from "../models/schemas/veterinariaSchema.js";
import { PaseadorModel } from "../models/schemas/paseadorSchema.js";
import { CuidadorModel } from "../models/schemas/cuidadorSchema.js";
import { decryptMP, CryptoConfigError } from "../utils/cryptoMP.js";
import logger from "../utils/logger.js";

const MODELS = {
    veterinaria: VeterinariaModel,
    paseador: PaseadorModel,
    cuidador: CuidadorModel,
};

// Bloquea creación de servicios si el proveedor no vinculó su cuenta de MercadoPago.
// Decisión de producto (PET-32): sin MP conectado no hay split de pagos posible.
export async function requireMpConectado(req, res, next) {
    try {
        const proveedorId = req.usuario?.id;
        const tipo = req.usuario?.tipoUsuario;
        const Model = MODELS[tipo];
        if (!proveedorId || !Model) {
            return res.status(401).json({ message: "No autenticado" });
        }

        // mpAccessToken tiene select:false en el schema, requiere prefijo "+" para incluirlo.
        const proveedor = await Model.findById(proveedorId).select("mpConectado +mpAccessToken");
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }

        if (!proveedor.mpConectado || !proveedor.mpAccessToken) {
            return res.status(403).json({
                error: "MP_NO_CONECTADO",
                message: "Necesitás vincular tu cuenta de MercadoPago antes de publicar servicios.",
            });
        }

        // El token está marcado como conectado, pero verificamos que sea desencriptable.
        // Si MP_TOKEN_ENCRYPTION_KEY rotó o el cifrado se corrompió, evitamos que el
        // proveedor publique servicios que después fallarían en el checkout.
        try {
            decryptMP(proveedor.mpAccessToken);
        } catch (err) {
            // Error de configuración (key faltante/inválida): no es responsabilidad del
            // proveedor; delegar al errorHandler para devolver 500. Re-vincular no soluciona.
            if (err instanceof CryptoConfigError) {
                return next(err);
            }
            logger.warn("requireMpConectado: token MP no desencriptable, requiere re-vincular", {
                proveedorId, tipo, error: err.message,
            });
            return res.status(403).json({
                error: "MP_REAUTORIZACION_REQUERIDA",
                message: "Tu vinculación con MercadoPago dejó de ser válida. Volvé a conectar la cuenta.",
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}
