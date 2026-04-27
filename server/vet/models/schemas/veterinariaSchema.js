import mongoose, { Schema } from "mongoose"
import { Veterinaria } from "../entidades/Veterinaria.js";
import { TipoEstablecimiento } from "../entidades/enums/TipoEstablecimiento.js";
import { EstadoVerificacion } from "../entidades/enums/EstadoVerificacion.js";
import { TipoDocumento } from "../entidades/enums/TipoDocumento.js";

const documentoVerificacionSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: Object.values(TipoDocumento),
        required: true,
    },
    url: { type: String, required: true, trim: true },
    fechaSubida: { type: Date, default: Date.now },
}, { _id: false });

const verificacionSchema = new mongoose.Schema({
    tipoEstablecimiento: {
        type: String,
        enum: Object.values(TipoEstablecimiento),
        required: true,
    },
    razonSocial: { type: String, trim: true, maxlength: 200 },
    cuit: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{2}-\d{8}-\d{1}$/, "CUIT debe tener formato XX-XXXXXXXX-X"],
    },
    matriculaProfesional: { type: String, required: true, trim: true, maxlength: 50 },
    direccion: {
        calle: { type: String, required: true, trim: true },
        numero: { type: String, required: true, trim: true },
        piso: { type: String, trim: true, default: null },
        depto: { type: String, trim: true, default: null },
        localidad: { type: String, required: true, trim: true },
        provincia: { type: String, required: true, trim: true },
        codigoPostal: { type: String, required: true, trim: true },
    },
    telefono: { type: String, required: true, trim: true, minlength: 7, maxlength: 20 },
    documentos: { type: [documentoVerificacionSchema], default: [] },
    estadoVerificacion: {
        type: String,
        enum: Object.values(EstadoVerificacion),
        default: EstadoVerificacion.PENDIENTE,
    },
    motivoRechazo: { type: String, trim: true, default: null },
    fechaActualizacion: { type: Date, default: Date.now },
}, { _id: false });

const veterinariaSchema = new mongoose.Schema({
  nombreUsuario: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  nombreClinica: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
      },
      message: (props) => `${props.value} no es un email valido!`,
    },
  },

  contrasenia: {
    type: String,
    required: true,
    // No trim ni validate: el hash de bcrypt se almacena tal cual.
    // La validacion de complejidad se hace en el servicio antes de hashear.
  },
  telefono: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    maxlength: 15,
  },
  notificaciones: [{
        mensaje: {
            type: String, 
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 500
        },

        fechaAlta: {
            type: Date,
            required: true
        },

        leida: {
            type: Boolean,
            default: false
        },

        fechaLeida: {
            type: Date
        }
    }],
  direccion: {
        calle: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,   
            maxlength: 100
        },
        altura: {
            type: Schema.Types.Mixed,
            required: true,
            validate: {
                validator: function (v) {
                return typeof v === 'string' || typeof v === 'number';
                },
                message: props => `${props.value} no es ni un string ni un número válido para altura`
            }
        },
        localidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Localidad", 
            required: true
        }
    },
    suspendido: {
        type: Boolean,
        default: false,
    },
    motivoSuspension: {
        type: String,
        default: null,
    },
    verificacion: {
        type: verificacionSchema,
        default: null,
    },
});

// Indice para busqueda por nombreUsuario (findByNombreUsuario)
veterinariaSchema.index({ nombreUsuario: 1 });

// Indice compuesto parcial para el panel admin: count + listado paginado de pendientes.
// Se indexan solo veterinarias con verificación iniciada para evitar entradas nulas
// (la mayoría de veterinarias arrancan con verificacion = null).
veterinariaSchema.index(
    {
        "verificacion.estadoVerificacion": 1,
        "verificacion.fechaActualizacion": -1,
    },
    {
        partialFilterExpression: {
            "verificacion.estadoVerificacion": { $exists: true },
        },
    }
);

veterinariaSchema.loadClass(Veterinaria);

export const VeterinariaModel = mongoose.model("Veterinaria", veterinariaSchema);
