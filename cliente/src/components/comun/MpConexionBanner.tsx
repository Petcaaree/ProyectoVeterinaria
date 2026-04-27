import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Link2, Unlink } from 'lucide-react';
import { getMpStatus, getMpAuthUrl, desconectarMp } from '../../api/mpOauthApi';

interface MpStatus {
  mpConectado: boolean;
  mpUserId: string | null;
  mpConectadoAt: string | null;
}

interface Props {
  onChange?: (conectado: boolean) => void;
}

const MpConexionBanner: React.FC<Props> = ({ onChange }) => {
  const [status, setStatus] = useState<MpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await getMpStatus();
      setStatus(res.data);
      onChange?.(!!res.data.mpConectado);
    } catch (err) {
      console.error('Error consultando estado MP', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleConectar = async () => {
    setWorking(true);
    setError('');
    try {
      const res = await getMpAuthUrl();
      window.location.href = res.data.auth_url;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'No se pudo iniciar la vinculación');
      setWorking(false);
    }
  };

  const handleDesconectar = async () => {
    if (!confirm('¿Querés desvincular tu cuenta de Mercado Pago? No vas a poder recibir pagos hasta volver a conectarla.')) return;
    setWorking(true);
    setError('');
    try {
      await desconectarMp();
      await fetchStatus();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'No se pudo desvincular');
    } finally {
      setWorking(false);
    }
  };

  if (loading) return null;

  if (status?.mpConectado) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-900">Mercado Pago conectado</p>
            <p className="text-xs text-green-700 mt-0.5">
              Recibís los pagos directamente en tu cuenta. La comisión PetConnect se descuenta automáticamente.
            </p>
          </div>
        </div>
        <button
          onClick={handleDesconectar}
          disabled={working}
          className="text-xs font-medium text-green-800 hover:text-green-900 underline flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
        >
          <Unlink className="h-3.5 w-3.5" /> Desvincular
        </button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-900">Vinculá tu cuenta de Mercado Pago</p>
          <p className="text-xs text-yellow-800 mt-0.5">
            Sin tu cuenta vinculada no podés publicar servicios. Los clientes te pagan directamente y nosotros retenemos solo la comisión PetConnect.
          </p>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <button
            onClick={handleConectar}
            disabled={working}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
          >
            <Link2 className="h-4 w-4" />
            {working ? 'Redirigiendo...' : 'Conectar Mercado Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MpConexionBanner;
