import React, { useState, useEffect } from 'react';
import { getConfiguracion, updateConfiguracion } from '../../api/adminApi';

const AdminConfiguracion: React.FC = () => {
  const [comisionPorcentaje, setComisionPorcentaje] = useState(10);
  const [comisionFija, setComisionFija] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getConfiguracion();
        setComisionPorcentaje(res.data.comisionPorcentaje);
        setComisionFija(res.data.comisionFija);
      } catch (err) {
        console.error('Error al cargar configuracion:', err);
        setError('Error al cargar la configuracion');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      await updateConfiguracion({ comisionPorcentaje, comisionFija });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error al guardar configuracion:', err);
      setError('Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuracion del Sistema</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comisiones</h3>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comision porcentual (%)
            </label>
            <input
              type="number"
              value={comisionPorcentaje}
              onChange={(e) => setComisionPorcentaje(Number(e.target.value))}
              min={0}
              max={100}
              step={0.1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Porcentaje que se aplica sobre cada transaccion</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comision fija ($)
            </label>
            <input
              type="number"
              value={comisionFija}
              onChange={(e) => setComisionFija(Number(e.target.value))}
              min={0}
              step={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Monto fijo que se cobra por cada transaccion</p>
          </div>

          {/* Preview */}
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-sm font-medium text-purple-800 mb-2">Vista previa de comision</p>
            <p className="text-xs text-purple-600">
              Para una transaccion de $10.000: comision = ${((10000 * comisionPorcentaje) / 100 + comisionFija).toLocaleString('es-AR')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              Configuracion guardada exitosamente
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar configuracion'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
