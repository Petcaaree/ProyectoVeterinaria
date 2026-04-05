import React, { useState } from 'react';
import { ArrowLeft, Plus, Save, Stethoscope, Heart, Shield, User, X, Award } from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';
import { sortDays, sortTimes, normalizePetType, normalizeDay } from '../../utils/servicioUtils';
import VeterinariaForm from './VeterinariaForm';
import PaseadorForm from './PaseadorForm';
import CuidadorForm from './CuidadorForm';

type ViewType =
  | 'home'
  | 'create-service'
  | 'appointments'
  | 'notifications'
  | 'my-pets'
  | 'register-pet'
  | 'my-walks'
  | 'my-vet-services'
  | 'my-care-services';

interface CrearServicioProps {
  userType: string;
  onBack: () => void;
  setCurrentView: (view: ViewType) => void;
}

const CrearServicio: React.FC<CrearServicioProps> = ({ userType, onBack, setCurrentView }) => {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { usuario, createServicioVeterinario, createServicioPaseador, createServicioCuidador } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formDataVeterinaria, setFormDataVeterinaria] = useState({
    idVeterinaria: usuario?.id ?? '',
    nombreServicio: '',
    descripcion: '',
    precio: '',
    duracionMinutos: '',
    horariosDisponibles: [] as string[],
    diasDisponibles: [] as string[],
    mascotasAceptadas: [] as string[],
    nombreClinica: usuario?.nombreClinica || '',
    direccion: {
      calle: '',
      altura: '',
      localidad: { nombre: '', ciudad: { nombre: '' } }
    },
    telefonoClinica: '',
    emailClinica: '',
    tipoServicio: '',
  });

  const [formDataPaseador, setFormDataPaseador] = useState({
    idPaseador: usuario?.id ?? '',
    nombreServicio: '',
    maxPerros: 1 as number | string,
    descripcion: '',
    precio: '',
    duracionMinutos: '',
    horariosDisponibles: [] as string[],
    diasDisponibles: [] as string[],
    nombreContacto: usuario?.nombreUsuario || '',
    telefonoContacto: usuario?.telefono || '',
    emailContacto: usuario?.email || '',
    direccion: {
      calle: usuario?.direccion?.calle || '',
      altura: String(usuario?.direccion?.altura || ''),
      localidad: {
        nombre: usuario?.direccion?.localidad?.nombre || '',
        ciudad: { nombre: (typeof usuario?.direccion?.localidad?.ciudad === 'object' ? usuario?.direccion?.localidad?.ciudad?.nombre : usuario?.direccion?.localidad?.ciudad) || '' }
      }
    },
  });

  const [formDataCuidador, setFormDataCuidador] = useState({
    idCuidador: usuario?.id ?? '',
    nombreServicio: '',
    descripcion: '',
    precio: '',
    diasDisponibles: [] as string[],
    mascotasAceptadas: [] as string[],
    nombreContacto: '',
    telefonoContacto: '',
    emailContacto: '',
    direccion: {
      calle: usuario?.direccion?.calle || '',
      altura: String(usuario?.direccion?.altura || ''),
      localidad: {
        nombre: usuario?.direccion?.localidad?.nombre || '',
        ciudad: { nombre: (typeof usuario?.direccion?.localidad?.ciudad === 'object' ? usuario?.direccion?.localidad?.ciudad?.nombre : usuario?.direccion?.localidad?.ciudad) || '' }
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (userType === 'veterinaria') {
      setFormDataVeterinaria(prev => ({ ...prev, [name]: value }));
    } else if (userType === 'paseador') {
      setFormDataPaseador(prev => ({ ...prev, [name]: value }));
    } else if (userType === 'cuidador') {
      setFormDataCuidador(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDurationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if ((name === 'duracionMinutos') && (userType === 'veterinaria' || userType === 'paseador')) {
      let numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 30) numValue = 30;
      if (numValue > 120) numValue = 120;
      const rounded = Math.round(numValue / 30) * 30;
      const finalValue = [30, 60, 90, 120].includes(rounded) ? rounded : 30;
      if (userType === 'veterinaria') {
        setFormDataVeterinaria(prev => ({ ...prev, duracionMinutos: finalValue.toString() }));
      } else {
        setFormDataPaseador(prev => ({ ...prev, duracionMinutos: finalValue.toString() }));
      }
    }
  };

  const handleArrayChange = (field: string, value: string) => {
    const formatValue = (field: string, value: string) => {
      if (field === 'mascotasAceptadas') return normalizePetType(value);
      if (field === 'diasDisponibles') return normalizeDay(value);
      return value;
    };

    const updateArray = (arr: string[], formattedValue: string, field: string) => {
      let newArr = arr.includes(formattedValue)
        ? arr.filter(item => item !== formattedValue)
        : [...arr, formattedValue];
      if (field === 'diasDisponibles') newArr = sortDays(newArr);
      if (field === 'horariosDisponibles') newArr = sortTimes(newArr);
      return newArr;
    };

    const formattedValue = formatValue(field, value);
    if (userType === 'veterinaria') {
      setFormDataVeterinaria(prev => ({
        ...prev,
        [field]: updateArray(prev[field as keyof typeof prev] as string[], formattedValue, field)
      }));
    } else if (userType === 'paseador') {
      setFormDataPaseador(prev => ({
        ...prev,
        [field]: updateArray(prev[field as keyof typeof prev] as string[], formattedValue, field)
      }));
    } else if (userType === 'cuidador') {
      setFormDataCuidador(prev => ({
        ...prev,
        [field]: updateArray(prev[field as keyof typeof prev] as string[], formattedValue, field)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let dias: string[] | undefined, horarios: string[] | undefined, mascotas: string[] | undefined;
    if (userType === 'veterinaria') {
      dias = formDataVeterinaria.diasDisponibles;
      horarios = formDataVeterinaria.horariosDisponibles;
      mascotas = formDataVeterinaria.mascotasAceptadas;
    } else if (userType === 'paseador') {
      dias = formDataPaseador.diasDisponibles;
      horarios = formDataPaseador.horariosDisponibles;
    } else if (userType === 'cuidador') {
      dias = formDataCuidador.diasDisponibles;
      mascotas = formDataCuidador.mascotasAceptadas;
    }

    if (!dias || dias.length < 1) {
      setError('Debes seleccionar al menos un día disponible.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if ((userType === 'veterinaria' || userType === 'paseador') && (!horarios || horarios.length < 1)) {
      setError('Debes seleccionar al menos un horario disponible.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if ((userType === 'veterinaria' || userType === 'cuidador') && (!mascotas || mascotas.length < 1)) {
      setError('Debes seleccionar al menos una mascota aceptada.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    try {
      setLoading(true);
      setError('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (userType === 'veterinaria') await createServicioVeterinario(formDataVeterinaria as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else if (userType === 'paseador') await createServicioPaseador(formDataPaseador as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else if (userType === 'cuidador') await createServicioCuidador(formDataCuidador as any);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (userType === 'veterinaria') setCurrentView('my-vet-services');
        else if (userType === 'paseador') setCurrentView('my-walks');
        else if (userType === 'cuidador') setCurrentView('my-care-services');
        else setCurrentView('home');
      }, 2500);
    } catch (error) {
      console.error('Error al crear servicio:', error);
      let errorMsg = 'Error al crear el servicio';
      if (typeof error === 'object' && error !== null) {
        if ('response' in error && (error as { response?: { data?: { message?: string; error?: string } } }).response?.data?.message) {
          errorMsg = (error as { response: { data: { message: string } } }).response.data.message;
        } else if ('response' in error && (error as { response?: { data?: { error?: string } } }).response?.data?.error) {
          errorMsg = (error as { response: { data: { error: string } } }).response.data.error;
        } else if ('request' in error) {
          errorMsg = 'No se recibió respuesta del servidor';
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
      }
      setError(errorMsg);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getServiceConfig = () => {
    switch (userType) {
      case 'veterinaria': return { title: 'Crear Servicio Veterinario', icon: Stethoscope, color: 'blue', description: 'Agrega un nuevo servicio veterinario a tu clínica' };
      case 'paseador': return { title: 'Crear Servicio de Paseo', icon: Heart, color: 'green', description: 'Agrega un nuevo tipo de paseo que ofreces' };
      case 'cuidador': return { title: 'Crear Servicio de Cuidado', icon: Shield, color: 'orange', description: 'Agrega un nuevo servicio de cuidado de mascotas' };
      case 'cliente': return { title: 'Agregar Mascota', icon: User, color: 'purple', description: 'Registra una nueva mascota en tu perfil' };
      default: return { title: 'Crear Servicio', icon: Plus, color: 'gray', description: 'Agrega un nuevo servicio' };
    }
  };

  const config = getServiceConfig();
  const Icon = config.icon;

  if (userType === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors">
              <ArrowLeft className="h-5 w-5" /><span>Volver</span>
            </button>
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
              <p className="text-gray-600 mb-6">
                Como dueño de mascota, tu función es utilizar los servicios disponibles, no crearlos.
                Los servicios son creados por veterinarios, paseadores y cuidadores profesionales.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>¿Qué puedes hacer?</strong><br />
                  • Ver y reservar servicios veterinarios<br />
                  • Contratar paseadores profesionales<br />
                  • Encontrar cuidadores especializados<br />
                  • Gestionar tus mascotas registradas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'veterinaria' && !usuario?.nombreClinica) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors">
              <ArrowLeft className="h-5 w-5" /><span>Volver</span>
            </button>
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil Incompleto</h1>
              <p className="text-gray-600 mb-6">
                Para crear servicios veterinarios, necesitas completar el nombre de tu clínica en tu perfil de usuario.
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>¿Cómo completar tu perfil?</strong><br />
                  • Ve a tu perfil de usuario<br />
                  • Agrega el nombre de tu clínica veterinaria<br />
                  • Guarda los cambios y vuelve a intentar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-${config.color}-50 py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className={`flex items-center space-x-2 text-${config.color}-600 hover:text-${config.color}-700 mb-4 transition-colors`}>
            <ArrowLeft className="h-5 w-5" /><span>Volver</span>
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className={`bg-${config.color}-100 p-3 rounded-full`}>
                <Icon className={`h-8 w-8 text-${config.color}-600`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-gray-600">{config.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica (compartida) */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Servicio *</label>
                  <input
                    type="text"
                    name="nombreServicio"
                    value={userType === 'veterinaria' ? formDataVeterinaria.nombreServicio : userType === 'paseador' ? formDataPaseador.nombreServicio : formDataCuidador.nombreServicio}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                    placeholder={userType === 'veterinaria' ? 'Ej: Consulta General, Vacunación...' : userType === 'paseador' ? 'Ej: Paseo Básico, Paseo Premium...' : 'Ej: Cuidado Diurno, Cuidado 24/7...'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      name="precio"
                      value={userType === 'veterinaria' ? formDataVeterinaria.precio : userType === 'paseador' ? formDataPaseador.precio : formDataCuidador.precio}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                      placeholder={userType === 'paseador' ? 'Precio por hora' : userType === 'cuidador' ? 'Precio por día' : 'Precio del servicio'}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                <textarea
                  name="descripcion"
                  value={userType === 'veterinaria' ? formDataVeterinaria.descripcion : userType === 'paseador' ? formDataPaseador.descripcion : formDataCuidador.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                  placeholder="Describe detalladamente tu servicio..."
                  required
                />
              </div>
            </div>

            {/* Formularios específicos por tipo */}
            {userType === 'veterinaria' && (
              <VeterinariaForm
                formData={formDataVeterinaria}
                onInputChange={handleInputChange}
                onDurationBlur={handleDurationBlur}
                onArrayChange={handleArrayChange}
                onDireccionChange={(dir) => setFormDataVeterinaria(prev => ({ ...prev, direccion: dir }))}
                direccionUsuario={usuario?.direccion || ''}
              />
            )}

            {userType === 'paseador' && (
              <PaseadorForm
                formData={formDataPaseador}
                onInputChange={handleInputChange}
                onDurationBlur={handleDurationBlur}
                onArrayChange={handleArrayChange}
                onMaxPerrosChange={(val) => setFormDataPaseador(prev => ({ ...prev, maxPerros: val === '' ? '' : val }))}
                onMaxPerrosBlur={(val) => {
                  const num = parseInt(val);
                  setFormDataPaseador(prev => ({ ...prev, maxPerros: (!val || isNaN(num) || num < 1) ? 1 : num }));
                }}
              />
            )}

            {userType === 'cuidador' && (
              <CuidadorForm
                formData={formDataCuidador}
                onInputChange={handleInputChange}
                onArrayChange={handleArrayChange}
              />
            )}

            {/* Botones */}
            <div className="flex space-x-4">
              <button type="button" onClick={onBack} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" className={`flex-1 px-6 py-3 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors flex items-center justify-center space-x-2`}>
                <Save className="h-5 w-5" /><span>Crear Servicio</span>
              </button>
            </div>

            {showError && (
              <div className="mt-6 flex justify-center">
                <div className="bg-white border border-red-500 shadow-lg rounded-xl px-6 py-4 flex items-center space-x-3">
                  <X className="h-5 w-5 text-red-500 cursor-pointer" onClick={() => setShowError(false)} />
                  <span className="text-red-700 font-semibold text-base text-center">{error}</span>
                </div>
              </div>
            )}

            {showSuccess && (
              <div className="fixed inset-0 flex items-center justify-center z-[200] animate-fade-in-out">
                <div className="bg-green-600 text-white px-8 py-6 rounded-2xl shadow-lg text-lg font-semibold flex flex-col items-center">
                  <Award className="w-10 h-10 mb-2" />
                  ¡Servicio creado exitosamente!
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearServicio;
