import React from 'react';
import { generateTimeSlots } from '../../utils/servicioUtils';
import DaySelector from '../comun/DaySelector';
import TimeSlotSelector from '../comun/TimeSlotSelector';

interface PaseadorFormData {
  idPaseador: string | undefined;
  nombreServicio: string;
  maxPerros: number | string;
  descripcion: string;
  precio: string;
  duracionMinutos: string;
  horariosDisponibles: string[];
  diasDisponibles: string[];
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  direccion: {
    calle: string;
    altura: string;
    localidad: { nombre: string; ciudad: { nombre: string } };
  };
}

interface PaseadorFormProps {
  formData: PaseadorFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onDurationBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onArrayChange: (field: string, value: string) => void;
  onMaxPerrosChange: (value: string) => void;
  onMaxPerrosBlur: (value: string) => void;
}

const PaseadorForm: React.FC<PaseadorFormProps> = ({
  formData,
  onInputChange,
  onDurationBlur,
  onArrayChange,
  onMaxPerrosChange,
  onMaxPerrosBlur,
}) => {
  const durationValue = formData.duracionMinutos;
  const availableTimeSlots = durationValue && parseInt(durationValue) >= 30
    ? generateTimeSlots(parseInt(durationValue))
    : ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  return (
    <div className="bg-green-50 p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad máxima de perros por paseo *</label>
          <input
            type="number"
            name="maxPerros"
            min={1}
            step={1}
            value={formData.maxPerros === undefined || formData.maxPerros === null ? '' : formData.maxPerros}
            onChange={e => onMaxPerrosChange(e.target.value.replace(/^0+(?!$)/, ''))}
            onBlur={e => onMaxPerrosBlur(e.target.value.replace(/^0+(?!$)/, ''))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: 3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duración del Paseo *</label>
          <input
            type="number"
            name="duracionMinutos"
            value={formData.duracionMinutos}
            onChange={onInputChange}
            onBlur={onDurationBlur}
            min="30"
            step="30"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: 30, 60, 90..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">Se redondeará automáticamente a múltiplos de 30 minutos</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contacto *</label>
          <input type="email" name="emailContacto" value={formData.emailContacto} onChange={onInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="tu@email.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de Contacto *</label>
          <input type="tel" name="telefonoContacto" value={formData.telefonoContacto} onChange={onInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="+57 300 123 4567" required />
        </div>
      </div>

      <DaySelector selectedDays={formData.diasDisponibles} onToggle={(day) => onArrayChange('diasDisponibles', day)} color="green" />

      <TimeSlotSelector
        availableSlots={availableTimeSlots}
        selectedSlots={formData.horariosDisponibles}
        onToggle={(time) => onArrayChange('horariosDisponibles', time)}
        disabled={!formData.duracionMinutos || parseInt(formData.duracionMinutos) < 30}
        disabledMessage="Primero ingresa la duración del paseo (mínimo 30 min) para ver los horarios disponibles"
        duracionMinutos={formData.duracionMinutos}
        color="green"
      />
    </div>
  );
};

export default PaseadorForm;
