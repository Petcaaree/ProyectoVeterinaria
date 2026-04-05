import React, { useState, useEffect, useCallback } from 'react';
import { getServicios, moderarServicio } from '../../api/adminApi';
import ConfirmModal from './ConfirmModal';

const TIPOS_SERVICIO = [
  { key: 'veterinaria', label: 'Veterinarias' },
  { key: 'paseador', label: 'Paseadores' },
  { key: 'cuidador', label: 'Cuidadores' },
];

const ESTADOS_FILTRO = [
  { key: '', label: 'Todos' },
  { key: 'Activada', label: 'Activados' },
  { key: 'Desactivada', label: 'Desactivados' },
];

interface Servicio {
  _id: string;
  nombreServicio: string;
  precio: number;
  estado: string;
  usuarioProveedor?: {
    nombreUsuario: string;
    nombreClinica?: string;
  };
}

const AdminServicios: React.FC = () => {
  const [tipoActual, setTipoActual] = useState('veterinaria');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'aprobar' | 'suspender'>('aprobar');
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchServicios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getServicios(tipoActual, page, 10, estadoFiltro);
      setServicios(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
    } finally {
      setLoading(false);
    }
  }, [tipoActual, page, estadoFiltro]);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  useEffect(() => {
    setPage(1);
  }, [tipoActual, estadoFiltro]);

  const openModal = (action: 'aprobar' | 'suspender', servicio: Servicio) => {
    setModalAction(action);
    setSelectedService(servicio);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedService) return;
    setActionLoading(true);
    try {
      await moderarServicio(tipoActual, selectedService._id, modalAction);
      setModalOpen(false);
      fetchServicios();
    } catch (err) {
      console.error('Error en moderacion:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion de Servicios</h2>

      {/* Tabs tipo servicio */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-4">
        {TIPOS_SERVICIO.map((tipo) => (
          <button
            key={tipo.key}
            onClick={() => setTipoActual(tipo.key)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              tipoActual === tipo.key
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tipo.label}
          </button>
        ))}
      </div>

      {/* Filtro estado */}
      <div className="flex space-x-2 mb-6">
        {ESTADOS_FILTRO.map((estado) => (
          <button
            key={estado.key}
            onClick={() => setEstadoFiltro(estado.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              estadoFiltro === estado.key
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {estado.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : servicios.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron servicios</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Servicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servicios.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{s.nombreServicio}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.usuarioProveedor?.nombreClinica || s.usuarioProveedor?.nombreUsuario || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrecio(s.precio)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.estado === 'Activada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {s.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      {s.estado === 'Desactivada' ? (
                        <button
                          onClick={() => openModal('aprobar', s)}
                          className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Activar
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal('suspender', s)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Pagina {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        title={modalAction === 'aprobar' ? 'Activar servicio' : 'Desactivar servicio'}
        message={
          modalAction === 'aprobar'
            ? `Estas por activar "${selectedService?.nombreServicio}". Los clientes podran verlo y reservarlo.`
            : `Estas por desactivar "${selectedService?.nombreServicio}". Los clientes no podran verlo.`
        }
        confirmText={modalAction === 'aprobar' ? 'Activar' : 'Desactivar'}
        variant={modalAction === 'aprobar' ? 'info' : 'warning'}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminServicios;
