import mongoose from "mongoose";
import { Reserva } from "../entidades/Reserva.js";

const reservaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  mascota: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  servicioReservado: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "serviciOfrecido",
    required: true,
  },
  serviciOfrecido: {
    type: String,
    required: true,
    enum: ["ServicioVeterinaria", "ServicioPaseador", "ServicioCuidador"],
  },
  rangoFechas: {
    fechaInicio: {
      type: Date,
      required: true,
    },

    fechaFin: {
      type: Date,
      required: true,
    },
  },
  estado: {
    type: String,
    required: true,
    trim: true,
    enum: ["PENDIENTE", "ACEPTADA", "CANCELADA", "RECHAZADA", "COMPLETADA"],
  },
  horario: {
    type: String,
    required: false, // Opcional porque los cuidadores no usan horarios
    trim: true,
    validate: {
      validator: function (v) {
        // Si el horario está presente, debe tener formato HH:MM
        return !v || v.split(":").length == 2;
      },
      message: "El horario debe tener formato HH:MM"
    },
  },
  notaAdicional: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000,
  },
  cantidadDias: {
    type: Number,
    required: true,
    min: 1,
  },
  nombreDeContacto: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  telefonoContacto: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    maxlength: 15,
  },
  emailContacto: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(v);
      },
      message: (props) => `${props.value} no es un email valido!`,
    },
  },
});

reservaSchema.loadClass(Reserva);

export const ReservaModel = mongoose.model("Reserva", reservaSchema);
