import React, { useState } from 'react';
import { Stethoscope, Clock, DollarSign, Calendar, Star, MapPin, Phone, X, Shield } from 'lucide-react';
import { veterinaryClinics } from '../data/mockData';
import ModalReserva from './ModalReserva';

interface ServiciosVeterinariosProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const ServiciosVeterinarios: React.FC<ServiciosVeterinariosProps> = ({ userType }) => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showAccessDeniedPopup, setShowAccessDeniedPopup] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookService = (service: any, clinic: any) => {
    if (userType !== 'cliente') {
      setShowAccessDeniedPopup(true);
      return;
    }
    setSelectedService(service);
    setSelectedClinic(clinic);
    setIsBookingOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Generate all possible time slots for consistent layout
  const allTimeSlots = ['8:00', '9:00', '10:00', '10:30', '11:00', '14:00', '15:00', '15:30', '16:00', '17:00'];

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

        {/* Clinics */}
        <div className="space-y-8">
          {veterinaryClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Clinic Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl font-bold mb-2">{clinic.name}</h3>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{clinic.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{clinic.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {renderStars(clinic.rating)}
                    </div>
                    <span className="text-lg font-semibold">({clinic.rating})</span>
                  </div>
                </div>
              </div>

              {/* Services Grid */}
              <div className="p-6 bg-gray-50">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clinic.services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100"
                    >
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900 flex-1">
                            {service.name}
                          </h4>
                          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-2">
                            {formatPrice(service.price)}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 flex-1">
                          {service.description}
                        </p>
                        
                        {/* Service Details */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{service.availableHours.length} horarios</span>
                          </div>
                        </div>
                        
                        {/* Available Hours - Fixed Grid */}
                        <div className="mb-6">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">
                            Horarios Disponibles:
                          </h5>
                          <div className="grid grid-cols-3 gap-1 min-h-[80px]">
                            {allTimeSlots.slice(0, 9).map((hour, index) => {
                              const isAvailable = service.availableHours.includes(hour);
                              return (
                                <div
                                  key={index}
                                  className={`px-2 py-1 rounded text-xs text-center font-medium ${
                                    isAvailable
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-gray-100 text-gray-400 opacity-50'
                                  }`}
                                >
                                  {hour}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleBookService(service, clinic)}
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
          ))}
        </div>

        {/* Why Choose Our Clinics */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
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


export default ServiciosVeterinarios