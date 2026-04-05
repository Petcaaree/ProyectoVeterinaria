import React, { useState, useEffect } from 'react';
import { getMetricas } from '../../api/adminApi';
import { useAuth } from '../../context/authContext';
import AdminSidebar, { type AdminView } from './AdminSidebar';
import MetricCard from './MetricCard';
import AdminUsuarios from './AdminUsuarios';
import AdminServicios from './AdminServicios';
import AdminConfiguracion from './AdminConfiguracion';

interface Metricas {
  usuarios: {
    clientes: number;
    veterinarias: number;
    paseadores: number;
    cuidadores: number;
    total: number;
  };
  reservas: {
    PENDIENTE_PAGO: number;
    PENDIENTE: number;
    CONFIRMADA: number;
    CANCELADA: number;
    COMPLETADA: number;
    total: number;
  };
  ingresos: {
    aprobado: { total: number; count: number };
    pendiente: { total: number; count: number };
    totalRecaudado: number;
  };
  servicios: {
    veterinaria: { activos: number; inactivos: number };
    paseador: { activos: number; inactivos: number };
    cuidador: { activos: number; inactivos: number };
    totalActivos: number;
  };
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchMetricas();
    }
  }, [currentView]);

  const fetchMetricas = async () => {
    setLoading(true);
    try {
      const res = await getMetricas();
      setMetricas(res.data);
    } catch (err) {
      console.error('Error al cargar metricas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    if (!metricas) {
      return <div className="text-center py-20 text-gray-500">Error al cargar las metricas</div>;
    }

    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

        {/* Usuarios */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Usuarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Total Usuarios"
            value={metricas.usuarios.total}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            color="purple"
          />
          <MetricCard
            title="Clientes"
            value={metricas.usuarios.clientes}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            color="blue"
          />
          <MetricCard
            title="Veterinarias"
            value={metricas.usuarios.veterinarias}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            color="green"
          />
          <MetricCard
            title="Paseadores"
            value={metricas.usuarios.paseadores}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            color="yellow"
          />
          <MetricCard
            title="Cuidadores"
            value={metricas.usuarios.cuidadores}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            color="indigo"
          />
        </div>

        {/* Reservas */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reservas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <MetricCard title="Total" value={metricas.reservas.total} icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} color="purple" />
          <MetricCard title="Pendientes Pago" value={metricas.reservas.PENDIENTE_PAGO} icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="yellow" />
          <MetricCard title="Pendientes" value={metricas.reservas.PENDIENTE} icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="blue" />
          <MetricCard title="Confirmadas" value={metricas.reservas.CONFIRMADA} icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="green" />
          <MetricCard title="Completadas" value={metricas.reservas.COMPLETADA} icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="indigo" />
          <MetricCard title="Canceladas" value={metricas.reservas.CANCELADA} icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} color="red" />
        </div>

        {/* Ingresos */}
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ingresos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            title="Total Recaudado"
            value={formatCurrency(metricas.ingresos.totalRecaudado)}
            subtitle={`${metricas.ingresos.aprobado.count} pagos aprobados`}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="green"
          />
          <MetricCard
            title="Pagos Pendientes"
            value={formatCurrency(metricas.ingresos.pendiente.total)}
            subtitle={`${metricas.ingresos.pendiente.count} pagos`}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="yellow"
          />
          <MetricCard
            title="Servicios Activos"
            value={metricas.servicios.totalActivos}
            subtitle={`Vet: ${metricas.servicios.veterinaria.activos} | Pas: ${metricas.servicios.paseador.activos} | Cui: ${metricas.servicios.cuidador.activos}`}
            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            color="purple"
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'usuarios':
        return <AdminUsuarios />;
      case 'servicios':
        return <AdminServicios />;
      case 'configuracion':
        return <AdminConfiguracion />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
