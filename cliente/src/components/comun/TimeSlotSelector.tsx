import React from 'react';

interface TimeSlotSelectorProps {
  availableSlots: string[];
  selectedSlots: string[];
  onToggle: (time: string) => void;
  disabled: boolean;
  disabledMessage: string;
  duracionMinutos: string;
  color: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableSlots,
  selectedSlots,
  onToggle,
  disabled,
  disabledMessage,
  duracionMinutos,
  color,
}) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Horarios Disponibles *
      </label>
      {disabled && (
        <p className="text-sm text-gray-500 mb-3">{disabledMessage}</p>
      )}
      <div className="grid grid-cols-5 gap-2">
        {availableSlots.map(time => (
          <button
            key={time}
            type="button"
            onClick={() => onToggle(time)}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedSlots.includes(time)
                ? `bg-${color}-500 text-white`
                : disabled
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
      {duracionMinutos && parseInt(duracionMinutos) >= 30 && availableSlots.length > 0 && (
        <p className="text-sm text-green-600 mt-2">
          Horarios generados cada {duracionMinutos} minutos (de 10:00 AM a 8:00 PM)
        </p>
      )}
    </div>
  );
};

export default TimeSlotSelector;
