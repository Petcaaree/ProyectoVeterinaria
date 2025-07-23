import { Notificacion } from './Notificacion.js';
import { Cuidador } from './Cuidador.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';

export class FactoryNotificacion {
  static crearSegunReserva(reserva) {
    const usuarioProveedor = reserva.usuarioProveedor;
    const cliente = reserva.cliente;
    let mensaje;
    if ( reserva.serviciOfrecido === "ServicioCuidador" ){
         mensaje = `Reserva de cuidado realizada por ${cliente.nombreUsuario} del dia ${reserva.rangoFechas.fechaInicio.toDateString()} hasta el dia: ${reserva.rangoFechas.fechaFin.toDateString()}`;
    } else if (reserva.serviciOfrecido === "ServicioPaseador" ){
         mensaje = `Reserva de paseo realizada por ${cliente.nombreUsuario} el dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    } else {
         // Para servicios veterinarios
         const tipoServicio = reserva.servicioReservado.tipoServicio || 'servicio veterinario';
         mensaje = `Reserva de ${tipoServicio} realizada por ${cliente.nombreUsuario} el dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    }
    return new Notificacion(mensaje);
  }

  static crearConfirmacion(reserva) {
    const mensaje = `Tu reserva con ${reserva.cliente.nombreUsuario} ha sido confirmada`;
    return new Notificacion(mensaje);
  }

  static crearCancelacion(reserva) {
    let mensaje;
    if (reserva.servicioReservado.usuarioProveedor instanceof Cuidador ){
        mensaje = `Reserva cancelada del dia ${reserva.rangoFechas.fechaInicio.toDateString()} al dia ${reserva.rangoFechas.fechaFin.toDateString()}`;
    } else if (reserva.servicioReservado.usuarioProveedor instanceof Paseador) {
        mensaje = `Reserva cancelada del dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    } else {
        mensaje = `Reserva de ${reserva.servicioReservado.tipoServicio} cancelada del dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    }
    return new Notificacion(mensaje);
  }


  // NO SABEMOS SI VAMOS A DEJAR MODIFICAR LAS RESERVAS, PERO POR SI ACASO
  static crearActualizacion(reserva) {
    const mensaje = `Tu reserva en ${reserva.cliente.nombreUsuario} a sido modificada`
    return new Notificacion(mensaje)
  }

}