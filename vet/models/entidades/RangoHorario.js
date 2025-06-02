export class RangoHorario{
    constructor(horaInicio, horaFin) {
        this.horaInicio = horaInicio; // Date
        this.horaFin = horaFin; // Date
    }

    contieneHora(hora) {
        return hora >= this.horaInicio && hora <= this.horaFin;
    }

    superponeCon(rango) {
        return this.horaInicio < rango.horaFin && rango.horaInicio < this.horaFin;
    }

    toString() {
        return `${this.horaInicio.toLocaleTimeString()} - ${this.horaFin.toLocaleTimeString()}`;
    }

}
