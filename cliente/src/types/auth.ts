import type { DatosMascota, DatosServicioVeterinario, DatosServicioPaseador, DatosServicioCuidador } from '../api/api';

interface Localidad {
  nombre: string;
  ciudad: string; // Nombre de la ciudad, no ObjectId
}

interface Direccion {
  calle?: string;
  altura?: number;
  localidad?: Localidad; // Objeto localidad con nombre y ciudad
}

interface Mascota {
  _id: string;
  nombre: string;
  edad: number;
  tipo: string;
  raza?: string;
  peso?: number;
  fotos?: string[];
}

interface Notificacion {
  _id: string;
  mensaje: string;
  fechaAlta: string; // ISO string date
  leida: boolean;
  fechaLeida: string | null;
}

export interface Usuario {
  id: string;
  nombreUsuario: string;
  email: string;
  telefono: string;
  direccion: Direccion;
  notificaciones: Notificacion[];
  mascotas?: Mascota[]; // Solo para clientes
  nombreClinica?: string; // Solo para veterinarias
}

export interface AuthContextType {
  usuario: Usuario | null;
  tipoUsuario: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  login: (usuarioData: Usuario, tipo: string) => void;
  loginWithCredentials: (email: string, contrasenia: string, tipoUsuario: string) => Promise<Usuario>;
  registerWithCredentials: (
    nombreUsuario: string, 
    email: string, 
    contrasenia: string, 
    telefono: string, 
    direccion: {
      calle: string;
      altura: string;
      localidad: {
        nombre: string;
        ciudad: {
          nombre: string;
        }
      };
    }, 
    tipoUsuario: string,
    nombreClinica?: string // Parámetro opcional para veterinarias
  ) => Promise<Usuario>;
  registroMascota: ((usuarioId: string, datosMascota: DatosMascota) => Promise<Mascota>);
  getMascotas: (usuarioId: string) => Promise<Mascota[]>;
  deleteMascota: (usuarioId: string, mascotaId: string) => Promise<void>;
  createServicioVeterinario: (data: DatosServicioVeterinario) => Promise<any>;
  createServicioPaseador: (data: DatosServicioPaseador) => Promise<any>;
  createServicioCuidador: (data: DatosServicioCuidador) => Promise<any>;
  getServiciosVeterinaria: (usuarioId: string, page: number, estado: string) => Promise<any[]>;
   getServiciosPaseador: (usuarioId: string, page: number, estado: string) => Promise<any[]>;
   getServiciosCuidador: (usuarioId: string, page: number, estado: string) => Promise<any[]>;
   activarOdesactivarServicio: (serviceId: string,  estado: string, tipoUsuario: string) => Promise<void>;
   getServiciosCuidadores: (page: number, filtro: any) => Promise<any[]>;
   getServiciosPaseadores: (page: number, filtro: any) => Promise<any[]>;
   getServiciosVeterinarias: (page: number, filtro: any) => Promise<any[]>;
   crearReserva: (datos: any) => Promise<any>;
    obtenerTodasLasReservas: (usuarioId: string, userType: string, page: number) => Promise<any[]>;
   getNotificationes: (usuarioId: string, userType:string,  page: number ) => Promise<any[]>;
   getNotificacionesNoLeidas: (usuarioId: string , leida : string, userType:string,  page: number) => Promise<any[]>;
   marcarLeidaDelCliente: (usuarioId: string, notificacionId: string) => Promise<void>;
   marcarLeidaDelProveedor: (usuarioId: string, notificacionId: string, tipoProveedor: string) => Promise<void>;
   marcarTodasLeidasDelProveedor: (usuarioId: string, tipoProveedor: string) => Promise<void>;
   marcarTodasLeidasDelCliente: (usuarioId: string) => Promise<void>;
   // Contador de notificaciones no leídas
   contadorNotificacionesNoLeidas: number;
   cargarContadorNotificaciones: () => Promise<void>;
   actualizarContadorNotificaciones: (nuevoContador: number) => void;
   decrementarContadorNotificaciones: () => void;
   incrementarContadorNotificaciones: () => void;
   /* getReservas: (usuarioId: string, tipoUsuario: string, page: number) => Promise<any[]>;
  getReservasById: (reservaId: string) => Promise<any>;
  getReservasByMascota: (mascotaId: string) => Promise<any[]>;
  getReservasByServicio: (servicioId: string, tipoServicio: string) => Promise<any[]>;
  getNotificaciones: (usuarioId: string) => Promise<Notificacion[]>;
  marcarNotificacionLeida: (notificacionId: string) => Promise<void>; */
  logout: () => void;
  cambiarTipoUsuario: (tipo: string) => void;
}
