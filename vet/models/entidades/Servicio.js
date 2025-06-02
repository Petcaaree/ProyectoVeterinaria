

export class Servicio{

    constructor(tipoServicio, precio, duracionMinutos) {
        this.tipoServicio = tipoServicio; // TipoServicio
        this.precio = precio; // number
        this.duracion = duracionMinutos; // number
    }

    actualizarPrecio(nuevoPrecio) {
        this.precio = nuevoPrecio;
    }

    actualizarDuracion(nuevaDuracion) {
        this.duracion = nuevaDuracion;
    }
}