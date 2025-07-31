import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, X, Stethoscope, Heart, Shield, Phone, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import Boton from '../comun/Boton';
import { useAuth } from '../../context/authContext.tsx';



interface FormularioRegistroProps {
  onSubmit: (data: { 
    nombreUsuario: string; 
    email: string; 
    contrasenia: string; 
    telefono: string;
    direccion: {
      calle: string;
      altura: string;
      localidad: {
        nombre: string;
        ciudad: {
          nombre: string;
        }
      };
    };
    tipoUsuario: string;
  }) => void;
  onSwitchToLogin: () => void;
}



const FormularioRegistro: React.FC<FormularioRegistroProps> = ({ onSubmit, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [loading, setLoading] = useState(false);
const [showError, setShowError] = useState(false); // Nuevo estado añadido
    const [error, setError] = useState('');
  const { registerWithCredentials } = useAuth();
  
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    email: '',
    contrasenia: '',
    confirmarContrasenia: '',
    telefono: '',
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
    tipoUsuario: 'cliente'
  });

useEffect(() => {
  if (error) {
    setShowError(true);
    const timer = setTimeout(() => {
      setShowError(false);
      setTimeout(() => setError(''), 500); // Limpia el error después de la animación
    }, 5000); // 5 segundos visibles

    return () => clearTimeout(timer);
  }
}, [error]);

  const userTypes = [
    { value: 'cliente', label: 'Dueño de Mascota', icon: User, description: 'Busco servicios para mi mascota' },
    { value: 'veterinaria', label: 'Veterinario/a', icon: Stethoscope, description: 'Ofrezco servicios veterinarios' },
    { value: 'paseador', label: 'Paseador/a', icon: Heart, description: 'Ofrezco servicios de paseo' },
    { value: 'cuidador', label: 'Cuidador/a', icon: Shield, description: 'Ofrezco servicios de cuidado' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  // Manejar campos anidados
  if (name.includes('.')) {
    const parts = name.split('.');
    
    setFormData(prev => {
      // Crear una copia profunda del estado anterior
      const newData = { ...prev };
      
      // Navegar a través de la estructura anidada
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]] = { ...current[parts[i]] };
      }
      
      // Asignar el valor final
      current[parts[parts.length - 1]] = value;
      
      return newData;
    });
  } else {
    // Manejar campos planos
    setFormData(prev => ({
      ...prev,
      [name === 'nombre' ? 'nombreUsuario' : name]: value // Corregir el mapeo de 'nombre' a 'nombreUsuario'
    }));
  }
};

  const handleUserTypeChange = (tipoUsuario: string) => {
    setFormData(prev => ({
      ...prev,
      tipoUsuario
    }));
  };

  /* const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      nombreUsuario: formData.nombreUsuario,
      email: formData.email,
      contrasenia: formData.contrasenia,
      telefono: formData.telefono,
      direccion: formData.direccion,
      tipoUsuario: formData.tipoUsuario
    });
  }; */

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      if (formData.contrasenia !== formData.confirmarContrasenia) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
      
      try {
        await registerWithCredentials(formData.nombreUsuario, formData.email, formData.contrasenia, formData.telefono, formData.direccion, formData.tipoUsuario);
        // El contexto ya maneja la navegación y el almacenamiento
      } catch (error: any) {
    // Aquí manejamos el error del backend
    if (error.response) {
      // Si el backend devuelve una respuesta con detalles del error
      const errorMessage = error.response.data.message || 
                         error.response.data.error || 
                         'Error al crear la cuenta';
      setError(errorMessage);
    } else if (error.request) {
      // Si no se recibió respuesta del backend
      setError('No se recibió respuesta del servidor');
    } else {
      // Otros tipos de errores
      setError(error.message || 'Error al crear la cuenta');
    }
  } finally {
    setLoading(false);
  }
};

  const toggleContraseniaVisibility = () => {
    setMostrarContrasenia(!mostrarContrasenia);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = formData.tipoUsuario && formData.nombreUsuario && formData.email && formData.telefono;
  
  // Validaciones de contraseña
  const passwordValidations = [
    formData.contrasenia.length >= 8,
    /[A-Z]/.test(formData.contrasenia),
    /[0-9]/.test(formData.contrasenia),
    /[!@#$%^&*]/.test(formData.contrasenia)
  ];
  
  const allPasswordValidationsPassed = passwordValidations.every(validation => validation);
  const passwordsMatch = formData.contrasenia && formData.confirmarContrasenia && formData.contrasenia === formData.confirmarContrasenia;
  
  const canProceedStep2 = formData.contrasenia && formData.confirmarContrasenia && allPasswordValidationsPassed && passwordsMatch;

  // Validaciones de contrasenia para mostrar en la UI
  const ContraseniaValidations = [
    { test: formData.contrasenia.length >= 8, text: 'Al menos 8 caracteres' },
    { test: /[A-Z]/.test(formData.contrasenia), text: 'Una letra mayúscula' },
    { test: /[0-9]/.test(formData.contrasenia), text: 'Un número' },
    { test: /[!@#$%^&*]/.test(formData.contrasenia), text: 'Un carácter especial' }
  ];

  const ContraseniasMatch = passwordsMatch;

  return (
    <>
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === currentStep 
                  ? 'bg-green-500 text-white' 
                  : step < currentStep 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-8 h-0.5 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: User Type and Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Cómo quieres usar PetCare?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleUserTypeChange(type.value)}
                      className={`p-2 border-2 rounded-lg transition-all duration-200 text-center ${
                        formData.tipoUsuario === type.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`p-1.5 rounded-lg ${
                          formData.tipoUsuario === type.value ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-xs leading-tight">{type.label}</h4>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="nombrenombreUsuario" className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="nombreUsuario"
                    name="nombreUsuario"
                    value={formData.nombreUsuario
                    }
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                    placeholder="+57 300 123 4567"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contrasenia */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Crea tu contraseña</h3>
              <p className="text-sm text-gray-600">Debe ser segura y fácil de recordar</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="contrasenia" className="block text-sm font-semibold text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={mostrarContrasenia ? 'text' : 'contrasenia'}
                    id="contrasenia"
                    name="contrasenia"
                    value={formData.contrasenia}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                    placeholder="Contraseña segura"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleContraseniaVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {mostrarContrasenia ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmarContrasenia" className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirmar contrasenia
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={mostrarContrasenia ? 'text' : 'contrasenia'}
                    id="confirmarContrasenia"
                    name="confirmarContrasenia"
                    value={formData.confirmarContrasenia}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm ${
                      formData.confirmarContrasenia && !ContraseniasMatch ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirma tu contrasenia"
                    required
                  />
                  {formData.confirmarContrasenia && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {ContraseniasMatch ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contrasenia validation indicators */}
            {formData.contrasenia && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                {ContraseniaValidations.map((validation, index) => (
                  <div key={index} className="flex items-center">
                    {validation.test ? (
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <X className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={validation.test ? 'text-green-600' : 'text-red-600'}>
                      {validation.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Address and Terms */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Información de ubicación</h3>
              <p className="text-sm text-gray-600">Para conectarte con servicios cercanos</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Dirección
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="direccion.calle"
                  value={formData.direccion.calle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                  placeholder="Calle"
                  required
                />
                <input
                  type="text"
                  name="direccion.altura"
                  value={formData.direccion.altura}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                  placeholder="Altura"
                  required
                />
                <input
                  type="text"
                  name="direccion.localidad.nombre"
                  value={formData.direccion.localidad.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                  placeholder="Localidad"
                  required
                />
                <input
                  type="text"
                  name="direccion.localidad.ciudad.nombre"
                  value={formData.direccion.localidad.ciudad.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                  placeholder="Ciudad"
                  required
                />
              </div>
            </div>

            <div className="flex items-start text-sm">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="ml-2 text-gray-600">
                Acepto los{' '}
                <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                  términos y condiciones
                </button>{' '}
                y la{' '}
                <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                  política de privacidad
                </button>
              </label>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2)
              }
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                ((currentStep === 1 && canProceedStep1) || (currentStep === 2 && canProceedStep2))
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Boton
              tipo="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}

            </Boton>
          )}
        </div>
      </form>

      {showError && (
        <div className="animate-fade-in-out">
          <div className="mt-2 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm flex items-start">
            <X className="h-5 w-5 mr-2 flex-shrink-0" onClick={() => setShowError(false)} />
            <span>{error}</span>
          </div>
        </div>
      )}



      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </>
  );
};

export default FormularioRegistro;