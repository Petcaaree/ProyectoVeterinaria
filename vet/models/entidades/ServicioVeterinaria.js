

export class ServicioVeterinaria{

    constructor(usuarioProveedor, nombreServicio,tipoServicio, precio, descripcion,  duracionMinutos, nombreClinica, diasDisponibles, horariosDisponibles, mascotasAceptadas)  {
        this.usuarioProveedor = usuarioProveedor; // Referencia al cuidador o veterinario
        this.nombreServicio = nombreServicio; // Nombre del servicio
        this.tipoServicio = tipoServicio; // Tipo de servicio (Control, Vacunación, Baño)
        this.precio = precio; // Precio del servicio
        this.descripcion = descripcion; // Descripción del servicio
        this.duracionMinutos = duracionMinutos; // Duración del servicio en minutos
        this.nombreClinica = nombreClinica; // Nombre de la clínica veterinaria 
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
}