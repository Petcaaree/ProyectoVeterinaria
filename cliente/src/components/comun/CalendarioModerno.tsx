import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface CalendarioModernoProps {
  fechaSeleccionada?: string;
  onFechaSeleccionada: (fecha: string) => void;
  onCerrar: () => void;
  fechaMinima?: string;
  fechaMaxima?: string;
  colorTema?: 'blue' | 'green' | 'orange';
  titulo?: string;
  diasDisponibles?: string[]; // Nuevo: Array de días disponibles en español mayúsculas
}

const CalendarioModerno: React.FC<CalendarioModernoProps> = ({
  fechaSeleccionada,
  onFechaSeleccionada,
  onCerrar,
  fechaMinima,
  fechaMaxima,
  colorTema = 'blue',
  titulo = 'Seleccionar fecha',
  diasDisponibles
}) => {
  // Función helper para parsear fechas DD/MM/AAAA
  const parsearFechaDDMMAAAA = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    
    try {
      // Si es formato DD/MM/AAAA
      if (fechaStr.includes('/')) {
        const [dia, mes, año] = fechaStr.split('/');
        const diaNum = parseInt(dia);
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);
        
        // Validar que los números sean válidos
        if (isNaN(diaNum) || isNaN(mesNum) || isNaN(añoNum)) return null;
        if (mesNum < 1 || mesNum > 12) return null;
        if (diaNum < 1 || diaNum > 31) return null;
        if (añoNum < 1900 || añoNum > 2100) return null;
        
        const fecha = new Date(añoNum, mesNum - 1, diaNum);
        
        // Verificar que la fecha sea válida (no se "corrija" automáticamente)
        if (fecha.getDate() !== diaNum || fecha.getMonth() !== mesNum - 1 || fecha.getFullYear() !== añoNum) {
          return null;
        }
        
        return fecha;
      }
      
      // Si es formato ISO (YYYY-MM-DD) - para compatibilidad
      const fecha = new Date(fechaStr);
      return isNaN(fecha.getTime()) ? null : fecha;
    } catch (error) {
      console.warn('Error parsing date:', fechaStr, error);
      return null;
    }
  };

  const [mesActual, setMesActual] = useState(() => {
    try {
      // Intentar usar la fecha seleccionada si es válida
      if (fechaSeleccionada) {
        const fechaParsed = parsearFechaDDMMAAAA(fechaSeleccionada);
        if (fechaParsed && !isNaN(fechaParsed.getTime())) {
          return new Date(fechaParsed.getFullYear(), fechaParsed.getMonth(), 1);
        }
      }
      
      // Si no hay fecha válida, usar el mes actual
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    } catch (error) {
      console.warn('Error initializing calendar month:', error);
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }
  });

  const colores = {
    blue: {
      primary: 'bg-blue-500',
      primaryHover: 'hover:bg-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      selected: 'bg-blue-500 text-white shadow-lg shadow-blue-200',
      today: 'bg-blue-100 text-blue-700 font-semibold',
      hover: 'hover:bg-blue-50 hover:text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      primary: 'bg-green-500',
      primaryHover: 'hover:bg-green-600',
      light: 'bg-green-50',
      text: 'text-green-600',
      selected: 'bg-green-500 text-white shadow-lg shadow-green-200',
      today: 'bg-green-100 text-green-700 font-semibold',
      hover: 'hover:bg-green-50 hover:text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    orange: {
      primary: 'bg-orange-500',
      primaryHover: 'hover:bg-orange-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      selected: 'bg-orange-500 text-white shadow-lg shadow-orange-200',
      today: 'bg-orange-100 text-orange-700 font-semibold',
      hover: 'hover:bg-orange-50 hover:text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    }
  };

  const tema = colores[colorTema];

  // Efecto para validar el estado del calendario
  useEffect(() => {
    // Validar que mesActual sea una fecha válida
    setMesActual(current => {
      if (!current || isNaN(current.getTime())) {
        const hoy = new Date();
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      }
      return current;
    });
  }, []);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const obtenerDiasDelMes = () => {
    try {
      if (!mesActual || isNaN(mesActual.getTime())) {
        console.warn('Invalid mesActual, resetting to current date');
        setMesActual(new Date());
        return [];
      }

      const año = mesActual.getFullYear();
      const mes = mesActual.getMonth();
      
      // Validar año y mes
      if (año < 1900 || año > 2200 || mes < 0 || mes > 11) {
        console.warn('Invalid year or month, resetting calendar');
        setMesActual(new Date());
        return [];
      }
      
      const primerDia = new Date(año, mes, 1);
      const ultimoDia = new Date(año, mes + 1, 0);
      const diasEnMes = ultimoDia.getDate();
      const diaInicioSemana = primerDia.getDay();

      const dias = [];

      // Días del mes anterior
      for (let i = diaInicioSemana - 1; i >= 0; i--) {
        const fecha = new Date(año, mes, -i);
        if (!isNaN(fecha.getTime())) {
          dias.push({
            fecha: fecha,
            esDelMesActual: false,
            numero: fecha.getDate()
          });
        }
      }

      // Días del mes actual
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(año, mes, dia);
        if (!isNaN(fecha.getTime())) {
          dias.push({
            fecha: fecha,
            esDelMesActual: true,
            numero: dia
          });
        }
      }

      // Días del mes siguiente
      const diasRestantes = 42 - dias.length;
      for (let dia = 1; dia <= diasRestantes; dia++) {
        const fecha = new Date(año, mes + 1, dia);
        if (!isNaN(fecha.getTime())) {
          dias.push({
            fecha: fecha,
            esDelMesActual: false,
            numero: fecha.getDate()
          });
        }
      }

      return dias;
    } catch (error) {
      console.error('Error in obtenerDiasDelMes:', error);
      // Resetear a fecha actual en caso de error
      setMesActual(new Date());
      return [];
    }
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
    if (!fechaSeleccionada || !fecha || isNaN(fecha.getTime())) return false;
    
    try {
      // Parsear la fecha seleccionada (que puede estar en formato DD/MM/AAAA)
      const fechaParsed = parsearFechaDDMMAAAA(fechaSeleccionada);
      if (!fechaParsed || isNaN(fechaParsed.getTime())) return false;
      
      const fechaISOActual = fechaAISO(fecha);
      const fechaISOSeleccionada = fechaAISO(fechaParsed);
      
      return fechaISOActual && fechaISOSeleccionada && fechaISOActual === fechaISOSeleccionada;
    } catch (error) {
      console.warn('Error comparing dates:', { fecha, fechaSeleccionada, error });
      return false;
    }
  };

  const esHoy = (fecha: Date) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  // Función para obtener el día de la semana en español y mayúsculas
  const obtenerDiaSemana = (fecha: Date): string => {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[fecha.getDay()];
  };

  // Función para verificar si un día de la semana está disponible
  const esDiaDisponible = (fecha: Date): boolean => {
    if (!diasDisponibles || diasDisponibles.length === 0) return true;
    
    const diaSemana = obtenerDiaSemana(fecha);
    return diasDisponibles.includes(diaSemana);
  };

  const esFechaDeshabilitada = (fecha: Date) => {
    try {
      if (!fecha || isNaN(fecha.getTime())) return true;
      
      // Primero verificar si el día de la semana está disponible
      if (!esDiaDisponible(fecha)) return true;
      
      const fechaStr = fechaAISO(fecha);
      if (!fechaStr) return true;
      
      // Convertir fechas mínima y máxima a ISO si están en formato DD/MM/AAAA
      let fechaMinimaISO = fechaMinima;
      let fechaMaximaISO = fechaMaxima;
      
      if (fechaMinima && fechaMinima.includes('/')) {
        const fechaParsed = parsearFechaDDMMAAAA(fechaMinima);
        fechaMinimaISO = fechaParsed ? fechaAISO(fechaParsed) : fechaMinima;
      }
      
      if (fechaMaxima && fechaMaxima.includes('/')) {
        const fechaParsed = parsearFechaDDMMAAAA(fechaMaxima);
        fechaMaximaISO = fechaParsed ? fechaAISO(fechaParsed) : fechaMaxima;
      }
      
      if (fechaMinimaISO && fechaStr < fechaMinimaISO) return true;
      if (fechaMaximaISO && fechaStr > fechaMaximaISO) return true;
      
      return false;
    } catch (error) {
      console.warn('Error checking if date is disabled:', fecha, error);
      return true; // Si hay error, mejor deshabilitar la fecha
    }
  };

  const formatearFecha = (fecha: Date): string => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  // Helper para convertir Date a formato ISO (para comparaciones)
  const fechaAISO = (fecha: Date): string => {
    try {
      if (!fecha || isNaN(fecha.getTime())) {
        console.warn('Invalid date passed to fechaAISO:', fecha);
        return '';
      }
      return fecha.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error converting date to ISO:', fecha, error);
      return '';
    }
  };

  const manejarClickFecha = (fecha: Date) => {
    if (esFechaDeshabilitada(fecha)) return;
    
    const fechaStr = formatearFecha(fecha);
    onFechaSeleccionada(fechaStr);
    onCerrar();
  };

  const manejarClickFondo = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCerrar();
    }
  };
  const dias = obtenerDiasDelMes();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={manejarClickFondo}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`bg-gradient-to-r ${tema.gradient} p-4 text-white relative`}>
          <button
            onClick={onCerrar}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{titulo}</h3>
              <p className="text-xs opacity-90">
                {fechaSeleccionada 
                  ? new Date(fechaSeleccionada).toLocaleDateString('es-ES', { 
                      day: 'numeric' 
                    })
                  : 'Ninguna fecha seleccionada'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navegarMes('anterior')}
              className={`p-2 rounded-lg ${tema.light} ${tema.text} ${tema.primaryHover} transition-all duration-200 hover:scale-105`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="text-center">
              <h4 className="text-base font-bold text-gray-900">
                {meses[mesActual.getMonth()]}
              </h4>
              <p className="text-xs text-gray-500">
                {mesActual.getFullYear()}
              </p>
            </div>
            
            <button
              onClick={() => navegarMes('siguiente')}
              className={`p-2 rounded-lg ${tema.light} ${tema.text} ${tema.primaryHover} transition-all duration-200 hover:scale-105`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center py-2">
                <span className={`text-xs font-bold ${tema.text}`}>{dia}</span>
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia, index) => {
              const esSeleccionada = esFechaSeleccionada(dia.fecha);
              const esHoyDia = esHoy(dia.fecha);
              const estaDeshabilitada = esFechaDeshabilitada(dia.fecha);
              
              // Validar que dia.numero sea un número válido
              const numeroValido = typeof dia.numero === 'number' && !isNaN(dia.numero) ? dia.numero : '?';
              
              return (
                <button
                  key={index}
                  onClick={() => manejarClickFecha(dia.fecha)}
                  disabled={estaDeshabilitada}
                  className={`
                    h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200 relative
                    ${dia.esDelMesActual ? 'text-gray-900' : 'text-gray-400'}
                    ${esSeleccionada ? tema.selected : ''}
                    ${esHoyDia && !esSeleccionada ? tema.today : ''}
                    ${!esSeleccionada && !esHoyDia && !estaDeshabilitada && dia.esDelMesActual ? `${tema.hover} hover:scale-110` : ''}
                    ${estaDeshabilitada ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    ${!dia.esDelMesActual ? 'opacity-40' : ''}
                  `}
                >
                  {numeroValido}
                  
                  {/* Indicador para hoy */}
                  {esHoyDia && !esSeleccionada && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className={`w-1 h-1 rounded-full ${tema.primary}`}></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={onCerrar}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                const hoy = formatearFecha(new Date());
                onFechaSeleccionada(hoy);
                onCerrar();
              }}
              className={`flex-1 px-3 py-2 ${tema.primary} text-white rounded-lg ${tema.primaryHover} transition-colors font-medium text-sm`}
            >
              Hoy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioModerno;