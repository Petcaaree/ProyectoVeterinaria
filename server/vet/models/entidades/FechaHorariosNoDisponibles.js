export class FechaHorariosNoDisponibles {
  constructor(fecha) {
    this.fecha = fecha; // Fecha en formato YYYY-MM-DD
    this.horariosNoDisponibles = []; // Horario de inicio en formato HH:MM
   } // Duración en minutos}

  
   
  agregarHorarioNoDisponible(horario) {
    if (!this.horariosNoDisponibles.includes(horario)) {
      this.horariosNoDisponibles.push(horario);
    }
  }

  eliminarHorarioNoDisponible(horario) {
    const index = this.horariosNoDisponibles.indexOf(horario);
    if (index > -1) {
      this.horariosNoDisponibles.splice(index, 1);
    }
  }


}