import React, { useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import FormularioLogin from './FormularioLogin';
import FormularioRegistro from './FormularioRegistro';
import { useAuth } from '../../context/authContext.tsx';

interface ModalAutenticacionProps {
  estaAbierto: boolean;
  alCerrar: () => void;
  modo: 'login' | 'registro';
  alCambiarModo: (modo: 'login' | 'registro') => void;
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
    console.log('Register submitted:', data);
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
                {modo === 'login' ? 'Bienvenido de vuelta' : 'Únete a PetCare'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm leading-tight">
                {modo === 'login' 
                  ? 'Accede a tu cuenta para cuidar mejor a tu mascota' 
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
            />
          ) : (
            <FormularioRegistro
              onSubmit={handleRegisterSubmit}
              onSwitchToLogin={() => alCambiarModo('login')}
            />
          )}
          
          {/* Social login options */}
          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 sm:px-3 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button className="w-full inline-flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors touch-manipulation">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-1.5 sm:ml-2">Google</span>
              </button>
              
              <button className="w-full inline-flex justify-center items-center py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors touch-manipulation">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-1.5 sm:ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAutenticacion;