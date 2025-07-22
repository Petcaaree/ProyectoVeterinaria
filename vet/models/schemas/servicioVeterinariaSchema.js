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
    enum: ["Control", "Vacunacion", "Baño", "Desparacitacion", "Cirugia", "Radiografia", "Ecografia"],
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
    ciudad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ciudad", 
      required: true
    }
  },
  emailClinica: {
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
  telefonoClinica: {
    type: Number,
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
        return v.every((horario) => {
          // Asegurar que cada horario es string y tiene formato HH:MM
          if (typeof horario !== 'string') return false;
          const parts = horario.split(":");
          return parts.length === 2 && 
                 !isNaN(parts[0]) && !isNaN(parts[1]) &&
                 parts[0].length <= 2 && parts[1].length === 2;
        });
      },
      message: "Todos los horarios deben tener formato HH:MM",
    },
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

// Middleware para normalizar los datos al leer desde la DB
servicioVeterinariaSchema.post('find', function(docs) {
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

servicioVeterinariaSchema.post('findOne', function(doc) {
  if (doc && doc.fechasNoDisponibles) {
    doc.fechasNoDisponibles = doc.fechasNoDisponibles.map(fecha => ({
      fecha: parseFechaToDate(fecha.fecha),
      horariosNoDisponibles: normalizarHorarios(fecha.horariosNoDisponibles)
    }));
  }
});

// Middleware para asegurar que los datos se guarden correctamente
servicioVeterinariaSchema.pre('save', function(next) {
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
      return h; // Devolver directamente el string
    } else if (h && h.horario) {
      return h.horario; // Extraer solo el string del objeto
    }
    return '00:00'; // Valor por defecto
  });
}

servicioVeterinariaSchema.loadClass(ServicioVeterinaria);

export const ServicioVeterinariaModel = mongoose.model("ServicioVeterinaria", servicioVeterinariaSchema);
