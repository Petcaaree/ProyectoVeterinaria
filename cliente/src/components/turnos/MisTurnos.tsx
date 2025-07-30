import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, MapPin, Phone, Star, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';

interface MisTurnosProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  service: string;
  client?: string;
  pet?: string;
  provider?: string;
  location?: string;
  phone?: string;
  price: number;
  duration?: number;
  notes?: string;
}

const MisTurnos: React.FC<MisTurnosProps> = ({ userType, onBack }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Mock data - diferentes según el tipo de usuario
  const getAppointments = (): Appointment[] => {
    if (userType === 'cliente') {
      return [
        {
          id: '1',
          date: '2024-01-15',
          time: '10:00',
          status: 'confirmed',
          service: 'Consulta Veterinaria',
          provider: 'Dr. Carlos López',
          location: 'Clínica Veterinaria San Martín',
          phone: '+57 301 234 5678',
          price: 40000,
          duration: 45,
          pet: 'Max (Golden Retriever)'
        },
        {
          id: '2',
          date: '2024-01-18',
          time: '15:30',
          status: 'pending',
          service: 'Paseo Premium',
          provider: 'María Rodríguez',
          location: 'Parque El Virrey',
          phone: '+57 302 345 6789',
          price: 18000,
          duration: 120,
          pet: 'Luna (Siamés)'
        },
        {
          id: '3',
          date: '2024-01-12',
          time: '09:00',
          status: 'completed',
          service: 'Cuidado Diurno',
          provider: 'Pedro Martínez',
          location: 'Domicilio del cuidador',
          phone: '+57 303 456 7890',
          price: 65000,
          pet: 'Rocky (Bulldog Francés)'
        }
      ];
    } else {
      return [
        {
          id: '1',
          date: '2024-01-15',
          time: '10:00',
          status: 'confirmed',
          service: userType === 'veterinary' ? 'Consulta General' : userType === 'walker' ? 'Paseo Básico' : 'Cuidado 24/7',
          client: 'Ana García',
          pet: 'Max (Golden Retriever)',
          phone: '+57 300 123 4567',
          price: userType === 'veterinary' ? 40000 : userType === 'walker' ? 15000 : 80000,
          duration: userType === 'veterinary' ? 45 : userType === 'walker' ? 60 : 1440,
          notes: 'Mascota muy activa, necesita ejercicio extra'
        },
        {
          id: '2',
          date: '2024-01-18',
          time: '15:30',
          status: 'pending',
          service: userType === 'veterinary' ? 'Vacunación' : userType === 'walker' ? 'Paseo Premium' : 'Cuidado Diurno',
          client: 'Carlos Mendoza',
          pet: 'Luna (Siamés)',
          phone: '+57 301 234 5678',
          price: userType === 'veterinary' ? 35000 : userType === 'walker' ? 18000 : 65000,
          duration: userType === 'veterinary' ? 30 : userType === 'walker' ? 120 : 720
        },
        {
          id: '3',
          date: '2024-01-12',
          time: '09:00',
          status: 'completed',
          service: userType === 'veterinary' ? 'Control Veterinario' : userType === 'walker' ? 'Paseo Socialización' : 'Cuidado Fin de Semana',
          client: 'María López',
          pet: 'Rocky (Bulldog Francés)',
          phone: '+57 302 345 6789',
          price: userType === 'veterinary' ? 40000 : userType === 'walker' ? 20000 : 120000,
          duration: userType === 'veterinary' ? 45 : userType === 'walker' ? 90 : 2880
        }
      ];
    }
  };

  const appointments = getAppointments();

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    return matchesFilter;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'yellow', icon: AlertCircle, text: 'Pendiente', bg: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'confirmed':
        return { color: 'blue', icon: CheckCircle, text: 'Confirmado', bg: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'completed':
        return { color: 'green', icon: CheckCircle, text: 'Completado', bg: 'bg-green-100', textColor: 'text-green-800' };
      case 'cancelled':
        return { color: 'red', icon: XCircle, text: 'Cancelado', bg: 'bg-red-100', textColor: 'text-red-800' };
      default:
        return { color: 'gray', icon: AlertCircle, text: 'Desconocido', bg: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTitle = () => {
    switch (userType) {
      case 'owner': return 'Mis Turnos';
      case 'veterinary': return 'Mis Citas Veterinarias';
      case 'walker': return 'Mis Paseos Programados';
      case 'caregiver': return 'Mis Servicios de Cuidado';
      default: return 'Mis Turnos';
    }
  };

  const getEmptyMessage = () => {
    switch (userType) {
      case 'owner': return 'No tienes turnos programados';
      case 'veterinary': return 'No tienes citas veterinarias programadas';
      case 'walker': return 'No tienes paseos programados';
      case 'caregiver': return 'No tienes servicios de cuidado programados';
      default: return 'No tienes turnos programados';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full relative">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  {filteredAppointments.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {filteredAppointments.length}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                  <p className="text-gray-600">
                    {filteredAppointments.length > 0 
                      ? `Tienes ${filteredAppointments.length} cita${filteredAppointments.length > 1 ? 's' : ''} programada${filteredAppointments.length > 1 ? 's' : ''}`
                      : 'No tienes citas programadas'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{filteredAppointments.length}</div>
                  <div className="text-sm text-gray-600">
                    {filter === 'all' ? 'Total' : getStatusConfig(filter).text}
                  </div>
                </div>
                
                {userType !== 'owner' && filteredAppointments.filter(a => a.status === 'pending').length > 0 && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>Gestionar Citas</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters integrados en el header */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'Todas', count: appointments.length },
                  { key: 'pending', label: 'Pendientes', count: appointments.filter(a => a.status === 'pending').length },
                  { key: 'confirmed', label: 'Confirmadas', count: appointments.filter(a => a.status === 'confirmed').length },
                  { key: 'completed', label: 'Completadas', count: appointments.filter(a => a.status === 'completed').length },
                  { key: 'cancelled', label: 'Canceladas', count: appointments.filter(a => a.status === 'cancelled').length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      filter === key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{label}</span>
                    {count > 0 && (
                      <span className={`text-xs rounded-full px-2 py-0.5 ${
                        filter === key 
                          ? 'bg-white bg-opacity-20 text-white' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{getEmptyMessage()}</h3>
            <p className="text-gray-600">
              {userType === 'owner' 
                ? 'Reserva un servicio para ver tus turnos aquí'
                : 'Los clientes que reserven tus servicios aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{appointment.service}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                              {appointment.duration && (
                                <span>({appointment.duration} min)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.textColor} flex items-center space-x-1`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{statusConfig.text}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{formatPrice(appointment.price)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {userType === 'owner' ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Proveedor: {appointment.provider}</span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{appointment.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{appointment.phone}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Cliente: {appointment.client}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Mascota: {appointment.pet}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{appointment.phone}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {userType === 'owner' ? (
                        // Acciones para dueños (solo pueden ver y calificar)
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Ver Detalles
                          </button>
                          {appointment.status === 'completed' && (
                            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                              Calificar Servicio
                            </button>
                          )}
                        </div>
                      ) : (
                        // Acciones para proveedores de servicios (pueden confirmar/cancelar)
                        <div className="flex space-x-2">
                          {appointment.status === 'pending' && (
                            <>
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                Confirmar
                              </button>
                              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                Cancelar
                              </button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Ver Detalles
                              </button>
                              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                                Reprogramar
                              </button>
                              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                Cancelar Cita
                              </button>
                            </>
                          )}
                          {appointment.status === 'completed' && (
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                              Ver Detalles
                            </button>
                          )}
                        </div>
                      )}
                      
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Contactar {userType === 'owner' ? 'Proveedor' : 'Cliente'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisTurnos;