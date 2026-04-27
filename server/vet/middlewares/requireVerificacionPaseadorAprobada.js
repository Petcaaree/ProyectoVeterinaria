import { PaseadorModel } from "../models/schemas/paseadorSchema.js";
import { EstadoVerificacion } from "../models/entidades/enums/EstadoVerificacion.js";

/**
 * Bloquea la creación de servicios de paseador si la cuenta aún no fue verificada.
 * Debe aplicarse después de authMiddleware + authorizationMiddleware('paseador').
 */
export async function requireVerificacionPaseadorAprobada(req, res, next) {
    try {
        const paseadorId = req.usuario?.id;
        if (!paseadorId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const paseador = await PaseadorModel.findById(paseadorId).select("verificacion");
        if (!paseador) {
            return res.status(404).json({ message: "Paseador no encontrado" });
        }

        const estado = paseador.verificacion?.estadoVerificacion ?? null;
        if (estado !== EstadoVerificacion.VERIFICADO) {
            return res.status(403).json({
                error: "VERIFICACION_PENDIENTE",
                message: "Tu cuenta de paseador no está verificada. Completá el proceso antes de publicar servicios.",
                estadoActual: estado ?? "NO_INICIADA",
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}
