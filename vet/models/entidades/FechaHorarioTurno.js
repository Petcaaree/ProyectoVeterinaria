export class FechaHorarioTurno {
  constructor(fecha, horarioInicio, duracionEnMinutos) {
    this.fecha = fecha; // Fecha en formato YYYY-MM-DD
    this.horarioInicio = horarioInicio; // Horario de inicio en formato HH:MM
    this.duracionEnMinutos = duracionEnMinutos;
   } // Duración en minutos}

  seSuperponeConElHorario(fechaHorarioNueva, fechaHorarioExistente) {
    const inicioNueva = new Date(`${fechaHorarioNueva.fecha}T${fechaHorarioNueva.horarioInicio}`);
    const finNueva = new Date(inicioNueva.getTime() + fechaHorarioNueva.duracionEnMinutos * 60000);
    const inicioExistente = new Date(`${fechaHorarioExistente.fecha}T${fechaHorarioExistente.horarioInicio}`);
    const finExistente = new Date(inicioExistente.getTime() + fechaHorarioExistente.duracionEnMinutos * 60000);
    // Verifica si los horarios se superponen
    if (inicioNueva.getTime() === finExistente.getTime() || finNueva.getTime() === inicioExistente.getTime()) {
      return false; // No se superponen si son iguales
    }

    // Verifica si hay superposición
    if (inicioNueva.getTime() > finExistente.getTime() || finNueva.getTime() < inicioExistente.getTime()) {
      return false; // No hay superposición
    }
    // Se verifica si el inicio de la nueva fecha es menor que el fin de la existente
    if (inicioNueva.getTime() < finExistente.getTime() && finNueva.getTime() > inicioExistente.getTime()) {
      return true; // Hay superposición
    }
    return false; // No hay superposición
    }
   
}