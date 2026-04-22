import { NotFoundError, ValidationError, ConflictError } from "../errors/AppError.js";
import { EstadoReserva } from "../models/entidades/enums/EstadoReserva.js";

export class ResenaService {
  constructor(
    resenaRepository,
    reservaRepository,
    servicioVeterinariaRepository,
    servicioPaseadorRepository,
    servicioCuidadorRepository
  ) {
    this.resenaRepository = resenaRepository;
    this.reservaRepository = reservaRepository;
    this.servicioVeterinariaRepository = servicioVeterinariaRepository;
    this.servicioPaseadorRepository = servicioPaseadorRepository;
    this.servicioCuidadorRepository = servicioCuidadorRepository;
  }

  // Mapa tipo de servicio → repo que persiste calificacionPromedio / cantidadResenas.
  _repoPorTipo(serviciOfrecido) {
    switch (serviciOfrecido) {
      case "ServicioVeterinaria": return this.servicioVeterinariaRepository;
      case "ServicioPaseador": return this.servicioPaseadorRepository;
      case "ServicioCuidador": return this.servicioCuidadorRepository;
      default: throw new ValidationError("Tipo de servicio no soportado");
    }
  }

  async crear({ clienteId, reservaId, puntuacion, comentario }) {
    if (!clienteId) throw new ValidationError("clienteId requerido");
    if (!reservaId) throw new ValidationError("reservaId requerido");
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      throw new ValidationError("La puntuación debe ser un entero entre 1 y 5");
    }
    if (typeof comentario === "string" && comentario.length > 500) {
      throw new ValidationError("El comentario no puede superar los 500 caracteres");
    }

    const reserva = await this.reservaRepository.findById(reservaId);
    if (!reserva) throw new NotFoundError("Reserva no encontrada");

    const idClienteReserva = reserva.cliente?._id?.toString() || reserva.cliente?.toString();
    if (idClienteReserva !== String(clienteId)) {
      throw new ValidationError("La reserva no pertenece al cliente autenticado");
    }

    if (reserva.estado !== EstadoReserva.COMPLETADA) {
      throw new ValidationError("Solo se pueden reseñar reservas COMPLETADAS");
    }

    const yaExiste = await this.resenaRepository.findByReserva(reservaId);
    if (yaExiste) throw new ConflictError("Esta reserva ya tiene una reseña");

    const servicioId = reserva.servicioReservado?._id || reserva.servicioReservado;
    const serviciOfrecido = reserva.serviciOfrecido;

    let resena;
    try {
      resena = await this.resenaRepository.create({
        cliente: clienteId,
        servicio: servicioId,
        serviciOfrecido,
        reserva: reservaId,
        puntuacion,
        comentario: comentario || "",
      });
    } catch (err) {
      // El índice único {reserva:1} puede disparar una race condition.
      if (err?.code === 11000) throw new ConflictError("Esta reserva ya tiene una reseña");
      throw err;
    }

    await this._recalcularPromedio(servicioId, serviciOfrecido);

    return this.toDTO(resena);
  }

  async listarPorServicio(servicioId, { page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const { data, total } = await this.resenaRepository.findByServicio(servicioId, {
      page: pageNum,
      limit: limitNum,
    });

    return {
      page: pageNum,
      per_page: limitNum,
      total,
      total_pages: Math.ceil(total / limitNum),
      data: data.map((r) => this.toDTO(r)),
    };
  }

  async _recalcularPromedio(servicioId, serviciOfrecido) {
    const { promedio, cantidad } = await this.resenaRepository.calcularPromedio(servicioId);
    const repo = this._repoPorTipo(serviciOfrecido);
    await repo.model.findByIdAndUpdate(servicioId, {
      calificacionPromedio: promedio,
      cantidadResenas: cantidad,
    });
  }

  toDTO(resena) {
    return {
      _id: resena._id,
      id: resena._id,
      cliente: resena.cliente?.nombreUsuario
        ? { _id: resena.cliente._id, nombreUsuario: resena.cliente.nombreUsuario }
        : resena.cliente,
      servicio: resena.servicio,
      reserva: resena.reserva,
      puntuacion: resena.puntuacion,
      comentario: resena.comentario,
      fecha: resena.fecha,
    };
  }
}
