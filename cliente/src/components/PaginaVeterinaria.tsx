import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Clock, Calendar, Star, MapPin, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import CalendarioModerno from './comun/CalendarioModerno';
import { useAuth } from '../context/authContext';

interface PaginaVeterinariaProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const PaginaVeterinaria: React.FC<PaginaVeterinariaProps> = ({ userType }) => {
  const { getServiciosVeterinarias } = useAuth();
  
  // Referencia para el scroll hacia las cards
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  // Variable para fecha actual
  const today = new Date().toISOString().split('T')[0];
  
  // Estados para la API
  const [veterinarias, setVeterinarias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Estados existentes  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  
  // Estados para filtro de fecha
  const [fechaConsulta, setFechaConsulta] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    terminoBusqueda: '',
    mascotasAceptadas: [] as string[],
    precioMin: '',
    precioMax: '',
    localidad: '',
    tipoServicio: '',
    fecha: ''
  });

  // Tipos de mascotas disponibles
  const petTypes = [
    { value: 'dog', label: 'Perros' },
    { value: 'cat', label: 'Gatos' },
    { value: 'bird', label: 'Aves' },
    { value: 'other', label: 'Otros' }
  ];

  // Función para agrupar servicios por veterinaria
  const agruparServiciosPorVeterinaria = (servicios: any[]) => {
    const veterinariasMap = new Map();
    
    servicios.forEach(servicio => {
      // Usar el nombreClinica como ID único de agrupación
      const clinicaId = servicio.nombreClinica;
      
      if (!clinicaId) return; // Skip si no hay nombreClinica
      
      if (!veterinariasMap.has(clinicaId)) {
        // Crear nueva veterinaria con los datos del servicio
        veterinariasMap.set(clinicaId, {
          _id: clinicaId,
          nombreUsuario: servicio.nombreClinica, // Usar nombreClinica como nombre principal
          email: servicio.usuarioProveedor?.email || servicio.emailClinica || '',
          telefono: servicio.telefonoClinica || '',
          direccion: servicio.direccion || {},
          servicios: []
        });
      }
      
      // Agregar servicio a la veterinaria
      const veterinaria = veterinariasMap.get(clinicaId);
      veterinaria.servicios.push({
        _id: servicio.id,
        nombre: servicio.nombreServicio,
        descripcion: servicio.descripcion,
        precio: servicio.precio,
        duracion: servicio.duracionMinutos,
        tipoServicio: servicio.tipoServicio,
        estado: servicio.estado,
        diasDisponibles: servicio.diasDisponibles,
        horariosDisponibles: servicio.horariosDisponibles,
        mascotasAceptadas: servicio.mascotasAceptadas,
        fechasNoDisponibles: servicio.fechasNoDisponibles, // ¡CAMPO FALTANTE!
        // Agregar otros campos que podrían ser necesarios
        emailClinica: servicio.emailClinica,
        telefonoClinica: servicio.telefonoClinica,
        nombreClinica: servicio.nombreClinica,
        cantidadReservas: servicio.cantidadReservas,
        fechaCreacion: servicio.fechaCreacion
      });
    });
    
    return Array.from(veterinariasMap.values());
  };

  
  // Función para cargar servicios veterinarios
  const cargarVeterinarias = async (pagina: number = 1, filtrosPersonalizados?: any) => {
    setLoading(true);
    try {
      const filtrosAUsar = filtrosPersonalizados || filtros;
      console.log('Filtros aplicados:', filtrosAUsar);
      const resultado = await getServiciosVeterinarias(pagina, filtrosAUsar);
      console.log('Servicios veterinarios cargados:', resultado);
      
      // Agrupar servicios por veterinaria
      const veterinariasAgrupadas = agruparServiciosPorVeterinaria(resultado.data || []);
      console.log('Veterinarias agrupadas:', veterinariasAgrupadas);
      
      setVeterinarias(veterinariasAgrupadas);
      setTotalPaginas(resultado.total_pages || 1);
      setPaginaActual(pagina);
    } catch (error) {
      console.error('Error al cargar servicios veterinarios:', error);
      setVeterinarias([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para hacer scroll hacia las cards
  const scrollToCards = () => {
    setTimeout(() => {
      if (cardsContainerRef.current) {
        cardsContainerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100); // Pequeño delay para asegurar que el contenido se haya renderizado
  };

  // Funciones de paginación
  const handlePreviousPage = async () => {
    if (paginaActual > 1) {
      await cargarVeterinarias(paginaActual - 1);
      scrollToCards(); // Scroll después de cargar
    }
  };

  const handleNextPage = async () => {
    if (paginaActual < totalPaginas) {
      await cargarVeterinarias(paginaActual + 1);
      scrollToCards(); // Scroll después de cargar
    }
  };

  const goToPage = async (page: number) => {
    await cargarVeterinarias(page);
    scrollToCards(); // Scroll después de cargar
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    // Mapeo de inglés a español para tipos de mascotas
    const mapeoTiposMascotas = {
      'dog': 'PERRO',
      'cat': 'GATO', 
      'bird': 'AVE',
      'other': 'OTROS'
    };

    const nuevosFiltros = {
      terminoBusqueda: searchTerm,
      mascotasAceptadas: selectedPetTypes.map(tipo => mapeoTiposMascotas[tipo as keyof typeof mapeoTiposMascotas] || tipo.toUpperCase()),
      precioMin: minPrice,
      precioMax: maxPrice,
      localidad: locationFilter === 'all' ? '' : locationFilter,  // Convertir 'all' a cadena vacía
      tipoServicio: serviceTypeFilter,
      fecha: fechaConsulta
    };
    
    console.log('Aplicando filtros:', nuevosFiltros);
    setFiltros(nuevosFiltros);
    // Pasar los nuevos filtros directamente para evitar el problema de estado asíncrono
    cargarVeterinarias(1, nuevosFiltros);
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      try {
        // Usar filtros vacíos para la carga inicial
        const filtrosIniciales = {
          terminoBusqueda: '',
          mascotasAceptadas: [],
          precioMin: '',
          precioMax: '',
          localidad: '',
          tipoServicio: '',
          fecha: ''
        };
        const resultado = await getServiciosVeterinarias(1, filtrosIniciales);
        const veterinariasAgrupadas = agruparServiciosPorVeterinaria(resultado.data || []);
        setVeterinarias(veterinariasAgrupadas);
        setTotalPaginas(resultado.total_pages || 1);
        setPaginaActual(1);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setVeterinarias([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatosIniciales();
  }, [getServiciosVeterinarias]);

  // Función para buscar con filtros
  const buscarConFiltros = () => {
    
    aplicarFiltros();
  };

  const handlePetTypeToggle = (petType: string) => {
    setSelectedPetTypes(prev => {
      if (prev.includes(petType)) {
        return prev.filter(type => type !== petType);
      } else {
        return [...prev, petType];
      }
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  // Función para manejar reserva exitosa
  const handleReservaExitosa = () => {
    // Recargar los datos de la página actual
    cargarVeterinarias(paginaActual);
    // Cerrar el modal
    setIsBookingOpen(false);
    setSelectedService(null);
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

  // Get unique locations and service types for filters from API data
  const locations = [...new Set(veterinarias.map(clinic => clinic.direccion?.localidad?.ciudad?.nombre || '').filter(Boolean))];
  const serviceTypes = [...new Set(veterinarias.flatMap(clinic => 
    clinic.servicios?.map((service: any) => service.tipoServicio) || []
  ))];

  // Use API data instead of mock data
  const filteredClinics = veterinarias;

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

            {/* Pet Types Filter - Multi-select */}
            <div className="col-span-full">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Tipos de mascotas
                </label>
                {selectedPetTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedPetTypes([])}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {petTypes.map(petType => (
                  <label
                    key={petType.value}
                    className={`flex items-center space-x-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedPetTypes.includes(petType.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPetTypes.includes(petType.value)}
                      onChange={() => handlePetTypeToggle(petType.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedPetTypes.includes(petType.value)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPetTypes.includes(petType.value) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{petType.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fecha de consulta - En toda la fila para mejor layout */}
            <div className="col-span-full">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Fecha de consulta
              </label>
              <div className="relative max-w-sm">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setMostrarCalendario(true)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left text-gray-500"
                >
                  {fechaConsulta 
                    ? fechaConsulta
                    : 'Seleccionar fecha'
                  }
                </button>
              </div>
            </div>

            </>
          }
          elementoFijo={
            /* Botón de búsqueda siempre visible */
            <div className="flex justify-center mt-4">
              <button
                onClick={buscarConFiltros}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🔍 Aplicar filtros
              </button>
            </div>
          }
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredClinics.length} clínica{filteredClinics.length !== 1 ? 's' : ''} 
            {searchTerm && ` para "${searchTerm}"`}
            {selectedPetTypes.length > 0 && ` para ${selectedPetTypes.map(type => petTypes.find(pt => pt.value === type)?.label).join(', ')}`}
            {fechaConsulta && ` disponibles el ${fechaConsulta}`}
          </p>
        </div>

        {/* Clinics */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredClinics.length === 0 ? (
          <SinResultados />
        ) : (
          <div className="relative">
            {/* Grid de Veterinarias */}
            <div ref={cardsContainerRef} className="w-full space-y-8">
              {filteredClinics.map((clinic: any, index: number) => (
              <div key={clinic._id || index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Clinic Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-2xl font-bold mb-2">{clinic.nombreUsuario || 'Veterinaria'}</h3>
                      <div className="flex items-center space-x-4 text-blue-100">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">
                            {clinic.direccion?.calle} {clinic.direccion?.altura}, {clinic.direccion?.localidad?.nombre}, {clinic.direccion?.localidad?.ciudad?.nombre}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{clinic.telefono || 'Sin teléfono'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {renderStars(4.5)} {/* Rating fijo por ahora */}
                      </div>
                      <span className="text-lg font-semibold">(4.5)</span>
                    </div>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="p-6 bg-gray-50">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinic.servicios?.map((servicio: any, serviceIndex: number) => (
                      <div
                        key={servicio._id || serviceIndex}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100"
                      >
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-lg font-bold text-gray-900 flex-1">
                              {servicio.nombre || servicio.tipoServicio}
                            </h4>
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold ml-2">
                              {formatPrice(servicio.precio || 0)}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4 flex-1">
                            {servicio.descripcion || 'Servicio veterinario profesional'}
                          </p>
                          
                          {/* Service Details */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{servicio.duracion || 30} min</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{servicio.horariosDisponibles?.length || 0} horarios</span>
                            </div>
                          </div>
                          
                          

                          {/* Available Days */}
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">
                              Días Disponibles:
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {(servicio.diasDisponibles || []).map((day: string, dayIndex: number) => (
                                <div
                                  key={dayIndex}
                                  className="px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 capitalize"
                                >
                                  {day.toLowerCase()}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Mascotas Aceptadas */}
                          {servicio.mascotasAceptadas && servicio.mascotasAceptadas.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                Mascotas Aceptadas:
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {servicio.mascotasAceptadas.map((mascota: string, mascotaIndex: number) => (
                                  <span
                                    key={mascotaIndex}
                                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                                  >
                                    {mascota.charAt(0).toUpperCase() + mascota.slice(1).toLowerCase()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleBookService(servicio)}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold transform hover:scale-105 mt-auto"
                          >
                            Reservar Cita
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {(!clinic.servicios || clinic.servicios.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      No hay servicios disponibles para esta veterinaria
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>

            {/* Navegación de páginas centrada */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                {/* Botón Anterior */}
                <button
                  onClick={handlePreviousPage}
                  disabled={paginaActual === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    paginaActual === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Anterior</span>
                </button>

                {/* Indicadores de páginas */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => {
                    let pageNumber;
                    if (totalPaginas <= 7) {
                      pageNumber = i + 1;
                    } else if (paginaActual <= 4) {
                      pageNumber = i + 1;
                    } else if (paginaActual >= totalPaginas - 3) {
                      pageNumber = totalPaginas - 6 + i;
                    } else {
                      pageNumber = paginaActual - 3 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-8 h-8 rounded-full transition-all duration-300 text-sm font-medium ${
                          paginaActual === pageNumber
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={handleNextPage}
                  disabled={paginaActual === totalPaginas}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    paginaActual === totalPaginas 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <span className="text-sm font-medium">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Información de páginas */}
            {totalPaginas > 1 && (
              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  Página <span className="font-semibold text-blue-600">{paginaActual}</span> de{' '}
                  <span className="font-semibold text-blue-600">{totalPaginas}</span>
                </p>
              </div>
            )}
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
        onReservaExitosa={handleReservaExitosa}
      />
      
      {/* Calendario */}
      {mostrarCalendario && (
        <CalendarioModerno
          fechaSeleccionada={fechaConsulta}
          onFechaSeleccionada={(fecha) => {
            console.log('📅 Fecha seleccionada:', fecha);
            setFechaConsulta(fecha);
            setMostrarCalendario(false);
          }}
          onCerrar={() => setMostrarCalendario(false)}
          fechaMinima={today}
          colorTema="blue"
          titulo="Seleccionar fecha de consulta"
        />
      )}
    </div>
  );
};


export default PaginaVeterinaria