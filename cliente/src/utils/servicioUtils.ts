export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const VETERINARIA_SERVICE_TYPES = [
  'Control',
  'Vacunacion',
  'Baño',
  'Desparacitacion',
  'Cirugia',
  'Radiografia',
  'Ecografia',
  'Otro'
];

export const PET_TYPES = ['Perros', 'Gatos', 'Aves', 'Otros'];

export const sortDays = (days: string[]) => {
  const weekOrder = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  return days.slice().sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
};

export const sortTimes = (times: string[]) => {
  return times.slice().sort((a, b) => {
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });
};

export const generateTimeSlots = (duration: number) => {
  const duracionesValidas = [30, 60, 90, 120, 150, 180, 240, 300, 360, 420, 480];
  if (!duracionesValidas.includes(duration)) return [];
  const slots: string[] = [];
  const startHour = 10;
  const endHour = 20;
  const totalMinutes = (endHour - startHour) * 60;
  for (let minutes = 0; minutes < totalMinutes; minutes += duration) {
    const hour = Math.floor(minutes / 60) + startHour;
    const minute = minutes % 60;
    if (hour < endHour) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

export const normalizePetType = (value: string): string => {
  switch (value.toUpperCase()) {
    case 'PERROS': return 'PERRO';
    case 'GATOS': return 'GATO';
    case 'AVES': return 'AVE';
    case 'OTROS': return 'OTRO';
    default: return value.toUpperCase();
  }
};

export const normalizeDay = (value: string): string => {
  const dia = value.toUpperCase();
  if (dia === 'SÁBADO') return 'SABADO';
  if (dia === 'MIÉRCOLES') return 'MIERCOLES';
  return dia;
};

export const petKeyFromLabel = (pet: string): string => {
  switch (pet.toUpperCase()) {
    case 'PERROS': return 'PERRO';
    case 'GATOS': return 'GATO';
    case 'AVES': return 'AVE';
    case 'OTROS': return 'OTRO';
    default: return pet.toUpperCase();
  }
};
