import { Usuario } from './Usuario.js';
import { EstadoReserva } from "./enums/EstadoReserva.js"

export class Veterinaria extends Usuario {
    constructor(nombreUsuario, nombreClinica, email, direccion, telefono, contrasenia) {
        super(nombreUsuario, email, direccion, telefono, contrasenia);
        this.nombreClinica = nombreClinica;
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