import React from 'react';

interface BotonProps {
  children: React.ReactNode;
  onClick?: () => void;
  tipo?: 'button' | 'submit' | 'reset';
  variante?: 'primario' | 'secundario' | 'peligro' | 'exito';
  tamaño?: 'sm' | 'md' | 'lg';
  ancho?: 'auto' | 'completo';
  deshabilitado?: boolean;
  className?: string;
}

const Boton: React.FC<BotonProps> = ({
  children,
  onClick,
  tipo = 'button',
  variante = 'primario',
  tamaño = 'md',
  ancho = 'auto',
  deshabilitado = false,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primario: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secundario: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    peligro: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    exito: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const widthClasses = {
    auto: '',
    completo: 'w-full'
  };

  const disabledClasses = deshabilitado 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  const finalClassName = `
    ${baseClasses}
    ${variantClasses[variante]}
    ${sizeClasses[tamaño]}
    ${widthClasses[ancho]}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      className={finalClassName}
    >
      {children}
    </button>
  );
};

export default Boton;