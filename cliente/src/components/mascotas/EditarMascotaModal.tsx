import React, { useState, useRef } from 'react';
import { Calendar, Weight, X, Trash2, Camera, Edit3, Save, PawPrint, Image } from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

interface EditarMascotaModalProps {
  mascota: {
    id: string;
    nombre: string;
    edad: number;
    peso?: number;
    fotos?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (mascotaEditada: any) => void;
}

const EditarMascotaModal: React.FC<EditarMascotaModalProps> = ({ mascota, isOpen, onClose, onSave }) => {
  const [edad, setEdad] = useState(mascota.edad);
  const [peso, setPeso] = useState(mascota.peso || 0);
  const [fotos, setFotos] = useState<string[]>(mascota.fotos || []);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImageToCloudinary(file, 'mascotas'));
      const responses = await Promise.all(uploadPromises);
      const newUrls = responses.map(response => response.secure_url);
      setFotos(prev => [...prev, ...newUrls]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir las imágenes. Por favor, intenta de nuevo.');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleQuitarFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulación de carga
      onSave({ ...mascota, edad, peso, fotos });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
        {/* Header del modal con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Editar Mascota</h3>
                  <p className="text-purple-100 text-sm">Actualiza la información de {mascota.nombre}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Decoración de patitas */}
          <div className="absolute top-1 right-16 opacity-20">
            <PawPrint className="h-6 w-6 rotate-12" />
          </div>
          <div className="absolute bottom-1 left-16 opacity-20">
            <PawPrint className="h-4 w-4 -rotate-12" />
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
          {/* Información básica */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Edad */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <label className="block text-base font-bold text-gray-800 mb-2 flex items-center space-x-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span>Edad de {mascota.nombre}</span>
              </label>
              <div className="flex items-center space-x-3">
                <input 
                  type="number" 
                  min={0} 
                  max={30}
                  value={edad} 
                  onChange={e => setEdad(Number(e.target.value))} 
                  className="w-16 h-11 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 outline-none" 
                />
                <span className="text-gray-600 font-semibold text-base">año{edad !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Edad actual de tu mascota</p>
            </div>

            {/* Peso */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <label className="block text-base font-bold text-gray-800 mb-2 flex items-center space-x-2">
                <div className="bg-green-100 p-1.5 rounded-full">
                  <Weight className="h-4 w-4 text-green-600" />
                </div>
                <span>Peso</span>
              </label>
              <div className="flex items-center space-x-3">
                <input 
                  type="number" 
                  min={0} 
                  max={200}
                  step="0.1"
                  value={peso} 
                  onChange={e => setPeso(Number(e.target.value))} 
                  className="w-16 h-11 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 outline-none" 
                />
                <span className="text-gray-600 font-semibold text-base">kg</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Peso actual aproximado</p>
            </div>
          </div>

          {/* Galería de fotos */}
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <label className="block text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
              <div className="bg-pink-100 p-1.5 rounded-full">
                <Camera className="h-4 w-4 text-pink-600" />
              </div>
              <span>Galería de Fotos</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-semibold">
                {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
              </span>
            </label>
            
            {/* Grid de fotos existentes */}
            {fotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {fotos.map((foto, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
                      <img 
                        src={foto} 
                        alt={`Foto ${idx + 1} de ${mascota.nombre}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <button 
                      onClick={() => handleQuitarFoto(idx)} 
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transform hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                    <div className="absolute bottom-0.5 left-0.5 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar nueva foto */}
            <div className="space-y-4">
              {/* Input oculto para archivos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Área de subida de archivos */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    {uploadingFiles ? (
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Image className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {uploadingFiles ? 'Subiendo imágenes...' : 'Selecciona fotos de tu computadora'}
                  </h4>
                  <p className="text-gray-600 mb-3 text-base">
                    {uploadingFiles 
                      ? 'Por favor espera mientras subimos tus fotos'
                      : 'Haz clic aquí o arrastra y suelta archivos'
                    }
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span></span>
                      <span>Máx. 10MB</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                <Camera className="h-4 w-4 inline mr-1" />
                Las fotos ayudan a que los profesionales conozcan mejor a tu mascota
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-center pt-2">
            <button 
              onClick={handleGuardar} 
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarMascotaModal;
