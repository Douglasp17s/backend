# Transit AI — Backend API

Sistema de transporte público inteligente con seguimiento GPS en tiempo real, planificación de rutas, IA y pagos sobre blockchain.  
**Stack:** NestJS · Prisma · PostgreSQL · Socket.IO · Hardhat/Solidity (billetera)

---

## Inicio rápido

```bash
npm install
cp .env.example .env   # configurar variables de entorno (IMPORTANTE: ver abajo)
npx prisma migrate dev
npm run seed           # datos de prueba
npm run start:dev
```

El servidor corre en **`http://localhost:4000`** por defecto.

> ⚠️ **NOTA IMPORTANTE:** El archivo `.env` contiene secretos sensibles y **NO debe ser rastreado en git**. Ver sección de seguridad abajo.

---

## Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL | ✅ |
| `JWT_SECRET` | Clave secreta para firmar tokens | ✅ |
| `JWT_EXPIRATION` | Duración del access token (ej: `15m`) | ✅ |
| `REFRESH_TOKEN_EXPIRATION` | Duración del refresh token (ej: `7d`) | ✅ |
| `PORT` | Puerto del servidor (default: `4000`) | ❌ |
| `GOOGLE_CLIENT_ID` | Client ID para login con Google OAuth | ❌ |
| `GOOGLE_MAPS_API_KEY` | API Key para ETA real y tráfico (Distance Matrix API) | ❌ |
| `BLOCKCHAIN_RPC_URL` | URL del nodo blockchain (default: `http://127.0.0.1:8545`) | ⛓️ |
| `BLOCKCHAIN_NETWORK` | Red desplegada (default: `localhost`) | ⛓️ |
| `BLOCKCHAIN_OWNER_KEY` | Llave privada del backend (owner del contrato) | ⛓️ |
| `WALLET_ENCRYPTION_KEY` | Clave para cifrar las llaves privadas custodiales | ⛓️ |
| `BILLETERA_QR_SECRET` | Secreto para firmar los tokens QR de pago | ⛓️ |
| `ABONO_VIAJES` | Viajes equivalentes que cubre un abono (default: `40`) | ❌ |
| `ABONO_DIAS` | Días de validez del abono (default: `30`) | ❌ |

> Sin `GOOGLE_MAPS_API_KEY` el sistema usa cálculo propio de ETA basado en velocidad GPS de la flota.  
> ⛓️ = requeridas solo para el módulo de **Billetera / Blockchain**. Si faltan, ese módulo se deshabilita solo (los `/billetera/*` responden 503) y el resto del backend funciona normal. Ver **[BLOCKCHAIN.md](BLOCKCHAIN.md)** para el setup completo.

---

## 🔐 Seguridad

### Variables de Entorno Sensibles

**NUNCA commits `.env` al repositorio.** El archivo contiene:
- Claves privadas de Ethereum
- Secretos JWT
- Claves de Stripe
- Contraseñas de base de datos

Si accidentalmente está rastreado en git:
```bash
git rm --cached .env
git commit -m "Remover .env con secretos"
# Luego ROTAR todos los secretos en servicios externos (Stripe, etc)
```

### CORS
El backend está configurado para aceptar requests **solo desde `FRONTEND_URL`**.

Si necesitas cambiar el origen permitido, edita `FRONTEND_URL` en `.env`:
```
FRONTEND_URL=https://tudominio.com
```

### Validación
- ✅ Todas las variables requeridas se validan al iniciar
- ✅ DTOs validan entrada automáticamente
- ✅ JWT con expiración (15 minutos)
- ⚠️ TODO: Agregar rate limiting a endpoints públicos

Ver `AUDITORIA.md` para más detalles de seguridad.

---

## 📋 Documentación Reciente

- **[AUDITORIA.md](AUDITORIA.md)** - Auditoría técnica completa (problemas, severidad, recomendaciones)
- **[CAMBIOS.md](CAMBIOS.md)** - Cambios realizados en esta sesión
- **[ARQUITECTURA_BACKEND.md](src/ARQUITECTURA_BACKEND.md)** - Arquitectura detallada del backend

---

## Autenticación

Todos los endpoints marcados con 🔒 requieren el header:

```
Authorization: Bearer <accessToken>
```

El token se obtiene desde `POST /auth/login` o `POST /auth/google`.

---

## WebSockets

| Namespace | URL | Descripción |
|---|---|---|
| Viajes GPS | `ws://localhost:4000/viajes` | Ubicación de buses en tiempo real |
| Incidentes | `ws://localhost:4000/incidentes` | Nuevos incidentes reportados |
| Notificaciones | `ws://localhost:4000/notificaciones` | Notificaciones push en tiempo real |

### Namespace `/viajes`

**Cliente → Servidor:**

| Evento | Payload | Descripción |
|---|---|---|
| `suscribir-viaje` | `{ viajeId: string }` | Escuchar actualizaciones de un viaje específico |
| `desuscribir-viaje` | `{ viajeId: string }` | Dejar de escuchar un viaje |
| `suscribir-linea` | `{ lineaId: string }` | Escuchar buses de una línea (admin/pasajero) |
| `suscribir-sindicato` | `{ sindicatoId: string }` | Escuchar todos los buses de un sindicato |
| `suscribir-admin-global` | — | Escuchar todos los buses (superadmin) |
| `desuscribir-sindicato` | `{ sindicatoId: string }` | Dejar de escuchar el sindicato |
| `ubicacion-conductor` | `{ viajeId, latitud, longitud, velocidad, rumbo, precisionMetros?, nivelBateria? }` | Conductor envía su posición GPS |
| `finalizar-viaje` | `{ viajeId, razonFin?, velocidadPromedio? }` | Finalizar viaje desde el conductor |

**Servidor → Cliente:**

| Evento | Payload | Descripción |
|---|---|---|
| `ubicacion-actualizada` | `{ viajeId, latitud, longitud, rumbo, velocidad, registradoEn }` | Nueva posición (sala del viaje) |
| `bus-actualizado` | `{ viajeId, latitud, longitud, rumbo, velocidad, lineaId, sindicatoId, registradoEn }` | Nueva posición (sala de línea/sindicato/admin) |
| `viaje-finalizado` | `{ viajeId, estado, razonFin, finalizadoEn }` | El viaje fue finalizado |

### Namespace `/notificaciones`

**Cliente → Servidor:**

| Evento | Payload | Descripción |
|---|---|---|
| `suscribir-usuario` | `{ usuarioId: string }` | Recibir notificaciones personales |
| `suscribir-rol` | `{ rol: string }` | Recibir notificaciones por rol (ej: `DRIVER`) |

**Servidor → Cliente:**

| Evento | Payload | Descripción |
|---|---|---|
| `nueva-notificacion` | `{ id, titulo, cuerpo, tipo }` | Nueva notificación recibida |

### Namespace `/incidentes`

**Servidor → Cliente:**

| Evento | Payload | Descripción |
|---|---|---|
| `nuevo-incidente` | `{ id, tipo, descripcion, reportadoEn }` | Nuevo incidente reportado |

---

## Credenciales de prueba (seed)

| Rol | Email | Contraseña |
|---|---|---|
| Super Admin | `admin@transit.bo` | `password123` |
| Admin Sindicato | `admin.norte@transit.bo` | `password123` |
| Conductor 1 | `conductor1@transit.bo` | `password123` |
| Conductor 2 | `conductor2@transit.bo` | `password123` |
| Pasajero | `pasajero@transit.bo` | `password123` |

---

## Endpoints REST

### 🔐 Auth — `/auth`

| Método | Ruta | Auth | Body | Descripción |
|---|---|---|---|---|
| POST | `/auth/register` | ❌ | `{ email, nombre, password, telefono? }` | Registrar nuevo usuario (rol PASSENGER por defecto) |
| POST | `/auth/login` | ❌ | `{ email, password }` | Iniciar sesión |
| POST | `/auth/google` | ❌ | `{ idToken }` | Login/registro con Google (idToken del cliente GSI) |
| POST | `/auth/refresh` | ❌ | `{ refreshToken }` | Renovar access token |
| POST | `/auth/logout` | 🔒 | — | Cerrar sesión y revocar refresh tokens |

**Respuesta de login / google:**
```json
{
  "usuario": { "id": "1", "nombre": "María García", "email": "...", "rol": "PASSENGER" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### 🏢 Sindicatos — `/sindicatos` 🔒

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/sindicatos` | Listar todos los sindicatos |
| GET | `/sindicatos/:id` | Obtener sindicato por ID |
| POST | `/sindicatos` | Crear sindicato |
| PATCH | `/sindicatos/:id` | Actualizar sindicato |
| DELETE | `/sindicatos/:id` | Eliminar sindicato |

---

### 👤 Usuarios — `/usuarios` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/usuarios` | `rol?` | Listar usuarios (filtrado por sindicato del usuario autenticado) |
| GET | `/usuarios/:id` | — | Obtener usuario |
| POST | `/usuarios` | — | Crear usuario |
| PATCH | `/usuarios/:id` | — | Actualizar usuario |
| DELETE | `/usuarios/:id` | — | Eliminar usuario |

---

### 🚗 Conductores — `/conductores` 🔒

| Método | Ruta | Query | Body / Descripción |
|---|---|---|---|
| GET | `/conductores` | `lineaId?`, `sindicatoId?` | Listar conductores del sindicato del usuario |
| GET | `/conductores/:id` | — | Obtener conductor con datos de usuario |
| POST | `/conductores` | — | Crear conductor |
| PATCH | `/conductores/:id` | — | Actualizar conductor |
| PATCH | `/conductores/:id/credencial` | — | `{ estadoCredencial }` — Actualizar estado de licencia |
| DELETE | `/conductores/:id` | — | Eliminar conductor |

---

### 🛣️ Líneas — `/lineas` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/lineas` | `sindicatoId?` | Listar líneas activas |
| GET | `/lineas/:id` | — | Obtener línea |
| POST | `/lineas` | — | Crear línea |
| PATCH | `/lineas/:id` | — | Actualizar línea |
| DELETE | `/lineas/:id` | — | Eliminar línea |

---

### 🚌 Buses (Internos) — `/internos` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/internos` | `lineaId?` | Listar buses del sindicato |
| GET | `/internos/:id` | — | Obtener bus |
| POST | `/internos` | — | Registrar bus |
| PATCH | `/internos/:id` | — | Actualizar bus |
| DELETE | `/internos/:id` | — | Eliminar bus |

---

### 🗺️ Rutas — `/rutas` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/rutas` | `lineaId?` | Listar rutas (con puntos de grabación si existen) |
| GET | `/rutas/:id` | — | Obtener ruta |
| POST | `/rutas` | — | Crear ruta |
| PATCH | `/rutas/:id` | — | Actualizar ruta |
| DELETE | `/rutas/:id` | — | Eliminar ruta |

---

### 📹 Grabaciones de Ruta — `/grabaciones` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/grabaciones` | `lineaId?`, `estado?` | Listar grabaciones |
| GET | `/grabaciones/:id` | — | Obtener grabación con puntos GeoJSON |
| POST | `/grabaciones` | — | Subir grabación con puntos GPS |
| PATCH | `/grabaciones/:id/revisar` | — | `{ estado: 'APPROVED'|'REJECTED', notas? }` |

---

### ⏰ Turnos — `/turnos` 🔒

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/turnos` | Listar turnos |
| GET | `/turnos/:id` | Obtener turno |
| POST | `/turnos` | Crear turno (`name`: `MANANA` \| `TARDE` \| `NOCTURNO`) |
| PATCH | `/turnos/:id` | Actualizar turno |
| DELETE | `/turnos/:id` | Eliminar turno |

---

### 📋 Asignaciones Diarias — `/asignaciones` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| **GET** | **`/asignaciones/mi-asignacion-hoy`** | — | **Asignación del conductor autenticado para hoy** (incluye ruta con waypoints, bus y viaje activo) |
| GET | `/asignaciones` | `fecha?`, `conductorId?` | Listar asignaciones del sindicato |
| GET | `/asignaciones/:id` | — | Obtener asignación con viajes |
| POST | `/asignaciones` | — | Crear asignación |
| PATCH | `/asignaciones/:id` | — | Actualizar estado / fechas |
| DELETE | `/asignaciones/:id` | — | Cancelar asignación |

**Respuesta de `/asignaciones/mi-asignacion-hoy`:**
```json
{
  "id": "1",
  "status": "IN_PROGRESS",
  "startTime": "06:00:00",
  "endTime": "14:00:00",
  "internal": { "internalNumber": "101", "licensePlate": "SCZ-0001", "model": "Mercedes Benz" },
  "route": {
    "id": "1", "name": "L1 — IDA", "direction": "OUTBOUND",
    "routeRecording": { "recordedPoints": { "type": "LineString", "coordinates": [[lng, lat]] } }
  },
  "shift": { "name": "MANANA" },
  "trips": [{ "id": "1", "status": "IN_PROGRESS" }]
}
```

---

### 🚍 Viajes — `/viajes` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/viajes/activos` | `sindicatoId?`, `lineaId?`, `conductorId?` | Viajes en curso con última ubicación GPS y datos de línea |
| GET | `/viajes/:id` | — | Viaje completo con historial GPS, incidentes y asignación |
| GET | `/viajes/:id/ubicacion` | — | Última ubicación GPS del viaje |
| POST | `/viajes/iniciar` | — | `{ asignacionId }` — Iniciar viaje |
| PATCH | `/viajes/:id/finalizar` | — | `{ razonFin?, velocidadPromedio? }` |
| PATCH | `/viajes/:id/cancelar` | — | Cancelar viaje activo |

**Respuesta de `/viajes/activos` (resumen por elemento):**
```json
{
  "id": "1", "status": "IN_PROGRESS",
  "assignment": {
    "driver": { "user": { "name": "Pedro Rojas" } },
    "internal": {
      "internalNumber": "101", "licensePlate": "SCZ-0001",
      "line": { "id": "1", "name": "Línea 1", "code": "L1", "color": "#E63946" }
    },
    "route": { "name": "L1 — IDA", "direction": "OUTBOUND" },
    "syndicate": { "name": "Sindicato Norte" }
  },
  "locations": [{
    "latitude": "-17.78279200", "longitude": "-63.17033500",
    "speed": "35.00", "heading": "90.00", "recordedAt": "2026-05-23T..."
  }]
}
```

**Razones de fin de viaje:** `COMPLETED_ROUTE` | `MECHANICAL_FAILURE` | `SHIFT_END` | `EMERGENCY` | `WEATHER` | `OTHER`

---

### 🏁 Terminales — `/terminales` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/terminales` | `lineaId?` | Listar terminales |
| GET | `/terminales/:id` | — | Obtener terminal |
| POST | `/terminales` | — | Crear terminal |
| PATCH | `/terminales/:id` | — | Actualizar terminal |
| DELETE | `/terminales/:id` | — | Eliminar terminal |

---

### ⚠️ Incidentes — `/incidentes` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/incidentes` | `conductorId?`, `estado?`, `viajeId?` | Listar incidentes |
| GET | `/incidentes/:id` | — | Obtener incidente |
| POST | `/incidentes` | — | Reportar incidente (emite evento WS `nuevo-incidente`) |
| PATCH | `/incidentes/:id/revisar` | — | Revisar/cerrar incidente |
| DELETE | `/incidentes/:id` | — | Eliminar incidente |

**Body para crear:**
```json
{
  "viajeId": "1",
  "tipo": "MECHANICAL_FAILURE",
  "descripcion": "Falla en el motor",
  "latitud": -17.783,
  "longitud": -63.182,
  "pedirDetenerSeguimiento": false
}
```

**Tipos:** `MECHANICAL_FAILURE` | `ACCIDENT` | `PASSENGER_ISSUE` | `ROAD_BLOCK` | `WEATHER` | `OTHER`  
**Estados:** `PENDING` | `IN_REVIEW` | `RESOLVED` | `CLOSED`

---

### 🔀 Desvíos — `/desvios` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/desvios` | `viajeId?`, `justificado?` | Listar desvíos detectados |
| GET | `/desvios/:id` | — | Obtener desvío |
| POST | `/desvios` | — | Registrar desvío manualmente |
| PATCH | `/desvios/:id/justificar` | — | `{ justificacion }` — Justificar desvío |

---

### 🔄 Trasbordos — `/trasbordos` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/trasbordos` | `estado?` | Listar trasbordos internos |
| GET | `/trasbordos/:id` | — | Obtener trasbordo |
| POST | `/trasbordos` | — | Sugerir trasbordo entre viajes |
| PATCH | `/trasbordos/:id/decidir` | — | `{ decision: 'ACCEPTED'|'REJECTED' }` |
| DELETE | `/trasbordos/:id` | — | Eliminar trasbordo |

---

### 🔔 Notificaciones — `/notificaciones` 🔒

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/notificaciones` | `usuarioDestinoId?`, `tipo?` | Listar notificaciones |
| GET | `/notificaciones/:id` | — | Obtener notificación |
| POST | `/notificaciones` | — | Crear y emitir notificación via WS |
| PATCH | `/notificaciones/:id/leer/:usuarioId` | — | Marcar como leída para un usuario |
| DELETE | `/notificaciones/:id` | — | Eliminar notificación |

**Body para crear:**
```json
{
  "titulo": "Cambio de ruta",
  "cuerpo": "La línea 1 opera por ruta alterna hoy.",
  "tipo": "SERVICE_ALERT",
  "rolDestino": "DRIVER",
  "usuarioDestinoId": null,
  "expiraEn": null
}
```

> Si `rolDestino` tiene valor → broadcast a ese rol. Si `usuarioDestinoId` tiene valor → solo ese usuario. Si ambos son `null` → broadcast global.

**Tipos:** `SERVICE_ALERT` | `ROUTE_DEVIATION` | `MAINTENANCE` | `INCIDENT` | `PAYMENT` | `SYSTEM`

---

### ⭐ Favoritos — `/favoritos` 🔒

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/favoritos/usuario/:usuarioId` | Rutas favoritas del pasajero |
| GET | `/favoritos/:id` | Obtener favorito |
| POST | `/favoritos` | Guardar ruta favorita |
| PATCH | `/favoritos/:id` | Actualizar alias del favorito |
| DELETE | `/favoritos/:id` | Eliminar favorito |

**Body para crear:**
```json
{
  "usuarioId": 1,
  "alias": "Casa → Trabajo",
  "latitudOrigen": -17.79,
  "longitudOrigen": -63.19,
  "etiquetaOrigen": "Mi Casa",
  "latitudDestino": -17.783,
  "longitudDestino": -63.182,
  "etiquetaDestino": "Centro"
}
```

---

### ⚙️ Preferencias — `/preferencias` 🔒

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/preferencias/:usuarioId` | Obtener preferencias del pasajero |
| PUT | `/preferencias/:usuarioId` | Crear o actualizar preferencias (upsert) |
| DELETE | `/preferencias/:usuarioId` | Eliminar preferencias |

---

### 🗺️ Planificador de Rutas — `/planificador`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/planificador/calcular` | 🔒 | Calcular opciones de ruta entre dos puntos |
| GET | `/planificador/lineas-mapa` | ❌ | Líneas activas con puntos para visualizar en mapa |
| GET | `/planificador/opciones` | 🔒 | Alias GET de calcular |

**Body de `/planificador/calcular`:**
```json
{ "origenLat": -17.783, "origenLng": -63.182, "destinoLat": -17.793, "destinoLng": -63.188 }
```

**Respuesta (array de opciones ordenadas por tiempo):**
```json
[{
  "segmentos": [
    {
      "tipo": "caminata",
      "desde": { "lat": -17.783, "lng": -63.182 },
      "hasta": { "lat": -17.782, "lng": -63.171 },
      "puntosRuta": [[-17.783, -63.182]],
      "distanciaMetros": 350,
      "tiempoMin": 4
    },
    {
      "tipo": "bus",
      "linea": { "id": "1", "nombre": "Línea 1", "codigo": "L1", "color": "#E63946", "imageUrl": null, "tarifa": 2.5 },
      "embarque": { "lat": -17.782, "lng": -63.171 },
      "descenso": { "lat": -17.793, "lng": -63.188 },
      "puntosRuta": [[-17.782, -63.171], [-17.793, -63.188]],
      "distanciaKm": 3.1,
      "tiempoMin": 8
    }
  ],
  "tiempoTotalMin": 39,
  "tiempoEsperaMin": 10,
  "distanciaTotalKm": 3.1,
  "caminataMetros": 774,
  "transbordos": 0,
  "costoTotal": 2.50
}]
```

> `tiempoEsperaMin` se calcula con Google Maps Distance Matrix si `GOOGLE_MAPS_API_KEY` está configurada, o con velocidad GPS de la flota activa como fallback.

---

### 🤖 IA — `/ia` 🔒

#### HU-20: Predicción de ETA

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/ia/eta/viaje/:viajeId` | `lat`, `lng` | ETA del bus de un viaje específico hacia punto de embarque |
| GET | `/ia/eta/linea/:lineaId` | `lat`, `lng` | ETA del bus más cercano de la línea hacia punto de embarque |

**Respuesta:**
```json
{
  "etaMin": 7,
  "fuente": "google",
  "factorTraficoPct": 25,
  "distanciaM": 1200,
  "velocidadKmh": 18
}
```

> **`fuente: "google"`** → usa Google Distance Matrix con tráfico en tiempo real (requiere `GOOGLE_MAPS_API_KEY`).  
> **`fuente: "propio"`** → cálculo con haversine + velocidad GPS actual del bus.

#### HU-21: Detección de Congestión

| Método | Ruta | Query | Descripción |
|---|---|---|---|
| GET | `/ia/congestion` | `lat`, `lng`, `radio?` (metros, default: 600) | Nivel de congestión en un punto geográfico |
| GET | `/ia/congestion/zonas` | — | Zonas de congestión activas detectadas en toda la flota |

**Respuesta de `/ia/congestion`:**
```json
{
  "nivel": "ALTO",
  "velocidadPromedioKmh": 14,
  "busesEnZona": 3,
  "fuente": "google",
  "descripcion": "Tráfico denso (Google Maps)",
  "factorDemora": 65
}
```

**Niveles:** `BAJO` | `MODERADO` | `ALTO` | `CRITICO`  
**Fuentes:** `google` (con API key activa) | `flota` (velocidad de buses propios en la zona)

**Respuesta de `/ia/congestion/zonas`:**
```json
[
  { "lat": -17.783, "lng": -63.182, "nivel": "ALTO", "velocidadKmh": 12, "buses": 2 },
  { "lat": -17.791, "lng": -63.174, "nivel": "CRITICO", "velocidadKmh": 6, "buses": 3 }
]
```

#### HU-22: Preferencias y Aprendizaje

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/ia/preferencias/:usuarioId` | — | Preferencias + patrones aprendidos del pasajero |
| PATCH | `/ia/preferencias/:usuarioId` | `{ criterioPrincipal?, maxCaminataMetros?, maxTransbordos? }` | Actualizar preferencias manualmente |
| POST | `/ia/preferencias/:usuarioId/uso` | `{ criterio }` | Registrar criterio usado en cálculo (llamar tras cada búsqueda) |

**Criterios válidos para el campo `criterio`:** `rapida` | `economica` | `caminata`  
**Criterios almacenados internamente:** `FASTEST` | `LEAST_COST` | `LEAST_WALKING`

**Respuesta de GET:**
```json
{
  "criterioPrincipal": "FASTEST",
  "maxCaminataMetros": 500,
  "maxTransbordos": 2,
  "patronesAprendidos": {
    "criterioUsos": { "FASTEST": 8, "LEAST_COST": 3, "LEAST_WALKING": 1 },
    "totalCalculos": 12
  }
}
```

> El sistema aprende automáticamente el criterio preferido del pasajero al acumular usos. El criterio más frecuente se convierte en el `criterioPrincipal` guardado.

---

### ⛓️ Billetera / Blockchain — `/billetera` 🔒

Billeteras digitales y pago de pasajes sobre una blockchain local (Hardhat + Solidity).
El saldo es un token `TRC` (1 unidad = 1 centavo de Bs) que vive en el smart contract
`TransitPay`. Modelo **custodial**: el backend firma las transacciones por el usuario.
Requiere el nodo Hardhat corriendo y el contrato desplegado — ver **[BLOCKCHAIN.md](BLOCKCHAIN.md)**.

#### Billetera y operaciones del pasajero

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| POST | `/billetera` | — | Crea (si no existe) y devuelve la billetera del usuario |
| GET | `/billetera` | — | Saldo y datos de la billetera |
| POST | `/billetera/recargar` | `{ monto, metodo?, referencia? }` | Recarga saldo por medio tradicional (tarjeta/transferencia) |
| POST | `/billetera/pagar` | `{ lineaId }` | Paga el pasaje de una línea desde la billetera |
| GET | `/billetera/qr` | — | Genera el QR de pago del pasajero (válido 90s) |
| POST | `/billetera/pagar-qr` | `{ qr, lineaId }` | El chofer escanea el QR del pasajero y cobra |
| POST | `/billetera/abono` | `{ lineaId? }` | Compra un abono / pase mensual |
| GET | `/billetera/abono` | — | Abono vigente del usuario |
| GET | `/billetera/historial` | — | Últimas 50 transacciones de la billetera |

**Respuesta de `GET /billetera`:**
```json
{ "address": "0x70997...79C8", "categoria": "ESTUDIANTE", "saldoBs": 48.75, "saldoCentavos": 4875 }
```

**Respuesta de `POST /billetera/pagar` (o `/pagar-qr`):**
```json
{
  "ok": true,
  "linea": "Línea 1",
  "tarifaBaseBs": 2.50,
  "descuentoBs": 1.25,
  "tarifaPagadaBs": 1.25,
  "categoria": "ESTUDIANTE",
  "saldoBs": 47.50,
  "txHash": "0x...",
  "blockNumber": 12
}
```

> Cada pago se ejecuta on-chain en una sola transacción que aplica el descuento y
> reparte automáticamente el monto: **sindicato / chofer / sistema** (ver config).

#### Configuración del sistema (solo `SUPERADMIN` / `SINDICATO_ADMIN`)

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/billetera/config` | — | Descuentos, reparto y parámetros del abono vigentes |
| PATCH | `/billetera/config/descuento` | `{ categoria, porcentaje }` | Cambia el descuento de una categoría (on-chain, en vivo) |
| PATCH | `/billetera/config/reparto` | `{ sindicato, chofer }` | Cambia el reparto del pasaje en % (on-chain, en vivo) |
| POST | `/billetera/:usuarioId/categoria` | `{ categoria }` | Asigna la categoría de descuento a un usuario |

**Respuesta de `GET /billetera/config`:**
```json
{
  "descuentos": { "GENERAL": 0, "ESTUDIANTE": 50, "ADULTO_MAYOR": 30 },
  "reparto": { "sindicatoPct": 80, "choferPct": 15, "sistemaPct": 5 },
  "abono": { "viajes": 40, "dias": 30 }
}
```

**Ejemplos de body:**
```json
// PATCH /billetera/config/descuento
{ "categoria": "ESTUDIANTE", "porcentaje": 60 }

// PATCH /billetera/config/reparto   (sindicato + chofer ≤ 100; el resto es del sistema)
{ "sindicato": 70, "chofer": 20 }

// POST /billetera/:usuarioId/categoria
{ "categoria": "ADULTO_MAYOR" }
```

**Qué es configurable:**

| Parámetro | Cómo se cambia |
|---|---|
| Tarifa de cada línea | `PATCH /lineas/:id` (campo `tarifa`) |
| Descuentos por categoría | `PATCH /billetera/config/descuento` (on-chain) |
| Reparto sindicato/chofer/sistema | `PATCH /billetera/config/reparto` (on-chain) |
| Abono (viajes y validez) | `.env` → `ABONO_VIAJES`, `ABONO_DIAS` |

**Categorías de descuento:** `GENERAL` (0%) | `ESTUDIANTE` (50%) | `ADULTO_MAYOR` (30%) — valores por defecto, editables.  
**Tipos de transacción (historial):** `TOPUP` | `FARE_PAYMENT` | `PASS_PURCHASE`

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| `SUPERADMIN` | Administrador global — acceso total |
| `SINDICATO_ADMIN` | Administrador de un sindicato |
| `OPERATOR` | Operador/supervisor del sindicato |
| `DRIVER` | Conductor — acceso a su asignación y viajes |
| `PASSENGER` | Pasajero — planificador, favoritos y perfil |

---

## Enums de referencia

```
RouteDirection:       OUTBOUND | INBOUND | CIRCULAR
TripStatus:           IN_PROGRESS | COMPLETED | CANCELLED | PAUSED
TripEndReason:        COMPLETED_ROUTE | MECHANICAL_FAILURE | SHIFT_END | EMERGENCY | WEATHER | OTHER
AssignmentStatus:     SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
BusOperationalStatus: ACTIVE | MAINTENANCE | INACTIVE | OUT_OF_SERVICE
CredentialStatus:     VALID | EXPIRED | SUSPENDED | RENEWING
IncidentType:         MECHANICAL_FAILURE | ACCIDENT | PASSENGER_ISSUE | ROAD_BLOCK | WEATHER | OTHER
IncidentStatus:       PENDING | IN_REVIEW | RESOLVED | CLOSED
NotificationType:     SERVICE_ALERT | ROUTE_DEVIATION | MAINTENANCE | INCIDENT | PAYMENT | SYSTEM
TransferStatus:       SUGGESTED | ACCEPTED | REJECTED | COMPLETED
Turno:                MANANA | TARDE | NOCTURNO
WalletKind:           USER | SYNDICATE
WalletCategory:       GENERAL | ESTUDIANTE | ADULTO_MAYOR
WalletTxType:         TOPUP | FARE_PAYMENT | PASS_PURCHASE
```
