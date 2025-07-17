

export class ServicioPaseador{

    constructor(usuarioProveedor, nombreServicio, precio, descripcion, duracionMinutos,nombreContacto,emailContacto, telefonoContacto, diasDisponibles, horariosDisponibles , mascotasAceptadas)  {
        this.usuarioProveedor = usuarioProveedor; // Referencia al cuidador o veterinario
        this.nombreServicio = nombreServicio; // Nombre del servicio
        this.precio = precio; // Precio del servicio
        this.descripcion = descripcion; // Descripción del servicio
        this.duracionMinutos = duracionMinutos; // Duración del servicio en minutos
        this.nombreContacto = nombreContacto; // Nombre del contacto
        this.emailContacto = emailContacto; // Email del contacto
        this.telefonoContacto = telefonoContacto; // Teléfono del contacto
        this.fechasNoDisponibles = []; // Fechas no disponibles para el servicio
        this.diasDisponibles = diasDisponibles ; // Días disponibles para el servicio
        this.horariosDisponibles = horariosDisponibles ; // Horarios disponibles para el servicio
        this.mascotasAceptadas = mascotasAceptadas; // Lista de tipos de mascotas aceptadas
    }

    actualizarPrecio(nuevoPrecio) {
        this.precio = nuevoPrecio;
    }

    actualizarDuracion(nuevaDuracion) {
        this.duracion = nuevaDuracion;
    }

    estaDisponibleParaFechaYHorario(fechaHorarioTurno) {
        this.fechasNoDisponibles.forEach(fechaHorariosNodispo => {
            if (fechaHorarioTurno.fecha === fechaHorariosNodispo.fecha) {
                if (fechaHorariosNodispo.horariosNoDisponibles.includes(fechaHorarioTurno.horario)) {
                    return false; // La fecha y horario están en la lista de no disponibles
                }
            }
        });
        return true; // Si no se encontró ninguna coincidencia, está disponible
    }

    cancelarHorarioReserva(fechaHorarioTurno) {
        this.fechasNoDisponibles.forEach(fechaHorariosNodispo => {
            if (fechaHorarioTurno.fecha === fechaHorariosNodispo.fecha) {
                if (fechaHorariosNodispo.horariosNoDisponibles.includes(fechaHorarioTurno.horario)) {
                    fechaHorariosNodispo.horariosNoDisponibles.eliminarHorarioNoDisponible(fechaHorarioTurno.horario); // Elimina el horario de la lista de no disponibles
                }
            }
        });
    }
}