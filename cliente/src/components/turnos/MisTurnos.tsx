import React, { useState } from 'react';
import Toast from '../comun/Toast.tsx';
import { useToast } from '../../hooks/useToast.ts';
import { cambiarEstadoReserva, reintentarPago } from '../../api/api';
import ReservaDetalleModal from './ReservaDetalleModal';
import TurnosFilterBar from './TurnosFilterBar';
import AppointmentCard from './AppointmentCard';
import { useReservas } from '../../hooks/useReservas';
import type { Appointment } from '../../hooks/useReservas';
import { Calendar, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface MisTurnosProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}

const MisTurnos: React.FC<MisTurnosProps> = ({ userType, onBack }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Appointment | null>(null);
  const { toast, showError, showSuccess, hideToast } = useToast();

  const {
    filter, appointments, page, totalPages, isLoading, setIsLoading,
    totales, tipoUsuario, userId,
    handleFilterChange, handlePrevious, handleNext,
    fetchReservas, cargarTotales,
  } = useReservas();

  const handleAccion = async (reservaId: string | undefined, estado: string, mensajeOk: string) => {
    if (!reservaId) { showError('ID de reserva no válido'); return; }
    try {
      setIsLoading(true);
      await cambiarEstadoReserva(userId, reservaId, estado);
      await Promise.all([fetchReservas(), cargarTotales()]);
      showSuccess(mensajeOk);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      showError(err?.response?.data?.message || err?.message || `Error al cambiar estado a ${estado}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagar = async (appointment: Appointment) => {
    try {
      let prefId = appointment.mercadoPagoPreferenceId;
      if (!prefId) {
        const reservaId = appointment._id || appointment.id;
        const pagoInfo = await reintentarPago(reservaId);
        prefId = pagoInfo.preferenceId;
      }
      window.location.href = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${prefId}`;
    } catch (err: unknown) {
      console.error('Error completar pago:', err);
      showError('No se pudo generar el link de pago. Intenta de nuevo.');
    }
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
          <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors">
            <ArrowLeft className="h-5 w-5" /><span>Volver</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full relative">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  {totales.pendientes > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {totales.pendientes}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                  <p className="text-gray-600">
                    {totales.pendientes > 0
                      ? `Tienes ${totales.pendientes} cita${totales.pendientes > 1 ? 's' : ''} pendiente${totales.pendientes > 1 ? 's' : ''}`
                      : 'No tienes citas pendientes'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{totales.confirmadas}</div>
                  <div className="text-sm text-gray-600">Confirmadas</div>
                </div>
                {userType !== 'cliente' && appointments.filter(a => a.status === 'pending').length > 0 && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                    <CheckCircle className="h-4 w-4" /><span>Gestionar Citas</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <TurnosFilterBar filter={filter} onFilterChange={handleFilterChange} totales={totales} tipoUsuario={tipoUsuario} />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando turnos...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{getEmptyMessage()}</h3>
            <p className="text-gray-600">
              {userType === 'cliente' ? 'Reserva un servicio para ver tus turnos aquí' : 'Los clientes que reserven tus servicios aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment, index) => (
              <AppointmentCard
                key={appointment._id || appointment.id || index}
                appointment={appointment}
                tipoUsuario={tipoUsuario}
                onCancelar={(id) => handleAccion(id, 'CANCELADA', 'Reserva cancelada correctamente')}
                onConfirmar={(id) => handleAccion(id, 'CONFIRMADA', 'Reserva confirmada correctamente')}
                onRechazar={(id) => handleAccion(id, 'CANCELADA', 'Reserva rechazada correctamente')}
                onVerDetalles={(a) => { setSelectedReserva(a); setModalOpen(true); }}
                onPagar={handlePagar}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-200 bg-white rounded-b-2xl shadow-lg">
            {page > 1 && (
              <button onClick={handlePrevious} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4" /><span className="hidden sm:block">Anterior</span>
              </button>
            )}
            <span className="text-gray-700 text-sm mx-4">Página {page} de {totalPages}</span>
            {page < totalPages && (
              <button onClick={handleNext} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span className="hidden sm:block">Siguiente</span><ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

      {selectedReserva && (
        <ReservaDetalleModal appointment={selectedReserva} isOpen={modalOpen} onClose={() => setModalOpen(false)} userType={userType} />
      )}
    </div>
  );
};

export default MisTurnos;
