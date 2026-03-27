import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Heart, Clock, Star, Award, Shield, Calendar, ChevronLeft, ChevronRight, Search, ChevronDown, CheckCircle } from 'lucide-react';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import TarjetaPaseador from './paseadores/TarjetaPaseador';
import CalendarioModerno from './comun/CalendarioModerno';
import { useAuth } from '../context/authContext.tsx';
import { getLocalidades } from '../api/api';



interface PaginaPaseadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const PaginaPaseadores: React.FC<PaginaPaseadoresProps> = ({ userType }) => {
  // Referencia para el scroll hacia las cards
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  const [selectedPaseador, setSelectedPaseador] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // filtros (mismo patrón que Cuidadores)
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [fechaPaseo, setFechaPaseo] = useState(''); // una sola fecha para paseos
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [localidades, setLocalidades] = useState<{ id: number; nombre: string; ciudad?: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<{ id: number; nombre: string; ciudad?: string }[]>([]);


  // paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // datos
  const [walkServices, setWalkServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const { usuario, getServiciosPaseadores } = useAuth();

  const [filtros, setFiltros] = useState({
    nombreServicio: '',
    precioMin: '',
    precioMax: '',
    localidad: '',
    fecha: '',
  });

  // Cargar localidades del backend al montar
  useEffect(() => {
    getLocalidades().then((data) => {
      if (Array.isArray(data)) {
        setLocalidades(data);
      } else if (data && Array.isArray(data.data)) {
        setLocalidades(data.data.map((l: any) => ({
          id: l.idLocalidad,
          nombre: l.localidad,
          ciudad: l.ciudad
        })));
      }
    });
  }, []);

  // Cerrar dropdown de localidades al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.localidad-dropdown-container')) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  useEffect(() => {
    // Solo cargar servicios cuando cambie la página
    // Si hay filtros activos, los aplicaremos desde aplicarFiltros
    const filtrosActuales = {
      nombreServicio: searchTerm,
      precioMin: minPrice,
      precioMax: maxPrice,
      localidad: locationFilter === 'all' ? '' : locationFilter,
      fecha: fechaPaseo
    };
    
    // Verificar si hay filtros activos
    const hayFiltrosActivos = Object.values(filtrosActuales).some(valor => valor !== '');
    
    if (hayFiltrosActivos) {
      // Si hay filtros activos, usar esos filtros
      cargarServicios(filtrosActuales);
    } else {
      // Si no hay filtros, cargar servicios normales
      cargarServicios();
    }
  }, [page]);

  // Efecto para cargar servicios al montar el componente
  useEffect(() => {
    cargarServicios();
  }, []);

  // Efecto para monitorear cambios en filtros (sin enviar al API aún)

  const cargarServicios = async (filtrosPersonalizados?: any) => {
    try {
      const filtrosAUsar = filtrosPersonalizados || filtros;
      // Cargar servicios usando el método del contexto de autenticación
      const servicios = await getServiciosPaseadores(page, filtrosAUsar);
      
      // Verificar si servicios es un array directamente o un objeto con propiedades
      if (Array.isArray(servicios)) {
        // Si es un array directamente (sin filtros)
        setWalkServices(servicios);
        setTotalPages(1);
      } else if (servicios && servicios.data) {
        // Si es un objeto con propiedades data y total_pages (con filtros)
        setWalkServices(servicios.data);  
        setTotalPages(servicios.total_pages || 1);
      } else {
        // Fallback
        setWalkServices([]);
        setTotalPages(1);
      }
      
    } catch (error) {
      console.error('Error al cargar servicios de paseadores:', error);
      setWalkServices([]);
      setTotalPages(1);
    }
  };

  // Función para aplicar filtros manualmente
  const aplicarFiltros = () => {
    const nuevosFiltros = {
      nombreServicio: searchTerm,
      precioMin: minPrice,
      precioMax: maxPrice,
      localidad: locationFilter === 'all' ? '' : locationFilter,
      fecha: fechaPaseo
    };
    
    setFiltros(nuevosFiltros);
    setPage(1);
    // Pasar los nuevos filtros directamente para evitar el problema de estado asíncrono
    cargarServicios(nuevosFiltros);
  };

  // Función para buscar con filtros
  const buscarConFiltros = () => {
    aplicarFiltros();
  };

  // Estado para controlar el scroll después de cargar datos
  const [shouldScrollToCards, setShouldScrollToCards] = useState(false);

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

  // useEffect para hacer scroll cuando se carguen nuevos datos
  useEffect(() => {
    if (shouldScrollToCards && walkServices.length > 0) {
      scrollToCards();
      setShouldScrollToCards(false);
    }
  }, [walkServices, shouldScrollToCards]);

  // helpers UI
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      setShouldScrollToCards(true); // Activar scroll después de cargar datos
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      setShouldScrollToCards(true); // Activar scroll después de cargar datos
    }
  };

  const goToPage = (pageNumber: number) => {
    setPage(pageNumber);
    setShouldScrollToCards(true); // Activar scroll después de cargar datos
  };

  

  const handleBookPaseador = (paseador: any) => {
    setSelectedPaseador(paseador);
    setIsBookingOpen(true);
  };

  const handleReservaExitosa = () => {
    cargarServicios();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="py-8 bg-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (tema verde como front) */}
        <EncabezadoPagina
          icono={Heart}
          titulo="Paseadores Profesionales"
          descripcion="Encuentra el paseador ideal por hora para tu mascota. Profesionales verificados, con disponibilidad y zonas claras."
          colorFondo="bg-green-100"
          colorIcono="text-green-600"
        />

        {/* Filtros (mismo bloque visual que cuidadores, adaptado a paseadores) */}
        <Filtros
          busqueda={searchTerm}
<<<<<<< HEAD
          alCambiarBusqueda={(v: string) => {
=======
          alCambiarBusqueda={(v: string) => { 
>>>>>>> 44b092f95aa3d55adc80a84ffdcd978f7e3c4251
            setSearchTerm(v);
          }}
          placeholderBusqueda="Buscar paseador o zona..."
          colorTema="green"
          filtrosAdicionales={
            <>
              {/* Precio mín */}
              <input
                type="number"
                placeholder="Precio mín/hora"
                value={minPrice}
<<<<<<< HEAD
                onChange={(e) => {
=======
                onChange={(e) => { 
>>>>>>> 44b092f95aa3d55adc80a84ffdcd978f7e3c4251
                  setMinPrice(e.target.value);
                }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />

              {/* Precio máx */}
              <input
                type="number"
                placeholder="Precio máx/hora"
                value={maxPrice}
<<<<<<< HEAD
                onChange={(e) => {
=======
                onChange={(e) => { 
>>>>>>> 44b092f95aa3d55adc80a84ffdcd978f7e3c4251
                  setMaxPrice(e.target.value);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />

              {/* Location Filter Autocomplete (usando localidades del backend) */}
            <div className="relative localidad-dropdown-container z-[9998]">
              <input
                type="text"
                value={locationFilter}
                onChange={e => {
                  const value = e.target.value;
                  setLocationFilter(value);
                  setShowSuggestions(true);
                  if (value.length === 0) {
                    setFilteredSuggestions([]);
                  } else {
                    setFilteredSuggestions(
                      localidades.filter(l => l.nombre.toLowerCase().includes(value.toLowerCase()))
                    );
                  }
                  setPage(1);
                  setFiltros(prev => ({ ...prev, localidad: value }));
                }}
                onFocus={() => {
                  if (localidades.length > 0) setShowSuggestions(true);
                }}
                placeholder="Buscar localidad..."
                className={`w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white ${filteredSuggestions.length > 0 && showSuggestions ? 'rounded-b-none' : ''}`}
                autoComplete="off"
              />
              {/* Icono de búsqueda y flecha */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
                {localidades.length > 0 && (
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                )}
              </div>
              {/* Dropdown de sugerencias */}
              {showSuggestions && (
                <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-200 rounded-b-xl shadow-lg max-h-60 overflow-y-auto animate-fade-in">
                  {/* Header de ayuda */}
                  {!locationFilter.trim() && (
                    <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                      <p className="text-sm font-medium text-green-800">
                        💡 Escribí para buscar localidades o elegí de la lista
                      </p>
                      <p className="text-xs text-green-600">
                        Hay {localidades.length} localidades disponibles
                      </p>
                    </div>
                  )}
                  {locationFilter.trim() && (
                    <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                      <p className="text-sm font-medium text-green-800">
                        🔍 Resultados para "{locationFilter}"
                      </p>
                      <p className="text-xs text-green-600">
                        {filteredSuggestions.length} localidad{filteredSuggestions.length !== 1 ? 'es' : ''} encontrada{filteredSuggestions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {/* Lista de sugerencias */}
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((l) => (
                      <div
                        key={l.id}
                        onMouseDown={() => {
                          setLocationFilter(l.nombre);
                          setFiltros(prev => ({ ...prev, localidad: l.nombre }));
                          setShowSuggestions(false);
                          setPage(1);
                        }}
                        className={`px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group ${locationFilter === l.nombre ? 'bg-green-100 font-semibold text-green-700' : ''}`}
                      >
                        <span className="font-medium">{l.nombre}</span>
                        {l.ciudad && (
                          <span className="block text-xs text-gray-500 mt-1">{l.ciudad}</span>
                        )}
                        {locationFilter === l.nombre && (
                          <CheckCircle className="inline ml-2 h-4 w-4 text-green-600 align-middle" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Search className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="text-sm text-yellow-700 font-medium">No se encontraron localidades</p>
                      <p className="text-xs text-yellow-600">Verificá que esté bien escrito o probá con otra ciudad</p>
                    </div>
                  )}
                </div>
              )}
            </div>

              {/* Fecha del paseo - En toda la fila para mejor layout */}
              <div className="col-span-full">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Fecha del paseo
                </label>
                <div className="relative max-w-sm">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setMostrarCalendario(true)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left text-gray-500"
                  >
                    {fechaPaseo 
                      ? fechaPaseo
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
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🔍 Aplicar filtros
              </button>
            </div>
          }
        />

        {/* contador + estados */}
        <div className="mb-6">
          {loading && <p className="text-gray-600">Cargando servicios…</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && (
            <p className="text-gray-600">
              Mostrando {walkServices.length} paseador{walkServices.length !== 1 ? 'es' : ''} 
              {searchTerm && ` para "${searchTerm}"`}
              {fechaPaseo && ` disponibles el ${fechaPaseo}`}
            </p>
          )}
        </div>

        {/* grid */}
        {!loading && !error && (walkServices.length === 0 ? (
          <SinResultados />
        ) : (
          <>
            {/* Carrusel de Paseadores */}
            <div className="relative mb-16">
              {/* Grid de Tarjetas */}
              <div ref={cardsContainerRef} className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                {walkServices.map((paseador, index) => (
                  <TarjetaPaseador
                    key={paseador._id || paseador.id || index}
                    paseador={paseador}
                    alContratar={() => handleBookPaseador(paseador)}
                  />
                ))}
              </div>

              {/* Navegación de páginas centrada */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-8">
                  {/* Botón Anterior */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      page === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Anterior</span>
                  </button>

                  {/* Indicadores de páginas */}
                  <div className="flex items-center space-x-2">
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
                          className={`w-8 h-8 rounded-full transition-all duration-300 text-sm font-medium ${
                            page === pageNumber
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-600'
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
                    disabled={page === totalPages}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      page === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <span className="text-sm font-medium">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Información de páginas */}
              {totalPages > 1 && (
                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm">
                    Página <span className="font-semibold text-green-600">{page}</span> de{' '}
                    <span className="font-semibold text-green-600">{totalPages}</span>
                  </p>
                </div>
              )}
            </div>
          </>
        ))}

        {/* banner features (verde, como tu estilo) */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Por qué elegir nuestros paseadores?
            </h3>
            <p className="text-green-100 text-lg">
              Seguridad y diversión en cada paseo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Seguro & GPS</h4>
              <p className="text-green-100 text-sm">Seguimiento y cobertura durante el paseo</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Reportes en Vivo</h4>
              <p className="text-green-100 text-sm">Fotos y actualizaciones en tiempo real</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Ejercicio a Medida</h4>
              <p className="text-green-100 text-sm">Rutinas según edad y energía</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Socialización</h4>
              <p className="text-green-100 text-sm">Convivencia y aprendizaje positivo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      <ModalReserva
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={selectedPaseador}
        serviceType="paseador"
        userType={userType}
        onReservaExitosa={handleReservaExitosa}
      />

      {/* Calendario */}
      {mostrarCalendario && (
        <CalendarioModerno
          fechaSeleccionada={fechaPaseo}
          onFechaSeleccionada={(fecha) => {
            setFechaPaseo(fecha);
            setMostrarCalendario(false);
          }}
          onCerrar={() => setMostrarCalendario(false)}
          fechaMinima={today}
          colorTema="green"
          titulo="Seleccionar fecha del paseo"
        />
      )}
    </div>
  );
};

export default PaginaPaseadores;
