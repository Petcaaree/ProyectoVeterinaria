import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Clock, Star, Award, Shield, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import TarjetaPaseador from './paseadores/TarjetaPaseador';
import CalendarioModerno from './comun/CalendarioModerno';
import { useAuth } from '../context/authContext.tsx';



interface PaginaPaseadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const PaginaPaseadores: React.FC<PaginaPaseadoresProps> = ({ userType }) => {
  const [selectedPaseador, setSelectedPaseador] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // filtros (mismo patrón que Cuidadores)
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [fechaPaseo, setFechaPaseo] = useState(''); // una sola fecha para paseos
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [locationFilter, setLocationFilter] = useState('all');


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

  useEffect(() => {
        console.log('🔄 Estado completo de filtros cambió:', filtros);

    cargarServicios();
  }, [page, filtros]);

  // Efecto para monitorear cambios en filtros (sin enviar al API aún)
 

  const locations = [...new Set(walkServices.map(paseador => 
    paseador?.direccion?.localidad?.ciudad?.nombre || 'No especificado'
  ).filter(ciudad => ciudad !== 'No especificado'))];

  const cargarServicios = async () => {
    try {
      //console.log('Cargando servicios con filtros:', filtros);
      // Cargar servicios usando el método del contexto de autenticación
      const servicios = await getServiciosPaseadores(page, filtros);
      console.log('Datos de paseadores recibidos:', servicios);
     
      
      // Verificar si servicios es un array directamente o un objeto con propiedades
      
        setWalkServices(servicios.data);  
        setTotalPages(servicios?.total_pages || 1);
      
    } catch (error) {
      console.error('Error al cargar servicios de paseadores:', error);
      setWalkServices([]);
      setTotalPages(1);
    }
  };

  // helpers UI
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

  

  const handleBookPaseador = (paseador: any) => {
    setSelectedPaseador(paseador);
    setIsBookingOpen(true);
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
          alCambiarBusqueda={(v: string) => { 
            console.log('🔍 Filtro búsqueda cambiado a:', v);
            setSearchTerm(v); 
            setPage(1);
            setFiltros(prev => {
              const nuevosFiltros = { ...prev, nombreServicio: v };
              return nuevosFiltros;
            });
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
                onChange={(e) => { 
                  console.log('💰 Precio mínimo cambiado a:', e.target.value);
                  setMinPrice(e.target.value); 
                  setPage(1);
                  setFiltros(prev => {
                    const nuevosFiltros = { ...prev, precioMin: e.target.value };
                    return nuevosFiltros;
                  });
                }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />

              {/* Precio máx */}
              <input
                type="number"
                placeholder="Precio máx/hora"
                value={maxPrice}
                onChange={(e) => { 
                  console.log('💰 Precio máximo cambiado a:', e.target.value);
                  setMaxPrice(e.target.value); 
                  setPage(1);
                  setFiltros(prev => {
                    const nuevosFiltros = { ...prev, precioMax: e.target.value };
                    return nuevosFiltros;
                  });
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
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
                  return nuevosFiltros;
                });
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">Todas las zonas</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

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
                        : 'bg-green-600 text-white hover:bg-green-700 hover:scale-110 shadow-xl'
                    }`}
                    style={{ left: '-60px' }}
                  >
                    <ChevronLeft className="h-6 w-6 mx-auto" />
                  </button>
                )}

                {/* Grid de Tarjetas */}
                <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                  {walkServices.map((paseador, index) => (
                    <TarjetaPaseador
                      key={paseador._id || paseador.id || index}
                      paseador={paseador}
                      alContratar={() => handleBookPaseador(paseador)}
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
                        : 'bg-green-600 text-white hover:bg-green-700 hover:scale-110 shadow-xl'
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
                            ? 'bg-green-600 scale-125'
                            : 'bg-gray-300 hover:bg-green-300'
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
      />

      {/* Calendario */}
      {mostrarCalendario && (
        <CalendarioModerno
          fechaSeleccionada={fechaPaseo}
          onFechaSeleccionada={(fecha) => {
            console.log('📅 Fecha seleccionada:', fecha);
            setFechaPaseo(fecha);
            setMostrarCalendario(false);
            setPage(1);
            setFiltros(prev => {
              const nuevosFiltros = { ...prev, fecha: fecha };
              return nuevosFiltros;
            });
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
