import React, { useState, useMemo } from 'react';
import { AlertCircle, Building2, Stethoscope, Home, Check, ShieldCheck, FileText, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import CuitInput from './CuitInput';
import SubidorDocumentos from './SubidorDocumentos';
import SubidorDocumentosMultiples from './SubidorDocumentosMultiples';
import {
  TipoEstablecimiento,
  TipoDocumento,
  TIPO_ESTABLECIMIENTO_LABEL,
  DOCS_REQUERIDOS_POR_TIPO,
  TIPOS_ENTIDAD_COMERCIAL,
  TIPOS_DOCUMENTO_MULTIPLE,
  PayloadVerificacion,
  DireccionEstablecimiento,
} from '../../types/verificacion';

interface FormularioVerificacionProps {
  // Si está presente, estamos en modo "reenvío" y el form arranca pre-cargado.
  valoresIniciales?: Partial<PayloadVerificacion> | null;
  modoReenvio?: boolean;
  onSubmitted: () => void;
  onCancel?: () => void;
}

const CARDS_TIPO: Array<{ tipo: TipoEstablecimiento; icon: React.ReactNode; descripcion: string }> = [
  { tipo: 'CLINICA', icon: <Building2 className="h-6 w-6" />, descripcion: 'Entidad comercial con local a la calle' },
  { tipo: 'HOSPITAL', icon: <Stethoscope className="h-6 w-6" />, descripcion: 'Hospital veterinario habilitado' },
  { tipo: 'CONSULTORIO_PRIVADO', icon: <Home className="h-6 w-6" />, descripcion: 'Veterinario independiente en domicilio' },
];

const direccionVacia: DireccionEstablecimiento = {
  calle: '',
  numero: '',
  piso: '',
  depto: '',
  localidad: '',
  provincia: '',
  codigoPostal: '',
};

const FormularioVerificacion: React.FC<FormularioVerificacionProps> = ({
  valoresIniciales,
  modoReenvio = false,
  onSubmitted,
  onCancel,
}) => {
  const { usuario, enviarVerificacion, reenviarDocsVerificacion } = useAuth();

  const [tipo, setTipo] = useState<TipoEstablecimiento | null>(valoresIniciales?.tipoEstablecimiento ?? null);
  const [razonSocial, setRazonSocial] = useState(valoresIniciales?.razonSocial ?? '');
  const [cuit, setCuit] = useState(valoresIniciales?.cuit ?? '');
  const [matricula, setMatricula] = useState(valoresIniciales?.matriculaProfesional ?? '');
  const [telefono, setTelefono] = useState(valoresIniciales?.telefono ?? '');
  const [direccion, setDireccion] = useState<DireccionEstablecimiento>(
    valoresIniciales?.direccion ?? direccionVacia
  );
  const [usarDireccionRegistro, setUsarDireccionRegistro] = useState(false);
  // documentos[tipo] = array de URLs. Para tipos single tiene 0 o 1 elemento; para multi varios.
  const [documentos, setDocumentos] = useState<Partial<Record<TipoDocumento, string[]>>>(
    () => {
      const base: Partial<Record<TipoDocumento, string[]>> = {};
      valoresIniciales?.documentos?.forEach((d) => {
        if (!base[d.tipo]) base[d.tipo] = [];
        base[d.tipo]!.push(d.url);
      });
      return base;
    }
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docsRequeridos = useMemo(() => (tipo ? DOCS_REQUERIDOS_POR_TIPO[tipo] : []), [tipo]);

  const handleCheckboxDireccionRegistro = (checked: boolean) => {
    setUsarDireccionRegistro(checked);
    if (checked && usuario?.direccion) {
      const localidad = typeof usuario.direccion.localidad === 'string'
        ? usuario.direccion.localidad
        : usuario.direccion.localidad?.nombre ?? '';
      setDireccion({
        calle: usuario.direccion.calle ?? '',
        numero: String(usuario.direccion.altura ?? ''),
        piso: '',
        depto: '',
        localidad: localidad as string,
        provincia: '',
        codigoPostal: '',
      });
    } else {
      setDireccion(direccionVacia);
    }
  };

  const validar = (): string | null => {
    if (!tipo) return 'Seleccioná un tipo de establecimiento';
    if (!/^\d{2}-\d{8}-\d{1}$/.test(cuit)) return 'CUIT debe tener formato XX-XXXXXXXX-X';
    if (!matricula.trim()) return 'La matrícula profesional es requerida';
    if (!telefono.trim()) return 'El teléfono es requerido';
    if (!direccion.calle.trim() || !direccion.numero.trim() || !direccion.localidad.trim()
        || !direccion.provincia.trim() || !direccion.codigoPostal.trim()) {
      return 'Completá todos los campos obligatorios de la dirección';
    }
    if (TIPOS_ENTIDAD_COMERCIAL.includes(tipo) && !razonSocial.trim()) {
      return 'La razón social es requerida para clínicas y hospitales';
    }
    const faltantes = docsRequeridos.filter((t) => !documentos[t] || documentos[t]!.length === 0);
    if (faltantes.length > 0) {
      return `Faltan documentos: ${faltantes.map((f) => f.replace(/_/g, ' ')).join(', ')}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validar();
    if (err) { setError(err); return; }
    setError(null);
    setEnviando(true);
    try {
      const payload: PayloadVerificacion = {
        tipoEstablecimiento: tipo!,
        razonSocial: TIPOS_ENTIDAD_COMERCIAL.includes(tipo!) ? razonSocial.trim() : null,
        cuit,
        matriculaProfesional: matricula.trim(),
        direccion: {
          ...direccion,
          piso: direccion.piso?.trim() || null,
          depto: direccion.depto?.trim() || null,
        },
        telefono: telefono.trim(),
        // Aplanamos: cada URL se convierte en una entrada {tipo, url} en el array.
        documentos: docsRequeridos.flatMap((t) =>
          (documentos[t] ?? []).map((url) => ({ tipo: t, url }))
        ),
      };
      if (modoReenvio) {
        await reenviarDocsVerificacion(payload);
      } else {
        await enviarVerificacion(payload);
      }
      onSubmitted();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'No se pudo enviar la verificación');
    } finally {
      setEnviando(false);
    }
  };

  const labelBase = 'block text-sm font-semibold text-gray-700 mb-1';
  const inputBase = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100';

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 p-8 text-white relative overflow-hidden">
        <div className="absolute top-4 right-8 opacity-10">
          <ShieldCheck className="h-32 w-32" />
        </div>
        <div className="relative z-10 flex items-start space-x-4">
          <div className="bg-white bg-opacity-20 backdrop-blur p-3 rounded-2xl">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {modoReenvio ? 'Reenviar documentación' : 'Verificación de tu veterinaria'}
            </h2>
            <p className="text-purple-100 max-w-2xl">
              Completá estos datos para poder publicar servicios. Toda la información es revisada manualmente por un administrador.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6 bg-gray-50">
        {/* Tipo de establecimiento */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-1">¿Qué tipo de establecimiento sos?</h3>
          <p className="text-sm text-gray-500 mb-4">Esto define qué documentos necesitamos verificar.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CARDS_TIPO.map((c) => {
              const seleccionado = tipo === c.tipo;
              return (
                <button
                  key={c.tipo}
                  type="button"
                  onClick={() => setTipo(c.tipo)}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                    seleccionado
                      ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {seleccionado && (
                    <div className="absolute top-3 right-3 bg-purple-600 text-white p-1 rounded-full">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                  )}
                  <div className={`p-3 rounded-xl inline-flex mb-3 ${
                    seleccionado ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.icon}
                  </div>
                  <div className="font-bold text-gray-900 mb-1">
                    {TIPO_ESTABLECIMIENTO_LABEL[c.tipo]}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">{c.descripcion}</div>
                </button>
              );
            })}
          </div>
        </section>

        {tipo && (
          <>
            {/* Datos legales */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Datos legales</h3>
              </div>

            {TIPOS_ENTIDAD_COMERCIAL.includes(tipo) && (
              <div>
                <label className={labelBase}>Razón Social *</label>
                <input
                  className={inputBase}
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Clínica Veterinaria SRL"
                />
              </div>
            )}

            <div>
              <label className={labelBase}>CUIT *</label>
              <CuitInput value={cuit} onChange={setCuit} />
            </div>

            <div>
              <label className={labelBase}>Matrícula del veterinario responsable *</label>
              <input
                className={inputBase}
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="MP-12345"
              />
            </div>

            <div>
              <label className={labelBase}>Teléfono del establecimiento *</label>
              <input
                className={inputBase}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="1133445566"
              />
            </div>
          </section>

          {/* Dirección */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Dirección del establecimiento</h3>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usarDireccionRegistro}
                  onChange={(e) => handleCheckboxDireccionRegistro(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Usar la dirección de mi registro</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className={labelBase}>Calle *</label>
                <input
                  className={inputBase}
                  value={direccion.calle}
                  onChange={(e) => setDireccion({ ...direccion, calle: e.target.value })}
                />
              </div>
              <div>
                <label className={labelBase}>Número *</label>
                <input
                  className={inputBase}
                  value={direccion.numero}
                  onChange={(e) => setDireccion({ ...direccion, numero: e.target.value })}
                />
              </div>
              <div>
                <label className={labelBase}>Piso</label>
                <input
                  className={inputBase}
                  value={direccion.piso ?? ''}
                  onChange={(e) => setDireccion({ ...direccion, piso: e.target.value })}
                />
              </div>
              <div>
                <label className={labelBase}>Depto</label>
                <input
                  className={inputBase}
                  value={direccion.depto ?? ''}
                  onChange={(e) => setDireccion({ ...direccion, depto: e.target.value })}
                />
              </div>
              <div>
                <label className={labelBase}>Código Postal *</label>
                <input
                  className={inputBase}
                  value={direccion.codigoPostal}
                  onChange={(e) => setDireccion({ ...direccion, codigoPostal: e.target.value })}
                />
              </div>
              <div>
                <label className={labelBase}>Localidad *</label>
                <input
                  className={inputBase}
                  value={direccion.localidad}
                  onChange={(e) => setDireccion({ ...direccion, localidad: e.target.value })}
                />
              </div>
              <div>
                <label className={labelBase}>Provincia *</label>
                <input
                  className={inputBase}
                  value={direccion.provincia}
                  onChange={(e) => setDireccion({ ...direccion, provincia: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Documentos */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Documentación requerida</h3>
                <p className="text-xs text-gray-500">Imágenes (JPG, PNG) o PDF · Máx. 10 MB cada uno</p>
              </div>
            </div>
            <div className="space-y-3">
              {docsRequeridos.map((td) => {
                if (TIPOS_DOCUMENTO_MULTIPLE.includes(td)) {
                  return (
                    <SubidorDocumentosMultiples
                      key={td}
                      tipo={td}
                      urls={documentos[td] ?? []}
                      onChange={(urls) => setDocumentos({ ...documentos, [td]: urls })}
                    />
                  );
                }
                const urlSingle = documentos[td]?.[0] ?? null;
                return (
                  <SubidorDocumentos
                    key={td}
                    tipo={td}
                    urlActual={urlSingle}
                    onUploaded={(url) => setDocumentos({ ...documentos, [td]: [url] })}
                    onRemoved={() => setDocumentos((prev) => {
                      const copy = { ...prev };
                      delete copy[td];
                      return copy;
                    })}
                  />
                );
              })}
            </div>
          </section>

          {error && (
            <div className="flex items-start space-x-2 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                disabled={enviando}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>{enviando ? 'Enviando…' : modoReenvio ? 'Reenviar documentación' : 'Enviar para verificación'}</span>
            </button>
          </div>
        </>
      )}
      </div>
    </form>
  );
};

export default FormularioVerificacion;
