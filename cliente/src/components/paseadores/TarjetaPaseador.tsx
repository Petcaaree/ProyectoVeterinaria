import React from 'react';
import { MapPin, Award, Clock } from 'lucide-react';
import EstrellaCalificacion from '../comun/EstrellaCalificacion';
import Boton from '../comun/Boton';

interface TarjetaPaseadorProps {
  paseador: any; // Temporal hasta que tengamos la estructura correcta de la API
  alContratar: (paseador: any) => void;
}

const TarjetaPaseador: React.FC<TarjetaPaseadorProps> = ({ paseador, alContratar }) => {
  // Debug para ver la estructura de datos
  
  const formatearPrecio = (precio: number) => {
    return precio.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const formatDayOfWeek = (day: string) => {
        const dayMap: { [key: string]: string } = {
          'LUNES': 'Lunes',
          'MARTES': 'Martes',
          'MIERCOLES': 'Miércoles',
          'JUEVES': 'Jueves',
          'VIERNES': 'Viernes',
          'SABADO': 'Sábado',
          'DOMINGO': 'Domingo'
        };
        return dayMap[day.toUpperCase()] || day;
      };


  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full">
      {/* Encabezado del perfil */}
      <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {paseador?.nombreContacto }
          </h3>
          <EstrellaCalificacion calificacion={3} />
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Descripción del servicio */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{paseador.nombreServicio}</h4>
          <p className="text-gray-600 text-sm">
            {paseador?.descripcion}
          </p>
        </div>

        {/* Precio y experiencia */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            {formatearPrecio(paseador?.precio || 0)}/hora
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Award className="h-4 w-4" />
            <span>4 años exp.</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Disponibilidad:
          </h4>
          <div className="flex flex-wrap gap-1">
            {paseador.diasDisponibles.map((periodo, index) => (
              <span
                key={index}
                className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
              >
                {formatDayOfWeek(periodo) }
              </span>
            ))}
          </div>
        </div>
        
        
        {/* Áreas de servicio */}
        <div className="mb-6 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Zonas de servicio:
          </h4>
          <div className="flex flex-wrap gap-1">
            <span
              className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
            >
              {typeof paseador?.direccion?.localidad?.ciudad === 'object' 
                ? paseador?.direccion?.localidad?.ciudad?.nombre || 'No especificado'
                : paseador?.direccion?.localidad?.ciudad || 'No especificado'}
            </span>
          </div>
        </div>
        
        <Boton
          onClick={() => alContratar(paseador)}
          ancho="completo"
          className="bg-green-600 hover:bg-green-700"
        >
          Contratar Paseador
        </Boton>
      </div>
    </div>
  );
};

export default TarjetaPaseador;