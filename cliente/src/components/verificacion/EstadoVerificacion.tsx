import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { EstadoVerificacionResponse, TIPO_DOCUMENTO_LABEL } from '../../types/verificacion';

interface EstadoVerificacionProps {
  estado: EstadoVerificacionResponse;
  onReenviar?: () => void;
}

const EstadoVerificacion: React.FC<EstadoVerificacionProps> = ({ estado, onReenviar }) => {
  if (estado.estadoVerificacion === 'VERIFICADO') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <ShieldCheck className="h-40 w-40 -mt-4 -mr-4" />
          </div>
          <div className="relative z-10">
            <div className="bg-white bg-opacity-20 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold mb-2">¡Veterinaria verificada!</h2>
            <p className="text-green-50">
              Ya podés publicar servicios y recibir reservas.
            </p>
          </div>
        </div>
        <div className="p-6 text-center text-sm text-gray-600">
          Tu clínica aparece con un badge de verificación en las búsquedas públicas.
        </div>
      </div>
    );
  }

  if (estado.estadoVerificacion === 'PENDIENTE') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Clock className="h-40 w-40 -mt-4 -mr-4" />
          </div>
          <div className="relative z-10">
            <div className="bg-white bg-opacity-20 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold mb-2">En revisión</h2>
            <p className="text-yellow-50 max-w-sm mx-auto">
              Tu documentación está siendo revisada por un administrador.
            </p>
          </div>
        </div>
        <div className="p-6 space-y-3 text-sm text-gray-600">
          <p>📩 Te notificaremos por email apenas esté aprobada.</p>
          <p>⏱️ Este proceso puede tardar entre 24 y 72 horas hábiles.</p>
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Mientras tanto no podés publicar servicios.
          </p>
        </div>
      </div>
    );
  }

  if (estado.estadoVerificacion === 'RECHAZADO') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <AlertTriangle className="h-40 w-40 -mt-4 -mr-4" />
          </div>
          <div className="relative z-10">
            <div className="bg-white bg-opacity-20 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Documentación rechazada</h2>
            <p className="text-red-50">
              Revisá el motivo, corregilo y reenviá la documentación.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {estado.motivoRechazo && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
              <h3 className="text-sm font-bold text-red-800 mb-1 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Motivo del rechazo</span>
              </h3>
              <p className="text-sm text-red-700 leading-relaxed">{estado.motivoRechazo}</p>
            </div>
          )}

          {estado.documentos && estado.documentos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Documentos enviados</h3>
              <ul className="space-y-2">
                {estado.documentos.map((d, idx) => (
                  <li key={`${d.tipo}-${d.url ?? idx}`} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>{TIPO_DOCUMENTO_LABEL[d.tipo]}</span>
                    </div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-purple-600 hover:underline">
                      Ver
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onReenviar && (
            <div className="text-center pt-2">
              <button
                onClick={onReenviar}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
              >
                Reenviar documentación
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // NO_INICIADA
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-br from-purple-600 to-blue-700 p-10 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <ShieldCheck className="h-40 w-40 -mt-4 -mr-4" />
        </div>
        <div className="relative z-10">
          <div className="bg-white bg-opacity-20 backdrop-blur w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Completá la verificación</h2>
          <p className="text-purple-100 max-w-sm mx-auto">
            Para publicar servicios necesitás verificar tu veterinaria.
          </p>
        </div>
      </div>
      {onReenviar && (
        <div className="p-6 text-center">
          <button
            onClick={onReenviar}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
          >
            Iniciar verificación
          </button>
        </div>
      )}
    </div>
  );
};

export default EstadoVerificacion;
