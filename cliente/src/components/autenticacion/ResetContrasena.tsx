import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import Boton from '../comun/Boton';
import { resetearPassword } from '../../api/api.js';

interface ResetContrasenaProps {
  token: string;
  onVolverAlLogin: () => void;
}

const ResetContrasena: React.FC<ResetContrasenaProps> = ({ token, onVolverAlLogin }) => {
  const [contrasenia, setContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const passwordRequirements = [
    { label: 'Al menos 8 caracteres', test: (p: string) => p.length >= 8 },
    { label: 'Una letra minúscula', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Una letra mayúscula', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Un número', test: (p: string) => /\d/.test(p) },
    { label: 'Un carácter especial', test: (p: string) => /[\W_]/.test(p) }
  ];

  const passwordsMatch = contrasenia === confirmarContrasenia && confirmarContrasenia.length > 0;
  const allRequirementsMet = passwordRequirements.every(r => r.test(contrasenia));
  const canSubmit = allRequirementsMet && passwordsMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      await resetearPassword(token, contrasenia);
      setExito(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al restablecer la contraseña';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div className="text-center space-y-4 p-6">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Contraseña actualizada</h3>
        <p className="text-sm text-gray-600">
          Tu contraseña fue restablecida exitosamente. Ya podés iniciar sesión con tu nueva contraseña.
        </p>
        <Boton
          tipo="button"
          ancho="completo"
          tamaño="md"
          onClick={onVolverAlLogin}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
        >
          Ir al inicio de sesión
        </Boton>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nueva contraseña</h3>
        <p className="text-sm text-gray-600 mt-1">
          Ingresá tu nueva contraseña para tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-1">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={mostrarPassword ? 'text' : 'password'}
              id="new-password"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
              placeholder="Tu nueva contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={mostrarConfirmar ? 'text' : 'password'}
              id="confirm-password"
              value={confirmarContrasenia}
              onChange={(e) => setConfirmarContrasenia(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
              placeholder="Repetí tu nueva contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {mostrarConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmarContrasenia.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
          )}
        </div>

        {contrasenia.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Requisitos de contraseña:</p>
            <div className="space-y-1">
              {passwordRequirements.map((req, index) => {
                const met = req.test(contrasenia);
                return (
                  <div key={index} className="flex items-center space-x-2">
                    {met ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-300" />
                    )}
                    <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-500'}`}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Boton
          tipo="submit"
          ancho="completo"
          tamaño="md"
          deshabilitado={!canSubmit}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
        </Boton>
      </form>
    </div>
  );
};

export default ResetContrasena;
