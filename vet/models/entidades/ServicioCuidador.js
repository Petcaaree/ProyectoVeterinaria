

export class ServicioCuidador{

    constructor(usuarioProveedor, nombreServicio, precio, descripcion, nombreContacto, emailContacto, telefonoContacto, rangoFechasDisponibles, mascotasAceptadas)  {
        this.usuarioProveedor = usuarioProveedor; // Referencia al cuidador o veterinario
        this.nombreServicio = nombreServicio; // Nombre del servicio
        this.precio = precio; // Precio del servicio
        this.descripcion = descripcion; // Descripción del servicio
        this.nombreContacto = nombreContacto; // Nombre del contacto
        this.emailContacto = emailContacto; // Email del contacto
        this.telefonoContacto = telefonoContacto; // Teléfono del contacto
        this.duracionMinutos = duracionMinutos; // Duración del servicio en minutos
        this.fechasNoDisponibles = []; // Fechas no disponibles para el servicio
        this.rangoFechasDisponibles = rangoFechasDisponibles ; // Días disponibles para el servicio
        this.mascotasAceptadas = mascotasAceptadas; // Lista de tipos de mascotas aceptadas

    }

    actualizarPrecio(nuevoPrecio) {
        this.precio = nuevoPrecio;
    }

    actualizarDuracion(nuevaDuracion) {
        this.duracion = nuevaDuracion;
    }
}