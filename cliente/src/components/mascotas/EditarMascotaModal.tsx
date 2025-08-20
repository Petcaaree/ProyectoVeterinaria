import React, { useState } from 'react';
import { Calendar, Weight, X, Plus, Trash2 } from 'lucide-react';

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
  const [nuevaFoto, setNuevaFoto] = useState('');

  if (!isOpen) return null;

  const handleAgregarFoto = () => {
    if (nuevaFoto.trim()) {
      setFotos([...fotos, nuevaFoto.trim()]);
      setNuevaFoto('');
    }
  };

  const handleQuitarFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleGuardar = () => {
    onSave({ ...mascota, edad, peso, fotos });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">Editar Mascota</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input type="number" min={0} value={edad} onChange={e => setEdad(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
              <span className="text-sm">año(s)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <div className="flex items-center space-x-2">
              <Weight className="h-5 w-5 text-gray-400" />
              <input type="number" min={0} value={peso} onChange={e => setPeso(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {fotos.map((foto, idx) => (
                <div key={idx} className="relative">
                  <img src={foto} alt={`Foto ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                  <button onClick={() => handleQuitarFoto(idx)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input type="text" value={nuevaFoto} onChange={e => setNuevaFoto(e.target.value)} placeholder="URL de nueva foto" className="border rounded px-2 py-1 flex-1" />
              <button onClick={handleAgregarFoto} className="bg-green-600 text-white px-3 py-1 rounded flex items-center">
                <Plus className="h-4 w-4 mr-1" /> Agregar
              </button>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cancelar</button>
            <button onClick={handleGuardar} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarMascotaModal;
