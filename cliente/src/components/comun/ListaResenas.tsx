import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import EstrellaCalificacion from './EstrellaCalificacion';
import { getResenasByServicio } from '../../api/api';

interface ResenaItem {
  _id: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
  cliente?: { nombreUsuario?: string } | string;
}

interface ListaResenasProps {
  servicioId: string;
  limit?: number;
}

const formatDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const nombreCliente = (c: ResenaItem['cliente']): string => {
  if (!c) return 'Usuario';
  if (typeof c === 'string') return 'Usuario';
  return c.nombreUsuario || 'Usuario';
};

const ListaResenas: React.FC<ListaResenasProps> = ({ servicioId, limit = 5 }) => {
  const [data, setData] = useState<ResenaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResenasByServicio(servicioId, { page, limit });
      setData(res.data || []);
      setTotalPages(res.total_pages || 1);
    } catch {
      setError('No se pudieron cargar las reseñas');
    } finally {
      setLoading(false);
    }
  }, [servicioId, page, limit]);

  useEffect(() => {
    if (servicioId) cargar();
  }, [cargar, servicioId]);

  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
        Reseñas de clientes
      </h4>

      {loading && <p className="text-sm text-gray-500">Cargando reseñas…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Todavía no hay reseñas para este servicio.
        </p>
      )}

      <ul className="space-y-3">
        {data.map((r) => (
          <li key={r._id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{nombreCliente(r.cliente)}</span>
              <span className="text-xs text-gray-400">{formatDate(r.fecha)}</span>
            </div>
            <EstrellaCalificacion calificacion={r.puntuacion} tamaño="sm" mostrarNumero={false} />
            {r.comentario && (
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{r.comentario}</p>
            )}
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ListaResenas;
