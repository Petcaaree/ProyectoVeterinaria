export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  age: number;
  weight: number;
  cliente: string;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador';
  pets: Pet[];
}

export interface VeterinaryService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  availableHours: string[];
}

export interface VeterinaryClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  services: VeterinaryService[];
  calificacionPromedio?: number;
  cantidadResenas?: number;
  // En listados públicos el backend ya filtra a vets verificadas. Si llega informado,
  // solo puede ser 'VERIFICADO'. Si está ausente, también asumimos verificada.
  estadoVerificacion?: 'VERIFICADO';
}

export interface WalkerService {
  id: string;
  name: string;
  experience: number;
  pricePerHour: number;
  availability: string[];
  areas: string[];
  rating: number;
}

export interface CaregiverService {
  id: string;
  name: string;
  experience: number;
  pricePerDay: number;
  services: string[];
  availability: string[];
  rating: number;
}

// ─── Payloads reales del backend (DTOs) ─────────────────────────
interface DireccionBackend {
  calle?: string;
  altura?: string;
  localidad?: {
    nombre?: string;
    ciudad?: { nombre?: string } | string;
  };
}

interface ServicioProveedorBase {
  id: string;
  nombreServicio: string;
  descripcion: string;
  precio: number;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string;
  diasDisponibles: string[];
  direccion?: DireccionBackend;
  estado: 'Activada' | 'Desactivada';
  cantidadReservas?: number;
  calificacionPromedio?: number;
  cantidadResenas?: number;
}

export interface ServicioPaseadorDTO extends ServicioProveedorBase {
  duracionMinutos: number;
  horariosDisponibles: string[];
  maxPerros: number;
}

export interface ServicioCuidadorDTO extends ServicioProveedorBase {
  mascotasAceptadas: string[];
}

export interface Booking {
  id: string;
  userId: string;
  petId: string;
  serviceId: string;
  serviceType: 'veterinaria' | 'paseador' | 'cuidador';
  date: string;
  time?: string;
  duration?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}