import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Heart, Calendar, Weight, Dog, Cat, Bird, Upload, X, Camera, Loader, CheckCircle, ChevronDown, Search } from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { useAuth } from '../../context/authContext';
import CloudinarySetup from '../setup/CloudinarySetup';
import { breedsService, BreedOption } from '../../services/breedsService';

interface RegistrarMascotaProps {
  onBack: () => void;
  onSuccess: () => void;
}

const RegistrarMascota: React.FC<RegistrarMascotaProps> = ({ onBack, onSuccess }) => {
  const { usuario , registroMascota} = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'PERRO',
    raza: '',
    edad: '',
    peso: '',
    fotos: [] as string[],
  });

  const [showError, setShowError] = useState(false); // Nuevo estado añadido

  const [fotos, setFotos] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCloudinarySetup, setShowCloudinarySetup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // Estados para el manejo de razas
  const [availableBreeds, setAvailableBreeds] = useState<BreedOption[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [breedSearchQuery, setBreedSearchQuery] = useState('');
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<BreedOption | null>(null);
  
  // Cache para evitar subir la misma imagen múltiples veces
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Effect para cargar razas cuando cambia el tipo de mascota
  useEffect(() => {
    const loadBreeds = async () => {
      if (!formData.tipo) return;
      
      setLoadingBreeds(true);
      setSelectedBreed(null);
      setFormData(prev => ({ ...prev, raza: '' }));
      
      try {
        console.log(`🔍 Cargando razas para tipo: ${formData.tipo}`);
        const breeds = await breedsService.getBreedsByType(formData.tipo);
        setAvailableBreeds(breeds);
        console.log(`✅ ${breeds.length} razas cargadas para ${formData.tipo}`);
      } catch (error) {
        console.error('❌ Error al cargar razas:', error);
        setAvailableBreeds([]);
      } finally {
        setLoadingBreeds(false);
      }
    };

    loadBreeds();
  }, [formData.tipo]);

  // Función para manejar selección de raza
  const handleBreedSelect = (breed: BreedOption) => {
    setSelectedBreed(breed);
    setFormData(prev => ({ ...prev, raza: breed.value }));
    setBreedSearchQuery(breed.label);
    setShowBreedDropdown(false);
    
    // Mostrar una pequeña animación de confirmación
    console.log(`✅ Raza seleccionada: ${breed.label}`);
  };

  // Función para buscar razas
  const handleBreedSearch = (query: string) => {
    setBreedSearchQuery(query);
    setFormData(prev => ({ ...prev, raza: query }));
    
    // Mostrar dropdown si hay texto o si hay razas disponibles
    if (query.length >= 0 && availableBreeds.length > 0) {
      setShowBreedDropdown(true);
    } else {
      setShowBreedDropdown(false);
    }
    
    // Limpiar selección si el usuario está escribiendo algo diferente
    if (selectedBreed && selectedBreed.label !== query) {
      setSelectedBreed(null);
    }
  };

  // Búsqueda inteligente de razas (fuzzy search)
  const getFilteredBreeds = () => {
    if (!breedSearchQuery.trim()) {
      // Si no hay búsqueda, mostrar las razas más populares primero
      return availableBreeds.slice(0, 15);
    }
    
    const query = breedSearchQuery.toLowerCase().trim();
    
    // Búsqueda inteligente: coincidencias exactas primero, luego parciales
    const exactMatches: BreedOption[] = [];
    const startMatches: BreedOption[] = [];
    const containsMatches: BreedOption[] = [];
    
    availableBreeds.forEach(breed => {
      const breedName = breed.label.toLowerCase();
      
      if (breedName === query) {
        exactMatches.push(breed);
      } else if (breedName.startsWith(query)) {
        startMatches.push(breed);
      } else if (breedName.includes(query)) {
        containsMatches.push(breed);
      }
    });
    
    // Combinar resultados por prioridad
    return [...exactMatches, ...startMatches, ...containsMatches].slice(0, 12);
  };

  const filteredBreeds = getFilteredBreeds();

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.breed-dropdown-container')) {
        setShowBreedDropdown(false);
      }
    };

    if (showBreedDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBreedDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuario?.id) {
      setSubmitError('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    // Validaciones de campos obligatorios
    if (!formData.nombre.trim()) {
      setSubmitError('El nombre de la mascota es obligatorio.');
      return;
    }

    if (!formData.tipo) {
      setSubmitError('El tipo de mascota es obligatorio.');
      return;
    }

    if (!formData.edad || parseFloat(formData.edad) <= 0) {
      setSubmitError('La edad de la mascota es obligatoria y debe ser mayor a 0.');
      return;
    }

    if (!formData.peso || parseFloat(formData.peso) <= 0) {
      setSubmitError('El peso de la mascota es obligatorio y debe ser mayor a 0.');
      return;
    }

    if (!formData.fotos || formData.fotos.length < 2) {
      setSubmitError('Debes subir al menos 2 fotos de tu mascota para completar el registro.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const mascotaData = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        raza: formData.raza.trim() || null, // Raza es opcional
        edad: parseFloat(formData.edad),
        peso: parseFloat(formData.peso),
        fotos: formData.fotos
      };

      await registroMascota(usuario.id, mascotaData);
      
      console.log('Mascota registrada exitosamente:', mascotaData);
      
      // Mostrar popup de éxito
      setShowSuccessPopup(true);
      
      // Ocultar popup después de 3 segundos y ejecutar onSuccess
      setTimeout(() => {
        setShowSuccessPopup(false);
        onSuccess();
      }, 3000);
      
    } catch (error: unknown) {
      console.error('Error al registrar mascota:', error);
      
      // Aquí manejamos el error del backend
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
        const errorMessage = axiosError.response?.data?.message || 
                           axiosError.response?.data?.error || 
                           'Error al registrar la mascota';
        setSubmitError(errorMessage);
      } else if (error && typeof error === 'object' && 'request' in error) {
        setSubmitError('No se recibió respuesta del servidor');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Error al registrar la mascota';
        setSubmitError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Función para generar un identificador único basado en el contenido del archivo
  const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
      const newPhotos: string[] = [];
      const newFormDataPhotos: string[] = [];
      
      console.log('🔍 Iniciando subida de archivos:', fileArray.map(f => f.name));
      console.log('📷 Fotos actuales en formData:', formData.fotos);
      
      for (const file of fileArray) {
        // Generar hash del archivo para detectar duplicados
        const fileHash = await generateFileHash(file);
        
        // Verificar si ya tenemos esta imagen en cache
        if (imageCache.has(fileHash)) {
          // Reutilizar la URL existente
          const existingUrl = imageCache.get(fileHash)!;
          
          // ⚠️ VALIDACIÓN MEJORADA: Verificar tanto en la lista actual como en las nuevas
          if (formData.fotos.includes(existingUrl) || newFormDataPhotos.includes(existingUrl)) {
            console.log('🚫 Imagen ya agregada anteriormente, se omite:', file.name);
            continue; // Saltar esta imagen
          }
          
          newPhotos.push(existingUrl);
          newFormDataPhotos.push(existingUrl);
          console.log('♻️ Imagen reutilizada desde cache:', file.name);
        } else {
          // Mostrar preview temporal mientras se sube
          const tempUrl = URL.createObjectURL(file);
          newPhotos.push(tempUrl);
          
          try {
            // Subir nueva imagen a Cloudinary
            const cloudinaryResponse = await uploadImageToCloudinary(file, 'mascotas');
            const cloudinaryUrl = cloudinaryResponse.secure_url;
            
            // ⚠️ VALIDACIÓN MEJORADA: Verificar tanto en la lista actual como en las nuevas
            if (formData.fotos.includes(cloudinaryUrl) || newFormDataPhotos.includes(cloudinaryUrl)) {
              console.log('🚫 URL ya existe en la lista, se omite:', file.name);
              URL.revokeObjectURL(tempUrl);
              newPhotos.pop();
              continue;
            }
            
            // Actualizar cache
            setImageCache(prev => new Map(prev).set(fileHash, cloudinaryUrl));
            
            // Reemplazar URL temporal con la real
            const tempIndex = newPhotos.length - 1;
            URL.revokeObjectURL(tempUrl); // Limpiar memoria
            newPhotos[tempIndex] = cloudinaryUrl;
            newFormDataPhotos.push(cloudinaryUrl);
            
            console.log('🆕 Nueva imagen subida:', file.name, '→', cloudinaryUrl);

          } catch (uploadError) {
            // Si falla la subida, remover la imagen temporal
            URL.revokeObjectURL(tempUrl);
            newPhotos.pop();
            throw uploadError;
          }
        }
      }
      
      // Actualizar estados con todas las nuevas fotos
      setFotos(prev => [...prev, ...newPhotos]);
      setFormData(prev => ({
        ...prev,
        fotos: [...prev.fotos, ...newFormDataPhotos]
      }));
      
      // Mostrar log con los valores actualizados
      console.log('📷 Fotos totales después de subir:', [...formData.fotos, ...newFormDataPhotos]);
      
      if (newFormDataPhotos.length > 0) {
        console.log('🆕 Nuevas fotos agregadas:', newFormDataPhotos);
      }
      
      // Mostrar mensaje si se omitieron imágenes duplicadas
      const totalFilesSelected = fileArray.length;
      const actuallyAdded = newFormDataPhotos.length;
      if (totalFilesSelected > actuallyAdded) {
        const duplicatesCount = totalFilesSelected - actuallyAdded;
        console.log(`ℹ️ Se omitieron ${duplicatesCount} imagen(es) duplicada(s)`);
        
        // Mostrar mensaje informativo al usuario
        setUploadError(`Se omitieron ${duplicatesCount} imagen(es) porque ya están agregadas.`);
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          setUploadError(null);
        }, 3000);
      }
      
    } catch (error: unknown) {
      console.error('Error uploading images:', error);
      
      // Verificar si es un error de configuración de Cloudinary
      if (error instanceof Error && error.message.includes('Cloudinary no está configurado')) {
        setShowCloudinarySetup(true);
        setUploadError('Cloudinary no está configurado. Haz clic en "Ver instrucciones" para configurarlo.');
      } else {
        setUploadError('Error al subir las imágenes. Inténtalo de nuevo.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (index: number) => {
    const photoUrl = fotos[index];
    
    // Si es una URL temporal (blob), liberarla de memoria
    if (photoUrl && photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
    
    // Calcular las nuevas listas antes de actualizar el estado
    const newFotos = fotos.filter((_, i) => i !== index);
    const newFormDataFotos = formData.fotos.filter((_, i) => i !== index);
    
    // Remover de la lista de fotos y del formData
    setFotos(newFotos);
    setFormData(prev => ({
      ...prev,
      fotos: newFormDataFotos
    }));

    console.log('🗑️ Imagen removida:', photoUrl);
    console.log('📷 Fotos restantes después de remover:', newFormDataFotos);
    console.log('🧠 Cache actual:', Array.from(imageCache.keys()).length, 'imágenes en cache');

    // Nota: No eliminamos del cache para poder reutilizar la imagen si se vuelve a seleccionar
    console.log('💾 Imagen mantenida en cache para reutilización futura');
  };

  const speciesOptions = [
    { value: 'PERRO', label: 'Perro', icon: Dog },
    { value: 'GATO', label: 'Gato', icon: Cat },
    { value: 'AVE', label: 'Ave', icon: Bird },
    { value: 'OTRO', label: 'Otro', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver a Mis Mascotas</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva Mascota</h1>
                <p className="text-gray-600">Añade tu mascota para acceder a todos nuestros servicios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            

            {/* Pet Information */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-blue-600" />
                Información de tu Mascota
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Mascota *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ej: Max, Luna, Rocky..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raza {formData.tipo !== 'OTRO' && '(Opcional)'}
                  </label>
                  <div className="relative breed-dropdown-container">
                    <div className="relative">
                      <input
                        type="text"
                        name="raza"
                        value={breedSearchQuery}
                        onChange={(e) => handleBreedSearch(e.target.value)}
                        onFocus={() => {
                          if (availableBreeds.length > 0) {
                            setShowBreedDropdown(true);
                          }
                        }}
                        className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          selectedBreed ? 'bg-green-50 border-green-300' : ''
                        }`}
                        placeholder={
                          loadingBreeds 
                            ? "Cargando razas..." 
                            : formData.tipo === 'OTRO' 
                              ? "Ej: Hamster, Conejo, Tortuga..." 
                              : availableBreeds.length > 0
                                ? `Haz clic para ver razas de ${formData.tipo.toLowerCase()} o escribe para buscar...`
                                : `Buscar raza de ${formData.tipo.toLowerCase()}...`
                        }
                        disabled={loadingBreeds}
                      />
                      
                      {/* Icono de búsqueda o loading */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {selectedBreed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : loadingBreeds ? (
                          <Loader className="h-5 w-5 animate-spin text-gray-400" />
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Search className="h-4 w-4 text-gray-400" />
                            {availableBreeds.length > 0 && (
                              <ChevronDown 
                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                  showBreedDropdown ? 'rotate-180' : ''
                                }`} 
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dropdown de razas */}
                    {showBreedDropdown && availableBreeds.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                        {/* Header del dropdown */}
                        {!breedSearchQuery.trim() && (
                          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                            <p className="text-sm font-medium text-blue-800">
                              💡 Razas populares de {formData.tipo.toLowerCase()}
                            </p>
                            <p className="text-xs text-blue-600">
                              Haz clic en una raza o escribe para buscar más opciones
                            </p>
                          </div>
                        )}
                        
                        {breedSearchQuery.trim() && (
                          <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                            <p className="text-sm font-medium text-green-800">
                              🔍 Resultados para "{breedSearchQuery}"
                            </p>
                            <p className="text-xs text-green-600">
                              {filteredBreeds.length} raza{filteredBreeds.length !== 1 ? 's' : ''} encontrada{filteredBreeds.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        {/* Lista de razas */}
                        <div className="max-h-60 overflow-y-auto">
                          {/* Opción especial: Sin raza (solo si tipo !== 'OTRO') */}
                          {formData.tipo !== 'OTRO' && (
                            <div
                              onClick={() => handleBreedSelect({ label: 'Sin raza', value: 'Sin raza' })}
                              className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                            >
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                                  🐾 Sin raza
                                </span>
                                <span className="ml-2 text-xs text-gray-400">(Mascota sin raza definida)</span>
                              </div>
                            </div>
                          )}
                          {filteredBreeds.length > 0 ? (
                            filteredBreeds.map((breed, index) => (
                              <div
                                key={index}
                                onClick={() => handleBreedSelect(breed)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                      {breed.label}
                                    </p>
                                    {/* Información adicional en formato compacto */}
                                    {(breed.details?.temperament || breed.details?.origin) && (
                                      <div className="mt-1 space-y-1">
                                        {breed.details.temperament && (
                                          <p className="text-xs text-gray-600 truncate">
                                            <span className="font-medium text-orange-600">Temperamento:</span> {breed.details.temperament}
                                          </p>
                                        )}
                                        {breed.details.origin && (
                                          <p className="text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">Origen:</span> {breed.details.origin}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {/* Indicador de selección */}
                                  <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            /* Mensaje cuando no hay resultados */
                            <div className="px-4 py-6 text-center">
                              <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Search className="h-6 w-6 text-yellow-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                No se encontraron razas
                              </p>
                              <p className="text-xs text-gray-500 mb-3">
                                No hay razas que coincidan con "{breedSearchQuery}"
                              </p>
                              <div className="text-xs text-gray-400">
                                💡 Puedes escribir cualquier raza personalizada
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer con información adicional */}
                        {!breedSearchQuery.trim() && availableBreeds.length > 15 && (
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                              Mostrando 15 de {availableBreeds.length} razas disponibles. 
                              <span className="font-medium"> Escribe para buscar más opciones.</span>
                            </p>
                          </div>
                        )}
                        
                        {breedSearchQuery.trim() && filteredBreeds.length > 0 && (
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                              💡 Si no encuentras la raza exacta, puedes escribir cualquier nombre personalizado
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Información sobre la raza seleccionada */}
                    

                  

                    
                  </div>
                </div>
              </div>

              {/* Species Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Mascota *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {speciesOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tipo: option.value, raza: '' }));
                          setSelectedBreed(null);
                          setBreedSearchQuery('');
                          setShowBreedDropdown(false);
                        }}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                          formData.tipo === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Edad (años) *
                  </label>
                  <input
                    type="number"
                    name="edad"
                    required
                    min="0"
                    max="30"
                    value={formData.edad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ej: 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Weight className="h-4 w-4 inline mr-1" />
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    name="peso"
                    required
                    min="0"
                    step="0.1"
                    value={formData.peso}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ej: 25.5"
                  />
                </div>
              </div>
            </div>

            {/* Pet Fotos Section */}
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-purple-600" />
                  Fotos de tu Mascota
                </h3>
                
                {/* Indicador de progreso de fotos */}
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    fotos.length >= 2 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : fotos.length === 1
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    <Camera className="h-4 w-4" />
                    <span>{fotos.length}/2 mínimo</span>
                    {fotos.length >= 2 && <CheckCircle className="h-4 w-4 ml-1" />}
                  </div>
                </div>
              </div>
              
              {/* Mensaje de requisito */}
              {fotos.length < 2 && (
                <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                  fotos.length === 0 
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : 'bg-yellow-50 border-yellow-400 text-yellow-700'
                }`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {fotos.length === 0 ? (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        {fotos.length === 0 
                          ? '📸 Se requieren mínimo 2 fotos para registrar tu mascota'
                          : `📸 ¡Genial! Agrega ${2 - fotos.length} foto más para completar el registro`
                        }
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        Las fotos ayudan a los profesionales a conocer mejor a tu mascota
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mensaje de éxito cuando se tienen suficientes fotos */}
              {fotos.length >= 2 && fotos.length < 5 && (
                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        ✨ ¡Perfecto! Ya tienes {fotos.length} fotos
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        Puedes agregar más fotos si quieres (máximo recomendado: 5)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Photo Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragOver 
                    ? 'border-purple-500 bg-purple-100' 
                    : fotos.length >= 2
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {/* Icono dinámico basado en el estado */}
                <div className="relative mb-4">
                  {fotos.length >= 2 ? (
                    <div className="relative">
                      <Upload className="h-12 w-12 text-green-500 mx-auto" />
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                  ) : (
                    <Upload className={`h-12 w-12 mx-auto ${
                      fotos.length === 1 ? 'text-yellow-500' : 'text-gray-400'
                    }`} />
                  )}
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {fotos.length >= 2 
                    ? '¡Genial! Puedes agregar más fotos' 
                    : fotos.length === 1
                    ? '¡Una más! Agrega otra foto'
                    : 'Sube fotos de tu mascota'
                  }
                </h4>
                
                <p className="text-gray-600 mb-4">
                  {fotos.length >= 2 
                    ? 'Ya cumples el mínimo requerido. Puedes seguir agregando más.'
                    : fotos.length === 1
                    ? 'Necesitas al menos una foto más para completar el registro'
                    : 'Arrastra y suelta las imágenes aquí, o haz clic para seleccionar (mínimo 2 fotos)'
                  }
                </p>
                
                {/* Barra de progreso visual */}
                <div className="mb-4 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{Math.min(fotos.length, 2)}/2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        fotos.length >= 2 ? 'bg-green-500' : fotos.length === 1 ? 'bg-yellow-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min((fotos.length / 2) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className={`inline-flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-colors cursor-pointer ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : fotos.length >= 2
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>
                        {fotos.length >= 2 ? 'Agregar Más Fotos' : 'Seleccionar Fotos'}
                      </span>
                    </>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Formatos soportados: JPG, PNG, GIF (máx. 5MB por imagen)<br/>
                  💡 Las imágenes idénticas se detectan automáticamente y no se vuelven a subir
                </p>
                {uploadError && (
                  <div className={`mt-3 p-3 border rounded-lg ${
                    uploadError.includes('omitieron') || uploadError.includes('duplicadas')
                      ? 'bg-yellow-50 border-yellow-200'  // Color amarillo para mensajes informativos
                      : 'bg-red-50 border-red-200'        // Color rojo para errores reales
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${
                        uploadError.includes('omitieron') || uploadError.includes('duplicadas')
                          ? 'text-yellow-700'   // Texto amarillo para informativos
                          : 'text-red-600'      // Texto rojo para errores
                      }`}>
                        {uploadError.includes('omitieron') ? '⚠️ ' : ''}
                        {uploadError}
                      </p>
                      {uploadError.includes('Cloudinary no está configurado') && (
                        <button
                          onClick={() => setShowCloudinarySetup(true)}
                          className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Ver instrucciones
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Preview Grid */}
              {fotos.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      Fotos subidas ({fotos.length})
                      {fotos.length >= 2 && (
                        <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                      )}
                    </h4>
                    {fotos.length < 2 && (
                      <span className="text-xs text-red-600 font-medium">
                        Faltan {2 - fotos.length} foto{2 - fotos.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className={`relative rounded-lg overflow-hidden shadow-md border-2 transition-all duration-200 ${
                          index < 2 
                            ? 'border-green-300 shadow-green-100' 
                            : 'border-purple-300 shadow-purple-100'
                        }`}>
                          <img
                            src={photo}
                            alt={`Mascota ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          
                        
                          
                          {/* Botón de eliminar */}
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Etiqueta descriptiva */}
                        <p className="text-xs text-center mt-1 font-medium">
                          {index < 2 
                            ? (index === 0 ? 'Principal' : 'Secundaria')
                            : 'Adicional'
                          }
                        </p>
                      </div>
                    ))}
                    
                    {/* Placeholders para fotos faltantes */}
                    {fotos.length < 2 && Array.from({ length: 2 - fotos.length }, (_, index) => (
                      <div key={`placeholder-${index}`} className="relative">
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500 font-medium">
                              {fotos.length + index === 0 ? 'Foto Principal' : 'Foto Secundaria'}
                            </p>
                            <p className="text-xs text-red-500 font-bold">
                              Requerida
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje cuando no hay fotos */}
              {fotos.length === 0 && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <Camera className="h-8 w-8 text-red-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    ¡Agrega las primeras fotos!
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Necesitas al menos 2 fotos para completar el registro de tu mascota
                  </p>
                </div>
              )}
            </div>

            {/* Error de envío */}
            {submitError && (
              <div className={`rounded-lg p-4 border-l-4 ${
                submitError.includes('fotos') 
                  ? 'bg-red-50 border-red-400'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {submitError.includes('fotos') ? (
                      <Camera className="h-5 w-5 text-red-500 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {submitError.includes('fotos') ? 'Fotos Requeridas' : 'Error de Validación'}
                    </h3>
                    <p className="text-red-700 text-sm mt-1">{submitError}</p>
                    {submitError.includes('fotos') && (
                      <div className="mt-3">
                        <p className="text-xs text-red-600 mb-2">
                          📸 Actualmente tienes: <strong>{fotos.length} foto{fotos.length !== 1 ? 's' : ''}</strong>
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-red-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((fotos.length / 2) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-red-600 font-medium">
                            {fotos.length}/2
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                          💡 Sube al menos {2 - fotos.length} foto{2 - fotos.length > 1 ? 's' : ''} más para continuar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Registrar Mascota</span>
                  </>
                )}
              </button>
              {showError && submitError && (
                      <div className="animate-fade-in-out">
                        <div className="mt-2 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm flex items-start">
                          <X className="h-5 w-5 mr-2 flex-shrink-0" onClick={() => setShowError(false)} />
                          <span>{submitError}</span>
                        </div>
                      </div>
                )}
            </div>
          </form>
        </div>
      </div>

      {/* Modal de configuración de Cloudinary */}
      {showCloudinarySetup && (
        <CloudinarySetup onClose={() => setShowCloudinarySetup(false)} />
      )}

      {/* Popup de éxito */}
      {showSuccessPopup && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full transform animate-bounce-in border border-green-200">
              <div className="text-center">
                {/* Icono de éxito animado */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-2 bg-green-200 rounded-full animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white animate-pulse" />
                  </div>
                </div>
                
                {/* Título */}
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  ¡Registro Exitoso!
                </h3>
                
                {/* Mensaje principal */}
                <p className="text-gray-700 mb-2 text-lg">
                  <span className="font-bold text-purple-600">{formData.nombre}</span> 
                </p>
                <p className="text-gray-600 mb-6 text-sm">
                  ha sido registrada exitosamente
                </p>
                
                {/* Información adicional con iconos */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
                  <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                    <Heart className="h-5 w-5 animate-pulse" />
                    <span className="text-sm font-semibold">
                      ¡Todo listo para comenzar!
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    Ya puedes acceder a veterinarias, paseadores y cuidadores
                  </p>
                </div>
                
                {/* Barra de progreso mejorada */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-progress shadow-sm"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Redirigiendo automáticamente...
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estilos CSS para las animaciones */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
              }
              
              @keyframes bounce-in {
                0% { 
                  transform: scale(0.3); 
                  opacity: 0; 
                }
                50% { 
                  transform: scale(1.05); 
                }
                70% { 
                  transform: scale(0.9); 
                }
                100% { 
                  transform: scale(1); 
                  opacity: 1; 
                }
              }
              
              .animate-bounce-in {
                animation: bounce-in 0.5s ease-out;
              }
              
              .animate-progress {
                animation: progress 3s linear forwards;
              }
            `
          }} />
        </>
      )}
    </div>
  );
};

export default RegistrarMascota;