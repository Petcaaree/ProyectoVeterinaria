# Analisis Completo de PetConnect - Para Crear Tareas en Jira

## Contexto

PetConnect es una plataforma web de servicios para mascotas con 4 tipos de usuarios:
- **Clientes (Duenos)**: Registran sus mascotas y reservan servicios.
- **Paseadores**: Ofrecen servicios de paseo por hora con cupos (maxPerros).
- **Cuidadores**: Ofrecen servicios de cuidado por rango de fechas.
- **Veterinarias**: Ofrecen servicios clinicos (control, vacunacion, cirugia, etc.) por turnos.

El objetivo es identificar que falta implementar para hacer la plataforma monetizable.

---

## 1. Estructura de Carpetas y Tecnologias

### Stack Tecnologico
| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express 5 + Mongoose |
| Base de datos | MongoDB |
| Autenticacion | JWT + Refresh Token Rotation + bcrypt |
| Validacion | Joi (backend) |
| Imagenes | Cloudinary |
| Logging | Winston |
| Scheduling | node-cron (recordatorios 24h antes de cita) |
| Seguridad | Helmet, CORS, Rate Limiting, Mongo Sanitize |
| Documentacion API | Swagger UI |

### Estructura de Carpetas
```
ProyectoVeterinaria/
├── cliente/src/
│   ├── api/api.js              (todas las llamadas HTTP al backend, ~745 lineas)
│   ├── context/authContext.tsx  (estado global: auth, usuario, notificaciones)
│   ├── components/
│   │   ├── autenticacion/      (Login, Registro con seleccion de rol)
│   │   ├── mascotas/           (MisMascotas, RegistrarMascota, EditarMascotaModal)
│   │   ├── servicios/          (CrearServicio - formulario unificado para los 3 tipos de proveedor)
│   │   ├── turnos/             (MisTurnos, ReservaDetalleModal)
│   │   ├── notificaciones/     (Notificaciones.tsx - centro de notificaciones con contador)
│   │   ├── paseadores/         (MisPaseos, TarjetaPaseador)
│   │   ├── veterinarios/       (MisServiciosVeterinarios, TarjetaVeterinaria)
│   │   ├── cuidadores/         (MisServiciosCuidadores, TarjetaCuidador)
│   │   └── comun/              (Calendario, Filtros, Boton, Toast, SelectorFechas, etc.)
│   └── types/                  (interfaces TypeScript: auth.ts, index.ts)
│
└── server/
    └── vet/
        ├── controllers/        (9 controllers: cliente, veterinaria, paseador, cuidador, reserva, servicioVet, servicioPaseador, servicioCuidador, ciudad)
        ├── services/           (10 services, incluido recordatorioService para cron de recordatorios)
        ├── models/
        │   ├── entidades/      (clases de dominio: Usuario, Cliente, Veterinaria, Paseador, Cuidador, Mascota, Reserva, Servicios + enums)
        │   ├── schemas/        (Mongoose schemas para cada entidad)
        │   └── repositories/   (capa de acceso a datos MongoDB)
        ├── routes/             (11 archivos de rutas REST)
        ├── middlewares/        (authMiddleware JWT, authorizationMiddleware RBAC, rateLimitMiddleware, validateMiddleware, errorHandler)
        ├── validators/         (schemas.js con validaciones Joi para todas las entidades)
        └── utils/              (jwtUtils, refreshTokenUtils, logger)
```

### Patron Arquitectonico (Backend)
```
Request -> Router -> Middleware (auth + validation) -> Controller -> Service -> Repository -> MongoDB
```

---

## 2. Modulos y Funcionalidades Ya Implementados

### Autenticacion y Usuarios
- Registro y login para los 4 tipos de usuario (cliente, veterinaria, paseador, cuidador)
- JWT con refresh token rotation (el refresh token se rota en cada uso)
- Logout con opcion de revocar todos los tokens
- Middleware de autorizacion por rol (RBAC)
- Rate limiting: 10 requests/15min en auth, 100 requests/15min general
- Hashing de contrasenas con bcrypt

### Gestion de Mascotas (solo clientes)
- Registrar mascota con: nombre, tipo (PERRO/GATO/AVE), edad, raza, peso, fotos
- Editar mascota (modal)
- Eliminar mascota
- Subida de fotos a Cloudinary

### Servicios de Veterinaria
- Crear servicio con: tipoServicio (enum: Control, Vacunacion, Bano, Desparacitacion, Cirugia, Radiografia, Ecografia), duracionMinutos (30-480), precio, diasDisponibles, horariosDisponibles (formato HH:MM), mascotasAceptadas
- Disponibilidad por hora: al reservar se marca el horario como no disponible para esa fecha
- Activar/Desactivar servicio
- Dashboard "Mis Servicios Veterinarios"

### Servicios de Paseador
- Crear servicio con: duracionMinutos (30-120), maxPerros, precio, diasDisponibles, horariosDisponibles
- Sistema de cupos: al reservar se incrementa `perrosReservados` hasta alcanzar `maxPerros`
- Al cancelar se decrementa el contador
- Activar/Desactivar servicio
- Dashboard "Mis Paseos"

### Servicios de Cuidador
- Crear servicio con: diasDisponibles, mascotasAceptadas, precio (por dia)
- Disponibilidad por rango de fechas (fechaInicio - fechaFin)
- Al reservar se bloquea el rango completo
- Activar/Desactivar servicio
- Dashboard "Mis Servicios de Cuidado"

### Sistema de Reservas
- Flujo completo: cliente selecciona servicio -> elige fecha/hora (o rango) -> selecciona mascota -> confirma
- Validacion de disponibilidad antes de crear la reserva
- Ciclo de vida: PENDIENTE -> CONFIRMADA -> COMPLETADA / CANCELADA
- Una reserva CANCELADA no puede reactivarse (estado terminal)
- Vista "Mis Turnos" con filtros por estado (PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA) y paginacion
- Modal de detalle de reserva con acciones segun rol (aceptar/rechazar para proveedores, cancelar para clientes)

### Sistema de Notificaciones
- Notificacion automatica al proveedor cuando recibe una nueva reserva
- Notificacion al cliente cuando su reserva es confirmada o cancelada
- Recordatorio automatico 24h antes de cita confirmada (cron job)
- Contador de notificaciones no leidas en el header
- Marcar como leida (individual o todas)
- Centro de notificaciones con vista de leidas/no leidas

### Busqueda y Filtrado de Servicios
- Paginas publicas para explorar servicios de veterinarias, paseadores y cuidadores
- Filtros por: nombre, localidad, rango de precio, tipo de mascota aceptada
- Paginacion en resultados
- Tarjetas de servicio con informacion resumida

### Infraestructura
- Health check endpoint (GET /health)
- Swagger UI para documentacion de API (GET /api-docs)
- Manejo centralizado de errores (AppError + errorHandler middleware)
- Sanitizacion contra inyeccion NoSQL
- Logging con Winston

---

## 3. Funcionalidades Incompletas o con Bugs Conocidos

Estas tareas estan documentadas en el CLAUDE.md del proyecto como pendientes:

| # | Problema | Archivo Afectado | Que Hacer |
|---|---------|-------------------|-----------|
| 1 | MisTurnos del Dueno tiene filtro de busqueda por nombre que no deberia existir | `MisTurnos.tsx` | Eliminar filtro por nombre, dejar solo filtro por estado de reserva |
| 2 | MisMascotas puede mostrar boton "Crear Servicio" a clientes | `MisMascotas.tsx` | Verificar y eliminar cualquier boton de crear servicio si userType es cliente |
| 3 | CrearServicio para Veterinarias no integra correctamente tipoServicio y duracionMinutos | `CrearServicio.tsx` | Actualizar formulario para incluir selector de tipoServicio (enum) y campo duracionMinutos |
| 4 | CrearServicio para Paseadores no tiene tiempo_paseo ni selector de dias | `CrearServicio.tsx` | Agregar campo duracionMinutos y selector de dias disponibles |

---

## 4. Endpoints del Backend (API REST)

### Autenticacion
```
POST /petcare/login/cliente          - Login de cliente
POST /petcare/login/veterinaria      - Login de veterinaria
POST /petcare/login/paseador         - Login de paseador
POST /petcare/login/cuidador         - Login de cuidador
POST /petcare/signin/cliente         - Registro de cliente
POST /petcare/signin/veterinaria     - Registro de veterinaria
POST /petcare/signin/paseador        - Registro de paseador
POST /petcare/signin/cuidador        - Registro de cuidador
POST /petcare/auth/refresh           - Renovar access token con refresh token
POST /petcare/auth/logout            - Cerrar sesion (opcional: ?all=true para revocar todos)
```

### Clientes
```
GET    /petcare/clientes                              - Listar clientes (paginado)
DELETE /petcare/cliente/:id                            - Eliminar cuenta
PUT    /petcare/cliente/:id                            - Actualizar perfil
PUT    /petcare/cliente/:id/reserva                    - Actualizar reserva
PUT    /petcare/cliente/:id/cancelar/:idReserva        - Cancelar reserva
GET    /petcare/cliente/:id/mismascotas                - Obtener mascotas del cliente
POST   /petcare/cliente/:id/mascota                    - Agregar mascota
DELETE /petcare/cliente/:id/mascota/:idMascota          - Eliminar mascota
GET    /petcare/cliente/:id/notificaciones              - Todas las notificaciones
GET    /petcare/cliente/:id/notificaciones/contador     - Contador de no leidas
GET    /petcare/cliente/:id/notificaciones/:leida       - Filtrar por leidas/no leidas
PUT    /petcare/cliente/:id/notificaciones/:idNotif     - Marcar notificacion como leida
PUT    /petcare/cliente/:id/marcarNotificacionLeidas    - Marcar todas como leidas
```

### Veterinarias
```
GET    /petcare/veterinarias                           - Listar veterinarias
DELETE /petcare/veterinaria/:id                        - Eliminar cuenta
PUT    /petcare/veterinaria/:id                        - Actualizar perfil
PUT    /petcare/veterinaria/:id/reserva                - Gestionar reserva
PUT    /petcare/veterinaria/:id/cancelar/:idReserva    - Cancelar reserva
PUT    /petcare/veterinaria/:id/activar/:idServicio    - Activar servicio
PUT    /petcare/veterinaria/:id/desactivar/:idServicio - Desactivar servicio
       + mismos endpoints de notificaciones
```

### Paseadores
```
GET    /petcare/paseadores                             - Listar paseadores
DELETE /petcare/paseador/:id                           - Eliminar cuenta
PUT    /petcare/paseador/:id                           - Actualizar perfil
PUT    /petcare/paseador/:id/reserva                   - Gestionar reserva
PUT    /petcare/paseador/:id/cancelar/:idReserva       - Cancelar reserva
PUT    /petcare/paseador/:id/activar/:idServicio       - Activar servicio
PUT    /petcare/paseador/:id/desactivar/:idServicio    - Desactivar servicio
       + mismos endpoints de notificaciones
```

### Cuidadores
```
GET    /petcare/cuidadores                             - Listar cuidadores
DELETE /petcare/cuidador/:id                           - Eliminar cuenta
PUT    /petcare/cuidador/:id                           - Actualizar perfil
PUT    /petcare/cuidador/:id/reserva                   - Gestionar reserva
PUT    /petcare/cuidador/:id/cancelar/:idReserva       - Cancelar reserva
PUT    /petcare/cuidador/:id/activar/:idServicio       - Activar servicio
PUT    /petcare/cuidador/:id/desactivar/:idServicio    - Desactivar servicio
       + mismos endpoints de notificaciones
```

### Servicios Veterinaria
```
GET    /petcare/serviciosVet                                    - Listar todos (paginado, con filtros)
GET    /petcare/serviciosVet/:id                                - Obtener por ID
GET    /petcare/serviciosVet/veterinaria/:id                    - Servicios de una veterinaria
GET    /petcare/veterinaria/:id/serviciosVeterinaria/:estado    - Filtrar por estado (ACTIVO/DESACTIVADO)
POST   /petcare/servicioVet                                     - Crear servicio (solo veterinaria)
DELETE /petcare/servicios/:id                                    - Eliminar servicio
POST   /petcare/serviciosVet/array                              - Importacion masiva
PUT    /petcare/veterinaria/:id/servicioVet/:nuevoEstado        - Cambiar estado
```

### Servicios Paseador
```
GET    /petcare/serviciosPaseadores                             - Listar todos
GET    /petcare/serviciosPaseadores/:id                         - Obtener por ID
GET    /petcare/serviciosPaseadores/paseador/:id                - Servicios de un paseador
GET    /petcare/paseador/:id/serviciosPaseador/:estado          - Filtrar por estado
POST   /petcare/servicioPaseadores                              - Crear servicio (solo paseador)
DELETE /petcare/servicios/:id                                    - Eliminar servicio
```

### Servicios Cuidador
```
GET    /petcare/serviciosCuidadores                             - Listar todos
GET    /petcare/serviciosCuidadores/:id                         - Obtener por ID
GET    /petcare/serviciosCuidadores/cuidador/:id                - Servicios de un cuidador
GET    /petcare/cuidador/:id/serviciosCuidador/:estado          - Filtrar por estado
POST   /petcare/servicioCuidadores                              - Crear servicio (solo cuidador)
DELETE /petcare/servicios/:id                                    - Eliminar servicio
```

### Reservas
```
POST   /petcare/reservar                                        - Crear reserva (solo cliente)
PUT    /petcare/reserva/update                                  - Actualizar reserva
GET    /petcare/reservas                                        - Listar todas (paginado)
GET    /petcare/reservas/cliente/:id/:estado                    - Reservas de un cliente por estado
GET    /petcare/reservas/proveedor/:id/:estado                  - Reservas de un proveedor por estado
PUT    /petcare/usuario/:idUsuario/reserva/:idReserva/:estado   - Cambiar estado de reserva
```

### Ubicacion
```
GET    /petcare/localidades    - Listar localidades/barrios
GET    /petcare/ciudades       - Listar ciudades
```

### Utilidades
```
GET    /health                 - Health check (status, uptime, MongoDB connection, memory)
GET    /api-docs               - Swagger UI
```

---

## 5. Pantallas del Frontend

| Vista | Ruta interna (state) | Acceso | Descripcion |
|-------|---------------------|--------|-------------|
| Home | `home` | Publico | Hero banner + navegacion a servicios |
| Veterinarias | (pagina publica) | Publico | Lista de servicios veterinarios con filtros y tarjetas |
| Paseadores | (pagina publica) | Publico | Lista de servicios de paseo con filtros y tarjetas |
| Cuidadores | (pagina publica) | Publico | Lista de servicios de cuidado con filtros y tarjetas |
| Mis Mascotas | `my-pets` | Cliente | CRUD de mascotas del cliente |
| Registrar Mascota | `register-pet` | Cliente | Formulario de alta de mascota |
| Crear Servicio | `create-service` | Proveedor | Formulario unificado que cambia segun el tipo de proveedor |
| Mis Turnos | `appointments` | Todos (autenticados) | Reservas con filtros por estado y paginacion |
| Mis Paseos | `my-walks` | Paseador | Dashboard con servicios de paseo propios |
| Mis Servicios Vet | `my-vet-services` | Veterinaria | Dashboard con servicios veterinarios propios |
| Mis Servicios Cuidado | `my-care-services` | Cuidador | Dashboard con servicios de cuidado propios |
| Notificaciones | `notifications` | Todos (autenticados) | Centro de notificaciones con leidas/no leidas |

Nota: La app usa un sistema de vistas por estado en App.tsx (no React Router). La navegacion se maneja con `setCurrentView()`.

---

## 6. Funcionalidades Faltantes para Monetizar (Crear como Tareas en Jira)

### TIER 1 - Imprescindibles para lanzar de forma paga

#### T1-01: Pasarela de Pagos
- **Prioridad**: Critica
- **Descripcion**: Integrar MercadoPago (o Stripe) para que los clientes paguen al momento de reservar. El proveedor recibe el pago despues de que el servicio se completa.
- **Alcance tecnico**:
  - Crear modelo `Pago` en MongoDB (monto, comision, estado, referencia externa, timestamps)
  - Crear `pagoService.js`, `pagoController.js`, `pagoRoutes.js`
  - Endpoint para iniciar checkout (genera link/preferencia de pago)
  - Webhook para recibir confirmacion de pago desde MercadoPago
  - Actualizar el flujo de reserva: la reserva queda en estado PENDIENTE_PAGO hasta que el webhook confirma
  - Pagina de exito y fallo post-pago en el frontend
  - Mostrar estado de pago en MisTurnos y ReservaDetalleModal
- **Dependencias**: Cuenta de MercadoPago/Stripe, credenciales API
- **Complejidad**: Alta

#### T1-02: Comision por Transaccion
- **Prioridad**: Critica
- **Descripcion**: PetConnect cobra un porcentaje (ej: 10-15%) de cada reserva pagada. Este ingreso es el core del modelo de negocio.
- **Alcance tecnico**:
  - Campo `comisionPorcentaje` configurable (inicialmente hardcodeado, luego desde panel admin)
  - Al procesar pago: calcular monto_proveedor = precio - comision
  - Registrar la comision en el modelo `Pago`
  - Vista en panel admin con total de comisiones recaudadas
- **Dependencias**: T1-01 (Pasarela de Pagos)
- **Complejidad**: Media

#### T1-03: Panel de Administracion
- **Prioridad**: Alta
- **Descripcion**: Dashboard para un rol `admin` que permita gestionar la plataforma.
- **Alcance tecnico**:
  - Crear rol `admin` en el sistema de autenticacion
  - Crear modelo `Admin` o agregar flag `isAdmin` en Usuario
  - Dashboard con metricas: total usuarios (por tipo), total reservas (por estado), ingresos totales, comisiones recaudadas
  - CRUD de usuarios (ver, suspender, eliminar)
  - Moderacion de servicios (aprobar, rechazar, suspender)
  - Configuracion de comision y parametros del sistema
  - Ruta protegida `/admin` en el frontend
- **Complejidad**: Alta

#### T1-04: Sistema de Calificaciones y Resenas
- **Prioridad**: Alta
- **Descripcion**: Despues de una reserva COMPLETADA, el cliente puede dejar una calificacion (1-5 estrellas) y un comentario. Se muestra en la tarjeta del servicio y en el perfil del proveedor.
- **Alcance tecnico**:
  - Crear modelo `Resena` (cliente, servicio, reserva, puntuacion 1-5, comentario, fecha)
  - Endpoints: POST /resena (crear), GET /resenas/servicio/:id (listar por servicio)
  - Validar que solo se puede resenar una reserva COMPLETADA y que no exista resena previa para esa reserva
  - Calcular y almacenar calificacion promedio en el servicio
  - Mostrar estrellas y resenas en TarjetaServicio y en el detalle del servicio
  - Componente `EstrellaCalificacion.tsx` ya existe en el frontend (adaptar)
- **Complejidad**: Media

#### T1-05: Perfil Publico del Proveedor
- **Prioridad**: Alta
- **Descripcion**: Pagina publica para cada proveedor con su informacion, servicios ofrecidos, calificacion promedio y resenas.
- **Alcance tecnico**:
  - Endpoint GET /petcare/proveedor/:tipo/:id/perfil (datos publicos)
  - Nueva vista en el frontend: `PerfilProveedor.tsx`
  - Mostrar: foto, nombre, descripcion, ubicacion, servicios activos, calificacion promedio, ultimas resenas
  - Link desde las tarjetas de servicio hacia el perfil del proveedor
- **Dependencias**: T1-04 (Calificaciones)
- **Complejidad**: Media

#### T1-06: Emails Transaccionales
- **Prioridad**: Alta
- **Descripcion**: Enviar emails en momentos clave del flujo de usuario.
- **Alcance tecnico**:
  - Integrar servicio de email (SendGrid, Resend, o Nodemailer con SMTP)
  - Crear templates HTML para: bienvenida (registro), confirmacion de reserva, reserva aceptada/rechazada, recordatorio 24h, recibo de pago
  - Servicio `emailService.js` con metodos por tipo de email
  - Integrar en los flujos existentes (reservaService, recordatorioService, clienteService)
- **Complejidad**: Media

#### T1-07: Recuperacion de Contrasena
- **Prioridad**: Alta
- **Descripcion**: Flujo de "olvide mi contrasena" con token por email. Sin esto no se puede tener usuarios reales en produccion.
- **Alcance tecnico**:
  - Endpoint POST /petcare/auth/forgot-password (genera token, envia email)
  - Endpoint POST /petcare/auth/reset-password (valida token, actualiza contrasena)
  - Modelo `PasswordResetToken` (token, usuario, expiracion)
  - Formulario en el frontend: "Ingresa tu email" -> "Revisa tu correo" -> "Nueva contrasena"
- **Dependencias**: T1-06 (Emails)
- **Complejidad**: Baja-Media

---

### TIER 2 - Diferenciadores Competitivos

#### T2-01: Suscripciones Premium para Proveedores
- **Prioridad**: Media
- **Descripcion**: Plan mensual pago para proveedores que ofrece beneficios: posicionamiento destacado en busquedas, badge "verificado", estadisticas avanzadas, menor comision por transaccion.
- **Alcance tecnico**:
  - Modelo `Suscripcion` (proveedor, plan, estado, fechaInicio, fechaFin, pagoRecurrente)
  - Integracion con MercadoPago para cobro recurrente
  - Flag `esPremium` en servicios para priorizar en busquedas
  - Badge visual en tarjetas de servicio
  - Pagina de planes y checkout de suscripcion
- **Complejidad**: Alta

#### T2-02: Chat en Tiempo Real
- **Prioridad**: Media
- **Descripcion**: Mensajeria entre cliente y proveedor para coordinar detalles antes/despues de la reserva.
- **Alcance tecnico**:
  - Integrar Socket.io o WebSockets
  - Modelo `Conversacion` y `Mensaje`
  - Crear chat accesible desde ReservaDetalleModal
  - Notificacion de mensaje nuevo
  - Historial de conversaciones
- **Complejidad**: Alta

#### T2-03: Busqueda por Geolocalizacion
- **Prioridad**: Media
- **Descripcion**: Mostrar proveedores cercanos al cliente usando coordenadas GPS.
- **Alcance tecnico**:
  - Agregar campo `coordenadas` (GeoJSON Point) a los schemas de direccion
  - Crear indice 2dsphere en MongoDB
  - Endpoint de busqueda por cercania con radio configurable
  - Integrar mapa (Google Maps o Mapbox) en la pagina de busqueda de servicios
  - Pedir geolocalizacion al usuario en el frontend
- **Complejidad**: Media

#### T2-04: Historial Medico de Mascotas
- **Prioridad**: Media
- **Descripcion**: Despues de una consulta veterinaria completada, el veterinario puede cargar notas medicas, vacunas aplicadas, tratamientos. El dueno puede ver el historial completo de su mascota.
- **Alcance tecnico**:
  - Modelo `RegistroMedico` (mascota, veterinaria, reserva, tipo, descripcion, fecha, archivos adjuntos)
  - Endpoints CRUD para registros medicos (solo veterinaria puede crear/editar, cliente puede leer)
  - Vista en MisMascotas: boton "Ver historial medico" que muestra timeline de registros
  - Vista en dashboard veterinaria: formulario post-consulta
- **Complejidad**: Media

#### T2-05: Reservas Multiples / Carrito
- **Prioridad**: Baja
- **Descripcion**: Permitir reservar varios servicios en una sola transaccion (ej: vacunacion + bano en la misma veterinaria).
- **Alcance tecnico**:
  - Modelo `Carrito` temporal o logica en frontend
  - Endpoint de checkout multiple
  - Validar disponibilidad de todos los servicios antes de confirmar
- **Complejidad**: Media

#### T2-06: Cupones y Descuentos
- **Prioridad**: Baja
- **Descripcion**: Sistema de codigos promocionales para primeras reservas, fidelizacion o campanas de marketing.
- **Alcance tecnico**:
  - Modelo `Cupon` (codigo, descuento %, monto fijo, usos maximos, fecha expiracion, tipo usuario)
  - Validacion al momento de reservar
  - Campo de "Codigo de descuento" en ModalReserva
  - Panel admin: CRUD de cupones
- **Complejidad**: Baja

---

### TIER 3 - Escala y Retencion

#### T3-01: Progressive Web App (PWA)
- **Prioridad**: Media
- **Descripcion**: Convertir la app a PWA con push notifications nativas, instalable en celular.
- **Alcance tecnico**:
  - Service worker, manifest.json, iconos
  - Push notifications con Web Push API (reemplaza o complementa notificaciones in-app)
  - Soporte offline basico (cache de servicios visitados)
- **Complejidad**: Alta

#### T3-02: Landing Page y SEO
- **Prioridad**: Media
- **Descripcion**: Pagina de marketing con beneficios, testimonios, llamados a la accion. Optimizacion SEO.
- **Alcance tecnico**:
  - Landing page estatica o con React (puede ser separada)
  - Meta tags, Open Graph, sitemap.xml, robots.txt
  - Pagina de "Como funciona" con flujo visual
  - Seccion de testimonios (puede usar resenas reales)
  - CTA de registro para clientes y proveedores
- **Complejidad**: Media

#### T3-03: Reportes y Analytics para Proveedores
- **Prioridad**: Media
- **Descripcion**: Dashboard para proveedores con metricas de su negocio.
- **Alcance tecnico**:
  - Vista `MisEstadisticas.tsx`
  - Metricas: ingresos mensuales, cantidad de reservas por periodo, tasa de cancelacion, calificacion promedio, servicios mas populares
  - Graficos con Chart.js o Recharts
  - Endpoint de agregacion en backend
- **Complejidad**: Media

#### T3-04: Programa de Referidos
- **Prioridad**: Baja
- **Descripcion**: "Invita a un amigo y ambos obtienen un descuento". Modelo de crecimiento viral.
- **Alcance tecnico**:
  - Codigo de referido unico por usuario
  - Modelo `Referido` (referidor, referido, cuponGenerado, estado)
  - Al registrarse con codigo: generar cupon de descuento para ambos
  - Seccion "Invitar amigos" en perfil de usuario
- **Complejidad**: Baja

#### T3-05: Soporte / Help Center
- **Prioridad**: Baja
- **Descripcion**: FAQ, formulario de contacto, o integracion con herramienta de soporte.
- **Alcance tecnico**:
  - Pagina de preguntas frecuentes (estatica o dinamica)
  - Formulario de contacto con envio de email
  - Opcionalmente: integrar Zendesk, Intercom o Crisp para chat de soporte
- **Complejidad**: Baja

#### T3-06: Verificacion de Proveedores
- **Prioridad**: Media
- **Descripcion**: Los proveedores suben documentacion (matricula veterinaria, DNI, antecedentes) que es revisada por un admin antes de habilitar sus servicios.
- **Alcance tecnico**:
  - Campo `verificado` en proveedor (boolean)
  - Campo `documentos` (array de URLs a Cloudinary)
  - Flujo: proveedor sube docs -> admin revisa -> aprueba/rechaza
  - Badge "Verificado" en tarjetas de servicio
  - Seccion en panel admin para revision de documentos
- **Dependencias**: T1-03 (Panel Admin)
- **Complejidad**: Media

#### T3-07: Multi-idioma (i18n)
- **Prioridad**: Baja
- **Descripcion**: Soporte para multiples idiomas para expandir a otros mercados.
- **Alcance tecnico**:
  - Integrar react-i18next
  - Extraer todos los strings a archivos de traduccion
  - Selector de idioma en el header
  - Inicialmente: espanol + ingles
- **Complejidad**: Media

---

## 7. Modelo de Monetizacion Sugerido

| Canal de Ingreso | Descripcion | Dependencia |
|-----------------|-------------|-------------|
| Comision por reserva (10-15%) | Se cobra al proveedor por cada transaccion completada | T1-01 + T1-02 |
| Suscripcion Premium ($X/mes) | Proveedores pagan por visibilidad destacada, badge verificado, menor comision | T2-01 |
| Publicidad destacada | Proveedores pagan por aparecer primeros en resultados de busqueda | T1-03 (config desde admin) |
| Partnerships | Seguros de mascotas, tiendas de productos, alianzas con marcas pet-friendly | No requiere desarrollo inicial |

---

## 8. Orden de Implementacion Sugerido

### Fase 1 - MVP Monetizable (4-6 semanas)
1. Corregir bugs pendientes del CLAUDE.md (T0 - los 4 items de la seccion 3)
2. Recuperacion de contrasena (T1-07)
3. Emails transaccionales (T1-06)
4. Pasarela de pagos con MercadoPago (T1-01)
5. Comision por transaccion (T1-02)
6. Panel de administracion basico (T1-03)

### Fase 2 - Confianza y Retencion (3-4 semanas)
7. Calificaciones y resenas (T1-04)
8. Perfil publico del proveedor (T1-05)
9. Verificacion de proveedores (T3-06)
10. Landing page y SEO (T3-02)

### Fase 3 - Diferenciacion (4-6 semanas)
11. Chat en tiempo real (T2-02)
12. Historial medico de mascotas (T2-04)
13. Busqueda por geolocalizacion (T2-03)
14. Reportes para proveedores (T3-03)

### Fase 4 - Escala (ongoing)
15. Suscripciones Premium (T2-01)
16. PWA con push notifications (T3-01)
17. Cupones y descuentos (T2-06)
18. Programa de referidos (T3-04)
19. Multi-idioma (T3-07)
20. Soporte / Help Center (T3-05)

---

## 9. Datos Tecnicos Adicionales para Contexto

### Enums del Backend (respetar estos valores exactos)
```
EstadoReserva: PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA (femeninos)
TipoServicioVeterinario: Control, Vacunacion, Baño, Desparacitacion, Cirugia, Radiografia, Ecografia
EstadoServicio: ACTIVO, DESACTIVADO
TipoMascota: PERRO, GATO, AVE
TipoUsuario: cliente, veterinaria, paseador, cuidador
```

### Colecciones en MongoDB
```
clientes, veterinarias, paseadores, cuidadores, mascotas, reservas,
servicioveterinarias, serviciopaseadors, serviciocuidadors,
ciudads, localidads, refreshtokens
```

### Puertos y URLs
- Frontend: Vite dev server (default 5173)
- Backend: Express (configurado en server.js)
- MongoDB: Configurado en server/vet/config/database.js

### Estilos UI
- Color principal de accion: `purple-600`
- Color destructivo: `red-600`
- Framework CSS: Tailwind CSS 3.4
