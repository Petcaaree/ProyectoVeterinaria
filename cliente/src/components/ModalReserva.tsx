import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Dog, Shield } from 'lucide-react';
import CalendarioModerno from './comun/CalendarioModerno';

interface ModalReservaProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  serviceType: 'veterinaria' | 'paseador' | 'cuidador';
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const ModalReserva: React.FC<ModalReservaProps> = ({ isOpen, onClose, service, serviceType, userType }) => {
  const [formData, setFormData] = useState({
    petName: '',
    petSpecies: 'dog',
    ownerName: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    duration: '',
    notes: ''
  });
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'veterinaria': return 'Veterinario/a';
      case 'paseador': return 'Paseador/a';
      case 'cuidador': return 'Cuidador/a';
      default: return 'Usuario';
    }
  };

  if (!isOpen || !service) return null;

  // Verificar si el usuario es dueño
  if (userType !== 'cliente') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Acceso Restringido</h3>
            <p className="text-gray-600 mb-6">
              Solo los dueños de mascotas pueden hacer reservas de servicios.
              {!userType && ' Por favor, inicia sesión como dueño de mascota.'}
              {userType && userType !== 'cliente' && ` Tu cuenta actual es de tipo: ${getUserTypeLabel(userType)}.`}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
              {!userType && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle booking submission
    console.log('Booking submitted:', { service, formData, serviceType });
    alert('¡Reserva enviada exitosamente! Te contactaremos pronto para confirmar.');
    onClose();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const getServiceTitle = () => {
    switch (serviceType) {
      case 'veterinary':
        return `Reservar: ${service.name}`;
      case 'walker':
        return `Contratar Paseador: ${service.name}`;
      case 'caregiver':
        return `Contratar Cuidador: ${service.name}`;
      default:
        return 'Reservar Servicio';
    }
  };

  const getServicePrice = () => {
    switch (serviceType) {
      case 'veterinary':
        return formatPrice(service.price);
      case 'walker':
        return `${formatPrice(service.pricePerHour)}/hora`;
      case 'caregiver':
        return `${formatPrice(service.pricePerDay)}/día`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {getServiceTitle()}
            </h2>
            <p className="text-lg font-semibold text-blue-600">
              {getServicePrice()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pet Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Dog className="h-5 w-5 mr-2" />
              Información de tu Mascota
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Mascota *
                </label>
                <input
                  type="text"
                  required
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Max"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mascota *
                </label>
                <select
                  required
                  value={formData.petSpecies}
                  onChange={(e) => setFormData({ ...formData, petSpecies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                  <option value="bird">Ave</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Tus Datos de Contacto
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Detalles del Servicio
            </h3>
            {(serviceType === 'veterinary' || serviceType === 'walker') && (
              <div className="space-y-4">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Preferida *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMostrarCalendario(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
                    >
                      <span className={formData.date ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.date 
                          ? new Date(formData.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                          : 'Seleccionar fecha'
                        }
                      </span>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Horarios Disponibles - Para Veterinarios */}
                {serviceType === 'veterinary' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['8:00', '9:00', '10:00', '10:30', '11:00', '14:00', '15:00', '15:30', '16:00', '17:00'].map((hour) => {
                        const isAvailable = service.availableHours?.includes(hour);
                        return (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => isAvailable && setFormData({ ...formData, time: hour })}
                            disabled={!isAvailable}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              formData.time === hour && isAvailable
                                ? 'bg-blue-500 text-white shadow-lg'
                                : isAvailable
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                          >
                            {hour}
                          </button>
                        );
                      })}
                    </div>
                    {!formData.time && (
                      <p className="text-sm text-red-600 mt-2">Por favor selecciona un horario disponible</p>
                    )}
                  </div>
                )}

                {/* Horarios Disponibles - Para Paseadores */}
                {serviceType === 'walker' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['8:00', '9:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((hour) => {
                        // Para paseadores, verificamos si está en su disponibilidad general
                        // En un caso real, esto vendría de una API que verifique disponibilidad por fecha
                        const isAvailable = true; // Por ahora todos están disponibles
                        return (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => isAvailable && setFormData({ ...formData, time: hour })}
                            disabled={!isAvailable}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              formData.time === hour && isAvailable
                                ? 'bg-green-500 text-white shadow-lg'
                                : isAvailable
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                          >
                            {hour}
                          </button>
                        );
                      })}
                    </div>
                    {!formData.time && (
                      <p className="text-sm text-red-600 mt-2">Por favor selecciona un horario disponible</p>
                    )}
                  </div>
                )}

                {/* Duración - Solo para Paseadores */}
                {serviceType === 'walker' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Duración del Paseo *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3'].map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => setFormData({ ...formData, duration })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.duration === duration
                              ? 'bg-green-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {duration} hora{duration !== '1' ? 's' : ''}
                        </button>
                      ))}
                    </div>
                    {!formData.duration && (
                      <p className="text-sm text-red-600 mt-2">Por favor selecciona la duración del paseo</p>
                    )}
                  </div>
                )}
              </div>
            )}
              
            {serviceType === 'caregiver' && (
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Período de cuidado *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Fecha de inicio */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Fecha de inicio
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMostrarCalendarioInicio(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex items-center justify-between"
                      >
                        <span className={formData.date ? 'text-gray-900' : 'text-gray-500'}>
                          {formData.date 
                            ? new Date(formData.date).toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })
                            : 'Seleccionar fecha'
                          }
                        </span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Fecha de fin */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Fecha de fin
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMostrarCalendarioFin(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex items-center justify-between"
                      >
                        <span className={formData.duration ? 'text-gray-900' : 'text-gray-500'}>
                          {formData.duration 
                            ? new Date(formData.duration).toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })
                            : 'Seleccionar fecha'
                          }
                        </span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Información de duración */}
                {formData.date && formData.duration && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700">Duración del servicio:</span>
                      <span className="font-bold text-orange-800">
                        {Math.ceil((new Date(formData.duration).getTime() - new Date(formData.date).getTime()) / (1000 * 60 * 60 * 24)) + 1} días
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Información adicional sobre tu mascota, necesidades especiales, etc."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={(serviceType === 'veterinary' && !formData.time) || (serviceType === 'walker' && (!formData.time || !formData.duration))}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Confirmar Reserva
            </button>
          </div>
        </form>
      </div>
      
      {/* Calendario Modal */}
      {mostrarCalendario && (serviceType === 'veterinary' || serviceType === 'walker') && (
        <CalendarioModerno
          fechaSeleccionada={formData.date}
          onFechaSeleccionada={(fecha) => {
            setFormData({ ...formData, date: fecha });
            setMostrarCalendario(false);
          }}
          onCerrar={() => setMostrarCalendario(false)}
          fechaMinima={new Date().toISOString().split('T')[0]}
          colorTema={serviceType === 'walker' ? 'green' : 'blue'}
          titulo="Seleccionar fecha de la cita"
        />
      )}
      
      {/* Calendarios para cuidadores */}
      {mostrarCalendarioInicio && serviceType === 'caregiver' && (
        <CalendarioModerno
          fechaSeleccionada={formData.date}
          onFechaSeleccionada={(fecha) => {
            setFormData({ ...formData, date: fecha });
            setMostrarCalendarioInicio(false);
          }}
          onCerrar={() => setMostrarCalendarioInicio(false)}
          fechaMinima={new Date().toISOString().split('T')[0]}
          colorTema="orange"
          titulo="Fecha de inicio del cuidado"
        />
      )}
      
      {mostrarCalendarioFin && serviceType === 'caregiver' && (
        <CalendarioModerno
          fechaSeleccionada={formData.duration}
          onFechaSeleccionada={(fecha) => {
            setFormData({ ...formData, duration: fecha });
            setMostrarCalendarioFin(false);
          }}
          onCerrar={() => setMostrarCalendarioFin(false)}
          fechaMinima={formData.date || new Date().toISOString().split('T')[0]}
          colorTema="orange"
          titulo="Fecha de fin del cuidado"
        />
      )}
    </div>
  );
};


export default ModalReserva