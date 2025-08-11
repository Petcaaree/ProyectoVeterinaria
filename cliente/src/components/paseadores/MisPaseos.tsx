import { ArrowLeft, Heart, Calendar, Clock, User, MapPin, Phone, Star, CheckCircle, XCircle, AlertCircle, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {useAuth} from '../../context/authContext.tsx';
import { get } from 'http';
interface MisPaseosProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}


const MisPaseos: React.FC<MisPaseosProps> = ({ userType, onBack }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');
    const [page, setPage] = useState(1);
    const { usuario , getServiciosPaseador} = useAuth();
    // Mock data para información de la clínica
    
  
    // Mock data para servicios
    const [services, setServices] = useState<any>([])
    // Mock data para reservas
    
  useEffect(() => {
     // Simula una carga de datos
    const cargarServicios = async () => {
        if (usuario && usuario.id) {
          try {
            //setIsLoading(true);
            //setError(null);
            const data = await getServiciosPaseador(usuario.id , page);
            setServices(data?.data || []); // Acceder a la propiedad data del objeto respuesta
            console.log('Servicios obtenidos:', data);
          } catch (error) {
            console.error('Error al obtener servicios:', error);
            //setError('Error al cargar los servicios');
            setServices([]); // Asegurar que sea un array vacío en caso de error
          } finally {
            //setIsLoading(false);
          }
        } else {
          //setIsLoading(false);
          setServices([]);
        }
      };
  
      cargarServicios();
      // Aquí podrías hacer una llamada a la API para obtener los servicios del veterinario
  }, [page, usuario, getServiciosPaseador]);
    
  
    const formatPrice = (price: number) => {
      return price.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      });
    };
  
   
  
    const formatDayOfWeek = (day: string) => {
      const dayMap: { [key: string]: string } = {
        'LUNES': 'Lunes',
        'MARTES': 'Martes',
        'MIERCOLES': 'Miércoles',
        'JUEVES': 'Jueves',
        'VIERNES': 'Viernes',
        'SABADO': 'Sábado',
        'DOMINGO': 'Domingo'
      };
      return dayMap[day.toUpperCase()] || day;
    };
  
    const toggleServiceStatus = (serviceId: string, estado: string) => {
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { ...service, estado: estado === 'Activada' ? 'Desactivada' : 'Activada' }
            : service
        )
      );
    };
  
    const deleteService = (serviceId: string) => {
      if (confirm('¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.')) {
        setServices(prev => prev.filter(service => service.id !== serviceId));
      }
    };

  if (userType !== 'paseador') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
            <p className="text-gray-600">
              Solo los paseadores pueden acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-green-600 hover:text-green-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mis Servicios de Paseo</h1>
                  <p className="text-gray-600">Gestiona tus servicios y reservas de paseos</p>
                </div>
              </div>
              
              <button className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                <Plus className="h-5 w-5" />
                <span>Nuevo Servicio</span>
              </button>
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
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mis Servicios ({services.length})
              </button>
              
            </nav>
          </div>

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="p-6">
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes servicios creados</h3>
                  <p className="text-gray-600 mb-6">Crea tu primer servicio de paseo para comenzar a recibir reservas</p>
                  <button className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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
                            <h3 className="text-xl font-bold text-gray-900">{service.nombreServicio}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.estado === 'Activada' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.estado === 'Activada' ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{service.descripcion}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Precio:</span>
                              <p className="text-green-600 font-bold">{formatPrice(service.precio)}/hora</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Duración:</span>
                              <p className="text-gray-600">{service.duracionMinutos} min</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Reservas:</span>
                              <p className="text-gray-600">{service.cantidadReservas} total</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Creado:</span>
                              <p className="text-gray-600">{new Date(service.fechaCreacion).toLocaleDateString('es-ES')}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleServiceStatus(service.id, service.esta)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              service.estado === 'Activada'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {service.estado === 'Activada' ? 'Desactivar' : 'Activar'}
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
                            {service.diasDisponibles.map((day, index) => (
                              <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                {formatDayOfWeek(day)}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Zonas de servicio:</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.areas.map((area, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div> */}
                         {/* Available Hours */}
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Horarios disponibles:</h4>
                        <div className="flex flex-wrap gap-1">
                          {service.horariosDisponibles.map((hour, index) => (
                            <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {hour}
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
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{label}</span>
                      {count > 0 && (
                        <span className={`text-xs rounded-full px-2 py-0.5 ${
                          filter === key 
                            ? 'bg-white bg-opacity-20 text-white' 
                            : 'bg-green-100 text-green-600'
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay reservas</h3>
                  <p className="text-gray-600">
                    {filter === 'all' 
                      ? 'Aún no tienes reservas de paseos'
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
                            <div className="bg-green-100 p-3 rounded-full">
                              <Heart className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                Paseo para {booking.pet}
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
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{booking.area}</span>
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
                              <div className="text-lg font-bold text-green-600">{formatPrice(booking.price)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Cliente: {booking.client}</span>
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
                                  Confirmar
                                </button>
                                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                  Rechazar
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                  Ver Detalles
                                </button>
                                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                                  Reprogramar
                                </button>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Ver Detalles
                              </button>
                            )}
                          </div>
                          
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Contactar Cliente
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

export default MisPaseos;