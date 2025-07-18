import mongoose from "mongoose";
import { ServicioPaseador } from "../entidades/ServicioPaseador.js";

const servicioPaseadorSchema = new mongoose.Schema({
  usuarioProveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Paseador",
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
    unique: true,
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
  duracionMinutos: {
    type: Number,
    required: true,
    min: 30, // Duración mínima de 30 minutos
    max: 120, // Duración máxima de 24 horas (1440 minutos
    validate: {
      validator: function (v) {
        return Number.isInteger(v);
      },
      message: "La duración debe ser un número entero en minutos",
    },
  },
  fechasNoDisponibles: [{
    fecha: {
      type: Date,
      required: true
    },
    horariosNoDisponibles: [{
      horario: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (v) {
            return v.split(":").length == 2;
          },
          message: "El horario debe tener formato HH:MM"
        },
      }
    }]
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
  horariosDisponibles: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.every((horario) => horario.split(":").length == 2);
      },
      message: "Todos los horarios deben tener formato HH:MM",
    },
  },
  mascotasAceptadas: {
    type: [String],
    required: true,
    enum: ["PERRO", "GATO", "AVE", "OTRO"],
  },
});

servicioPaseadorSchema.loadClass(ServicioPaseador);

export const ServicioPaseadorModel = mongoose.model("ServicioPaseador", servicioPaseadorSchema);
