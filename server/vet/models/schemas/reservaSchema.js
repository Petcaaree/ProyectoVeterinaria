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
    enum: ["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"],
  },
  horario: {
    type: String,
    required: false, // Opcional porque los cuidadores no usan horarios
    default: null,
    validate: {
      validator: function (v) {
        // Si el horario es null, undefined o string vacío, es válido (para cuidadores)
        if (!v || v === null || v === undefined || v.trim() === '') {
          return true;
        }
        // Si el horario está presente, debe tener formato HH:MM
        const parts = v.split(":");
        if (parts.length !== 2) return false;
        
        const hour = parseInt(parts[0]);
        const minute = parseInt(parts[1]);
        
        return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
      },
      message: "El horario debe tener formato HH:MM válido o ser null para servicios de cuidador"
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

// Middleware de validación personalizada
reservaSchema.pre('save', function(next) {
  // Si es servicio de veterinaria o paseador, el horario es obligatorio
  if ((this.serviciOfrecido === 'ServicioVeterinaria' || this.serviciOfrecido === 'ServicioPaseador') && !this.horario) {
    const error = new Error('El horario es obligatorio para servicios de veterinaria y paseador');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Virtual populate para mascota
reservaSchema.virtual('mascotaCompleta', {
  ref: 'Cliente',
  localField: 'cliente',
  foreignField: '_id',
  justOne: true,
  transform: function(doc, id) {
    if (doc && doc.mascotas) {
      return doc.mascotas.find(m => m._id.toString() === this.mascota.toString());
    }
    return null;
  }
});

reservaSchema.loadClass(Reserva);

export const ReservaModel = mongoose.model("Reserva", reservaSchema);
