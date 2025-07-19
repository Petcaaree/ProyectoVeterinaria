import { EstadoServicio } from "./enums/enumEstadoServicio.js";

export class ServicioCuidador{

    constructor(usuarioProveedor, nombreServicio, precio, descripcion, nombreContacto, emailContacto, telefonoContacto, diasDisponibles, mascotasAceptadas)  {
        this.usuarioProveedor = usuarioProveedor; // Referencia al cuidador o veterinario
        this.nombreServicio = nombreServicio; // Nombre del servicio
        this.precio = precio; // Precio del servicio
        this.descripcion = descripcion; // Descripción del servicio
        this.nombreContacto = nombreContacto; // Nombre del contacto
        this.emailContacto = emailContacto; // Email del contacto
        this.telefonoContacto = telefonoContacto; // Teléfono del contacto
        this.fechasNoDisponibles = []; // Fechas no disponibles para el servicio
        this.diasDisponibles = diasDisponibles ; // Días disponibles para el servicio
        this.mascotasAceptadas = mascotasAceptadas; // Lista de tipos de mascotas aceptadas
        this.estado = EstadoServicio.ACTIVO; // Estado del servicio (ACTIVO o DESACTIVADO)
    }

    actualizarPrecio(nuevoPrecio) {
        this.precio = nuevoPrecio;
    }

    actualizarDuracion(nuevaDuracion) {
        this.duracion = nuevaDuracion;
    }

    estasDisponibleEn(rangoFecha) {
        return this.fechasNoDisponibles.every(f => {
        let fecha = new RangoFechas(f.fechaInicio, f.fechaFin)
        return !(rangoFecha.fechaInicio <= fecha.fechaFin && 
                rangoFecha.fechaFin >= fecha.fechaInicio);
        })
    } 

    cancelarFechaReservas(rangoFecha) {
        // Eliminar de las fechas no disponibles las que coincidan exactamente con el rangoFecha
        this.fechasNoDisponibles = this.fechasNoDisponibles.filter(f => {
            return !(f.fechaInicio === rangoFecha.fechaInicio && f.fechaFin === rangoFecha.fechaFin);
        });
    }

    cambioEstadoServicio(nuevoEstado) {
        if (nuevoEstado === EstadoServicio.ACTIVO || nuevoEstado === EstadoServicio.DESACTIVADO) {
            this.estado = nuevoEstado;
        } else {
            throw new Error("Estado inválido. Debe ser ACTIVO o DESACTIVADO.");
        }
    }
}