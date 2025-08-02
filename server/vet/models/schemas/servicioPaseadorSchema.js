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
    horariosNoDisponibles: {
      type: [String], // Solo array de strings
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.every(item => typeof item === 'string');
        },
        message: "horariosNoDisponibles debe ser un array de strings"
      }
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
  estado: {
    type: String,
    required: true,
    enum: ["Activada", "Desactivada"],
    default: "Activada"
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now
  },
  cantidadReservas: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  direccion: {
      calle: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,   
        maxlength: 100
      },
      altura: {
        type: mongoose.Schema.Types.Mixed,
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

servicioPaseadorSchema.post('find', function(docs) {
  if (docs && Array.isArray(docs)) {
    docs.forEach(doc => {
      if (doc.fechasNoDisponibles) {
        doc.fechasNoDisponibles = doc.fechasNoDisponibles.map(fecha => ({
          fecha: parseFechaToDate(fecha.fecha),
          horariosNoDisponibles: normalizarHorarios(fecha.horariosNoDisponibles)
        }));
      }
    });
  }
});

servicioPaseadorSchema.post('findOne', function(doc) {
  if (doc && doc.fechasNoDisponibles) {
    doc.fechasNoDisponibles = doc.fechasNoDisponibles.map(fecha => ({
      fecha: parseFechaToDate(fecha.fecha),
      horariosNoDisponibles: normalizarHorarios(fecha.horariosNoDisponibles)
    }));
  }
});

// Middleware para asegurar que los datos se guarden correctamente
servicioPaseadorSchema.pre('save', function(next) {
  // Asegurar que fechasNoDisponibles tenga la estructura correcta
  if (this.fechasNoDisponibles) {
    this.fechasNoDisponibles = this.fechasNoDisponibles.map(fecha => {
      if (!fecha.fecha || !fecha.horariosNoDisponibles) {
        console.warn('Estructura incorrecta en fechasNoDisponibles, se asignará estructura vacía');
        return {
          fecha: new Date(),
          horariosNoDisponibles: []
        };
      }
      return {
        fecha: parseFechaToDate(fecha.fecha),
        horariosNoDisponibles: normalizarHorarios(fecha.horariosNoDisponibles)
      };
    });
  }
  
  // Asegurar que horariosDisponibles sean strings
  if (this.horariosDisponibles) {
    this.horariosDisponibles = this.horariosDisponibles.map(h => 
      typeof h === 'string' ? h : String(h)
    );
  }
  
  next();
});

// Middleware para findOneAndUpdate
servicioPaseadorSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.fechasNoDisponibles) {
    update.fechasNoDisponibles = update.fechasNoDisponibles.map(fecha => {
      if (!fecha.fecha || !fecha.horariosNoDisponibles) {
        console.warn('Estructura incorrecta en fechasNoDisponibles durante update');
        return {
          fecha: new Date(),
          horariosNoDisponibles: []
        };
      }
      return {
        fecha: parseFechaToDate(fecha.fecha),
        horariosNoDisponibles: normalizarHorarios(fecha.horariosNoDisponibles)
      };
    });
  }
  
  next();
});

// Función auxiliar para convertir fechas string a Date
function parseFechaToDate(fecha) {
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    // Manejar formato DD/MM/YYYY
    if (fecha.includes('/')) {
      const [dia, mes, anio] = fecha.split('/');
      return new Date(`${anio}-${mes}-${dia}`);
    }
    return new Date(fecha);
  }
  return new Date();
}

// Función auxiliar para normalizar horarios
function normalizarHorarios(horarios) {
  if (!Array.isArray(horarios)) return [];
  return horarios.map(h => {
    if (typeof h === 'string') {
      return h;
    } else if (h && h.horario) {
      return h.horario;
    }
    return '00:00';
  });
}

servicioPaseadorSchema.loadClass(ServicioPaseador);

export const ServicioPaseadorModel = mongoose.model("ServicioPaseador", servicioPaseadorSchema);
