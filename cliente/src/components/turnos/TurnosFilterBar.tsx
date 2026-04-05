import React from 'react';
import { Filter } from 'lucide-react';
import type { FilterType } from '../../hooks/useReservas';

interface FilterConfig {
  key: FilterType;
  label: string;
  soloCliente: boolean;
}

const FILTERS: FilterConfig[] = [
  { key: 'TODAS', label: 'Todas', soloCliente: false },
  { key: 'PENDIENTE_PAGO', label: 'Sin pagar', soloCliente: true },
  { key: 'PENDIENTE', label: 'Pendientes', soloCliente: false },
  { key: 'CONFIRMADA', label: 'Confirmadas', soloCliente: false },
  { key: 'COMPLETADA', label: 'Completadas', soloCliente: false },
  { key: 'CANCELADA', label: 'Canceladas', soloCliente: false },
];

interface Totales {
  todas: number;
  pendientesPago: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
}

interface TurnosFilterBarProps {
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  totales: Totales;
  tipoUsuario: string | null;
}

const getCount = (key: FilterType, totales: Totales): number => {
  switch (key) {
    case 'TODAS': return totales.todas;
    case 'PENDIENTE_PAGO': return totales.pendientesPago;
    case 'PENDIENTE': return totales.pendientes;
    case 'CONFIRMADA': return totales.confirmadas;
    case 'COMPLETADA': return totales.completadas;
    case 'CANCELADA': return totales.canceladas;
    default: return 0;
  }
};

const TurnosFilterBar: React.FC<TurnosFilterBarProps> = ({ filter, onFilterChange, totales, tipoUsuario }) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.filter(f => !f.soloCliente || tipoUsuario === 'cliente').map(({ key, label }) => {
            const count = getCount(key, totales);
            const shouldShowCounter = key === 'TODAS' ? false :
              (key === 'PENDIENTE' || key === 'PENDIENTE_PAGO') ? count > 0 :
              (filter === key && count > 0);

            return (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  filter === key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{label}</span>
                {shouldShowCounter && (
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-bold ${
                    filter === key ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TurnosFilterBar;
