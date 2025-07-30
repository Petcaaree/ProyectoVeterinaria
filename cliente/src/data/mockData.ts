import { VeterinaryService, WalkerService, CaregiverService, Pet } from '../types';

export const veterinaryClinics = [
  {
    id: '1',
    name: 'Clínica Veterinaria San Martín',
    address: 'Carrera 15 #85-32, Chapinero',
    phone: '+57 301 234 5678',
    rating: 4.8,
    services: [
      {
        id: '1',
        name: 'Baño y Aseo Completo',
        description: 'Baño completo con champú especial, secado, corte de uñas y limpieza de oídos',
        price: 25000,
        duration: 90,
        availableHours: ['9:00', '11:00', '14:00', '16:00']
      },
      {
        id: '2',
        name: 'Vacunación',
        description: 'Aplicación de vacunas según el plan de vacunación de tu mascota',
        price: 35000,
        duration: 30,
        availableHours: ['9:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      },
      {
        id: '3',
        name: 'Control Veterinario',
        description: 'Chequeo general, peso, temperatura y examen físico completo',
        price: 40000,
        duration: 45,
        availableHours: ['9:00', '10:30', '14:00', '15:30']
      }
    ]
  },
  {
    id: '2',
    name: 'Veterinaria Pet Health',
    address: 'Calle 93 #11-27, Zona Rosa',
    phone: '+57 302 345 6789',
    rating: 4.9,
    services: [
      {
        id: '4',
        name: 'Desparasitación',
        description: 'Tratamiento antiparasitario interno y externo',
        price: 28000,
        duration: 20,
        availableHours: ['9:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
      },
      {
        id: '5',
        name: 'Cirugía Menor',
        description: 'Procedimientos quirúrgicos ambulatorios',
        price: 120000,
        duration: 120,
        availableHours: ['8:00', '10:00', '14:00']
      },
      {
        id: '6',
        name: 'Radiografías',
        description: 'Estudios radiológicos para diagnóstico',
        price: 65000,
        duration: 30,
        availableHours: ['9:00', '11:00', '14:00', '16:00']
      }
    ]
  },
  {
    id: '3',
    name: 'Centro Veterinario Integral',
    address: 'Avenida 19 #104-62, Usaquén',
    phone: '+57 303 456 7890',
    rating: 4.7,
    services: [
      {
        id: '7',
        name: 'Odontología Veterinaria',
        description: 'Limpieza dental y tratamientos odontológicos',
        price: 85000,
        duration: 60,
        availableHours: ['9:00', '11:00', '15:00']
      },
      {
        id: '8',
        name: 'Ecografías',
        description: 'Estudios ecográficos para diagnóstico',
        price: 75000,
        duration: 45,
        availableHours: ['10:00', '14:00', '16:00']
      },
      {
        id: '9',
        name: 'Hospitalización',
        description: 'Cuidado intensivo y monitoreo 24/7',
        price: 150000,
        duration: 1440, // 24 horas en minutos
        availableHours: ['24/7']
      }
    ]
  }
];

export const veterinaryServices: VeterinaryService[] = [
  {
    id: '1',
    name: 'Baño y Aseo Completo',
    description: 'Baño completo con champú especial, secado, corte de uñas y limpieza de oídos',
    price: 25000,
    duration: 90,
    availableHours: ['9:00', '11:00', '14:00', '16:00']
  },
  {
    id: '2',
    name: 'Vacunación',
    description: 'Aplicación de vacunas según el plan de vacunación de tu mascota',
    price: 35000,
    duration: 30,
    availableHours: ['9:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  },
  {
    id: '3',
    name: 'Control Veterinario',
    description: 'Chequeo general, peso, temperatura y examen físico completo',
    price: 40000,
    duration: 45,
    availableHours: ['9:00', '10:30', '14:00', '15:30']
  },
  {
    id: '4',
    name: 'Desparasitación',
    description: 'Tratamiento antiparasitario interno y externo',
    price: 28000,
    duration: 20,
    availableHours: ['9:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
  }
];

export const walkerServices: WalkerService[] = [
  {
    id: '1',
    name: 'María González',
    experience: 3,
    pricePerHour: 15000,
    availability: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    areas: ['Chapinero', 'Zona Rosa', 'Chicó'],
    rating: 4.8
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    experience: 5,
    pricePerHour: 18000,
    availability: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    areas: ['La Candelaria', 'Centro', 'Teusaquillo'],
    rating: 4.9
  },
  {
    id: '3',
    name: 'Ana López',
    experience: 2,
    pricePerHour: 12000,
    availability: ['Martes', 'Jueves', 'Sábado', 'Domingo'],
    areas: ['Suba', 'Engativá', 'Fontibón'],
    rating: 4.6
  }
];

export const caregiverServices: CaregiverService[] = [
  {
    id: '1',
    name: 'Pet Care Premium',
    experience: 8,
    pricePerDay: 80000,
    services: ['Alimentación', 'Paseos', 'Medicación', 'Compañía 24/7'],
    availability: ['Lunes a Domingo'],
    rating: 4.9
  },
  {
    id: '2',
    name: 'Cuidado Especializado',
    experience: 6,
    pricePerDay: 65000,
    services: ['Alimentación', 'Paseos', 'Juegos', 'Cuidado básico'],
    availability: ['Lunes a Viernes'],
    rating: 4.7
  },
  {
    id: '3',
    name: 'Hogar Temporal',
    experience: 4,
    pricePerDay: 50000,
    services: ['Alimentación', 'Paseos', 'Cuidado diurno'],
    availability: ['Fines de semana', 'Vacaciones'],
    rating: 4.5
  }
];

export const samplePets: Pet[] = [
  {
    id: '1',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28,
    cliente: 'Juan Pérez'
  },
  {
    id: '2',
    name: 'Luna',
    species: 'cat',
    breed: 'Siamés',
    age: 2,
    weight: 4,
    cliente: 'María García'
  },
  {
    id: '3',
    name: 'Rocky',
    species: 'dog',
    breed: 'Bulldog Francés',
    age: 1,
    weight: 12,
    cliente: 'Carlos López'
  }
];