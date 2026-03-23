# 🏛️ PetConnect: Protocolo de Arquitectura y Desarrollo Senior

Este documento es la única fuente de verdad para la lógica de negocio y estándares técnicos. Claude debe consultarlo antes de cada tarea para asegurar la integridad del sistema.

---

## 🏗️ 1. Arquitectura del Sistema

### Backend (Node.js + Mongoose)
- **Estructura**: Entidad -> Schema -> Repository -> Service -> Controller.
- **Modelos Críticos**:
    - `ReservaModel`: Gestiona la relación entre Cliente, Mascota y Servicios.
    - `ServicioModel` (Vet/Paseador/Cuidador): Poseen lógica de disponibilidad diferenciada.
- **Enums**: Respetar estrictamente los valores definidos en `server/vet/models/entidades/enums/`.
    - *Nota*: Los estados de reserva en la DB son femeninos (`CONFIRMADA`, `CANCELADA`, `COMPLETADA`).

### Frontend (React + TypeScript)
- **Gestión de Estado**: Uso centralizado de `AuthContext` para datos de usuario, tipo de rol y notificaciones.
- **Tipado**: Prohibido el uso de `any`. Extender interfaces desde `client/src/types/`.

---

## 🚦 2. Reglas de Negocio y Restricciones de Seguridad

### A. Aislamiento de Roles (RBAC)
- **Dueño (Cliente)**: 
    - Tiene prohibido crear servicios.
    - La vista `MisMascotas.tsx` solo debe permitir el registro y edición de mascotas, **nunca** botones de "Crear Servicio".
- **Proveedores (Veterinaria/Paseador/Cuidador)**:
    - Son los únicos con acceso a los formularios de creación de servicios.

### B. Ciclo de Vida de Reservas
Los estados de las reservas deben seguir esta lógica de transición:
`PENDIENTE` ➔ `CONFIRMADA` ➔ `COMPLETADA` / `CANCELADA`.
- Una reserva `CANCELADA` no puede ser reactivada.
- Los filtros en la UI de "Mis Turnos" para el Dueño deben limitarse estrictamente al **Estado** de la reserva.

---

## 🛠️ 3. Especificaciones Técnicas por Servicio

### Veterinarias (`ServicioVeterinariaSchema`)
- **Campos Obligatorios**: `tipoServicio` (usar enum `TipoServicioVeterinario`), `duracionMinutos` (min 30, max 480), `nombreClinica`.
- **Disponibilidad**: Validar que `horariosDisponibles` siga el formato `HH:MM`.

### Paseadores (`ServicioPaseadorSchema`)
- **Campos Obligatorios**: `duracionMinutos` (min 30, max 120), `maxPerros`.
- **Lógica de Cupos**: Al reservar, incrementar `perrosReservados` en `fechasNoDisponibles.horariosNoDisponibles` hasta alcanzar `maxPerros`.

---

## 🔔 4. Skill: Sistema de Notificaciones
Cualquier cambio de estado en una `Reserva` debe invocar los métodos de `AuthContext`:
1. `incrementarContadorNotificaciones()`: Al recibir una nueva reserva (para proveedores).
2. `cargarContadorNotificaciones()`: Sincronizar con el backend tras acciones críticas.
- **Tipos de Alerta**: Nueva Cita, Recordatorio (24h antes), Cancelación.

---

## 🚀 5. Roadmap Inmediato (Tareas Pendientes)

1.  **Refactor Mis Turnos (Dueño)**: 
    - Eliminar filtro de búsqueda por nombre.
    - Implementar filtrado único por estados: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`.
2.  **Limpieza Mis Mascotas**: 
    - Eliminar cualquier referencia o botón de "Crear Servicio" si el `userType` es `cliente`.
3.  **Enriquecimiento de Formularios**: 
    - Actualizar `CrearServicio.tsx` para incluir `tipoServicio` y `duracionMinutos` en Vets.
    - Incluir `tiempo_paseo` (duracionMinutos) y selector de días en Paseadores.

---

## ⚠️ 6. Estándares de Código
- **Normalización**: Siempre usar las funciones auxiliares `parseFechaToDate` y `normalizarHorarios` definidas en los esquemas de Mongoose para evitar errores de formato en la DB.
- **UI/UX**: Mantener la estética de `purple-600` para componentes de acción y `red-600` para acciones destructivas.