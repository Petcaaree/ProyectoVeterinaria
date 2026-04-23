import React from 'react';
import { AlertTriangle, ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface CloudinarySetupProps {
  onClose: () => void;
}

const CloudinarySetup: React.FC<CloudinarySetupProps> = ({ onClose }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Configurar Cloudinary</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>¿Por qué necesito Cloudinary?</strong><br />
                Para que las fotos de las mascotas se vean en cualquier lugar (incluso en Google), 
                necesitamos subirlas a un servicio de almacenamiento en la nube.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">1</span>
                Crear cuenta en Cloudinary
              </h3>
              
              <div className="ml-8 space-y-3">
                <p className="text-gray-700">Ve a Cloudinary y crea una cuenta gratuita:</p>
                <a
                  href="https://cloudinary.com/users/register/free"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Crear cuenta gratis</span>
                </a>
                <p className="text-sm text-gray-600">✅ 25GB gratis • ✅ No requiere tarjeta de crédito</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">2</span>
                Obtener Cloud Name
              </h3>
              
              <div className="ml-8 space-y-3">
                <p className="text-gray-700">En tu Dashboard de Cloudinary, copia el <strong>Cloud Name</strong>:</p>
                <div className="bg-gray-100 p-3 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-600 mb-2">Ejemplo: si tu Cloud Name es "mi-veterinaria"</p>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-sm">VITE_CLOUDINARY_CLOUD_NAME=mi-veterinaria</code>
                    <button
                      onClick={() => copyToClipboard('VITE_CLOUDINARY_CLOUD_NAME=', 'cloudname')}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {copied === 'cloudname' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">3</span>
                Crear Upload Preset
              </h3>
              
              <div className="ml-8 space-y-3">
                <div className="space-y-2">
                  <p className="text-gray-700">Ve a <strong>Settings</strong> → <strong>Upload</strong> → <strong>Upload presets</strong></p>
                  <p className="text-gray-700">Haz clic en <strong>"Add upload preset"</strong> y configura:</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Preset name:</span>
                    <code className="bg-white px-2 py-1 rounded text-sm">mascotas_upload</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Signing Mode:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">Unsigned</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Folder:</span>
                    <code className="bg-white px-2 py-1 rounded text-sm">mascotas</code>
                  </div>
                </div>

                <div className="bg-gray-100 p-3 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-sm">VITE_CLOUDINARY_UPLOAD_PRESET=mascotas_upload</code>
                    <button
                      onClick={() => copyToClipboard('VITE_CLOUDINARY_UPLOAD_PRESET=mascotas_upload', 'preset')}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {copied === 'preset' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">4</span>
                Actualizar archivo .env
              </h3>
              
              <div className="ml-8 space-y-3">
                <p className="text-gray-700">Edita el archivo <code className="bg-gray-100 px-2 py-1 rounded">.env</code> en la carpeta del proyecto:</p>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">cliente/.env</div>
                  <pre className="text-sm">
{`VITE_API_URL=http://localhost:3000

# Configuración de Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name-real
VITE_CLOUDINARY_UPLOAD_PRESET=mascotas_upload`}
                  </pre>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>⚠️ Importante:</strong> Después de editar el .env, reinicia el servidor con <code>npm run dev</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudinarySetup;
