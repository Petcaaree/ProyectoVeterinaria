import { useState, useEffect, useCallback } from 'react';
import { getTodasReservas, getReservasPorEstado } from '../api/api';
import { useAuth } from '../context/authContext';

export type FilterType = 'TODAS' | 'PENDIENTE_PAGO' | 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Appointment { [key: string]: any; }

interface Totales {
  todas: number;
  pendientesPago: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
}

export const useReservas = () => {
  const [filter, setFilter] = useState<FilterType>('TODAS');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totales, setTotales] = useState<Totales>({
    todas: 0, pendientesPago: 0, pendientes: 0, confirmadas: 0, completadas: 0, canceladas: 0
  });

  const { usuario, tipoUsuario } = useAuth();
  const userId = usuario?.id;

  const cargarTotales = useCallback(async () => {
    if (!userId || !tipoUsuario) return;
    try {
      const [todasData, pendientesPagoData, pendientesData, confirmadasData, completadasData, canceladasData] = await Promise.all([
        getTodasReservas(userId, tipoUsuario, 'TODAS', 1),
        getReservasPorEstado(userId, tipoUsuario, 'PENDIENTE_PAGO', 1),
        getReservasPorEstado(userId, tipoUsuario, 'PENDIENTE', 1),
        getReservasPorEstado(userId, tipoUsuario, 'CONFIRMADA', 1),
        getReservasPorEstado(userId, tipoUsuario, 'COMPLETADA', 1),
        getReservasPorEstado(userId, tipoUsuario, 'CANCELADA', 1)
      ]);
      setTotales({
        todas: todasData.total || 0,
        pendientesPago: pendientesPagoData.total || 0,
        pendientes: pendientesData.total || 0,
        confirmadas: confirmadasData.total || 0,
        completadas: completadasData.total || 0,
        canceladas: canceladasData.total || 0,
      });
    } catch (error) {
      console.error('Error al cargar totales:', error);
    }
  }, [userId, tipoUsuario]);

  const fetchReservas = useCallback(async () => {
    if (!userId || !tipoUsuario) return;
    setIsLoading(true);
    try {
      const data = filter === 'TODAS'
        ? await getTodasReservas(userId, tipoUsuario, filter, page)
        : await getReservasPorEstado(userId, tipoUsuario, filter, page);
      setAppointments(data.data || []);
      setTotalPages(data.total_pages || 0);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, tipoUsuario, filter, page]);

  useEffect(() => {
    if (userId && tipoUsuario) cargarTotales();
  }, [userId, tipoUsuario, cargarTotales]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userId || !tipoUsuario) return;
      setIsLoading(true);
      try {
        const data = filter === 'TODAS'
          ? await getTodasReservas(userId, tipoUsuario, filter, page)
          : await getReservasPorEstado(userId, tipoUsuario, filter, page);
        if (!cancelled) {
          setAppointments(data.data || []);
          setTotalPages(data.total_pages || 0);
        }
      } catch {
        if (!cancelled) setAppointments([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId, tipoUsuario, filter, page]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    filter,
    appointments,
    page,
    totalPages,
    isLoading,
    setIsLoading,
    totales,
    tipoUsuario,
    userId,
    handleFilterChange,
    handlePrevious,
    handleNext,
    fetchReservas,
    cargarTotales,
  };
};
