import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Star, Heart } from 'lucide-react';

interface CalendarioPersonalizadoProps {
  fechaSeleccionada?: string;
  onFechaSeleccionada: (fecha: string) => void;
  fechaMinima?: string;
  fechaMaxima?: string;
  colorTema?: 'blue' | 'green' | 'orange';
  className?: string;
}

const CalendarioPersonalizado: React.FC<CalendarioPersonalizadoProps> = ({
  fechaSeleccionada,
  onFechaSeleccionada,
  fechaMinima,
  fechaMaxima,
  colorTema = 'blue',
  className = ''
}) => {
  const [mesActual, setMesActual] = useState(new Date());

  const colores = {
    blue: {
      primary: 'bg-blue-600 text-white',
      hover: 'hover:bg-blue-50 hover:text-blue-700',
      selected: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg',
      today: 'bg-blue-100 text-blue-800 font-bold',
      header: 'bg-gradient-to-r from-blue-500 to-blue-600',
      accent: 'text-blue-600'
    },
    green: {
      primary: 'bg-green-600 text-white',
      hover: 'hover:bg-green-50 hover:text-green-700',
      selected: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg',
      today: 'bg-green-100 text-green-800 font-bold',
      header: 'bg-gradient-to-r from-green-500 to-green-600',
      accent: 'text-green-600'
    },
    orange: {
      primary: 'bg-orange-600 text-white',
      hover: 'hover:bg-orange-50 hover:text-orange-700',
      selected: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg',
      today: 'bg-orange-100 text-orange-800 font-bold',
      header: 'bg-gradient-to-r from-orange-500 to-orange-600',
      accent: 'text-orange-600'
    }
  };

  const tema = colores[colorTema];

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const obtenerDiasDelMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();

    const dias = [];

    // Días del mes anterior (para completar la primera semana)
    for (let i = diaInicioSemana - 1; i >= 0; i--) {
      const fecha = new Date(año, mes, -i);
      dias.push({
        fecha: fecha,
        esDelMesActual: false,
        numero: fecha.getDate()
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(año, mes, dia);
      dias.push({
        fecha: fecha,
        esDelMesActual: true,
        numero: dia
      });
    }

    // Días del mes siguiente (para completar la última semana)
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(año, mes + 1, dia);
      dias.push({
        fecha: fecha,
        esDelMesActual: false,
        numero: dia
      });
    }

    return dias;
  };

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    const nuevoMes = new Date(mesActual);
    if (direccion === 'anterior') {
      nuevoMes.setMonth(nuevoMes.getMonth() - 1);
    } else {
      nuevoMes.setMonth(nuevoMes.getMonth() + 1);
    }
    setMesActual(nuevoMes);
  };

  const esFechaSeleccionada = (fecha: Date) => {
    if (!fechaSeleccionada) return false;
    const fechaStr = fecha.toISOString().split('T')[0];
    return fechaStr === fechaSeleccionada;
  };

  const esHoy = (fecha: Date) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const esFechaDeshabilitada = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    
    if (fechaMinima && fechaStr < fechaMinima) return true;
    if (fechaMaxima && fechaStr > fechaMaxima) return true;
    
    return false;
  };

  const manejarClickFecha = (fecha: Date) => {
    if (esFechaDeshabilitada(fecha)) return;
    
    const fechaStr = fecha.toISOString().split('T')[0];
    onFechaSeleccionada(fechaStr);
  };

  const dias = obtenerDiasDelMes();

  return (
    <div className={`bg-white rounded-3xl shadow-2xl border-0 overflow-hidden ${className}`}>
      {/* Header del calendario con gradiente */}
      <div className={`${tema.header} p-6 text-white relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-2 right-4 opacity-20">
          <Heart className="h-8 w-8" />
        </div>
        <div className="absolute bottom-2 left-4 opacity-20">
          <Star className="h-6 w-6" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => navegarMes('anterior')}
            className="p-3 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Calendar className="h-5 w-5" />
              <h3 className="text-xl font-bold">
                {meses[mesActual.getMonth()]}
              </h3>
            </div>
            <p className="text-sm opacity-90 font-medium">
              {mesActual.getFullYear()}
            </p>
          </div>
          
          <button
            onClick={() => navegarMes('siguiente')}
            className="p-3 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {diasSemana.map((dia) => (
            <div key={dia} className="text-center py-3">
              <span className={`text-sm font-bold ${tema.accent}`}>{dia}</span>
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {dias.map((dia, index) => {
            const esSeleccionada = esFechaSeleccionada(dia.fecha);
            const esHoyDia = esHoy(dia.fecha);
            const estaDeshabilitada = esFechaDeshabilitada(dia.fecha);
            
            return (
              <button
                key={index}
                onClick={() => manejarClickFecha(dia.fecha)}
                disabled={estaDeshabilitada}
                className={`
                  h-12 w-12 rounded-xl text-sm font-semibold transition-all duration-300 relative transform
                  ${dia.esDelMesActual ? 'text-gray-900' : 'text-gray-400'}
                  ${esSeleccionada ? `${tema.selected} scale-110 z-10` : ''}
                  ${esHoyDia && !esSeleccionada ? tema.today : ''}
                  ${!esSeleccionada && !esHoyDia && !estaDeshabilitada && dia.esDelMesActual ? `${tema.hover} hover:scale-105` : ''}
                  ${estaDeshabilitada ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                  ${!dia.esDelMesActual ? 'opacity-40' : ''}
                `}
              >
                {dia.numero}
                
                {/* Indicador especial para hoy */}
                {esHoyDia && !esSeleccionada && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className={`w-2 h-2 rounded-full ${tema.accent.replace('text-', 'bg-')}`}></div>
                  </div>
                )}
                
                {/* Efecto de selección */}
                {esSeleccionada && (
                  <div className="absolute inset-0 rounded-xl bg-white bg-opacity-20 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda mejorada */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-lg ${tema.today}`}></div>
              <span className="text-gray-600 font-medium">Hoy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-lg ${tema.selected}`}></div>
              <span className="text-gray-600 font-medium">Seleccionado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-lg bg-gray-200"></div>
              <span className="text-gray-600 font-medium">Disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioPersonalizado;