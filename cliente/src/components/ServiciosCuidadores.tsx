import React, { useState, useEffect } from 'react';
import { Shield, Home, Clock, Star, Award, CheckCircle, X, MapPin, Phone, DollarSign, Loader2, Calendar } from 'lucide-react';
import { obtenerServiciosCuidadores } from '../api/api';
import ModalReserva from './ModalReserva';

interface ServiciosCuidadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const ServiciosCuidadores: React.FC<ServiciosCuidadoresProps> = ({ userType }) => {
  const [servicios, setServicios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showAccessDeniedPopup, setShowAccessDeniedPopup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cargar = async () => {
      try {
        setIsLoading(true);
        const data = await obtenerServiciosCuidadores(1, {});
        if (!cancelled) {
          setServicios(data?.data || []);
        }
      } catch {
        if (!cancelled) setServicios([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    cargar();
    return () => { cancelled = true; };
  }, []);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR')}`;
  };

  const handleBookService = (service: any) => {
    if (userType !== 'cliente') {
      setShowAccessDeniedPopup(true);
      return;
    }
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  // Agrupar servicios por cuidador (nombreCuidador)
  const serviciosPorCuidador = servicios.reduce((acc: Record<string, any[]>, servicio: any) => {
    const cuidador = servicio.nombreCuidador || 'Cuidador sin nombre';
    if (!acc[cuidador]) acc[cuidador] = [];
    acc[cuidador].push(servicio);
    return acc;
  }, {});

  return (
    <section id="cuidadores" className="py-20 bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cuidadores Especializados
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cuando necesitas ausentarte, nuestros cuidadores especializados brindan
            atención integral y amorosa a tu mascota en un ambiente seguro y cómodo. Servicio por días.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            <span className="ml-3 text-gray-600">Cargando servicios de cuidadores...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && servicios.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay servicios de cuidadores disponibles</h3>
            <p className="text-gray-500">Pronto habrá cuidadores disponibles en tu zona.</p>
          </div>
        )}

        {/* Cuidadores grouped */}
        {!isLoading && Object.entries(serviciosPorCuidador).length > 0 && (
          <div className="space-y-8 mb-16">
            {Object.entries(serviciosPorCuidador).map(([nombreCuidador, serviciosCuidador]) => {
              const primerServicio = serviciosCuidador[0];
              const direccion = primerServicio?.direccion;
              const dirTexto = direccion
                ? `${direccion.calle || ''} ${direccion.altura || ''}, ${direccion.localidad?.nombre || ''}`
                : '';

              return (
                <div key={nombreCuidador} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Cuidador Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-2xl font-bold mb-2">{nombreCuidador}</h3>
                        <div className="flex items-center space-x-4 text-orange-100">
                          {dirTexto && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{dirTexto}</span>
                            </div>
                          )}
                          {primerServicio?.telefonoCuidador && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{primerServicio.telefonoCuidador}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-orange-100">
                        {serviciosCuidador.length} servicio{serviciosCuidador.length !== 1 ? 's' : ''} disponible{serviciosCuidador.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="p-6 bg-orange-50">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {serviciosCuidador.map((servicio: any) => (
                        <div
                          key={servicio.id}
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-orange-100"
                        >
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {servicio.nombreServicio}
                                </h4>
                                {servicio.tipoServicio && (
                                  <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full mt-1">
                                    {servicio.tipoServicio}
                                  </span>
                                )}
                              </div>
                              <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-2 whitespace-nowrap">
                                {formatPrice(servicio.precio)}/día
                              </div>
                            </div>

                            <p className="text-gray-600 mb-4 flex-1 text-sm">
                              {servicio.descripcion}
                            </p>

                            {/* Service Details */}
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                              {servicio.duracionMinutos && (
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{servicio.duracionMinutos} min</span>
                                </div>
                              )}
                              {servicio.horariosDisponibles && (
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{servicio.horariosDisponibles.length} horarios</span>
                                </div>
                              )}
                            </div>

                            {/* Available Hours */}
                            {servicio.horariosDisponibles && servicio.horariosDisponibles.length > 0 && (
                              <div className="mb-6">
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                  Horarios Disponibles:
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {servicio.horariosDisponibles.map((hora: string, i: number) => (
                                    <span key={i} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                      {hora}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mascotas aceptadas */}
                            {servicio.mascotasAceptadas && servicio.mascotasAceptadas.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-1">
                                  {servicio.mascotasAceptadas.map((m: string, i: number) => (
                                    <span key={i} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => handleBookService(servicio)}
                              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-all duration-300 font-semibold transform hover:scale-105 mt-auto"
                            >
                              Contratar Cuidador
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Why Choose Our Caregivers */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 md:p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Por qué elegir nuestros cuidadores?
            </h3>
            <p className="text-orange-100 text-lg">
              Tranquilidad total para ti y tu mascota
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Certificados</h4>
              <p className="text-orange-100 text-sm">Formación especializada en cuidado animal</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Ambiente Familiar</h4>
              <p className="text-orange-100 text-sm">Cuidado en un entorno hogareño</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Atención 24/7</h4>
              <p className="text-orange-100 text-sm">Cuidado continuo y supervisión</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Totalmente Asegurado</h4>
              <p className="text-orange-100 text-sm">Cobertura completa de responsabilidad</p>
            </div>
          </div>
        </div>

        {/* Service Process */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona nuestro servicio?
            </h3>
            <p className="text-gray-600 text-lg">
              Proceso simple y transparente
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-600">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Reserva</h4>
              <p className="text-gray-600 text-sm">Selecciona fechas y cuidador</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-600">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Conoce al Cuidador</h4>
              <p className="text-gray-600 text-sm">Presentación previa con tu mascota</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-600">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cuidado</h4>
              <p className="text-gray-600 text-sm">Atención completa según tus instrucciones</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Reportes</h4>
              <p className="text-gray-600 text-sm">Updates diarios con fotos y videos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ModalReserva
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedService}
        serviceType="cuidador"
        userType={userType}
      />

      {/* Access Denied Popup */}
      {showAccessDeniedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAccessDeniedPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h3>
              <p className="text-gray-600 mb-6">
                Solo los dueños de mascotas pueden contratar servicios de cuidadores.
                Regístrate como cliente para acceder a esta funcionalidad.
              </p>
              <button
                onClick={() => setShowAccessDeniedPopup(false)}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServiciosCuidadores;
