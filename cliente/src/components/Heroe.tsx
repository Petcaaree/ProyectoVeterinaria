import React from 'react';
import { ArrowRight, Shield, Clock, Star, Heart } from 'lucide-react';

interface HeroeProps {
  onRegisterPetClick: () => void;
}

const Heroe: React.FC<HeroeProps> = ({ onRegisterPetClick }) => {

  return (
    <section id="inicio" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                El mejor cuidado para tu
                <span className="text-blue-600 block">mascota</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Conectamos a tu mascota con profesionales expertos en veterinaria, 
                paseos y cuidado. Todo en un solo lugar, con la confianza y calidad 
                que tu mejor amigo merece.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold">
                <span>Explorar Servicios</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                onClick={onRegisterPetClick}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold"
              >
                <Heart className="h-5 w-5" />
                <span>Registrar Mascota</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">100%</span>
                </div>
                <p className="text-sm text-gray-600">Profesionales Verificados</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-gray-900">24/7</span>
                </div>
                <p className="text-sm text-gray-600">Disponibilidad</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">4.9</span>
                </div>
                <p className="text-sm text-gray-600">Calificación</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Veterinario cuidando mascota"
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                <Heart className="h-6 w-6" />
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute top-10 -left-6 bg-white rounded-lg shadow-lg p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cita Hoy</p>
                  <p className="text-xs text-gray-600">15:30 - Vacunación</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-10 -right-6 bg-white rounded-lg shadow-lg p-4 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Star className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">5 Estrellas</p>
                  <p className="text-xs text-gray-600">Servicio excelente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default Heroe