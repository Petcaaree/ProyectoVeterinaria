import React from 'react';
import { Clock, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '../../context/authContext';

interface BannerVerificacionProps {
  onAccion: () => void; // abrir formulario o pantalla de estado
}

const BannerVerificacion: React.FC<BannerVerificacionProps> = ({ onAccion }) => {
  const { tipoUsuario, estadoVerificacion } = useAuth();

  if (tipoUsuario !== 'veterinaria' || !estadoVerificacion) return null;

  const estado = estadoVerificacion.estadoVerificacion;
  if (estado === 'VERIFICADO') return null; // no mostramos banner cuando está todo OK

  const configs = {
    NO_INICIADA: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-900',
      icon: <FileText className="h-5 w-5 text-purple-600" />,
      titulo: 'Verificá tu veterinaria',
      mensaje: 'Necesitás completar el proceso de verificación para publicar servicios.',
      cta: 'Completar verificación',
    },
    PENDIENTE: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-900',
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      titulo: 'Verificación en revisión',
      mensaje: 'Un administrador está revisando tu documentación.',
      cta: 'Ver estado',
    },
    RECHAZADO: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-900',
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      titulo: 'Documentación rechazada',
      mensaje: estadoVerificacion.motivoRechazo ?? 'Hay problemas con tu documentación.',
      cta: 'Reenviar',
    },
  } as const;

  const cfg = configs[estado as keyof typeof configs];
  if (!cfg) return null;

  return (
    <div className={`border rounded-lg p-4 mb-6 flex items-center justify-between ${cfg.bg}`}>
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">{cfg.icon}</div>
        <div>
          <p className={`font-semibold ${cfg.text}`}>{cfg.titulo}</p>
          <p className={`text-sm ${cfg.text} opacity-90`}>{cfg.mensaje}</p>
        </div>
      </div>
      <button
        onClick={onAccion}
        className="ml-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 whitespace-nowrap"
      >
        {cfg.cta}
      </button>
    </div>
  );
};

// Exporto también un badge para usar en el perfil público.
export const BadgeVerificado: React.FC = () => (
  <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
    <ShieldCheck className="h-3 w-3" />
    <span>Verificada</span>
  </span>
);

export default BannerVerificacion;
