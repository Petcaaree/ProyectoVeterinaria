import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Dog, Shield, CheckCircle, Heart } from 'lucide-react';
import CalendarioModerno from './comun/CalendarioModerno';
import { useAuth } from '../context/authContext.tsx';


interface ModalReservaProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  serviceType: 'veterinaria' | 'paseador' | 'cuidador';
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onReservaExitosa?: () => void; // Nueva prop para callback cuando la reserva es exitosa
}

const ModalReserva: React.FC<ModalReservaProps> = ({ isOpen, onClose, service, serviceType, userType, onReservaExitosa }) => {
  // Helper para parsear fecha DD/MM/AAAA a Date object

  const {usuario, crearReserva, getMascotas} = useAuth();
  
  // Estado para mascotas del usuario
  const [mascotasUsuario, setMascotasUsuario] = useState<any[]>([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);
  const parsearFecha = (fechaStr: string): Date | null => {
    if (!fechaStr || fechaStr.length === 0) return null;
    
    // Si ya es formato DD/MM/AAAA
    if (fechaStr.includes('/')) {
      const [dia, mes, año] = fechaStr.split('/');
      return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    }
    
    // Si es formato ISO (YYYY-MM-DD) - para compatibilidad
    return new Date(fechaStr);
  };

  

  // Helper para obtener fecha de hoy en formato DD/MM/AAAA
  const obtenerFechaHoy = (): string => {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  // Función para cerrar el modal al hacer clic fuera
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Estado inicial del formulario (memoizado para evitar recreación)
  const estadoInicialFormulario = useMemo(() => ({
    clienteId: usuario?.id || '',
    serviciOfrecido: serviceType === 'veterinaria' ? 'ServicioVeterinaria' : serviceType === 'paseador' ? 'ServicioPaseador' : 'ServicioCuidador',
    mascota: '',
    servicioReservadoId: service?._id || service?.id,
    rangoFechas: {
      fechaInicio: '',
      fechaFin: (serviceType === 'veterinaria' || serviceType === 'paseador') ? '' : '' // Se configurará automáticamente
    },
    horario: serviceType === 'cuidador' ? "null" : '',
    notaAdicional: '',
    nombreDeContacto: '',
    telefonoContacto: usuario?.telefono || '',
    emailContacto: usuario?.email || '',
  }), [usuario?.id, usuario?.telefono, usuario?.email, serviceType, service?._id, service?.id]);



  const [formData, setFormData] = useState(estadoInicialFormulario);
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado local para duración (solo para UI, no se envía al backend)
  const [duracionSeleccionada, setDuracionSeleccionada] = useState('');

  

  // Gestión del modal y carga inicial de datos
  useEffect(() => {
    if (!isOpen) {
      // Limpiar estado cuando se cierra el modal
      setFormData(estadoInicialFormulario);
      setMostrarCalendarioInicio(false);
      setMostrarCalendarioFin(false);
      setMostrarCalendario(false);
      setDuracionSeleccionada('');
    } else {
      // Cargar mascotas cuando se abre el modal
      const cargarMascotas = async () => {
        if (usuario?.id) {
          setCargandoMascotas(true);
          try {
            const mascotas = await getMascotas(usuario.id);
            setMascotasUsuario(mascotas || []);
          } catch (error) {
            console.error('Error al cargar mascotas:', error);
            setMascotasUsuario([]);
          } finally {
            setCargandoMascotas(false);
          }
        }
      };
      cargarMascotas();
    }
  }, [isOpen, estadoInicialFormulario, service, usuario?.id, getMascotas]);

  // Calcular mascotas filtradas según el servicio
  const mascotasFiltradas = useMemo(() => {
    if (!mascotasUsuario.length || !service) return [];
    
    // Los paseadores solo trabajan con perros
    if (serviceType === 'paseador') {
      return mascotasUsuario.filter(mascota => {
        const tipoMascota = mascota.tipo?.toUpperCase();
        return tipoMascota === 'PERRO';
      });
    }
    
    const mascotasAceptadas = service.mascotasAceptadas || service.servicioReservado?.mascotasAceptadas;
    
    // Si el servicio no tiene restricciones de mascotas, mostrar todas
    if (!mascotasAceptadas || !Array.isArray(mascotasAceptadas) || mascotasAceptadas.length === 0) {
      return mascotasUsuario;
    }
    
    return mascotasUsuario.filter(mascota => {
      const tipoMascota = mascota.tipo?.toUpperCase();
      const estaAceptada = mascotasAceptadas.includes(tipoMascota);
      return estaAceptada;
    });
  }, [mascotasUsuario, service, serviceType]);

  // Gestión de fechas y formulario
  useEffect(() => {
    // Limpiar horario si no está disponible para la fecha seleccionada
    if (formData.rangoFechas.fechaInicio && formData.horario) {
      const horariosDisponibles = obtenerHorariosDisponibles(formData.rangoFechas.fechaInicio);
      if (!horariosDisponibles.includes(formData.horario)) {
        setFormData(prev => ({ ...prev, horario: '' }));
      }
    }

    // Configurar fechaFin automáticamente para veterinarias y paseadores
    if ((serviceType === 'veterinaria' || serviceType === 'paseador') && formData.rangoFechas.fechaInicio) {
      if (formData.rangoFechas.fechaFin !== formData.rangoFechas.fechaInicio) {
        setFormData(prev => ({
          ...prev,
          rangoFechas: {
            ...prev.rangoFechas,
            fechaFin: prev.rangoFechas.fechaInicio
          }
        }));
      }
    }

    // Validar fechas de cuidadores
    if (serviceType === 'cuidador' && formData.rangoFechas.fechaInicio && formData.rangoFechas.fechaFin) {
      const { esValido } = validarFechas();
      if (!esValido) {
        setFormData(prev => ({ 
          ...prev, 
          rangoFechas: { ...prev.rangoFechas, fechaFin: '' }
        }));
      }
    }

    // Actualizar servicioReservadoId cuando esté disponible
    const serviceId = service?._id || service?.id;
    if (serviceId && formData.servicioReservadoId !== serviceId) {
      setFormData(prev => ({
        ...prev,
        servicioReservadoId: serviceId
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.rangoFechas.fechaInicio, 
    formData.rangoFechas.fechaFin, 
    formData.horario, 
    formData.servicioReservadoId,
    serviceType, 
    service
  ]);

  // Función para obtener el día de la semana en español y mayúsculas
  const obtenerDiaSemana = (fecha: string): string => {
    const [dia, mes, año] = fecha.split('/');
    const fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[fechaObj.getDay()];
  };

  // Función para validar fechas de cuidadores
  const validarFechas = (): { esValido: boolean; mensaje: string } => {
    if (!formData.rangoFechas.fechaInicio || !formData.rangoFechas.fechaFin) {
      return { esValido: true, mensaje: '' };
    }

    const fechaInicio = parsearFecha(formData.rangoFechas.fechaInicio);
    const fechaFin = parsearFecha(formData.rangoFechas.fechaFin);

    if (!fechaInicio || !fechaFin) {
      return { esValido: false, mensaje: 'Fechas inválidas' };
    }

    if (fechaInicio > fechaFin) {
      return { esValido: false, mensaje: 'La fecha de inicio no puede ser posterior a la fecha de fin' };
    }

    return { esValido: true, mensaje: '' };
  };

  // Función para verificar si una fecha está disponible (día de la semana)
  const esFechaDisponible = (fecha: string): boolean => {
    // Obtener días disponibles desde diferentes estructuras posibles
    const diasDisponibles = service?.diasDisponibles || service?.servicioReservado?.diasDisponibles;
    
    if (!diasDisponibles || !Array.isArray(diasDisponibles)) return false;
    
    const diaSemana = obtenerDiaSemana(fecha);
    return diasDisponibles.includes(diaSemana);
  };

  // Función para obtener todos los horarios con su estado (disponible/ocupado)
  const obtenerHorariosConEstado = (fecha: string): { horario: string; disponible: boolean }[] => {
    if (!fecha) return [];
    
    // Verificar si el día de la semana está disponible
    if (!esFechaDisponible(fecha)) return [];
    
    // Obtener horarios base del servicio
    const horariosBase = service?.horariosDisponibles || service?.servicioReservado?.horariosDisponibles || [];
    
    if (!horariosBase || horariosBase.length === 0) {
      return [];
    }
    
    // Convertir fecha DD/MM/YYYY a formato para comparar
    const [dia, mes, año] = fecha.split('/');
    const fechaParaComparar = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    
    // Obtener fechas no disponibles
    const fechasNoDisponibles = service?.fechasNoDisponibles || service?.servicioReservado?.fechasNoDisponibles;
    
    let horariosOcupados: string[] = [];
    
    // Buscar horarios ocupados para esta fecha específica
    if (fechasNoDisponibles && Array.isArray(fechasNoDisponibles)) {
      const fechaNoDisponible = fechasNoDisponibles.find((item: { fecha: string; horariosNoDisponibles: string[] }) => {
        if (!item.fecha) return false;
        
        const fechaISO = new Date(item.fecha);
        const fechaComparar = new Date(fechaISO.getFullYear(), fechaISO.getMonth(), fechaISO.getDate());
        const fechaLocal = new Date(fechaParaComparar.getFullYear(), fechaParaComparar.getMonth(), fechaParaComparar.getDate());
        
        return fechaComparar.getTime() === fechaLocal.getTime();
      });
      
      if (fechaNoDisponible?.horariosNoDisponibles) {
        horariosOcupados = fechaNoDisponible.horariosNoDisponibles;
      }
    }
    
    // Crear array con todos los horarios y su estado, ordenados cronológicamente
    const horariosConEstado = horariosBase
      .map((horario: string) => ({
        horario,
        disponible: !horariosOcupados.includes(horario)
      }))
      .sort((a: { horario: string; disponible: boolean }, b: { horario: string; disponible: boolean }) => {
        // Ordenar por hora (convertir HH:MM a minutos para comparar)
        const timeA = a.horario.split(':').map(Number);
        const timeB = b.horario.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        return minutesA - minutesB;
      });
    
    return horariosConEstado;
  };

  // Función para obtener horarios disponibles para una fecha específica (mantener para compatibilidad)
  const obtenerHorariosDisponibles = (fecha: string): string[] => {
    return obtenerHorariosConEstado(fecha)
      .filter(item => item.disponible)
      .map(item => item.horario);
  };

  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'veterinaria': return 'Veterinario/a';
      case 'paseador': return 'Paseador/a';
      case 'cuidador': return 'Cuidador/a';
      default: return 'Usuario';
    }
  };

  if (!isOpen || !service) return null;

  // Verificar si el usuario es dueño
  if (userType !== 'cliente') {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Acceso Restringido</h3>
            <p className="text-gray-600 mb-6">
              Solo los dueños de mascotas pueden hacer reservas de servicios.
              {!userType && ' Por favor, inicia sesión como dueño de mascota.'}
              {userType && userType !== 'cliente' && ['veterinaria', 'paseador', 'cuidador'].includes(userType) && ` Tu cuenta actual es de tipo: ${getUserTypeLabel(userType)}.`}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
              {!userType && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    // Encontrar la mascota seleccionada para mostrar información completa
    const mascotaSeleccionada = mascotasFiltradas.find(m => m._id === formData.mascota);
    
    // Mostrar el formData completo
    console.log('=== DATOS DEL FORMULARIO ===');
    console.log('FormData completo:', formData);
    console.log('Mascota seleccionada:', mascotaSeleccionada);
    if (serviceType === 'paseador' || serviceType === 'veterinaria') {
      console.log('Duración seleccionada (solo UI):', duracionSeleccionada);
    }
    console.log('Service:', service);
    console.log('============================');
    
    // Handle booking submission
    await crearReserva(formData); 
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      // Llamar al callback para recargar los datos de la página principal
      if (onReservaExitosa) {
        onReservaExitosa();
      }
    }, 2500);
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return 'Precio no disponible';
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const getServiceTitle = () => {
    const serviceName = service?.nombreServicio || service?.tipoServicio || 'Servicio';
    switch (serviceType) {
      case 'veterinaria':
        return `Reservar: ${serviceName}`;
      case 'paseador':
        return `Contratar Paseador: ${serviceName}`;
      case 'cuidador':
        return `Contratar Cuidador: ${serviceName}`;
      default:
        return 'Reservar Servicio';
    }
  };

  const getServicePrice = () => {
    switch (serviceType) {
      case 'veterinaria':
        return formatPrice(service?.precio || service?.price);
      case 'paseador':
        return `${formatPrice(service?.pricePerHour)}/hora`;
      case 'cuidador':
        return `${formatPrice(service?.pricePerDay)}/día`;
      default:
        return '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {getServiceTitle()}
            </h2>
            <p className="text-lg font-semibold text-blue-600">
              {getServicePrice()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pet Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Dog className="h-5 w-5 mr-2" />
              Información de tu Mascota
            </h3>
            <div className="grid md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecciona tu Mascota *
                </label>
                {cargandoMascotas ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                    Cargando mascotas...
                  </div>
                ) : mascotasFiltradas.length > 0 ? (
                  <select
                    required
                    value={formData.mascota}
                    onChange={(e) => {
                      const mascotaId = e.target.value;
                      setFormData({ ...formData, mascota: mascotaId });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una mascota</option>
                    {mascotasFiltradas.map((mascota) => {
                      const mascotaId = mascota._id || mascota.id;
                      return (
                        <option key={mascotaId} value={mascotaId}>
                          {mascota.nombre} ({mascota.tipo})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                    {mascotasUsuario.length === 0 ? (
                      'No tienes mascotas registradas.'
                    ) : (
                      <>
                        No tienes mascotas compatibles con este servicio.
                        {service?.mascotasAceptadas && service.mascotasAceptadas.length > 0 && (
                          <span className="block text-sm mt-1">
                            Este servicio acepta: {service.mascotasAceptadas.join(', ')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Tus Datos de Contacto
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombreDeContacto}
                  onChange={(e) => setFormData({ ...formData, nombreDeContacto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefonoContacto}
                  onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.emailContacto}
                onChange={(e) => setFormData({ ...formData, emailContacto: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Detalles del Servicio
            </h3>
            {(serviceType === 'veterinaria' || serviceType === 'paseador') && (
              <div className="space-y-4">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Preferida *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMostrarCalendario(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
                    >
                      <span className={formData.rangoFechas.fechaInicio ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.rangoFechas.fechaInicio 
                          ? formData.rangoFechas.fechaInicio
                          : 'Seleccionar fecha'
                        }
                      </span>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Horarios Disponibles - Para Veterinarios */}
                {serviceType === 'veterinaria' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {!formData.rangoFechas.fechaInicio ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-700">
                          Por favor selecciona una fecha primero para ver los horarios disponibles
                        </p>
                      </div>
                    ) : !esFechaDisponible(formData.rangoFechas.fechaInicio) ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-700">
                          Este día no está disponible para citas. Días disponibles: {service?.diasDisponibles?.join(', ')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {obtenerHorariosConEstado(formData.rangoFechas.fechaInicio).map((horarioItem) => (
                            <button
                              key={horarioItem.horario}
                              type="button"
                              onClick={() => horarioItem.disponible && setFormData({ ...formData, horario: horarioItem.horario })}
                              disabled={!horarioItem.disponible}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.horario === horarioItem.horario
                                  ? 'bg-blue-500 text-white shadow-lg'
                                  : horarioItem.disponible
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                                    : 'bg-red-50 text-red-400 cursor-not-allowed opacity-50 line-through'
                              }`}
                              title={horarioItem.disponible ? 'Disponible' : 'Horario ocupado'}
                            >
                              {horarioItem.horario}
                              {!horarioItem.disponible && (
                                <span className="ml-1 text-xs">🚫</span>
                              )}
                            </button>
                          ))}
                        </div>
                        {obtenerHorariosDisponibles(formData.rangoFechas.fechaInicio).length === 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-red-700">
                              No hay horarios disponibles para esta fecha
                            </p>
                          </div>
                        )}
                        {!formData.horario && obtenerHorariosDisponibles(formData.rangoFechas.fechaInicio).length > 0 && (
                          <p className="text-sm text-red-600 mt-2">Por favor selecciona un horario disponible</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Horarios Disponibles - Para Paseadores */}
                {serviceType === 'paseador' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {!formData.rangoFechas.fechaInicio ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-700">
                          Por favor selecciona una fecha primero para ver los horarios disponibles
                        </p>
                      </div>
                    ) : !esFechaDisponible(formData.rangoFechas.fechaInicio) ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-700">
                          Este día no está disponible para paseos. Días disponibles: {service?.diasDisponibles?.join(', ')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {obtenerHorariosConEstado(formData.rangoFechas.fechaInicio).map((horarioItem) => (
                            <button
                              key={horarioItem.horario}
                              type="button"
                              onClick={() => horarioItem.disponible && setFormData({ ...formData, horario: horarioItem.horario })}
                              disabled={!horarioItem.disponible}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.horario === horarioItem.horario
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : horarioItem.disponible
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                                    : 'bg-red-50 text-red-400 cursor-not-allowed opacity-50 line-through'
                              }`}
                              title={horarioItem.disponible ? 'Disponible' : 'Horario ocupado'}
                            >
                              {horarioItem.horario}
                              {!horarioItem.disponible && (
                                <span className="ml-1 text-xs">🚫</span>
                              )}
                            </button>
                          ))}
                        </div>
                        {obtenerHorariosDisponibles(formData.rangoFechas.fechaInicio).length === 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-red-700">
                              No hay horarios disponibles para esta fecha
                            </p>
                          </div>
                        )}
                        {!formData.horario && obtenerHorariosDisponibles(formData.rangoFechas.fechaInicio).length > 0 && (
                          <p className="text-sm text-red-600 mt-2">Por favor selecciona un horario disponible</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                
              </div>
            )}
              
            {serviceType === 'cuidador' && (
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Período de cuidado *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Fecha de inicio */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Fecha de inicio
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMostrarCalendarioInicio(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex items-center justify-between"
                      >
                        <span className={formData.rangoFechas.fechaInicio ? 'text-gray-900' : 'text-gray-500'}>
                          {formData.rangoFechas.fechaInicio 
                            ? formData.rangoFechas.fechaInicio
                            : 'Seleccionar fecha'
                          }
                        </span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Fecha de fin */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Fecha de fin
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMostrarCalendarioFin(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-left flex items-center justify-between"
                      >
                        <span className={formData.rangoFechas.fechaFin ? 'text-gray-900' : 'text-gray-500'}>
                          {formData.rangoFechas.fechaFin 
                            ? formData.rangoFechas.fechaFin
                            : 'Seleccionar fecha'
                          }
                        </span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Información de duración */}
                {formData.rangoFechas.fechaInicio && formData.rangoFechas.fechaFin && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700">Duración del servicio:</span>
                      <span className="font-bold text-orange-800">
                        {(() => {
                          const fechaInicio = parsearFecha(formData.rangoFechas.fechaInicio);
                          const fechaFin = parsearFecha(formData.rangoFechas.fechaFin);
                          if (fechaInicio && fechaFin && fechaInicio <= fechaFin) {
                            return Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          }
                          return 0;
                        })()} días
                      </span>
                    </div>
                  </div>
                )}

                {/* Mensaje de validación de fechas */}
                {formData.rangoFechas.fechaInicio && formData.rangoFechas.fechaFin && (() => {
                  const { esValido, mensaje } = validarFechas();
                  return !esValido ? (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 flex items-center">
                        <span className="mr-2">⚠️</span>
                        {mensaje}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              rows={4}
              value={formData.notaAdicional}
              onChange={(e) => setFormData({ ...formData, notaAdicional: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Información adicional sobre tu mascota, necesidades especiales, etc."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                !formData.mascota ||
                !formData.rangoFechas.fechaInicio ||
                (serviceType === 'veterinaria' && !formData.horario) || 
                (serviceType === 'paseador' && !formData.horario) ||
                (serviceType === 'cuidador' && (!formData.rangoFechas.fechaFin || !validarFechas().esValido))
              }
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Confirmar Reserva
            </button>
          </div>
        </form>
      </div>
      
      {/* Calendario Modal */}
      {mostrarCalendario && (serviceType === 'veterinaria' || serviceType === 'paseador') && (
        <CalendarioModerno
          key={`calendario-${Date.now()}`} // Forzar recreación del componente
          fechaSeleccionada={formData.rangoFechas.fechaInicio}
          onFechaSeleccionada={(fecha) => {
            setFormData(prev => ({ 
              ...prev, 
              rangoFechas: { ...prev.rangoFechas, fechaInicio: fecha }
            }));
            setMostrarCalendario(false);
          }}
          onCerrar={() => setMostrarCalendario(false)}
          fechaMinima={obtenerFechaHoy()}
          colorTema={serviceType === 'paseador' ? 'green' : 'blue'}
          titulo="Seleccionar fecha de la cita"
          diasDisponibles={service?.diasDisponibles || service?.servicioReservado?.diasDisponibles}
        />
      )}
      
      {/* Calendarios para cuidadores */}
      {mostrarCalendarioInicio && serviceType === 'cuidador' && (
        <CalendarioModerno
          key={`calendario-inicio-${Date.now()}`}
          fechaSeleccionada={formData.rangoFechas.fechaInicio}
          onFechaSeleccionada={(fecha) => {
            const fechaFin = formData.rangoFechas.fechaFin;
            const nuevaFechaInicio = fecha; // Ya es string
            
            setFormData(prev => ({
              ...prev,
              rangoFechas: {
                fechaInicio: nuevaFechaInicio,
                fechaFin: fechaFin && new Date(fechaFin) < new Date(nuevaFechaInicio) ? nuevaFechaInicio : fechaFin
              }
            }));
            setMostrarCalendarioInicio(false);
          }}
          onCerrar={() => setMostrarCalendarioInicio(false)}
          fechaMinima={new Date().toISOString().split('T')[0]}
          colorTema="orange"
          titulo="Fecha de inicio del cuidado"
          diasDisponibles={service?.diasDisponibles}
        />
      )}
      
      {mostrarCalendarioFin && serviceType === 'cuidador' && (
        <CalendarioModerno
          key={`calendario-fin-${Date.now()}`}
          fechaSeleccionada={formData.rangoFechas.fechaFin}
          onFechaSeleccionada={(fecha) => {
            setFormData(prev => ({ 
              ...prev, 
              rangoFechas: { ...prev.rangoFechas, fechaFin: fecha }
            }));
            setMostrarCalendarioFin(false);
          }}
          onCerrar={() => setMostrarCalendarioFin(false)}
          fechaMinima={formData.rangoFechas.fechaInicio || new Date().toISOString().split('T')[0]}
          colorTema="orange"
          titulo="Fecha de fin del cuidado"
          diasDisponibles={service?.diasDisponibles}
        />
      )}

      {/* Popup de éxito */}
      {showSuccess && (
        <>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full transform animate-bounce-in border border-green-200">
              <div className="text-center">
                {/* Icono de éxito animado */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-2 bg-green-200 rounded-full animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white animate-pulse" />
                  </div>
                </div>
                
                {/* Título */}
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  ¡Reserva Confirmada!
                </h3>
                
                {/* Mensaje principal */}
                <p className="text-gray-700 mb-2 text-lg">
                  Tu solicitud de <span className="font-bold text-purple-600">{getServiceTitle().replace('Reservar: ', '').replace('Contratar Paseador: ', '').replace('Contratar Cuidador: ', '')}</span>
                </p>
                <p className="text-gray-600 mb-6 text-sm">
                  ha sido enviada exitosamente
                </p>
                
                {/* Información adicional con iconos */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
                  <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                    <Heart className="h-5 w-5 animate-pulse" />
                    <span className="text-sm font-semibold">
                      ¡Te contactaremos pronto!
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    Recibirás la confirmación por email y teléfono
                  </p>
                </div>
                
                {/* Barra de progreso mejorada */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-progress shadow-sm"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cerrando automáticamente...
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estilos CSS para las animaciones */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
              }
              
              @keyframes bounce-in {
                0% { 
                  transform: scale(0.3); 
                  opacity: 0; 
                }
                50% { 
                  transform: scale(1.05); 
                }
                70% { 
                  transform: scale(0.9); 
                }
                100% { 
                  transform: scale(1); 
                  opacity: 1; 
                }
              }
              
              .animate-bounce-in {
                animation: bounce-in 0.5s ease-out;
              }
              
              .animate-progress {
                animation: progress 2.5s linear forwards;
              }
            `
          }} />
        </>
      )}
    </div>
  );
};


export default ModalReserva