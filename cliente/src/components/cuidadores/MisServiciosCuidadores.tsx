import React, { useState } from 'react';
import { ArrowLeft, Shield, Calendar, Clock, User, MapPin, Phone, Star, CheckCircle, XCircle, AlertCircle, Filter, Plus, Edit, Trash2, Home } from 'lucide-react';

interface MisServiciosCuidadoresProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}

interface CaregiverService {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  services: string[];
  availability: string[];
  areas: string[];
  isActive: boolean;
  createdDate: string;
  bookingsCount: number;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  client: string;
  pet: string;
  phone: string;
  pricePerDay: number;
  totalDays: number;
  totalPrice: number;
  notes?: string;
  serviceName: string;
  area: string;
}

const MisServiciosCuidadores: React.FC<MisServiciosCuidadoresProps> = ({ userType, onBack }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Mock data para servicios
  const [services, setServices] = useState<CaregiverService[]>([
    {
      id: '1',
      name: 'Cuidado Premium 24/7',
      description: 'Cuidado integral de tu mascota con atención personalizada las 24 horas del día',
      pricePerDay: 80000,
      services: ['Alimentación', 'Paseos', 'Medicación', 'Compañía 24/7', 'Reportes diarios'],
      availability: ['Lunes a Domingo'],
      areas: ['Chapinero', 'Zona Rosa', 'Chicó'],
      isActive: true,
      createdDate: '2024-01-10',
      bookingsCount: 15
    },
    {
      id: '2',
      name: 'Cuidado Diurno',
      description: 'Cuidado durante el día con paseos, alimentación y compañía',
      pricePerDay: 50000,
      services: ['Alimentación', 'Paseos', 'Juegos', 'Compañía diurna'],
      availability: ['Lunes a Viernes'],
      areas: ['Chapinero', 'Zona Rosa'],
      isActive: true,
      createdDate: '2024-01-05',
      bookingsCount: 22
    },
    {
      id: '3',
      name: 'Cuidado de Fin de Semana',
      description: 'Servicio especializado para fines de semana y días festivos',
      pricePerDay: 65000,
      services: ['Alimentación', 'Paseos', 'Medicación', 'Compañía'],
      availability: ['Sábado', 'Domingo', 'Festivos'],
      areas: ['Suba', 'Engativá'],
      isActive: false,
      createdDate: '2024-01-01',
      bookingsCount: 8
    }
  ]);

  // Mock data para reservas
  const bookings: Booking[] = [
    {
      id: '1',
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      status: 'confirmed',
      client: 'Ana García',
      pet: 'Max (Golden Retriever)',
      phone: '+57 300 123 4567',
      pricePerDay: 80000,
      totalDays: 4,
      totalPrice: 320000,
      serviceName: 'Cuidado Premium 24/7',
      area: 'Chapinero',
      notes: 'Mascota muy activa, necesita medicación para la artritis a las 8 AM'
    },
    {
      id: '2',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      status: 'pending',
      client: 'Carlos Mendoza',
      pet: 'Luna (Siamés)',
      phone: '+57 301 234 5678',
      pricePerDay: 50000,
      totalDays: 3,
      totalPrice: 150000,
      serviceName: 'Cuidado Diurno',
      area: 'Zona Rosa'
    },
    {
      id: '3',
      startDate: '2024-01-10',
      endDate: '2024-01-12',
      status: 'completed',
      client: 'María López',
      pet: 'Rocky (Bulldog Francés)',
      phone: '+57 302 345 6789',
      pricePerDay: 80000,
      totalDays: 3,
      totalPrice: 240000,
      serviceName: 'Cuidado Premium 24/7',
      area: 'Chicó'
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    return filter === 'all' || booking.status === filter;
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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !service.isActive }
          : service
      )
    );
  };

  const deleteService = (serviceId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
    }
  };

  if (userType !== 'cuidador') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
            <p className="text-gray-600">
              Solo los cuidadores pueden acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mis Servicios de Cuidado</h1>
                  <p className="text-gray-600">Gestiona tus servicios y reservas de cuidado</p>
                </div>
              </div>
              
              <button className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg">
                <Plus className="h-5 w-5" />
                <span>Nuevo Servicio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.isActive).length}</p>
                <p className="text-gray-600">Servicios Activos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
                <p className="text-gray-600">Reservas Confirmadas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {services.reduce((acc, service) => acc + service.bookingsCount, 0)}
                </p>
                <p className="text-gray-600">Total Cuidados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'services'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mis Servicios ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reservas de Cuidado ({filteredBookings.length})
              </button>
            </nav>
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="p-6">
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes servicios creados</h3>
                  <p className="text-gray-600 mb-6">Crea tu primer servicio de cuidado para comenzar a recibir reservas</p>
                  <button className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    <Plus className="h-5 w-5" />
                    <span>Crear Primer Servicio</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="font-medium text-gray-900">Precio:</span>
                              <p className="text-orange-600 font-bold">{formatPrice(service.pricePerDay)}/día</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Servicios:</span>
                              <p className="text-gray-600">{service.services.length} incluidos</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Reservas:</span>
                              <p className="text-gray-600">{service.bookingsCount} total</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Creado:</span>
                              <p className="text-gray-600">{new Date(service.createdDate).toLocaleDateString('es-ES')}</p>
                            </div>
                          </div>

                          {/* Services Included */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Servicios incluidos:</h4>
                            <div className="flex flex-wrap gap-1">
                              {service.services.map((includedService, index) => (
                                <span key={index} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                  {includedService}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleServiceStatus(service.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              service.isActive
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {service.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteService(service.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Availability and Areas */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Disponibilidad:</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.availability.map((period, index) => (
                              <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                {period}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Zonas de servicio:</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.areas.map((area, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              {/* Filters */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Todas', count: bookings.length },
                    { key: 'pending', label: 'Pendientes', count: bookings.filter(b => b.status === 'pending').length },
                    { key: 'confirmed', label: 'Confirmadas', count: bookings.filter(b => b.status === 'confirmed').length },
                    { key: 'completed', label: 'Completadas', count: bookings.filter(b => b.status === 'completed').length },
                    { key: 'cancelled', label: 'Canceladas', count: bookings.filter(b => b.status === 'cancelled').length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        filter === key
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{label}</span>
                      {count > 0 && (
                        <span className={`text-xs rounded-full px-2 py-0.5 ${
                          filter === key 
                            ? 'bg-white bg-opacity-20 text-white' 
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay reservas de cuidado</h3>
                  <p className="text-gray-600">
                    {filter === 'all' 
                      ? 'Aún no tienes reservas de cuidado'
                      : `No tienes reservas ${getStatusConfig(filter).text.toLowerCase()}`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div key={booking.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 p-3 rounded-full">
                              <Shield className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {booking.serviceName}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDateRange(booking.startDate, booking.endDate)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{booking.totalDays} día{booking.totalDays > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{booking.area}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                <strong>Mascota:</strong> {booking.pet}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.textColor} flex items-center space-x-1`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{statusConfig.text}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-orange-600">{formatPrice(booking.totalPrice)}</div>
                              <div className="text-xs text-gray-500">{formatPrice(booking.pricePerDay)}/día</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Propietario: {booking.client}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{booking.phone}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="bg-white p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Instrucciones especiales:</strong> {booking.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                  Aceptar Reserva
                                </button>
                                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                  Rechazar
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                  Iniciar Cuidado
                                </button>
                                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                                  Ver Instrucciones
                                </button>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Ver Reporte Final
                              </button>
                            )}
                          </div>
                          
                          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                            Contactar Propietario
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisServiciosCuidadores;