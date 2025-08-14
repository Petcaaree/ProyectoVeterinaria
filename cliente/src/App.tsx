import React, { useState, useEffect } from 'react';
import Encabezado from './components/Encabezado';
import Heroe from './components/Heroe';
import Servicios from './components/Servicios';
import ServiciosVeterinarios from './components/ServiciosVeterinarios';
import ServiciosPaseadores from './components/ServiciosPaseadores';
import ServiciosCuidadores from './components/ServiciosCuidadores';
import PiePagina from './components/PiePagina';
import NavegacionServicios from './components/NavegacionServicios';
import PaginaVeterinaria from './components/PaginaVeterinaria';
import PaginaPaseadores from './components/PaginaPaseadores';
import PaginaCuidadores from './components/PaginaCuidadores';
import CrearServicio from './components/servicios/CrearServicio';
import MisTurnos from './components/turnos/MisTurnos';
import Notificaciones from './components/notificaciones/Notificaciones';
import MisMascotas from './components/mascotas/MisMascotas';
import RegistrarMascota from './components/mascotas/RegistrarMascota';
import ModalAutenticacion from './components/autenticacion/ModalAutenticacion';
import MisPaseos from './components/paseadores/MisPaseos';
import MisServiciosVeterinarios from './components/veterinarios/MisServiciosVeterinarios';
import MisServiciosCuidadores from './components/cuidadores/MisServiciosCuidadores';
import { useAuth } from './context/authContext.tsx';

function App() {
  const { usuario, tipoUsuario } = useAuth();
  
  // Función temporal para mapear tipos de español a inglés
  const mapearTipoUsuario = (tipo: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null): 'owner' | 'veterinary' | 'walker' | 'caregiver' | null => {
    if (!tipo) return null;
    const mapeo = {
      'cliente': 'owner' as const,
      'veterinaria': 'veterinary' as const,
      'paseador': 'walker' as const,
      'cuidador': 'caregiver' as const
    };
    return mapeo[tipo];
  };

    const handleAddService = () => {
    if (tipoUsuario === 'veterinaria') {
      setCurrentView('create-service');
    } else if (tipoUsuario === 'paseador') {
      setCurrentView('create-service');
    } else if (tipoUsuario === 'cuidador') {
      setCurrentView('create-service');
    } else {
      handleRegistrarMascota();
    }
  };


  // Función temporal para mapear servicios de español a inglés
  const mapearServicio = (servicio: 'overview' | 'veterinaria' | 'paseador' | 'cuidador'): 'overview' | 'veterinary' | 'walker' | 'caregiver' => {
    const mapeo = {
      'overview': 'overview' as const,
      'veterinaria': 'veterinary' as const,
      'paseador': 'walker' as const,
      'cuidador': 'caregiver' as const
    };
    return mapeo[servicio];
  };

  const tipoUsuarioIngles = mapearTipoUsuario(tipoUsuario);
  const [currentService, setCurrentService] = useState<'overview' | 'veterinaria' | 'paseador' | 'cuidador'>('overview');
  const handleServiceChange = (service: 'overview' | 'veterinary' | 'walker' | 'caregiver') => {
    // Mapear de inglés a español
    const servicioEspanol = {
      'overview': 'overview' as const,
      'veterinary': 'veterinaria' as const,
      'walker': 'paseador' as const,
      'caregiver': 'cuidador' as const
    }[service];
    setCurrentService(servicioEspanol);
  };

  const [currentView, setCurrentView] = useState<'home' | 'create-service' | 'appointments' | 'notifications' | 'my-pets' | 'register-pet' | 'my-walks' | 'my-vet-services' | 'my-care-services'>('home');

  // Scroll al top cada vez que cambia la vista
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);
  const [estaModalAbierto, setEstaModalAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'registro'>('registro');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  // Efecto para manejar cambios de rol y redireccionar automáticamente
  useEffect(() => {
    // Definir qué vistas están permitidas para cada tipo de usuario
    const vistasPorTipo = {
      'cliente': ['home', 'create-service', 'appointments', 'notifications', 'my-pets', 'register-pet'],
      'veterinaria': ['home', 'create-service', 'appointments', 'notifications', 'my-vet-services'],
      'paseador': ['home', 'create-service', 'appointments', 'notifications', 'my-walks'],
      'cuidador': ['home', 'create-service', 'appointments', 'notifications', 'my-care-services']
    };

    // Vistas que requieren autenticación
    const vistasQueRequierenAutenticacion = [
      'appointments', 'notifications', 'my-pets', 'register-pet', 
      'my-walks', 'my-vet-services', 'my-care-services'
    ];

    // Si no hay usuario logueado y está en una vista que requiere autenticación
    if (!tipoUsuario && vistasQueRequierenAutenticacion.includes(currentView)) {
      console.log(`🔄 Sesión cerrada: redirigiendo desde ${currentView} a home`);
      setCurrentView('home');
      setCurrentService('overview');
      
      // Mostrar mensaje de redirección temporal
      setShowRedirectMessage(true);
      setTimeout(() => {
        setShowRedirectMessage(false);
      }, 3000);
    }
    // Si hay un usuario logueado y está en una vista no permitida para su tipo
    else if (tipoUsuario && vistasPorTipo[tipoUsuario]) {
      const vistasPermitidas = vistasPorTipo[tipoUsuario];
      
      if (!vistasPermitidas.includes(currentView)) {
        console.log(`🔄 Redirigiendo: ${currentView} no está permitida para ${tipoUsuario}, volviendo a home`);
        setCurrentView('home');
        setCurrentService('overview');
        
        // Mostrar mensaje de redirección temporal
        setShowRedirectMessage(true);
        setTimeout(() => {
          setShowRedirectMessage(false);
        }, 3000);
      }
    }
  }, [tipoUsuario, currentView]);

  const handleViewChange = (view: 'home' | 'create-service' | 'appointments' | 'notifications' | 'my-pets' | 'register-pet' | 'my-walks' | 'my-vet-services' | 'my-care-services') => {
    console.log('🔍 handleViewChange called with view:', view); // Debug log
    setCurrentView(view);
  };

  const handleUserLogin = (userData: { nombre: string; tipo: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' }) => {
    setEstaModalAbierto(false);
  };

  const handleUserLogout = () => {
    // Siempre redirigir a home cuando se desloguee, sin importar la vista actual
    setCurrentView('home');
    setCurrentService('overview');
  };

  const handleRegistrarMascota = () => {
    if (tipoUsuario === 'cliente') {
      setCurrentView('register-pet');
    } else if (tipoUsuario && tipoUsuario !== 'cliente') {
      setErrorMessage('Solo los dueños de mascotas pueden registrar mascotas. Tu cuenta actual es de tipo: ' + getUserTypeLabel(tipoUsuario));
      setShowErrorModal(true);
    } else {
      setModoAuth('registro');
      setEstaModalAbierto(true);
    }
  };

  const handleExploreServices = () => {
    // Determinar a qué sección hacer scroll según el tipo de usuario
    let targetId = 'servicios'; // Por defecto, servicios generales
    
    if (tipoUsuario) {
      switch (tipoUsuario) {
        case 'veterinaria':
          targetId = 'veterinaria';
          break;
        case 'paseador':
          targetId = 'paseadores';
          break;
        case 'cuidador':
          targetId = 'cuidadores';
          break;
        default:
          targetId = 'servicios';
      }
    }
    
    // Hacer scroll a la sección correspondiente
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'cliente': return 'Dueño de Mascota';
      case 'veterinaria': return 'Veterinario/a';
      case 'paseador': return 'Paseador/a';
      case 'cuidador': return 'Cuidador/a';
      default: return 'Usuario';
    }
  };

  const handleAuthSuccess = (userData: { nombre: string; tipo: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' }) => {
    setEstaModalAbierto(false);
    
    // Si se registró/logueó como dueño desde el botón de registrar mascota, ir a esa vista
    if (userData.tipo === 'cliente') {
      setCurrentView('register-pet');
    } else {
      // Si no es dueño, mostrar error
      setErrorMessage('Solo los dueños de mascotas pueden registrar mascotas. Has iniciado sesión como: ' + getUserTypeLabel(userData.tipo));
      setShowErrorModal(true);
    }
  };

  const renderContent = () => {
    console.log('🔍 renderContent called with currentView:', currentView); // Debug log
    
    if (currentView === 'create-service') {
      return <CrearServicio userType={tipoUsuario as 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null} onBack={() => setCurrentView('home')} setCurrentView={setCurrentView} />;
    }
    
    if (currentView === 'appointments') {
      return <MisTurnos userType={tipoUsuario} onBack={() => setCurrentView('home')} />;
    }
    
    if (currentView === 'notifications') {
      return <Notificaciones userType={tipoUsuario} onBack={() => setCurrentView('home')} />;
    }
    
    if (currentView === 'my-pets') {
      return <MisMascotas userType={tipoUsuario} onBack={() => setCurrentView('home')} onRegisterPet={() => setCurrentView('register-pet')} />;
    }
    
    if (currentView === 'register-pet') {
      return <RegistrarMascota onBack={() => setCurrentView('home')} onSuccess={() => setCurrentView('my-pets')} />;
    }
    
    if (currentView === 'my-walks') {
      return <MisPaseos userType={tipoUsuario} onBack={() => setCurrentView('home')} />;
    }
    
    if (currentView === 'my-vet-services') {
      return <MisServiciosVeterinarios userType={tipoUsuario} onBack={() => setCurrentView('home')} />;
    }
    
    if (currentView === 'my-care-services') {
      return <MisServiciosCuidadores userType={tipoUsuario} onBack={() => setCurrentView('home')} />;
    }

    switch (currentService) {
      case 'veterinaria':
        return <PaginaVeterinaria userType={tipoUsuario} />;
      case 'paseador':
        return <PaginaPaseadores userType={tipoUsuario} />;
      case 'cuidador':
        return <PaginaCuidadores userType={tipoUsuario} />;
      default:
        return (
          <>
            <Heroe 
              onRegisterPetClick={handleRegistrarMascota}
              onLoginClick={() => {
                setModoAuth('login');
                setEstaModalAbierto(true);
              }}
              onAddServiceClick={handleAddService}
              onExploreServicesClick={handleExploreServices}
            />
            <Servicios />
            <ServiciosVeterinarios userType={tipoUsuario} />
            <ServiciosPaseadores userType={tipoUsuario} />
            <ServiciosCuidadores userType={tipoUsuario} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Encabezado 
        onServiceChange={setCurrentService} 
        onViewChange={handleViewChange}
        onUserLogin={handleUserLogin}
        onUserLogout={handleUserLogout}
      />
      {currentView === 'home' && (
        <NavegacionServicios 
          currentService={mapearServicio(currentService)}
          onServiceChange={handleServiceChange}
        />
      )}
      {renderContent()}
      <PiePagina />
      
      {/* Modal de Autenticación */}
      <ModalAutenticacion
        estaAbierto={estaModalAbierto}
        alCerrar={() => setEstaModalAbierto(false)}
        modo={modoAuth}
        alCambiarModo={setModoAuth}
      />

      {/* Modal de Error */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Acceso Restringido</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    handleUserLogout();
                    setModoAuth('registro');
                    setEstaModalAbierto(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cambiar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de mensaje de redirección */}
      {showRedirectMessage && (
        <>
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce-in">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">
                    {tipoUsuario ? 'Cuenta cambiada' : 'Sesión cerrada'}
                  </p>
                  <p className="text-sm opacity-90">
                    {tipoUsuario 
                      ? `Te hemos redirigido al inicio como ${getUserTypeLabel(tipoUsuario || '')}`
                      : 'Te hemos redirigido al inicio'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estilos para la animación */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes bounce-in {
                0% { 
                  transform: translateX(100%) scale(0.8); 
                  opacity: 0; 
                }
                60% { 
                  transform: translateX(-10px) scale(1.05); 
                  opacity: 1; 
                }
                80% { 
                  transform: translateX(5px) scale(0.95); 
                }
                100% { 
                  transform: translateX(0) scale(1); 
                  opacity: 1; 
                }
              }
              
              .animate-bounce-in {
                animation: bounce-in 0.6s ease-out;
              }
            `
          }} />
        </>
      )}
    </div>
  );
}

export default App;