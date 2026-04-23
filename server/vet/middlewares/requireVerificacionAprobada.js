import { VeterinariaModel } from "../models/schemas/veterinariaSchema.js";
import { EstadoVerificacion } from "../models/entidades/enums/EstadoVerificacion.js";

/**
 * Bloquea la creación de servicios de veterinaria si la cuenta aún no fue verificada.
 * Debe aplicarse después de authMiddleware + authorizationMiddleware('veterinaria').
 */
export async function requireVerificacionAprobada(req, res, next) {
    try {
        const veterinariaId = req.usuario?.id;
        if (!veterinariaId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const vet = await VeterinariaModel.findById(veterinariaId).select("verificacion");
        if (!vet) {
            return res.status(404).json({ message: "Veterinaria no encontrada" });
        }

        const estado = vet.verificacion?.estadoVerificacion ?? null;
        if (estado !== EstadoVerificacion.VERIFICADO) {
            return res.status(403).json({
                error: "VERIFICACION_PENDIENTE",
                message: "Tu veterinaria no está verificada. Completá el proceso de verificación antes de publicar servicios.",
                estadoActual: estado ?? "NO_INICIADA",
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}
