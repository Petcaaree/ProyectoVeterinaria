import { Notificacion } from './Notificacion.js';
import { Cuidador } from './Cuidador.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';

export class FactoryNotificacion {
  static crearSegunReserva(reserva) {
    const usuarioProveedor = reserva.usuarioProveedor;
    const cliente = reserva.cliente;
    if (usuarioProvedor instanceof Cuidador ){
        const mensaje = `Reserva de cuidado realizada por ${cliente.nombreUsuario} del dia ${reserva.fechaInicio.toDateString()} hasta el dia:  ${reserva.fechaFin.toDateString()} `;
    } else if (usuarioProvedor instanceof Paseador) {
        const mensaje = `Reserva de paseo realizada por ${cliente.nombreUsuario},el dia ${reserva.fechaInicio.toDateString()} desde las  ${reserva.rangoHorario.horaIncio.toDateString()} hasta las ${reserva.rangoHorario.horaFin.toDateString()}`;
    } else {
        const mensaje = `Reserva de ${reserva.servicio.tipoServicio} realizada por ${cliente.nombreUsuario} el dia ${reserva.fechaInicio.toDateString()} desde las  ${reserva.rangoHorario.horaIncio.toDateString()} hasta las ${reserva.rangoHorario.horaFin.toDateString()}`;
    }
    return new Notificacion(mensaje);
  }

  static crearConfirmacion(reserva) {
    const mensaje = `Tu reserva con ${reserva.cliente.nombreUsuario} ha sido confirmada`;
    return new Notificacion(mensaje);
  }

  static crearCancelacion(reserva) {
   
    if (reserva.servicioReservado.usuarioProveedor instanceof Cuidador ){
        const mensaje = `Reserva cancelada del dia ${reserva.fechaInicio.toDateString()} al dia ${reserva.fechaFin.toDateString()} `;
    } else if (reserva.servicioReservado.usuarioProveedor instanceof Paseador) {
        const mensaje = `Reserva cancelada del dia ${reserva.fechaInicio.toDateString()} desde las  ${reserva.rangoHorario.horaIncio.toDateString()} hasta las ${reserva.rangoHorario.horaFin.toDateString()}`;
    } else {
        const mensaje = `Reserva de ${reserva.servicioReservado.tipoServicio} cancelada del dia ${reserva.rangoFechas.fechaInicio.toDateString()} desde las  ${reserva.rangoHorario.horaIncio.toDateString()} hasta las ${reserva.rangoHorario.horaFin.toDateString()}`;
    }
    return new Notificacion(mensaje);
  }


  // NO SABEMOS SI VAMOS A DEJAR MODIFICAR LAS RESERVAS, PERO POR SI ACASO
  static crearActualizacion(reserva) {
    const mensaje = `Tu reserva en ${reserva.cliente.nombreUsuario} a sido modificada`
    return new Notificacion(mensaje)
  }

}