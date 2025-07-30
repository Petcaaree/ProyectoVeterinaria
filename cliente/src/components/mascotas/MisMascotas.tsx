import React, { useState } from 'react';
import { ArrowLeft, Plus, PawPrint, Edit, Trash2, Calendar, Weight, Ruler, Heart, Dog, Cat, Bird } from 'lucide-react';

interface MisMascotasProps {
  userType: 'cliente' | 'veterinaria' | 'paseador' | 'cuidador' | null;
  onBack: () => void;
  onRegisterPet: () => void;
}

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  age: number;
  weight: number;
  photos: string[];
  notes: string;
  registeredDate: string;
}

const MisMascotas: React.FC<MisMascotasProps> = ({ userType, onBack, onRegisterPet }) => {
  // Mock data - en una app real vendría de una API
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 28,
      photos: [
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      notes: 'Muy activo, le encanta jugar con pelotas. Alérgico al pollo.',
      registeredDate: '2024-01-10'
    },
    {
      id: '2',
      name: 'Luna',
      species: 'cat',
      breed: 'Siamés',
      age: 2,
      weight: 4,
      photos: [
        'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      notes: 'Tranquila, le gusta dormir en lugares altos. Toma medicamento para la tiroides.',
      registeredDate: '2024-01-05'
    }
  ]);

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'dog': return Dog;
      case 'cat': return Cat;
      case 'bird': return Bird;
      default: return Heart;
    }
  };

  const getSpeciesLabel = (species: string) => {
    switch (species) {
      case 'dog': return 'Perro';
      case 'cat': return 'Gato';
      case 'bird': return 'Ave';
      default: return 'Otro';
    }
  };

  const handleDeletePet = (petId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta mascota? Esta acción no se puede deshacer.')) {
      setPets(prev => prev.filter(pet => pet.id !== petId));
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <PawPrint className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pets.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{pets.filter(p => p.photos.length > 0).length}</p>
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
                  {Math.round(pets.reduce((acc, pet) => acc + pet.age, 0) / pets.length) || 0}
                </p>
                <p className="text-gray-600">Edad Promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pets Grid */}
        {pets.length === 0 ? (
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
            {pets.map((pet) => {
              const SpeciesIcon = getSpeciesIcon(pet.species);
              
              return (
                <div key={pet.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Pet Photo */}
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500 relative">
                    {pet.photos.length > 0 ? (
                      <img
                        src={pet.photos[0]}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SpeciesIcon className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full">
                      <span className="text-xs font-semibold text-gray-700">
                        {pet.photos.length} foto{pet.photos.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Pet Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{pet.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <SpeciesIcon className="h-4 w-4" />
                          <span className="text-sm">{getSpeciesLabel(pet.species)}</span>
                          {pet.breed && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm">{pet.breed}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pet Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pet.age} año{pet.age !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Weight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pet.weight} kg</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {pet.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{pet.notes}</p>
                      </div>
                    )}

                    {/* Photo Gallery Preview */}
                    {pet.photos.length > 1 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Fotos adicionales:</p>
                        <div className="flex space-x-2 overflow-x-auto">
                          {pet.photos.slice(1, 4).map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`${pet.name} ${index + 2}`}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          ))}
                          {pet.photos.length > 4 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-600">+{pet.photos.length - 4}</span>
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
                        onClick={() => handleDeletePet(pet.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Registration Date */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Registrado el {new Date(pet.registeredDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisMascotas;