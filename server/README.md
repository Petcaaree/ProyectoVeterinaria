# PetCare - Backend

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
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/vet

JWT_SECRET=petcare_dev_secret_cambiar_en_produccion
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRY_DAYS=7

CORS_ORIGINS=http://localhost:5173,http://localhost:5174
LOG_LEVEL=debug

# Email (SMTP) - dejar vacio para logs a consola
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=d59b940ecc5ede
SMTP_PASS=15b929bfac8007

FRONTEND_URL=http://localhost:5173

# MercadoPago (credenciales de prueba compartidas del proyecto)
MP_ACCESS_TOKEN=APP_USR-7104584118955328-042016-601ce2850148551d2da1d50f74d58638-3348448081
BACKEND_URL=http://localhost:3000
```

## MercadoPago (sandbox)

El proyecto usa Checkout Pro de MercadoPago en modo sandbox. Las credenciales de prueba estan en el `.env` de arriba.

### Usuario de prueba comprador

Para pagar, abrir una ventana en **modo incognito** y loguearse en https://www.mercadopago.com.ar con:

| Campo | Valor |
|-------|-------|
| Usuario | `TESTUSER5777991134381682422` |
| Contrasena | `OHgF9nIE8p` |

No se puede pagar con una cuenta MP real en sandbox — MP rechaza el pago.

### Tarjetas de prueba

| Resultado | Numero | CVV | Venc | Titular | DNI |
|-----------|--------|-----|------|---------|-----|
| Aprobada | `5031 7557 3453 0604` | 123 | 11/30 | APRO | 12345678 |
| Rechazada | `5031 7557 3453 0604` | 123 | 11/30 | OTHE | 12345678 |
| Pendiente | `5031 7557 3453 0604` | 123 | 11/30 | CONT | 12345678 |

### Webhook (importante)

MercadoPago necesita llegar a `BACKEND_URL/petcare/pagos/webhook` para notificar el resultado del pago. Como `localhost` no es publico, en desarrollo usar [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Copiar la URL `https://xxxx.ngrok.io` que genera y pegarla en el `.env` como `BACKEND_URL`, luego reiniciar el backend. Sin esto, la reserva queda en `PENDIENTE_PAGO` porque el webhook nunca se dispara.

### Flujo de prueba end-to-end

1. Backend corriendo (`npm run dev`) con `BACKEND_URL` apuntando a ngrok.
2. Frontend corriendo (`npm run dev` en `cliente/`).
3. Ventana incognito logueada con el `TESTUSER...`.
4. En PetCare, crear una reserva como cliente → redirige al checkout sandbox.
5. Pagar con tarjeta APRO → volves al front con `?payment_status=approved`.
6. Verificar en Mongo: la reserva pasa a `CONFIRMADA` y el pago queda en `APROBADO`.

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
