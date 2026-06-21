# Transit AI — Backend

API REST + WebSocket en tiempo real para el sistema de transporte público.
**Stack:** NestJS · Prisma · PostgreSQL · Socket.IO

---

## Configuración

### Variables de entorno (`.env`)
```env
DATABASE_URL="postgresql://postgres:CONTRASEÑA@localhost:5432/transit_ai_db"
PORT=4000
JWT_SECRET="tu-clave-secreta"
JWT_EXPIRATION="15m"
REFRESH_TOKEN_EXPIRATION="7d"
```

### Comandos
```bash
npm install
npx prisma migrate dev   # crea/actualiza tablas en PostgreSQL
npx ts-node --transpile-only prisma/seed.ts   # poblar base de datos con datos de prueba
npm run start:dev        # inicia en modo desarrollo
```

Base URL: `http://localhost:4000`

---

## Autenticación (`/auth`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión, devuelve accessToken + refreshToken | No |
| POST | `/auth/refresh` | Rotar refresh token | No |
| POST | `/auth/logout` | Cerrar sesión (revoca refresh tokens) | JWT |

**Body register:**
```json
{ "email": "user@mail.com", "nombre": "Juan", "password": "123456", "rol": "PASSENGER" }
```
**Body login:**
```json
{ "email": "user@mail.com", "password": "123456" }
```

---

## WebSocket

Conectar con Socket.IO a los namespaces:

| Namespace | URL | Propósito |
|-----------|-----|-----------|
| Viajes | `ws://localhost:4000/viajes` | GPS en tiempo real de buses |
| Incidentes | `ws://localhost:4000/incidentes` | Reportes de incidentes |
| Notificaciones | `ws://localhost:4000/notificaciones` | Alertas push |

### Eventos — `/viajes`
| Evento (emit) | Payload | Descripción |
|---------------|---------|-------------|
| `suscribir-viaje` | `{ viajeId }` | Recibir GPS de un viaje |
| `desuscribir-viaje` | `{ viajeId }` | Dejar de recibir GPS |
| `suscribir-linea` | `{ lineaId }` | Recibir todos los buses de una línea |
| `ubicacion-conductor` | `{ viajeId, latitud, longitud, rumbo?, velocidad? }` | Conductor envía posición |
| `finalizar-viaje` | `{ viajeId, razonFin?, velocidadPromedio? }` | Conductor finaliza viaje |

| Evento (on) | Payload | Descripción |
|-------------|---------|-------------|
| `ubicacion-actualizada` | `{ viajeId, latitud, longitud, rumbo, velocidad, registradoEn }` | Nueva posición del bus |
| `viaje-finalizado` | `{ viajeId, estado, razonFin, finalizadoEn }` | Viaje terminado |
| `bus-actualizado` | posición | Posición de bus en línea suscrita |

### Eventos — `/incidentes`
| Evento (emit) | Payload | Descripción |
|---------------|---------|-------------|
| `suscribir-sindicato` | `{ sindicatoId }` | Escuchar incidentes de un sindicato |
| `reportar-incidente` | `{ viajeId, conductorId, tipo, descripcion, latitud?, longitud? }` | Conductor reporta incidente |
| `revisar-incidente` | `{ incidenteId, dto }` | Admin revisa incidente |

| Evento (on) | Descripción |
|-------------|-------------|
| `nuevo-incidente` | Nuevo incidente reportado |
| `incidente-revisado` | Incidente revisado por admin |

### Eventos — `/notificaciones`
| Evento (emit) | Payload | Descripción |
|---------------|---------|-------------|
| `suscribir-usuario` | `{ usuarioId }` | Sala personal del usuario |
| `suscribir-rol` | `{ rol }` | Sala por rol (DRIVER, PASSENGER…) |

| Evento (on) | Descripción |
|-------------|-------------|
| `nueva-notificacion` | Notificación recibida |

---

## Sindicatos (`/sindicatos`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/sindicatos` | Listar todos los sindicatos activos | — |
| GET | `/sindicatos/:id` | Obtener sindicato por ID | — |
| POST | `/sindicatos` | Crear sindicato | — |
| PATCH | `/sindicatos/:id` | Actualizar sindicato | — |
| DELETE | `/sindicatos/:id` | Desactivar sindicato | — |

**Body POST:**
```json
{
  "nombre": "Sindicato 1",
  "representanteLegal": "Juan Pérez",
  "telefonoContacto": "70000000",
  "direccion": "Av. Principal 123",
  "nit": "12345678",
  "emailContacto": "sindicato@mail.com"
}
```

---

## Usuarios (`/usuarios`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/usuarios` | Listar usuarios | `?rol=DRIVER&sindicatoId=1` |
| GET | `/usuarios/:id` | Obtener usuario por ID | — |
| POST | `/usuarios` | Crear usuario | — |
| PATCH | `/usuarios/:id` | Actualizar usuario | — |
| DELETE | `/usuarios/:id` | Eliminar (soft delete) | — |

**Roles disponibles:** `SUPERADMIN` `SINDICATO_ADMIN` `OPERATOR` `DRIVER` `PASSENGER`

---

## Conductores (`/conductores`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/conductores` | Listar conductores | `?sindicatoId=1&lineaId=2` |
| GET | `/conductores/:id` | Obtener conductor por ID | — |
| POST | `/conductores` | Registrar conductor | — |
| PATCH | `/conductores/:id` | Actualizar conductor | — |
| PATCH | `/conductores/:id/credencial` | Actualizar estado de licencia | — |
| DELETE | `/conductores/:id` | Dar de baja conductor | — |

**Body PATCH credencial:**
```json
{ "estadoCredencial": "VALID" }
```
**Estados credencial:** `VALID` `EXPIRED` `SUSPENDED` `RENEWING`

---

## Líneas de Bus (`/lineas`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/lineas` | Listar líneas activas | `?sindicatoId=1` |
| GET | `/lineas/:id` | Obtener línea con rutas y terminales | — |
| POST | `/lineas` | Crear línea | — |
| PATCH | `/lineas/:id` | Actualizar línea | — |
| DELETE | `/lineas/:id` | Eliminar línea | — |

**Body POST:**
```json
{
  "sindicatoId": 1,
  "nombre": "Línea 1",
  "codigo": "L1",
  "tarifa": 2.5,
  "color": "#FF5733",
  "horaInicioOperacion": "06:00:00",
  "horaFinOperacion": "22:00:00"
}
```

---

## Rutas (`/rutas`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/rutas` | Listar rutas activas | `?lineaId=1` |
| GET | `/rutas/:id` | Obtener ruta por ID | — |
| POST | `/rutas` | Crear ruta | — |
| PATCH | `/rutas/:id` | Actualizar ruta | — |
| DELETE | `/rutas/:id` | Eliminar ruta | — |

**Direcciones:** `OUTBOUND` (ida) · `INBOUND` (vuelta) · `CIRCULAR`

---

## Grabaciones de Ruta (`/grabaciones`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/grabaciones` | Listar grabaciones | `?lineaId=1&estado=PENDING` |
| GET | `/grabaciones/:id` | Obtener grabación por ID | — |
| POST | `/grabaciones` | Crear grabación GPS | — |
| PATCH | `/grabaciones/:id/revisar` | Aprobar o rechazar grabación | — |

**Estados:** `PENDING` `APPROVED` `REJECTED`
**Métodos:** `ADMIN_DRAW` `DRIVER_GPS` `KML_IMPORT`

---

## Internos / Buses (`/internos`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/internos` | Listar buses | `?sindicatoId=1&lineaId=2` |
| GET | `/internos/:id` | Obtener bus por ID | — |
| POST | `/internos` | Registrar bus | — |
| PATCH | `/internos/:id` | Actualizar bus | — |
| DELETE | `/internos/:id` | Dar de baja bus | — |

**Estados operacionales:** `ACTIVE` `MAINTENANCE` `INACTIVE` `OUT_OF_SERVICE`

---

## Turnos (`/turnos`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/turnos` | Listar turnos activos |
| GET | `/turnos/:id` | Obtener turno por ID |
| POST | `/turnos` | Crear turno |
| PATCH | `/turnos/:id` | Actualizar turno |
| DELETE | `/turnos/:id` | Eliminar turno |

**Body POST:**
```json
{
  "nombre": "Turno Mañana",
  "diasSemana": "1,2,3,4,5",
  "horaInicio": "06:00:00",
  "horaFin": "14:00:00",
  "vueltasEsperadas": 8
}
```

---

## Asignaciones Diarias (`/asignaciones`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/asignaciones` | Listar asignaciones | `?sindicatoId=1&fecha=2026-05-17&conductorId=3` |
| GET | `/asignaciones/:id` | Obtener asignación con viajes | — |
| POST | `/asignaciones` | Crear asignación | — |
| PATCH | `/asignaciones/:id` | Actualizar asignación | — |
| DELETE | `/asignaciones/:id` | Eliminar asignación | — |

**Body POST:**
```json
{
  "sindicatoId": 1,
  "conductorId": 2,
  "busId": 3,
  "rutaId": 4,
  "fecha": "2026-05-17",
  "horaInicio": "06:00:00",
  "horaFin": "14:00:00"
}
```

---

## Viajes (`/viajes`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/viajes/activos` | Listar viajes en curso (IN_PROGRESS) con última ubicación |
| GET | `/viajes/:id` | Obtener viaje con últimas 20 ubicaciones GPS |
| GET | `/viajes/:id/ubicacion` | Última posición GPS del bus |
| POST | `/viajes/iniciar` | Iniciar viaje desde una asignación |
| PATCH | `/viajes/:id/finalizar` | Finalizar viaje |
| PATCH | `/viajes/:id/cancelar` | Cancelar viaje |

**Body POST iniciar:**
```json
{ "asignacionId": 1 }
```
**Body PATCH finalizar:**
```json
{ "razonFin": "COMPLETED_ROUTE", "velocidadPromedio": 35.5 }
```
**Razones de fin:** `COMPLETED_ROUTE` `MECHANICAL_FAILURE` `SHIFT_END` `EMERGENCY` `WEATHER` `OTHER`

---

## Terminales (`/terminales`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/terminales` | Listar terminales | `?lineaId=1` |
| GET | `/terminales/:id` | Obtener terminal | — |
| POST | `/terminales` | Crear terminal | — |
| PATCH | `/terminales/:id` | Actualizar terminal | — |
| DELETE | `/terminales/:id` | Eliminar terminal | — |

**Tipos:** `START` `END` `INTERMEDIATE` `TRANSFER_HUB`

---

## Incidentes (`/incidentes`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/incidentes` | Listar incidentes | `?conductorId=1&estado=PENDING&viajeId=5` |
| GET | `/incidentes/:id` | Obtener incidente | — |
| POST | `/incidentes` | Reportar incidente | — |
| PATCH | `/incidentes/:id/revisar` | Revisar incidente | — |
| DELETE | `/incidentes/:id` | Eliminar incidente | — |

**Tipos:** `MECHANICAL_FAILURE` `ACCIDENT` `PASSENGER_ISSUE` `ROAD_BLOCK` `WEATHER` `OTHER`
**Estados:** `PENDING` `IN_REVIEW` `RESOLVED` `CLOSED`

---

## Desvíos de Ruta (`/desvios`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/desvios` | Listar desvíos | `?viajeId=1&justificado=false` |
| GET | `/desvios/:id` | Obtener desvío | — |
| POST | `/desvios` | Registrar desvío detectado | — |
| PATCH | `/desvios/:id/justificar` | Justificar o rechazar desvío | — |

---

## Trasbordos (`/trasbordos`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/trasbordos` | Listar trasbordos | `?estado=SUGGESTED` |
| GET | `/trasbordos/:id` | Obtener trasbordo | — |
| POST | `/trasbordos` | Sugerir trasbordo | — |
| PATCH | `/trasbordos/:id/decidir` | Aceptar o rechazar trasbordo | — |
| DELETE | `/trasbordos/:id` | Eliminar trasbordo | — |

**Estados:** `SUGGESTED` `ACCEPTED` `REJECTED` `COMPLETED`

---

## Notificaciones (`/notificaciones`)

| Método | Ruta | Descripción | Query params |
|--------|------|-------------|--------------|
| GET | `/notificaciones` | Listar notificaciones | `?usuarioDestinoId=1&tipo=INCIDENT` |
| GET | `/notificaciones/:id` | Obtener notificación | — |
| POST | `/notificaciones` | Crear y enviar notificación (también vía WS) | — |
| PATCH | `/notificaciones/:id/leer/:usuarioId` | Marcar como leída | — |
| DELETE | `/notificaciones/:id` | Eliminar notificación | — |

**Tipos:** `SERVICE_ALERT` `ROUTE_DEVIATION` `MAINTENANCE` `INCIDENT` `PAYMENT` `SYSTEM`

---

## Preferencias de Usuario (`/preferencias`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/preferencias/:usuarioId` | Obtener preferencias |
| PUT | `/preferencias/:usuarioId` | Crear o actualizar preferencias |
| DELETE | `/preferencias/:usuarioId` | Eliminar preferencias |

**Body PUT:**
```json
{
  "criterioPreferido": "FASTEST",
  "maxCaminataMetros": 500,
  "maxTrasbordos": 2
}
```

---

## Favoritos (`/favoritos`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/favoritos/usuario/:usuarioId` | Listar favoritos del usuario |
| GET | `/favoritos/:id` | Obtener favorito por ID |
| POST | `/favoritos` | Crear favorito |
| PATCH | `/favoritos/:id` | Actualizar favorito |
| DELETE | `/favoritos/:id` | Eliminar favorito (soft delete) |

**Body POST:**
```json
{
  "usuarioId": 1,
  "alias": "Casa → Trabajo",
  "latitudOrigen": -17.783,
  "longitudOrigen": -63.182,
  "etiquetaOrigen": "Mi Casa",
  "latitudDestino": -17.760,
  "longitudDestino": -63.195,
  "etiquetaDestino": "Oficina"
}
```

---

## Enums de referencia

| Enum | Valores |
|------|---------|
| `UserRole` | `SUPERADMIN` `SINDICATO_ADMIN` `OPERATOR` `DRIVER` `PASSENGER` |
| `GeneralStatus` | `ACTIVE` `INACTIVE` `SUSPENDED` |
| `TripStatus` | `IN_PROGRESS` `COMPLETED` `CANCELLED` `PAUSED` |
| `BusOperationalStatus` | `ACTIVE` `MAINTENANCE` `INACTIVE` `OUT_OF_SERVICE` |
| `CredentialStatus` | `VALID` `EXPIRED` `SUSPENDED` `RENEWING` |
| `AssignmentStatus` | `SCHEDULED` `IN_PROGRESS` `COMPLETED` `CANCELLED` |
| `RouteDirection` | `OUTBOUND` `INBOUND` `CIRCULAR` |
| `TerminalType` | `START` `END` `INTERMEDIATE` `TRANSFER_HUB` |
| `IncidentType` | `MECHANICAL_FAILURE` `ACCIDENT` `PASSENGER_ISSUE` `ROAD_BLOCK` `WEATHER` `OTHER` |
| `NotificationType` | `SERVICE_ALERT` `ROUTE_DEVIATION` `MAINTENANCE` `INCIDENT` `PAYMENT` `SYSTEM` |
| `TransferStatus` | `SUGGESTED` `ACCEPTED` `REJECTED` `COMPLETED` |
