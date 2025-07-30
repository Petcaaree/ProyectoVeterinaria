import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, X, Stethoscope, Heart, Shield } from 'lucide-react';
import Boton from '../comun/Boton';

interface FormularioRegistroProps {
  onSubmit: (data: { nombre: string; email: string; password: string; userType: string }) => void;
  onSwitchToLogin: () => void;
}

const FormularioRegistro: React.FC<FormularioRegistroProps> = ({ onSubmit, onSwitchToLogin }) => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    onSubmit({
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      userType: formData.userType
    });
  };

  const togglePasswordVisibility = () => {
    setMostrarPassword(!mostrarPassword);
  };

  // Validaciones de contraseña
  const passwordValidations = [
    { test: formData.password.length >= 8, text: 'Al menos 8 caracteres' },
    { test: /[A-Z]/.test(formData.password), text: 'Una letra mayúscula' },
    { test: /[0-9]/.test(formData.password), text: 'Un número' },
  ];

  const passwordsMatch = formData.password && formData.confirmarPassword && formData.password === formData.confirmarPassword;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                  className={`p-3 border-2 rounded-lg transition-all duration-200 text-center ${
                    formData.userType === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`p-2 rounded-lg ${
                      formData.userType === type.value ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs">{type.label}</h4>
                      <p className="text-xs text-gray-600 leading-tight">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Tu nombre completo"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={mostrarPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Crea una contraseña segura"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password validation indicators */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              {passwordValidations.map((validation, index) => (
                <div key={index} className="flex items-center text-xs">
                  {validation.test ? (
                    <Check className="h-3 w-3 text-green-500 mr-2" />
                  ) : (
                    <X className="h-3 w-3 text-red-500 mr-2" />
                  )}
                  <span className={validation.test ? 'text-green-600' : 'text-red-600'}>
                    {validation.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmarPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={mostrarPassword ? 'text' : 'password'}
              id="confirmarPassword"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                formData.confirmarPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirma tu contraseña"
              required
            />
            {formData.confirmarPassword && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {passwordsMatch ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {formData.confirmarPassword && !passwordsMatch && (
            <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden</p>
          )}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            Acepto los{' '}
            <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
              términos y condiciones
            </button>{' '}
            y la{' '}
            <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
              política de privacidad
            </button>
          </label>
        </div>

        <Boton
          tipo="submit"
          ancho="completo"
          tamaño="lg"
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
        >
          Crear Cuenta
        </Boton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </>
  );
};

export default FormularioRegistro;