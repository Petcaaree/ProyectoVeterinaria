import React, { useState } from 'react';
import { Shield, Home, Clock, Star, Award, CheckCircle } from 'lucide-react';
import { caregiverServices } from '../data/mockData';
import ModalReserva from './ModalReserva';

interface ServiciosCuidadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const ServiciosCuidadores: React.FC<ServiciosCuidadoresProps> = ({ userType }) => {
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookCaregiver = (caregiver: any) => {
    setSelectedCaregiver(caregiver);
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

        {/* Caregivers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {caregiverServices.map((caregiver) => (
            <div
              key={caregiver.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white relative">
                <div className="absolute top-4 right-4">
                  <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">
                    {caregiver.experience} años
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {caregiver.name}
                </h3>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex space-x-1">
                    {renderStars(caregiver.rating)}
                  </div>
                  <span className="text-sm">({caregiver.rating})</span>
                </div>
                <div className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold inline-block">
                  {formatPrice(caregiver.pricePerDay)}/día
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                {/* Service Description */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Servicio de Cuidado</h4>
                  <p className="text-gray-600 text-sm">
                    Cuidado integral de tu mascota con atención personalizada, alimentación, paseos y compañía las 24 horas.
                  </p>
                </div>

                {/* Services Included */}
                <div className="mb-6 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Servicios incluidos:
                  </h4>
                  <div className="space-y-2">
                    {caregiver.services.map((service, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Availability */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Disponibilidad:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {caregiver.availability.map((period, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
                      >
                        {period}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookCaregiver(caregiver)}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-all duration-300 font-semibold transform hover:scale-105 mt-auto"
                >
                  Contratar Cuidador
                </button>
              </div>
            </div>
          ))}
        </div>

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
        service={selectedCaregiver}
        serviceType="cuidador"
        userType={userType}
      />
    </section>
  );
};


export default ServiciosCuidadores