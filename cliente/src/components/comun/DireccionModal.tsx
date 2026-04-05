import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

interface Ciudad {
  id: string;
  nombre: string;
  provincia: string;
}

interface Localidad {
  id: string;
  nombre: string;
}

interface DireccionData {
  calle: string;
  altura: string;
  localidad: {
    nombre: string;
    ciudad: {
      nombre: string;
    };
  };
}

interface DireccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (direccion: DireccionData) => void;
}

const DireccionModal: React.FC<DireccionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [nuevaDireccion, setNuevaDireccion] = useState({ ciudad: '', localidad: '', calle: '', altura: '' });
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadInput, setCiudadInput] = useState('');
  const [showCiudadesDropdown, setShowCiudadesDropdown] = useState(false);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<Ciudad | null>(null);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [localidadInput, setLocalidadInput] = useState('');
  const [showLocalidadesDropdown, setShowLocalidadesDropdown] = useState(false);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState<Localidad | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('https://apis.datos.gob.ar/georef/api/municipios?provincia=buenos%20aires&campos=id,nombre&max=500').then(r => r.json()),
      fetch('https://apis.datos.gob.ar/georef/api/municipios?provincia=ciudad%20autonoma%20de%20buenos%20aires&campos=id,nombre&max=100').then(r => r.json())
    ]).then(([ba, caba]) => {
      const municipiosBA = (ba.municipios || []).map((m: { id: string; nombre: string }) => ({ id: m.id, nombre: m.nombre, provincia: 'buenos aires' }));
      const municipiosCABA = [{ id: '02000', nombre: 'Ciudad Autónoma de Buenos Aires', provincia: 'caba' }];
      setCiudades([...municipiosBA, ...municipiosCABA]);
    });
  }, []);

  useEffect(() => {
    if (!ciudadSeleccionada) {
      setLocalidades([]);
      setLocalidadSeleccionada(null);
      setLocalidadInput('');
      return;
    }
    if (ciudadSeleccionada.provincia === 'caba' || ciudadSeleccionada.id === '02000') {
      const barriosCABA = [
        { id: '1', nombre: 'Agronomía' }, { id: '2', nombre: 'Almagro' }, { id: '3', nombre: 'Balvanera' },
        { id: '4', nombre: 'Barracas' }, { id: '5', nombre: 'Belgrano' }, { id: '6', nombre: 'Boedo' },
        { id: '7', nombre: 'Caballito' }, { id: '8', nombre: 'Chacarita' }, { id: '9', nombre: 'Coghlan' },
        { id: '10', nombre: 'Colegiales' }, { id: '11', nombre: 'Constitución' }, { id: '12', nombre: 'Flores' },
        { id: '13', nombre: 'Floresta' }, { id: '14', nombre: 'La Boca' }, { id: '15', nombre: 'La Paternal' },
        { id: '16', nombre: 'Liniers' }, { id: '17', nombre: 'Mataderos' }, { id: '18', nombre: 'Monte Castro' },
        { id: '19', nombre: 'Monserrat' }, { id: '20', nombre: 'Nueva Pompeya' }, { id: '21', nombre: 'Núñez' },
        { id: '22', nombre: 'Palermo' }, { id: '23', nombre: 'Parque Avellaneda' }, { id: '24', nombre: 'Parque Chacabuco' },
        { id: '25', nombre: 'Parque Chas' }, { id: '26', nombre: 'Parque Patricios' }, { id: '27', nombre: 'Puerto Madero' },
        { id: '28', nombre: 'Recoleta' }, { id: '29', nombre: 'Retiro' }, { id: '30', nombre: 'Saavedra' },
        { id: '31', nombre: 'San Cristóbal' }, { id: '32', nombre: 'San Nicolás' }, { id: '33', nombre: 'San Telmo' },
        { id: '34', nombre: 'Vélez Sarsfield' }, { id: '35', nombre: 'Versalles' }, { id: '36', nombre: 'Villa Crespo' },
        { id: '37', nombre: 'Villa del Parque' }, { id: '38', nombre: 'Villa Devoto' }, { id: '39', nombre: 'Villa General Mitre' },
        { id: '40', nombre: 'Villa Lugano' }, { id: '41', nombre: 'Villa Luro' }, { id: '42', nombre: 'Villa Ortúzar' },
        { id: '43', nombre: 'Villa Pueyrredón' }, { id: '44', nombre: 'Villa Real' }, { id: '45', nombre: 'Villa Riachuelo' },
        { id: '46', nombre: 'Villa Santa Rita' }, { id: '47', nombre: 'Villa Soldati' }, { id: '48', nombre: 'Villa Urquiza' }
      ];
      setLocalidades(barriosCABA);
    } else {
      fetch(`https://apis.datos.gob.ar/georef/api/localidades?municipio=${encodeURIComponent(ciudadSeleccionada.nombre)}&provincia=buenos%20aires&max=100`)
        .then(r => r.json())
        .then(data => {
          setLocalidades((data.localidades || []).map((l: { id: string; nombre: string }) => ({ id: l.id, nombre: l.nombre })));
        });
    }
    setLocalidadSeleccionada(null);
    setLocalidadInput('');
  }, [ciudadSeleccionada]);

  const handleGuardar = () => {
    const direccion: DireccionData = {
      calle: nuevaDireccion.calle,
      altura: nuevaDireccion.altura,
      localidad: {
        nombre: localidadSeleccionada ? localidadSeleccionada.nombre : (typeof nuevaDireccion.localidad === 'string' ? nuevaDireccion.localidad : ''),
        ciudad: {
          nombre: ciudadSeleccionada ? ciudadSeleccionada.nombre : (typeof nuevaDireccion.ciudad === 'string' ? nuevaDireccion.ciudad : '')
        }
      }
    };
    onSave(direccion);
  };

  const clearCiudad = () => {
    setCiudadSeleccionada(null);
    setCiudadInput('');
    setLocalidades([]);
    setLocalidadSeleccionada(null);
    setLocalidadInput('');
  };

  const clearLocalidad = () => {
    setLocalidadSeleccionada(null);
    setLocalidadInput('');
  };

  const filteredCiudades = ciudades.filter(c => c.nombre.toLowerCase().includes(ciudadInput.toLowerCase())).slice(0, 10);
  const filteredLocalidades = localidades.filter(l => l.nombre.toLowerCase().includes(localidadInput.toLowerCase())).slice(0, 10);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-[100]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-[99]"
      ariaHideApp={false}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg relative">
        <h2 className="text-xl font-bold mb-4">Agregar nueva dirección</h2>

        {/* Ciudad */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <div className="relative" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              value={ciudadSeleccionada ? ciudadSeleccionada.nombre : ciudadInput}
              onChange={e => { if (!ciudadSeleccionada) { setCiudadInput(e.target.value); setShowCiudadesDropdown(true); } }}
              onFocus={() => setShowCiudadesDropdown(true)}
              onBlur={() => setTimeout(() => setShowCiudadesDropdown(false), 150)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ciudad"
              autoComplete="off"
              readOnly={!!ciudadSeleccionada}
            />
            {(ciudadSeleccionada || ciudadInput) && (
              <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500" onClick={clearCiudad} tabIndex={-1}>
                <span>✕</span>
              </button>
            )}
            {showCiudadesDropdown && !ciudadSeleccionada && (
              <ul className="absolute z-20 left-0 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto mt-1">
                {filteredCiudades.map(c => (
                  <li key={c.id} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => { setCiudadInput(c.nombre); setCiudadSeleccionada(c); }}>
                    {c.nombre}
                  </li>
                ))}
                {filteredCiudades.length === 0 && <li className="px-3 py-2 text-gray-400">No se encontraron ciudades</li>}
              </ul>
            )}
          </div>
        </div>

        {/* Localidad */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
          <div className="relative" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              value={localidadSeleccionada ? localidadSeleccionada.nombre : localidadInput}
              onChange={e => { if (!localidadSeleccionada) { setLocalidadInput(e.target.value); setShowLocalidadesDropdown(true); } }}
              onFocus={() => setShowLocalidadesDropdown(true)}
              onBlur={() => setTimeout(() => setShowLocalidadesDropdown(false), 150)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Localidad"
              autoComplete="off"
              readOnly={!!localidadSeleccionada}
              disabled={!ciudadSeleccionada}
            />
            {(localidadSeleccionada || localidadInput) && (
              <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500" onClick={clearLocalidad} tabIndex={-1}>
                <span>✕</span>
              </button>
            )}
            {showLocalidadesDropdown && !localidadSeleccionada && (
              <ul className="absolute z-20 left-0 w-full bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-y-auto mt-1">
                {filteredLocalidades.map(l => (
                  <li key={l.id} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => { setLocalidadInput(l.nombre); setLocalidadSeleccionada(l); }}>
                    {l.nombre}
                  </li>
                ))}
                {filteredLocalidades.length === 0 && <li className="px-3 py-2 text-gray-400">No se encontraron localidades</li>}
              </ul>
            )}
          </div>
        </div>

        {/* Calle */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
          <input type="text" value={nuevaDireccion.calle} onChange={e => setNuevaDireccion(prev => ({ ...prev, calle: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" style={{ maxWidth: '400px' }} placeholder="Calle" required />
        </div>

        {/* Altura */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
          <input type="text" value={nuevaDireccion.altura} onChange={e => setNuevaDireccion(prev => ({ ...prev, altura: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" style={{ maxWidth: '400px' }} placeholder="Altura" required />
        </div>

        <div className="flex justify-end mt-6">
          <button type="button" className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2" onClick={onClose}>Cancelar</button>
          <button type="button" className="px-6 py-2 bg-blue-600 text-white rounded-lg" onClick={handleGuardar} disabled={!(ciudadSeleccionada && localidadSeleccionada && nuevaDireccion.calle && nuevaDireccion.altura)}>Guardar dirección</button>
        </div>
      </div>
    </Modal>
  );
};

export default DireccionModal;
