# PetCare - Informe de Auditoria Tecnica y Roadmap a Produccion

**Fecha:** 2026-03-23
**Autor:** Auditoria CTO / Lead Architect
**Alcance:** Full-stack (Frontend React + Backend Express/MongoDB)

---

## 1. AUDITORIA DE FUNCIONALIDADES ACTUALES

### 1.1 Consistencia Schemas (Mongoose) vs Tipos (TypeScript)

| Campo | Backend (Schema) | Frontend (Type) | Estado |
|-------|-----------------|-----------------|--------|
| ID de usuario | `_id` (ObjectId, auto) | `id: string` en `auth.ts` | DESALINEADO - frontend usa `id`, backend genera `_id` |
| Localidad (direccion) | `ObjectId` ref a Localidad | `{ nombre: string; ciudad: string }` en `auth.ts` | DESALINEADO - frontend envio objeto anidado, backend espera ObjectId |
| Notificacion._id | ObjectId auto | `_id: string` en `auth.ts` | OK |
| Mascota._id | ObjectId auto | `_id: string` en `auth.ts` | OK |
| EstadoReserva | enum `["PENDIENTE","CONFIRMADA","CANCELADA","COMPLETADA"]` | Hardcoded strings en MisTurnos | OK pero sin enum compartido |
| TipoServicio (Vet) | enum `["Control","Vacunacion",...]` | Hardcoded array en CrearServicio | OK pero duplicado, propenso a errores |
| duracionMinutos (Vet) | `min: 30, max: 480` | Validacion frontend `min: 30, max: 120` | DESALINEADO - frontend limita a 120, backend permite 480 |
| duracionMinutos (Paseador) | `min: 30, max: 120` | Validacion frontend `min: 30, max: 120` | OK |

**Hallazgo critico:** El tipo `Localidad` en el frontend (`auth.ts` linea 4-6) define `ciudad: string` pero `authContext.tsx` y `CrearServicio.tsx` envian `ciudad: { nombre: string }`. El backend espera un ObjectId referencia. Hay 3 representaciones distintas del mismo campo.

---

### 1.2 RBAC - Analisis de Seguridad

#### VEREDICTO: EL RBAC ES INEXISTENTE EN EL BACKEND

| Capa | Proteccion | Estado |
|------|-----------|--------|
| Rutas (Express) | Middleware de autenticacion JWT/Session | NO EXISTE |
| Controladores | Validacion de rol del usuario | NO EXISTE |
| Servicios | Validacion de ownership por `nombreUsuario` | PARCIAL (solo en `modificarEstado`) |
| Frontend | Guard de componentes por `userType` | EXISTE pero es solo cosmético |

**Vulnerabilidades demostradas:**

```
# Cualquier persona con curl puede:

# 1. Ver las reservas de CUALQUIER cliente
curl GET /petcare/reservas/cliente/{cualquier-id}/TODAS

# 2. Agregar mascotas a CUALQUIER cuenta
curl POST /petcare/cliente/{cualquier-id}/mascota

# 3. Cancelar/confirmar CUALQUIER reserva
curl PUT /petcare/reservas/{cualquier-userId}/{cualquier-reservaId}/CANCELADA

# 4. Crear servicios como CUALQUIER proveedor
curl POST /petcare/servicio-veterinaria

# 5. Ver TODAS las reservas del sistema
curl GET /petcare/reservas
```

**Dependencias de seguridad faltantes:**
- No hay `jsonwebtoken` (JWT) en package.json
- No hay `bcrypt` o `argon2` para hashing de contrasenas
- No hay `passport` o middleware de autenticacion
- No hay `helmet` para headers de seguridad
- No hay `express-rate-limit` para rate limiting
- Las contrasenas se almacenan y comparan en TEXTO PLANO

---

### 1.3 Gestion de Estado en authContext.tsx

**Problemas detectados:**

| # | Problema | Severidad | Linea |
|---|---------|-----------|-------|
| 1 | Doble llamada a `obtenerContadorNotificacionesNoLeidas` en mount | MEDIA | 41-62 |
| 2 | No hay cleanup en useEffects con llamadas async | MEDIA | 29-70 |
| 3 | `cargarContadorNotificaciones` puede causar loop en Notificaciones.tsx | MEDIA | useEffect depende de `contadorNotificacionesNoLeidas` |
| 4 | 508 lineas en un solo archivo - excesiva responsabilidad | BAJA | Todo el archivo |
| 5 | Funciones API wrapeadas innecesariamente (el contexto re-wrappea lo que ya hace api.js) | BAJA | 179-320 |

**Redundancia API en MisTurnos.tsx:**
- Cada cambio de pagina dispara 6 llamadas API (5 para totales + 1 para datos).
- `cargarTotales()` deberia ejecutarse SOLO cuando cambia el usuario, no en cada cambio de pagina/filtro.

---

## 2. GAPS PARA SALIDA AL MERCADO (MVP)

### 2.1 Pasarela de Pagos (Stripe / MercadoPago)

**Punto de integracion recomendado:**

```
Flujo actual:
Cliente -> CrearReserva -> reservaService.create() -> Estado: PENDIENTE

Flujo con pagos:
Cliente -> CrearReserva -> Redirigir a checkout -> Webhook confirma pago -> Estado: PENDIENTE
```

**Implementacion sugerida:**

1. **Nuevo schema:** `pagoSchema.js`
```javascript
{
  reserva: { type: ObjectId, ref: "Reserva", required: true },
  monto: { type: Number, required: true },
  moneda: { type: String, default: "ARS" },
  estado: { type: String, enum: ["PENDIENTE","APROBADO","RECHAZADO","REEMBOLSADO"] },
  proveedorPago: { type: String, enum: ["mercadopago","stripe"] },
  idTransaccionExterna: { type: String },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date }
}
```

2. **Nuevas rutas:**
   - `POST /petcare/pagos/crear-preferencia` - Crea preferencia de MP
   - `POST /petcare/webhooks/mercadopago` - Webhook de confirmacion
   - `GET /petcare/pagos/reserva/:idReserva` - Estado del pago

3. **Donde integrar en el frontend:**
   - Despues del paso de confirmacion de reserva en el componente que maneja la creacion
   - Redirigir al checkout de MercadoPago
   - Pagina de callback `/pago-exitoso` y `/pago-fallido`

**Recomendacion:** MercadoPago por ser mercado argentino (basado en la API de georef argentina usada).

---

### 2.2 Sistema de Reviews/Ratings

**Schema propuesto:** `reviewSchema.js`

```javascript
{
  autor: { type: ObjectId, ref: "Cliente", required: true },
  destinatario: { type: ObjectId, refPath: "tipoDestinatario", required: true },
  tipoDestinatario: { type: String, enum: ["Veterinaria","Paseador","Cuidador"], required: true },
  reserva: { type: ObjectId, ref: "Reserva", required: true, unique: true },
  puntuacion: { type: Number, required: true, min: 1, max: 5 },
  comentario: { type: String, maxlength: 500 },
  respuestaProveedor: { type: String, maxlength: 300 },
  fechaCreacion: { type: Date, default: Date.now }
}
```

**Indices necesarios:**
```javascript
reviewSchema.index({ destinatario: 1, puntuacion: -1 });
reviewSchema.index({ reserva: 1 }, { unique: true }); // 1 review por reserva
reviewSchema.index({ autor: 1 });
```

**Integracion:**
- Solo permitir reviews cuando `reserva.estado === "COMPLETADA"`
- Agregar campo calculado `puntuacionPromedio` en schemas de proveedores
- Mostrar estrellas en las tarjetas de servicios del Home

---

### 2.3 Chat/Mensajeria

**Recomendacion: Socket.io para MVP, migrar a servicio externo despues**

| Opcion | Pros | Contras | Costo |
|--------|------|---------|-------|
| Socket.io (self-hosted) | Control total, gratis, integracion directa con Express | Requiere infra para WebSockets, no escala sin Redis | $0 |
| Firebase Realtime DB | Rapido de implementar, escala bien | Vendor lock-in, costos crecen | $0-25/mes |
| Stream Chat | SDK listo, UI components | Caro a escala | $100+/mes |

**Implementacion Socket.io sugerida:**

```javascript
// server.js - agregar:
import { Server as SocketIO } from "socket.io";
const io = new SocketIO(httpServer, { cors: { origin: [...] } });

io.on("connection", (socket) => {
  socket.join(`user_${socket.handshake.auth.userId}`);
  socket.on("mensaje", (data) => {
    io.to(`user_${data.destinatarioId}`).emit("nuevoMensaje", data);
  });
});
```

**Schema:** `mensajeSchema.js`
```javascript
{
  remitente: { type: ObjectId, refPath: "tipoRemitente" },
  tipoRemitente: { type: String, enum: ["Cliente","Veterinaria","Paseador","Cuidador"] },
  destinatario: { type: ObjectId, refPath: "tipoDestinatario" },
  tipoDestinatario: { type: String, enum: ["Cliente","Veterinaria","Paseador","Cuidador"] },
  reserva: { type: ObjectId, ref: "Reserva" },
  contenido: { type: String, required: true, maxlength: 1000 },
  leido: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now }
}
```

---

## 3. ANALISIS DE ESCALABILIDAD TECNICA

### 3.1 Indices de MongoDB Necesarios

```javascript
// reservaSchema - las queries mas frecuentes
reservaSchema.index({ cliente: 1, estado: 1 });           // findByClienteByEstado
reservaSchema.index({ servicioReservado: 1, estado: 1 });  // findByProveedorByEstado
reservaSchema.index({ estado: 1, "rangoFechas.fechaInicio": 1 }); // recordatorios
reservaSchema.index({ fechaAlta: -1 });                    // ordenar por recientes

// servicioVeterinariaSchema
servicioVeterinariaSchema.index({ usuarioProveedor: 1, estado: 1 });
servicioVeterinariaSchema.index({ tipoServicio: 1, estado: 1 });
servicioVeterinariaSchema.index({ "direccion.localidad": 1 });     // busqueda por zona

// servicioPaseadorSchema
servicioPaseadorSchema.index({ usuarioProveedor: 1, estado: 1 });
servicioPaseadorSchema.index({ "direccion.localidad": 1 });

// servicioCuidadorSchema
servicioCuidadorSchema.index({ usuarioProveedor: 1, estado: 1 });
servicioCuidadorSchema.index({ "direccion.localidad": 1 });

// clienteSchema
clienteSchema.index({ email: 1 }, { unique: true }); // ya existe implicito
```

**Impacto estimado:** Sin indices, las queries de `findByCliente` y `findByProveedor` hacen full collection scan. Con 10k+ reservas, los tiempos de respuesta superarian 1 segundo.

---

### 3.2 Performance Frontend - Re-renders

| Componente | Problema | Impacto | Solucion |
|------------|---------|---------|----------|
| MisTurnos | 6 API calls por cambio de pagina | ALTO | Separar `cargarTotales` del useEffect de pagina |
| MisTurnos | console.log en cada render de appointment (lineas 407-410) | MEDIO | Eliminar logs de debug en produccion |
| Notificaciones | useEffect depende de `contadorNotificacionesNoLeidas` | MEDIO | Usar ref para evitar re-fetch innecesario |
| authContext | Wrap innecesario de funciones API | BAJO | Las funciones del contexto solo re-wrappean api.js |
| App.tsx | `renderContent()` crea componentes inline | BAJO | Extraer a componentes memoizados |
| CrearServicio | 2 fetch de ciudades/localidades en cada mount | BAJO | Cache en memoria o useSWR |

**Recomendacion inmediata:**
```typescript
// MisTurnos.tsx - separar effects
useEffect(() => {
  fetchReservas();
}, [userId, tipoUsuario, filter, page]);

useEffect(() => {
  cargarTotales(); // Solo cuando cambia usuario
}, [userId, tipoUsuario]);
```

---

### 3.3 Infraestructura - Logs y Monitoreo

**Estado actual:** Un unico `console.log` en el middleware de request (index.js).

**Estrategia recomendada:**

| Capa | Herramienta | Costo |
|------|------------|-------|
| Logging estructurado | `pino` o `winston` | Gratis |
| Monitoreo APM | Sentry (free tier: 5k events/mes) | $0-26/mes |
| Uptime monitoring | UptimeRobot o Better Stack | $0 |
| DB monitoring | MongoDB Atlas (si migran de local) | $0-57/mes |
| Error tracking frontend | Sentry Browser SDK | Incluido |

**Implementacion minima:**
```javascript
// Reemplazar console.log por logger estructurado
import pino from "pino";
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Middleware de request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start
    });
  });
  next();
});
```

---

## 4. LISTA DE CORRECCIONES CRITICAS

### Severidad ALTA (Bloqueantes para produccion)

| # | Descripcion | Archivo(s) | Esfuerzo |
|---|------------|-----------|----------|
| A1 | **Contrasenas en texto plano** - No hay bcrypt/argon2. Se comparan con `!=` | clienteSchema, servicios de login | 4h |
| A2 | **Sin autenticacion JWT** - Ninguna ruta esta protegida. Cualquiera accede a todo | Nuevo middleware + todas las rutas | 8h |
| A3 | **Sin RBAC en backend** - Un cliente puede crear servicios, un proveedor puede ver reservas ajenas | Nuevo middleware de roles | 4h |
| A4 | **Sin helmet ni rate-limiting** - Vulnerable a DDoS, XSS, clickjacking | index.js | 1h |
| A5 | **MongoDB URI hardcodeado** - `mongodb://localhost:27017/vet` en database.js | database.js | 0.5h |
| A6 | **CORS demasiado permisivo** - Incluye dominio Vercel de otro proyecto | index.js | 0.5h |

### Severidad MEDIA (Afectan UX y estabilidad)

| # | Descripcion | Archivo(s) | Esfuerzo |
|---|------------|-----------|----------|
| M1 | **6 API calls por cambio de pagina** en MisTurnos | MisTurnos.tsx | 1h |
| M2 | **Desalineacion de tipos** Localidad (3 representaciones distintas) | auth.ts, authContext, schemas | 2h |
| M3 | **duracionMinutos** frontend limita a 120 para vets, backend permite 480 | CrearServicio.tsx | 0.5h |
| M4 | **Doble llamada** a contador de notificaciones al inicializar | authContext.tsx | 0.5h |
| M5 | **console.log de debug** en produccion (MisTurnos, CrearServicio, etc.) | Multiples archivos | 1h |
| M6 | **Missing cleanup** en useEffects con async calls | MisTurnos, Notificaciones | 1h |
| M7 | **Enums duplicados** - TipoServicio hardcodeado en frontend y backend por separado | CrearServicio.tsx | 1h |

### Severidad BAJA (Deuda tecnica)

| # | Descripcion | Archivo(s) | Esfuerzo |
|---|------------|-----------|----------|
| B1 | authContext.tsx tiene 508 lineas, deberia dividirse | authContext.tsx | 3h |
| B2 | Tipos en `types/index.ts` en ingles, no se usan | types/index.ts | 0.5h |
| B3 | Demo users hardcodeados en Encabezado.tsx | Encabezado.tsx | 0.5h |
| B4 | `smoothScrollToTop` duplicada en App.tsx | App.tsx | 0.5h |
| B5 | Fallback `http://localhost:3000` en api.js para produccion | api.js | 0.5h |

---

## 5. ROADMAP - SPRINT PLAN (30 DIAS)

### SPRINT 1 (Dias 1-7): Seguridad Critica
**Objetivo:** Hacer la app segura para despliegue.

| Tarea | Prioridad | Esfuerzo | Tickets |
|-------|-----------|----------|---------|
| Implementar bcrypt para hash de contrasenas | CRITICA | 4h | A1 |
| Crear middleware JWT (login genera token, rutas lo validan) | CRITICA | 8h | A2 |
| Crear middleware de RBAC (verificar rol en cada ruta) | CRITICA | 4h | A3 |
| Instalar y configurar helmet + rate-limit + cors fix | CRITICA | 2h | A4, A6 |
| Mover config a variables de entorno (.env) | CRITICA | 1h | A5 |
| Enviar Authorization header desde frontend (api.js) | CRITICA | 2h | Complemento A2 |
| **Total Sprint 1** | | **21h** | |

**Entregable:** Backend seguro con autenticacion JWT + RBAC + contrasenas hasheadas.

---

### SPRINT 2 (Dias 8-14): Estabilidad y Performance
**Objetivo:** Corregir bugs de UX y optimizar rendimiento.

| Tarea | Prioridad | Esfuerzo | Tickets |
|-------|-----------|----------|---------|
| Separar useEffect de totales vs paginacion en MisTurnos | ALTA | 1h | M1 |
| Unificar tipo Localidad (frontend + backend) | ALTA | 2h | M2 |
| Corregir duracionMinutos max para veterinarias en frontend | MEDIA | 0.5h | M3 |
| Eliminar doble llamada de notificaciones en mount | MEDIA | 0.5h | M4 |
| Limpiar console.logs de debug | MEDIA | 1h | M5 |
| Agregar cleanup en useEffects async | MEDIA | 1h | M6 |
| Centralizar enums en archivo compartido | MEDIA | 1h | M7 |
| Agregar indices MongoDB | ALTA | 2h | Sec 3.1 |
| Implementar logging con pino | MEDIA | 2h | Sec 3.3 |
| **Total Sprint 2** | | **11h** | |

**Entregable:** App estable sin memory leaks, queries optimizadas, logs estructurados.

---

### SPRINT 3 (Dias 15-22): Features MVP
**Objetivo:** Agregar funcionalidades de marketplace.

| Tarea | Prioridad | Esfuerzo | Tickets |
|-------|-----------|----------|---------|
| Schema + CRUD de Reviews | ALTA | 6h | Sec 2.2 |
| Componente de estrellas + formulario de review | ALTA | 4h | Sec 2.2 |
| Puntuacion promedio en tarjetas de servicios | MEDIA | 2h | Sec 2.2 |
| Schema + CRUD de Pagos | ALTA | 4h | Sec 2.1 |
| Integracion MercadoPago (crear preferencia + webhook) | ALTA | 8h | Sec 2.1 |
| Flujo de pago en frontend (redirect + callbacks) | ALTA | 4h | Sec 2.1 |
| **Total Sprint 3** | | **28h** | |

**Entregable:** Usuarios pueden pagar reservas y dejar reviews.

---

### SPRINT 4 (Dias 23-30): Polish y Deploy
**Objetivo:** Preparar deploy y calidad final.

| Tarea | Prioridad | Esfuerzo | Tickets |
|-------|-----------|----------|---------|
| Configurar MongoDB Atlas (produccion) | ALTA | 2h | |
| Deploy backend en Railway/Render | ALTA | 2h | |
| Deploy frontend en Vercel | ALTA | 1h | |
| Configurar variables de entorno en produccion | ALTA | 1h | |
| Setup Sentry (error tracking) | MEDIA | 2h | Sec 3.3 |
| Tests de integracion para flujo critico (reserva + pago) | ALTA | 6h | |
| Refactor authContext (dividir en hooks) | BAJA | 3h | B1 |
| Limpiar tipos muertos y deuda tecnica | BAJA | 2h | B2-B5 |
| **Total Sprint 4** | | **19h** | |

**Entregable:** App desplegada en produccion con monitoreo.

---

## RESUMEN EJECUTIVO

| Metrica | Valor |
|---------|-------|
| Lineas de codigo auditadas | ~6,000+ (frontend + backend) |
| Bugs criticos encontrados | 6 (seguridad) |
| Bugs medios encontrados | 7 (UX/estabilidad) |
| Deuda tecnica | 5 items |
| Esfuerzo total estimado | ~79 horas |
| Tiempo con equipo de 2 devs | 30 dias (4h/dia efectivas) |

**Conclusion:** La aplicacion tiene una base funcional solida con buena separacion de responsabilidades (Clean Architecture en backend, Context API en frontend). Sin embargo, **NO esta lista para produccion** debido a la ausencia total de autenticacion y la exposicion de contrasenas en texto plano. El Sprint 1 de seguridad es absolutamente bloqueante antes de cualquier otro trabajo.
