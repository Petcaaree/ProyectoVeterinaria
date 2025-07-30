import { createContext, useState, useEffect } from 'react';
import { loginUsuario, signinUsuario } from '../api/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const tipoGuardado = localStorage.getItem('tipoUsuario');

    if (usuarioGuardado && usuarioGuardado !== 'undefined') {
      try {
        const userParsed = JSON.parse(usuarioGuardado);
        setUsuario(userParsed);
        if (tipoGuardado) {
          setTipoUsuario(tipoGuardado); // cargar tipo si existe
        } else if (userParsed?.tipo) {
          setTipoUsuario(userParsed.tipo); // usar tipo dentro del objeto usuario si existe
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('usuario');
        localStorage.removeItem('tipoUsuario');
      }
    }
  }, []);

  const login = (usuarioData, tipo) => {
    setUsuario(usuarioData);
    setTipoUsuario(tipo)
    localStorage.setItem('usuario', JSON.stringify(usuarioData))
    localStorage.setItem('tipoUsuario', tipo)
  };

  const loginWithCredentials = async (email, contrasenia, tipoUsuario) => {
    try {
      // Llamar a tu API usando la función existente
      const response = await loginUsuario({ email, contrasenia }, tipoUsuario);
      
      // El usuario viene en response.data
      const usuarioCompleto = response.data;
      
      // Guardar el usuario y el tipo seleccionado
      setUsuario(usuarioCompleto);
      setTipoUsuario(tipoUsuario);
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      localStorage.setItem('tipoUsuario', tipoUsuario);
      
      return usuarioCompleto;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const registerWithCredentials = async (nombre, apellido, email, contrasenia, tipoUsuario) => {
    try {
      // Llamar a tu API de registro usando la función existente
      const response = await signinUsuario({ nombre, apellido, email, contrasenia }, tipoUsuario);
      
      // El usuario viene en response.data
      const usuarioCompleto = response.data;
      
      // Guardar el usuario y el tipo seleccionado
      setUsuario(usuarioCompleto);
      setTipoUsuario(tipoUsuario);
      localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
      localStorage.setItem('tipoUsuario', tipoUsuario);
      
      return usuarioCompleto;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const logout = () => {
    setUsuario(null);
    setTipoUsuario(null);
    localStorage.removeItem('tipoUsuario');
    localStorage.removeItem('usuario');
  };

  const cambiarTipoUsuario = (tipo) => {
    setTipoUsuario(tipo);
    localStorage.setItem('tipoUsuario', tipo);
  };


  return (
    <AuthContext.Provider value={{ usuario, login, loginWithCredentials, registerWithCredentials, logout, cambiarTipoUsuario, tipoUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};
