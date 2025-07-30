import React, { useState } from 'react';
import { Heart, MapPin, Star, Clock, Award, Shield } from 'lucide-react';
import { walkerServices } from '../data/mockData';
import ModalReserva from './ModalReserva';

interface ServiciosPaseadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const ServiciosPaseadores: React.FC<ServiciosPaseadoresProps> = ({ userType }) => {
  const [selectedWalker, setSelectedWalker] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookWalker = (walker: any) => {
    setSelectedWalker(walker);
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

  return (
    <section id="paseadores" className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Paseadores Profesionales
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nuestros paseadores certificados se encargan de que tu mascota tenga 
            el ejercicio y diversión que necesita, con total seguridad y confianza. Servicio por horas.
          </p>
        </div>

        {/* Walkers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {walkerServices.map((walker) => (
            <div
              key={walker.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full"
            >
              {/* Profile Image */}
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {walker.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {renderStars(walker.rating)}
                    </div>
                    <span className="text-white text-sm">({walker.rating})</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                {/* Service Description */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Servicio de Paseos</h4>
                  <p className="text-gray-600 text-sm">
                    Paseos personalizados para tu mascota con ejercicio, socialización y cuidado profesional.
                  </p>
                </div>

                {/* Price and Experience */}
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {formatPrice(walker.pricePerHour)}/hora
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>{walker.experience} años exp.</span>
                  </div>
                </div>
                
                {/* Availability */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Disponibilidad:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {walker.availability.map((day, index) => (
                      <span
                        key={index}
                        className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Areas */}
                <div className="mb-6 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Zonas de servicio:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {walker.areas.map((area, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookWalker(walker)}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold transform hover:scale-105 mt-auto"
                >
                  Contratar Paseador
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Service Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              ¿Qué incluye nuestro servicio de paseos?
            </h3>
            <p className="text-gray-600 text-lg">
              Mucho más que un simple paseo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Seguridad Total</h4>
              <p className="text-gray-600 text-sm">GPS tracking y seguro incluido</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Reportes en Tiempo Real</h4>
              <p className="text-gray-600 text-sm">Fotos y actualizaciones del paseo</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ejercicio Personalizado</h4>
              <p className="text-gray-600 text-sm">Adaptado a la edad y raza</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Socialización</h4>
              <p className="text-gray-600 text-sm">Interacción con otras mascotas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ModalReserva
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedWalker}
        serviceType="paseador"
        userType={userType}
      />
    </section>
  );
};


export default ServiciosPaseadores