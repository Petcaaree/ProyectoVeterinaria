import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { DatosMascota, loginUsuario, signinUsuario, registrarMascota, obtenerMascotas, eliminarMascota } from '../api/api.js';
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
        } else if (userParsed?.tipo && isValidUserType(userParsed.tipo)) {
          setTipoUsuario(userParsed.tipo);
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('usuario');
        localStorage.removeItem('tipoUsuario');
      }
    }
  }, []);

  const login = (usuarioData: Usuario, tipo: string) => {
    setUsuario(usuarioData);
    if (isValidUserType(tipo)) {
      setTipoUsuario(tipo);
    }
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    localStorage.setItem('tipoUsuario', tipo);
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
      
      return usuarioCompleto;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
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
    tipoUsuario: string
  ): Promise<Usuario> => {
    try {
      const response = await signinUsuario({ nombreUsuario, email, contrasenia, telefono, direccion }, tipoUsuario);
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
      const response = await eliminarMascota(usuarioId, mascotaId);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
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

  const contextValue: AuthContextType = {
    usuario,
    login,
    loginWithCredentials,
    registerWithCredentials,
    registroMascota,
    getMascotas,
    deleteMascota,
    logout,
    cambiarTipoUsuario,
    tipoUsuario
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

