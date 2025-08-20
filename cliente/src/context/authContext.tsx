import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import {marcarTodasLeidasProveedor, marcarTodasLeidasCliente,marcarLeidaProveedor, marcarLeidaCliente,getTodasReservas, obtenerNotificacionesNoLeidas,obtenerNotificaciones, obtenerContadorNotificacionesNoLeidas, createReserva, obetenerServiciosCuidadores,obetenerServiciosPaseadores,obetenerServiciosVeterinarias,DatosMascota,DatosServicioVeterinario,DatosServicioPaseador,DatosServicioCuidador, loginUsuario, signinUsuario, registrarMascota, obtenerMascotas, eliminarMascota , crearServiciooVeterinaria, crearServicioPaseador, crearServicioCuidador, getServiciosVeterinariaByUsuario, getServiciosPaseadorByUsuario, getServiciosCuidadorByUsuario, cambiarEstadoServicio} from '../api/api.js';
import type { AuthContextType, Usuario } from '../types/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizado para usar el contexto de manera segura
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null>(null);
  const [contadorNotificacionesNoLeidas, setContadorNotificacionesNoLeidas] = useState<number>(0);

  const isValidUserType = (tipo: string): tipo is 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' => {
    return ['cliente', 'veterinaria', 'paseador', 'cuidador'].includes(tipo);
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const tipoGuardado = localStorage.getItem('tipoUsuario');

    if (usuarioGuardado && usuarioGuardado !== 'undefined') {
      try {
        const userParsed = JSON.parse(usuarioGuardado);
        setUsuario(userParsed);
        if (tipoGuardado && isValidUserType(tipoGuardado)) {
          setTipoUsuario(tipoGuardado);
          
          // Cargar contador de notificaciones desde el backend
          obtenerContadorNotificacionesNoLeidas(userParsed.id, tipoGuardado)
            .then(contador => {
              setContadorNotificacionesNoLeidas(contador);
            })
            .catch(error => {
              console.error('Error al cargar contador de notificaciones al inicializar:', error);
              // Sin fallback, mantenemos el contador en 0 si falla el backend
              setContadorNotificacionesNoLeidas(0);
            });
        } else if (userParsed?.tipo && isValidUserType(userParsed.tipo)) {
          setTipoUsuario(userParsed.tipo);
          
          // Cargar contador de notificaciones desde el backend
          obtenerContadorNotificacionesNoLeidas(userParsed.id, userParsed.tipo)
            .then(contador => {
              setContadorNotificacionesNoLeidas(contador);
            })
            .catch(error => {
              console.error('Error al cargar contador de notificaciones al inicializar:', error);
              // Sin fallback, mantenemos el contador en 0 si falla el backend
              setContadorNotificacionesNoLeidas(0);
            });
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('usuario');
        localStorage.removeItem('tipoUsuario');
      }
    }
  }, []);

  // Efecto comentado - ahora usamos solo el contador del backend
  // useEffect(() => {
  //   if (usuario?.notificaciones) {
  //     const noLeidas = usuario.notificaciones.filter(notif => !notif.leida).length;
  //     setContadorNotificacionesNoLeidas(noLeidas);
  //   } else {
  //     setContadorNotificacionesNoLeidas(0);
  //   }
  // }, [usuario?.notificaciones]);

  const login = async (usuarioData: Usuario, tipo: string) => {
    setUsuario(usuarioData);
    if (isValidUserType(tipo)) {
      setTipoUsuario(tipo);
    }
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    localStorage.setItem('tipoUsuario', tipo);
    
    // Cargar contador de notificaciones después del login
    try {
      const contador = await obtenerContadorNotificacionesNoLeidas(usuarioData.id, tipo);
      setContadorNotificacionesNoLeidas(contador);
    } catch (error) {
      console.error('Error al cargar contador de notificaciones tras login:', error);
    }
  };

  const loginWithCredentials = async (email: string, contrasenia: string, tipoUsuario: string): Promise<Usuario> => {
    try {
      const response = await loginUsuario({ email, contrasenia }, tipoUsuario);
      const usuarioCompleto = response.data;
      
      setUsuario(usuarioCompleto);
      if (isValidUserType(tipoUsuario)) {
        setTipoUsuario(tipoUsuario);
      }
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      localStorage.setItem('tipoUsuario', tipoUsuario);
      
      // Cargar contador de notificaciones después del login
      try {
        const contador = await obtenerContadorNotificacionesNoLeidas(usuarioCompleto.id, tipoUsuario);
        setContadorNotificacionesNoLeidas(contador);
      } catch (counterError) {
        console.error('Error al cargar contador de notificaciones tras login:', counterError);
      }
      
      return usuarioCompleto;
    } catch (error) {
      console.error('Error en login:', error);
      
      // Propagar el error con un mensaje más claro
      if (error instanceof Error) {
        throw error; // Ya tiene un mensaje apropiado de api.js
      }
      
      // Error inesperado
      throw new Error('Error inesperado al iniciar sesión. Intenta nuevamente.');
    }
  };

 
  const registerWithCredentials = async (
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
  ): Promise<Usuario> => {
    try {
      const datosRegistro: any = { nombreUsuario, email, contrasenia, telefono, direccion };
      
      // Si es veterinaria y se proporciona nombreClinica, agregarlo
      if (tipoUsuario === 'veterinaria' && nombreClinica) {
        datosRegistro.nombreClinica = nombreClinica;
      }

      const response = await signinUsuario(datosRegistro, tipoUsuario);
      const usuarioCompleto = response.data;

      console.log('Usuario registrado:', usuarioCompleto);
      
      setUsuario(usuarioCompleto);
      if (isValidUserType(tipoUsuario)) {
        setTipoUsuario(tipoUsuario);
      }
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      localStorage.setItem('tipoUsuario', tipoUsuario);
      
      return usuarioCompleto;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const registroMascota = async (idUsuario: string, datosMascota: DatosMascota) => {
    if (!usuario?.id) {
      throw new Error('No se pudo obtener la información del usuario.');
    }

    try {
      const response = await registrarMascota(idUsuario, datosMascota);
      return response.data;
    } catch (error) {
      console.error('Error al registrar mascota:', error);
      throw error;
    }
  };

  const getMascotas = async (usuarioId: string) => {
    if (!usuarioId) {
      throw new Error('ID de usuario no proporcionado');
    }

    try {
      const response = await obtenerMascotas(usuarioId);
      console.log('Respuesta completa de obtenerMascotas:', response); // Debug
      return response; // obtenerMascotas ya devuelve response.data
    } catch (error) {
      console.error('Error al obtener mascotas:', error);
      throw error;
    }
  };

  const deleteMascota = async (usuarioId: string, mascotaId: string) => {
    if (!usuario?.id) {
      throw new Error('No se pudo obtener la información del usuario.');
    }

    try {
      await eliminarMascota(usuarioId, mascotaId);

    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      throw error;
    }
  };

  const getServiciosVeterinaria = async (id: string, page: number = 1, estado: string) => {
    if (!id) {
      throw new Error('ID de veterinaria no proporcionado');
    }
    try {
      const response = await getServiciosVeterinariaByUsuario(id, page, estado);
      return response; // Asegúrate de que la API devuelve un objeto con una propiedad data
    } catch (error) {
      console.error('Error al obtener servicios de veterinaria:', error);
      throw error;
    }
  };

  const getServiciosPaseador = async (id: string, page: number = 1, estado: string) => {
    if (!id) {
      throw new Error('ID de paseador no proporcionado');
    }
    try {
      const response = await getServiciosPaseadorByUsuario(id, page, estado);
      return response; // Asegúrate de que la API devuelve un objeto con una propiedad data
    } catch (error) {
      console.error('Error al obtener servicios de paseador:', error);
      throw error;
    }
  };

  const getServiciosCuidador = async (id: string, page: number = 1, estado: string) => {
    if (!id) {
      throw new Error('ID de cuidador no proporcionado');
    }
    try {
      const response = await getServiciosCuidadorByUsuario(id, page, estado);
      return response; // Asegúrate de que la API devuelve un objeto con una propiedad data
    } catch (error) {
      console.error('Error al obtener servicios de cuidador:', error);
      throw error;
    }
  };


  // OBTENER LOS SERVICIOS EN LAS PAGINAS DE CADA TIPO DE USUARIO

  const getServiciosCuidadores = async (page: number = 1, filtro: any) => {
    
    try {
      const response = await obetenerServiciosCuidadores(page, filtro);
      return response; // Asegúrate de que la API devuelve un objeto con una propiedad data
    } catch (error) {
      console.error('Error al obtener servicios de cuidador:', error);
      throw error;
    }
  };

   const getServiciosPaseadores = async (page: number = 1, filtro: any) => {
    
    try {
      const response = await obetenerServiciosPaseadores(page, filtro);
      return response; // Asegúrate de que la API devuelve un objeto con una propiedad data
    } catch (error) {
      console.error('Error al obtener servicios de cuidador:', error);
      throw error;
    }
  };

  const getServiciosVeterinarias = async (page: number = 1, filtro: any) => {
    try {
      const response = await obetenerServiciosVeterinarias(page, filtro);
      return response; // Asegúrate de que la API devuelve un objeto con una propiedad data
    } catch (error) {
      console.error('Error al obtener servicios de veterinarias:', error);
      throw error;
    }
  };


  const crearReserva = async (datos: any) => {
    try {
      const response = await createReserva(datos);
      return response.data;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  };

  const obtenerTodasLasReservas = async (userId: string, userType: string, page: number) => {
    try {
      const response = await getTodasReservas(userId, userType, page);
      return response.data;
    } catch (error) {
      console.error('Error al obtener todas las reservas:', error);
      throw error;
    }
  };

  const logout = () => {
    setUsuario(null);
    setTipoUsuario(null);
    localStorage.removeItem('tipoUsuario');
    localStorage.removeItem('usuario');
  };

  const cambiarTipoUsuario = (tipo: string) => {
    if (isValidUserType(tipo)) {
      setTipoUsuario(tipo);
    }
    localStorage.setItem('tipoUsuario', tipo);
  };

  const createServicioVeterinario = async (data: DatosServicioVeterinario) => {
    try {
      const response = await crearServiciooVeterinaria(data);
      return response.data;
    } catch (error) {
      console.error('Error al crear servicio veterinario:', error);
      throw error;
    }
  };

 

  const createServicioPaseador = async (data: DatosServicioPaseador) => {
    try {
      const response = await crearServicioPaseador(data);
      return response.data;
    } catch (error) {
      console.error('Error al crear servicio paseador:', error);
      throw error;
    }
  };
   const createServicioCuidador = async (data: DatosServicioCuidador) => {
    try {
      const response = await crearServicioCuidador(data);
      return response.data;
    } catch (error) {
      console.error('Error al crear servicio cuidador:', error);
      throw error;
    }
  }; 

  const activarOdesactivarServicio = async (serviceId: string, userType: string, estado: string) => {
    try {
      if (userType === 'veterinaria') {
        await cambiarEstadoServicio(serviceId, estado, 'servicioVet');
      } else if (userType === 'paseador') {
        await cambiarEstadoServicio(serviceId, estado, 'servicioPaseador');
      } else if (userType === 'cuidador') {
        await cambiarEstadoServicio(serviceId, estado, 'servicioCuidador');
      }
    } catch (error) {
      console.error('Error al activar/desactivar servicio:', error);
      throw error;
    }
  };

  const getNotificationes = async (userId: string , userType: string, page: number) => {
    try {
      const response = await obtenerNotificaciones(userId, userType, page);
      return response;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  };

  const getNotificacionesNoLeidas = async (userId: string , leida: string, userType: string , page: number) => {
    try {
      const response = await obtenerNotificacionesNoLeidas(userId, leida, userType, page);
      return response;
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      throw error;
    }
  };

  const marcarLeidaDelCliente = async (userId: string, notificacionId: string) => {
    try {
      await marcarLeidaCliente(userId, notificacionId);
      // Decrementar el contador global
      decrementarContadorNotificaciones();
    } catch (error) {
      console.error('Error al marcar notificación como leída del cliente:', error);
      throw error;
    }
  };

  const marcarLeidaDelProveedor = async (userId: string, notificacionId: string, tipoProveedor: string) => {
    try {
      await marcarLeidaProveedor(userId, notificacionId, tipoProveedor);
      // Decrementar el contador global
      decrementarContadorNotificaciones();
    } catch (error) {
      console.error('Error al marcar notificación como leída del proveedor:', error);
      throw error;
    }
  };

  const marcarTodasLeidasDelCliente = async (userId: string) => {
    try {
      await marcarTodasLeidasCliente(userId);
      // Resetear el contador global a 0
      actualizarContadorNotificaciones(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas del cliente:', error);
      throw error;
    }
  };

  const marcarTodasLeidasDelProveedor = async (userId: string, tipoProveedor: string) => {
    try {
      await marcarTodasLeidasProveedor(userId, tipoProveedor);
      // Resetear el contador global a 0
      actualizarContadorNotificaciones(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas del proveedor:', error);
      throw error;
    }
  };

  // Funciones para manejar el contador de notificaciones no leídas
  const cargarContadorNotificaciones = async () => {
    if (!usuario || !tipoUsuario) return;
    
    try {
      const contador = await obtenerContadorNotificacionesNoLeidas(usuario.id, tipoUsuario);
      setContadorNotificacionesNoLeidas(contador);
    } catch (error) {
      console.error('Error al cargar contador de notificaciones:', error);
    }
  };

  const actualizarContadorNotificaciones = (nuevoContador: number) => {
    setContadorNotificacionesNoLeidas(nuevoContador);
  };

  const decrementarContadorNotificaciones = () => {
    setContadorNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
  };

  const incrementarContadorNotificaciones = () => {
    setContadorNotificacionesNoLeidas(prev => prev + 1);
  };

  const contextValue: AuthContextType = {
    usuario,
    login,
    loginWithCredentials,
    registerWithCredentials,
    registroMascota,
    getMascotas,
    deleteMascota,
    createServicioVeterinario,
    createServicioPaseador,
    createServicioCuidador,
    getServiciosVeterinaria,
    getServiciosPaseador,
    getServiciosCuidador,
    activarOdesactivarServicio,
    getServiciosCuidadores,
    getServiciosPaseadores,
    getServiciosVeterinarias,
    getNotificationes,
    getNotificacionesNoLeidas,
    marcarLeidaDelCliente,
    marcarLeidaDelProveedor,
    marcarTodasLeidasDelProveedor,
    marcarTodasLeidasDelCliente,
    obtenerTodasLasReservas,
    crearReserva,
    logout,
    cambiarTipoUsuario,
    tipoUsuario,
    contadorNotificacionesNoLeidas,
    cargarContadorNotificaciones,
    actualizarContadorNotificaciones,
    decrementarContadorNotificaciones,
    incrementarContadorNotificaciones
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

