import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import Boton from './Boton';

interface TarjetaServicioProps {
  titulo: string;
  descripcion: string;
  precio?: string;
  icono?: React.ComponentType<any>;
  onReservar?: () => void;
}

const TarjetaServicio: React.FC<TarjetaServicioProps> = ({
  titulo,
  descripcion,
  precio,
  icono: Icono = LucideIcon,
  onReservar
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <Icono className="w-8 h-8 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">{titulo}</h3>
      </div>
      
      <p className="text-gray-600 mb-4">{descripcion}</p>
      
      {precio && (
        <div className="mb-4">
          <span className="text-2xl font-bold text-blue-600">{precio}</span>
        </div>
      )}
      
      {onReservar && (
        <Boton onClick={onReservar} className="w-full">
          Reservar Servicio
        </Boton>
      )}
    </div>
  );
};

export default TarjetaServicio;