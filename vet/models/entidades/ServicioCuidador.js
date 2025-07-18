

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
}