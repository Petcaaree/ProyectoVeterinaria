import React, { useState } from 'react';
import { Heart, MapPin, Star, Clock, Award, Shield, Search, Filter, Calendar } from 'lucide-react';
import { walkerServices } from '../data/mockData';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import TarjetaPaseador from './paseadores/TarjetaPaseador';
import CalendarioModerno from './comun/CalendarioModerno';

interface PaginaPaseadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const PaginaPaseadores: React.FC<PaginaPaseadoresProps> = ({ userType }) => {
  const [selectedWalker, setSelectedWalker] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookWalker = (walker: any) => {
    setSelectedWalker(walker);
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

  // Get unique areas for location filter
  const areas = [...new Set(walkerServices.flatMap(walker => walker.areas))];

  // Check if walker is available on selected date
  const isAvailableOnDate = (walker: any, selectedDate: string) => {
    if (!selectedDate) return true;
    
    const date = new Date(selectedDate);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = dayNames[date.getDay()];
    
    return walker.availability.includes(dayName);
  };

  // Filter walkers based on search and filters
  const filteredWalkers = walkerServices.filter(walker => {
    const matchesSearch = walker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         walker.areas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPrice = (!minPrice && !maxPrice) ||
                        (() => {
                          const price = walker.pricePerHour;
                          const min = minPrice ? parseInt(minPrice) : 0;
                          const max = maxPrice ? parseInt(maxPrice) : Infinity;
                          return price >= min && price <= max;
                        })();
    
    const matchesLocation = locationFilter === 'all' || 
                           walker.areas.some(area => area.toLowerCase().includes(locationFilter.toLowerCase()));
    
    const matchesExperience = experienceFilter === 'all' ||
                             (experienceFilter === 'junior' && walker.experience <= 2) ||
                             (experienceFilter === 'mid' && walker.experience > 2 && walker.experience <= 4) ||
                             (experienceFilter === 'senior' && walker.experience > 4);
    
    const matchesDate = isAvailableOnDate(walker, dateFilter);
    
    return matchesSearch && matchesPrice && matchesLocation && matchesExperience && matchesDate;
  });

  return (
    <div className="py-8 bg-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <EncabezadoPagina
          icono={Heart}
          titulo="Paseadores Profesionales"
          descripcion="Encuentra el paseador perfecto para tu mascota. Servicio de paseos por horas con profesionales certificados y confiables."
          colorFondo="bg-green-100"
          colorIcono="text-green-600"
        />

        {/* Filters */}
        <Filtros
          busqueda={searchTerm}
          alCambiarBusqueda={setSearchTerm}
          placeholderBusqueda="Buscar paseador o zona..."
          colorTema="green"
          filtrosAdicionales={
            <>
            {/* Min Price */}
            <input
              type="number"
              placeholder="Precio mín/hora"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Precio máx/hora"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todas las zonas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>

            {/* Experience Filter */}
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="dog">Perros</option>
              <option value="cat">Gatos</option>
              <option value="bird">Aves</option>
              <option value="other">Otros</option>
            </select>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setMostrarCalendario(true)}
                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white text-left text-sm"
              >
                <span className={dateFilter ? 'text-gray-900' : 'text-gray-500'}>
                  {dateFilter 
                    ? new Date(dateFilter).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })
                    : 'Fecha del paseo'
                  }
                </span>
              </button>
            </div>
            </>
          }
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredWalkers.length} paseador{filteredWalkers.length !== 1 ? 'es' : ''} 
            {searchTerm && ` para "${searchTerm}"`}
            {dateFilter && ` disponibles el ${new Date(dateFilter).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>

        {/* Walkers Grid */}
        {filteredWalkers.length === 0 ? (
          <SinResultados />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredWalkers.map((walker) => (
              <TarjetaPaseador
                key={walker.id}
                paseador={walker}
                alContratar={handleBookWalker}
              />
            ))}
          </div>
        )}

        {/* Service Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              ¿Qué incluye nuestro servicio de paseos?
            </h3>
            <p className="text-gray-600 text-lg">
              Mucho más que un simple paseo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Seguridad Total</h4>
              <p className="text-gray-600 text-sm">GPS tracking y seguro incluido</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Reportes en Tiempo Real</h4>
              <p className="text-gray-600 text-sm">Fotos y actualizaciones del paseo</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ejercicio Personalizado</h4>
              <p className="text-gray-600 text-sm">Adaptado a la edad y raza</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Socialización</h4>
              <p className="text-gray-600 text-sm">Interacción con otras mascotas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ModalReserva
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedWalker}
        serviceType="walker"
        userType={userType}
      />
      
      {/* Calendario Modal */}
      {mostrarCalendario && (
        <CalendarioModerno
          fechaSeleccionada={dateFilter}
          onFechaSeleccionada={(fecha) => {
            setDateFilter(fecha);
            setMostrarCalendario(false);
          }}
          onCerrar={() => setMostrarCalendario(false)}
          fechaMinima={new Date().toISOString().split('T')[0]}
          colorTema="green"
          titulo="Seleccionar fecha del paseo"
        />
      )}
    </div>
  );
};

export default PaginaPaseadores;