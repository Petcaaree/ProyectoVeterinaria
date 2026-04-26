import React, { useEffect, useState } from 'react';
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
  const [modo, setModo] = useState<'form' | 'estado'>(() => {
    if (!estadoVerificacion) return 'form';
    return estadoVerificacion.estadoVerificacion === 'NO_INICIADA' ? 'form' : 'estado';
  });

  useEffect(() => {
    // Refrescamos en background sin bloquear el render.
    refrescarEstadoVerificacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
