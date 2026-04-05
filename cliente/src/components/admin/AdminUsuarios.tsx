import React, { useState, useEffect, useCallback } from 'react';
import { getUsuarios, suspenderUsuario, reactivarUsuario, eliminarUsuario } from '../../api/adminApi';
import ConfirmModal from './ConfirmModal';

const TIPOS_USUARIO = [
  { key: 'cliente', label: 'Clientes' },
  { key: 'veterinaria', label: 'Veterinarias' },
  { key: 'paseador', label: 'Paseadores' },
  { key: 'cuidador', label: 'Cuidadores' },
];

interface Usuario {
  _id: string;
  nombreUsuario: string;
  email: string;
  telefono: string;
  suspendido?: boolean;
  motivoSuspension?: string;
  nombreClinica?: string;
}

const AdminUsuarios: React.FC = () => {
  const [tipoActual, setTipoActual] = useState('cliente');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'suspender' | 'reactivar' | 'eliminar'>('suspender');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [motivo, setMotivo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsuarios(tipoActual, page, 10, search);
      setUsuarios(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, [tipoActual, page, search]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    setPage(1);
  }, [tipoActual, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const openModal = (action: 'suspender' | 'reactivar' | 'eliminar', user: Usuario) => {
    setModalAction(action);
    setSelectedUser(user);
    setMotivo('');
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (modalAction === 'suspender') {
        await suspenderUsuario(tipoActual, selectedUser._id, motivo);
      } else if (modalAction === 'reactivar') {
        await reactivarUsuario(tipoActual, selectedUser._id);
      } else if (modalAction === 'eliminar') {
        await eliminarUsuario(tipoActual, selectedUser._id);
      }
      setModalOpen(false);
      fetchUsuarios();
    } catch (err) {
      console.error('Error en accion:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const modalMessages = {
    suspender: {
      title: 'Suspender usuario',
      message: `Estas por suspender a ${selectedUser?.nombreUsuario}. El usuario no podra acceder a la plataforma.`,
      confirmText: 'Suspender',
      variant: 'warning' as const,
    },
    reactivar: {
      title: 'Reactivar usuario',
      message: `Estas por reactivar a ${selectedUser?.nombreUsuario}. El usuario podra acceder nuevamente.`,
      confirmText: 'Reactivar',
      variant: 'info' as const,
    },
    eliminar: {
      title: 'Eliminar usuario',
      message: `Estas por eliminar permanentemente a ${selectedUser?.nombreUsuario}. Esta accion no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger' as const,
    },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion de Usuarios</h2>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TIPOS_USUARIO.map((tipo) => (
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

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4 flex space-x-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron usuarios</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Telefono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{u.nombreUsuario}</div>
                    {u.nombreClinica && <div className="text-xs text-gray-500">{u.nombreClinica}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.telefono}</td>
                  <td className="px-4 py-3">
                    {u.suspendido ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Suspendido
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      {u.suspendido ? (
                        <button
                          onClick={() => openModal('reactivar', u)}
                          className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Reactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal('suspender', u)}
                          className="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          Suspender
                        </button>
                      )}
                      <button
                        onClick={() => openModal('eliminar', u)}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
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
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        loading={actionLoading}
        {...modalMessages[modalAction]}
      />

      {/* Motivo input for suspension */}
      {modalOpen && modalAction === 'suspender' && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Motivo de suspension</h3>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ingresa el motivo de la suspension..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
              rows={3}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
              >
                {actionLoading ? 'Procesando...' : 'Suspender'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;
