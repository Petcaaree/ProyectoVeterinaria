import React from 'react';
import { Edit, Trash2, Calendar, Weight, Heart, Dog, Cat, Bird } from 'lucide-react';

interface Mascota {
  id: string;
  nombre: string;
  edad: number;
  tipo: string;
  raza?: string;
  peso?: number;
  fotos?: string[];
}

interface PetCardProps {
  mascota: Mascota;
  onEdit: (mascota: Mascota) => void;
  onDelete: (mascota: Mascota) => void;
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

const PetCard: React.FC<PetCardProps> = ({ mascota, onEdit, onDelete }) => {
  const SpeciesIcon = getSpeciesIcon(mascota.tipo);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Photo */}
      <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative">
        {mascota.fotos && mascota.fotos.length > 0 ? (
          <img src={mascota.fotos[0]} alt={mascota.nombre} className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SpeciesIcon className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full">
          <span className="text-xs font-semibold text-gray-700">
            {mascota.fotos ? mascota.fotos.length : 0} foto{(mascota.fotos?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{mascota.nombre}</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <SpeciesIcon className="h-4 w-4" />
              <span className="text-sm">{getSpeciesLabel(mascota.tipo)}</span>
              {mascota.raza && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm">{mascota.raza}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{mascota.edad} año{mascota.edad !== 1 ? 's' : ''}</span>
          </div>
          {mascota.peso && (
            <div className="flex items-center space-x-2">
              <Weight className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{mascota.peso} kg</span>
            </div>
          )}
        </div>

        {/* Gallery preview */}
        {mascota.fotos && mascota.fotos.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Fotos adicionales:</p>
            <div className="flex space-x-2 overflow-x-auto">
              {mascota.fotos.slice(1, 4).map((foto, index) => (
                <img key={index} src={foto} alt={`${mascota.nombre} ${index + 2}`} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              ))}
              {mascota.fotos.length > 4 && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-600">+{mascota.fotos.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-1"
            onClick={() => onEdit(mascota)}
          >
            <Edit className="h-4 w-4" /><span>Editar</span>
          </button>
          <button
            onClick={() => onDelete(mascota)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
