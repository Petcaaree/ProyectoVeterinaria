import React, { useState } from 'react';
import { ArrowLeft, Save, Heart, Calendar, Weight, Dog, Cat, Bird, Upload, X, Camera, Loader, CheckCircle } from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { useAuth } from '../../context/authContext';
import CloudinarySetup from '../setup/CloudinarySetup';

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
  
  // Cache para evitar subir la misma imagen múltiples veces
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
                    Raza
                  </label>
                  <input
                    type="text"
                    name="raza"
                    value={formData.raza}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ej: Golden Retriever, Siamés..."
                  />
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
                        onClick={() => setFormData(prev => ({ ...prev, tipo: option.value }))}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-600" />
                Fotos de tu Mascota
              </h3>
              
              {/* Photo Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragOver 
                    ? 'border-purple-500 bg-purple-100' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Sube fotos de tu mascota
                </h4>
                <p className="text-gray-600 mb-4">
                  Arrastra y suelta las imágenes aquí, o haz clic para seleccionar
                </p>
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
                      <span>Seleccionar Fotos</span>
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
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Fotos subidas ({fotos.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Mascota ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error de envío */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{submitError}</p>
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