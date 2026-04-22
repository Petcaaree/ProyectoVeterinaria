import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import EstrellaCalificacion from '../comun/EstrellaCalificacion';
import { crearResena } from '../../api/api';

interface ModalResenaProps {
  isOpen: boolean;
  reservaId: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

const ModalResena: React.FC<ModalResenaProps> = ({
  isOpen,
  reservaId,
  onClose,
  onSuccess,
  onError,
}) => {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (puntuacion < 1) {
      onError?.('Seleccioná al menos una estrella');
      return;
    }
    setEnviando(true);
    try {
      await crearResena({ reservaId, puntuacion, comentario });
      onSuccess?.();
      setPuntuacion(0);
      setComentario('');
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      const status = e?.response?.status;
      const msg =
        status === 409
          ? 'Ya dejaste una reseña para esta reserva'
          : e?.response?.data?.message || 'No se pudo enviar la reseña';
      onError?.(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6" />
            <h2 className="text-xl font-bold">Calificar Servicio</h2>
          </div>
          <p className="text-purple-100 text-sm mt-1">Tu opinión ayuda a otros usuarios</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Puntuación
            </label>
            <EstrellaCalificacion
              calificacion={puntuacion}
              tamaño="lg"
              mostrarNumero={false}
              modo="input"
              onChange={setPuntuacion}
            />
            {puntuacion > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {puntuacion} de 5 estrella{puntuacion === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Contanos cómo fue tu experiencia…"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {comentario.length}/500
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={enviando}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={enviando || puntuacion < 1}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando…' : 'Enviar reseña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalResena;
