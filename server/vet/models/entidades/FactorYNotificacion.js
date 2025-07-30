import { Notificacion } from './Notificacion.js';
import { Cuidador } from './Cuidador.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';

export class FactoryNotificacion {
  static crearSegunReserva(reserva) {
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
    const mensaje = `Tu reserva con ${reserva.servicioReservado.usuarioProveedor.nombreUsuario} ha sido confirmada`;
    return new Notificacion(mensaje);
  }

  static crearCancelacionAlCliente(reserva) {
    const usuarioProveedor = reserva.servicioReservado.usuarioProveedor;
    const cliente = reserva.cliente;
    let mensaje;
    if ( reserva.serviciOfrecido === "ServicioCuidador" ){
         mensaje = `Reserva de cuidado cancelada por ${usuarioProveedor.nombreUsuario} del dia ${reserva.rangoFechas.fechaInicio.toDateString()} hasta el dia: ${reserva.rangoFechas.fechaFin.toDateString()}`;
    } else if (reserva.serviciOfrecido === "ServicioPaseador" ){
         mensaje = `Reserva de paseo cancelada por ${usuarioProveedor.nombreUsuario} el dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    } else {
         // Para servicios veterinarios
         const tipoServicio = reserva.servicioReservado.tipoServicio || 'servicio veterinario';
         mensaje = `Reserva de ${tipoServicio} cancelada por ${usuarioProveedor.nombreUsuario} el dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    }
    return new Notificacion(mensaje);
  }

  static crearCancelacionAlProveedor(reserva) {

    const usuarioProveedor = reserva.servicioReservado.usuarioProveedor;
    const cliente = reserva.cliente;
    let mensaje;
    if ( reserva.serviciOfrecido === "ServicioCuidador" ){
         mensaje = `La reserva fue cancelada por ${cliente.nombreUsuario} del dia ${reserva.rangoFechas.fechaInicio.toDateString()} hasta el dia: ${reserva.rangoFechas.fechaFin.toDateString()}`;
    } else if (reserva.serviciOfrecido === "ServicioPaseador" ){
         mensaje = `La reserva fue cancelada por ${cliente.nombreUsuario} del dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    } else {
         // Para servicios veterinarios
         const tipoServicio = reserva.servicioReservado.tipoServicio || 'servicio veterinario';
         mensaje = `La reserva de ${tipoServicio} fue cancelada por ${cliente.nombreUsuario} del dia ${reserva.rangoFechas.fechaInicio.toDateString()} a las ${reserva.horario}`;
    }
    
    return new Notificacion(mensaje);
  }


  // NO SABEMOS SI VAMOS A DEJAR MODIFICAR LAS RESERVAS, PERO POR SI ACASO
  static crearActualizacion(reserva) {
    const mensaje = `Tu reserva en ${reserva.cliente.nombreUsuario} a sido modificada`
    return new Notificacion(mensaje)
  }

}