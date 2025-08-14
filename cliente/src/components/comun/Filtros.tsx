import React, { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';

interface FiltrosProps {
  busqueda: string;
  alCambiarBusqueda: (valor: string) => void;
  placeholderBusqueda?: string;
  filtrosAdicionales?: React.ReactNode;
  elementoFijo?: React.ReactNode;
  colorTema?: 'blue' | 'green' | 'orange';
}

const Filtros: React.FC<FiltrosProps> = ({
  busqueda,
  alCambiarBusqueda,
  placeholderBusqueda = 'Buscar...',
  filtrosAdicionales,
  elementoFijo,
  colorTema = 'blue'
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const colores = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      focus: 'focus:ring-blue-500 focus:border-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      button: 'bg-green-600 hover:bg-green-700',
      focus: 'focus:ring-green-500 focus:border-green-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      button: 'bg-orange-600 hover:bg-orange-700',
      focus: 'focus:ring-orange-500 focus:border-orange-500'
    }
  };

  const tema = colores[colorTema];

  const limpiarBusqueda = () => {
    alCambiarBusqueda('');
  };

  return (
    <div className={`${tema.bg} ${tema.border} border-2 rounded-2xl shadow-lg overflow-hidden mb-8`}>
      {/* Header del filtro */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${tema.button} p-2 rounded-lg`}>
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Buscar y Filtrar</h3>
              <p className="text-sm text-gray-600">Encuentra exactamente lo que necesitas</p>
            </div>
          </div>
          
          {filtrosAdicionales && (
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center space-x-2 px-4 py-2 ${tema.button} text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg`}
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mostrarFiltros ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={(e) => alCambiarBusqueda(e.target.value)}
            className={`w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl ${tema.focus} transition-all duration-200 bg-white shadow-sm text-lg placeholder-gray-400`}
          />
          {busqueda && (
            <button
              onClick={limpiarBusqueda}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros adicionales */}
      {filtrosAdicionales && (
        <div className={`transition-all duration-300 ease-in-out ${mostrarFiltros ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="px-6 pb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtrosAdicionales}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de búsqueda activa */}
      {busqueda && (
        <div className="px-6 pb-4">
          <div className={`${tema.bg} ${tema.border} border rounded-lg p-3 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <Search className={`h-4 w-4 ${tema.text}`} />
              <span className={`text-sm font-medium ${tema.text}`}>
                Buscando: "{busqueda}"
              </span>
            </div>
            <button
              onClick={limpiarBusqueda}
              className={`text-xs ${tema.text} hover:text-gray-700 font-medium transition-colors`}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Elemento fijo siempre visible */}
      {elementoFijo && (
        <div className="px-6 pb-6">
          {elementoFijo}
        </div>
      )}
    </div>
  );
};

export default Filtros;