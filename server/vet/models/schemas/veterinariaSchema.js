import mongoose, { Schema } from "mongoose"
import { Veterinaria } from "../entidades/Veterinaria.js";

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
    trim: true,
    validate: {
      validator: function (v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
      },
      message: (props) =>
        `La contraseña debe ser segura (8 caracteres, letras, número y símbolo)`,
    },
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
});

veterinariaSchema.loadClass(Veterinaria);

export const VeterinariaModel = mongoose.model("Veterinaria", veterinariaSchema);
