import React from 'react';
import { WEEK_DAYS } from '../../utils/servicioUtils';

interface DaySelectorProps {
  selectedDays: string[];
  onToggle: (day: string) => void;
  color: string;
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onToggle, color }) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Disponibilidad *
      </label>
      <div className="grid grid-cols-4 gap-2">
        {WEEK_DAYS.map(day => {
          let normalizedDay = day.toUpperCase();
          if (normalizedDay === 'SÁBADO') normalizedDay = 'SABADO';
          if (normalizedDay === 'MIÉRCOLES') normalizedDay = 'MIERCOLES';
          const isSelected = selectedDays.includes(normalizedDay);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggle(day)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? `bg-${color}-500 text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySelector;
