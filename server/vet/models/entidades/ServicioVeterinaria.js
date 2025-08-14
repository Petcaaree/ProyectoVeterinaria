import { EstadoServicio } from "./enums/enumEstadoServicio.js";
import { FechaHorarioTurno } from "./FechaHorarioTurno.js";
import { FechaHorariosNoDisponibles } from "./FechaHorariosNoDisponibles.js";
import { NotFoundError, ValidationError } from "../../errors/AppError.js";


export class ServicioVeterinaria{

    constructor(usuarioProveedor, nombreServicio,tipoServicio, precio, descripcion,  duracionMinutos, nombreClinica, direccion, emailClinica, telefonoClinica, diasDisponibles, horariosDisponibles, mascotasAceptadas)  {
        this.usuarioProveedor = usuarioProveedor; // Referencia al cuidador o veterinario
        this.nombreServicio = nombreServicio; // Nombre del servicio
        this.tipoServicio = tipoServicio; // Tipo de servicio (Control, Vacunación, Baño)
        this.precio = precio; // Precio del servicio
        this.descripcion = descripcion; // Descripción del servicio
        this.duracionMinutos = duracionMinutos; // Duración del servicio en minutos
        this.nombreClinica = nombreClinica; // Nombre de la clínica veterinaria 
        this.fechasNoDisponibles = []; // Fechas no disponibles para el servicio
        this.direccion = direccion; // Dirección de la clínica veterinaria
        this.emailClinica = emailClinica; // Email de la clínica veterinaria
        this.telefonoClinica = telefonoClinica; // Teléfono de la clínica veterinaria
        this.estado = EstadoServicio.ACTIVO; // Estado del servicio (ACTIVO o DESACTIVADO)
        this.diasDisponibles = diasDisponibles ; // Días disponibles para el servicio
        this.horariosDisponibles = horariosDisponibles ; // Horarios disponibles para el servicio
        this.mascotasAceptadas = mascotasAceptadas; // Lista de tipos de mascotas aceptadas
        this.fechaCreacion = new Date(); // Fecha de creación del servicio
        this.cantidadReservas = 0; // Cantidad de reservas realizadas
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
        
        // Reconstruir todas las instancias para asegurar que tienen los métodos
        this.fechasNoDisponibles = this.fechasNoDisponibles.map(fechaHorariosNodispo => {
            if (!(fechaHorariosNodispo instanceof FechaHorariosNoDisponibles)) {
                // Reconstruir la instancia
                const instanciaReconstruida = new FechaHorariosNoDisponibles(fechaHorariosNodispo.fecha);
                instanciaReconstruida.horariosNoDisponibles = [...fechaHorariosNodispo.horariosNoDisponibles];
                return instanciaReconstruida;
            }
            return fechaHorariosNodispo;
        });
        
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
                    throw new ValidationError("Horario ya está reservado para la fecha especificada.    ");
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
                // Asegurar que es una instancia de FechaHorariosNoDisponibles
                if (!(fechaHorariosNodispo instanceof FechaHorariosNoDisponibles)) {
                    // Si no es una instancia, usar eliminación manual
                    const index = fechaHorariosNodispo.horariosNoDisponibles.indexOf(fechaHorarioTurno.horario);
                    if (index > -1) {
                        fechaHorariosNodispo.horariosNoDisponibles.splice(index, 1);
                    }
                } else {
                    // Si es una instancia, usar el método
                    fechaHorariosNodispo.eliminarHorarioNoDisponible(fechaHorarioTurno.horario);
                }
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

    incrementarReservas() {
        this.cantidadReservas += 1;
    }

    decrementarReservas() {
        if (this.cantidadReservas > 0) {
            this.cantidadReservas -= 1;
        }
    }
}