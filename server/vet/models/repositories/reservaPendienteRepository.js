import { ReservaPendienteModel } from "../schemas/reservaPendienteSchema.js";

export class ReservaPendienteRepository {
  constructor() {
    this.model = ReservaPendienteModel;
  }

  async save(pendiente) {
    const { id, _id, ...datos } = pendiente;
    const pendienteId = _id || id;

    let guardada;
    if (pendienteId) {
      guardada = await this.model.findByIdAndUpdate(
        pendienteId,
        datos,
        { new: true, runValidators: true }
      );
    } else {
      guardada = await new this.model(pendiente).save();
    }

    return this._populateFull(guardada);
  }

  async findById(id) {
    const pendiente = await this.model.findById(id);
    if (!pendiente) return null;
    return this._populateFull(pendiente);
  }

  async findByPreferenceId(preferenceId) {
    const pendiente = await this.model.findOne({ mercadoPagoPreferenceId: preferenceId });
    if (!pendiente) return null;
    return this._populateFull(pendiente);
  }

  async deleteById(id) {
    const r = await this.model.findByIdAndDelete(id);
    return r !== null;
  }

  // Reclama el pendiente atómicamente: lo borra y devuelve el documento populado.
  // Si otra llamada concurrente ya lo reclamó, devuelve null. Evita la race en la
  // que dos webhooks aprobados simultáneos podrían crear dos Reservas.
  async claimById(id) {
    const claimed = await this.model.findByIdAndDelete(id);
    if (!claimed) return null;
    return this._populateFull(claimed);
  }

  // Pendientes cuyo expiresAt ya pasó — el job de limpieza los procesa.
  async findExpirados(now = new Date()) {
    const pendientes = await this.model.find({ expiresAt: { $lt: now } });
    const resultados = [];
    for (const p of pendientes) {
      resultados.push(await this._populateFull(p));
    }
    return resultados;
  }

  async _populateFull(pendienteDoc) {
    let pendiente = await this.model.populate(pendienteDoc, [
      { path: 'cliente' },
      { path: 'servicioReservado' },
    ]);

    if (pendiente.servicioReservado) {
      pendiente.servicioReservado = await pendiente.servicioReservado.populate([
        { path: 'usuarioProveedor' },
        { path: 'direccion.localidad', populate: { path: 'ciudad' } },
      ]);
    }

    // Localizar la mascota dentro del cliente y adjuntarla como objeto plano.
    if (pendiente.cliente && pendiente.cliente.mascotas) {
      const mascota = pendiente.cliente.mascotas.find(
        m => m._id.toString() === pendiente.mascota.toString()
      );
      if (mascota) {
        const obj = pendiente.toObject();
        obj.mascota = mascota;
        return obj;
      }
    }

    return pendiente;
  }
}
