import React, { useState, useEffect } from 'react';
import ReservaDetalleModal from './ReservaDetalleModal';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const data = await getTodasReservas();
        // Si la API retorna un array en data.data, ajusta aquí:
        setAppointments(data.data || []);
      } catch {
        // Puedes mostrar un mensaje de error si lo deseas
      }
    };
    fetchReservas();
  }, []);

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

  const formatPrice = (price?: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '$0';
    }
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
      case 'cliente': return 'Mis Turnos';
      case 'veterinaria': return 'Mis Citas Veterinarias';
      case 'paseador': return 'Mis Paseos Programados';
      case 'cuidador': return 'Mis Servicios de Cuidado';
      default: return 'Mis Turnos';
    }
  };

  const getEmptyMessage = () => {
    switch (userType) {
      case 'cliente': return 'No tienes turnos programados';
      case 'veterinaria': return 'No tienes citas veterinarias programadas';
      case 'paseador': return 'No tienes paseos programados';
      case 'cuidador': return 'No tienes servicios de cuidado programados';
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
                
                {userType !== 'cliente' && filteredAppointments.filter(a => a.status === 'pending').length > 0 && (
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
                    onClick={() => setFilter(key as typeof filter)}
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
              {userType === 'cliente'
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
                      {userType === 'cliente' ? (
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

                    {/* Apartado de notas eliminado por requerimiento */}

                    {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {/* Acciones para dueño */}
                        {userType === 'cliente' && (
                          <div className="flex space-x-2">
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              onClick={() => { setSelectedReserva(appointment); setModalOpen(true); }}
                            >
                              Ver Detalles
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                              Cancelar
                            </button>
                          </div>
                        )}
                        {/* Acciones para veterinaria, cuidador y paseador */}
                        {['veterinaria', 'cuidador', 'paseador'].includes(userType || '') && (
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
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              onClick={() => { setSelectedReserva(appointment); setModalOpen(true); }}
                            >
                              Ver Detalles
                            </button>
                          </div>
                        )}
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Contactar {userType === 'cliente' ? 'Proveedor' : 'Cliente'}
                        </button>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    {/* Modal de detalle de reserva */}
    <ReservaDetalleModal
      reserva={selectedReserva}
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
    />
  </div>
  );
};

export default MisTurnos;