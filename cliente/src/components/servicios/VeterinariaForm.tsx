import React, { useState } from 'react';
import { formatDireccion } from '../../utils/formatDireccion';
import { VETERINARIA_SERVICE_TYPES, generateTimeSlots } from '../../utils/servicioUtils';
import DaySelector from '../comun/DaySelector';
import TimeSlotSelector from '../comun/TimeSlotSelector';
import PetTypeSelector from '../comun/PetTypeSelector';
import DireccionModal from '../comun/DireccionModal';

interface DireccionData {
  calle: string;
  altura: string;
  localidad: {
    nombre: string;
    ciudad: {
      nombre: string;
    };
  };
}

interface VeterinariaFormData {
  idVeterinaria: string | undefined;
  nombreServicio: string;
  descripcion: string;
  precio: string;
  duracionMinutos: string;
  horariosDisponibles: string[];
  diasDisponibles: string[];
  mascotasAceptadas: string[];
  nombreClinica: string;
  direccion: DireccionData;
  telefonoClinica: string;
  emailClinica: string;
  tipoServicio: string;
}

interface VeterinariaFormProps {
  formData: VeterinariaFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onDurationBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onArrayChange: (field: string, value: string) => void;
  onDireccionChange: (direccion: DireccionData) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  direccionUsuario: any;
}

const VeterinariaForm: React.FC<VeterinariaFormProps> = ({
  formData,
  onInputChange,
  onDurationBlur,
  onArrayChange,
  onDireccionChange,
  direccionUsuario,
}) => {
  const [showDireccionModal, setShowDireccionModal] = useState(false);

  const durationValue = formData.duracionMinutos;
  const availableTimeSlots = durationValue && parseInt(durationValue) >= 30
    ? generateTimeSlots(parseInt(durationValue))
    : ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleDireccionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__nueva__') {
      setShowDireccionModal(true);
    } else if (e.target.value === '__default__') {
      // No hacer nada
    } else {
      let direccionSeleccionada: DireccionData | null = null;
      if (direccionUsuario && e.target.value === formatDireccion(direccionUsuario)) {
        direccionSeleccionada = {
          calle: direccionUsuario.calle || '',
          altura: direccionUsuario.altura || '',
          localidad: {
            nombre: (direccionUsuario.localidad && typeof direccionUsuario.localidad === 'object')
              ? direccionUsuario.localidad.nombre || ''
              : direccionUsuario.localidad || '',
            ciudad: {
              nombre: (direccionUsuario.localidad && direccionUsuario.localidad.ciudad && typeof direccionUsuario.localidad.ciudad === 'object')
                ? direccionUsuario.localidad.ciudad.nombre || ''
                : (direccionUsuario.localidad && direccionUsuario.localidad.ciudad) || ''
            }
          }
        };
      } else if (formData.direccion && e.target.value === formatDireccion(formData.direccion)) {
        direccionSeleccionada = {
          calle: formData.direccion.calle || '',
          altura: formData.direccion.altura || '',
          localidad: {
            nombre: (formData.direccion.localidad && typeof formData.direccion.localidad === 'object')
              ? formData.direccion.localidad.nombre || ''
              : '',
            ciudad: {
              nombre: (formData.direccion.localidad && formData.direccion.localidad.ciudad && typeof formData.direccion.localidad.ciudad === 'object')
                ? formData.direccion.localidad.ciudad.nombre || ''
                : ''
            }
          }
        };
      }
      if (direccionSeleccionada) {
        onDireccionChange(direccionSeleccionada);
      }
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Clínica</h3>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Clínica *</label>
          <input
            type="text"
            name="nombreClinica"
            value={formData.nombreClinica}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Nombre de tu clínica"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Este campo se obtiene automáticamente de tu perfil de usuario</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio *</label>
          <select
            name="tipoServicio"
            value={formData.tipoServicio}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleccionar tipo</option>
            {VETERINARIA_SERVICE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duración Estimada (minutos) *</label>
          <input
            type="number"
            name="duracionMinutos"
            value={formData.duracionMinutos}
            onChange={onInputChange}
            onBlur={onDurationBlur}
            min="30"
            max="480"
            step="30"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 30, 60, 90..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">Se redondeará automáticamente a múltiplos de 30 minutos</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
          <select
            name="direccion"
            value={formatDireccion(formData.direccion) || '__default__'}
            onChange={handleDireccionSelect}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="__default__" disabled hidden>Selecciona una dirección...</option>
            {direccionUsuario && (
              <option value={formatDireccion(direccionUsuario)}>{formatDireccion(direccionUsuario)}</option>
            )}
            {formData.direccion && formatDireccion(formData.direccion) !== formatDireccion(direccionUsuario) && formatDireccion(formData.direccion) !== '' && (
              <option value={formatDireccion(formData.direccion)}>{formatDireccion(formData.direccion)}</option>
            )}
            <option value="__nueva__">Agregar nueva dirección...</option>
          </select>
          <DireccionModal
            isOpen={showDireccionModal}
            onClose={() => setShowDireccionModal(false)}
            onSave={(dir) => { onDireccionChange(dir); setShowDireccionModal(false); }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email de la Clínica *</label>
          <input type="email" name="emailClinica" value={formData.emailClinica} onChange={onInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="clinica@email.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
          <input type="number" name="telefonoClinica" value={formData.telefonoClinica} onChange={onInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+57 300 123 4567" required />
        </div>
      </div>

      <DaySelector selectedDays={formData.diasDisponibles} onToggle={(day) => onArrayChange('diasDisponibles', day)} color="blue" />

      <TimeSlotSelector
        availableSlots={availableTimeSlots}
        selectedSlots={formData.horariosDisponibles}
        onToggle={(time) => onArrayChange('horariosDisponibles', time)}
        disabled={!formData.duracionMinutos}
        disabledMessage="Primero ingresa la duración del servicio para ver los horarios disponibles"
        duracionMinutos={formData.duracionMinutos}
        color="blue"
      />

      <PetTypeSelector selectedPets={formData.mascotasAceptadas} onToggle={(pet) => onArrayChange('mascotasAceptadas', pet)} color="blue" />
    </div>
  );
};

export default VeterinariaForm;
