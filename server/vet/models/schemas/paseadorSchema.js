import mongoose, { Schema } from "mongoose"
import { Paseador } from "../entidades/Paseador.js";
import { EstadoVerificacion } from "../entidades/enums/EstadoVerificacion.js";
import { TipoDocumentoPaseador } from "../entidades/enums/TipoDocumentoPaseador.js";

const documentoPaseadorSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: Object.values(TipoDocumentoPaseador),
        required: true,
    },
    url: { type: String, required: true, trim: true },
    fechaSubida: { type: Date, default: Date.now },
}, { _id: false });

const verificacionPaseadorSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true, trim: true, maxlength: 200 },
    fechaNacimiento: { type: Date, required: true },
    cuil: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{2}-\d{8}-\d{1}$/, "CUIL debe tener formato XX-XXXXXXXX-X"],
    },
    direccion: {
        calle: { type: String, required: true, trim: true },
        numero: { type: String, required: true, trim: true },
        piso: { type: String, trim: true, default: null },
        depto: { type: String, trim: true, default: null },
        localidad: { type: String, required: true, trim: true },
        provincia: { type: String, required: true, trim: true },
        codigoPostal: { type: String, required: true, trim: true },
    },
    zonaCobertura: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 0,
            message: "zonaCobertura debe tener al menos un barrio",
        },
    },
    telefono: { type: String, required: true, trim: true, minlength: 7, maxlength: 20 },
    documentos: { type: [documentoPaseadorSchema], default: [] },
    estadoVerificacion: {
        type: String,
        enum: Object.values(EstadoVerificacion),
        default: EstadoVerificacion.PENDIENTE,
    },
    motivoRechazo: { type: String, trim: true, default: null },
    fechaActualizacion: { type: Date, default: Date.now },
}, { _id: false });

const paseadorSchema = new mongoose.Schema({
  nombreUsuario: {
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
        type: verificacionPaseadorSchema,
        default: null,
    },
});

// Indice parcial para el panel admin: count + listado paginado de pendientes.
paseadorSchema.index(
    {
        "verificacion.estadoVerificacion": 1,
        "verificacion.fechaActualizacion": -1,
    },
    {
        partialFilterExpression: {
            "verificacion.estadoVerificacion": EstadoVerificacion.PENDIENTE,
        },
    }
);

// Indice para busqueda por nombreUsuario (findByNombreUsuario)
paseadorSchema.index({ nombreUsuario: 1 });

paseadorSchema.loadClass(Paseador);

export const PaseadorModel = mongoose.model("Paseador", paseadorSchema);
