import React, { useState } from 'react';
import { ArrowLeft, Plus, Save, Stethoscope, Heart, Shield, MapPin, Clock, DollarSign, Calendar, User, Phone, Mail, Award, Home } from 'lucide-react';

interface CrearServicioProps {
  userType: 'owner' | 'veterinary' | 'walker' | 'caregiver' | null;
  onBack: () => void;
}

const CrearServicio: React.FC<CrearServicioProps> = ({ userType, onBack }) => {
  const [formData, setFormData] = useState({
    // Datos comunes
    name: '',
    description: '',
    price: '',
    
    // Veterinario
    duration: '',
    availableHours: [] as string[],
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    serviceType: '',
    
    // Paseador
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    availability: [] as string[],
    pricePerHour: '',
    
    // Cuidador
    pricePerDay: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDurationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'duration' && (userType === 'veterinary' || userType === 'walker')) {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        // Redondear a los 30 minutos más cercanos
        const rounded = Math.round(numValue / 30) * 30;
        setFormData(prev => ({
          ...prev,
          [name]: rounded.toString()
        }));
      }
    }
  };

  const handleArrayChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Service created:', formData);
    alert('¡Servicio creado exitosamente!');
    onBack();
  };

  // Generar horarios disponibles basados en la duración
  const generateTimeSlots = (duration: number) => {
    // Solo permitir duraciones múltiplos de 30 minutos
    if (!duration || duration < 30 || duration % 30 !== 0) return [];
    
    const slots = [];
    const startHour = 10; // 10:00 AM
    const endHour = 20; // 8:00 PM
    const totalMinutes = (endHour - startHour) * 60;
    
    for (let minutes = 0; minutes < totalMinutes; minutes += duration) {
      const hour = Math.floor(minutes / 60) + startHour;
      const minute = minutes % 60;
      
      if (hour < endHour) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  const getServiceConfig = () => {
    switch (userType) {
      case 'veterinary':
        return {
          title: 'Crear Servicio Veterinario',
          icon: Stethoscope,
          color: 'blue',
          description: 'Agrega un nuevo servicio veterinario a tu clínica'
        };
      case 'walker':
        return {
          title: 'Crear Servicio de Paseo',
          icon: Heart,
          color: 'green',
          description: 'Agrega un nuevo tipo de paseo que ofreces'
        };
      case 'caregiver':
        return {
          title: 'Crear Servicio de Cuidado',
          icon: Shield,
          color: 'orange',
          description: 'Agrega un nuevo servicio de cuidado de mascotas'
        };
      case 'owner':
        return {
          title: 'Agregar Mascota',
          icon: User,
          color: 'purple',
          description: 'Registra una nueva mascota en tu perfil'
        };
      default:
        return {
          title: 'Crear Servicio',
          icon: Plus,
          color: 'gray',
          description: 'Agrega un nuevo servicio'
        };
    }
  };

  const config = getServiceConfig();
  const Icon = config.icon;

  // Solo permitir crear servicios a proveedores de servicios, no a dueños
  if (userType === 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
            
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
              <p className="text-gray-600 mb-6">
                Como dueño de mascota, tu función es utilizar los servicios disponibles, no crearlos. 
                Los servicios son creados por veterinarios, paseadores y cuidadores profesionales.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>¿Qué puedes hacer?</strong><br />
                  • Ver y reservar servicios veterinarios<br />
                  • Contratar paseadores profesionales<br />
                  • Encontrar cuidadores especializados<br />
                  • Gestionar tus mascotas registradas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Tipos de servicios veterinarios
  const veterinaryServiceTypes = [
    'Vacunación',
    'Control Veterinario',
    'Baño y Aseo',
    'Desparasitación',
    'Cirugía Menor',
    'Radiografías',
    'Ecografías',
    'Odontología Veterinaria',
    'Hospitalización',
    'Consulta General',
    'Emergencia',
    'Otro'
  ];

  // Generar horarios dinámicamente para veterinarios
  const availableTimeSlots = (userType === 'veterinary' || userType === 'walker') && formData.duration && parseInt(formData.duration) >= 30
    ? generateTimeSlots(parseInt(formData.duration))
    : timeSlots;

  return (
    <div className={`min-h-screen bg-${config.color}-50 py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className={`flex items-center space-x-2 text-${config.color}-600 hover:text-${config.color}-700 mb-4 transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className={`bg-${config.color}-100 p-3 rounded-full`}>
                <Icon className={`h-8 w-8 text-${config.color}-600`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-gray-600">{config.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                    placeholder={
                      userType === 'veterinary' ? 'Ej: Consulta General, Vacunación...' :
                      userType === 'walker' ? 'Ej: Paseo Básico, Paseo Premium...' :
                      'Ej: Cuidado Diurno, Cuidado 24/7...'
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name={userType === 'walker' ? 'pricePerHour' : userType === 'caregiver' ? 'pricePerDay' : 'price'}
                      value={userType === 'walker' ? formData.pricePerHour : userType === 'caregiver' ? formData.pricePerDay : formData.price}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                      placeholder={
                        userType === 'walker' ? 'Precio por hora' :
                        userType === 'caregiver' ? 'Precio por día' :
                        'Precio del servicio'
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                  placeholder="Describe detalladamente tu servicio..."
                  required
                />
              </div>
            </div>

            {/* Campos específicos por tipo de usuario */}
            {userType === 'veterinary' && (
              <>
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Clínica</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Clínica *
                      </label>
                      <input
                        type="text"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de tu clínica"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Servicio *
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {veterinaryServiceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración (minutos) *
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                       onBlur={handleDurationBlur}
                        min="30"
                        step="30"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: 30, 60, 90..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se redondeará automáticamente a múltiplos de 30 minutos
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        name="clinicAddress"
                        value={formData.clinicAddress}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Dirección completa de la clínica"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de la Clínica *
                      </label>
                      <input
                        type="email"
                        name="clinicEmail"
                        value={formData.clinicEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="clinica@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="clinicPhone"
                        value={formData.clinicPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {!formData.duration && (
                      <p className="text-sm text-gray-500 mb-3">
                        Primero ingresa la duración del servicio para ver los horarios disponibles
                      </p>
                    )}
                    <div className="grid grid-cols-5 gap-2">
                      {availableTimeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleArrayChange('availableHours', time)}
                          disabled={!formData.duration}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.availableHours.includes(time)
                              ? 'bg-blue-500 text-white'
                              : !formData.duration 
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {formData.duration && availableTimeSlots.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Horarios generados cada {formData.duration} minutos (de 10:00 AM a 8:00 PM)
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {userType === 'walker' && (
              <>
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración del Paseo *
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                       onBlur={handleDurationBlur}
                        min="30"
                        step="30"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: 30, 60, 90..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se redondeará automáticamente a múltiplos de 30 minutos
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de Contacto *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de Contacto *
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono de Contacto *
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Disponibilidad *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleArrayChange('availability', day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.availability.includes(day)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {(!formData.duration || parseInt(formData.duration) < 30) && (
                      <p className="text-sm text-gray-500 mb-3">
                        Primero ingresa la duración del paseo (mínimo 30 min) para ver los horarios disponibles
                      </p>
                    )}
                    <div className="grid grid-cols-5 gap-2">
                      {availableTimeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleArrayChange('availableHours', time)}
                          disabled={!formData.duration}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.availableHours.includes(time)
                              ? 'bg-green-500 text-white'
                              : (!formData.duration || parseInt(formData.duration) < 30)
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {formData.duration && parseInt(formData.duration) >= 30 && availableTimeSlots.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Horarios generados cada {formData.duration} minutos (de 10:00 AM a 8:00 PM)
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {userType === 'caregiver' && (
              <>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de Contacto *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de Contacto *
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono de Contacto *
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Disponibilidad *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleArrayChange('availability', day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.availability.includes(day)
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors flex items-center justify-center space-x-2`}
              >
                <Save className="h-5 w-5" />
                <span>Crear Servicio</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearServicio;