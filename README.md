# Transit AI - Sistema de Transporte Inteligente

Sistema integral de transporte público con IA, blockchain y aplicación móvil. Desarrollado con **NestJS**, **Next.js**, **Flutter** y **Hardhat**.

## 📋 Requisitos Previos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 20+ (para desarrollo local)
- **Git**

## 🚀 Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone <tu-repo-url>
cd REpo
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y completa:
- `JWT_SECRET` - Cambia a una clave segura
- `STRIPE_*` - APIs de Stripe (opcional)
- `NEXT_PUBLIC_MAPS_API_KEY` - Google Maps API key

### 3. Iniciar con Docker Compose

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📍 Acceso a Servicios

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend (Next.js) | http://localhost:3000 | 3000 |
| Backend API (NestJS) | http://localhost:4000 | 4000 |
| PostgreSQL | localhost | 5432 |
| Redis | localhost | 6379 |
| Hardhat (opcional) | http://localhost:8545 | 8545 |

**Credenciales BD:**
- Usuario: `transit_user`
- Contraseña: `transit_password`
- Base de datos: `transit_ai`

## 🐳 Comandos Docker

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar comandos en un contenedor
docker-compose exec backend npm run prisma migrate dev
docker-compose exec backend npm test

# Reconstruir una imagen
docker-compose up -d --build backend

# Limpiar todo (CUIDADO: borra datos)
docker-compose down -v
```

## 🔧 Desarrollo Local (Sin Docker)

### Backend

```bash
cd transit-ai-backend
cp .env.example .env

# Configurar BD local
export DATABASE_URL="postgresql://user:password@localhost:5432/transit_ai"

npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local

npm install
npm run dev
```

### Flutter

```bash
cd transt_ia_flutter
flutter pub get
flutter run
```

## 📦 Estructura del Proyecto

```
.
├── frontend/                  # Next.js + React + TypeScript
│   ├── src/
│   │   ├── app/              # App Router
│   │   ├── core/
│   │   │   ├── servicios/    # API clients base
│   │   │   └── tipos/        # DTOs
│   │   └── services/         # 18+ servicios tipados
│   └── Dockerfile
├── transit-ai-backend/        # NestJS + Prisma + Hardhat
│   ├── src/
│   │   ├── auth/
│   │   ├── billetera/
│   │   ├── lineas/
│   │   ├── rutas/
│   │   ├── conductores/
│   │   ├── viajes/
│   │   ├── ia/
│   │   └── planificador/
│   ├── prisma/
│   ├── hardhat/
│   └── Dockerfile
├── transt_ia_flutter/         # Flutter + Dart + GetX
│   ├── lib/
│   │   ├── config/
│   │   ├── modelos/
│   │   ├── servicios/
│   │   ├── widgets/
│   │   └── pantallas/
│   └── pubspec.yaml
├── transit-ai-ml/             # Python - Machine Learning
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🏗️ Arquitectura

### Backend (NestJS)

- **CommonModule**: Filtros, Interceptores, Pipes globales
- **Módulos por dominio**: Auth, Billetera, Transporte, Operaciones, IA
- **Respuesta normalizada**: `{ ok: boolean, data?: T, error?: string }`
- **ORM**: Prisma con PostgreSQL
- **Blockchain**: Hardhat (contratos smart)

### Frontend (Next.js)

- **App Router** con TypeScript
- **Tailwind CSS** para estilos
- **Zustand** para state management
- **Socket.io** para real-time
- **Servicios centralizados** extendiendo `ClienteApi`

### Colores del Sistema (VoltAgent)

```typescript
const COLORES = {
  primario: '#00d992',    // Verde electrónico
  fondo: '#0f0f0f',       // Negro profundo
  texto: '#e0e0e0',       // Gris claro
  error: '#ff4444',       // Rojo
  exito: '#00d992',       // Verde
};
```

## 🗄️ Base de Datos

### Inicializar BD

```bash
# Aplicar migraciones
docker-compose exec backend npx prisma migrate dev --name init

# Abrir GUI de Prisma
docker-compose exec backend npx prisma studio
```

**Modelos principales:**
- User (Pasajeros, Conductores, Operadores)
- Wallet (Billetera)
- WalletTransaction
- Line, Route, Stop
- Driver, Vehicle
- Trip, Segment
- Turn (Turno)

## 🔐 Seguridad

- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Variables de entorno (no hardcodear secretos)
- ✅ CORS configurado
- ✅ Rate limiting (implementar)
- ✅ Usuarios no-root en Docker

### Cambiar JWT Secret

```bash
# Generar nueva clave segura
openssl rand -base64 32

# Copiar en .env
JWT_SECRET=<tu-nueva-clave>

# Reiniciar backend
docker-compose restart backend
```

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ Tipado fuerte
interface PagarDto {
  lineaId: string;
  monto: number;
}

// ❌ Evitar any
const usuario: any = {};
```

### Nomenclatura

- **Servicios**: camelCase + "Servicio" (`billeteraServicio`)
- **Clases**: PascalCase (`BilleteraService`)
- **Módulos**: kebab-case (`billetera.module.ts`)
- **Interfaces**: PascalCase + sufijo (`RecargarDto`, `RespuestaPago`)

### Comentarios

Solo cuando el "por qué" no es obvio:

```typescript
// ✅ Explicar por qué
// Validar monto mínimo porque Stripe rechaza pagos < $0.50
if (amount < 0.5) throw new Error('Monto muy bajo');

// ❌ Repetir el código
// Validar monto
if (amount < 0.5) throw new Error('Monto muy bajo');
```

## 🧪 Testing

### Backend

```bash
docker-compose exec backend npm test              # Unit tests
docker-compose exec backend npm run test:e2e      # Integration tests
docker-compose exec backend npm run test:cov      # Coverage
```

### Frontend

```bash
cd frontend
npm test                        # Jest
npm run test:e2e               # Playwright
```

## 📊 Monitoreo

### Logs

```bash
# Todos los servicios
docker-compose logs -f

# Filtrar por servicio
docker-compose logs -f backend
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100 backend
```

### Health Checks

```bash
# Ver estado de salud
docker-compose ps

# Verificar manualmente
curl http://localhost:4000/health       # Backend
curl http://localhost:3000/             # Frontend
```

## 🚀 Deployment

### Preparar para producción

```bash
# 1. Generar nuevo JWT secret
openssl rand -base64 32

# 2. Cambiar en .env
JWT_SECRET=<nueva-clave-segura>
STRIPE_SECRET_KEY=sk_live_...
NODE_ENV=production

# 3. Compilar frontend
docker-compose build frontend

# 4. Compilar backend
docker-compose build backend

# 5. Subir imágenes a registry (DockerHub, AWS ECR, etc)
docker login
docker tag transit-ai-backend:latest username/transit-ai-backend:latest
docker push username/transit-ai-backend:latest
```

### Usando Docker Swarm o Kubernetes

```bash
# Docker Swarm
docker stack deploy -c docker-compose.yml transit-ai

# Kubernetes
helm install transit-ai ./helm-charts
```

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Ver logs
docker-compose logs backend

# Verificar conexión a BD
docker-compose exec backend psql -h postgres -U transit_user -d transit_ai

# Limpiar y reintentar
docker-compose down -v
docker-compose up -d
```

### Frontend no compila

```bash
# Limpiar caché de Next.js
docker-compose exec frontend rm -rf .next

# Reconstruir
docker-compose up -d --build frontend
```

### Puerto en uso

```bash
# Cambiar puerto en docker-compose.yml
# Por ejemplo, cambiar 3000:3000 a 8000:3000

# O liberar puerto
sudo lsof -i :3000
sudo kill -9 <PID>
```

## 📚 Documentación Adicional

- [CLAUDE.md](./CLAUDE.md) - Guía de desarrollo
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Flutter Docs](https://flutter.dev/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Docker Docs](https://docs.docker.com)

## 👥 Contribuir

1. Crear rama: `git checkout -b feature/mi-feature`
2. Hacer cambios y commitear
3. Push a la rama: `git push origin feature/mi-feature`
4. Crear Pull Request

### Verificaciones antes de commit

- [ ] `npm run build` - Compila sin errores
- [ ] `npm run lint` - Pasa linting
- [ ] `npm test` - Tests pasan
- [ ] Sin valores hardcodeados
- [ ] Tipado TypeScript correcto
- [ ] DTOs validan correctamente

## 📄 Licencia

[MIT](./LICENSE)

## 📧 Contacto

Para preguntas: padilladouglas6@gmail.com

---

**Última actualización**: 2026-06-20  
**Versión**: 1.0
