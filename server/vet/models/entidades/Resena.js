export class Resena {
  constructor(cliente, servicio, reserva, puntuacion, comentario, fecha) {
    this.cliente = cliente;
    this.servicio = servicio;
    this.reserva = reserva;
    this.puntuacion = puntuacion;
    this.comentario = comentario;
    this.fecha = fecha || new Date();
  }
}
