import React, { useState, useEffect } from 'react';
import Toast from '../comun/Toast.tsx';
import { useToast } from '../../hooks/useToast.ts';
import { getTodasReservas, getReservasPorEstado, cambiarEstadoReserva } from '../../api/api';
import { useAuth } from '../../context/authContext';
import ReservaDetalleModal from './ReservaDetalleModal';
import { Calendar, Clock, User, Phone, Star, CheckCircle, XCircle, AlertCircle, Filter, ArrowRight, ArrowLeft } from 'lucide-react';

interface MisTurnosProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}

// Usamos tipo flexible para manejar datos del backend
interface Appointment {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const MisTurnos: React.FC<MisTurnosProps> = ({ userType, onBack }) => {
  const [filter, setFilter] = useState<'TODAS' | 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA'>('TODAS'); // Iniciamos con TODAS
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Contadores específicos por estado
  const [totalTodas, setTotalTodas] = useState(0);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [totalConfirmadas, setTotalConfirmadas] = useState(0);
  const [totalCompletadas, setTotalCompletadas] = useState(0);
  const [totalCanceladas, setTotalCanceladas] = useState(0);


  // Obtener usuario y tipoUsuario del contexto de autenticación usando el hook personalizado
  const { usuario, tipoUsuario } = useAuth();
  const userId = usuario?.id;

  // Función para cargar totales
  const cargarTotales = async () => {
    if (!userId || !tipoUsuario) return;
    
    try {
      // Cargar totales para cada estado
      const [todasData, pendientesData, confirmadasData, completadasData, canceladasData] = await Promise.all([
        getTodasReservas(userId, tipoUsuario, 'TODAS', 1),
        getReservasPorEstado(userId, tipoUsuario, 'PENDIENTE', 1),
        getReservasPorEstado(userId, tipoUsuario, 'CONFIRMADA', 1),
        getReservasPorEstado(userId, tipoUsuario, 'COMPLETADA', 1),
        getReservasPorEstado(userId, tipoUsuario, 'CANCELADA', 1)
      ]);

      setTotalTodas(todasData.total || 0);
      setTotalPendientes(pendientesData.total || 0);
      setTotalConfirmadas(confirmadasData.total || 0);
      setTotalCompletadas(completadasData.total || 0);
      setTotalCanceladas(canceladasData.total || 0);
    } catch (error) {
      console.error('Error al cargar totales:', error);
    }
  };

  // Función para fetch de reservas
  const fetchReservas = async () => {
    if (!userId || !tipoUsuario) return;
    setIsLoading(true);
    try {
      let data 
      if (filter ==='TODAS') {
         data = await getTodasReservas(userId, tipoUsuario, filter, page);
         
        setAppointments(data.data || []);
        setTotalPages(data.total_pages || 0);
      } else {
         data = await getReservasPorEstado(userId, tipoUsuario, filter, page);
         
        setAppointments(data.data || []);
        setTotalPages(data.total_pages || 0);
      }
    } catch {
      // Puedes mostrar un mensaje de error si lo deseas
      setAppointments([]);
    } finally {
      setIsLoading(false);
      console.log('Final totalPages state:', totalPages); // Debug
    }
  };

  useEffect(() => {
    
    
    fetchReservas();
    // Solo cargar totales cuando cambia el usuario, no en cada cambio de filtro/página
    if (userId && tipoUsuario) {
      cargarTotales();
    }
  }, [userId, tipoUsuario, filter, page]);

  // Funciones de paginación
  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (newFilter: 'TODAS' | 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA') => {
    setFilter(newFilter);
    setPage(1); // Reset a página 1 cuando cambia el filtro
  };

  // Función para extraer ID correctamente de MongoDB
  const getReservaId = (appointment: Appointment): string | undefined => {
    // Intentar diferentes formas de obtener el ID
    const id = appointment._id || appointment.id;
    
    // Si es un ObjectId de MongoDB, convertir a string
    if (id && typeof id === 'object' && id.toString) {
      return id.toString();
    }
    
    // Si ya es string, devolverlo
    if (typeof id === 'string') {
      return id;
    }
    
    // Intentar usar otros campos como identificador temporal
    // Esto es un workaround mientras se arregla el backend
    if (appointment.servicioReservado?._id) {
      console.warn('⚠️ Usando servicioReservado._id como identificador temporal');
      return appointment.servicioReservado._id.toString();
    }
    
    console.error('❌ No se pudo extraer ID válido del appointment:', appointment);
    console.error('❌ El backend no está devolviendo el _id de la reserva');
    return undefined;
  };

  // Toast hook
  const { toast, showError, showSuccess, hideToast } = useToast();

  // Función para cancelar reserva
  const handleCancelarReserva = async (reservaId: string | undefined) => {
    if (!reservaId) {
      console.error('Error: ID de reserva no válido');
      showError('ID de reserva no válido');
      return;
    }
    try {
      setIsLoading(true);
      await cambiarEstadoReserva(userId, reservaId, 'CANCELADA');
      await Promise.all([
        fetchReservas(),
        cargarTotales()
      ]);
      showSuccess('Reserva cancelada correctamente');
    } catch (error: any) {
      console.error('Error al cancelar reserva:', error);
      // Mostrar error del backend si existe
      const mensaje = error?.response?.data?.message || error?.message || 'Error al cancelar la reserva';
      showError(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para confirmar reserva
  const handleConfirmarReserva = async (reservaId: string | undefined) => {
    if (!reservaId) {
      console.error('Error: ID de reserva no válido');
      showError('ID de reserva no válido');
      return;
    }
    try {
      setIsLoading(true);
      await cambiarEstadoReserva(userId, reservaId, 'CONFIRMADA');
      await Promise.all([
        fetchReservas(),
        cargarTotales()
      ]);
      showSuccess('Reserva confirmada correctamente');
    } catch (error: any) {
      console.error('Error al confirmar reserva:', error);
      const mensaje = error?.response?.data?.message || error?.message || 'Error al confirmar la reserva';
      showError(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para rechazar reserva
  const handleRechazarReserva = async (reservaId: string | undefined) => {
    if (!reservaId) {
      console.error('Error: ID de reserva no válido');
      showError('ID de reserva no válido');
      return;
    }
    try {
      setIsLoading(true);
      await cambiarEstadoReserva(userId, reservaId, 'CANCELADA');
      await Promise.all([
        fetchReservas(),
        cargarTotales()
      ]);
      showSuccess('Reserva rechazada correctamente');
    } catch (error: any) {
      console.error('Error al rechazar reserva:', error);
      const mensaje = error?.response?.data?.message || error?.message || 'Error al rechazar la reserva';
      showError(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  // Como ahora el filtro se hace en el backend, no necesitamos filtrar en el frontend
  const filteredAppointments = appointments;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return { color: 'yellow', icon: AlertCircle, text: 'Pendiente', bg: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'CONFIRMADA':
        return { color: 'blue', icon: CheckCircle, text: 'Confirmada', bg: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'COMPLETADA':
        return { color: 'green', icon: CheckCircle, text: 'Completada', bg: 'bg-green-100', textColor: 'text-green-800' };
      case 'CANCELADA':
        return { color: 'red', icon: XCircle, text: 'Cancelada', bg: 'bg-red-100', textColor: 'text-red-800' };
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
                  {/* Para todos los usuarios: mostrar solo pendientes */}
                  {totalPendientes > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {totalPendientes}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                  <p className="text-gray-600">
                    {totalPendientes > 0 
                      ? `Tienes ${totalPendientes} cita${totalPendientes > 1 ? 's' : ''} pendiente${totalPendientes > 1 ? 's' : ''}`
                      : 'No tienes citas pendientes'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{totalConfirmadas}</div>
                  <div className="text-sm text-gray-600">
                    Confirmadas
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
                  { key: 'TODAS', label: 'Todas' },
                  { key: 'PENDIENTE', label: 'Pendientes' },
                  { key: 'CONFIRMADA', label: 'Confirmadas' },
                  { key: 'COMPLETADA', label: 'Completadas' },
                  { key: 'CANCELADA', label: 'Canceladas' }
                ].map(({ key, label }) => {
                  const count = key === 'TODAS' ? totalTodas :
                                key === 'PENDIENTE' ? totalPendientes :
                                key === 'CONFIRMADA' ? totalConfirmadas :
                                key === 'COMPLETADA' ? totalCompletadas :
                                totalCanceladas;
                  
                  // Para TODAS: no mostrar contador nunca
                  // Para PENDIENTES: mostrar contador siempre excepto cuando sea 0
                  // Para otros: mostrar contador solo cuando está seleccionado y count > 0
                  const shouldShowCounter = key === 'TODAS' ? false :
                                          key === 'PENDIENTE' ? count > 0 :
                                          (filter === key && count > 0);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleFilterChange(key as typeof filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        filter === key
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{label}</span>
                      {shouldShowCounter && (
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-bold ${
                          filter === key 
                            ? 'bg-red-600 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando turnos...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
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
            {filteredAppointments.map((appointment, index) => {
              // Crear una key única usando la función getReservaId
              const uniqueKey = getReservaId(appointment) || index;
              
              // Debug: ver la estructura completa del appointment
              console.log('🔍 Estructura del appointment:', appointment);
              console.log('🔍 appointment._id:', appointment._id);
              console.log('🔍 appointment.id:', appointment.id);
              console.log('🔍 Object.keys(appointment):', Object.keys(appointment));
              
              // Ajuste: usar los campos reales del DTO
              const statusConfig = getStatusConfig(appointment.estado);
              const StatusIcon = statusConfig.icon;
              const proveedor = appointment.servicioReservado?.usuarioProveedor?.nombreUsuario || '';
              const servicio = appointment.servicioReservado?.nombreServicio || appointment.serviciOfrecido;
              const fecha = appointment.rangoFechas?.fechaInicio || '';
              const horario = appointment.horario || '';
              const telefono = appointment.telefonoContacto || '';
              const precio = appointment.servicioReservado?.precio || 0;
              const mascota = appointment.mascota?.nombre || '';
              const notas = appointment.notaAdicional || '';
              const cliente = appointment.cliente?.nombreUsuario || '';

              return (
                <div key={uniqueKey} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{servicio}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{fecha}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{horario}</span>
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
                          <div className="text-lg font-bold text-green-600">{formatPrice(precio)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {tipoUsuario === 'cliente' ? (
                        <React.Fragment key={`cliente-info-${uniqueKey}`}>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Proveedor: {proveedor}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Mascota: {mascota}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{telefono}</span>
                          </div>
                        </React.Fragment>
                      ) : (
                        <React.Fragment key={`proveedor-info-${uniqueKey}`}>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Cliente: {cliente}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Mascota: {mascota}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{telefono}</span>
                          </div>
                        </React.Fragment>
                      )}
                    </div>
                    {/* Apartado de notas */}
                    {notas && (
                      <div className="mb-2 text-sm text-gray-500">Notas: {notas}</div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {/* Acciones para cliente */}
                      {tipoUsuario === 'cliente' && (
                        <div className="flex space-x-2">
                          {/* Botón de cancelar solo si está pendiente */}
                          {(appointment.estado === 'PENDIENTE' || appointment.status === 'pending') && (
                            <button 
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              onClick={() => {
                                console.log('Cancelando reserva, appointment completo:', appointment);
                                const reservaId = getReservaId(appointment);
                                console.log('ID extraído:', reservaId);
                                if (reservaId) {
                                  handleCancelarReserva(reservaId);
                                }
                              }}
                            >
                              Cancelar
                            </button>
                          )}
                          
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            onClick={() => { setSelectedReserva(appointment); setModalOpen(true); }}
                          >
                            Ver Detalles
                          </button>
                        </div>
                      )}
                      
                      {/* Acciones para proveedores (veterinaria, cuidador, paseador) */}
                      {['veterinaria', 'cuidador', 'paseador'].includes(tipoUsuario || '') && (
                        <div className="flex space-x-2">
                          {/* Confirmar/Rechazar solo si está pendiente */}
                          {(appointment.estado === 'PENDIENTE' || appointment.status === 'pending') && (
                            <React.Fragment key={`botones-pendiente-${uniqueKey}`}>
                              <button 
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                onClick={() => {
                                  console.log('Confirmando reserva, appointment completo:', appointment);
                                  const reservaId = getReservaId(appointment);
                                  console.log('ID extraído para confirmar:', reservaId);
                                  if (reservaId) {
                                    handleConfirmarReserva(reservaId);
                                  }
                                }}
                              >
                                Confirmar
                              </button>
                              <button 
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                onClick={() => {
                                  console.log('Rechazando reserva, appointment completo:', appointment);
                                  const reservaId = getReservaId(appointment);
                                  console.log('ID extraído para rechazar:', reservaId);
                                  if (reservaId) {
                                    handleRechazarReserva(reservaId);
                                  }
                                }}
                              >
                                Rechazar
                              </button>
                            </React.Fragment>
                          )}
                          
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            onClick={() => { setSelectedReserva(appointment); setModalOpen(true); }}
                          >
                            Ver Detalles
                          </button>
                        </div>
                      )}
                      
                      {/* Botón de contacto solo si no está pendiente */}
                      {(appointment.estado !== 'PENDIENTE' && appointment.status !== 'pending') && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Contactar {tipoUsuario === 'cliente' ? 'Proveedor' : 'Cliente'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación - visible cuando hay más de una página */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-200 bg-white rounded-b-2xl shadow-lg">
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
      {/* Toast de notificaciones */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    {/* Modal de detalle de reserva */}
    {selectedReserva && (
      <ReservaDetalleModal
        appointment={selectedReserva}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userType={userType}
      />
    )}
  </div>
  );
};

export default MisTurnos;