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
  onLoginSuccess?: (userData: { nombre: string; tipo: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' }) => void;
}

const ModalAutenticacion: React.FC<ModalAutenticacionProps> = ({
  estaAbierto,
  alCerrar,
  modo,
  alCambiarModo,
  onLoginSuccess
}) => {
  const { usuario, tipoUsuario } = useAuth();

  // Cerrar el modal automáticamente cuando el usuario se loguee
  useEffect(() => {
    if (usuario && estaAbierto) {
      // Pequeño delay para mostrar el estado de éxito antes de cerrar
      const timer = setTimeout(() => {
        alCerrar();
        if (onLoginSuccess && tipoUsuario) {
          onLoginSuccess({
            nombre: usuario.nombreUsuario,
            tipo: tipoUsuario
          });
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [usuario, estaAbierto, alCerrar, onLoginSuccess, tipoUsuario]);
  const handleRegisterSubmit = (data: { nombre: string; email: string; password: string; userType: string }) => {
    console.log('Register submitted:', data);
    // Aquí iría la lógica de registro
    // Simular registro exitoso para demo
    const userData = {
      nombre: data.nombre,
      tipo: data.userType as 'cliente' | 'veterinaria' | 'paseador' | 'cuidador'
    };
    
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }
    alCerrar();
  };

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Decorative header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative flex-shrink-0">
          <div className="absolute top-4 right-4">
            <button
              onClick={alCerrar}
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {modo === 'login' ? 'Bienvenido de vuelta' : 'Únete a PetCare'}
              </h2>
              <p className="text-blue-100 text-sm">
                {modo === 'login' 
                  ? 'Accede a tu cuenta para cuidar mejor a tu mascota' 
                  : 'Crea tu cuenta y comienza a cuidar a tu mascota'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="p-8 overflow-y-auto flex-1">
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
        </div>

        {/* Social login options */}
        <div className="px-8 pb-8 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="ml-2">Google</span>
            </button>
            
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAutenticacion;