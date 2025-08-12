import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MapPin, Star, Clock, Award, Shield } from 'lucide-react';
import ModalReserva from './ModalReserva';

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

/** ===== Modelo que tu UI actual espera ===== **/
type WalkerCardModel = {
  id: string;
  name: string;
  areas: string[];
  pricePerHour: number;
  description: string;
  availability: string[];
  rating: number;
  experience: number;
  raw: ServicioPaseadorDTO;
};

interface ServiciosPaseadoresProps {
  userType?: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const API_URL = `${BASE_URL}/petcare`;

// Mapeo DTO -> modelo de tarjeta
const dtoToCard = (dto: ServicioPaseadorDTO): WalkerCardModel => {
  const area = dto?.direccion?.localidad?.nombre ?? 'Sin localidad';
  return {
    id: dto.id,
    name: dto.usuarioProveedor?.nombre || dto.nombreServicio,
    areas: [area].filter(Boolean),
    pricePerHour: dto.precio,
    description: dto.descripcion,
    availability: dto.diasDisponibles ?? [],
    rating: 4.6,
    experience: 3,
    raw: dto,
  };
};

const ServiciosPaseadores: React.FC<ServiciosPaseadoresProps> = ({ userType }) => {
  const [selectedWalker, setSelectedWalker] = useState<WalkerCardModel | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [walkers, setWalkers] = useState<WalkerCardModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const [page] = useState(1);
  const [limit] = useState(6);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${API_URL}/serviciosPaseadores?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = (await res.json()) as PageResponse<ServicioPaseadorDTO>;
        if (cancel) return;
        setWalkers((json.data ?? []).map(dtoToCard));
      } catch (e:any) {
        if (!cancel) setError(e.message ?? 'Error al cargar servicios');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [page, limit]);

  const handleBookWalker = (walker: WalkerCardModel) => {
    setSelectedWalker(walker);
    setIsBookingOpen(true);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));

  const areas = useMemo(() => {
    const set = new Set<string>();
    walkers.forEach(w => w.areas.forEach(a => a && set.add(a)));
    return Array.from(set);
  }, [walkers]);

  const formatPrice = (price: number) =>
    price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  return (
    <section id="paseadores" className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Paseadores Profesionales
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nuestros paseadores certificados se encargan de que tu mascota tenga 
            el ejercicio y diversión que necesita, con total seguridad y confianza. Servicio por horas.
          </p>
        </div>

        {/* Loading / Error */}
        {loading && <p className="text-gray-600 mb-6">Cargando servicios…</p>}
        {error && <p className="text-red-600 mb-6">Error: {error}</p>}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {walkers.map((walker) => (
              <div
                key={walker.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full"
              >
                {/* Header card */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {walker.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {renderStars(walker.rating)}
                      </div>
                      <span className="text-white text-sm">({walker.rating})</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Descripción */}
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Servicio de Paseos</h4>
                    <p className="text-gray-600 text-sm">
                      {walker.description}
                    </p>
                  </div>

                  {/* Precio y experiencia */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {formatPrice(walker.pricePerHour)}/hora
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>{walker.experience} años exp.</span>
                    </div>
                  </div>
                  
                  {/* Disponibilidad */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Disponibilidad:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {walker.availability.map((day, index) => (
                        <span
                          key={index}
                          className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Áreas */}
                  <div className="mb-6 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Zonas de servicio:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {walker.areas.map((area, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBookWalker(walker)}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duración-300 font-semibold transform hover:scale-105 mt-auto"
                  >
                    Contratar Paseador
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
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
        serviceType="paseador"
        userType={userType}
      />
    </section>
  );
};

export default ServiciosPaseadores;
