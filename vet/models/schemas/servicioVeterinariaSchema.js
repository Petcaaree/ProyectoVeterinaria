import mongoose from "mongoose";
import { ServicioVeterinaria } from "../entidades/ServicioVeterinaria.js";

const servicioVeterinariaSchema = new mongoose.Schema({
  usuarioProveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Veterinaria",
    required: true,
  },
  nombreServicio: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  tipoServicio: {
    type: String,
    required: true,
    enum: ["CONSULTA", "VACUNACION", "CIRUGIA", "OTRO"],
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
  direccionClinica: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  emailClinica: {
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
  telefonoClinica: {
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
    max: 480, // Duración máxima de 8 horas (480 minutos)
    validate: {
      validator: function (v) {
        return Number.isInteger(v);
      },
      message: "La duración debe ser un número entero en minutos",
    },
  },
  nombreClinica: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
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

servicioVeterinariaSchema.loadClass(ServicioVeterinaria);

export const ServicioVeterinariaModel = mongoose.model("ServicioVeterinaria", servicioVeterinariaSchema);
