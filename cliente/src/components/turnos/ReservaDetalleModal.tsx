import React from 'react';
import { Calendar, Clock, User, MapPin, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ReservaDetalleModalProps {
  reserva: any;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  confirmed: { color: 'bg-blue-100', text: 'Confirmada', icon: <CheckCircle className="text-blue-600 w-10 h-10" /> },
  pending: { color: 'bg-yellow-100', text: 'Pendiente', icon: <AlertCircle className="text-yellow-600 w-10 h-10" /> },
  cancelled: { color: 'bg-red-100', text: 'Cancelada', icon: <XCircle className="text-red-600 w-10 h-10" /> },
  completed: { color: 'bg-green-100', text: 'Completada', icon: <CheckCircle className="text-green-600 w-10 h-10" /> },
};

const ReservaDetalleModal: React.FC<ReservaDetalleModalProps> = ({ reserva, isOpen, onClose }) => {
  if (!isOpen || !reserva) return null;

  const status = statusConfig[reserva.status] || statusConfig['pending'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-100 rounded-2xl shadow-2xl p-0 w-full max-w-lg relative animate-fade-in border border-blue-100">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-xl font-bold transition-all"
          onClick={onClose}
        >
          &times;
        </button>
        {/* Cabecera profesional */}
        <div className={`flex items-center gap-4 px-8 py-6 border-b ${status.color}`}>
          {status.icon}
          <h2 className="text-2xl font-bold text-blue-700 tracking-tight">{status.text}</h2>
        </div>
        {/* Detalle de la reserva con tarjetas */}
        <div className="px-8 py-6 grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <Calendar className="text-blue-500 w-6 h-6" />
            <span className="font-semibold text-gray-700">Fecha:</span>
            <span className="text-gray-900 font-medium">{reserva.date}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <Clock className="text-blue-500 w-6 h-6" />
            <span className="font-semibold text-gray-700">Hora:</span>
            <span className="text-gray-900 font-medium">{reserva.time}</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <User className="text-blue-500 w-6 h-6" />
            <span className="font-semibold text-gray-700">Servicio:</span>
            <span className="text-gray-900 font-medium">{reserva.service}</span>
          </div>
          {reserva.provider && (
            <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
              <User className="text-purple-500 w-6 h-6" />
              <span className="font-semibold text-gray-700">Proveedor:</span>
              <span className="text-gray-900 font-medium">{reserva.provider}</span>
            </div>
          )}
          {reserva.client && (
            <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
              <User className="text-green-500 w-6 h-6" />
              <span className="font-semibold text-gray-700">Cliente:</span>
              <span className="text-gray-900 font-medium">{reserva.client}</span>
            </div>
          )}
          {reserva.pet && (
            <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
              <User className="text-pink-500 w-6 h-6" />
              <span className="font-semibold text-gray-700">Mascota:</span>
              <span className="text-gray-900 font-medium">{reserva.pet}</span>
            </div>
          )}
          {reserva.location && (
            <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
              <MapPin className="text-blue-500 w-6 h-6" />
              <span className="font-semibold text-gray-700">Lugar:</span>
              <span className="text-gray-900 font-medium">{reserva.location}</span>
            </div>
          )}
          {reserva.phone && (
            <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
              <Phone className="text-blue-500 w-6 h-6" />
              <span className="font-semibold text-gray-700">Teléfono:</span>
              <span className="text-gray-900 font-medium">{reserva.phone}</span>
            </div>
          )}
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
            <span className="font-semibold text-gray-700">Precio:</span>
            <span className="text-gray-900 font-medium">${reserva.price}</span>
          </div>
          {reserva.duration && (
            <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
              <Clock className="text-blue-500 w-6 h-6" />
              <span className="font-semibold text-gray-700">Duración:</span>
              <span className="text-gray-900 font-medium">{reserva.duration} min</span>
            </div>
          )}
        </div>
        {/* Pie profesional */}
        <div className="px-8 pb-4 flex items-center justify-between text-xs text-gray-400">
          <span>PetCare &copy; 2025</span>
          <span className="text-blue-400">Reserva #{reserva.id}</span>
        </div>
      </div>
    </div>
  );
};

export default ReservaDetalleModal;

