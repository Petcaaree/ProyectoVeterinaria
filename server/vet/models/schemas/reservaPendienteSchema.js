import mongoose from "mongoose";

// Ventana temporal mientras el usuario está en el checkout de MercadoPago.
// Mantiene los cupos bloqueados y guarda todos los datos necesarios para
// crear la Reserva definitiva si el pago es aprobado.
const reservaPendienteSchema = new mongoose.Schema({
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
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
  },
  horario: {
    type: String,
    required: false,
    default: null,
  },
  notaAdicional: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000,
  },
  cantidadDias: {
    type: Number,
    required: true,
    min: 1,
  },
  precioTotal: {
    type: Number,
    required: true,
    min: 0,
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
  },
  emailContacto: {
    type: String,
    required: true,
    trim: true,
  },
  mercadoPagoPreferenceId: {
    type: String,
    required: false,
    default: null,
  },
  // Fecha en la que el cupo se libera si el pago no se completa.
  // Un job periódico recorre los vencidos y llama a revertirPendiente().
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

reservaPendienteSchema.index({ expiresAt: 1 });
reservaPendienteSchema.index({ mercadoPagoPreferenceId: 1 });

export const ReservaPendienteModel = mongoose.model("ReservaPendiente", reservaPendienteSchema);
