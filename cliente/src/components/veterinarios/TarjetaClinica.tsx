import React from 'react';
import { MapPin, Phone, Calendar, Clock } from 'lucide-react';
import EstrellaCalificacion from '../comun/EstrellaCalificacion';
import Boton from '../comun/Boton';
import { VeterinaryClinic, VeterinaryService } from '../../types';

interface TarjetaClinicaProps {
  clinica: VeterinaryClinic;
  alReservar: (clinica: VeterinaryClinic) => void;
}

const TarjetaClinica: React.FC<TarjetaClinicaProps> = ({ clinica, alReservar }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{clinica.name}</h3>
        <div className="flex items-center space-x-2 mb-3">
          <EstrellaCalificacion calificacion={clinica.rating} />
        </div>
        <div className="flex items-center text-blue-100">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{clinica.address}</span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Services */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Servicios disponibles</h4>
          <div className="space-y-2">
            {clinica.services.map((servicio, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{servicio.name}</span>
                <span className="text-sm font-semibold text-blue-600">
                  ${servicio.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            <span className="text-sm">{clinica.phone}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{clinica.hours}</span>
          </div>
        </div>
        
        <Boton
          onClick={() => alReservar(clinica)}
          ancho="completo"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Reservar Cita
        </Boton>
      </div>
    </div>
  );
};

export default TarjetaClinica;