export class FechaHorariosNoDisponiblesPaseador {
  constructor(fecha) {
    this.fecha = fecha; // Fecha en formato YYYY-MM-DD
    // Array de objetos: { horario: string, perrosReservados: number }
    this.horariosNoDisponibles = [];
  }

  agregarHorarioNoDisponible(horario) {
    console.log('[FechaHorariosNoDisponiblesPaseador][agregarHorarioNoDisponible] Estado antes:', JSON.stringify(this.horariosNoDisponibles));
    const existente = this.horariosNoDisponibles.find(h => h.horario === horario);
    if (existente) {
      // Solo suma 1 al valor actual, nunca reinicia
      existente.perrosReservados = Number.isInteger(existente.perrosReservados) ? existente.perrosReservados + 1 : 1;
      console.log(`[FechaHorariosNoDisponiblesPaseador][agregarHorarioNoDisponible] Horario ya existe (${horario}), nuevo perrosReservados:`, existente.perrosReservados);
    } else {
      this.horariosNoDisponibles.push({ horario, perrosReservados: 1 });
      console.log(`[FechaHorariosNoDisponiblesPaseador][agregarHorarioNoDisponible] Horario nuevo agregado:`, horario);
    }
    console.log('[FechaHorariosNoDisponiblesPaseador][agregarHorarioNoDisponible] Estado después:', JSON.stringify(this.horariosNoDisponibles));
  }

  eliminarHorarioNoDisponible(horario) {
    const index = this.horariosNoDisponibles.findIndex(h => h.horario === horario);
    if (index > -1) {
      if (this.horariosNoDisponibles[index].perrosReservados > 1) {
        this.horariosNoDisponibles[index].perrosReservados -= 1;
      } else {
        this.horariosNoDisponibles.splice(index, 1);
      }
    }
  }
}
