import React, { useState, useEffect, useCallback } from 'react';
import { getProveedoresPendientes, resolverVerificacion } from '../../api/adminApi';

interface Documento {
  tipo: string;
  url: string;
  fechaSubida?: string;
}

interface Verificacion {
  tipoEstablecimiento: string;
  razonSocial: string | null;
  cuit: string;
  matriculaProfesional: string;
  direccion: {
    calle: string;
    numero: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
  };
  telefono: string;
  documentos: Documento[];
  estadoVerificacion: string;
  motivoRechazo: string | null;
  fechaActualizacion: string;
}

interface ProveedorPendiente {
  veterinariaId: string;
  nombre: string;
  email: string;
  nombreUsuario: string;
  verificacion: Verificacion;
}

interface AdminVerificacionesProps {
  onResolved?: () => void;
}

const TIPO_DOC_LABEL: Record<string, string> = {
  HABILITACION_MUNICIPAL: 'Habilitación municipal',
  FOTO_FRENTE: 'Foto del frente',
  FOTO_INTERIOR: 'Foto del interior',
  COMPROBANTE_DOMICILIO: 'Comprobante de domicilio',
  CONSTANCIA_FISCAL: 'Constancia fiscal',
};

const formatFecha = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const AdminVerificaciones: React.FC<AdminVerificacionesProps> = ({ onResolved }) => {
  const [items, setItems] = useState<ProveedorPendiente[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [selected, setSelected] = useState<ProveedorPendiente | null>(null);
  const [accion, setAccion] = useState<'VERIFICADO' | 'RECHAZADO' | null>(null);
  const [motivo, setMotivo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchPendientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProveedoresPendientes(page, limit);
      const nextItems = res.data.items || [];
      const nextTotal = res.data.total || 0;
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / limit));
      // Si la página actual quedó fuera de rango (p.ej. resolvimos el último ítem
      // de la última página), saltamos a la última válida y dejamos que el
      // próximo render dispare el re-fetch.
      if (page > nextTotalPages) {
        setTotal(nextTotal);
        setPage(nextTotalPages);
        return;
      }
      setItems(nextItems);
      setTotal(nextTotal);
    } catch (err) {
      console.error('Error al cargar verificaciones pendientes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchPendientes(); }, [fetchPendientes]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const closeDetalle = () => {
    setSelected(null);
    setAccion(null);
    setMotivo('');
    setError('');
  };

  const handleResolver = async () => {
    if (!selected || !accion) return;
    if (accion === 'RECHAZADO' && !motivo.trim()) {
      setError('Debés ingresar un motivo de rechazo');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await resolverVerificacion(selected.veterinariaId, accion, motivo.trim() || undefined);
      closeDetalle();
      await fetchPendientes();
      onResolved?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'No se pudo resolver la verificación');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verificaciones de proveedores</h2>
          <p className="text-sm text-gray-500 mt-1">{total} pendientes de revisión</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          No hay verificaciones pendientes.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">CUIT</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Última actualización</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.veterinariaId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.nombre}</div>
                    <div className="text-xs text-gray-500">{p.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.verificacion.cuit}</td>
                  <td className="px-4 py-3 text-gray-700">{p.verificacion.tipoEstablecimiento}</td>
                  <td className="px-4 py-3 text-gray-700">{formatFecha(p.verificacion.fechaActualizacion)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(p)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-gray-600">Página {page} de {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.nombre}</h3>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>
              <button onClick={closeDetalle} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Tipo:</span> <span className="font-medium">{selected.verificacion.tipoEstablecimiento}</span></div>
                <div><span className="text-gray-500">CUIT:</span> <span className="font-medium">{selected.verificacion.cuit}</span></div>
                <div><span className="text-gray-500">Matrícula:</span> <span className="font-medium">{selected.verificacion.matriculaProfesional}</span></div>
                <div><span className="text-gray-500">Teléfono:</span> <span className="font-medium">{selected.verificacion.telefono}</span></div>
                {selected.verificacion.razonSocial && (
                  <div className="col-span-2"><span className="text-gray-500">Razón social:</span> <span className="font-medium">{selected.verificacion.razonSocial}</span></div>
                )}
                <div className="col-span-2">
                  <span className="text-gray-500">Dirección:</span>{' '}
                  <span className="font-medium">
                    {selected.verificacion.direccion.calle} {selected.verificacion.direccion.numero}, {selected.verificacion.direccion.localidad}, {selected.verificacion.direccion.provincia} ({selected.verificacion.direccion.codigoPostal})
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Documentación</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selected.verificacion.documentos.map((d, i) => (
                    <button
                      key={`${d.tipo}-${i}`}
                      onClick={() => setPreviewUrl(d.url)}
                      className="border border-gray-200 rounded-lg overflow-hidden text-left hover:border-purple-500 transition-colors"
                    >
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src={d.url} alt={d.tipo} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div className="p-2 text-xs text-gray-700 font-medium">{TIPO_DOC_LABEL[d.tipo] || d.tipo}</div>
                    </button>
                  ))}
                </div>
              </div>

              {accion === 'RECHAZADO' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de rechazo</label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Indicá el motivo para que el proveedor pueda corregirlo"
                  />
                </div>
              )}

              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {accion === null ? (
                <>
                  <button
                    onClick={() => setAccion('RECHAZADO')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => setAccion('VERIFICADO')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                  >
                    Aprobar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setAccion(null); setMotivo(''); setError(''); }}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleResolver}
                    disabled={actionLoading}
                    className={`px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 ${
                      accion === 'VERIFICADO' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {actionLoading ? 'Procesando...' : accion === 'VERIFICADO' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview de imagen */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <img src={previewUrl} alt="documento" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default AdminVerificaciones;
