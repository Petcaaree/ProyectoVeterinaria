import React, { useRef, useState } from 'react';
import { Upload, Info, CheckCircle, X, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadDocumentToCloudinary } from '../../services/cloudinaryService';
import {
  TIPO_DOCUMENTO_LABEL,
  TIPO_DOCUMENTO_INFO,
  TipoDocumento,
  MAX_DOCUMENTOS_POR_TIPO_MULTIPLE,
} from '../../types/verificacion';

interface SubidorDocumentosMultiplesProps {
  tipo: TipoDocumento;
  urls: string[];
  onChange: (urls: string[]) => void;
}

const MAX_MB = 10;
const ACCEPTED = 'image/*,application/pdf';

const esPdf = (url: string) => url.toLowerCase().includes('.pdf');

const SubidorDocumentosMultiples: React.FC<SubidorDocumentosMultiplesProps> = ({ tipo, urls, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(0); // cantidad subiéndose
  const [error, setError] = useState<string | null>(null);

  const restantes = MAX_DOCUMENTOS_POR_TIPO_MULTIPLE - urls.length;
  const lleno = restantes <= 0;

  const handleFiles = async (files: FileList) => {
    setError(null);
    const arr = Array.from(files).slice(0, restantes);
    if (arr.length === 0) return;

    // Validar tamaño antes de subir.
    for (const f of arr) {
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`"${f.name}" supera los ${MAX_MB} MB`);
        return;
      }
    }

    setSubiendo(arr.length);
    try {
      const subidas: string[] = [];
      for (const file of arr) {
        const r = await uploadDocumentToCloudinary(file, `verificaciones/${tipo.toLowerCase()}`);
        subidas.push(r.secure_url);
      }
      onChange([...urls, ...subidas]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivos');
    } finally {
      setSubiendo(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (idx: number) => {
    onChange(urls.filter((_, i) => i !== idx));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <label className="font-semibold text-gray-800 text-sm flex items-center space-x-1">
          <span>{TIPO_DOCUMENTO_LABEL[tipo]}</span>
          <span className="text-red-500">*</span>
          <span className="relative group ml-1">
            <Info className="h-4 w-4 text-gray-400 hover:text-purple-600 cursor-help" />
            <span className="invisible group-hover:visible absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl leading-relaxed">
              {TIPO_DOCUMENTO_INFO[tipo]}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
            </span>
          </span>
          <span className="text-xs text-gray-500 font-normal ml-2">
            ({urls.length}/{MAX_DOCUMENTOS_POR_TIPO_MULTIPLE})
          </span>
        </label>
        {urls.length > 0 && <CheckCircle className="h-5 w-5 text-green-600" />}
      </div>

      {/* Grid de previews */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {urls.map((url, idx) => (
            <div key={`${url}-${idx}`} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {esPdf(url) ? (
                <a href={url} target="_blank" rel="noopener noreferrer"
                   className="flex flex-col items-center justify-center aspect-square text-red-500 hover:bg-red-50">
                  <FileText className="h-10 w-10 mb-1" />
                  <span className="text-xs">PDF</span>
                </a>
              ) : (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square">
                  <img src={url} alt="Documento" className="w-full h-full object-cover" />
                </a>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-90 hover:opacity-100 hover:bg-red-50 text-red-600"
                aria-label="Eliminar"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone para agregar más */}
      {!lleno && (
        <div
          role="button"
          tabIndex={subiendo > 0 ? -1 : 0}
          aria-label={`Subir archivos para ${tipo}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !subiendo && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !subiendo) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
            subiendo ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
        >
          {subiendo > 0 ? (
            <p className="text-sm text-purple-600 font-semibold">
              Subiendo {subiendo} archivo{subiendo === 1 ? '' : 's'}…
            </p>
          ) : (
            <>
              <div className="flex justify-center space-x-1 mb-2">
                <Upload className="h-6 w-6 text-gray-400" />
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Hacé click o arrastrá <strong>varios archivos</strong> a la vez
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Imágenes o PDF · Máx. {MAX_MB} MB c/u · {restantes} restante{restantes === 1 ? '' : 's'}
              </p>
            </>
          )}
        </div>
      )}

      {lleno && (
        <p className="text-xs text-gray-500 text-center py-2">
          Llegaste al máximo de {MAX_DOCUMENTOS_POR_TIPO_MULTIPLE} archivos. Eliminá uno para subir otro.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        onChange={handleSelect}
        className="hidden"
        disabled={subiendo > 0 || lleno}
      />

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default SubidorDocumentosMultiples;
