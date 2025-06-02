import { Usuario } from './Usuario.js';
import { EstadoReserva } from "./enums/EstadoReserva.js"

export class Veterinaria extends Usuario {
    constructor(nombreUsuario, email, localidad, telefono,  serviciosDisponibles, mascotasAceptadas) {
        super(nombreUsuario, email, localidad, telefono);
        this.serviciosDisponibles = serviciosDisponibles; // Array de servicios que ofrece el cuidador
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