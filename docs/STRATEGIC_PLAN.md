# PetCare — Audit Completo & Plan Estrategico de Monetizacion

---

## PARTE 1: Resumen de los 4 Sprints Implementados

### Sprint 1 — Seguridad (A1–A6)

| Tarea | Que se hizo | Impacto |
|-------|-------------|---------|
| **A1 — bcrypt** | Hashing de passwords con salt rounds 10. Validacion de complejidad en capa de servicio (min 8 chars, mayusc, minusc, digito, especial) | Elimina almacenamiento de passwords en texto plano |
| **A2 — JWT** | Access tokens (24h), payload `{id, email, tipoUsuario}`. Interceptor en frontend para adjuntar Bearer token y manejar 401 | Autenticacion stateless lista para escalar |
| **A3 — RBAC** | `authMiddleware` (verifica JWT) + `authorizationMiddleware(...roles)`. 4 roles: cliente, veterinaria, paseador, cuidador | Control de acceso granular por tipo de usuario |
| **A4 — Helmet + Rate Limit** | Headers HTTP seguros. 100 req/15min general, 10 req/15min en auth | Mitiga ataques de fuerza bruta y fingerprinting |
| **A5 — Env vars** | Secrets fuera del codigo. `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS` en `.env` | Zero secrets en el repositorio |
| **A6 — CORS** | Origins configurables por variable de entorno con callback de validacion | Preparado para multiples dominios de frontend |

### Sprint 2 — Calidad (B1–B4)

| Tarea | Que se hizo | Impacto |
|-------|-------------|---------|
| **B1 — Joi Validation** | 12 schemas de validacion: login, registro (x4 roles), mascota, servicios (x3 tipos), reserva, paginacion. Middleware `validate()` reutilizable | Input sanitizado antes de llegar al servicio |
| **B2 — Error Handler** | `normalizeError()` centralizado: CastError, duplicate key (11000), Joi, JSON parse. AppError base con status codes semanticos | Errores consistentes y no se leakea info interna |
| **B3 — NoSQL Sanitization** | `express-mongo-sanitize` global: strips `$` y `.` de body/query/params | Previene inyeccion NoSQL |
| **B4 — Paginacion segura** | `sanitizePagination()` con maxLimit=100. Fix del bug donde `limit` raw se pasaba al repo | Previene queries masivos y fuga de datos |

### Sprint 3 — Testing & CI/CD (C1–C4)

| Tarea | Que se hizo | Impacto |
|-------|-------------|---------|
| **C1 — Unit Tests** | 67 tests: AppError, authMiddleware, clienteService, JWT utils, password utils, validate middleware | Regresiones detectadas antes de merge |
| **C2 — Integration Tests** | 12 tests: auth flow completo (login, registro, 401, 403), paginacion con supertest | Validacion end-to-end del API |
| **C3 — GitHub Actions** | CI en Node 18.x y 20.x: install, unit tests, integration tests, syntax check | Gate automatico en cada push a main |
| **C4 — Winston Logging** | Logger estructurado con niveles. Request logging (method, url, status, duration, IP) | Trazabilidad y debugging en produccion |

### Sprint 4 — Produccion (D1–D5)

| Tarea | Que se hizo | Impacto |
|-------|-------------|---------|
| **D1 — Swagger** | OpenAPI 3.0.3 spec con 60+ endpoints en `/api-docs` | API auto-documentada para frontend y terceros |
| **D2 — Env vars prod** | Template de produccion: JWT 15min, MongoDB Atlas, LOG_LEVEL=warn | Deploy-ready sin tocar codigo |
| **D3 — MongoDB Indices** | 20+ indices compuestos en reservas, servicios, usuarios, localidades | Queries 10-100x mas rapidos a escala |
| **D4 — Refresh Tokens** | Token opaco rotativo (7d), TTL auto-cleanup, endpoints `/auth/refresh` y `/auth/logout`, auto-refresh en frontend con cola de requests | Sesiones seguras sin re-login constante |
| **D5 — Health Check** | `/health` con estado MongoDB, uptime, memoria, environment | Base para monitoring y alertas |

---

## PARTE 2: Diagnostico Critico — Estado Actual

### Lo que esta bien

- **Arquitectura limpia**: Repository -> Service -> Controller. Facil de testear y extender.
- **Seguridad robusta**: JWT + RBAC + rate limit + helmet + sanitizacion. Mejor que el 90% de MVPs.
- **Logica de negocio compleja funcionando**: Sistema de reservas con deteccion de conflictos, cancelaciones automaticas, recordatorios por cron, estados de maquina (PENDIENTE -> CONFIRMADA -> COMPLETADA/CANCELADA).
- **CI/CD real**: 79 tests, pipeline en GitHub Actions, sin merge sin pasar tests.
- **4 tipos de usuario con flujos diferenciados**: No es un CRUD generico.

### Lo que falta para monetizar (critico)

| Gap | Severidad | Por que bloquea |
|-----|-----------|-----------------|
| **Pagos** | CRITICA | Sin cobro no hay negocio. Las reservas se crean sin pagar. |
| **Email/SMS** | CRITICA | Los usuarios no reciben nada fuera de la app. Abandono garantizado. |
| **Deploy a produccion** | CRITICA | No hay Dockerfile, ni config de cloud, ni dominio. |
| **Reviews/Ratings** | ALTA | Sin confianza social no hay conversion. El componente EstrellaCalificacion existe pero no se usa. |
| **Busqueda full-text** | ALTA | Solo hay filtros basicos. No se puede buscar "vacunacion zona norte barata". |
| **Real-time (WebSocket)** | MEDIA | Las notificaciones son batch via cron cada 1 minuto. Experiencia degradada. |
| **Analytics** | MEDIA | No se mide nada. No sabes donde abandonan los usuarios ni que buscan. |
| **Caching (Redis)** | MEDIA | Cada request golpea MongoDB directamente. No escala. |
| **API versioning** | BAJA | `/petcare/*` sin version. Cuando cambies algo, rompes clientes existentes. |

---

## PARTE 3: Plan de Accion para Monetizacion

### Modelo de negocio propuesto

PetCare es un **marketplace de servicios pet-care** con modelo de comision:

```
                   Comision por reserva completada
Cliente ──────────────────────────────────────────> Proveedor
    |                                                  |
    |  Paga precio + fee (ej: 10%)                    |  Recibe precio - fee (ej: 5%)
    |                                                  |
    └──────────── PetCare se queda 15% ───────────────┘
```

Alternativas/complementarias:
- **Freemium para proveedores**: Plan gratuito (3 servicios) → Plan Pro ($X/mes, servicios ilimitados, posicionamiento, analytics).
- **Reserva premium para clientes**: Reserva express, cancelacion flexible, soporte prioritario.
- **Publicidad interna**: Proveedores pagan por aparecer primero en resultados.

### Sprint 5 — Pagos & Notificaciones Externas (BLOQUEA MONETIZACION)

**Duracion estimada: 2 semanas**

| Tarea | Descripcion | Tecnologia |
|-------|-------------|------------|
| **E1 — MercadoPago/Stripe** | Checkout al crear reserva. Webhook de confirmacion de pago. Split payment (proveedor recibe su parte automaticamente). | Stripe Connect o MercadoPago Split |
| **E2 — Email transaccional** | Confirmacion de reserva, recordatorios, cancelaciones, bienvenida al registro. Templates HTML. | Resend o SendGrid (tier gratis: 100 emails/dia) |
| **E3 — Receipts y facturacion** | Generar comprobante PDF por cada pago. Historial de transacciones. | PDFKit + almacenamiento en S3/Cloudinary |
| **E4 — Wallet del proveedor** | Balance del proveedor, solicitud de retiro, historial de comisiones. | Schema MongoDB + logica de liquidacion |

### Sprint 6 — Deploy & Infraestructura de Produccion

**Duracion estimada: 1 semana**

| Tarea | Descripcion | Tecnologia |
|-------|-------------|------------|
| **F1 — Containerizacion** | Dockerfile para backend + frontend. docker-compose para dev local. | Docker + Docker Compose |
| **F2 — Deploy backend** | API en Railway/Render/Fly.io con auto-deploy desde main. SSL automatico. | Railway (recomendado para MVPs) |
| **F3 — Deploy frontend** | SPA en Vercel/Netlify con CDN global. | Vercel (integracion nativa con Vite) |
| **F4 — MongoDB Atlas** | Cluster M0 (gratis) o M10 ($57/mes para produccion). Backups automaticos. | MongoDB Atlas |
| **F5 — Variables de entorno prod** | Configurar secrets en el hosting. Dominio propio con DNS. | |
| **F6 — Monitoring** | Error tracking + alertas + uptime monitoring. | Sentry (errores) + UptimeRobot (gratis) |

### Sprint 7 — Confianza & Conversion

**Duracion estimada: 2 semanas**

| Tarea | Descripcion | Por que |
|-------|-------------|---------|
| **G1 — Reviews y ratings** | Rating 1-5 estrellas post-reserva completada. Promedio visible en tarjetas de servicio. | Sin social proof no hay conversion. Es el feature #1 de cualquier marketplace. |
| **G2 — Busqueda avanzada** | MongoDB Atlas Search o Elasticsearch. Busqueda por texto libre + geolocalizacion (servicios cercanos). | Reducir friccion al encontrar servicios. |
| **G3 — Perfil publico de proveedores** | Pagina publica con servicios, reviews, horarios, certificaciones. URL shareable. | SEO + compartir en redes. |
| **G4 — Onboarding del proveedor** | Wizard paso-a-paso para crear perfil + primer servicio. Verificacion de identidad basica. | Reducir abandono en el registro de proveedores. |

### Sprint 8 — Escala & Retencion

| Tarea | Descripcion |
|-------|-------------|
| **H1 — Push notifications** | Firebase Cloud Messaging para mobile web. Recordatorios, nuevas reservas, mensajes. |
| **H2 — Chat en tiempo real** | Socket.io entre cliente y proveedor. Historial persistido en MongoDB. |
| **H3 — Analytics dashboard** | Panel de metricas: reservas/dia, tasa de conversion, revenue, churn. Mixpanel o custom. |
| **H4 — Redis cache** | Cache de servicios populares, sesiones, rate limiting distribuido. |
| **H5 — Reservas recurrentes** | "Paseo todos los lunes y miercoles". Generacion automatica de reservas. |
| **H6 — App mobile (PWA)** | Progressive Web App con manifest + service worker. Instalable sin App Store. |

---

## PARTE 4: Ventaja Competitiva con Perfil Tecnico

### Tu diferencial real

La mayoria de los marketplaces de servicios para mascotas en LATAM son:
1. **Paginas de WordPress con formulario de contacto** — sin sistema de reservas real.
2. **Apps hechas por agencias** — codigo espagueti, sin seguridad, sin tests, sin CI/CD.
3. **Directorios estaticos** — listan proveedores pero no gestionan el flujo completo.

Tu stack ya tiene lo que ellos no:
- Autenticacion real con refresh tokens y RBAC
- Sistema de reservas con maquina de estados y cancelaciones automaticas
- Pipeline CI/CD con 79 tests
- API documentada con Swagger
- Arquitectura que se puede escalar sin reescribir

### Como capitalizar esto

1. **Lanza rapido con pagos (Sprint 5)**. No necesitas ser perfecto. Necesitas cobrar.
2. **Enfocate en una ciudad/zona**. No intentes ser nacional desde el dia 1. Domina una localidad, obtene testimonios, itera.
3. **Los proveedores son tu cuello de botella**. Sin oferta no hay demanda. Ofrece 3 meses gratis + onboarding personalizado a las primeras 20 veterinarias/paseadores.
4. **El SEO es tu canal de adquisicion gratuito**. Paginas publicas de proveedores indexables por Google. "Veterinaria en [localidad]" es una busqueda con intencion de compra altisima.
5. **Mide desde el dia 1**. Si no sabes cuantos usuarios se registran, cuantos reservan, y cuantos pagan, no podes tomar decisiones.

### Riesgos a mitigar

| Riesgo | Mitigacion |
|--------|------------|
| Cold start (pocos proveedores) | Onboarding manual, 3 meses gratis, contenido de valor |
| Usuarios bypassean la plataforma | Cobrar al momento de reservar, no despues. Reviews solo para reservas pagadas. |
| Competencia de apps grandes | Enfoque hiperlocal. Servicio personalizado. Comisiones mas bajas. |
| Downtime en produccion | Monitoring + alertas + backups + deploy blue-green |

---

## PARTE 5: Orden de Prioridad (que hacer PRIMERO)

```
AHORA (semana 1-2):
  └─ Sprint 5: MercadoPago + Emails
     └─ Sprint 6: Deploy a produccion
        └─ Lanzamiento beta cerrada (20 proveedores + 50 clientes en 1 zona)

MES 2:
  └─ Sprint 7: Reviews + Busqueda + Perfiles publicos
     └─ Iterar basado en feedback real de usuarios

MES 3:
  └─ Sprint 8: Chat + Push + Analytics
     └─ Escalar a 2-3 zonas mas
```

**La regla de oro**: No construyas features que nadie pidio. Lanza, cobra, mide, itera.
