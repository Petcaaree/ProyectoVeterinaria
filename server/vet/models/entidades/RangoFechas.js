export class RangoFechas {
  constructor(fechaInicio, fechaFin) {
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
  }

  seSuperponeCon(nuevoRango, rangoExistente) {
    return nuevoRango.fechaInicio <= rangoExistente.fechaFin && nuevoRango.fechaFin >= rangoExistente.fechaInicio;
  }
}

