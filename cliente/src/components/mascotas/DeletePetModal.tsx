import React from 'react';
import { Trash2, Heart, Dog, Cat, Bird } from 'lucide-react';

interface Mascota {
  id: string;
  nombre: string;
  edad: number;
  tipo: string;
  raza?: string;
  peso?: number;
  fotos?: string[];
}

interface DeletePetModalProps {
  mascota: Mascota;
  isDeleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const getSpeciesIcon = (tipo: string) => {
  switch (tipo) {
    case 'PERRO': return Dog;
    case 'GATO': return Cat;
    case 'AVE': return Bird;
    default: return Heart;
  }
};

const getSpeciesLabel = (tipo: string) => {
  switch (tipo) {
    case 'PERRO': return 'Perro';
    case 'GATO': return 'Gato';
    case 'AVE': return 'Ave';
    default: return 'Otro';
  }
};

const DeletePetModal: React.FC<DeletePetModalProps> = ({ mascota, isDeleting, deleteError, onConfirm, onCancel }) => {
  const SpeciesIcon = getSpeciesIcon(mascota.tipo);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Eliminar Mascota</h3>
              <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0">
              {mascota.fotos && mascota.fotos.length > 0 ? (
                <img src={mascota.fotos[0]} alt={mascota.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <SpeciesIcon className="h-8 w-8 text-white opacity-70" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{mascota.nombre}</h4>
              <p className="text-gray-600 text-sm">
                {getSpeciesLabel(mascota.tipo)}{mascota.raza && ` • ${mascota.raza}`}
              </p>
              <p className="text-gray-500 text-xs">
                {mascota.edad} año{mascota.edad !== 1 ? 's' : ''}{mascota.peso && ` • ${mascota.peso} kg`}
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">No se puede eliminar la mascota</h4>
                  <p className="text-sm text-red-700 mt-1">{deleteError}</p>
                </div>
              </div>
            </div>
          )}

          {!deleteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">¿Estás seguro de que quieres eliminar a {mascota.nombre}?</h4>
                  <p className="text-sm text-red-700 mt-1">Se eliminarán permanentemente todos los datos, fotos y registros asociados con esta mascota.</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            {deleteError ? (
              <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                Cerrar
              </button>
            ) : (
              <>
                <button onClick={onCancel} disabled={isDeleting} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={onConfirm} disabled={isDeleting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-2">
                  {isDeleting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Eliminando...</span></>
                  ) : (
                    <><Trash2 className="h-4 w-4" /><span>Eliminar</span></>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePetModal;
