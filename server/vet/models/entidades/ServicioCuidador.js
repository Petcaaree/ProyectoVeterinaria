import { EstadoServicio } from "./enums/enumEstadoServicio.js";
import { RangoFechas } from "./RangoFechas.js";

export class ServicioCuidador{

    constructor(usuarioProveedor, nombreServicio, precio, descripcion, nombreContacto, emailContacto, telefonoContacto, diasDisponibles, mascotasAceptadas, direccion)  {
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
        this.direccion = direccion; // Dirección del servicio
        this.fechaCreacion = new Date(); // Fecha de creación del servicio
        this.cantidadReservas = 0; // Cantidad de reservas realizadas
    }

    actualizarPrecio(nuevoPrecio) {
        this.precio = nuevoPrecio;
    }

    actualizarDuracion(nuevaDuracion) {
        this.duracion = nuevaDuracion;
    }

    agregarFechasReserva(rangoFecha) {
    if (!(rangoFecha instanceof RangoFechas)) {
      throw new Error("Se esperaba una instancia de RangoFechas");
    }
    this.fechasNoDisponibles.push(rangoFecha)
  }

  eliminarFechasReserva(rangoFecha) {
    const index = this.fechasNoDisponibles.findIndex(r => 
      r.fechaInicio.getTime() === rangoFecha.fechaInicio.getTime() && 
      r.fechaFin.getTime() === rangoFecha.fechaFin.getTime()
    );

    if (index !== -1) {
      this.fechasNoDisponibles.splice(index, 1);
    }
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

    incrementarReservas() {
        this.cantidadReservas += 1;
    }

    decrementarReservas() {
        if (this.cantidadReservas > 0) {
            this.cantidadReservas -= 1;
        }
    }
}