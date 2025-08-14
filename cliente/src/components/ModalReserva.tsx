import React, { useState, useEffect } from 'react';
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
  // Helper para parsear fecha DD/MM/AAAA a Date object
  const parsearFecha = (fechaStr: string): Date | null => {
    if (!fechaStr || fechaStr.length === 0) return null;
    
    // Si ya es formato DD/MM/AAAA
    if (fechaStr.includes('/')) {
      const [dia, mes, año] = fechaStr.split('/');
      return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    }
    
    // Si es formato ISO (YYYY-MM-DD) - para compatibilidad
    return new Date(fechaStr);
  };

  // Helper para obtener fecha de hoy en formato DD/MM/AAAA
  const obtenerFechaHoy = (): string => {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

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

  // Limpiar horario seleccionado cuando cambie la fecha
  useEffect(() => {
    if (formData.date && formData.time) {
      const horariosDisponibles = obtenerHorariosDisponibles(formData.date);
      if (!horariosDisponibles.includes(formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.date]);

  // Función para obtener el día de la semana en español y mayúsculas
  const obtenerDiaSemana = (fecha: string): string => {
    const [dia, mes, año] = fecha.split('/');
    const fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[fechaObj.getDay()];
  };

  // Función para verificar si una fecha está disponible (día de la semana)
  const esFechaDisponible = (fecha: string): boolean => {
    // Obtener días disponibles desde diferentes estructuras posibles
    const diasDisponibles = service?.diasDisponibles || service?.servicioReservado?.diasDisponibles;
    
    if (!diasDisponibles || !Array.isArray(diasDisponibles)) return false;
    
    const diaSemana = obtenerDiaSemana(fecha);
    return diasDisponibles.includes(diaSemana);
  };

  // Función para obtener todos los horarios con su estado (disponible/ocupado)
  const obtenerHorariosConEstado = (fecha: string): { horario: string; disponible: boolean }[] => {
    if (!fecha) return [];
    
    // Verificar si el día de la semana está disponible
    if (!esFechaDisponible(fecha)) return [];
    
    // Obtener horarios base del servicio
    const horariosBase = service?.horariosDisponibles || service?.servicioReservado?.horariosDisponibles || [];
    
    if (!horariosBase || horariosBase.length === 0) {
      return [];
    }
    
    // Convertir fecha DD/MM/YYYY a formato para comparar
    const [dia, mes, año] = fecha.split('/');
    const fechaParaComparar = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    
    // Obtener fechas no disponibles
    const fechasNoDisponibles = service?.fechasNoDisponibles || service?.servicioReservado?.fechasNoDisponibles;
    
    let horariosOcupados: string[] = [];
    
    // Buscar horarios ocupados para esta fecha específica
    if (fechasNoDisponibles && Array.isArray(fechasNoDisponibles)) {
      const fechaNoDisponible = fechasNoDisponibles.find((item: { fecha: string; horariosNoDisponibles: string[] }) => {
        if (!item.fecha) return false;
        
        const fechaISO = new Date(item.fecha);
        const fechaComparar = new Date(fechaISO.getFullYear(), fechaISO.getMonth(), fechaISO.getDate());
        const fechaLocal = new Date(fechaParaComparar.getFullYear(), fechaParaComparar.getMonth(), fechaParaComparar.getDate());
        
        return fechaComparar.getTime() === fechaLocal.getTime();
      });
      
      if (fechaNoDisponible?.horariosNoDisponibles) {
        horariosOcupados = fechaNoDisponible.horariosNoDisponibles;
      }
    }
    
    // Crear array con todos los horarios y su estado, ordenados cronológicamente
    const horariosConEstado = horariosBase
      .map((horario: string) => ({
        horario,
        disponible: !horariosOcupados.includes(horario)
      }))
      .sort((a: { horario: string; disponible: boolean }, b: { horario: string; disponible: boolean }) => {
        // Ordenar por hora (convertir HH:MM a minutos para comparar)
        const timeA = a.horario.split(':').map(Number);
        const timeB = b.horario.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        return minutesA - minutesB;
      });
    
    return horariosConEstado;
  };

  // Función para obtener horarios disponibles para una fecha específica (mantener para compatibilidad)
  const obtenerHorariosDisponibles = (fecha: string): string[] => {
    return obtenerHorariosConEstado(fecha)
      .filter(item => item.disponible)
      .map(item => item.horario);
  };

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
              {userType && userType !== 'cliente' && userType in ['veterinaria', 'paseador', 'cuidador'] && ` Tu cuenta actual es de tipo: ${getUserTypeLabel(userType)}.`}
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
    if (!price || isNaN(price)) return 'Precio no disponible';
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const getServiceTitle = () => {
    const serviceName = service?.nombre || service?.name || 'Servicio';
    switch (serviceType) {
      case 'veterinaria':
        return `Reservar: ${serviceName}`;
      case 'paseador':
        return `Contratar Paseador: ${serviceName}`;
      case 'cuidador':
        return `Contratar Cuidador: ${serviceName}`;
      default:
        return 'Reservar Servicio';
    }
  };

  const getServicePrice = () => {
    switch (serviceType) {
      case 'veterinaria':
        return formatPrice(service?.precio || service?.price);
      case 'paseador':
        return `${formatPrice(service?.pricePerHour)}/hora`;
      case 'cuidador':
        return `${formatPrice(service?.pricePerDay)}/día`;
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
            {(serviceType === 'veterinaria' || serviceType === 'paseador') && (
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
                          ? formData.date
                          : 'Seleccionar fecha'
                        }
                      </span>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Horarios Disponibles - Para Veterinarios */}
                {serviceType === 'veterinaria' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {!formData.date ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-700">
                          Por favor selecciona una fecha primero para ver los horarios disponibles
                        </p>
                      </div>
                    ) : !esFechaDisponible(formData.date) ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-700">
                          Este día no está disponible para citas. Días disponibles: {service?.diasDisponibles?.join(', ')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {obtenerHorariosConEstado(formData.date).map((horarioItem) => (
                            <button
                              key={horarioItem.horario}
                              type="button"
                              onClick={() => horarioItem.disponible && setFormData({ ...formData, time: horarioItem.horario })}
                              disabled={!horarioItem.disponible}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.time === horarioItem.horario
                                  ? 'bg-blue-500 text-white shadow-lg'
                                  : horarioItem.disponible
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                                    : 'bg-red-50 text-red-400 cursor-not-allowed opacity-50 line-through'
                              }`}
                              title={horarioItem.disponible ? 'Disponible' : 'Horario ocupado'}
                            >
                              {horarioItem.horario}
                              {!horarioItem.disponible && (
                                <span className="ml-1 text-xs">🚫</span>
                              )}
                            </button>
                          ))}
                        </div>
                        {obtenerHorariosDisponibles(formData.date).length === 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-red-700">
                              No hay horarios disponibles para esta fecha
                            </p>
                          </div>
                        )}
                        {!formData.time && obtenerHorariosDisponibles(formData.date).length > 0 && (
                          <p className="text-sm text-red-600 mt-2">Por favor selecciona un horario disponible</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Horarios Disponibles - Para Paseadores */}
                {serviceType === 'paseador' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {!formData.date ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-700">
                          Por favor selecciona una fecha primero para ver los horarios disponibles
                        </p>
                      </div>
                    ) : !esFechaDisponible(formData.date) ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-700">
                          Este día no está disponible para paseos. Días disponibles: {service?.diasDisponibles?.join(', ')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {obtenerHorariosConEstado(formData.date).map((horarioItem) => (
                            <button
                              key={horarioItem.horario}
                              type="button"
                              onClick={() => horarioItem.disponible && setFormData({ ...formData, time: horarioItem.horario })}
                              disabled={!horarioItem.disponible}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.time === horarioItem.horario
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : horarioItem.disponible
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                                    : 'bg-red-50 text-red-400 cursor-not-allowed opacity-50 line-through'
                              }`}
                              title={horarioItem.disponible ? 'Disponible' : 'Horario ocupado'}
                            >
                              {horarioItem.horario}
                              {!horarioItem.disponible && (
                                <span className="ml-1 text-xs">🚫</span>
                              )}
                            </button>
                          ))}
                        </div>
                        {obtenerHorariosDisponibles(formData.date).length === 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-red-700">
                              No hay horarios disponibles para esta fecha
                            </p>
                          </div>
                        )}
                        {!formData.time && obtenerHorariosDisponibles(formData.date).length > 0 && (
                          <p className="text-sm text-red-600 mt-2">Por favor selecciona un horario disponible</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Duración - Solo para Paseadores */}
                {serviceType === 'paseador' && (
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
              
            {serviceType === 'cuidador' && (
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
                            ? formData.date
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
                            ? formData.duration
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
                        {(() => {
                          const fechaInicio = parsearFecha(formData.date);
                          const fechaFin = parsearFecha(formData.duration);
                          if (fechaInicio && fechaFin) {
                            return Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          }
                          return 0;
                        })()} días
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
              disabled={(serviceType === 'veterinaria' && !formData.time) || (serviceType === 'paseador' && (!formData.time || !formData.duration))}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Confirmar Reserva
            </button>
          </div>
        </form>
      </div>
      
      {/* Calendario Modal */}
      {mostrarCalendario && (serviceType === 'veterinaria' || serviceType === 'paseador') && (() => {
        console.log('Abriendo calendario con service:', service);
        console.log('service?.diasDisponibles:', service?.diasDisponibles);
        return (
          <CalendarioModerno
            key={`calendario-${Date.now()}`} // Forzar recreación del componente
            fechaSeleccionada={formData.date}
            onFechaSeleccionada={(fecha) => {
              setFormData({ ...formData, date: fecha });
              setMostrarCalendario(false);
            }}
            onCerrar={() => setMostrarCalendario(false)}
            fechaMinima={obtenerFechaHoy()}
            colorTema={serviceType === 'paseador' ? 'green' : 'blue'}
            titulo="Seleccionar fecha de la cita"
            diasDisponibles={service?.diasDisponibles || service?.servicioReservado?.diasDisponibles}
          />
        );
      })()}
      
      {/* Calendarios para cuidadores */}
      {mostrarCalendarioInicio && serviceType === 'cuidador' && (
        <CalendarioModerno
          key={`calendario-inicio-${Date.now()}`}
          fechaSeleccionada={formData.date}
          onFechaSeleccionada={(fecha) => {
            setFormData({ ...formData, date: fecha });
            setMostrarCalendarioInicio(false);
          }}
          onCerrar={() => setMostrarCalendarioInicio(false)}
          fechaMinima={new Date().toISOString().split('T')[0]}
          colorTema="orange"
          titulo="Fecha de inicio del cuidado"
          diasDisponibles={service?.diasDisponibles}
        />
      )}
      
      {mostrarCalendarioFin && serviceType === 'cuidador' && (
        <CalendarioModerno
          key={`calendario-fin-${Date.now()}`}
          fechaSeleccionada={formData.duration}
          onFechaSeleccionada={(fecha) => {
            setFormData({ ...formData, duration: fecha });
            setMostrarCalendarioFin(false);
          }}
          onCerrar={() => setMostrarCalendarioFin(false)}
          fechaMinima={formData.date || new Date().toISOString().split('T')[0]}
          colorTema="orange"
          titulo="Fecha de fin del cuidado"
          diasDisponibles={service?.diasDisponibles}
        />
      )}
    </div>
  );
};


export default ModalReserva