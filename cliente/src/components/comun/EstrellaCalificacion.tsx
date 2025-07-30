import React from 'react';
import { Star } from 'lucide-react';

interface EstrellaCalificacionProps {
  calificacion: number;
  tamaño?: 'sm' | 'md' | 'lg';
  mostrarNumero?: boolean;
}

const EstrellaCalificacion: React.FC<EstrellaCalificacionProps> = ({ 
  calificacion, 
  tamaño = 'md', 
  mostrarNumero = true 
}) => {
  const tamaños = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${tamaños[tamaño]} ${
          i < Math.floor(calificacion) 
            ? 'text-yellow-400 fill-current' 
            : i < calificacion 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-0.5">
        {renderStars()}
      </div>
      {mostrarNumero && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {calificacion.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default EstrellaCalificacion;