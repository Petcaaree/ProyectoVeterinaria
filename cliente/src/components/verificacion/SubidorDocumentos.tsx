import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X, CheckCircle, Info } from 'lucide-react';
import { uploadDocumentToCloudinary } from '../../services/cloudinaryService';
import { TIPO_DOCUMENTO_LABEL, TIPO_DOCUMENTO_INFO, TipoDocumento } from '../../types/verificacion';

interface SubidorDocumentosProps {
  tipo: TipoDocumento;
  urlActual?: string | null;
  onUploaded: (url: string) => void;
  onRemoved?: () => void;
  // Si está, oculta el header (label + tooltip) — útil para slots dentro de un wrapper múltiple.
  hideHeader?: boolean;
}

const MAX_MB = 10;
const ACCEPTED = 'image/*,application/pdf';

const SubidorDocumentos: React.FC<SubidorDocumentosProps> = ({ tipo, urlActual, onUploaded, onRemoved, hideHeader = false }) => {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlLocal, setUrlLocal] = useState<string | null>(urlActual ?? null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_MB} MB`);
      return;
    }
    setSubiendo(true);
    try {
      const result = await uploadDocumentToCloudinary(file, `verificaciones/${tipo.toLowerCase()}`);
      setUrlLocal(result.secure_url);
      setNombreArchivo(file.name);
      onUploaded(result.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir archivo');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setUrlLocal(null);
    setNombreArchivo(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onRemoved?.();
  };

  const esPdf = (url: string | null) => !!url && url.toLowerCase().includes('.pdf');

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {!hideHeader && (
        <div className="flex items-start justify-between mb-2">
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
          </label>
          {urlLocal && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
        </div>
      )}

      {urlLocal ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
          <div className="flex items-center space-x-3 min-w-0">
            {esPdf(urlLocal) ? (
              <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
            ) : (
              <ImageIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
            )}
            <a
              href={urlLocal}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 truncate hover:underline"
            >
              {nombreArchivo ?? 'Ver archivo'}
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 p-1"
            aria-label="Quitar archivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {subiendo ? 'Subiendo…' : 'Hacé click o arrastrá un archivo'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Imágenes o PDF, máx. {MAX_MB} MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleSelect}
        className="hidden"
        disabled={subiendo}
      />

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default SubidorDocumentos;
