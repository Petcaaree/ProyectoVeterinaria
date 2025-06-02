import { Usuario } from './Usuario.js';
import { EstadoReserva } from "./enums/EstadoReserva.js"

export class Cuidador extends Usuario {
    constructor(nombreUsuario, email, localidad, telefono, edad, precioPorDia, mascotasAceptadas) {
        super(nombreUsuario, email, localidad, telefono);
        this.edad = edad;
        this.precioPorDia = precioPorDia;
        this.mascotasAceptadas = mascotasAceptadas; // Array de tipos de mascotas aceptadas
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