import { Usuario } from './Usuario.js';
import { EstadoReserva } from "./enums/EstadoReserva.js"

export class Veterinaria extends Usuario {
    

    aceptarReserva(reserva) {
        const notificacion = reserva.actualizarEstado(EstadoReserva.ACEPTADA);
        this.recibirNotificacion(notificacion);
    }

    rechazarReserva(reserva, motivo) {
        const notificacion = reserva.actualizarEstado(EstadoReserva.RECHAZADA, motivo);
        this.recibirNotificacion(notificacion);
    }
}