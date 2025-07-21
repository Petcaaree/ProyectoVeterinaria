import mongoose from "mongoose";
import { ServicioCuidador } from "../entidades/ServicioCuidador.js";

const servicioCuidadorSchema = new mongoose.Schema({
  usuarioProveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cuidador",
    required: true,
  },
  nombreServicio: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  precio: {
    type: Number,
    required: true,
    min: 0,
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000,
  },
  nombreContacto: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  emailContacto: {
    type: String,
    required: true,
    trim: true,
    unique: false,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
      },
      message: (props) => `${props.value} no es un email valido!`,
    },
  },
  telefonoContacto: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    maxlength: 15,
  },
  fechasNoDisponibles: [{
        fechaInicio: {
            type: Date,
            required: true
        },

        fechaFin: {
            type: Date,
            required: true
        }
    }],
  diasDisponibles: {
    type: [String],
    required: true,
    enum: [
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
      "DOMINGO",
    ],
  },
  mascotasAceptadas: {
    type: [String],
    required: true,
    enum: ["PERRO", "GATO", "AVE", "OTRO"],
  },
  estado: {
    type: String,
    required: true,
    enum: ["Activada", "Desactivada"],
    default: "Activada"
  },
});

servicioCuidadorSchema.loadClass(ServicioCuidador);

export const ServicioCuidadorModel = mongoose.model(
  "ServicioCuidador",
  servicioCuidadorSchema
);
