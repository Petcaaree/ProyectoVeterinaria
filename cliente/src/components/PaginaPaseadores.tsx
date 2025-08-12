import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Clock, Star, Award, Shield, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import ModalReserva from './ModalReserva';
import EncabezadoPagina from './comun/EncabezadoPagina';
import Filtros from './comun/Filtros';
import SinResultados from './comun/SinResultados';
import TarjetaPaseador from './paseadores/TarjetaPaseador';
import CalendarioModerno from './comun/CalendarioModerno';
import { getServiciosPaseadores } from '../api/api.js'; 


/** ===== Tipos del back (DTO) ===== **/
type ServicioPaseadorDTO = {
  id: string;
  usuarioProveedor: { nombre: string; email: string };
  nombreServicio: string;
  direccion: {
    calle: string;
    altura: string | number;
    localidad?: { nombre: string; ciudad?: { nombre: string } };
  };
  precio: number;
  descripcion: string;
  duracionMinutos: number;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string;
  diasDisponibles: string[];
  horariosDisponibles: string[];
  fechasNoDisponibles?: Array<{ fecha: string | Date; horariosNoDisponibles?: string[] }>;
  estado: 'Activada' | 'Desactivada';
  fechaCreacion: string;
  cantidadReservas?: number;
};

type PageResponse<T> = {
  page: number;
  per_page: number;
  total?: number;
  totalServicios?: number;
  totalPaseadores?: number;
  total_pages: number;
  data: T[];
};

/** ===== Modelo que espera TarjetaPaseador (similar a tus mocks) ===== **/
type WalkerCardModel = {
  id: string;
  name: string;
  areas: string[];
  pricePerHour: number;
  description: string;
  availability: string[]; // ["Lunes","Martes"...]
  rating: number;         // placeholders para UI
  experience: number;     // placeholders para UI
  raw: ServicioPaseadorDTO;
};

interface PaginaPaseadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const dtoToCard = (dto: ServicioPaseadorDTO): WalkerCardModel => {
  const area = dto?.direccion?.localidad?.nombre ?? 'Sin localidad';
  return {
    id: dto.id,
    name: dto.usuarioProveedor?.nombre || dto.nombreServicio,
    areas: [area].filter(Boolean),
    pricePerHour: dto.precio,
    description: dto.descripcion,
    availability: dto.diasDisponibles ?? [],
    rating: 4.6,       // placeholders para no romper UI
    experience: 3,     // placeholders
    raw: dto,
  };
};

const PaginaPaseadores: React.FC<PaginaPaseadoresProps> = ({ userType }) => {
  const [selectedWalker, setSelectedWalker] = useState<WalkerCardModel | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // filtros (mismo patrón que Cuidadores)
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all'); // UI-only
  const [locationFilter, setLocationFilter] = useState('all');
  const [fechaPaseo, setFechaPaseo] = useState(''); // una sola fecha para paseos
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // datos
  const [walkServices, setWalkServices] = useState<WalkerCardModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  // carga desde back
  useEffect(() => {
    cargarServicios();
    // scroll arriba suave como en cuidadores
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, minPrice, maxPrice, locationFilter, fechaPaseo]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros = {
        nombre: searchTerm || undefined,                  // ver ajuste en repo: usar filtro.nombre
        localidad: locationFilter !== 'all' ? locationFilter : undefined,
        precioMin: minPrice || undefined,
        precioMax: maxPrice || undefined,
        fecha: fechaPaseo ? new Date(fechaPaseo).toLocaleDateString('es-AR') : undefined,
      };

      const resp = await getServiciosPaseadores(page, filtros);
      const data = (resp?.data ?? []).map(dtoToCard);

      setWalkServices(data);
      setTotalPages(resp?.total_pages ?? 1);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  // helpers UI
  const formatPrice = (price: number) =>
    price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  const handleBookWalker = (walker: WalkerCardModel) => {
    setSelectedWalker(walker);
    setIsBookingOpen(true);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));

  // áreas únicas (para combo “Zonas” si lo agregás luego; ahora no hay select explícito en Filtros)
  const areas = useMemo(() => {
    const set = new Set<string>();
    walkServices.forEach(w => w.areas.forEach(a => a && set.add(a)));
    return Array.from(set);
  }, [walkServices]);

  // Filtro adicional en memoria para “experienceFilter” (UI only)
  const filteredWalkers = useMemo(() => {
    return walkServices.filter(w => {
      if (experienceFilter === 'junior' && w.experience > 2) return false;
      if (experienceFilter === 'mid' && (w.experience <= 2 || w.experience > 4)) return false;
      if (experienceFilter === 'senior' && w.experience <= 4) return false;
      return true;
    });
  }, [walkServices, experienceFilter]);

  // paginación like cuidadores
  const handlePreviousPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const goToPage = (pageNumber: number) => setPage(pageNumber);

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
          alCambiarBusqueda={(v: string) => { setSearchTerm(v); setPage(1); }}
          placeholderBusqueda="Buscar paseador o zona..."
          colorTema="green"
          filtrosAdicionales={
            <>
              {/* Precio mín */}
              <input
                type="number"
                placeholder="Precio mín/hora"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />

              {/* Precio máx */}
              <input
                type="number"
                placeholder="Precio máx/hora"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />

              {/* Tipo/“experiencia” (UI solo) */}
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>

              {/* Fecha del paseo */}
              <div className="col-span-full md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Fecha del paseo
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setMostrarCalendario(true)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm text-left text-gray-500"
                  >
                    {fechaPaseo 
                      ? new Date(fechaPaseo).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
              Mostrando {filteredWalkers.length} paseador{filteredWalkers.length !== 1 ? 'es' : ''} 
              {searchTerm && ` para "${searchTerm}"`}
              {fechaPaseo && ` disponibles el ${new Date(fechaPaseo).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            </p>
          )}
        </div>

        {/* grid */}
        {!loading && !error && (filteredWalkers.length === 0 ? (
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
                  {filteredWalkers.map((walker) => (
                    <TarjetaPaseador
                      key={walker.id}
                      paseador={walker}
                      alContratar={() => handleBookWalker(walker)}
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
        service={selectedWalker}
        serviceType="paseador"
        userType={userType}
      />

      {/* Calendario */}
      {mostrarCalendario && (
        <CalendarioModerno
          fechaSeleccionada={fechaPaseo}
          onFechaSeleccionada={(fecha) => {
            setFechaPaseo(fecha);
            setMostrarCalendario(false);
            setPage(1);
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
