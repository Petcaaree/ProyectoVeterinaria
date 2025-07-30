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