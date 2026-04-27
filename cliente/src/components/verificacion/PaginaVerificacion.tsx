import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/authContext';
import EstadoVerificacion from './EstadoVerificacion';
import FormularioVerificacion from './FormularioVerificacion';
import { PayloadVerificacion } from '../../types/verificacion';

interface PaginaVerificacionProps {
  onVolver: () => void;
}

/**
 * Contenedor que decide qué mostrar según el estado:
 * - NO_INICIADA → formulario vacío
 * - PENDIENTE / VERIFICADO → pantalla de estado
 * - RECHAZADO → pantalla de estado, con botón que abre el form en modo reenvío
 */
const PaginaVerificacion: React.FC<PaginaVerificacionProps> = ({ onVolver }) => {
  const { estadoVerificacion, refrescarEstadoVerificacion } = useAuth();
  // Inicializamos sincrónicamente con el estado ya cargado del contexto:
  // si NO_INICIADA → form directo, si otro → pantalla de estado.
  // Si todavía no hay estado, default 'form' para evitar flash de "cargando".
  // 'loading' mientras esperamos el primer GET de estado. Evita renderizar el form
  // por defecto y permitir un submit antes de saber si la vet ya tiene verificación.
  const [modo, setModo] = useState<'form' | 'estado' | 'loading' | 'error'>(() => {
    if (!estadoVerificacion) return 'loading';
    return estadoVerificacion.estadoVerificacion === 'NO_INICIADA' ? 'form' : 'estado';
  });

  // Track si ya sincronizamos el modo con un estado real cargado.
  // Después de eso, respetamos cualquier cambio manual (ej. usuario clickea "Reenviar").
  const modoSincronizado = useRef<boolean>(!!estadoVerificacion);

  const fetchEstado = async () => {
    setModo((m) => (m === 'error' ? 'loading' : m));
    const r = await refrescarEstadoVerificacion();
    if (!r && !modoSincronizado.current) {
      // Llegamos a refrescar y seguimos sin estado → la consulta falló.
      setModo('error');
    }
  };

  useEffect(() => {
    fetchEstado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Si arrancamos sin estado, ajustamos el modo cuando llegue el primer estado real.
    if (modoSincronizado.current) return;
    if (!estadoVerificacion) return;
    modoSincronizado.current = true;
    setModo(estadoVerificacion.estadoVerificacion === 'NO_INICIADA' ? 'form' : 'estado');
  }, [estadoVerificacion]);

  if (modo === 'loading') {
    return (
      <div className="max-w-xl mx-auto my-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <p className="text-gray-500">Cargando estado de verificación…</p>
      </div>
    );
  }

  if (modo === 'error') {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white rounded-3xl shadow-2xl p-8 text-center">
        <p className="text-gray-700 mb-2 font-semibold">No pudimos cargar tu estado de verificación.</p>
        <p className="text-sm text-gray-500 mb-6">Verificá tu conexión e intentá de nuevo.</p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onVolver}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Volver
          </button>
          <button
            onClick={fetchEstado}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (modo === 'form') {
    const esReenvio = estadoVerificacion?.estadoVerificacion === 'RECHAZADO';
    const valoresIniciales: Partial<PayloadVerificacion> | null = esReenvio && estadoVerificacion
      ? {
          tipoEstablecimiento: estadoVerificacion.tipoEstablecimiento,
          razonSocial: estadoVerificacion.razonSocial,
          cuit: estadoVerificacion.cuit,
          matriculaProfesional: estadoVerificacion.matriculaProfesional,
          direccion: estadoVerificacion.direccion,
          telefono: estadoVerificacion.telefono,
          documentos: estadoVerificacion.documentos,
        }
      : null;

    return (
      <div className="py-8">
        <FormularioVerificacion
          valoresIniciales={valoresIniciales}
          modoReenvio={esReenvio}
          onSubmitted={() => setModo('estado')}
          onCancel={() => onVolver()}
        />
      </div>
    );
  }

  if (!estadoVerificacion) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center text-gray-500">Cargando estado de verificación…</div>
    );
  }

  return (
    <div className="py-8">
      <EstadoVerificacion
        estado={estadoVerificacion}
        onReenviar={
          estadoVerificacion.estadoVerificacion === 'RECHAZADO' || estadoVerificacion.estadoVerificacion === 'NO_INICIADA'
            ? () => setModo('form')
            : undefined
        }
      />
      <div className="text-center mt-6">
        <button
          onClick={onVolver}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default PaginaVerificacion;
