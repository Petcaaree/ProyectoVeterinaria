import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, DollarSign, Calendar, Star, MapPin, Phone, X, Shield, Loader2 } from 'lucide-react';
import { obtenerServiciosVeterinarias } from '../api/api';
import ModalReserva from './ModalReserva';

interface ServiciosVeterinariosProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const ServiciosVeterinarios: React.FC<ServiciosVeterinariosProps> = ({ userType }) => {
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
        const data = await obtenerServiciosVeterinarias(1, {});
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

  // Agrupar servicios por clínica (nombreClinica)
  const serviciosPorClinica = servicios.reduce((acc: Record<string, any[]>, servicio: any) => {
    const clinica = servicio.nombreClinica || 'Clínica sin nombre';
    if (!acc[clinica]) acc[clinica] = [];
    acc[clinica].push(servicio);
    return acc;
  }, {});

  return (
    <section id="veterinaria" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Clínicas Veterinarias
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Encuentra la mejor atención médica para tu mascota en nuestras clínicas
            veterinarias asociadas, con profesionales certificados y equipos de última tecnología.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Cargando servicios veterinarios...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && servicios.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay servicios veterinarios disponibles</h3>
            <p className="text-gray-500">Pronto habrá clínicas disponibles en tu zona.</p>
          </div>
        )}

        {/* Clinics grouped */}
        {!isLoading && Object.entries(serviciosPorClinica).length > 0 && (
          <div className="space-y-8">
            {Object.entries(serviciosPorClinica).map(([nombreClinica, serviciosClinica]) => {
              const primerServicio = serviciosClinica[0];
              const direccion = primerServicio?.direccion;
              const dirTexto = direccion
                ? `${direccion.calle || ''} ${direccion.altura || ''}, ${direccion.localidad?.nombre || ''}`
                : '';

              return (
                <div key={nombreClinica} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Clinic Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-2xl font-bold mb-2">{nombreClinica}</h3>
                        <div className="flex items-center space-x-4 text-blue-100">
                          {dirTexto && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{dirTexto}</span>
                            </div>
                          )}
                          {primerServicio?.telefonoClinica && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{primerServicio.telefonoClinica}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-blue-100">
                        {serviciosClinica.length} servicio{serviciosClinica.length !== 1 ? 's' : ''} disponible{serviciosClinica.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {serviciosClinica.map((servicio: any) => (
                        <div
                          key={servicio.id}
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100"
                        >
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {servicio.nombreServicio}
                                </h4>
                                {servicio.tipoServicio && (
                                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1">
                                    {servicio.tipoServicio}
                                  </span>
                                )}
                              </div>
                              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-2 whitespace-nowrap">
                                {formatPrice(servicio.precio)}
                              </div>
                            </div>

                            <p className="text-gray-600 mb-4 flex-1 text-sm">
                              {servicio.descripcion}
                            </p>

                            {/* Service Details */}
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{servicio.duracionMinutos} min</span>
                              </div>
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
                                    <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
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
                              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold transform hover:scale-105 mt-auto"
                            >
                              Reservar Cita
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

        {/* Why Choose Our Clinics */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Por qué elegir nuestras clínicas veterinarias?
            </h3>
            <p className="text-blue-100 text-lg">
              Comprometidos con la salud y bienestar de tu mascota
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Profesionales Certificados</h4>
              <p className="text-blue-100 text-sm">Veterinarios con años de experiencia</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Equipos Modernos</h4>
              <p className="text-blue-100 text-sm">Tecnología de última generación</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Atención Rápida</h4>
              <p className="text-blue-100 text-sm">Citas disponibles el mismo día</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Precios Justos</h4>
              <p className="text-blue-100 text-sm">Calidad al mejor precio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ModalReserva
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedService}
        serviceType="veterinaria"
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
                Solo los dueños de mascotas pueden contratar servicios veterinarios.
                Regístrate como cliente para acceder a esta funcionalidad.
              </p>
              <button
                onClick={() => setShowAccessDeniedPopup(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
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

export default ServiciosVeterinarios;
