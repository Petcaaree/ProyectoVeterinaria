import { PagoModel } from "../schemas/pagoSchema.js";

export class PagoRepository {
  async save(pago) {
    if (pago._id || pago.id) {
      const id = pago._id || pago.id;
      const { _id, id: _id2, ...datos } = pago;
      return PagoModel.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
    }
    const nuevoPago = new PagoModel(pago);
    return nuevoPago.save();
  }

  async findById(id) {
    return PagoModel.findById(id);
  }

  async getResumenPagos() {
    const result = await PagoModel.aggregate([
      { $group: { _id: '$estado', total: { $sum: '$monto' }, count: { $sum: 1 } } }
    ]);
    const resumen = {};
    result.forEach(r => { resumen[r._id] = { total: r.total, count: r.count }; });
    return resumen;
  }

  async getResumenComisiones() {
    const result = await PagoModel.aggregate([
      { $match: { estado: 'APROBADO', montoComision: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalComisiones: { $sum: '$montoComision' },
          totalProveedores: { $sum: '$montoProveedor' },
          totalBruto: { $sum: '$monto' },
          count: { $sum: 1 },
        },
      },
    ]);
    return result[0] || { totalComisiones: 0, totalProveedores: 0, totalBruto: 0, count: 0 };
  }

  async findByReservaId(reservaId) {
    return PagoModel.findOne({ reservaId });
  }

  async findByReservaPendienteId(reservaPendienteId) {
    return PagoModel.findOne({ reservaPendienteId });
  }

  async findByPreferenceId(preferenceId) {
    return PagoModel.findOne({ mercadoPagoPreferenceId: preferenceId });
  }
}
