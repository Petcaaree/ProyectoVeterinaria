import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, Calendar, Clock, User, MapPin, Phone, Star, CheckCircle, XCircle, AlertCircle, Filter, Plus, Edit, Trash2 } from 'lucide-react';

interface MisServiciosVeterinariosProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}

interface VeterinaryService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  availableHours: string[];
  serviceType: string;
  isActive: boolean;
  createdDate: string;
  bookingsCount: number;
}

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  client: string;
  pet: string;
  phone: string;
  price: number;
  duration: number;
  notes?: string;
  serviceName: string;
}

const MisServiciosVeterinarios: React.FC<MisServiciosVeterinariosProps> = ({ userType, onBack }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Mock data para información de la clínica
  const clinicInfo: ClinicInfo = {
    name: 'Clínica Veterinaria San Martín',
    address: 'Carrera 15 #85-32, Chapinero',
    phone: '+57 301 234 5678',
    email: 'info@veterinariasanmartin.com'
  };

  // Mock data para servicios
  const [services, setServices] = useState<VeterinaryService[]>([
    {
      id: '1',
      name: 'Consulta General',
      description: 'Chequeo general, peso, temperatura y examen físico completo',
      price: 40000,
      duration: 45,
      availableHours: ['9:00', '10:30', '14:00', '15:30'],
      serviceType: 'Consulta',
      isActive: true,
      createdDate: '2024-01-10',
      bookingsCount: 25
    },
    {
      id: '2',
      name: 'Vacunación',
      description: 'Aplicación de vacunas según el plan de vacunación de tu mascota',
      price: 35000,
      duration: 30,
      availableHours: ['9:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      serviceType: 'Vacunación',
      isActive: true,
      createdDate: '2024-01-05',
      bookingsCount: 18
    },
    {
      id: '3',
      name: 'Baño y Aseo Completo',
      description: 'Baño completo con champú especial, secado, corte de uñas y limpieza de oídos',
      price: 25000,
      duration: 90,
      availableHours: ['9:00', '11:00', '14:00', '16:00'],
      serviceType: 'Estética',
      isActive: false,
      createdDate: '2024-01-01',
      bookingsCount: 12
    }
  ]);

  // Mock data para reservas
  const bookings: Booking[] = [
    {
      id: '1',
      date: '2024-01-15',
      time: '10:30',
      status: 'confirmed',
      client: 'Ana García',
      pet: 'Max (Golden Retriever)',
      phone: '+57 300 123 4567',
      price: 40000,
      duration: 45,
      serviceName: 'Consulta General',
      notes: 'Primera consulta, revisar historial de vacunas'
    },
    {
      id: '2',
      date: '2024-01-18',
      time: '15:00',
      status: 'pending',
      client: 'Carlos Mendoza',
      pet: 'Luna (Siamés)',
      phone: '+57 301 234 5678',
      price: 35000,
      duration: 30,
      serviceName: 'Vacunación'
    },
    {
      id: '3',
      date: '2024-01-12',
      time: '09:00',
      status: 'completed',
      client: 'María López',
      pet: 'Rocky (Bulldog Francés)',
      phone: '+57 302 345 6789',
      price: 40000,
      duration: 45,
      serviceName: 'Consulta General'
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (userType !== 'veterinaria') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
            <p className="text-gray-600">
              Solo los veterinarios pueden acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8">
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
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mis Servicios Veterinarios</h1>
                  <p className="text-gray-600">{clinicInfo.name}</p>
                </div>
              </div>
              
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                <Plus className="h-5 w-5" />
                <span>Nuevo Servicio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clinic Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Clínica</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{clinicInfo.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{clinicInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{clinicInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">4.8 (127 reseñas)</span>
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
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mis Servicios ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Citas Médicas ({filteredBookings.length})
              </button>
            </nav>
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="p-6">
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes servicios creados</h3>
                  <p className="text-gray-600 mb-6">Crea tu primer servicio veterinario para comenzar a recibir citas</p>
                  <button className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {service.serviceType}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Precio:</span>
                              <p className="text-blue-600 font-bold">{formatPrice(service.price)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Duración:</span>
                              <p className="text-gray-600">{service.duration} min</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Citas:</span>
                              <p className="text-gray-600">{service.bookingsCount} total</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Creado:</span>
                              <p className="text-gray-600">{new Date(service.createdDate).toLocaleDateString('es-ES')}</p>
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

                      {/* Available Hours */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Horarios disponibles:</h4>
                        <div className="flex flex-wrap gap-1">
                          {service.availableHours.map((hour, index) => (
                            <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {hour}
                            </span>
                          ))}
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

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay citas médicas</h3>
                  <p className="text-gray-600">
                    {filter === 'all' 
                      ? 'Aún no tienes citas médicas programadas'
                      : `No tienes citas ${getStatusConfig(filter).text.toLowerCase()}`
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
                            <div className="bg-blue-100 p-3 rounded-full">
                              <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {booking.serviceName}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(booking.date)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{booking.time} ({booking.duration} min)</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                <strong>Paciente:</strong> {booking.pet}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.textColor} flex items-center space-x-1`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{statusConfig.text}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">{formatPrice(booking.price)}</div>
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
                              <strong>Notas:</strong> {booking.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                  Confirmar Cita
                                </button>
                                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                  Rechazar
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                  Iniciar Consulta
                                </button>
                                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                                  Reprogramar
                                </button>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Ver Historia Clínica
                              </button>
                            )}
                          </div>
                          
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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

export default MisServiciosVeterinarios;