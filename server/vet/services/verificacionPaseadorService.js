import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { EstadoVerificacion } from "../models/entidades/enums/EstadoVerificacion.js";
import {
    TipoDocumentoPaseador,
    TIPOS_DOCUMENTO_PASEADOR_SOLO_IMAGEN,
} from "../models/entidades/enums/TipoDocumentoPaseador.js";

const CUIL_REGEX = /^\d{2}-\d{8}-\d{1}$/;
const EXTENSIONES_IMAGEN = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

const DOCS_REQUERIDOS = [
    TipoDocumentoPaseador.DNI_FRENTE,
    TipoDocumentoPaseador.DNI_DORSO,
    TipoDocumentoPaseador.ANTECEDENTES_PENALES,
    TipoDocumentoPaseador.FOTO_PERFIL,
    TipoDocumentoPaseador.CONSTANCIA_FISCAL,
];

// Calcula años cumplidos a la fecha actual.
// Usa getters UTC para que strings tipo "YYYY-MM-DD" (parseadas como UTC midnight)
// no se corran 1 día en zonas con offset negativo y produzcan edad incorrecta.
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    let nac;
    if (typeof fechaNacimiento === "string") {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaNacimiento);
        nac = m
            ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
            : new Date(fechaNacimiento);
    } else {
        nac = new Date(fechaNacimiento);
    }
    let edad = hoy.getUTCFullYear() - nac.getUTCFullYear();
    const mDiff = hoy.getUTCMonth() - nac.getUTCMonth();
    if (mDiff < 0 || (mDiff === 0 && hoy.getUTCDate() < nac.getUTCDate())) edad--;
    return edad;
}

// Solo aceptamos extensiones reales en el pathname (no en query/dominio).
// Esto evita bypass tipo "https://x.com/file.pdf?fake=.jpg".
function esImagenPorUrl(url) {
    if (typeof url !== "string" || !url.trim()) return false;
    try {
        const { pathname } = new URL(url);
        const lower = pathname.toLowerCase();
        return EXTENSIONES_IMAGEN.some((ext) => lower.endsWith(ext));
    } catch {
        return false;
    }
}

export class VerificacionPaseadorService {
    constructor(paseadorRepository) {
        this.paseadorRepository = paseadorRepository;
    }

    _validarPayload(payload) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            throw new ValidationError("payload inválido");
        }
        const {
            nombreCompleto, fechaNacimiento, cuil, direccion,
            zonaCobertura, telefono, documentos,
        } = payload;

        if (typeof nombreCompleto !== "string" || !nombreCompleto.trim()) {
            throw new ValidationError("nombreCompleto es requerido");
        }
        if (!fechaNacimiento || isNaN(new Date(fechaNacimiento).getTime())) {
            throw new ValidationError("fechaNacimiento inválida");
        }
        const edad = calcularEdad(fechaNacimiento);
        if (edad < 18) {
            throw new ValidationError("El paseador debe ser mayor de 18 años");
        }
        if (typeof cuil !== "string") {
            throw new ValidationError("CUIL debe tener formato XX-XXXXXXXX-X");
        }
        const cuilNormalizado = cuil.trim();
        if (!CUIL_REGEX.test(cuilNormalizado)) {
            throw new ValidationError("CUIL debe tener formato XX-XXXXXXXX-X");
        }
        if (typeof telefono !== "string" || !telefono.trim()) {
            throw new ValidationError("telefono es requerido");
        }
        if (
            !direccion ||
            typeof direccion !== "object" ||
            Array.isArray(direccion) ||
            typeof direccion.calle !== "string" || !direccion.calle.trim() ||
            typeof direccion.numero !== "string" || !direccion.numero.trim() ||
            typeof direccion.localidad !== "string" || !direccion.localidad.trim() ||
            typeof direccion.provincia !== "string" || !direccion.provincia.trim() ||
            typeof direccion.codigoPostal !== "string" || !direccion.codigoPostal.trim()
        ) {
            throw new ValidationError("direccion incompleta (calle, numero, localidad, provincia y codigoPostal son requeridos como string)");
        }
        if (!Array.isArray(zonaCobertura) || zonaCobertura.length === 0) {
            throw new ValidationError("zonaCobertura debe contener al menos un barrio");
        }
        if (zonaCobertura.some((z) => typeof z !== "string" || !z.trim())) {
            throw new ValidationError("zonaCobertura debe ser un array de strings no vacíos");
        }

        if (!Array.isArray(documentos) || documentos.length === 0) {
            throw new ValidationError("documentos es requerido y debe contener al menos un archivo");
        }

        const tiposSubidos = new Set();
        const documentosNormalizados = [];
        for (const d of documentos) {
            if (!d?.tipo || !Object.values(TipoDocumentoPaseador).includes(d.tipo)) {
                throw new ValidationError(`Tipo de documento inválido: ${d?.tipo}`);
            }
            if (typeof d?.url !== "string" || d.url.trim().length === 0) {
                throw new ValidationError(`Documento ${d.tipo}: url es requerida`);
            }
            const urlTrimmed = d.url.trim();
            // FOTO_PERFIL debe ser imagen, no PDF/raw.
            if (TIPOS_DOCUMENTO_PASEADOR_SOLO_IMAGEN.includes(d.tipo) && !esImagenPorUrl(urlTrimmed)) {
                throw new ValidationError(`Documento ${d.tipo} debe ser una imagen (JPG/JPEG/PNG/WEBP/GIF/BMP)`);
            }
            tiposSubidos.add(d.tipo);
            documentosNormalizados.push({ tipo: d.tipo, url: urlTrimmed });
        }

        const faltantes = DOCS_REQUERIDOS.filter((t) => !tiposSubidos.has(t));
        if (faltantes.length > 0) {
            throw new ValidationError(`Faltan documentos obligatorios: ${faltantes.join(", ")}`);
        }

        return {
            nombreCompleto: nombreCompleto.trim(),
            fechaNacimiento: new Date(fechaNacimiento),
            cuil: cuilNormalizado,
            // Solo persistimos los 5 campos del schema (sin piso/depto).
            direccion: {
                calle: direccion.calle,
                numero: direccion.numero,
                localidad: direccion.localidad,
                provincia: direccion.provincia,
                codigoPostal: direccion.codigoPostal,
            },
            zonaCobertura: zonaCobertura.map((z) => z.trim()),
            telefono: telefono.trim(),
            documentos: documentosNormalizados,
        };
    }

    async crear(paseadorId, payload) {
        const paseador = await this.paseadorRepository.findById(paseadorId);
        if (!paseador) throw new NotFoundError("Paseador no encontrado");

        if (paseador.verificacion) {
            const estado = paseador.verificacion.estadoVerificacion;
            if (estado === EstadoVerificacion.RECHAZADO) {
                throw new ValidationError("Ya existe una verificación rechazada. Usá el endpoint de reenvío para corregirla.");
            }
            throw new ValidationError(`Ya existe una verificación en estado ${estado}. No se puede crear otra.`);
        }

        const normalizado = this._validarPayload(payload);

        paseador.verificacion = {
            ...normalizado,
            estadoVerificacion: EstadoVerificacion.PENDIENTE,
            motivoRechazo: null,
            fechaActualizacion: new Date(),
        };
        await paseador.save();
        return this._toDTO(paseador.verificacion);
    }

    async consultarEstado(paseadorId) {
        const paseador = await this.paseadorRepository.findById(paseadorId);
        if (!paseador) throw new NotFoundError("Paseador no encontrado");

        if (!paseador.verificacion) {
            return { estadoVerificacion: "NO_INICIADA", motivoRechazo: null };
        }
        return this._toDTO(paseador.verificacion);
    }

    async reenviar(paseadorId, payload) {
        const paseador = await this.paseadorRepository.findById(paseadorId);
        if (!paseador) throw new NotFoundError("Paseador no encontrado");
        if (!paseador.verificacion) {
            throw new ValidationError("No existe una verificación previa para reenviar");
        }
        if (paseador.verificacion.estadoVerificacion !== EstadoVerificacion.RECHAZADO) {
            throw new ValidationError("Solo se puede reenviar una verificación en estado RECHAZADO");
        }

        const safePayload = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
        if (payload !== undefined && safePayload === null) {
            throw new ValidationError("payload inválido");
        }
        const src = safePayload ?? {};

        const merged = {
            nombreCompleto: src.nombreCompleto ?? paseador.verificacion.nombreCompleto,
            fechaNacimiento: src.fechaNacimiento ?? paseador.verificacion.fechaNacimiento,
            cuil: src.cuil ?? paseador.verificacion.cuil,
            direccion: src.direccion ?? paseador.verificacion.direccion,
            zonaCobertura: src.zonaCobertura ?? paseador.verificacion.zonaCobertura,
            telefono: src.telefono ?? paseador.verificacion.telefono,
            documentos: src.documentos ?? paseador.verificacion.documentos,
        };
        const normalizado = this._validarPayload(merged);

        paseador.verificacion = {
            ...normalizado,
            estadoVerificacion: EstadoVerificacion.PENDIENTE,
            motivoRechazo: null,
            fechaActualizacion: new Date(),
        };
        await paseador.save();
        return this._toDTO(paseador.verificacion);
    }

    // Admin: aprobar o rechazar.
    async resolver(paseadorId, payload) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            throw new ValidationError("payload inválido");
        }
        const { estado, motivoRechazo } = payload;

        if (![EstadoVerificacion.VERIFICADO, EstadoVerificacion.RECHAZADO].includes(estado)) {
            throw new ValidationError("estado debe ser VERIFICADO o RECHAZADO");
        }
        if (estado === EstadoVerificacion.RECHAZADO && (typeof motivoRechazo !== "string" || !motivoRechazo.trim())) {
            throw new ValidationError("motivoRechazo es requerido al rechazar");
        }

        const paseador = await this.paseadorRepository.findById(paseadorId);
        if (!paseador) throw new NotFoundError("Paseador no encontrado");
        if (!paseador.verificacion) {
            throw new ValidationError("El paseador no inició el proceso de verificación");
        }

        paseador.verificacion.estadoVerificacion = estado;
        paseador.verificacion.motivoRechazo = estado === EstadoVerificacion.RECHAZADO ? motivoRechazo.trim() : null;
        paseador.verificacion.fechaActualizacion = new Date();
        await paseador.save();
        return this._toDTO(paseador.verificacion);
    }

    async listarPendientes({ page = 1, limit = 20 } = {}) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const { items, total } = await this.paseadorRepository.findPendientesVerificacion({
            page: pageNum,
            limit: limitNum,
        });
        return {
            items: items.map((p) => ({
                paseadorId: p._id?.toString() ?? p.id,
                email: p.email,
                nombreUsuario: p.nombreUsuario,
                verificacion: this._toDTO(p.verificacion),
            })),
            page: pageNum,
            limit: limitNum,
            total,
        };
    }

    async contarPendientes() {
        const total = await this.paseadorRepository.countPendientesVerificacion();
        return { total };
    }

    _toDTO(verificacion) {
        return {
            nombreCompleto: verificacion.nombreCompleto,
            fechaNacimiento: verificacion.fechaNacimiento,
            cuil: verificacion.cuil,
            direccion: verificacion.direccion,
            zonaCobertura: [...(verificacion.zonaCobertura ?? [])],
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
