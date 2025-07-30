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
  id?: string;
  nombreUsuario: string;
  email: string;
  telefono: string;
  direccion: Direccion;
  notificaciones: Notificacion[];
  mascotas?: Mascota[]; // Solo para clientes
}

export interface AuthContextType {
  usuario: Usuario | null;
  tipoUsuario: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  login: (usuarioData: Usuario, tipo: string) => void;
  loginWithCredentials: (email: string, contrasenia: string, tipoUsuario: string) => Promise<Usuario>;
  registerWithCredentials: (nombre: string, apellido: string, email: string, contrasenia: string, tipoUsuario: string) => Promise<Usuario>;
  logout: () => void;
  cambiarTipoUsuario: (tipo: string) => void;
}
