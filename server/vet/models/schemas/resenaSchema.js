import mongoose from "mongoose";
import { Resena } from "../entidades/Resena.js";

const resenaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  servicio: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "serviciOfrecido",
    required: true,
  },
  serviciOfrecido: {
    type: String,
    required: true,
    enum: ["ServicioVeterinaria", "ServicioPaseador", "ServicioCuidador"],
  },
  reserva: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reserva",
    required: true,
  },
  puntuacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: "La puntuación debe ser un entero entre 1 y 5",
    },
  },
  comentario: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500,
    default: "",
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Bloqueo a nivel DB: una reseña por reserva.
resenaSchema.index({ reserva: 1 }, { unique: true });
resenaSchema.index({ servicio: 1, fecha: -1 });

resenaSchema.loadClass(Resena);

export const ResenaModel = mongoose.model("Resena", resenaSchema);
