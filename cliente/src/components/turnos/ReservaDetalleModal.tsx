import React from 'react';
import { X, Calendar, Clock, User, Phone, Mail, MapPin, Star, DollarSign, FileText, Shield, Heart, Stethoscope } from 'lucide-react';

interface ReservaDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }; // Datos flexibles tal como vienen del backend
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const ReservaDetalleModal: React.FC<ReservaDetalleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  userType
}) => {
  if (!isOpen || !appointment) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return { 
          color: 'yellow', 
          text: 'Pendiente', 
          bg: 'bg-yellow-100', 
          textColor: 'text-yellow-800',
          icon: '⏳'
        };
      case 'CONFIRMADA':
        return { 
          color: 'blue', 
          text: 'Aceptada', 
          bg: 'bg-blue-100', 
          textColor: 'text-blue-800',
          icon: '✅'
        };
      case 'COMPLETADA':
        return { 
          color: 'green', 
          text: 'Completada', 
          bg: 'bg-green-100', 
          textColor: 'text-green-800',
          icon: '🎉'
        };
      case 'CANCELADA':
        return { 
          color: 'red', 
          text: 'Cancelada', 
          bg: 'bg-red-100', 
          textColor: 'text-red-800',
          icon: '❌'
        };
      case 'RECHAZADA':
        return { 
          color: 'red', 
          text: 'Rechazada', 
          bg: 'bg-red-100', 
          textColor: 'text-red-800',
          icon: '❌'
        };
      default:
        return { 
          color: 'gray', 
          text: status || 'Desconocido', 
          bg: 'bg-gray-100', 
          textColor: 'text-gray-800',
          icon: '❓'
        };
    }
  };

  const getServiceIcon = () => {
    const serviceType = appointment.serviciOfrecido || appointment.service;
    if (serviceType === 'ServicioVeterinaria' || (serviceType && serviceType.toLowerCase().includes('veterinar'))) {
      return <Stethoscope className="h-6 w-6 text-blue-600" />;
    }
    if (serviceType === 'ServicioPaseador' || (serviceType && serviceType.toLowerCase().includes('paseo'))) {
      return <Heart className="h-6 w-6 text-green-600" />;
    }
    if (serviceType === 'ServicioCuidador' || (serviceType && serviceType.toLowerCase().includes('cuidado'))) {
      return <Shield className="h-6 w-6 text-orange-600" />;
    }
    return <Calendar className="h-6 w-6 text-gray-600" />;
  };

  const getServiceName = () => {
    if (appointment.servicioReservado?.nombre) {
      return appointment.servicioReservado.nombre;
    }
    if (appointment.service) {
      return appointment.service;
    }
    
    // Fallback basado en el tipo de servicio
    const serviceType = appointment.serviciOfrecido;
    switch (serviceType) {
      case 'ServicioVeterinaria':
        return 'Servicio Veterinario';
      case 'ServicioPaseador':
        return 'Servicio de Paseo';
      case 'ServicioCuidador':
        return 'Servicio de Cuidado';
      default:
        return 'Servicio';
    }
  };

  const formatPrice = () => {
    const price = appointment.servicioReservado?.precio || appointment.price || 0;
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    let date;
    // Si viene en formato DD/MM/YYYY del backend
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Si viene en formato ISO
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statusConfig = getStatusConfig(appointment.estado || appointment.status);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute top-4 right-16 opacity-20">
            <Star className="h-8 w-8" />
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20 z-20"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="flex items-start space-x-4 relative z-10 pr-24">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              {getServiceIcon()}
            </div>
            <div className="flex-1 pr-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Detalles del Turno</h2>
                {/* Estado al lado del título */}
                <div className={`${statusConfig.bg} ${statusConfig.textColor} px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg`}>
                  <span className="text-lg">{statusConfig.icon}</span>
                  <span className="font-semibold">{statusConfig.text}</span>
                </div>
              </div>
              <p className="text-blue-100 text-sm opacity-90">
                Información completa de tu {userType === 'cliente' ? 'reserva' : 'cita programada'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Información del servicio */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              {getServiceIcon()}
              <span className="ml-3">{getServiceName()}</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fecha de Inicio</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {formatDate(appointment.rangoFechas?.fechaInicio || appointment.date)}
                    </p>
                  </div>
                </div>
                
                {/* Mostrar fecha fin solo si es diferente o si hay más de 1 día */}
                {(appointment.cantidadDias > 1 || (appointment.rangoFechas?.fechaFin && appointment.rangoFechas.fechaFin !== appointment.rangoFechas.fechaInicio)) && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fecha de Fin</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {formatDate(appointment.rangoFechas?.fechaFin)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mostrar horario si existe */}
                {(appointment.horario || appointment.time) && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Horario</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {appointment.horario || appointment.time}
                        {appointment.duration && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({appointment.duration} min)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Precio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPrice()}
                    </p>
                  </div>
                </div>
                
                {/* Mostrar duración en días si existe */}
                {appointment.cantidadDias && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Duración</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.cantidadDias} {appointment.cantidadDias === 1 ? 'día' : 'días'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mostrar ubicación si existe */}
                {(appointment.servicioReservado?.ubicacion || appointment.location) && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ubicación</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.servicioReservado?.ubicacion || appointment.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información de Contacto
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {userType === 'cliente' ? (
                // Vista para dueños - mostrar info del proveedor
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Proveedor</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {appointment.servicioReservado?.nombre || appointment.provider || 'No especificado'}
                      </p>
                    </div>
                    {(appointment.telefonoContacto || appointment.phone) && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{appointment.telefonoContacto || appointment.phone}</span>
                      </div>
                    )}
                    {(appointment.emailContacto || appointment.email) && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{appointment.emailContacto || appointment.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mascota</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {appointment.mascota?.nombre || appointment.pet || 'No especificado'}
                      </p>
                    </div>
                    {appointment.nombreDeContacto && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contacto</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {appointment.nombreDeContacto}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Vista para proveedores - mostrar info del cliente
                <>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cliente</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {appointment.cliente?.nombreUsuario || appointment.client || 'No especificado'}
                      </p>
                    </div>
                    {(appointment.telefonoContacto || appointment.phone) && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{appointment.telefonoContacto || appointment.phone}</span>
                      </div>
                    )}
                    {(appointment.emailContacto || appointment.cliente?.email) && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{appointment.emailContacto || appointment.cliente?.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mascota</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {appointment.mascota?.nombre || appointment.pet || 'No especificado'}
                      </p>
                    </div>
                    {appointment.nombreDeContacto && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contacto</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {appointment.nombreDeContacto}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notas adicionales */}
          {(appointment.notaAdicional || appointment.notes) && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-yellow-600" />
                Notas Adicionales
              </h3>
              <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm">
                {appointment.notaAdicional || appointment.notes}
              </p>
            </div>
          )}

          
        </div>

        {/* Footer con acciones */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {(appointment.estado === 'CONFIRMADA' || appointment.status === 'confirmed') && (
                <>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                    {userType === 'cliente' ? 'Contactar Proveedor' : 'Contactar Cliente'}
                  </button>
                  {userType !== 'cliente' && (
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                      Marcar como Completado
                    </button>
                  )}
                </>
              )}
              
              {(appointment.estado === 'PENDIENTE' || appointment.status === 'pending') && userType !== 'cliente' && (
                <>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                    Aceptar
                  </button>
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                    Rechazar
                  </button>
                </>
              )}
              
              {(appointment.estado === 'COMPLETADA' || appointment.status === 'completed') && (
                <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Star className="h-4 w-4 mr-2 inline" />
                  Calificar Servicio
                </button>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaDetalleModal;