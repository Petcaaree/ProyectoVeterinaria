// Servicio para subir imágenes a Cloudinary
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
// Endpoint genérico (detecta si es imagen o raw/PDF)
const CLOUDINARY_URL_AUTO = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Función para verificar configuración
const PLACEHOLDERS = ['tu-cloud-name-aqui', 'tu-upload-preset-aqui', 'tu_cloud_name', 'tu_upload_preset'];
const isCloudinaryConfigured = (): boolean => {
  return !!(CLOUDINARY_CLOUD_NAME &&
           UPLOAD_PRESET &&
           !PLACEHOLDERS.includes(CLOUDINARY_CLOUD_NAME) &&
           !PLACEHOLDERS.includes(UPLOAD_PRESET));
};

// Validar que las variables de entorno estén configuradas
if (!isCloudinaryConfigured()) {
  console.warn('⚠️ Cloudinary no configurado correctamente.');
  console.warn('📋 Pasos para configurar:');
  console.warn('1. Ve a https://cloudinary.com y crea una cuenta');
  console.warn('2. Copia tu Cloud Name del dashboard');
  console.warn('3. Crea un Upload Preset "unsigned"');
  console.warn('4. Actualiza el archivo .env con tus credenciales');
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  // Estos solo vienen para imágenes (resource_type === "image"); en raw/PDF Cloudinary los omite.
  format?: string;
  width?: number;
  height?: number;
  folder?: string;
  original_filename: string;
}

/**
 * Sube una imagen a Cloudinary y devuelve la URL pública
 * @param file - Archivo de imagen a subir
 * @param folder - Carpeta opcional donde guardar la imagen
 * @returns Promise con la respuesta de Cloudinary
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder: string = 'mascotas'
): Promise<CloudinaryResponse> => {
  // Verificar configuración antes de intentar subir
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary no está configurado. Por favor configura las variables de entorno VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error uploading image: ${response.statusText}`);
    }

    const data: CloudinaryResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Sube múltiples imágenes a Cloudinary
 * @param files - Array de archivos a subir
 * @param folder - Carpeta opcional donde guardar las imágenes
 * @returns Promise con array de URLs públicas
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'mascotas'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file, folder));
    const responses = await Promise.all(uploadPromises);
    return responses.map(response => response.secure_url);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Sube un documento (imagen o PDF) a Cloudinary usando el endpoint auto/upload.
 * Soporta cualquier tipo (image, raw) y devuelve la URL segura.
 */
export const uploadDocumentToCloudinary = async (
  file: File,
  folder: string = 'verificaciones'
): Promise<CloudinaryResponse> => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary no está configurado. Configurá VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(CLOUDINARY_URL_AUTO, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al subir archivo: ${response.statusText}`);
  }

  return response.json();
};
