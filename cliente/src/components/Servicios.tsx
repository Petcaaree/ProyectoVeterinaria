import React from 'react';
import { Stethoscope, Heart, Clock, Shield } from 'lucide-react';
import TarjetaServicio from './comun/TarjetaServicio';

const Servicios: React.FC = () => {
  const services = [
    {
      icon: Stethoscope,
      title: 'Servicios Veterinarios',
      description: 'Atención médica profesional con veterinarios certificados',
      features: ['Consultas generales', 'Vacunación', 'Cirugías', 'Emergencias'],
      color: 'blue',
      href: '#veterinaria'
    },
    {
      icon: Heart,
      title: 'Paseadores Profesionales',
      description: 'Paseos seguros y divertidos para tu mascota',
      features: ['Paseos diarios', 'Ejercicio personalizado', 'Reportes en tiempo real', 'Seguro incluido'],
      color: 'green',
      href: '#paseadores'
    },
    {
      icon: Shield,
      title: 'Cuidadores Especializados',
      description: 'Cuidado integral cuando no puedes estar presente',
      features: ['Cuidado 24/7', 'Alimentación programada', 'Compañía', 'Medicación'],
      color: 'orange',
      href: '#cuidadores'
    }
  ];


  return (
    <section id="servicios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ofrecemos una gama completa de servicios profesionales para el cuidado 
            de tu mascota, con la mejor calidad y atención personalizada.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            return (
              <TarjetaServicio
                key={index}
                icono={service.icon}
                titulo={service.title}
                descripcion={service.description}
                caracteristicas={service.features}
                color={service.color as 'blue' | 'green' | 'orange'}
                href={service.href}
                alHacerClick={() => window.location.href = service.href}
              />
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Consultas Realizadas</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1,200+</div>
              <div className="text-gray-600">Paseos Completados</div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">300+</div>
              <div className="text-gray-600">Días de Cuidado</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Disponibilidad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default Servicios