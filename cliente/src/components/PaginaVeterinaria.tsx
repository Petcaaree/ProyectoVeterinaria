import React, { useState } from 'react';
import { Stethoscope, Clock, DollarSign, Calendar, Star, MapPin, Phone, Search, Filter } from 'lucide-react';
import { veterinaryClinics } from '../data/mockData';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import TarjetaClinica from './veterinarios/TarjetaClinica';

interface PaginaVeterinariaProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const PaginaVeterinaria: React.FC<PaginaVeterinariaProps> = ({ userType }) => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookService = (service: any, clinic: any) => {
    setSelectedService(service);
    setSelectedClinic(clinic);
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

  // Get unique locations and service types for filters
  const locations = [...new Set(veterinaryClinics.map(clinic => clinic.address.split(',')[1]?.trim()))];
  const serviceTypes = [...new Set(veterinaryClinics.flatMap(clinic => 
    clinic.services.map(service => service.name.split(' ')[0])
  ))];

  // Filter clinics based on search and filters
  const filteredClinics = veterinaryClinics.filter(clinic => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clinic.services.some(service => 
                           service.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesLocation = locationFilter === 'all' || 
                           clinic.address.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesServiceType = serviceTypeFilter === 'all' ||
                              clinic.services.some(service => 
                                service.name.toLowerCase().includes(serviceTypeFilter.toLowerCase())
                              );
    
    const matchesPrice = (!minPrice && !maxPrice) ||
                        clinic.services.some(service => {
                          const price = service.price;
                          const min = minPrice ? parseInt(minPrice) : 0;
                          const max = maxPrice ? parseInt(maxPrice) : Infinity;
                          return price >= min && price <= max;
                        });
    
    return matchesSearch && matchesLocation && matchesServiceType && matchesPrice;
  });

  // Generate all possible time slots for consistent layout
  const allTimeSlots = ['8:00', '9:00', '10:00', '10:30', '11:00', '14:00', '15:00', '15:30', '16:00', '17:00'];

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <EncabezadoPagina
          icono={Stethoscope}
          titulo="Clínicas Veterinarias"
          descripcion="Encuentra la mejor atención médica para tu mascota en nuestras clínicas veterinarias asociadas."
        />

        {/* Filters */}
        <Filtros
          busqueda={searchTerm}
          alCambiarBusqueda={setSearchTerm}
          placeholderBusqueda="Buscar clínica o servicio..."
          colorTema="blue"
          filtrosAdicionales={
            <>
            {/* Min Price */}
            <input
              type="number"
              placeholder="Precio mínimo"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Precio máximo"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todas las zonas</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Service Type Filter */}
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todos los servicios</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todas las zonas</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            </>
          }
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredClinics.length} clínica{filteredClinics.length !== 1 ? 's' : ''} 
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>

        {/* Clinics */}
        {filteredClinics.length === 0 ? (
          <SinResultados />
        ) : (
          <div className="space-y-8">
            {filteredClinics.map((clinic) => (
              <div key={clinic.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Clinic Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-2xl font-bold mb-2">{clinic.name}</h3>
                      <div className="flex items-center space-x-4 text-blue-100">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{clinic.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{clinic.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {renderStars(clinic.rating)}
                      </div>
                      <span className="text-lg font-semibold">({clinic.rating})</span>
                    </div>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="p-6 bg-gray-50">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinic.services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100"
                      >
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-lg font-bold text-gray-900 flex-1">
                              {service.name}
                            </h4>
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-2">
                              {formatPrice(service.price)}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4 flex-1">
                            {service.description}
                          </p>
                          
                          {/* Service Details */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{service.duration} min</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{service.availableHours.length} horarios</span>
                            </div>
                          </div>
                          
                          {/* Available Hours - Fixed Grid */}
                          <div className="mb-6">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">
                              Horarios Disponibles:
                            </h5>
                            <div className="grid grid-cols-3 gap-1 min-h-[80px]">
                              {allTimeSlots.slice(0, 9).map((hour, index) => {
                                const isAvailable = service.availableHours.includes(hour);
                                return (
                                  <div
                                    key={index}
                                    className={`px-2 py-1 rounded text-xs text-center font-medium ${
                                      isAvailable
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-gray-100 text-gray-400 opacity-50'
                                    }`}
                                  >
                                    {hour}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleBookService(service, clinic)}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold transform hover:scale-105 mt-auto"
                          >
                            Reservar Cita
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <ModalReserva
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedService}
        serviceType="veterinaria"
        userType={userType}
      />
    </div>
  );
};


export default PaginaVeterinaria