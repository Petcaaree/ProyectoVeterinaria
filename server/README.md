# PetConnect - Backend

## Requisitos

- Node.js 18+
- MongoDB

## Instalacion

```bash
cd server
npm install
```

## Variables de entorno

Crear archivo `.env` en la carpeta `server/` con:

```env
MONGODB_URI=mongodb://localhost:27017/petconnect
JWT_SECRET=tu_jwt_secret
MERCADOPAGO_ACCESS_TOKEN=tu_token_mp
```

## Ejecucion

```bash
npm start
```

## Seed de datos

Para poblar la base de datos con datos de prueba (incluyendo el usuario admin):

```bash
npm run seed
```

## Panel de Administracion

### Acceso

El panel de admin no es accesible desde el login regular. Para acceder:

1. Navegar a `http://localhost:5173/?admin=true`
2. Se mostrara el formulario de login de administracion

### Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Email | `admin@petconnect.com` |
| Password | `Test1234!` |

> Las credenciales se crean automaticamente al ejecutar el seed (`npm run seed`).

### Funcionalidades del Admin

- **Dashboard**: Metricas en tiempo real (usuarios, reservas, ingresos, servicios activos)
- **Gestion de Usuarios**: Ver, suspender, reactivar y eliminar usuarios de todos los roles
- **Gestion de Servicios**: Ver, activar y desactivar servicios de veterinarias, paseadores y cuidadores
- **Configuracion**: Ajustar comision porcentual y fija del sistema

### Endpoints Admin

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/petcare/login/admin` | Login admin |
| GET | `/petcare/admin/metricas` | Dashboard metricas |
| GET | `/petcare/admin/usuarios/:tipo` | Listar usuarios |
| PUT | `/petcare/admin/usuarios/:tipo/:id/suspender` | Suspender usuario |
| PUT | `/petcare/admin/usuarios/:tipo/:id/reactivar` | Reactivar usuario |
| DELETE | `/petcare/admin/usuarios/:tipo/:id` | Eliminar usuario |
| GET | `/petcare/admin/servicios/:tipo` | Listar servicios |
| PUT | `/petcare/admin/servicios/:tipo/:id/moderar` | Moderar servicio |
| GET | `/petcare/admin/configuracion` | Ver configuracion |
| PUT | `/petcare/admin/configuracion` | Actualizar configuracion |
