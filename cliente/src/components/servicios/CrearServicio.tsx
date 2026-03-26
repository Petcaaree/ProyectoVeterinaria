// Función robusta para formatear la dirección según las interfaces posibles

// ...existing imports...
import React, { useState } from 'react';
import Modal from 'react-modal';
import { ArrowLeft, Plus, Save, Stethoscope, Heart, Shield, MapPin, Clock, DollarSign, Calendar, User, Phone, Mail, Award, Home, X } from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';


interface CrearServicioProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' ;
  onBack: () => void;
}

function formatDireccion(direccion: any): string {
  if (!direccion) return '';
  if (typeof direccion === 'string') return direccion;
  // Si es objeto, buscar las propiedades correctas
  const calle = direccion.calle ?? '';
  const altura = direccion.altura ?? '';
  let localidad = '';
  let ciudad = '';
  // Localidad puede ser string u objeto
  if (direccion.localidad) {
    if (typeof direccion.localidad === 'object' && direccion.localidad !== null) {
      localidad = direccion.localidad.nombre ?? direccion.localidad.nombreLocalidad ?? '';
      // Ciudad puede estar dentro de localidad
      if (direccion.localidad.ciudad) {
        if (typeof direccion.localidad.ciudad === 'object' && direccion.localidad.ciudad !== null) {
          ciudad = direccion.localidad.ciudad.nombre ?? direccion.localidad.ciudad.nombreCiudad ?? '';
        } else {
          ciudad = direccion.localidad.ciudad;
        }
      }
    } else {
      localidad = direccion.localidad;
    }
  }
  // Ciudad puede estar directo en la dirección
  if (!ciudad && direccion.ciudad) {
    if (typeof direccion.ciudad === 'object' && direccion.ciudad !== null) {
      ciudad = direccion.ciudad.nombre ?? direccion.ciudad.nombreCiudad ?? '';
    } else {
      ciudad = direccion.ciudad;
    }
  }
  return [calle, altura, localidad, ciudad].filter(Boolean).join(', ');
}

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
    idVeterinaria: usuario?.id ,
    nombreServicio: '',
    descripcion: '',
    precio: '',
    duracionMinutos: '',
    horariosDisponibles: [] as string[],
    diasDisponibles: [] as string[],
    mascotasAceptadas: [] as string[],
    nombreClinica: usuario?.nombreClinica || '', // Usar nombreClinica del usuario
    direccion: {
      calle: '',
      altura: '',
      localidad: {
        nombre: '',
        ciudad: {
          nombre: ''
        }
      }
    },
    telefonoClinica: '',
    emailClinica: '',
    tipoServicio: '',
  });

  const [formDataPaseador, setFormDataPaseador] = useState({
    idPaseador: usuario?.id ,
    nombreServicio: '',
    maxPerros: 1,
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
      altura: usuario?.direccion?.altura || '',
      localidad: {
        nombre: usuario?.direccion?.localidad?.nombre || '',
        ciudad: {
          nombre: usuario?.direccion?.localidad?.ciudad || ''
        }
      }
    },
  });

  const [formDataCuidador, setFormDataCuidador] = useState({
    idCuidador: usuario?.id ,
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
      altura: usuario?.direccion?.altura || '',
      localidad: {
        nombre: usuario?.direccion?.localidad?.nombre || '',
        ciudad: {
          nombre: usuario?.direccion?.localidad?.ciudad || ''
        }
      }
    },
  });

  // ----------- Hooks y lógica de dirección/modal dentro del componente -----------
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const direccionUsuario = usuario?.direccion || '';
  const [nuevaDireccion, setNuevaDireccion] = useState({
    ciudad: '',
    localidad: '',
    calle: '',
    altura: ''
  });
  const [ciudades, setCiudades] = useState<{ id: string; nombre: string; provincia: string }[]>([]);
  const [ciudadInput, setCiudadInput] = useState('');
  const [showCiudadesDropdown, setShowCiudadesDropdown] = useState(false);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<{ id: string; nombre: string; provincia: string } | null>(null);
  const [localidades, setLocalidades] = useState<{ id: string; nombre: string }[]>([]);
  const [localidadInput, setLocalidadInput] = useState('');
  const [showLocalidadesDropdown, setShowLocalidadesDropdown] = useState(false);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState<{ id: string; nombre: string } | null>(null);

  React.useEffect(() => {
    console.log('direccionUsuario:', usuario?.direccion);
    Promise.all([
      fetch('https://apis.datos.gob.ar/georef/api/municipios?provincia=buenos%20aires&campos=id,nombre&max=500').then(r => r.json()),
      fetch('https://apis.datos.gob.ar/georef/api/municipios?provincia=ciudad%20autonoma%20de%20buenos%20aires&campos=id,nombre&max=100').then(r => r.json())
    ]).then(([ba, caba]) => {
      const municipiosBA = (ba.municipios || []).map((m) => ({ id: m.id, nombre: m.nombre, provincia: 'buenos aires' }));
      const municipiosCABA = [{ id: '02000', nombre: 'Ciudad Autónoma de Buenos Aires', provincia: 'caba' }];
      setCiudades([...municipiosBA, ...municipiosCABA]);
    });
  }, []);

  React.useEffect(() => {
    if (!ciudadSeleccionada) {
      setLocalidades([]);
      setLocalidadSeleccionada(null);
      setLocalidadInput('');
      return;
    }
    if (ciudadSeleccionada.provincia === 'caba' || ciudadSeleccionada.id === '02000') {
      const barriosCABA = [
        { id: '1', nombre: 'Agronomía' },
        { id: '2', nombre: 'Almagro' },
        { id: '3', nombre: 'Balvanera' },
        { id: '4', nombre: 'Barracas' },
        { id: '5', nombre: 'Belgrano' },
        { id: '6', nombre: 'Boedo' },
        { id: '7', nombre: 'Caballito' },
        { id: '8', nombre: 'Chacarita' },
        { id: '9', nombre: 'Coghlan' },
        { id: '10', nombre: 'Colegiales' },
        { id: '11', nombre: 'Constitución' },
        { id: '12', nombre: 'Flores' },
        { id: '13', nombre: 'Floresta' },
        { id: '14', nombre: 'La Boca' },
        { id: '15', nombre: 'La Paternal' },
        { id: '16', nombre: 'Liniers' },
        { id: '17', nombre: 'Mataderos' },
        { id: '18', nombre: 'Monte Castro' },
        { id: '19', nombre: 'Monserrat' },
        { id: '20', nombre: 'Nueva Pompeya' },
        { id: '21', nombre: 'Núñez' },
        { id: '22', nombre: 'Palermo' },
        { id: '23', nombre: 'Parque Avellaneda' },
        { id: '24', nombre: 'Parque Chacabuco' },
        { id: '25', nombre: 'Parque Chas' },
        { id: '26', nombre: 'Parque Patricios' },
        { id: '27', nombre: 'Puerto Madero' },
        { id: '28', nombre: 'Recoleta' },
        { id: '29', nombre: 'Retiro' },
        { id: '30', nombre: 'Saavedra' },
        { id: '31', nombre: 'San Cristóbal' },
        { id: '32', nombre: 'San Nicolás' },
        { id: '33', nombre: 'San Telmo' },
        { id: '34', nombre: 'Vélez Sarsfield' },
        { id: '35', nombre: 'Versalles' },
        { id: '36', nombre: 'Villa Crespo' },
        { id: '37', nombre: 'Villa del Parque' },
        { id: '38', nombre: 'Villa Devoto' },
        { id: '39', nombre: 'Villa General Mitre' },
        { id: '40', nombre: 'Villa Lugano' },
        { id: '41', nombre: 'Villa Luro' },
        { id: '42', nombre: 'Villa Ortúzar' },
        { id: '43', nombre: 'Villa Pueyrredón' },
        { id: '44', nombre: 'Villa Real' },
        { id: '45', nombre: 'Villa Riachuelo' },
        { id: '46', nombre: 'Villa Santa Rita' },
        { id: '47', nombre: 'Villa Soldati' },
        { id: '48', nombre: 'Villa Urquiza' }
      ];
      setLocalidades(barriosCABA);
    } else {
      fetch(`https://apis.datos.gob.ar/georef/api/localidades?municipio=${encodeURIComponent(ciudadSeleccionada.nombre)}&provincia=buenos%20aires&max=100`)
        .then(r => r.json())
        .then(data => {
          setLocalidades((data.localidades || []).map((l) => ({ id: l.id, nombre: l.nombre })));
        });
    }
    setLocalidadSeleccionada(null);
    setLocalidadInput('');
  }, [ciudadSeleccionada]);

  // Handler para guardar nueva dirección
  const handleGuardarDireccion = () => {
    // Guardar como objeto estructurado igual que en registro
    const direccionNueva = {
      calle: nuevaDireccion.calle,
      altura: nuevaDireccion.altura,
      localidad: {
        nombre: localidadSeleccionada ? localidadSeleccionada.nombre : (typeof nuevaDireccion.localidad === 'string' ? nuevaDireccion.localidad : ''),
        ciudad: {
          nombre: ciudadSeleccionada ? ciudadSeleccionada.nombre : (typeof nuevaDireccion.ciudad === 'string' ? nuevaDireccion.ciudad : '')
        }
      }
    };
    setFormDataVeterinaria(prev => {
      const nuevoForm = { ...prev, direccion: direccionNueva };
      console.log('Dirección agregada:', direccionNueva);
      // Mostrar el formDataVeterinaria actualizado
      setTimeout(() => {
        console.log('formDataVeterinaria actualizado:', nuevoForm);
      }, 0);
      return nuevoForm;
    });
    setShowDireccionModal(false);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (userType === 'veterinaria') {
      setFormDataVeterinaria(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (userType === 'paseador') {
      setFormDataPaseador(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (userType === 'cuidador') {
      setFormDataCuidador(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDurationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if ((name === 'duracionMinutos') && (userType === 'veterinaria' || userType === 'paseador')) {
      let numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 30) numValue = 30;
      if (numValue > 120) numValue = 120;
      // Redondear a múltiplos de 30
      const rounded = Math.round(numValue / 30) * 30;
      const finalValue = [30, 60, 90, 120].includes(rounded) ? rounded : 30;
      if (userType === 'veterinaria') {
        setFormDataVeterinaria(prev => ({
          ...prev,
          duracionMinutos: finalValue.toString()
          // No modificar horariosDisponibles, solo la duración
        }));
      } else if (userType === 'paseador') {
        setFormDataPaseador(prev => ({
          ...prev,
          duracionMinutos: finalValue.toString()
          // No modificar horariosDisponibles, solo la duración
        }));
      }
    }
  };


  // Función para ordenar días de la semana
  const sortDays = (days: string[]) => {
    const weekOrder = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    return days.slice().sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
  };

  // Función para ordenar horarios
  const sortTimes = (times: string[]) => {
    return times.slice().sort((a, b) => {
      const [ah, am] = a.split(':').map(Number);
      const [bh, bm] = b.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
  };

  const handleArrayChange = (field: string, value: string) => {
    // Mascotas aceptadas: guardar como PERRO, GATO, AVE, OTRO
    const formatValue = (field: string, value: string) => {
      if (field === 'mascotasAceptadas') {
        switch (value.toUpperCase()) {
          case 'PERROS':
            return 'PERRO';
          case 'GATOS':
            return 'GATO';
          case 'AVES':
            return 'AVE';
          case 'OTROS':
            return 'OTRO';
          default:
            return value.toUpperCase();
        }
      }
      if (field === 'diasDisponibles') {
        const dia = value.toUpperCase();
        if (dia === 'SÁBADO') return 'SABADO';
        if (dia === 'MIÉRCOLES') return 'MIERCOLES';
        return dia;
      }
      return value;
    };
    if (userType === 'veterinaria') {
      setFormDataVeterinaria(prev => {
        const arr = prev[field as keyof typeof prev] as string[];
        const formattedValue = formatValue(field, value);
        let newArr;
        if (arr.includes(formattedValue)) {
          // Si ya está, lo saco (deselección)
          newArr = arr.filter(item => item !== formattedValue);
        } else {
          // Si no está, lo agrego (selección)
          newArr = [...arr, formattedValue];
        }
        if (field === 'diasDisponibles') newArr = sortDays(newArr);
        if (field === 'horariosDisponibles') newArr = sortTimes(newArr);
        return { ...prev, [field]: newArr };
      });
    } else if (userType === 'paseador') {
      setFormDataPaseador(prev => {
        const arr = prev[field as keyof typeof prev] as string[];
        const formattedValue = formatValue(field, value);
        let newArr;
        if (arr.includes(formattedValue)) {
          newArr = arr.filter(item => item !== formattedValue);
        } else {
          newArr = [...arr, formattedValue];
        }
        if (field === 'diasDisponibles') newArr = sortDays(newArr);
        if (field === 'horariosDisponibles') newArr = sortTimes(newArr);
        return { ...prev, [field]: newArr };
      });
    } else if (userType === 'cuidador') {
      setFormDataCuidador(prev => {
        const arr = prev[field as keyof typeof prev] as string[];
        const formattedValue = formatValue(field, value);
        let newArr;
        if (arr.includes(formattedValue)) {
          newArr = arr.filter(item => item !== formattedValue);
        } else {
          newArr = [...arr, formattedValue];
        }
        if (field === 'diasDisponibles') newArr = sortDays(newArr);
        return { ...prev, [field]: newArr };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let data;
    let dias, horarios, mascotas;
    if (userType === 'veterinaria') {
      data = formDataVeterinaria;
      dias = formDataVeterinaria.diasDisponibles;
      horarios = formDataVeterinaria.horariosDisponibles;
      mascotas = formDataVeterinaria.mascotasAceptadas;
    } else if (userType === 'paseador') {
      data = formDataPaseador;
      dias = formDataPaseador.diasDisponibles;
      horarios = formDataPaseador.horariosDisponibles;
      mascotas = undefined;
    } else if (userType === 'cuidador') {
      data = formDataCuidador;
      dias = formDataCuidador.diasDisponibles;
      horarios = undefined;
      mascotas = formDataCuidador.mascotasAceptadas;
    }
    // Validación mínima: al menos 1 día, 1 horario y 1 mascota (según tipo)
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
    console.log('Service created:', data);

    try {
      setLoading(true);
      setError('');
      if (userType === 'veterinaria') {
        await createServicioVeterinario(data);
      } else if (userType === 'paseador') {
        await createServicioPaseador(data);
        console.log('Crear servicio de paseador:', data);
      } else if (userType === 'cuidador') {
        await createServicioCuidador(data);
        console.log('Crear servicio de cuidador:', data);
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (userType === 'veterinaria') {
          setCurrentView('my-vet-services');
        } else if (userType === 'paseador') {
          setCurrentView('my-walks');
        } else if (userType === 'cuidador') {
          setCurrentView('my-care-services');
        } else {
          setCurrentView('home');
        }
      }, 2500);
    } catch (error) {
      console.error('Error al crear servicio:', error);
      let errorMsg = 'Error al crear el servicio';
      if (typeof error === 'object' && error !== null) {
        if ('response' in error && error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if ('response' in error && error.response?.data?.error) {
          errorMsg = error.response.data.error;
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

  // Generar horarios disponibles basados en la duración
  const generateTimeSlots = (duration: number) => {
    // Solo permitir duraciones 30, 60, 90, 120
    if (![30, 60, 90, 120].includes(duration)) return [];
    const slots = [];
    const startHour = 10; // 10:00 AM
    const endHour = 20; // 8:00 PM
    const totalMinutes = (endHour - startHour) * 60;
    for (let minutes = 0; minutes < totalMinutes; minutes += duration) {
      const hour = Math.floor(minutes / 60) + startHour;
      const minute = minutes % 60;
      if (hour < endHour) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const getServiceConfig = () => {
    switch (userType) {
      case 'veterinaria':
        return {
          title: 'Crear Servicio Veterinario',
          icon: Stethoscope,
          color: 'blue',
          description: 'Agrega un nuevo servicio veterinario a tu clínica'
        };
      case 'paseador':
        return {
          title: 'Crear Servicio de Paseo',
          icon: Heart,
          color: 'green',
          description: 'Agrega un nuevo tipo de paseo que ofreces'
        };
      case 'cuidador':
        return {
          title: 'Crear Servicio de Cuidado',
          icon: Shield,
          color: 'orange',
          description: 'Agrega un nuevo servicio de cuidado de mascotas'
        };
      case 'cliente':
        return {
          title: 'Agregar Mascota',
          icon: User,
          color: 'purple',
          description: 'Registra una nueva mascota en tu perfil'
        };
      default:
        return {
          title: 'Crear Servicio',
          icon: Plus,
          color: 'gray',
          description: 'Agrega un nuevo servicio'
        };
    }
  };

  const config = getServiceConfig();
  const Icon = config.icon;

  // Solo permitir crear servicios a proveedores de servicios, no a dueños
  if (userType === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
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

  // Para veterinarias, verificar que tengan nombreClinica
  if (userType === 'veterinaria' && !usuario?.nombreClinica) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
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

  const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Tipos de servicios veterinarios
  const veterinariaServiceTypes = [
    'Control',
    'Vacunacion',
    'Baño',
    'Desparacitacion',    
    'Cirugia',
    'Radiografia',
    'Ecografia'
    ];

  // Generar horarios dinámicamente para veterinarios y paseadores
  let durationValue = '';
  if (userType === 'veterinaria') durationValue = formDataVeterinaria.duracionMinutos;
  else if (userType === 'paseador') durationValue = formDataPaseador.duracionMinutos;
  const availableTimeSlots = (userType === 'veterinaria' || userType === 'paseador') && durationValue && parseInt(durationValue) >= 30
    ? generateTimeSlots(parseInt(durationValue))
    : timeSlots;

  return (
    <div className={`min-h-screen bg-${config.color}-50 py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className={`flex items-center space-x-2 text-${config.color}-600 hover:text-${config.color}-700 mb-4 transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
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

        {/* Service Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    name="nombreServicio"
                    value={userType === 'veterinaria' ? formDataVeterinaria.nombreServicio : userType === 'paseador' ? formDataPaseador.nombreServicio : formDataCuidador.nombreServicio}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                    placeholder={
                      userType === 'veterinaria' ? 'Ej: Consulta General, Vacunación...' :
                      userType === 'paseador' ? 'Ej: Paseo Básico, Paseo Premium...' :
                      'Ej: Cuidado Diurno, Cuidado 24/7...'
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="precio"
                      value={userType === 'veterinaria' ? formDataVeterinaria.precio : userType === 'paseador' ? formDataPaseador.precio : formDataCuidador.precio}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent`}
                      placeholder={
                        userType === 'paseador' ? 'Precio por hora' :
                        userType === 'cuidador' ? 'Precio por día' :
                        'Precio del servicio'
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
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

            {/* Campos específicos por tipo de usuario */}
            {userType === 'veterinaria' && (
              <>
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Clínica</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Clínica *
                      </label>
                      <input
                        type="text"
                        name="nombreClinica"
                        value={formDataVeterinaria.nombreClinica}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Nombre de tu clínica"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Este campo se obtiene automáticamente de tu perfil de usuario
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Servicio *
                      </label>
                      <select
                        name="tipoServicio"
                        value={formDataVeterinaria.tipoServicio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {veterinariaServiceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración Estimada (minutos) *
                      </label>
                      <input
                        type="number"
                        name="duracionMinutos"
                        value={formDataVeterinaria.duracionMinutos}
                        onChange={handleInputChange}
                        onBlur={handleDurationBlur}
                        min="30"
                        step="30"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: 30, 60, 90..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se redondeará automáticamente a múltiplos de 30 minutos
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección *
                      </label>
                      <select
                        name="direccion"
                        value={formatDireccion(formDataVeterinaria.direccion) || "__default__"}
                        onChange={e => {
                          if (e.target.value === '__nueva__') {
                            setShowDireccionModal(true);
                          } else if (e.target.value === "__default__") {
                            // No hacer nada si es el valor por defecto
                          } else {
                            // Buscar la dirección seleccionada en las opciones
                            let direccionSeleccionada = null;
                            if (direccionUsuario && e.target.value === formatDireccion(direccionUsuario)) {
                              direccionSeleccionada = {
                                calle: direccionUsuario.calle || '',
                                altura: direccionUsuario.altura || '',
                                localidad: {
                                  nombre: (direccionUsuario.localidad && typeof direccionUsuario.localidad === 'object')
                                    ? direccionUsuario.localidad.nombre || ''
                                    : direccionUsuario.localidad || '',
                                  ciudad: {
                                    nombre: (direccionUsuario.localidad && direccionUsuario.localidad.ciudad && typeof direccionUsuario.localidad.ciudad === 'object')
                                      ? direccionUsuario.localidad.ciudad.nombre || ''
                                      : (direccionUsuario.localidad && direccionUsuario.localidad.ciudad) || ''
                                  }
                                }
                              };
                            } else if (formDataVeterinaria.direccion && e.target.value === formatDireccion(formDataVeterinaria.direccion)) {
                              direccionSeleccionada = {
                                calle: formDataVeterinaria.direccion.calle || '',
                                altura: formDataVeterinaria.direccion.altura || '',
                                localidad: {
                                  nombre: (formDataVeterinaria.direccion.localidad && typeof formDataVeterinaria.direccion.localidad === 'object')
                                    ? formDataVeterinaria.direccion.localidad.nombre || ''
                                    : formDataVeterinaria.direccion.localidad || '',
                                  ciudad: {
                                    nombre: (formDataVeterinaria.direccion.localidad && formDataVeterinaria.direccion.localidad.ciudad && typeof formDataVeterinaria.direccion.localidad.ciudad === 'object')
                                      ? formDataVeterinaria.direccion.localidad.ciudad.nombre || ''
                                      : (formDataVeterinaria.direccion.localidad && formDataVeterinaria.direccion.localidad.ciudad) || ''
                                  }
                                }
                              };
                            }
                            setFormDataVeterinaria(prev => {
                              const nuevoForm = { ...prev, direccion: direccionSeleccionada };
                              console.log('formDataVeterinaria:', nuevoForm);
                              return nuevoForm;
                            });
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="__default__" disabled hidden>Selecciona una dirección...</option>
                        {/* Mostrar solo opciones válidas, sin opción en blanco */}
                        {direccionUsuario && (
                          <option value={formatDireccion(direccionUsuario)}>
                            {formatDireccion(direccionUsuario)}
                          </option>
                        )}
                        {/* Si la dirección nueva existe y es distinta a la guardada, mostrarla */}
                        {formDataVeterinaria.direccion && formatDireccion(formDataVeterinaria.direccion) !== formatDireccion(direccionUsuario) && formatDireccion(formDataVeterinaria.direccion) !== '' && (
                          <option value={formatDireccion(formDataVeterinaria.direccion)}>
                            {formatDireccion(formDataVeterinaria.direccion)}
                          </option>
                        )}
                        <option value="__nueva__">Agregar nueva dirección...</option>
                      </select>
{/* Modal para agregar nueva dirección */}
<Modal
  isOpen={showDireccionModal}
  onRequestClose={() => setShowDireccionModal(false)}
  className="fixed inset-0 flex items-center justify-center z-[100]"
  overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-[99]"
  ariaHideApp={false}
>
  <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
    <h2 className="text-xl font-bold mb-4">Agregar nueva dirección</h2>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
      <div className="relative" style={{ maxWidth: '400px' }}>
        <input
          type="text"
          value={ciudadSeleccionada ? ciudadSeleccionada.nombre : ciudadInput}
          onChange={e => {
            if (!ciudadSeleccionada) {
              setCiudadInput(e.target.value);
              setShowCiudadesDropdown(true);
            }
          }}
          onFocus={() => setShowCiudadesDropdown(true)}
          onBlur={() => setTimeout(() => setShowCiudadesDropdown(false), 150)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg" style={{ maxWidth: '400px' }}
          placeholder="Ciudad"
          autoComplete="off"
          readOnly={!!ciudadSeleccionada}
        />
        {(ciudadSeleccionada || ciudadInput) && (
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
            onClick={() => {
              setCiudadSeleccionada(null);
              setCiudadInput('');
              setLocalidades([]);
              setLocalidadSeleccionada(null);
              setLocalidadInput('');
            }}
            tabIndex={-1}
          >
            <span>✕</span>
          </button>
        )}
        {showCiudadesDropdown && !ciudadSeleccionada && (
          <ul className="absolute z-20 left-0 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto mt-1">
            {ciudades.filter(c => c.nombre.toLowerCase().includes(ciudadInput.toLowerCase())).slice(0, 10).map(c => (
              <li
                key={c.id}
                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                onMouseDown={() => {
                  setCiudadInput(c.nombre);
                  setCiudadSeleccionada(c);
                }}
              >
                {c.nombre}
              </li>
            ))}
            {ciudades.filter(c => c.nombre.toLowerCase().includes(ciudadInput.toLowerCase())).length === 0 && (
              <li className="px-3 py-2 text-gray-400">No se encontraron ciudades</li>
            )}
          </ul>
        )}
        {/* Solo mostrar el botón 'X' una vez, no duplicar */}
      </div>
      {showCiudadesDropdown && !ciudadSeleccionada && (
        <ul className="absolute z-20 w-full max-w-[400px] bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto mt-1">
          {ciudades.filter(c => c.nombre.toLowerCase().includes(ciudadInput.toLowerCase())).slice(0, 10).map(c => (
            <li
              key={c.id}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              onMouseDown={() => {
                setCiudadInput(c.nombre);
                setCiudadSeleccionada(c);
              }}
            >
              {c.nombre}
            </li>
          ))}
          {ciudades.filter(c => c.nombre.toLowerCase().includes(ciudadInput.toLowerCase())).length === 0 && (
            <li className="px-3 py-2 text-gray-400">No se encontraron ciudades</li>
          )}
        </ul>
      )}
      {/* Solo mostrar el botón 'X' una vez, no duplicar */}
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
      <div className="relative" style={{ maxWidth: '400px' }}>
        <input
          type="text"
          value={localidadSeleccionada ? localidadSeleccionada.nombre : localidadInput}
          onChange={e => {
            if (!localidadSeleccionada) {
              setLocalidadInput(e.target.value);
              setShowLocalidadesDropdown(true);
            }
          }}
          onFocus={() => setShowLocalidadesDropdown(true)}
          onBlur={() => setTimeout(() => setShowLocalidadesDropdown(false), 150)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg" style={{ maxWidth: '400px' }}
          placeholder="Localidad"
          autoComplete="off"
          readOnly={!!localidadSeleccionada}
          disabled={!ciudadSeleccionada}
        />
        {(localidadSeleccionada || localidadInput) && (
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
            onClick={() => {
              setLocalidadSeleccionada(null);
              setLocalidadInput('');
            }}
            tabIndex={-1}
          >
            <span>✕</span>
          </button>
        )}
        {showLocalidadesDropdown && !localidadSeleccionada && (
          <ul className="absolute z-20 left-0 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto mt-1">
            {localidades.filter(l => l.nombre.toLowerCase().includes(localidadInput.toLowerCase())).slice(0, 10).map(l => (
              <li
                key={l.id}
                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                onMouseDown={() => {
                  setLocalidadInput(l.nombre);
                  setLocalidadSeleccionada(l);
                }}
              >
                {l.nombre}
              </li>
            ))}
            {localidades.filter(l => l.nombre.toLowerCase().includes(localidadInput.toLowerCase())).length === 0 && (
              <li className="px-3 py-2 text-gray-400">No se encontraron localidades</li>
            )}
          </ul>
        )}
        {/* Solo mostrar el botón 'X' una vez, no duplicar */}
      </div>
      {showLocalidadesDropdown && !localidadSeleccionada && (
        <ul className="absolute z-20 w-full max-w-[400px] bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto mt-1">
          {localidades.filter(l => l.nombre.toLowerCase().includes(localidadInput.toLowerCase())).slice(0, 10).map(l => (
            <li
              key={l.id}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              onMouseDown={() => {
                setLocalidadInput(l.nombre);
                setLocalidadSeleccionada(l);
              }}
            >
              {l.nombre}
            </li>
          ))}
          {localidades.filter(l => l.nombre.toLowerCase().includes(localidadInput.toLowerCase())).length === 0 && (
            <li className="px-3 py-2 text-gray-400">No se encontraron localidades</li>
          )}
        </ul>
      )}
      {/* Solo mostrar el botón 'X' una vez, no duplicar */}
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
      <input
        type="text"
        value={nuevaDireccion.calle}
        onChange={e => setNuevaDireccion(prev => ({ ...prev, calle: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg" style={{ maxWidth: '400px' }}
        placeholder="Calle"
        required
      />
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
      <input
        type="text"
        value={nuevaDireccion.altura}
        onChange={e => setNuevaDireccion(prev => ({ ...prev, altura: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg" style={{ maxWidth: '400px' }}
        placeholder="Altura"
        required
      />
    </div>
    <div className="flex justify-end mt-6">
      <button
        type="button"
        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2"
        onClick={() => setShowDireccionModal(false)}
      >Cancelar</button>
      <button
        type="button"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        onClick={handleGuardarDireccion}
        disabled={!(ciudadSeleccionada && localidadSeleccionada && nuevaDireccion.calle && nuevaDireccion.altura)}
      >Guardar dirección</button>
    </div>
  </div>
</Modal>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de la Clínica *
                      </label>
                      <input
                        type="email"
                        name="emailClinica"
                        value={formDataVeterinaria.emailClinica}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="clinica@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="number"
                        name="telefonoClinica"
                        value={formDataVeterinaria.telefonoClinica}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Disponibilidad *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {weekDays.map(day => {
                        // Normalizar el nombre del día para la comparación
                        let normalizedDay = day.toUpperCase();
                        if (normalizedDay === 'SÁBADO') normalizedDay = 'SABADO';
                        if (normalizedDay === 'MIÉRCOLES') normalizedDay = 'MIERCOLES';
                        const isSelected = (userType === 'veterinaria'
                          ? formDataVeterinaria.diasDisponibles
                          : userType === 'paseador'
                            ? formDataPaseador.diasDisponibles
                            : formDataCuidador.diasDisponibles
                        ).includes(normalizedDay);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleArrayChange('diasDisponibles', day)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? `bg-${config.color}-500 text-white`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {!formDataVeterinaria.duracionMinutos && (
                      <p className="text-sm text-gray-500 mb-3">
                        Primero ingresa la duración del servicio para ver los horarios disponibles
                      </p>
                    )}
                    <div className="grid grid-cols-5 gap-2">
                      {availableTimeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleArrayChange('horariosDisponibles', time)}
                          disabled={!(userType === 'veterinaria' ? formDataVeterinaria.duracionMinutos : userType === 'paseador' ? formDataPaseador.duracionMinutos : false)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            (userType === 'veterinaria' ? formDataVeterinaria.horariosDisponibles : userType === 'paseador' ? formDataPaseador.horariosDisponibles : []).includes(time)
                              ? 'bg-blue-500 text-white'
                              : !(userType === 'veterinaria' ? formDataVeterinaria.duracionMinutos : userType === 'paseador' ? formDataPaseador.duracionMinutos : false)
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {formDataVeterinaria.duracionMinutos && availableTimeSlots.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Horarios generados cada {formDataVeterinaria.duracionMinutos} minutos (de 10:00 AM a 8:00 PM)
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mascotas Aceptadas *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Perros', 'Gatos', 'Aves', 'Otros'].map(pet => {
                        // Comparar con el formato guardado: PERRO, GATO, AVE, OTRO
                        let petKey = '';
                        switch (pet.toUpperCase()) {
                          case 'PERROS': petKey = 'PERRO'; break;
                          case 'GATOS': petKey = 'GATO'; break;
                          case 'AVES': petKey = 'AVE'; break;
                          case 'OTROS': petKey = 'OTRO'; break;
                          default: petKey = pet.toUpperCase();
                        }
                        const isSelected = formDataVeterinaria.mascotasAceptadas?.includes(petKey);
                        return (
                          <button
                            key={pet}
                            type="button"
                            onClick={() => handleArrayChange('mascotasAceptadas', pet)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? `bg-${config.color}-500 text-white`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pet}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {userType === 'paseador' && (
              <>
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad máxima de perros por paseo *
                      </label>
                      <input
                        type="number"
                        name="maxPerros"
                        min={1}
                        step={1}
                        value={formDataPaseador.maxPerros === undefined || formDataPaseador.maxPerros === null ? '' : formDataPaseador.maxPerros}
                        onChange={e => {
                          const val = e.target.value.replace(/^0+(?!$)/, '');
                          setFormDataPaseador(prev => ({ ...prev, maxPerros: val === '' ? '' : val }));
                        }}
                        onBlur={e => {
                          const val = e.target.value.replace(/^0+(?!$)/, '');
                          const num = parseInt(val);
                          setFormDataPaseador(prev => ({ ...prev, maxPerros: (!val || isNaN(num) || num < 1) ? 1 : num }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: 3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración del Paseo *
                      </label>
                      <input
                        type="number"
                        name="duracionMinutos"
                        value={formDataPaseador.duracionMinutos}
                        onChange={handleInputChange}
                        onBlur={handleDurationBlur}
                        min="30"
                        step="30"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: 30, 60, 90..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Se redondeará automáticamente a múltiplos de 30 minutos
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de Contacto *
                      </label>
                      <input
                        type="email"
                        name="emailContacto"
                        value={formDataPaseador.emailContacto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono de Contacto *
                      </label>
                      <input
                        type="tel"
                        name="telefonoContacto"
                        value={formDataPaseador.telefonoContacto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Disponibilidad *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {weekDays.map(day => {
                        let normalizedDay = day.toUpperCase();
                        if (normalizedDay === 'SÁBADO') normalizedDay = 'SABADO';
                        if (normalizedDay === 'MIÉRCOLES') normalizedDay = 'MIERCOLES';
                        const isSelected = formDataPaseador.diasDisponibles.includes(normalizedDay);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleArrayChange('diasDisponibles', day)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Horarios Disponibles *
                    </label>
                    {(!formDataPaseador.duracionMinutos || parseInt(formDataPaseador.duracionMinutos) < 30) && (
                      <p className="text-sm text-gray-500 mb-3">
                        Primero ingresa la duración del paseo (mínimo 30 min) para ver los horarios disponibles
                      </p>
                    )}
                    <div className="grid grid-cols-5 gap-2">
                      {availableTimeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleArrayChange('horariosDisponibles', time)}
                          disabled={!formDataPaseador.duracionMinutos}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formDataPaseador.horariosDisponibles.includes(time)
                              ? 'bg-green-500 text-white'
                              : (!formDataPaseador.duracionMinutos || parseInt(formDataPaseador.duracionMinutos) < 30)
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {formDataPaseador.duracionMinutos && parseInt(formDataPaseador.duracionMinutos) >= 30 && availableTimeSlots.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Horarios generados cada {formDataPaseador.duracionMinutos} minutos (de 10:00 AM a 8:00 PM)
                      </p>
                    )}
                  </div>
                  
                </div>
              </>
            )}

            {userType === 'cuidador' && (
              <>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de Contacto *
                      </label>
                      <input
                        type="text"
                        name="nombreContacto"
                        value={formDataCuidador.nombreContacto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de Contacto *
                      </label>
                      <input
                        type="email"
                        name="emailContacto"
                        value={formDataCuidador.emailContacto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono de Contacto *
                      </label>
                      <input
                        type="tel"
                        name="telefonoContacto"
                        value={formDataCuidador.telefonoContacto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+57 300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Disponibilidad *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {weekDays.map(day => {
                        let normalizedDay = day.toUpperCase();
                        if (normalizedDay === 'SÁBADO') normalizedDay = 'SABADO';
                        if (normalizedDay === 'MIÉRCOLES') normalizedDay = 'MIERCOLES';
                        const isSelected = formDataCuidador.diasDisponibles.includes(normalizedDay);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleArrayChange('diasDisponibles', day)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mascotas Aceptadas *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Perros', 'Gatos', 'Aves', 'Otros'].map(pet => {
                        // Comparar con el formato guardado: PERRO, GATO, AVE, OTRO
                        let petKey = '';
                        switch (pet.toUpperCase()) {
                          case 'PERROS': petKey = 'PERRO'; break;
                          case 'GATOS': petKey = 'GATO'; break;
                          case 'AVES': petKey = 'AVE'; break;
                          case 'OTROS': petKey = 'OTRO'; break;
                          default: petKey = pet.toUpperCase();
                        }
                        const isSelected = formDataCuidador.mascotasAceptadas?.includes(petKey);
                        return (
                          <button
                            key={pet}
                            type="button"
                            onClick={() => handleArrayChange('mascotasAceptadas', pet)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? `bg-${config.color}-500 text-white`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pet}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors flex items-center justify-center space-x-2`}
              >
                <Save className="h-5 w-5" />
                <span>Crear Servicio</span>
              </button>
            </div>
            {/* Pop-up de error animado centrado */}
            {showError && (
              <div className="mt-6 flex justify-center">
                <div className="bg-white border border-red-500 shadow-lg rounded-xl px-6 py-4 flex items-center space-x-3">
                  <X className="h-5 w-5 text-red-500 cursor-pointer" onClick={() => setShowError(false)} />
                  <span className="text-red-700 font-semibold text-base text-center">{error}</span>
                </div>
              </div>
            )}
            {/* Pop-up de éxito animado */}
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