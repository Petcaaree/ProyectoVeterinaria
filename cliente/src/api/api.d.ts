// Declaraciones de tipos para api.js

export interface FiltrosAlojamiento {
  [key: string]: any;
}

export interface DatosLogin {
  email: string;
  contrasenia: string;
}

export interface DatosRegistro {
  nombreUsuario: string;
  email: string;
  contrasenia: string;
  telefono: string;
  direccion: {
    calle: string;
    altura: string;
    localidad: {
      nombre: string;
      ciudad: {
        nombre: string;
      }
    }
  };
}

export interface DatosReserva {
  reservador: string;
  cantHuespedes: number;
  alojamiento: string;
  rangoFechas: any;
}

export interface DatosAlojamiento {
  anfitrion: string;
  nombre: string;
  descripcion: string;
  precioPorNoche: number;
  moneda: string;
  horarioCheckIn: string;
  horarioCheckOut: string;
  direccion: string;
  cantHuespedesMax: number;
  caracteristicas: string[];
  fotos: string[];
}

export interface DatosMascota {
  nombre: string;
  tipo: string;
  raza?: string | null;
  edad?: number | null;
  peso?: number | null;
  fotos: string[];
}

export interface DatosServicioVeterinario {
  idVeterinaria: string;
  nombreServicio: string;
  tipoServicio: string;
  duracionMinutos: number;
  precio: number;
  descripcion: string;
  nombreClinica: string;
  emailClinica: string;
  telefonoClinica: string;
  diasDisponibles: string[];
  horariosDisponibles: string[];
  mascotasAceptadas: string[];
  direccion: {
    calle: string;
    altura: number;
    localidad: {
      nombre: string;
      ciudad: {
        nombre: string;
      };
    };
  };
}

export interface DatosServicioPaseador {
  idPaseador: string;
  nombreServicio: string;
  duracionMinutos: number;
  precio: number;
  descripcion: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string;
  diasDisponibles: string[];
  horariosDisponibles: string[];
  direccion: {
    calle: string;
    altura: number;
    localidad: {
      nombre: string;
      ciudad: {
        nombre: string;
      };
    };
  };
}

export interface DatosServicioCuidador {
  idCuidador: string;
  nombreServicio: string;
  precio: number;
  descripcion: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string;
  diasDisponibles: string[];
  mascotasAceptadas: string[];
  direccion: {
    calle: string;
    altura: number;
    localidad: {
      nombre: string;
      ciudad: {
        nombre: string;
      };
    };
  };
}

export declare function getServiciosPaseadores(pageNumber: number, filtros?: any): Promise<any>;
export declare function getAlojamientos(pageNumber: number, filtros: FiltrosAlojamiento): Promise<any>;
export declare function getDestinos(pageNumber: number): Promise<any>;
export declare function loginUsuario(datos: DatosLogin, tipo: string): Promise<any>;
export declare function signinUsuario(datos: DatosRegistro, tipo: string): Promise<any>;
export declare function registrarMascota(usuarioId: string, datosMascota: DatosMascota): Promise<any>;
export declare function crearServiciooVeterinaria(data: DatosServicioVeterinario): Promise<any>;
export declare function crearServicioPaseador(data: DatosServicioPaseador): Promise<any>;
export declare function crearServicioCuidador(data: DatosServicioCuidador): Promise<any>;
export declare function obtenerMascotas(usuarioId: string): Promise<any>;
export declare function eliminarMascota(usuarioId: string, mascotaId: string): Promise<void>;

///-----OBTENER LOS SERVICIOS DE CADA PROVEEDOR-----
export declare function getServiciosVeterinariaByUsuario(usuarioId: string, page: number, estado: string): Promise<any[]>;
export declare function getServiciosPaseadorByUsuario(usuarioId: string, page: number, estado: string): Promise<any[]>;
export declare function getServiciosCuidadorByUsuario(usuarioId: string, page: number, estado: string): Promise<any[]>;

///-----ACTIVAR O DESACTIVAR LOS SERVICIOS -----
export declare function cambiarEstadoServicio(serviceId: string, estado: string, tipoUsuario: string): Promise<void>;

///-----OBTENER LOS SERVICIOS EN CADA PAGINA-----
export declare function obetenerServiciosCuidadores(page: number, filtro: any): Promise<any[]>;
export declare function obetenerServiciosPaseadores(page: number, filtro: any): Promise<any[]>;
export declare function obetenerServiciosVeterinarias(page: number, filtro: any): Promise<any[]>;

///-----RESERVAS-----
export declare function createReserva(datos: any): Promise<any>;
export declare function getTodasReservas(usuarioId: string,userType: string, estado: string, page: number): Promise<any>;
export declare function getReservasPorEstado(usuarioId: string,userType: string, estado: string, page: number): Promise<any>;

/// ---------NOTIFICACIONES----------
export declare function obtenerNotificacionesNoLeidas(usuarioId: string, leida: string, tipoUsuario: string, page: number): Promise<any>;
export declare function obtenerNotificaciones(usuarioId: string, tipoUsuario: string, page: number): Promise<any>;
export declare function marcarLeidaCliente(usuarioId: string, notificacionId: string): Promise<void>;
export declare function marcarLeidaProveedor(usuarioId: string, notificacionId: string, tipoProveedor: string): Promise<void>;
export declare function marcarTodasLeidasProveedor(usuarioId: string, tipoProveedor: string): Promise<void>;
export declare function marcarTodasLeidasCliente(usuarioId: string): Promise<void>;



export declare function reservarAlojamiento(datos: DatosReserva): Promise<any>;
export declare function getReservasHuesped(usuarioId: string, page: number): Promise<any>;
export declare function getAlojamientosAnfitrion(id: string, page?: number): Promise<any>;
export declare function getReservasAnfitrion(anfitrionId: string, page: number): Promise<any>;
export declare function confirmarReserva(anfitrionId: string, reservaId: string): Promise<void>;
export declare function cancelarReserva(huespedId: string, reservaId: string): Promise<void>;
export declare function getNotificacionesHuesped(usuarioId: string, leida: string, pageNumber: number): Promise<any>;
export declare function getNotificacionesAnfitrion(usuarioId: string, leida: string, pageNumber: number): Promise<any>;
export declare function marcarLeidaHuesped(usuarioId: string, notificacionId: string): Promise<void>;
export declare function marcarLeidaAnfitrion(usuarioId: string, notificacionId: string): Promise<void>;
export declare function crearAlojamiento(data: DatosAlojamiento): Promise<any>;
export declare function registrarMascota(clienteId: string, mascotaData: DatosMascota): Promise<any>;
