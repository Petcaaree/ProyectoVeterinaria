import mongoose from "mongoose";
import { ResenaModel } from "../schemas/resenaSchema.js";

export class ResenaRepository {
  constructor() {
    this.model = ResenaModel;
  }

  async create(data) {
    const doc = new this.model(data);
    return await doc.save();
  }

  async findByReserva(reservaId) {
    return await this.model.findOne({ reserva: reservaId });
  }

  async findByServicio(servicioId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model
        .find({ servicio: servicioId })
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "cliente", select: "nombreUsuario email" }),
      this.model.countDocuments({ servicio: servicioId }),
    ]);
    return { data, total };
  }

  // Promedio y cantidad en una sola pasada. Si no hay reseñas devuelve ceros.
  async calcularPromedio(servicioId) {
    const result = await this.model.aggregate([
      { $match: { servicio: new mongoose.Types.ObjectId(servicioId) } },
      {
        $group: {
          _id: "$servicio",
          promedio: { $avg: "$puntuacion" },
          cantidad: { $sum: 1 },
        },
      },
    ]);
    if (result.length === 0) return { promedio: 0, cantidad: 0 };
    return {
      promedio: Math.round(result[0].promedio * 10) / 10,
      cantidad: result[0].cantidad,
    };
  }
}
