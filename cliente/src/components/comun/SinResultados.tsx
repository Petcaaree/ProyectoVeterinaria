import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface SinResultadosProps {
  titulo?: string;
  descripcion?: string;
  sugerencias?: string[];
}

const SinResultados: React.FC<SinResultadosProps> = ({
  titulo = 'No se encontraron resultados',
  descripcion = 'Intenta ajustar tus filtros de búsqueda para encontrar lo que buscas.',
  sugerencias = [
    'Verifica la ortografía de tu búsqueda',
    'Usa términos más generales',
    'Prueba con diferentes filtros',
    'Elimina algunos filtros para ampliar la búsqueda'
  ]
}) => {
  return (
    <div className="text-center py-16">
      <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {titulo}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {descripcion}
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sugerencias:
        </h4>
        <ul className="text-sm text-gray-600 space-y-2">
          {sugerencias.map((sugerencia, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              {sugerencia}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SinResultados;