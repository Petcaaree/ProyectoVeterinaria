import React from 'react';
import { Clock, CheckCircle, MapPin } from 'lucide-react';
import EstrellaCalificacion from '../comun/EstrellaCalificacion';
import Boton from '../comun/Boton';
import { CaregiverService } from '../../types';

interface TarjetaCuidadorProps {
  alContratar: (cuidador: CaregiverService) => void;
}

const TarjetaCuidador: React.FC<TarjetaCuidadorProps> = ({ cuidador, alContratar }) => {
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

       const formatearMascota = (mascota: string) => {
      const mascotaMap: { [key: string]: string } = {
        'PERRO': 'Perro',
        'GATO': 'Gato',
        'AVE': 'Ave',
        'OTRO': 'Otro'
            };
      return mascotaMap[mascota.toUpperCase()] || mascota;
    }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white relative">
        <div className="absolute top-4 right-4">
          <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">
            {/* {cuidador.experience} */} 4 años
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">
          {cuidador.nombreContacto}
        </h3>
        <div className="flex items-center space-x-2 mb-3">
          <EstrellaCalificacion calificacion={3} />
        </div>
        <div className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold inline-block">
          {formatearPrecio(cuidador.precio)}/día
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Descripción del servicio */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{cuidador.nombreServicio}</h4>
          <p className="text-gray-600 text-sm">
            {cuidador.descripcion}
          </p>
        </div>

        {/* Áreas de servicio */}
        <div className="mb-6 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Mascotas aceptadas:
          </h4>
          <div className="flex flex-wrap gap-1">
            {cuidador.mascotasAceptadas.map((area, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
              >
                {formatearMascota(area)}
              </span>
            ))}
          </div>
        </div>
        
        {/* Disponibilidad */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Disponibilidad:
          </h4>
          <div className="flex flex-wrap gap-1">
            {cuidador.diasDisponibles.map((periodo, index) => (
              <span
                key={index}
                className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
              >
                {formatDayOfWeek(periodo) }
              </span>
            ))}
          </div>
        </div>
        
        <Boton
          onClick={() => alContratar(cuidador)}
          ancho="completo"
          className="bg-orange-600 hover:bg-orange-700"
        >
          Contratar Cuidador
        </Boton>
      </div>
    </div>
  );
};

export default TarjetaCuidador;