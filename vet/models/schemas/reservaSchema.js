import mongoose from "mongoose";
import { Reserva } from "../entidades/Reserva.js";

const reservaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  mascota: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mascota',
    required: true
  },
  servicioReservado: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'serviciOfrecido',
    required: true
  },
  serviciOfrecido: {
    type: String,
    required: true,
    enum: ['ServicioVeterinaria', 'ServicioPaseador', 'ServicioCuidador']
  },
  rangoFechas: {
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true }
  },
  estado: {
    type: String,
    required: true,
    trim: true,
    enum: ['PENDIENTE', 'ACEPTADA', 'CANCELADA', 'RECHAZADA', 'COMPLETADA'],
  },
  rangoHorario: {
    horarioInicio: { type: String, required: true },
    horarioFin: { type: String, required: true }
  },
  notaAdicional: {
    type: String,
    required: true
  },
  cantidadDias: {
    type: Number,
  }
})

reservaSchema.loadClass(Reserva)

export const ReservaModel = mongoose.model("Reserva", reservaSchema)