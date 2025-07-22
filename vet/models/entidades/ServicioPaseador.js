import { EstadoServicio } from "./enums/enumEstadoServicio.js";
import { FechaHorarioTurno } from "./FechaHorarioTurno.js";
import { FechaHorariosNoDisponibles } from "./FechaHorariosNoDisponibles.js";


export class ServicioPaseador{

    constructor(usuarioProveedor, nombreServicio, precio, descripcion, duracionMinutos,nombreContacto,emailContacto, telefonoContacto, diasDisponibles, horariosDisponibles, direccion)  {
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
        this.estado = EstadoServicio.ACTIVO; // Estado del servicio (ACTIVO o DESACTIVADO)
        this.direccion = direccion; // Dirección del servicio
    }

    actualizarPrecio(nuevoPrecio) {
        this.precio = nuevoPrecio;
    }

    actualizarDuracion(nuevaDuracion) {
        this.duracion = nuevaDuracion;
    }

    estaDisponibleParaFechaYHorario(fechaHorarioTurno) {
        this.fechasNoDisponibles.forEach(fechaHorariosNodispo => {
            // Comparar solo la fecha (año-mes-día) ignorando hora
            const fechaBuscada = new Date(fechaHorarioTurno.fecha).toISOString().split('T')[0];
            const fechaAlmacenada = new Date(fechaHorariosNodispo.fecha).toISOString().split('T')[0];
            
            if (fechaBuscada === fechaAlmacenada) {
                if (fechaHorariosNodispo.horariosNoDisponibles.includes(fechaHorarioTurno.horario)) {
                    return false; // La fecha y horario están en la lista de no disponibles
                }
            }
        });
        return true; // Si no se encontró ninguna coincidencia, está disponible
    }

    agregarFechasReserva(fechaHorarioTurno) {
        if (!(fechaHorarioTurno instanceof FechaHorarioTurno)) {
            throw new Error("Se esperaba una instancia de FechaHorarioTurno");
        }
        
        // Buscar si ya existe una fecha igual en el array
        let fechaExistente = this.fechasNoDisponibles.find(fechaHorariosNodispo => {
            const fechaBuscada = new Date(fechaHorarioTurno.fecha).toISOString().split('T')[0];
            const fechaAlmacenada = new Date(fechaHorariosNodispo.fecha).toISOString().split('T')[0];
            return fechaBuscada === fechaAlmacenada;
        });
        
        if (fechaExistente) {
            // Si la fecha existe, buscar esa fecha en el array y agregar el horario
            this.fechasNoDisponibles.forEach(fechaHorariosNodispo => {
                const fechaBuscada = new Date(fechaHorarioTurno.fecha).toISOString().split('T')[0];
                const fechaAlmacenada = new Date(fechaHorariosNodispo.fecha).toISOString().split('T')[0];
                
                if (fechaBuscada === fechaAlmacenada && !fechaHorariosNodispo.horariosNoDisponibles.includes(fechaHorarioTurno.horario)) {
                    fechaHorariosNodispo.horariosNoDisponibles.push(fechaHorarioTurno.horario);
                } else if (fechaBuscada === fechaAlmacenada && fechaHorariosNodispo.horariosNoDisponibles.includes(fechaHorarioTurno.horario)) {
                    // Si el horario ya existe, no hacer nada
                    throw new Error(`Horario ${fechaHorarioTurno.horario} ya está reservado para la fecha ${fechaHorarioTurno.fecha}.`);
                }
            });
        } else {
            // Si la fecha no existe, crear una nueva instancia de FechaHorariosNoDisponibles
            const nuevaFechaNoDisponible = new FechaHorariosNoDisponibles(fechaHorarioTurno.fecha);
            nuevaFechaNoDisponible.agregarHorarioNoDisponible(fechaHorarioTurno.horario);
            this.fechasNoDisponibles.push(nuevaFechaNoDisponible);
        }
    }

    cancelarHorarioReserva(fechaHorarioTurno) {
        this.fechasNoDisponibles.forEach(fechaHorariosNodispo => {
            const fechaBuscada = new Date(fechaHorarioTurno.fecha).toISOString().split('T')[0];
            const fechaAlmacenada = new Date(fechaHorariosNodispo.fecha).toISOString().split('T')[0];
            
            if (fechaBuscada === fechaAlmacenada) {
                // Llamar al método de la instancia FechaHorariosNoDisponibles
                fechaHorariosNodispo.eliminarHorarioNoDisponible(fechaHorarioTurno.horario);
            }
        });
        
        // Opcional: limpiar fechas que no tienen horarios
        this.fechasNoDisponibles = this.fechasNoDisponibles.filter(fecha => 
            fecha.horariosNoDisponibles.length > 0
        );
    }

    cambioEstadoServicio(nuevoEstado) {
        if (nuevoEstado === EstadoServicio.ACTIVO || nuevoEstado === EstadoServicio.DESACTIVADO) {
            this.estado = nuevoEstado;
        } else {
            throw new Error("Estado inválido. Debe ser ACTIVO o DESACTIVADO.");
        }
    }
}