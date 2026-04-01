// Barrel file: re-exporta todas las funciones de la API desde sus módulos individuales.
// Esto mantiene la compatibilidad con todos los imports existentes.

export { loginUsuario, signinUsuario, solicitarResetPassword, resetearPassword } from './authApi.js';
export { createReserva, getReservasHuesped, getReservasAnfitrion, confirmarReserva, cancelarReserva, getReservasPorEstado, getTodasReservas, cambiarEstadoReserva, reintentarPago } from './reservaApi.js';
export { registrarMascota, obtenerMascotas, eliminarMascota } from './mascotaApi.js';
export { crearServicioVeterinaria, crearServicioPaseador, crearServicioCuidador, getServiciosVeterinariaByUsuario, getServiciosPaseadorByUsuario, getServiciosCuidadorByUsuario, cambiarEstadoServicio, obtenerServiciosCuidadores, obtenerServiciosPaseadores, obtenerServiciosVeterinarias, obtenerServicioVeterinariaPorId, obtenerServicioPaseadorPorId, obtenerServicioCuidadorPorId } from './servicioApi.js';
export { obtenerNotificacionesNoLeidas, obtenerNotificaciones, marcarLeidaCliente, marcarLeidaProveedor, marcarTodasLeidasProveedor, marcarTodasLeidasCliente, obtenerContadorNotificacionesNoLeidas, eliminarNotificacion } from './notificacionApi.js';
export { getAlojamientos, getDestinos, getAlojamientosAnfitrion, crearAlojamiento, getNotificacionesHuesped, getNotificacionesAnfitrion } from './legacyApi.js';
export { getLocalidades } from './localidadApi.js';
