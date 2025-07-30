import React, { useState } from 'react';
import { Shield, Home, Clock, Star, Award, CheckCircle, Calendar } from 'lucide-react';
import { caregiverServices } from '../data/mockData';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import TarjetaCuidador from './cuidadores/TarjetaCuidador';
import CalendarioModerno from './comun/CalendarioModerno';

interface PaginaCuidadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const PaginaCuidadores: React.FC<PaginaCuidadoresProps> = ({ userType }) => {
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false);
  const [locationFilter, setLocationFilter] = useState('all');

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookCaregiver = (caregiver: any) => {
    setSelectedCaregiver(caregiver);
    setIsBookingOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Check if caregiver is available on selected date
  const isAvailableOnDateRange = (caregiver: any, startDate: string, endDate: string) => {
    if (!startDate && !endDate) return true;
    
    // Si solo hay fecha de inicio, verificar ese día
    if (startDate && !endDate) {
      const date = new Date(startDate);
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const dayName = dayNames[date.getDay()];
      return caregiver.availability.some((period: string) => 
        period.includes(dayName) || period.includes('Lunes a Domingo') || period.includes('Lunes a Viernes')
      );
    }
    
    // Para rangos de fechas, verificar disponibilidad general
    return caregiver.availability.some((period: string) => 
      period.includes('Lunes a Domingo') || 
      (period.includes('Lunes a Viernes') && !isWeekendRange(startDate, endDate))
    );
  };

  const isWeekendRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Verificar si el rango incluye solo fines de semana
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No es domingo (0) ni sábado (6)
        return false;
      }
    }
    return true;
  };

  // Filter caregivers based on search and filters
  const filteredCaregivers = caregiverServices.filter(caregiver => {
    const matchesSearch = caregiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caregiver.services.some(service => 
                           service.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesPrice = (!minPrice && !maxPrice) ||
                        (() => {
                          const price = caregiver.pricePerDay;
                          const min = minPrice ? parseInt(minPrice) : 0;
                          const max = maxPrice ? parseInt(maxPrice) : Infinity;
                          return price >= min && price <= max;
                        })();
    
    const matchesExperience = experienceFilter === 'all' ||
                             (experienceFilter === 'junior' && caregiver.experience <= 3) ||
                             (experienceFilter === 'mid' && caregiver.experience > 3 && caregiver.experience <= 6) ||
                             (experienceFilter === 'senior' && caregiver.experience > 6);
    
    const matchesDate = isAvailableOnDateRange(caregiver, fechaInicio, fechaFin);
    
    return matchesSearch && matchesPrice && matchesExperience && matchesDate;
  });

  const today = new Date().toISOString().split('T')[0];
  return (
    <>
      <div className="py-8 bg-orange-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <EncabezadoPagina
          icono={Shield}
          titulo="Cuidadores Especializados"
          descripcion="Encuentra el cuidador perfecto para tu mascota. Servicio de cuidado por días con atención integral y amorosa cuando no puedes estar presente."
          colorFondo="bg-orange-100"
          colorIcono="text-orange-600"
        />

        {/* Filters */}
        <Filtros
          busqueda={searchTerm}
          alCambiarBusqueda={setSearchTerm}
          placeholderBusqueda="Buscar cuidador..."
          colorTema="orange"
          filtrosAdicionales={
            <>
            {/* Min Price */}
            <input
              type="number"
              placeholder="Precio mín/día"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Precio máx/día"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />

            {/* Experience Filter */}
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="dog">Perros</option>
              <option value="cat">Gatos</option>
              <option value="bird">Aves</option>
              <option value="other">Otros</option>
            </select>


            {/* Date Range Filter */}
            <div className="col-span-full md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Período de cuidado
              </label>
              <div className="flex items-end gap-3">
                {/* Fecha de inicio */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Fecha de inicio
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setMostrarCalendarioInicio(true)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left text-gray-500"
                    >
                      {fechaInicio 
                        ? new Date(fechaInicio).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })
                        : 'Seleccionar fecha'
                      }
                    </button>
                  </div>
                </div>

                {/* Fecha de fin */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Fecha de fin
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setMostrarCalendarioFin(true)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left text-gray-500"
                    >
                      {fechaFin 
                        ? new Date(fechaFin).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })
                        : 'Seleccionar fecha'
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              {fechaInicio && fechaFin && (
                <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-700">Duración del servicio:</span>
                    <span className="font-bold text-orange-800">
                      {Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1} días
                    </span>
                  </div>
                </div>
              )}
            </div>
            </>
          }
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredCaregivers.length} cuidador{filteredCaregivers.length !== 1 ? 'es' : ''} 
            {searchTerm && ` para "${searchTerm}"`}
            {fechaInicio && fechaFin && ` disponibles del ${new Date(fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${new Date(fechaFin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            {fechaInicio && !fechaFin && ` disponibles desde el ${new Date(fechaInicio).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>

        {/* Caregivers Grid */}
        {filteredCaregivers.length === 0 ? (
          <SinResultados />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredCaregivers.map((caregiver) => (
              <TarjetaCuidador
                key={caregiver.id}
                cuidador={caregiver}
                alContratar={handleBookCaregiver}
              />
            ))}
          </div>
        )}

        {/* Why Choose Our Caregivers */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 md:p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Por qué elegir nuestros cuidadores?
            </h3>
            <p className="text-orange-100 text-lg">
              Tranquilidad total para ti y tu mascota
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Certificados</h4>
              <p className="text-orange-100 text-sm">Formación especializada en cuidado animal</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Ambiente Familiar</h4>
              <p className="text-orange-100 text-sm">Cuidado en un entorno hogareño</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Atención 24/7</h4>
              <p className="text-orange-100 text-sm">Cuidado continuo y supervisión</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Totalmente Asegurado</h4>
              <p className="text-orange-100 text-sm">Cobertura completa de responsabilidad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ModalReserva
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedCaregiver}
        serviceType="caregiver"
       userType={userType}
      />
      </div>

      {/* Calendarios */}
      {mostrarCalendarioInicio && (
        <CalendarioModerno
          fechaSeleccionada={fechaInicio}
          onFechaSeleccionada={(fecha) => {
            setFechaInicio(fecha);
            setMostrarCalendarioInicio(false);
          }}
          onCerrar={() => setMostrarCalendarioInicio(false)}
          fechaMinima={today}
          colorTema="orange"
          titulo="Fecha de inicio del cuidado"
        />
      )}
      
      {mostrarCalendarioFin && (
        <CalendarioModerno
          fechaSeleccionada={fechaFin}
          onFechaSeleccionada={(fecha) => {
            setFechaFin(fecha);
            setMostrarCalendarioFin(false);
          }}
          onCerrar={() => setMostrarCalendarioFin(false)}
          fechaMinima={fechaInicio || today}
          colorTema="orange"
          titulo="Fecha de fin del cuidado"
        />
      )}
    </>
  );
};


export default PaginaCuidadores