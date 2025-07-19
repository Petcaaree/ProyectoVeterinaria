export class FechaHorarioTurno {
  constructor(fecha, horario) {
    this.fecha = fecha; // Fecha en formato YYYY-MM-DD
    this.horario = horario; // Horario de inicio en formato HH:MM
   } // Duración en minutos}

  seSuperponeConElHorario(fechaHorarioNueva, fechaHorarioExistente, duracionEnMinutos) {
    const inicioNueva = new Date(`${fechaHorarioNueva.fecha}T${fechaHorarioNueva.horario}`);
    const finNueva = new Date(inicioNueva.getTime() + duracionEnMinutos * 60000);
    const inicioExistente = new Date(`${fechaHorarioExistente.fecha}T${fechaHorarioExistente.horario}`);
    const finExistente = new Date(inicioExistente.getTime() + duracionEnMinutos * 60000);
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