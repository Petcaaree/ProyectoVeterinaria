import React, { useEffect, useState } from 'react';
import { ArrowLeft, Stethoscope, User, MapPin, Phone, Star, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import {useAuth} from '../../context/authContext.tsx';
import Toast from '../comun/Toast.tsx';
import { useToast } from '../../hooks/useToast.ts';

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface MisServiciosVeterinariosProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
  onCreateService?: () => void;
}





const MisServiciosVeterinarios: React.FC<MisServiciosVeterinariosProps> = ({ userType, onBack, onCreateService }) => {
  const [activeTab, setActiveTab] = useState<'activos' | 'inactivos'>('activos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0)
  const [total , setTotal] = useState(0)
  const [totalActivos, setTotalActivos] = useState(0);
  const [totalInactivos, setTotalInactivos] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { usuario , getServiciosVeterinaria, activarOdesactivarServicio} = useAuth();
  const { toast, showError, showSuccess, hideToast } = useToast();
  
  // Mock data para información de la clínica
  const clinicInfo: ClinicInfo = {
    name: 'Clínica Veterinaria San Martín',
    address: usuario?.direccion?.calle + '  ' + usuario?.direccion?.altura + ', ' + usuario?.direccion?.localidad?.nombre + ', ' + usuario?.direccion?.localidad?.ciudad,
    phone: usuario?.telefono || '',
    email: usuario?.email || ''
  };

  // Mock data para servicios
  const [services, setServices] = useState<any>([])
    
  useEffect(() => {
     // Simula una carga de datos
      cargarServicios();
      cargarTotales();
      // Aquí podrías hacer una llamada a la API para obtener los servicios del veterinario
  }, [page, activeTab,]);

  const cargarTotales = async () => {
    if (usuario && usuario.id) {
      try {
        // Cargar total de activos
        const dataActivos = await getServiciosVeterinaria(usuario.id, 1, 'Activada');
        setTotalActivos(dataActivos?.total || 0);
        
        // Cargar total de inactivos
        const dataInactivos = await getServiciosVeterinaria(usuario.id, 1, 'Desactivada');
        setTotalInactivos(dataInactivos?.total || 0);
      } catch (error) {
        console.error('Error al obtener totales:', error);
      }
    }
  };

  const cargarServicios = async () => {
        if (usuario && usuario.id) {
          try {
            setIsLoading(true);
            const estado = activeTab === 'activos' ? 'Activada' : 'Desactivada';
            const data = await getServiciosVeterinaria(usuario.id,  page, estado);
            setServices(data?.data || []); // Acceder a la propiedad data del objeto respuesta
            setTotalPages(data?.total_pages || 0);
            setTotal(data?.total || 0); 
            if (data?.page !== page) {
              setPage(data?.page || 1);
            }
            console.log('Servicios obtenidos:', data);
          } catch (error) {
            console.error('Error al obtener servicios:', error);
            setServices([]); // Asegurar que sea un array vacío en caso de error
          } finally {
            setIsLoading(false);
          }
        } else {
          setServices([]);
        }
      };

      const handlePrevious = () => {
        if (page > 1) {
          setPage(page - 1);
          // Hacer scroll hacia arriba suavemente
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

      const handleNext = () => {
        if (page < totalPages) {
          setPage(page + 1);
          // Hacer scroll hacia arriba suavemente
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

  const activarDesactivarServicio = async (idServicio: string, estadoActual: string, tipoUsuario: string) => {
    try {
      // Determinar el nuevo estado (opuesto al actual)
      const nuevoEstado = estadoActual === 'Activada' ? 'Desactivada' : 'Activada';
      
      console.log("Cambiando estado del servicio:", idServicio, "de", estadoActual, "a", nuevoEstado);
      
      // Llamar a la función del contexto con el nuevo estado
      await activarOdesactivarServicio(idServicio, tipoUsuario, nuevoEstado);
      
      // Si era el único servicio en esta página, regresar a página 1
      if (services.length === 1 && page > 1) {
        setPage(1);
      } else {
        // Actualizar la lista de servicios después de la acción
        await cargarServicios();
      }
      
      // Recargar los totales para actualizar los contadores
      await cargarTotales();
      
      console.log("Estado cambiado exitosamente");
      showSuccess(`Servicio ${nuevoEstado.toLowerCase()} exitosamente`);
    } catch (error: any) {
      console.error("Error al cambiar el estado del servicio:", error);
      
      // Mostrar el mensaje específico del backend si está disponible
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Error al cambiar el estado del servicio. Por favor, intenta de nuevo.";
      
      showError(errorMessage);
    }
  }
  

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

  const deleteService = (serviceId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
    }
  };


  const formatearMascota = (mascota: string) => {
      const mascotaMap: { [key: string]: string } = {
        'PERRO': 'Perro',
        'GATO': 'Gato',
        'AVE': 'Ave',
        'OTRO': 'Otro'
            };
      return mascotaMap[mascota.toUpperCase()] || mascota;
    }


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
              
              <button 
                onClick={onCreateService}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
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
              <Phone className="h-4 w-4 text-gray-400 ml-8" />
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
                onClick={() => {
                  setActiveTab('activos');
                  setPage(1); // Resetear página al cambiar tab
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activos ({totalActivos})
              </button>
              <button
                onClick={() => {
                  setActiveTab('inactivos');
                  setPage(1); // Resetear página al cambiar tab
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'inactivos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inactivos ({totalInactivos})
              </button>
              
            </nav>
          </div>

          {/* Services Tab */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando servicios...</span>
              </div>
            ) : (
              <>
                {(() => {
                  const filteredServices = services.filter(service => 
                    activeTab === 'activos' 
                      ? service.estado === 'Activada' 
                      : service.estado === 'Desactivada'
                  );
                  
                  return filteredServices.length === 0 ? (
                    <div className="text-center py-12">
                      <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {activeTab === 'activos' 
                          ? 'No tienes servicios activos' 
                          : 'No tienes servicios inactivos'
                        }
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {activeTab === 'activos' 
                          ? 'Crea tu primer servicio veterinario para comenzar a recibir citas'
                          : 'Todos tus servicios están activos'
                        }
                      </p>
                      {activeTab === 'activos' && (
                        <button 
                          onClick={onCreateService}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Crear Primer Servicio</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredServices.map((service: any) => (
                    <div key={service.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{service.nombreServicio}</h3>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {service.tipoServicio}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.estado 
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
                              <p className="text-blue-600 font-bold">{formatPrice(service.precio)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Duración:</span>
                              <p className="text-gray-600">{service.duracionMinutos} min</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Citas:</span>
                              <p className="text-gray-600">{service.cantidadReservas} total</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Creado:</span>
                              <p className="text-gray-600">{new Date(service.fechaCreacion).toLocaleDateString('es-ES')}</p>
                            </div>
                          </div>
                          {/* Services Included */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Mascotas aceptadas:</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.mascotasAceptadas.map((mascota: any, index: any) => (
                                  <span key={index} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                    {formatearMascota(mascota)}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Disponibilidad:</h4>
                              <div className="flex flex-wrap gap-1">
                                {service.diasDisponibles.map((day: any, index: any) => (
                                  <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                    {formatDayOfWeek(day)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => activarDesactivarServicio(service.id, service.estado, 'veterinaria')}
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
                        

                        {/* Available Hours */}
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Horarios disponibles:</h4>
                        <div className="flex flex-wrap gap-1">
                          {service.horariosDisponibles.map((hour: any, index: any) => (
                            <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {hour}
                            </span>
                          ))}
                        </div>
                      </div>

                      
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>

          {/* Paginación - visible cuando hay más de una página */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-200">
              {page > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:block">Anterior</span>
                </button>
              )}
              
              <span className="text-gray-700 text-sm mx-4">
                Página {page} de {totalPages}
              </span>

              {page < totalPages && (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="hidden sm:block">Siguiente</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
      
      {/* Toast de notificaciones */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default MisServiciosVeterinarios;