import React, { useEffect, useState } from 'react';
import { Shield, Home, Clock, Star, Award, CheckCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
//import { cuidadorServices } from '../data/mockData';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import TarjetaCuidador from './cuidadores/TarjetaCuidador';
import CalendarioModerno from './comun/CalendarioModerno';
import { useAuth } from '../context/authContext.tsx';
import ServiciosCuidadores from './ServiciosCuidadores';


interface PaginaCuidadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const PaginaCuidadores: React.FC<PaginaCuidadoresProps> = ({ userType }) => {
  const [selectedCuidador, setSelectedCuidador] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);

  // Tipos de mascotas disponibles
  const petTypes = [
    { value: 'dog', label: 'Perros' },
    { value: 'cat', label: 'Gatos' },
    { value: 'bird', label: 'Aves' },
    { value: 'other', label: 'Otros' }
  ];

  // Función para manejar selección múltiple de tipos de mascotas
  const handlePetTypeToggle = (petType: string) => {
    setSelectedPetTypes(prev => {
      const newSelection = prev.includes(petType) 
        ? prev.filter(type => type !== petType)
        : [...prev, petType];
      
      // Actualizar filtros para backend
      setFiltros(prevFiltros => ({
        ...prevFiltros,
        mascotasAceptadas: newSelection
      }));
      
      setPage(1);
      return newSelection;
    });
  };

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false);
  const [locationFilter, setLocationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cuidadorServices, setCuidadorServicios] = useState<any[]>([]);

  const { usuario, getServiciosCuidadores } = useAuth();

  // Extraer ubicaciones únicas de los servicios de cuidadores
  const locations = [...new Set(cuidadorServices.map(cuidador => 
    cuidador?.direccion?.localidad?.ciudad?.nombre || 'No especificado'
  ).filter(ciudad => ciudad !== 'No especificado'))];

  // Helper para parsear fecha DD/MM/AAAA a Date object
  const parsearFecha = (fechaStr: string): Date | null => {
    if (!fechaStr || fechaStr.length === 0) return null;
    
    // Si ya es formato DD/MM/AAAA
    if (fechaStr.includes('/')) {
      const [dia, mes, año] = fechaStr.split('/');
      return new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    }
    
    // Si es formato ISO (YYYY-MM-DD) - para compatibilidad
    return new Date(fechaStr);
  };

  const [filtros, setFiltros] = useState({
    nombreServicio: '',
    precioMin: '',
    precioMax: '',
    mascotasAceptadas: [] as string[],
    fechaInicio: '',
    fechaFin: '',
    localidad: '',
  });

  // Función para aplicar filtros manualmente
  const aplicarFiltros = () => {
    // Mapeo de inglés a español para tipos de mascotas
    const mapeoTiposMascotas = {
      'dog': 'PERRO',
      'cat': 'GATO', 
      'bird': 'AVE',
      'other': 'OTROS'
    };

    const nuevosFiltros = {
      nombreServicio: searchTerm,
      precioMin: minPrice,
      precioMax: maxPrice,
      localidad: locationFilter === 'all' ? '' : locationFilter,
      mascotasAceptadas: selectedPetTypes.map(tipo => mapeoTiposMascotas[tipo as keyof typeof mapeoTiposMascotas] || tipo.toUpperCase()),
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };
    
    console.log('Aplicando filtros manualmente:', nuevosFiltros);
    setFiltros(nuevosFiltros);
    setPage(1);
    // Pasar los nuevos filtros directamente para evitar el problema de estado asíncrono
    cargarServicios(nuevosFiltros);
  };

  // Función para buscar con filtros
  const buscarConFiltros = () => {
    aplicarFiltros();
  };

  // Cargar servicios iniciales al montar el componente
  useEffect(() => {
    cargarServicios();
  }, [page]);

  // Efecto para actualizar filtros cuando cambien las fechas (solo actualiza estado, no busca)
  useEffect(() => {
    // Solo actualizamos el estado, no disparamos búsqueda automática
    console.log('📅 Fechas actualizadas - Inicio:', fechaInicio, 'Fin:', fechaFin);
  }, [fechaInicio, fechaFin]);

    const cargarServicios = async (filtrosPersonalizados?: any) => {
    // Simular carga de servicios
    const filtrosAUsar = filtrosPersonalizados || filtros;
    console.log('Cargando servicios con filtros:', filtrosAUsar);
    const servicios = await getServiciosCuidadores(page, filtrosAUsar);
    setCuidadorServicios(servicios.data);
    setTotalPages(servicios.total_pages); // Suponiendo 10 servicios por página
  };

  // Funciones para navegación de carrusel
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (pageNumber: number) => {
    setPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  

  const handleBookCuidador = (cuidador: any) => {
    setSelectedCuidador(cuidador);
    setIsBookingOpen(true);
  };

 

  // Check if cuidador is available on selected date
  

  

  

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

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => {
                console.log('📍 Localidad cambiada a:', e.target.value);
                setLocationFilter(e.target.value);
                setPage(1);
                setFiltros(prev => {
                  const nuevosFiltros = { ...prev, localidad: e.target.value === 'all' ? '' : e.target.value };
                  console.log('📋 Filtros actualizados:', nuevosFiltros);
                  return nuevosFiltros;
                });
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todas las zonas</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
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
                    onClick={() => {
                      setSelectedPetTypes([]);
                      setFiltros(prev => ({ ...prev, mascotasAceptadas: [] }));
                      setPage(1);
                    }}
                    className="text-xs text-orange-600 hover:text-orange-800 font-medium"
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
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-25'
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
                        ? 'border-orange-500 bg-orange-500'
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
                        ? fechaInicio
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
                        ? fechaFin
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
                      {(() => {
                        const fechaInicioDate = parsearFecha(fechaInicio);
                        const fechaFinDate = parsearFecha(fechaFin);
                        if (fechaInicioDate && fechaFinDate) {
                          return Math.ceil((fechaFinDate.getTime() - fechaInicioDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        }
                        return 0;
                      })()} días
                    </span>
                  </div>
                </div>
              )}
            </div>
            </>
          }
          elementoFijo={
            /* Botón de búsqueda siempre visible */
            <div className="flex justify-center mt-4">
              <button
                onClick={buscarConFiltros}
                className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🔍 Buscar Cuidadores
              </button>
            </div>
          }
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {cuidadorServices.length} cuidador{cuidadorServices.length !== 1 ? 'es' : ''} 
            {searchTerm && ` para "${searchTerm}"`}
            {selectedPetTypes.length > 0 && ` para ${selectedPetTypes.map(type => petTypes.find(pt => pt.value === type)?.label).join(', ')}`}
            {fechaInicio && fechaFin && ` disponibles del ${fechaInicio} al ${fechaFin}`}
            {fechaInicio && !fechaFin && ` disponibles desde el ${fechaInicio}`}
          </p>
        </div>

        {/* Cuidadors Grid */}
        {cuidadorServices.length === 0 ? (
          <SinResultados />
        ) : (
          <>
            {/* Carrusel de Cuidadores */}
            <div className="relative mb-16">
              {/* Contenedor del carrusel */}
              <div className="flex items-center">
                {/* Botón Anterior - Lado Izquierdo */}
                {totalPages > 1 && (
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
                      page === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-110 shadow-xl'
                    }`}
                    style={{ left: '-60px' }}
                  >
                    <ChevronLeft className="h-6 w-6 mx-auto" />
                  </button>
                )}

                {/* Grid de Tarjetas */}
                <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                  {cuidadorServices.map((cuidador) => (
                    <TarjetaCuidador
                      key={cuidador.id}
                      cuidador={cuidador}
                      alContratar={handleBookCuidador}
                    />
                  ))}
                </div>

                {/* Botón Siguiente - Lado Derecho */}
                {totalPages > 1 && (
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
                      page === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-110 shadow-xl'
                    }`}
                    style={{ right: '-60px' }}
                  >
                    <ChevronRight className="h-6 w-6 mx-auto" />
                  </button>
                )}
              </div>

              {/* Indicadores de páginas - Centrados debajo */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (page <= 4) {
                      pageNumber = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = page - 3 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          page === pageNumber
                            ? 'bg-orange-600 scale-125'
                            : 'bg-gray-300 hover:bg-orange-300'
                        }`}
                      />
                    );
                  })}
                </div>
              )}

              {/* Información de páginas */}
              {totalPages > 1 && (
                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    Página <span className="font-semibold text-orange-600">{page}</span> de{' '}
                    <span className="font-semibold text-orange-600">{totalPages}</span>
                    
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Why Choose Our Cuidadors */}
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
        service={selectedCuidador}
        serviceType="cuidador"
       userType={userType}
      />
      </div>

      {/* Calendarios */}
      {mostrarCalendarioInicio && (
        <CalendarioModerno
          fechaSeleccionada={fechaInicio}
          onFechaSeleccionada={(fecha) => {
            setFechaInicio(fecha);
            
            // Si hay una fecha fin seleccionada y la nueva fecha inicio es posterior, limpiar fecha fin
            if (fechaFin) {
              const fechaInicioDate = parsearFecha(fecha);
              const fechaFinDate = parsearFecha(fechaFin);
              
              if (fechaInicioDate && fechaFinDate && fechaInicioDate > fechaFinDate) {
                setFechaFin('');
              }
            }
            
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