import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { TipoEstablecimiento, TIPOS_ENTIDAD_COMERCIAL } from "../models/entidades/enums/TipoEstablecimiento.js";
import { EstadoVerificacion } from "../models/entidades/enums/EstadoVerificacion.js";
import { TipoDocumento } from "../models/entidades/enums/TipoDocumento.js";

const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/;

// Documentos obligatorios por tipo de establecimiento.
const DOCS_REQUERIDOS_POR_TIPO = {
    [TipoEstablecimiento.CLINICA]: [
        TipoDocumento.HABILITACION_MUNICIPAL,
        TipoDocumento.FOTO_FRENTE,
        TipoDocumento.FOTO_INTERIOR,
    ],
    [TipoEstablecimiento.HOSPITAL]: [
        TipoDocumento.HABILITACION_MUNICIPAL,
        TipoDocumento.FOTO_FRENTE,
        TipoDocumento.FOTO_INTERIOR,
    ],
    [TipoEstablecimiento.CONSULTORIO_PRIVADO]: [
        TipoDocumento.FOTO_INTERIOR,
        TipoDocumento.COMPROBANTE_DOMICILIO,
        TipoDocumento.CONSTANCIA_FISCAL,
    ],
};

export class VerificacionService {
    constructor(veterinariaRepository) {
        this.veterinariaRepository = veterinariaRepository;
    }

    _validarPayload({ tipoEstablecimiento, razonSocial, cuit, matriculaProfesional, direccion, telefono, documentos }) {
        if (!tipoEstablecimiento || !Object.values(TipoEstablecimiento).includes(tipoEstablecimiento)) {
            throw new ValidationError("tipoEstablecimiento inválido");
        }
        if (!cuit || !CUIT_REGEX.test(cuit)) {
            throw new ValidationError("CUIT debe tener formato XX-XXXXXXXX-X");
        }
        if (typeof matriculaProfesional !== "string" || !matriculaProfesional.trim()) {
            throw new ValidationError("matriculaProfesional es requerida");
        }
        if (typeof telefono !== "string" || !telefono.trim()) {
            throw new ValidationError("telefono es requerido");
        }
        if (!direccion || !direccion.calle || !direccion.numero || !direccion.localidad || !direccion.provincia || !direccion.codigoPostal) {
            throw new ValidationError("direccion incompleta (calle, numero, localidad, provincia y codigoPostal son requeridos)");
        }
        if (TIPOS_ENTIDAD_COMERCIAL.includes(tipoEstablecimiento) && (typeof razonSocial !== "string" || !razonSocial.trim())) {
            throw new ValidationError("razonSocial es requerida para CLINICA/HOSPITAL");
        }
        if (!Array.isArray(documentos) || documentos.length === 0) {
            throw new ValidationError("documentos es requerido y debe contener al menos un archivo");
        }

        const tiposSubidos = new Set(documentos.map((d) => d?.tipo));
        for (const d of documentos) {
            if (!d?.tipo || !Object.values(TipoDocumento).includes(d.tipo)) {
                throw new ValidationError(`Tipo de documento inválido: ${d?.tipo}`);
            }
            if (!d?.url || typeof d.url !== "string") {
                throw new ValidationError(`Documento ${d.tipo}: url es requerida`);
            }
        }

        const requeridos = DOCS_REQUERIDOS_POR_TIPO[tipoEstablecimiento];
        const faltantes = requeridos.filter((t) => !tiposSubidos.has(t));
        if (faltantes.length > 0) {
            throw new ValidationError(`Faltan documentos obligatorios: ${faltantes.join(", ")}`);
        }
    }

    async crear(veterinariaId, payload) {
        this._validarPayload(payload);

        const vet = await this.veterinariaRepository.findById(veterinariaId);
        if (!vet) throw new NotFoundError("Veterinaria no encontrada");

        vet.verificacion = {
            ...payload,
            estadoVerificacion: EstadoVerificacion.PENDIENTE,
            motivoRechazo: null,
            fechaActualizacion: new Date(),
        };
        await vet.save();
        return this._toDTO(vet.verificacion);
    }

    async consultarEstado(veterinariaId) {
        const vet = await this.veterinariaRepository.findById(veterinariaId);
        if (!vet) throw new NotFoundError("Veterinaria no encontrada");

        if (!vet.verificacion) {
            return { estadoVerificacion: "NO_INICIADA", motivoRechazo: null };
        }
        return this._toDTO(vet.verificacion);
    }

    async reenviar(veterinariaId, payload) {
        const vet = await this.veterinariaRepository.findById(veterinariaId);
        if (!vet) throw new NotFoundError("Veterinaria no encontrada");
        if (!vet.verificacion) {
            throw new ValidationError("No existe una verificación previa para reenviar");
        }
        if (vet.verificacion.estadoVerificacion !== EstadoVerificacion.RECHAZADO) {
            throw new ValidationError("Solo se puede reenviar una verificación en estado RECHAZADO");
        }

        // Mergeamos: los campos no enviados preservan el valor previo.
        const merged = {
            tipoEstablecimiento: payload.tipoEstablecimiento ?? vet.verificacion.tipoEstablecimiento,
            razonSocial: payload.razonSocial ?? vet.verificacion.razonSocial,
            cuit: payload.cuit ?? vet.verificacion.cuit,
            matriculaProfesional: payload.matriculaProfesional ?? vet.verificacion.matriculaProfesional,
            direccion: payload.direccion ?? vet.verificacion.direccion,
            telefono: payload.telefono ?? vet.verificacion.telefono,
            documentos: payload.documentos ?? vet.verificacion.documentos,
        };
        this._validarPayload(merged);

        vet.verificacion = {
            ...merged,
            estadoVerificacion: EstadoVerificacion.PENDIENTE,
            motivoRechazo: null,
            fechaActualizacion: new Date(),
        };
        await vet.save();
        return this._toDTO(vet.verificacion);
    }

    // Endpoint admin: aprobar o rechazar.
    async resolver(veterinariaId, { estado, motivoRechazo }) {
        if (![EstadoVerificacion.VERIFICADO, EstadoVerificacion.RECHAZADO].includes(estado)) {
            throw new ValidationError("estado debe ser VERIFICADO o RECHAZADO");
        }
        if (estado === EstadoVerificacion.RECHAZADO && (typeof motivoRechazo !== "string" || !motivoRechazo.trim())) {
            throw new ValidationError("motivoRechazo es requerido al rechazar");
        }

        const vet = await this.veterinariaRepository.findById(veterinariaId);
        if (!vet) throw new NotFoundError("Veterinaria no encontrada");
        if (!vet.verificacion) {
            throw new ValidationError("La veterinaria no inició el proceso de verificación");
        }

        vet.verificacion.estadoVerificacion = estado;
        vet.verificacion.motivoRechazo = estado === EstadoVerificacion.RECHAZADO ? motivoRechazo.trim() : null;
        vet.verificacion.fechaActualizacion = new Date();
        await vet.save();
        return this._toDTO(vet.verificacion);
    }

    _toDTO(verificacion) {
        return {
            tipoEstablecimiento: verificacion.tipoEstablecimiento,
            razonSocial: verificacion.razonSocial ?? null,
            cuit: verificacion.cuit,
            matriculaProfesional: verificacion.matriculaProfesional,
            direccion: verificacion.direccion,
            telefono: verificacion.telefono,
            documentos: (verificacion.documentos ?? []).map((d) => ({
                tipo: d.tipo,
                url: d.url,
                fechaSubida: d.fechaSubida,
            })),
            estadoVerificacion: verificacion.estadoVerificacion,
            motivoRechazo: verificacion.motivoRechazo ?? null,
            fechaActualizacion: verificacion.fechaActualizacion,
        };
    }
}
