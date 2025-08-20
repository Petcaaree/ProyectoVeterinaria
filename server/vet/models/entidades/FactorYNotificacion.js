import { Notificacion } from './Notificacion.js';
import { Cuidador } from './Cuidador.js';
import { Paseador } from './Paseador.js';
import { Veterinaria } from './Veterinaria.js';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';

// Configurar dayjs para español
dayjs.locale('es');

export class FactoryNotificacion {
  // Función helper para formatear fechas en español
  static formatearFecha(fecha) {
    return dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY');
  }

  static crearSegunReserva(reserva) {
    const cliente = reserva.cliente;
    let mensaje;
    if ( reserva.serviciOfrecido === "ServicioCuidador" ){
         mensaje = `Reserva de cuidado realizada por ${cliente.nombreUsuario} del ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} hasta el ${this.formatearFecha(reserva.rangoFechas.fechaFin)}`;
    } else if (reserva.serviciOfrecido === "ServicioPaseador" ){
         mensaje = `Reserva de paseo realizada por ${cliente.nombreUsuario} el ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
    } else {
         // Para servicios veterinarios
         const tipoServicio = reserva.servicioReservado.tipoServicio || 'servicio veterinario';
         mensaje = `Reserva de ${tipoServicio} realizada por ${cliente.nombreUsuario} el ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
    }
    return new Notificacion(mensaje);
  }

  static crearConfirmacion(reserva) {
     const usuarioProveedor = reserva.servicioReservado.usuarioProveedor;
     const cliente = reserva.cliente;
     let mensaje;
         if ( reserva.serviciOfrecido === "ServicioCuidador" ){
             mensaje = `Tu reserva con ${usuarioProveedor.nombreUsuario} ha sido confirmada del ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} al ${this.formatearFecha(reserva.rangoFechas.fechaFin)}`;
         } else if (reserva.serviciOfrecido === "ServicioPaseador" ){
             mensaje = `Tu reserva con ${usuarioProveedor.nombreUsuario} ha sido confirmada el ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
         } else {
          const tipoServicio = reserva.servicioReservado.tipoServicio || 'servicio veterinario';    
             mensaje = `Tu reserva con ${usuarioProveedor.nombreUsuario} de ${tipoServicio} ha sido confirmada el ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
         }

    return new Notificacion(mensaje);
  }

  static crearCancelacionAlCliente(reserva) {
    const usuarioProveedor = reserva.servicioReservado.usuarioProveedor;
    const cliente = reserva.cliente;
    let mensaje;
    if ( reserva.serviciOfrecido === "ServicioCuidador" ){
         mensaje = `Reserva de cuidado cancelada por ${usuarioProveedor.nombreUsuario} del ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} hasta el ${this.formatearFecha(reserva.rangoFechas.fechaFin)}`;
    } else if (reserva.serviciOfrecido === "ServicioPaseador" ){
         mensaje = `Reserva de paseo cancelada por ${usuarioProveedor.nombreUsuario} el ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
    } else {
         // Para servicios veterinarios
         const tipoServicio = reserva.servicioReservado.tipoServicio || 'servicio veterinario';
         mensaje = `Reserva de ${tipoServicio} cancelada por ${usuarioProveedor.nombreUsuario} el ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
    }
    return new Notificacion(mensaje);
  }

  static crearCancelacionAlProveedor(reserva) {

    const usuarioProveedor = reserva.servicioReservado.usuarioProveedor;
    const cliente = reserva.cliente;
    let mensaje;
    if ( reserva.serviciOfrecido === "ServicioCuidador" ){
         mensaje = `La reserva fue cancelada por ${cliente.nombreUsuario} del ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} hasta el ${this.formatearFecha(reserva.rangoFechas.fechaFin)}`;
    } else if (reserva.serviciOfrecido === "ServicioPaseador" ){
         mensaje = `La reserva fue cancelada por ${cliente.nombreUsuario} del ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
    } else {
         // Para servicios veterinarios
         const tipoServicio = reserva.servicioReservado.tipoServicio || 'servicio veterinario';
         mensaje = `La reserva de ${tipoServicio} fue cancelada por ${cliente.nombreUsuario} del ${this.formatearFecha(reserva.rangoFechas.fechaInicio)} a las ${reserva.horario}`;
    }
    
    return new Notificacion(mensaje);
  }


  // NO SABEMOS SI VAMOS A DEJAR MODIFICAR LAS RESERVAS, PERO POR SI ACASO
  static crearActualizacion(reserva) {
    const mensaje = `Tu reserva en ${reserva.cliente.nombreUsuario} a sido modificada`
    return new Notificacion(mensaje)
  }

}