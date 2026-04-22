import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface EstrellaCalificacionProps {
  calificacion: number;
  tamaño?: 'sm' | 'md' | 'lg';
  mostrarNumero?: boolean;
  modo?: 'display' | 'input';
  onChange?: (valor: number) => void;
}

const EstrellaCalificacion: React.FC<EstrellaCalificacionProps> = ({
  calificacion,
  tamaño = 'md',
  mostrarNumero = true,
  modo = 'display',
  onChange,
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const esInput = modo === 'input';

  const tamaños = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // En input el valor visible es el hover actual; fuera de hover mostramos el valor elegido.
  const valorVisible = esInput && hover !== null ? hover : calificacion;

  const renderStar = (i: number) => {
    const filled = esInput
      ? i < valorVisible
      : i < Math.floor(valorVisible);
    const halfFilled = !esInput && i >= Math.floor(valorVisible) && i < valorVisible;

    const className = `${tamaños[tamaño]} ${
      filled
        ? 'text-yellow-400 fill-current'
        : halfFilled
        ? 'text-yellow-400 fill-current opacity-50'
        : 'text-gray-300'
    } ${esInput ? 'cursor-pointer transition-transform hover:scale-110' : ''}`;

    if (!esInput) {
      return <Star key={i} className={className} />;
    }

    return (
      <button
        type="button"
        key={i}
        aria-label={`${i + 1} estrella${i === 0 ? '' : 's'}`}
        onMouseEnter={() => setHover(i + 1)}
        onMouseLeave={() => setHover(null)}
        onClick={() => onChange?.(i + 1)}
        className="p-0 bg-transparent border-0"
      >
        <Star className={className} />
      </button>
    );
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-0.5">
        {Array.from({ length: 5 }, (_, i) => renderStar(i))}
      </div>
      {mostrarNumero && !esInput && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {calificacion.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default EstrellaCalificacion;
