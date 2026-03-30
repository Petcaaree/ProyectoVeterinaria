import React, { useState } from 'react';
import { Mail, ArrowLeft, User, Stethoscope, Heart, Shield, CheckCircle } from 'lucide-react';
import Boton from '../comun/Boton';
import { solicitarResetPassword } from '../../api/api.js';

interface OlvideContrasenaProps {
  onVolver: () => void;
}

const OlvideContrasena: React.FC<OlvideContrasenaProps> = ({ onVolver }) => {
  const [email, setEmail] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const userTypes = [
    { value: 'cliente', label: 'Dueño de Mascota', icon: User },
    { value: 'veterinaria', label: 'Veterinario/a', icon: Stethoscope },
    { value: 'paseador', label: 'Paseador/a', icon: Heart },
    { value: 'cuidador', label: 'Cuidador/a', icon: Shield }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await solicitarResetPassword(email, tipoUsuario);
      setEnviado(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la solicitud';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Revisá tu correo</h3>
        <p className="text-sm text-gray-600">
          Si el email <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
        </p>
        <p className="text-xs text-gray-500">
          El enlace expira en 1 hora. Revisá también la carpeta de spam.
        </p>
        <button
          onClick={onVolver}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={onVolver}
        className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al inicio de sesión
      </button>

      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">¿Olvidaste tu contraseña?</h3>
        <p className="text-sm text-gray-600 mt-1">
          Ingresá tu email y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ¿Cómo usás PetCare?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {userTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTipoUsuario(type.value)}
                  className={`p-2 border-2 rounded-lg transition-all duration-200 text-center ${
                    tipoUsuario === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-0.5">
                    <div className={`p-2 rounded-lg ${
                      tipoUsuario === type.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-xs leading-tight">{type.label}</h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
              placeholder="tu@email.com"
              required
            />
          </div>
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
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Boton>
      </form>
    </>
  );
};

export default OlvideContrasena;
