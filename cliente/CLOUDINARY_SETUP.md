# 📸 Configuración de Cloudinary para Subida de Imágenes

Este proyecto usa **Cloudinary** como servicio de almacenamiento de imágenes para obtener URLs públicas que funcionen en cualquier lugar.

## 🚀 Configuración Rápida

### 1. Crear Cuenta en Cloudinary
1. Ve a [https://cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita (incluye 25GB de almacenamiento)
3. Ve al **Dashboard** después del registro

### 2. Obtener Credenciales
En tu Dashboard de Cloudinary encontrarás:
- **Cloud Name**: `dxxxxx` (ejemplo: `mi-veterinaria`)
- **API Key**: No lo necesitas para upload presets públicos
- **API Secret**: No lo necesitas para upload presets públicos

### 3. Crear Upload Preset
1. Ve a **Settings** > **Upload** en tu dashboard
2. Scroll hacia abajo hasta **Upload presets**
3. Haz clic en **Add upload preset**
4. Configura:
   - **Preset name**: `mascotas_upload` (o el nombre que prefieras)
   - **Signing Mode**: **Unsigned** (importante para uso desde frontend)
   - **Folder**: `mascotas` (opcional, para organizar)
   - **Access Mode**: **Public**
   - **Resource Type**: **Image**
5. Guarda el preset

### 4. Configurar Variables de Entorno
1. Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name-aqui
   VITE_CLOUDINARY_UPLOAD_PRESET=mascotas_upload
   ```

### 5. Reiniciar el Servidor
```bash
npm run dev
```

## ✅ Verificar Configuración

Si todo está bien configurado:
- ✅ No verás errores en la consola del navegador
- ✅ Al subir imágenes se mostrarán URLs tipo: `https://res.cloudinary.com/tu-cloud/image/upload/v1234567890/mascotas/abc123.jpg`
- ✅ Estas URLs funcionarán en cualquier navegador y se pueden compartir

## 🔧 Solución de Problemas

### Error: "Cloudinary no configurado"
- Verifica que el archivo `.env` existe en la raíz del proyecto cliente
- Verifica que las variables empiecen con `VITE_`
- Reinicia el servidor con `npm run dev`

### Error: "Upload failed"
- Verifica que el **Upload Preset** sea **Unsigned**
- Verifica que el nombre del preset coincida con el `.env`
- Verifica que tu Cloud Name sea correcto

### Error: "Invalid cloud name"
- El Cloud Name debe ser exactamente como aparece en tu Dashboard
- No incluyas espacios ni caracteres especiales

## 🌐 URLs Resultantes

Las imágenes subidas tendrán URLs públicas como:
```
https://res.cloudinary.com/tu-cloud-name/image/upload/v1640995200/mascotas/perro-123.jpg
```

Estas URLs:
- ✅ Son públicas y permanentes
- ✅ Funcionan en cualquier navegador
- ✅ Se pueden compartir por WhatsApp, email, etc.
- ✅ Tienen CDN global para carga rápida
- ✅ Se pueden abrir en Google Images

## 💡 Alternativas

Si no quieres usar Cloudinary, puedes configurar otros servicios:
- **Imgur**: Gratis, fácil setup
- **AWS S3**: Más control, requiere configuración
- **Firebase Storage**: Integrado con Google
- **Supabase Storage**: Open source

¿Necesitas ayuda? Revisa la [documentación de Cloudinary](https://cloudinary.com/documentation) o pregunta al equipo.
