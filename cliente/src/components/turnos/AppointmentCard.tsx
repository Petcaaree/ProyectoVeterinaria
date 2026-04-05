import React from 'react';
import { Calendar, Clock, User, Phone, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { Appointment } from '../../hooks/useReservas';

interface AppointmentCardProps {
  appointment: Appointment;
  tipoUsuario: string | null;
  onCancelar: (id: string | undefined) => void;
  onConfirmar: (id: string | undefined) => void;
  onRechazar: (id: string | undefined) => void;
  onVerDetalles: (appointment: Appointment) => void;
  onPagar: (appointment: Appointment) => void;
}

const getReservaId = (appointment: Appointment): string | undefined => {
  const id = appointment._id || appointment.id;
  if (id && typeof id === 'object' && id.toString) return id.toString();
  if (typeof id === 'string') return id;
  if (appointment.servicioReservado?._id) {
    console.warn('Using servicioReservado._id as fallback identifier');
    return appointment.servicioReservado._id.toString();
  }
  console.error('Could not extract valid ID from appointment:', appointment);
  return undefined;
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PENDIENTE_PAGO': return { icon: AlertCircle, text: 'Pendiente de pago', bg: 'bg-orange-100', textColor: 'text-orange-800' };
    case 'PENDIENTE': return { icon: AlertCircle, text: 'Pendiente', bg: 'bg-yellow-100', textColor: 'text-yellow-800' };
    case 'CONFIRMADA': return { icon: CheckCircle, text: 'Confirmada', bg: 'bg-blue-100', textColor: 'text-blue-800' };
    case 'COMPLETADA': return { icon: CheckCircle, text: 'Completada', bg: 'bg-green-100', textColor: 'text-green-800' };
    case 'CANCELADA': return { icon: XCircle, text: 'Cancelada', bg: 'bg-red-100', textColor: 'text-red-800' };
    default: return { icon: AlertCircle, text: 'Desconocido', bg: 'bg-gray-100', textColor: 'text-gray-800' };
  }
};

const formatPrice = (price?: number) => {
  if (typeof price !== 'number' || isNaN(price)) return '$0';
  return price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  tipoUsuario,
  onCancelar,
  onConfirmar,
  onRechazar,
  onVerDetalles,
  onPagar,
}) => {
  const uniqueKey = getReservaId(appointment);
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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{servicio}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" /><span>{fecha}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" /><span>{horario}</span>
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

        {/* Info grid */}
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

        {notas && <div className="mb-2 text-sm text-gray-500">Notas: {notas}</div>}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {tipoUsuario === 'cliente' && (
            <div className="flex space-x-2">
              {appointment.estado === 'PENDIENTE_PAGO' && (
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                  onClick={() => onPagar(appointment)}
                >
                  Completar pago
                </button>
              )}
              {(appointment.estado === 'PENDIENTE' || appointment.estado === 'PENDIENTE_PAGO' || appointment.status === 'pending') && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  onClick={() => onCancelar(getReservaId(appointment))}
                >
                  Cancelar
                </button>
              )}
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                onClick={() => onVerDetalles(appointment)}
              >
                Ver Detalles
              </button>
            </div>
          )}

          {['veterinaria', 'cuidador', 'paseador'].includes(tipoUsuario || '') && (
            <div className="flex space-x-2">
              {(appointment.estado === 'PENDIENTE' || appointment.status === 'pending') && (
                <React.Fragment key={`botones-pendiente-${uniqueKey}`}>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    onClick={() => onConfirmar(getReservaId(appointment))}
                  >
                    Confirmar
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    onClick={() => onRechazar(getReservaId(appointment))}
                  >
                    Rechazar
                  </button>
                </React.Fragment>
              )}
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                onClick={() => onVerDetalles(appointment)}
              >
                Ver Detalles
              </button>
            </div>
          )}

          {(appointment.estado !== 'PENDIENTE' && appointment.status !== 'pending') && (
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Contactar {tipoUsuario === 'cliente' ? 'Proveedor' : 'Cliente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
