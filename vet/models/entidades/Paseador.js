import { Usuario } from './Usuario.js';
import { EstadoReserva } from "./enums/EstadoReserva.js"

export class Paseador extends Usuario {
    constructor(nombreUsuario, email, localidad, telefono, edad , precioPorHora , duracionPaseoMinutos) {
        super(nombreUsuario, email, localidad, telefono);
        this.edad = edad;
        this.precioPorHora = precioPorHora;
        this.duracionPaseoMinutos = duracionPaseoMinutos;
    }

    aceptarReserva(reserva) {
        const notificacion = reserva.actualizarEstado(EstadoReserva.ACEPTADA);
        this.recibirNotificacion(notificacion);
    }

    rechazarReserva(reserva, motivo) {
        const notificacion = reserva.actualizarEstado(EstadoReserva.RECHAZADA, motivo);
        this.recibirNotificacion(notificacion);
    }
}