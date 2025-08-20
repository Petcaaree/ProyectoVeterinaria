import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, Calendar, User, Star, Clock, Trash2, BookMarked as MarkAsRead, ChevronLeft, ChevronRight, X, CalendarCheck, AlarmClock } from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';

interface NotificacionesProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' ;
  onBack: () => void;
}


const Notificaciones: React.FC<NotificacionesProps> = ({ userType, onBack }) => {
  const [filter, setFilter] = useState<'todas' | 'Noleidas' | 'appointment' | 'reminder' | 'review' | 'payment' | 'system'>('todas');
  const { usuario, getNotificationes, getNotificacionesNoLeidas, marcarLeidaDelCliente, marcarLeidaDelProveedor, marcarTodasLeidasDelCliente, marcarTodasLeidasDelProveedor, contadorNotificacionesNoLeidas, cargarContadorNotificaciones } = useAuth();
  const [notifications, setNotifications] = useState<any>([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<any>([]);
  
  // Referencia para hacer scroll al navegador de filtros
  const filtersRef = useRef<HTMLDivElement>(null);
  
  // Estados para paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    cargarTotasNotificacions();
    cargarNotificacionesNoLeidas();
  }, [page, filter]);

  const cargarTotasNotificacions = async () => {
    if (!usuario?.id) return;
    
    setIsLoading(true);
    try {
      let data;
      
      if (filter === 'Noleidas') {
        // Usar la API específica para notificaciones no leídas
        data = await getNotificacionesNoLeidas(usuario.id, 'false', userType as string, page);
      } else {
        // Usar la API general para todas las notificaciones
        data = await getNotificationes(usuario.id, userType as string, page);
      }
      
      // Manejar respuesta paginada del backend
      setNotifications(data?.data || []);
      setTotalPages(data?.total_pages || 0);
      setTotal(data?.total || 0);
      
      // Verificar si la página actual coincide con la respuesta
      if (data?.page !== page) {
        setPage(data?.page || 1);
      }
      
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarNotificacionesNoLeidas = async () => {
    if (!usuario?.id) return;
    
    try {
      const data = await getNotificacionesNoLeidas(usuario.id, 'false', userType as string, 1);
      
      // Si es respuesta paginada
      if (data?.data) {
        setNotificacionesNoLeidas(data.data);
        setTotalNoLeidas(data.total || 0);
      } else {
        // Si es array directo
        setNotificacionesNoLeidas(data || []);
        setTotalNoLeidas((data as any[])?.length || 0);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones no leídas:', error);
    }
  };

  // Función para hacer scroll al navegador de filtros
  const scrollToFilters = () => {
    if (filtersRef.current) {
      filtersRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1); // Resetear a la primera página cuando cambie el filtro
    // Hacer scroll a los filtros cuando cambie el filtro
    setTimeout(() => scrollToFilters(), 100);
  };

  // Funciones de paginación - usando backend pagination
  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      // Agregar delay para asegurar que el DOM se actualice antes del scroll
      setTimeout(() => scrollToFilters(), 100);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      // Agregar delay para asegurar que el DOM se actualice antes del scroll
      setTimeout(() => scrollToFilters(), 100);
    }
  };

  const goToPage = (pageNumber: number) => {
    setPage(pageNumber);
    setTimeout(() => scrollToFilters(), 100);
  };

 

  // Usar directamente las notificaciones que vienen del backend (ya paginadas)
  const paginatedNotifications = notifications;

  // Para el contador de no leídas, usar el total del backend
  const unreadCount = totalNoLeidas;

  const getNotificationIcon = (message: string) => {
    // Detectar tipo de mensaje basado en el contenido
    if (message.toLowerCase().includes('recordatorio')) {
      return { icon: AlarmClock, color: 'text-orange-600', bg: 'bg-orange-100' };
    } else if (message.toLowerCase().includes('confirmada')) {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
    } else if (message.toLowerCase().includes('cancelada')) {
      return { icon: X, color: 'text-red-600', bg: 'bg-red-100' };
    } else if (message.toLowerCase().includes('realizada')) {
      return { icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-100' };
    } else {
      // Para cualquier otro tipo de mensaje
      return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };


  const markAsRead = async (id: string) => {
    if (!usuario?.id) return;
    
    try {
      if (userType === 'cliente') {
        await marcarLeidaDelCliente(usuario.id, id);
      } else {
        await marcarLeidaDelProveedor(usuario.id, id, userType);
      }
      
      // Recargar todas las notificaciones después de marcar como leída
      await cargarTotasNotificacions();
      await cargarNotificacionesNoLeidas();
      
      // Actualizar contador del encabezado
      await cargarContadorNotificaciones();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!usuario?.id) return;
    try {
      if (userType === 'cliente') {
        await marcarTodasLeidasDelCliente(usuario.id);
      } else {
        await marcarTodasLeidasDelProveedor(usuario.id, userType);
      }

      // Recargar todas las notificaciones después de marcar como leída
      await cargarTotasNotificacions();
      await cargarNotificacionesNoLeidas();
      
      // Actualizar contador del encabezado
      await cargarContadorNotificaciones();
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTitle = () => {
    switch (userType) {
      case 'cliente': return 'Mis Notificaciones';
      case 'veterinaria': return 'Notificaciones de Clínica';
      case 'paseador': return 'Notificaciones de Paseos';
      case 'cuidador': return 'Notificaciones de Cuidado';
      default: return 'Notificaciones';
    }
  };

  // Efecto para recargar notificaciones cuando cambia el contador global
  useEffect(() => {
    if (usuario?.id) {
      cargarTotasNotificacions();
      cargarNotificacionesNoLeidas();
    }
  }, [contadorNotificacionesNoLeidas]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="bg-blue-100 p-3 rounded-full relative">
                  <Bell className="h-8 w-8 text-blue-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                  <p className="text-gray-600">
                    {unreadCount > 0 
                      ? `Tienes ${totalNoLeidas} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                      : 'Todas las notificaciones están al día'
                    }
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MarkAsRead className="h-4 w-4" />
                  <span>Marcar todas como leídas</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div ref={filtersRef} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'Noleidas', label: 'No leídas' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
                {key === 'Noleidas' && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-600">
              {filter === 'Noleidas' 
                ? 'No tienes notificaciones sin leer'
                : 'No hay notificaciones para mostrar'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
               {paginatedNotifications.map((notification: any) => {
              const iconConfig = getNotificationIcon(notification.mensaje || '');
              const Icon = iconConfig.icon;

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${getPriorityColor(notification.priority || 'low')} ${
                    !notification.fechaLeida ? 'ring-2 ring-blue-100' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`${iconConfig.bg} p-3 rounded-full flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${iconConfig.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${!notification.fechaLeida ? 'text-gray-900' : 'text-gray-700'} mb-1`}>
                              {notification.title || 'Notificación'}
                              {!notification.fechaLeida && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </h3>
                            <p className="text-gray-600 mb-3 leading-relaxed">
                              {notification.mensaje}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatDate(notification.fechaAlta)}</span>
                              
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.fechaLeida && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Marcar como leída"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar notificación"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {notification.actionUrl && (
                          <div className="mt-4">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                              Ver Detalles
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Navegación de páginas centrada */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                {/* Botón Anterior */}
                <button
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    page === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Anterior</span>
                </button>

                {/* Indicadores de páginas */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (page <= 4) {
                      pageNumber = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = page - 3 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-8 h-8 rounded-full transition-all duration-300 text-sm font-medium ${
                          page === pageNumber
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    page === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <span className="text-sm font-medium">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Información de páginas */}
            {totalPages > 1 && (
              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  Página <span className="font-semibold text-blue-600">{page}</span> de{' '}
                  <span className="font-semibold text-blue-600">{totalPages}</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;