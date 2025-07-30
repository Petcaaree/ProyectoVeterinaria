import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EncabezadoPaginaProps {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  colorFondo?: string;
  colorIcono?: string;
}

const EncabezadoPagina: React.FC<EncabezadoPaginaProps> = ({
  icono: Icono,
  titulo,
  descripcion,
  colorFondo = 'bg-blue-100',
  colorIcono = 'text-blue-600'
}) => {
  return (
    <div className="text-center mb-12">
      <div className={`${colorFondo} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}>
        <Icono className={`h-10 w-10 ${colorIcono}`} />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {titulo}
      </h1>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
        {descripcion}
      </p>
    </div>
  );
};

export default EncabezadoPagina;