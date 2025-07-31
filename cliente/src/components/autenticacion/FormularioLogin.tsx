import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Stethoscope, Heart, Shield } from 'lucide-react';
import Boton from '../comun/Boton';
import { useAuth } from '../../context/authContext.tsx';

interface FormularioLoginProps {
  onSwitchToRegister: () => void;
}

const FormularioLogin: React.FC<FormularioLoginProps> = ({ onSwitchToRegister }) => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithCredentials } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'cliente'
  });

  const userTypes = [
    { value: 'cliente', label: 'Dueño de Mascota', icon: User, description: 'Busco servicios para mi mascota' },
    { value: 'veterinaria', label: 'Veterinario/a', icon: Stethoscope, description: 'Ofrezco servicios veterinarios' },
    { value: 'paseador', label: 'Paseador/a', icon: Heart, description: 'Ofrezco servicios de paseo' },
    { value: 'cuidador', label: 'Cuidador/a', icon: Shield, description: 'Ofrezco servicios de cuidado' }
  ];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (userType: string) => {
    setFormData(prev => ({
      ...prev,
      userType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await loginWithCredentials(formData.email, formData.password, formData.userType);
      // El contexto ya maneja la navegación y el almacenamiento
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setMostrarPassword(!mostrarPassword);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ¿Cómo quieres usar PetCare?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {userTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleUserTypeChange(type.value)}
                  className={`p-2 border-2 rounded-lg transition-all duration-200 text-center ${
                    formData.userType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-0.5">
                    <div className={`p-2 rounded-lg ${
                      formData.userType === type.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs leading-tight">{type.label}</h4>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                placeholder="Tu contraseña"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-600">Recordarme</span>
          </label>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Boton
          tipo="submit"
          ancho="completo"
          tamaño="md"
          deshabilitado={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Boton>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Regístrate gratis
          </button>
        </p>
      </div>
    </>
  );
};

export default FormularioLogin;