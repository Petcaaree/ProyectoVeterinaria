import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import CalendarioModerno from './CalendarioModerno';

interface SelectorFechasProps {
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  colorTema?: 'blue' | 'green' | 'orange';
}

const SelectorFechas: React.FC<SelectorFechasProps> = ({
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  colorTema = 'blue'
}) => {
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = React.useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = React.useState(false);

  const colores = {
    blue: 'focus:ring-blue-500 focus:border-blue-500',
    green: 'focus:ring-green-500 focus:border-green-500',
    orange: 'focus:ring-orange-500 focus:border-orange-500'
  };

  const tema = colores[colorTema];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="col-span-full lg:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Período de cuidado
      </label>
      <div className="flex items-end gap-3">
        {/* Fecha de inicio */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Fecha de inicio
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setMostrarCalendarioInicio(true)}
              className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${tema} transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left ${!fechaInicio ? 'text-gray-500' : 'text-gray-900'}`}
            >
              {fechaInicio 
                ? new Date(fechaInicio).toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })
                : 'Seleccionar fecha'
              }
            </button>
            
            {mostrarCalendarioInicio && (
              <CalendarioModerno
                fechaSeleccionada={fechaInicio}
                onFechaSeleccionada={onFechaInicioChange}
                onCerrar={() => setMostrarCalendarioInicio(false)}
                fechaMinima={today}
                colorTema={colorTema}
                titulo="Fecha de inicio"
              />
            )}
          </div>
        </div>

        {/* Separador visual */}
        <div className="flex items-center justify-center pb-3">
          <div className="flex items-center text-gray-400">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        {/* Fecha de fin */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Fecha de fin
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setMostrarCalendarioFin(true)}
              className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl ${tema} transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left ${!fechaFin ? 'text-gray-500' : 'text-gray-900'}`}
            >
              {fechaFin 
                ? new Date(fechaFin).toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })
                : 'Seleccionar fecha'
              }
            </button>
            
            {mostrarCalendarioFin && (
              <CalendarioModerno
                fechaSeleccionada={fechaFin}
                onFechaSeleccionada={onFechaFinChange}
                onCerrar={() => setMostrarCalendarioFin(false)}
                fechaMinima={fechaInicio || today}
                colorTema={colorTema}
                titulo="Fecha de fin"
              />
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      {fechaInicio && fechaFin && (
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-700">Duración del servicio:</span>
            <span className="font-bold text-orange-800">
              {Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1} días
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorFechas;