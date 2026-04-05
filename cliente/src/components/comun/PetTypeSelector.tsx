import React from 'react';
import { PET_TYPES, petKeyFromLabel } from '../../utils/servicioUtils';

interface PetTypeSelectorProps {
  selectedPets: string[];
  onToggle: (pet: string) => void;
  color: string;
}

const PetTypeSelector: React.FC<PetTypeSelectorProps> = ({ selectedPets, onToggle, color }) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Mascotas Aceptadas *
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PET_TYPES.map(pet => {
          const petKey = petKeyFromLabel(pet);
          const isSelected = selectedPets?.includes(petKey);
          return (
            <button
              key={pet}
              type="button"
              onClick={() => onToggle(pet)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? `bg-${color}-500 text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pet}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PetTypeSelector;
