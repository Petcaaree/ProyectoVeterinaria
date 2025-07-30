import React, { useState } from 'react';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, Calendar, User, Star, Clock, Trash2, BookMarked as MarkAsRead } from 'lucide-react';

interface NotificacionesProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'review' | 'payment' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

const Notificaciones: React.FC<NotificacionesProps> = ({ userType, onBack }) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'appointment' | 'reminder' | 'review' | 'payment' | 'system'>('all');

  // Mock data - diferentes según el tipo de usuario
  const getNotifications = (): Notification[] => {
    if (userType === 'cliente') {
      return [
        {
          id: '1',
          type: 'reminder',
          title: 'Recordatorio de Cita',
          message: 'Tu cita con Dr. Carlos López es mañana a las 10:00 AM. No olvides llevar la cartilla de vacunación de Max.',
          date: '2024-01-14T18:00:00Z',
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'reminder',
          title: 'Cita Confirmada',
          message: 'María Rodríguez ha confirmado el paseo para Luna el 18 de enero a las 3:30 PM.',
          date: '2024-01-13T14:30:00Z',
          read: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Cita Cancelada',
          message: 'Tu cita con Dr. Carlos López para el 20 de enero ha sido cancelada. Por favor, programa una nueva cita.',
          date: '2024-01-12T20:00:00Z',
          read: false,
          priority: 'high'
        },
        {
          id: '4',
          type: 'reminder',
          title: 'Recordatorio de Cita',
          message: 'Tienes una cita programada con Pedro Martínez para el cuidado de Rocky el viernes a las 9:00 AM.',
          date: '2024-01-12T19:45:00Z',
          read: true,
          priority: 'medium'
        }
      ];
    } else {
      return [
        {
          id: '1',
          type: 'reminder',
          title: 'Nueva Reserva',
          message: `Ana García ha reservado ${userType === 'veterinaria' ? 'una consulta general' : userType === 'paseador' ? 'un paseo básico' : 'cuidado 24/7'} para el 15 de enero a las 10:00 AM.`,
          date: '2024-01-14T16:00:00Z',
          read: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'reminder',
          title: 'Recordatorio de Cita',
          message: `Tienes ${userType === 'veterinaria' ? 'una consulta' : userType === 'paseador' ? 'un paseo' : 'un servicio de cuidado'} programado mañana a las 10:00 AM con Ana García.`,
          date: '2024-01-14T18:00:00Z',
          read: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Cita Confirmada',
          message: 'Has confirmado la cita con María López para el 18 de enero a las 2:00 PM.',
          date: '2024-01-12T15:30:00Z',
          read: true,
          priority: 'medium'
        },
        {
          id: '4',
          type: 'reminder',
          title: 'Cita Cancelada',
          message: 'Carlos Mendoza ha cancelado su cita del 18 de enero. El horario está nuevamente disponible.',
          date: '2024-01-12T20:15:00Z',
          read: true,
          priority: 'medium'
        },
        {
          id: '5',
          type: 'reminder',
          title: 'Recordatorio de Cita',
          message: 'Recuerda que tienes una cita programada con Luis Fernández mañana a las 4:00 PM.',
          date: '2024-01-11T11:20:00Z',
          read: true,
          priority: 'low'
        }
      ];
    }
  };

  const [notifications, setNotifications] = useState(getNotifications());

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'reminder':
        return { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' };
      default:
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

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTitle = () => {
    switch (userType) {
      case 'owner': return 'Mis Notificaciones';
      case 'veterinary': return 'Notificaciones de Clínica';
      case 'walker': return 'Notificaciones de Paseos';
      case 'caregiver': return 'Notificaciones de Cuidado';
      default: return 'Notificaciones';
    }
  };

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
                      ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'No leídas' },
              { key: 'reminder', label: 'Recordatorios' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
                {key === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'No tienes notificaciones sin leer'
                : 'No hay notificaciones para mostrar'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const iconConfig = getNotificationIcon(notification.type, notification.priority);
              const Icon = iconConfig.icon;

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'ring-2 ring-blue-100' : ''
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
                            <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'} mb-1`}>
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </h3>
                            <p className="text-gray-600 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatDate(notification.date)}</span>
                              <span className="capitalize">{notification.type}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {notification.priority === 'high' ? 'Alta' : 
                                 notification.priority === 'medium' ? 'Media' : 'Baja'} prioridad
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
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
        )}
      </div>
    </div>
  );
};

export default Notificaciones;