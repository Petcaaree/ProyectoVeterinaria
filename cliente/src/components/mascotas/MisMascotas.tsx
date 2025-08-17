import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, PawPrint, Edit, Trash2, Calendar, Weight, Ruler, Heart, Dog, Cat, Bird } from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';
interface MisMascotasProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
  onRegisterPet: () => void;
}

interface Mascota {
  id: string; // Cambiar de _id a id para coincidir con la API
  nombre: string;
  edad: number;
  tipo: string;
  raza?: string;
  peso?: number;
  fotos?: string[];
}

const MisMascotas: React.FC<MisMascotasProps> = ({ userType, onBack, onRegisterPet }) => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mascotaToDelete, setMascotaToDelete] = useState<Mascota | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { usuario, getMascotas, deleteMascota } = useAuth();

  useEffect(() => {
    const cargarMascotas = async () => {
      if (usuario && usuario.id) {
        try {
          setIsLoading(true);
          setError(null);
          const data = await getMascotas(usuario.id);
          setMascotas(data || []); // Asegurar que siempre sea un array
          console.log('Mascotas obtenidas:', data);
        } catch (error) {
          console.error('Error al obtener mascotas:', error);
          setError('Error al cargar las mascotas');
          setMascotas([]); // Asegurar que sea un array vacío en caso de error
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setMascotas([]);
      }
    };

    cargarMascotas();
  }, [usuario, getMascotas]);

  const getSpeciesIcon = (tipo: string) => {
    switch (tipo) {
      case 'PERRO': return Dog;
      case 'GATO': return Cat;
      case 'AVE': return Bird;
      default: return Heart;
    }
  };

  const getSpeciesLabel = (tipo: string) => {
    switch (tipo) {
      case 'PERRO': return 'Perro';
      case 'GATO': return 'Gato';
      case 'AVE': return 'Ave';
      default: return 'Otro';
    }
  };

  const handleDeletePet = (mascota: Mascota) => {
    setMascotaToDelete(mascota);
    setDeleteError(null); // Limpiar errores previos
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (mascotaToDelete && usuario && usuario.id) {
      try {
        setIsDeleting(true);
        setDeleteError(null); // Limpiar errores previos
        await deleteMascota(usuario.id, mascotaToDelete.id);
        setMascotas(prev => prev.filter(mascota => mascota.id !== mascotaToDelete.id));
        setShowDeleteModal(false);
        setMascotaToDelete(null);
      } catch (error: unknown) {
        console.error('Error al eliminar mascota:', error);
        
        // Extraer el mensaje de error específico del backend
        let errorMessage = 'Error al eliminar la mascota';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        } else if (error && typeof error === 'object' && 'message' in error) {
          const standardError = error as { message: string };
          errorMessage = standardError.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        setDeleteError(errorMessage);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMascotaToDelete(null);
    setDeleteError(null); // Limpiar errores al cancelar
  };

  if (userType !== 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PawPrint className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
            <p className="text-gray-600">
              Solo los dueños de mascotas pueden acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <PawPrint className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mis Mascotas</h1>
                  <p className="text-gray-600">Gestiona la información de tus mascotas registradas</p>
                </div>
              </div>
              <button
                onClick={onRegisterPet}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Registrar Mascota</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 p-3 rounded-full w-12 h-12"></div>
                  <div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-full">
                  <PawPrint className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{mascotas?.length || 0}</p>
                  <p className="text-gray-600">Mascotas Registradas</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{mascotas?.filter(m => m.fotos && m.fotos.length > 0).length || 0}</p>
                  <p className="text-gray-600">Con Fotos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {mascotas && mascotas.length > 0 
                      ? Math.round(mascotas.reduce((acc, mascota) => acc + mascota.edad, 0) / mascotas.length) 
                      : 0
                    }
                  </p>
                  <p className="text-gray-600">Edad Promedio</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pets Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !mascotas || mascotas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes mascotas registradas</h3>
            <p className="text-gray-600 mb-6">
              Registra tu primera mascota para comenzar a usar nuestros servicios
            </p>
            <button
              onClick={onRegisterPet}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Registrar Primera Mascota</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mascotas.map((mascota) => {
              const SpeciesIcon = getSpeciesIcon(mascota.tipo);
              
              return (
                <div key={mascota.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Pet Photo */}
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative">
                    {mascota.fotos && mascota.fotos.length > 0 ? (
                      <img
                        src={mascota.fotos[0]}
                        alt={mascota.nombre}
                        className="w-full h-full object-cover block"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SpeciesIcon className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full">
                      <span className="text-xs font-semibold text-gray-700">
                        {mascota.fotos ? mascota.fotos.length : 0} foto{(mascota.fotos?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Pet Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{mascota.nombre}</h3>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <SpeciesIcon className="h-4 w-4" />
                          <span className="text-sm">{getSpeciesLabel(mascota.tipo)}</span>
                          {mascota.raza && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm">{mascota.raza}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pet Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{mascota.edad} año{mascota.edad !== 1 ? 's' : ''}</span>
                      </div>
                      {mascota.peso && (
                        <div className="flex items-center space-x-2">
                          <Weight className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{mascota.peso} kg</span>
                        </div>
                      )}
                    </div>

                    {/* Photo Gallery Preview */}
                    {mascota.fotos && mascota.fotos.length > 1 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Fotos adicionales:</p>
                        <div className="flex space-x-2 overflow-x-auto">
                          {mascota.fotos.slice(1, 4).map((foto, index) => (
                            <img
                              key={index}
                              src={foto}
                              alt={`${mascota.nombre} ${index + 2}`}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          ))}
                          {mascota.fotos.length > 4 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-600">+{mascota.fotos.length - 4}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-1">
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeletePet(mascota)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar mascota */}
      {showDeleteModal && mascotaToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Eliminar Mascota</h3>
                  <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                {/* Foto de la mascota */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0">
                  {mascotaToDelete.fotos && mascotaToDelete.fotos.length > 0 ? (
                    <img
                      src={mascotaToDelete.fotos[0]}
                      alt={mascotaToDelete.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {(() => {
                        const SpeciesIcon = getSpeciesIcon(mascotaToDelete.tipo);
                        return <SpeciesIcon className="h-8 w-8 text-white opacity-70" />;
                      })()}
                    </div>
                  )}
                </div>
                
                {/* Información de la mascota */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{mascotaToDelete.nombre}</h4>
                  <p className="text-gray-600 text-sm">
                    {getSpeciesLabel(mascotaToDelete.tipo)}
                    {mascotaToDelete.raza && ` • ${mascotaToDelete.raza}`}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {mascotaToDelete.edad} año{mascotaToDelete.edad !== 1 ? 's' : ''}
                    {mascotaToDelete.peso && ` • ${mascotaToDelete.peso} kg`}
                  </p>
                </div>
              </div>

              {/* Mostrar error si existe */}
              {deleteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">
                        No se puede eliminar la mascota
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        {deleteError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar mensaje de confirmación solo si no hay error */}
              {!deleteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">
                        ¿Estás seguro de que quieres eliminar a {mascotaToDelete.nombre}?
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        Se eliminarán permanentemente todos los datos, fotos y registros asociados con esta mascota.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-3">
                {deleteError ? (
                  // Solo mostrar botón "Cerrar" cuando hay error
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Cerrar
                  </button>
                ) : (
                  // Mostrar botones normales cuando no hay error
                  <>
                    <button
                      onClick={cancelDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Eliminando...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisMascotas;