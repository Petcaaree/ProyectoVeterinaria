import { VeterinariaModel } from "../models/schemas/veterinariaSchema.js";
import { PaseadorModel } from "../models/schemas/paseadorSchema.js";
import { CuidadorModel } from "../models/schemas/cuidadorSchema.js";

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

        const proveedor = await Model.findById(proveedorId).select("mpConectado mpAccessToken");
        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }

        if (!proveedor.mpConectado || !proveedor.mpAccessToken) {
            return res.status(403).json({
                error: "MP_NO_CONECTADO",
                message: "Necesitás vincular tu cuenta de MercadoPago antes de publicar servicios.",
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}
