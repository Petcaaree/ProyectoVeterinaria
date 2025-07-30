import React, { useState } from 'react';
import { Menu, X, Heart, User, LogIn, UserPlus, Calendar, Settings, Phone, ChevronDown, Bell, Plus, PawPrint, Stethoscope, MapPin, Shield } from 'lucide-react';
import ModalAutenticacion from './autenticacion/ModalAutenticacion';
import { useAuth } from '../context/authContext.tsx';
import type { Usuario } from '../types/auth';

interface EncabezadoProps {
  onServiceChange?: (service: 'overview' | 'veterinaria' | 'paseador' | 'cuidador') => void;
  onViewChange?: (view: 'home' | 'create-service' | 'appointments' | 'notifications') => void;
  onUserLogin?: (userData: { nombre: string; tipo: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' }) => void;
  onUserLogout?: () => void;
}

const Encabezado: React.FC<EncabezadoProps> = ({ onServiceChange, onViewChange, onUserLogin, onUserLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [estaModalAbierto, setEstaModalAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'registro'>('login');
  
  // Usar el contexto de autenticación
  const { usuario, tipoUsuario, login, loginWithCredentials, registerWithCredentials, logout } = useAuth();
  
  // Mapear tipos del contexto a los tipos del componente
  const usuarioLogueado = usuario ? {
    nombre: usuario.nombreUsuario,
    tipo: tipoUsuario as 'cliente' | 'veterinaria' | 'paseador' | 'cuidador'
  } : null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleServiceClick = (service: 'overview' | 'veterinaria' | 'paseador' | 'cuidador') => {
    if (onServiceChange) {
      onServiceChange(service);
    }
    setIsMenuOpen(false);
  };

  const handleUserMenuClick = (action: string) => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    
    switch (action) {
      case 'login':
        setModoAuth('login');
        setEstaModalAbierto(true);
        break;
      case 'register':
        setModoAuth('registro');
        setEstaModalAbierto(true);
        break;
      case 'demo-cliente': {
        const clienteData: Usuario = { 
          nombreUsuario: 'Ana García', 
          email: 'ana@email.com',
          direccion: { calle: 'Av. Principal', numero: '123' },
          telefono: '123456789',
          notificaciones: [],
          mascotas: []
        };
        login(clienteData, 'cliente');
        if (onUserLogin) onUserLogin({ nombre: clienteData.nombreUsuario, tipo: 'cliente' });
        break;
      }
      case 'demo-veterinaria': {
        const vetData: Usuario = { 
          nombreUsuario: 'Dr. Carlos López', 
          email: 'carlos@veterinaria.com',
          direccion: { calle: 'Calle Salud', numero: '456' },
          telefono: '987654321',
          notificaciones: []
        };
        login(vetData, 'veterinaria');
        if (onUserLogin) onUserLogin({ nombre: vetData.nombreUsuario, tipo: 'veterinaria' });
        break;
      }
      case 'demo-paseador': {
        const paseadorData: Usuario = { 
          nombreUsuario: 'María Rodríguez', 
          email: 'maria@paseos.com',
          direccion: { calle: 'Parque Central', numero: '789' },
          telefono: '456789123',
          notificaciones: []
        };
        login(paseadorData, 'paseador');
        if (onUserLogin) onUserLogin({ nombre: paseadorData.nombreUsuario, tipo: 'paseador' });
        break;
      }
      case 'demo-cuidador': {
        const cuidadorData: Usuario = { 
          nombreUsuario: 'Pedro Martínez', 
          email: 'pedro@cuidados.com',
          direccion: { calle: 'Av. Cuidadores', numero: '321' },
          telefono: '789123456',
          notificaciones: []
        };
        login(cuidadorData, 'cuidador');
        if (onUserLogin) onUserLogin({ nombre: cuidadorData.nombreUsuario, tipo: 'cuidador' });
        break;
      }
      case 'my-pets':
        if (onViewChange) onViewChange('my-pets' as any);
        break;
      case 'appointments':
        if (onViewChange) onViewChange('appointments');
        break;
      case 'notifications':
        if (onViewChange) onViewChange('notifications');
        break;
      case 'register-pet':
        // Verificar si es dueño antes de permitir registrar mascota
        if (usuarioLogueado?.tipo === 'cliente') {
          if (onViewChange) onViewChange('register-pet' as any);
        } else {
          alert('Solo los dueños de mascotas pueden registrar mascotas.');
        }
        break;
      case 'add-service':
        if (onViewChange) onViewChange('create-service');
        break;
      case 'my-services':
        if (onViewChange) onViewChange('create-service');
        break;
      case 'my-walks':
        if (onViewChange) onViewChange('my-walks' as any);
        break;
      case 'my-vet-services':
        if (onViewChange) onViewChange('my-vet-services' as any);
        break;
      case 'my-care-services':
        if (onViewChange) onViewChange('my-care-services' as any);
        break;
      case 'logout':
        logout();
        if (onUserLogout) onUserLogout();
        break;
    }
  };

  const manejarCambioModo = (modo: 'login' | 'registro') => {
    setModoAuth(modo);
  };

  const getMenuOptions = () => {
    if (!usuarioLogueado) {
      return [
        { id: 'login', label: 'Iniciar Sesión', icon: LogIn },
        { id: 'register', label: 'Registrarse', icon: UserPlus },
        { id: 'divider', label: '', icon: null },
        { id: 'demo-cliente', label: 'Demo: Dueño', icon: User },
        { id: 'demo-veterinaria', label: 'Demo: Veterinario', icon: Stethoscope },
        { id: 'demo-paseador', label: 'Demo: Paseador', icon: Heart },
        { id: 'demo-cuidador', label: 'Demo: Cuidador', icon: Shield }
      ];
    }

    const commonOptions = [
      { id: 'appointments', label: 'Mis Turnos', icon: Calendar },
      { id: 'notifications', label: 'Notificaciones', icon: Bell }
    ];

    switch (usuarioLogueado.tipo) {
      case 'cliente':
        return [
          { id: 'my-pets', label: 'Mis Mascotas', icon: PawPrint },
          { id: 'register-pet', label: 'Registrar Mascota', icon: Plus },
          ...commonOptions,
          { id: 'logout', label: 'Cerrar Sesión', icon: X }
        ];
      case 'veterinaria':
        return [
          { id: 'add-service', label: 'Agregar Servicio', icon: Plus },
          { id: 'my-vet-services', label: 'Mis Servicios', icon: Stethoscope },
          ...commonOptions,
          { id: 'logout', label: 'Cerrar Sesión', icon: X }
        ];
      case 'paseador':
        return [
          { id: 'add-service', label: 'Agregar Paseo', icon: Plus },
          { id: 'my-walks', label: 'Mis Paseos', icon: MapPin },
          ...commonOptions,
          { id: 'logout', label: 'Cerrar Sesión', icon: X }
        ];
      case 'cuidador':
        return [
          { id: 'add-service', label: 'Agregar Cuidado', icon: Plus },
          { id: 'my-care-services', label: 'Mis Servicios', icon: Shield },
          ...commonOptions,
          { id: 'logout', label: 'Cerrar Sesión', icon: X }
        ];
      default:
        return commonOptions;
    }
  };

  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'owner': return 'Dueño de Mascota';
      case 'veterinary': return 'Veterinario/a';
      case 'walker': return 'Paseador/a';
      case 'caregiver': return 'Cuidador/a';
      default: return 'Usuario';
    }
  };

  const menuOptions = getMenuOptions();

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PetCare</span>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center relative">
            <button
              onClick={toggleUserMenu}
              className={`${usuarioLogueado ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
            >
              {usuarioLogueado ? (
                <>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{usuarioLogueado.nombre.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{usuarioLogueado.nombre}</div>
                    <div className="text-xs opacity-90">{getUserTypeLabel(usuarioLogueado.tipo)}</div>
                  </div>
                </>
              ) : (
                <User className="h-4 w-4" />
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop User Dropdown */}
            {isUserMenuOpen && (
              <div className={`absolute right-0 top-full mt-2 ${usuarioLogueado ? 'w-56' : 'w-48'} bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
                {menuOptions.map((option, index) => {
                  if (option.id === 'divider') {
                    return <hr key={index} className="my-2 border-gray-200" />;
                  }
                  
                  const Icon = option.icon;
                  const isLogout = option.id === 'logout';
                  const isAddService = option.id === 'add-service';
                  const isDemoOption = option.id.startsWith('demo-');
                  
                  return (
                    <React.Fragment key={option.id}>
                      {index > 0 && (option.id === 'appointments' || option.id === 'logout') && (
                        <hr className="my-2 border-gray-200" />
                      )}
                      <button
                        onClick={() => handleUserMenuClick(option.id)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors ${
                          isLogout ? 'text-red-600 hover:bg-red-50' : 
                          isAddService ? 'text-green-600 hover:bg-green-50' : 
                          isDemoOption ? 'text-purple-600 hover:bg-purple-50' :
                          'text-gray-700'
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{option.label}</span>
                        {option.id === 'notifications' && usuario?.notificaciones && usuario.notificaciones.length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {usuario.notificaciones.filter(n => !n.leida).length}
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => handleServiceClick('overview')}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
              >
                Inicio
              </button>
              <button
                onClick={() => handleServiceClick('overview')}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
              >
                Servicios
              </button>
              <button
                onClick={() => handleServiceClick('veterinaria')}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
              >
                Veterinaria
              </button>
              <button
                onClick={() => handleServiceClick('paseador')}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
              >
                Paseadores
              </button>
              <button
                onClick={() => handleServiceClick('cuidador')}
                className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-left"
              >
                Cuidadores
              </button>
              
              {/* Mobile User Menu */}
              <div className="pt-4 border-t border-gray-200">
                {usuarioLogueado && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{usuarioLogueado.nombre.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{usuarioLogueado.nombre}</div>
                        <div className="text-sm text-green-600">{getUserTypeLabel(usuarioLogueado.tipo)}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col space-y-3">
                  {menuOptions.map((option) => {
                    if (option.id === 'divider') {
                      return <hr key={option.id} className="my-2 border-gray-200" />;
                    }
                    
                    const Icon = option.icon;
                    const isLogin = option.id === 'login';
                    const isRegister = option.id === 'register';
                    const isLogout = option.id === 'logout';
                    const isAddService = option.id === 'add-service';
                    const isDemoOption = option.id.startsWith('demo-');
                    
                    if (isLogin) {
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleUserMenuClick(option.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 justify-center"
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{option.label}</span>
                        </button>
                      );
                    }
                    
                    if (isRegister) {
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleUserMenuClick(option.id)}
                          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 justify-center"
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{option.label}</span>
                        </button>
                      );
                    }
                    
                    if (isDemoOption) {
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleUserMenuClick(option.id)}
                          className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2 justify-center text-sm"
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{option.label}</span>
                        </button>
                      );
                    }
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleUserMenuClick(option.id)}
                        className={`py-2 flex items-center space-x-2 transition-colors ${
                          isLogout ? 'text-red-600 hover:text-red-700' :
                          isAddService ? 'text-green-600 hover:text-green-700' :
                          'text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{option.label}</span>
                        {option.id === 'notifications' && usuario?.notificaciones && usuario.notificaciones.length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {usuario.notificaciones.filter(n => !n.leida).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
      </header>

      {/* Modal de Autenticación */}
      <ModalAutenticacion
        estaAbierto={estaModalAbierto}
        alCerrar={() => setEstaModalAbierto(false)}
        modo={modoAuth}
        alCambiarModo={manejarCambioModo}
        onLoginSuccess={async (userData: any) => {
          try {
            let usuarioCompleto: Usuario;
            
            // Verificar si es registro o login
            if (userData.apellido) {
              // Es registro (tiene apellido)
              usuarioCompleto = await registerWithCredentials(
                userData.nombre,
                userData.apellido,
                userData.email,
                userData.contrasenia,
                userData.tipo
              );
            } else if (userData.contrasenia) {
              // Es login (tiene credenciales pero no apellido)
              usuarioCompleto = await loginWithCredentials(
                userData.email || userData.nombreUsuario, 
                userData.contrasenia,
                userData.tipo
              );
            } else {
              // Para los casos demo, usar login directo
              usuarioCompleto = {
                nombreUsuario: userData.nombre,
                email: 'usuario@email.com',
                direccion: { calle: 'Sin especificar', numero: '' },
                telefono: '000000000',
                notificaciones: [],
                ...(userData.tipo === 'owner' && { mascotas: [] })
              };
              login(usuarioCompleto, userData.tipo);
            }
            
            if (onUserLogin) onUserLogin({ nombre: usuarioCompleto.nombreUsuario, tipo: userData.tipo });
            setEstaModalAbierto(false);
          } catch (error) {
            console.error('Error en autenticación:', error);
            alert('Error en la autenticación. Verifica tus datos.');
          }
        }}
      />
    </>
  );
};


export default Encabezado