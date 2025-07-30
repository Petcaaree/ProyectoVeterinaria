import CrearServicio from './components/servicios/CrearServicio';
import MisTurnos from './components/turnos/MisTurnos';
import Notificaciones from './components/notificaciones/Notificaciones';
import MisMascotas from './components/mascotas/MisMascotas';
import RegistrarMascota from './components/mascotas/RegistrarMascota';
import ModalAutenticacion from './components/autenticacion/ModalAutenticacion';

function App() {
  const [currentService, setCurrentService] = useState<'overview' | 'veterinary' | 'walker' | 'caregiver'>('overview');
  const [currentView, setCurrentView] = useState<'home' | 'create-service' | 'appointments' | 'notifications' | 'my-pets' | 'register-pet'>('home');
  const [userType, setUserType] = useState<'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null>(null);
  const [estaModalAbierto, setEstaModalAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'registro'>('registro');

  const handleViewChange = (view: 'home' | 'create-service' | 'appointments' | 'notifications' | 'my-pets' | 'register-pet') => {
    setCurrentView(view);
  };

  const handleUserLogin = (userData: { nombre: string; tipo: 'owner' | 'veterinary' | 'walker' | 'caregiver' }) => {
    setUserType(userData.tipo);
    setEstaModalAbierto(false);
  };

  const handleUserLogout = () => {
    setUserType(null);
    setCurrentView('home');
  };

  const handleRegisterPetClick = () => {
    if (userType === 'cliente') {
      // Si ya está logueado como dueño, ir directamente a registrar mascota
      setCurrentView('register-pet');
    } else {
      // Si no está logueado o no es dueño, mostrar modal de autenticación
      setModoAuth('registro');
      setEstaModalAbierto(true);
    }
  };

  const handleAuthSuccess = (userData: { nombre: string; tipo: 'owner' | 'veterinary' | 'walker' | 'caregiver' }) => {
    setUserType(userData.tipo);
    setEstaModalAbierto(false);
    
    // Si se registró/logueó como dueño desde el botón de registrar mascota, ir a esa vista
    if (userData.tipo === 'owner') {
      setCurrentView('register-pet');
    }
  };

  const renderContent = () => {
    if (currentView === 'create-service') {
      return <CrearServicio userType={userType} onBack={() => setCurrentView('home')} />;
    }
    
    if (currentView === 'appointments') {
      return <MisTurnos userType={userType} onBack={() => setCurrentView('home')} />;
    }
    
    if (currentView === 'notifications') {
      return <Notificaciones userType={userType} onBack={() => setCurrentView('home')} />;
    }
    
    if (currentView === 'my-pets') {
      return <MisMascotas userType={userType} onBack={() => setCurrentView('home')} onRegisterPet={() => setCurrentView('register-pet')} />;
    }
    
    if (currentView === 'register-pet') {
      return <RegistrarMascota onBack={() => setCurrentView('home')} onSuccess={() => setCurrentView('my-pets')} />;
    }

    switch (currentService) {
      case 'veterinary':
        return <ServiciosVeterinarios />;
      case 'walker':
        return <ServiciosPaseadores />;
      case 'caregiver':
        return <ServiciosCuidadores />;
      default:
        return (
          <>
            <Heroe onRegisterPetClick={handleRegisterPetClick} />
            <Servicios />
            <ServiciosVeterinarios />
            <ServiciosPaseadores />
            <ServiciosCuidadores />
            <Testimonios />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BarraNavegacion 
        userType={userType}
        onViewChange={handleViewChange}
        onUserLogin={handleUserLogin}
        onUserLogout={handleUserLogout}
      />
      {renderContent()}
      <PiePagina />
      
      {/* Modal de Autenticación */}
      <ModalAutenticacion
        estaAbierto={estaModalAbierto}
        alCerrar={() => setEstaModalAbierto(false)}
        modo={modoAuth}
        alCambiarModo={setModoAuth}
        onLoginSuccess={handleAuthSuccess}
      />
    </div>
  );
}