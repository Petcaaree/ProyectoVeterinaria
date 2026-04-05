import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, PawPrint, Heart } from 'lucide-react';
import EditarMascotaModal from './EditarMascotaModal';
import PetCard from './PetCard';
import DeletePetModal from './DeletePetModal';
import { useAuth } from '../../context/authContext.tsx';

interface MisMascotasProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
  onRegisterPet: () => void;
}

interface Mascota {
  id: string;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [mascotaToEdit, setMascotaToEdit] = useState<Mascota | null>(null);

  const { usuario, getMascotas, deleteMascota } = useAuth();

  useEffect(() => {
    const cargarMascotas = async () => {
      if (usuario && usuario.id) {
        try {
          setIsLoading(true);
          setError(null);
          const data = await getMascotas(usuario.id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mascotasAdaptadas = (data || []).map((m: any) => ({
            id: m.id || m._id,
            nombre: m.nombre,
            edad: m.edad,
            tipo: m.tipo,
            raza: m.raza,
            peso: m.peso,
            fotos: m.fotos
          }));
          setMascotas(mascotasAdaptadas);
        } catch (err) {
          console.error('Error al obtener mascotas:', err);
          setError('Error al cargar las mascotas');
          setMascotas([]);
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

  const handleDeletePet = (mascota: Mascota) => {
    setMascotaToDelete(mascota);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleEditPet = (mascota: Mascota) => {
    setMascotaToEdit(mascota);
    setShowEditModal(true);
  };

  const handleSaveEditPet = (mascotaEditada: Mascota) => {
    setMascotas(prev => prev.map(m => m.id === mascotaEditada.id ? mascotaEditada : m));
    setShowEditModal(false);
    setMascotaToEdit(null);
  };

  const confirmDelete = async () => {
    if (mascotaToDelete && usuario && usuario.id) {
      try {
        setIsDeleting(true);
        setDeleteError(null);
        await deleteMascota(usuario.id, mascotaToDelete.id);
        setMascotas(prev => prev.filter(mascota => mascota.id !== mascotaToDelete.id));
        setShowDeleteModal(false);
        setMascotaToDelete(null);
      } catch (err: unknown) {
        console.error('Error al eliminar mascota:', err);
        let errorMessage = 'Error al eliminar la mascota';
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { message?: string } } };
          if (axiosError.response?.data?.message) errorMessage = axiosError.response.data.message;
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = (err as { message: string }).message;
        } else if (typeof err === 'string') {
          errorMessage = err;
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
    setDeleteError(null);
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
            <p className="text-gray-600">Solo los dueños de mascotas pueden acceder a esta sección.</p>
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
          <button onClick={onBack} className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors">
            <ArrowLeft className="h-5 w-5" /><span>Volver</span>
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
              <button onClick={onRegisterPet} className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
                <Plus className="h-5 w-5" /><span>Registrar Mascota</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 p-3 rounded-full w-12 h-12"></div>
                  <div><div className="h-8 bg-gray-200 rounded w-16 mb-2"></div><div className="h-4 bg-gray-200 rounded w-32"></div></div>
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
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{mascotas?.length || 0}</p>
                  <p className="text-gray-600">Mascotas Registradas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pets Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-2"><div className="flex-1 h-8 bg-gray-200 rounded"></div><div className="w-16 h-8 bg-gray-200 rounded"></div></div>
              </div>
            ))}
          </div>
        ) : !mascotas || mascotas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes mascotas registradas</h3>
            <p className="text-gray-600 mb-6">Registra tu primera mascota para comenzar a usar nuestros servicios</p>
            <button onClick={onRegisterPet} className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="h-5 w-5" /><span>Registrar Primera Mascota</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mascotas.map(mascota => (
              <PetCard key={mascota.id} mascota={mascota} onEdit={handleEditPet} onDelete={handleDeletePet} />
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && mascotaToDelete && (
        <DeletePetModal
          mascota={mascotaToDelete}
          isDeleting={isDeleting}
          deleteError={deleteError}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {showEditModal && mascotaToEdit && (
        <EditarMascotaModal
          mascota={mascotaToEdit}
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setMascotaToEdit(null); }}
          onSave={handleSaveEditPet}
        />
      )}
    </div>
  );
};

export default MisMascotas;
