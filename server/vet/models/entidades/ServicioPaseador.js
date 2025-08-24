import { EstadoServicio } from "./enums/enumEstadoServicio.js";
import { FechaHorarioTurno } from "./FechaHorarioTurno.js";
import { FechaHorariosNoDisponiblesPaseador } from "./FechaHorariosNoDisponiblesPaseador.js";
import { NotFoundError, ValidationError } from "../../errors/AppError.js";
import { error } from "console";



export class ServicioPaseador{

    constructor(usuarioProveedor, nombreServicio, precio, descripcion, duracionMinutos, nombreContacto, emailContacto, telefonoContacto, diasDisponibles, horariosDisponibles, direccion, maxPerros)  {
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
        this.fechaCreacion = new Date(); // Fecha de creación del servicio
        this.cantidadReservas = 0; // Cantidad de reservas realizadas
        this.maxPerros = maxPerros ?? 1; // Cantidad máxima de perros por paseo
    }

    actualizarPrecio(nuevoPrecio) {
        this.precio = nuevoPrecio;
    }

    actualizarDuracion(nuevaDuracion) {
        this.duracion = nuevaDuracion;
    }

    estaDisponibleParaFechaYHorario(fechaHorarioTurno) {
        for (const fechaHorariosNodispo of this.fechasNoDisponibles) {
            // Comparar solo la fecha (año-mes-día) ignorando hora
            const fechaBuscada = new Date(fechaHorarioTurno.fecha).toISOString().split('T')[0];
            const fechaAlmacenada = new Date(fechaHorariosNodispo.fecha).toISOString().split('T')[0];
            if (fechaBuscada === fechaAlmacenada) {
                if (Array.isArray(fechaHorariosNodispo.horariosNoDisponibles)) {
                    const horarioObj = fechaHorariosNodispo.horariosNoDisponibles.find(h => h.horario === fechaHorarioTurno.horario);
                    if (horarioObj && horarioObj.perrosReservados >= this.maxPerros) {
                        return false; // El máximo de perros para ese horario ya fue alcanzado
                    }
                }
            }
        }
        return true; // Si no se encontró ninguna coincidencia, está disponible
    }

    agregarFechasReserva(fechaHorarioTurno) {
        if (!(fechaHorarioTurno instanceof FechaHorarioTurno)) {
            throw new Error("Se esperaba una instancia de FechaHorarioTurno");
        }
        const fechaBuscada = new Date(fechaHorarioTurno.fecha).toISOString().split('T')[0];
        let idx = this.fechasNoDisponibles.findIndex(fechaHorariosNodispo => {
            const fechaAlmacenada = new Date(fechaHorariosNodispo.fecha).toISOString().split('T')[0];
            return fechaBuscada === fechaAlmacenada;
        });
        if (idx !== -1) {
            // Ya existe la fecha, buscar el horario
            let horarios = this.fechasNoDisponibles[idx].horariosNoDisponibles;
            let horarioObj = horarios.find(h => h.horario === fechaHorarioTurno.horario);
            if (horarioObj) {
                // Sumar el contador
                horarioObj.perrosReservados = Number.isInteger(horarioObj.perrosReservados) ? horarioObj.perrosReservados + 1 : 1;
            } else {
                // Agregar nuevo horario
                horarios.push({ horario: fechaHorarioTurno.horario, perrosReservados: 1 });
            }
        } else {
            // Nueva fecha, agregar con el horario
            this.fechasNoDisponibles.push({
                fecha: fechaHorarioTurno.fecha,
                horariosNoDisponibles: [{ horario: fechaHorarioTurno.horario, perrosReservados: 1 }]
            });
        }
        // Limpiar fechas que hayan quedado sin horarios (por si acaso)
        this.fechasNoDisponibles = this.fechasNoDisponibles.filter(fecha => Array.isArray(fecha.horariosNoDisponibles) && fecha.horariosNoDisponibles.length > 0);
        console.log('[agregarFechasReserva] Estado final fechasNoDisponibles:', JSON.stringify(this.fechasNoDisponibles, null, 2));
    }
    

    cancelarHorarioReserva(fechaHorarioTurno) {
        const fechaBuscada = new Date(fechaHorarioTurno.fecha).toISOString().split('T')[0];
        let idx = this.fechasNoDisponibles.findIndex(fechaHorariosNodispo => {
            const fechaAlmacenada = new Date(fechaHorariosNodispo.fecha).toISOString().split('T')[0];
            return fechaBuscada === fechaAlmacenada;
        });
        if (idx !== -1) {
            let horarios = this.fechasNoDisponibles[idx].horariosNoDisponibles;
            let horarioObj = horarios.find(h => h.horario === fechaHorarioTurno.horario);
            if (horarioObj) {
                if (horarioObj.perrosReservados > 1) {
                    horarioObj.perrosReservados -= 1;
                } else {
                    // Eliminar el horario si el contador llega a 0
                    this.fechasNoDisponibles[idx].horariosNoDisponibles = horarios.filter(h => h.horario !== fechaHorarioTurno.horario);
                }
            }
        }
        // Limpiar fechas que hayan quedado sin horarios
        this.fechasNoDisponibles = this.fechasNoDisponibles.filter(fecha => Array.isArray(fecha.horariosNoDisponibles) && fecha.horariosNoDisponibles.length > 0);
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