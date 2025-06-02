import { Usuario } from './Usuario.js';
import { EstadoReserva } from "./enums/EstadoReserva.js"


export class Cliente extends Usuario {

    constructor(nombreUsuario, email, localidad, mascotas , telefono ) {
        super(nombreUsuario, email, localidad);
        this.mascotas = mascotas ;
        this.telefono = telefono ;
    }



    modificarReserva(reserva, nuevaCantidad, nuevaFechas) {
        const notificacion = reserva.actualizarReserva(nuevaCantidad, nuevaFechas)
        this.recibirNotificacion(notificacion)
    }

    cancelarReserva(reserva, motivo) {
        const notificacion = reserva.actualizarEstado(EstadoReserva.CANCELADA, motivo)
        this.recibirNotificacion(notificacion)
    }

    eliminarMascota(mascota) {
        const index = this.mascotas.indexOf(mascota);
        if (index > -1) {
            this.mascotas.splice(index, 1);
        } else {
            throw new Error("Mascota no encontrada");
        }
    }
}