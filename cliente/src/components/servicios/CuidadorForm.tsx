import React from 'react';
import DaySelector from '../comun/DaySelector';
import PetTypeSelector from '../comun/PetTypeSelector';

interface CuidadorFormData {
  idCuidador: string | undefined;
  nombreServicio: string;
  descripcion: string;
  precio: string;
  diasDisponibles: string[];
  mascotasAceptadas: string[];
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  direccion: {
    calle: string;
    altura: string;
    localidad: { nombre: string; ciudad: { nombre: string } };
  };
}

interface CuidadorFormProps {
  formData: CuidadorFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onArrayChange: (field: string, value: string) => void;
}

const CuidadorForm: React.FC<CuidadorFormProps> = ({ formData, onInputChange, onArrayChange }) => {
  return (
    <div className="bg-orange-50 p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Contacto *</label>
          <input type="text" name="nombreContacto" value={formData.nombreContacto} onChange={onInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Tu nombre completo" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contacto *</label>
          <input type="email" name="emailContacto" value={formData.emailContacto} onChange={onInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="tu@email.com" required />
        </div>
      </div>

      <div className="grid md:grid-cols-1 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de Contacto *</label>
          <input type="tel" name="telefonoContacto" value={formData.telefonoContacto} onChange={onInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="+57 300 123 4567" required />
        </div>
      </div>

      <DaySelector selectedDays={formData.diasDisponibles} onToggle={(day) => onArrayChange('diasDisponibles', day)} color="orange" />

      <PetTypeSelector selectedPets={formData.mascotasAceptadas} onToggle={(pet) => onArrayChange('mascotasAceptadas', pet)} color="orange" />
    </div>
  );
};

export default CuidadorForm;
