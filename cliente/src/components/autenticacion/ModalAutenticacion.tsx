import React, { useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import FormularioLogin from './FormularioLogin';
import FormularioRegistro from './FormularioRegistro';
import OlvideContrasena from './OlvideContrasena';
import { useAuth } from '../../context/authContext.tsx';

interface ModalAutenticacionProps {
  estaAbierto: boolean;
  alCerrar: () => void;
  modo: 'login' | 'registro' | 'forgot-password';
  alCambiarModo: (modo: 'login' | 'registro' | 'forgot-password') => void;
}

const ModalAutenticacion: React.FC<ModalAutenticacionProps> = ({
  estaAbierto,
  alCerrar,
  modo,
  alCambiarModo
}) => {
  const { usuario } = useAuth();

  // Cerrar el modal automáticamente cuando el usuario se loguee
  useEffect(() => {
    if (usuario && estaAbierto) {
      // Pequeño delay para mostrar el estado de éxito antes de cerrar
      const timer = setTimeout(() => {
        alCerrar();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [usuario, estaAbierto, alCerrar]);
  const handleRegisterSubmit = (data: { nombre: string; email: string; password: string; userType: string }) => {
    // Aquí iría la lógica de registro
    // Simular registro exitoso para demo
    alCerrar();
  };

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] flex flex-col transform transition-all duration-300 scale-95 sm:scale-100">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 md:p-5 text-white relative flex-shrink-0">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <button
              onClick={alCerrar}
              className="text-white hover:text-gray-200 transition-colors p-1 sm:p-1.5 rounded-full hover:bg-white hover:bg-opacity-20 touch-manipulation"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 pr-8 sm:pr-10">
            <div className="bg-white bg-opacity-20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl font-bold truncate">
                {modo === 'login' ? 'Bienvenido de vuelta' : modo === 'forgot-password' ? 'Recuperar contraseña' : 'Únete a PetCare'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm leading-tight">
                {modo === 'login'
                  ? 'Accede a tu cuenta para cuidar mejor a tu mascota'
                  : modo === 'forgot-password'
                  ? 'Te ayudamos a recuperar el acceso a tu cuenta'
                  : 'Crea tu cuenta y comienza a cuidar a tu mascota'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto">
          {modo === 'login' ? (
            <FormularioLogin
              onSwitchToRegister={() => alCambiarModo('registro')}
              onSwitchToForgotPassword={() => alCambiarModo('forgot-password')}
            />
          ) : modo === 'forgot-password' ? (
            <OlvideContrasena
              onVolver={() => alCambiarModo('login')}
            />
          ) : (
            <FormularioRegistro
              onSubmit={handleRegisterSubmit}
              onSwitchToLogin={() => alCambiarModo('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAutenticacion;