# Guía de Contribución - Transit AI

¡Gracias por querer contribuir a Transit AI! Esta guía te ayudará a entender nuestros procesos y estándares.

## 📋 Requisitos Previos

- Node.js 20+
- Docker y Docker Compose
- Git
- Un fork del repositorio

## 🚀 Primeros Pasos

### 1. Fork y Clonar

```bash
# Fork el repositorio en GitHub

# Clonar tu fork
git clone https://github.com/TU_USUARIO/transit-ai.git
cd transit-ai

# Agregar remote upstream
git remote add upstream https://github.com/USUARIO_ORIGINAL/transit-ai.git
```

### 2. Crear rama de feature

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama de feature
git checkout -b feature/nombre-descriptivo
```

**Nomenclatura de ramas:**
- `feature/descripcion` - Nuevas funcionalidades
- `fix/descripcion` - Corrección de bugs
- `refactor/descripcion` - Refactorización de código
- `docs/descripcion` - Documentación
- `test/descripcion` - Tests y mejoras de testing

### 3. Desarrollo

```bash
# Instalar dependencias locales
make build

# Iniciar servicios
make up

# Backend (desarrollo con hot reload)
make dev-backend

# Frontend (desarrollo con hot reload)
make dev-frontend

# Ver logs
make logs
```

## ✅ Verificaciones Antes de Commit

### Backend (NestJS)

```bash
cd transit-ai-backend

# Linting
npm run lint

# Compilar TypeScript
npm run build

# Tests unitarios
npm test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend (Next.js)

```bash
cd frontend

# Linting
npm run lint

# Compilar TypeScript
npm run build

# Tests
npm test

# Build para verificar
npm run build
```

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ BIEN: Tipado fuerte, nombres descriptivos
interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

async function createUser(dto: CreateUserDto): Promise<User> {
  // Validación
  if (!isValidEmail(dto.email)) {
    throw new BadRequestException('Email inválido');
  }
  
  // Operación
  const user = await this.usersService.create(dto);
  return user;
}

// ❌ MAL: Sin tipos, nombres cortos, sin validación
async function create(d: any) {
  const u = await this.usersService.create(d);
  return u;
}
```

### Nomenclatura

```typescript
// Interfaces
interface UserDto {}
interface CreateUserRequest {}
interface UserResponse {}

// Clases
class UserService {}
class UserController {}

// Funciones
async function createUser() {}
function getUserById() {}
function isValidEmail() {}

// Constantes
const DEFAULT_PAGE_SIZE = 10;
const MAX_LOGIN_ATTEMPTS = 5;
```

### Comentarios

```typescript
// ✅ BIEN: Explica el POR QUÉ
// Validar email porque muchos usuarios tipean mal @gmail.com
if (!email.includes('@')) {
  throw new Error('Email inválido');
}

// ❌ MAL: Repetir el código
// Validar email
if (!email.includes('@')) {
  throw new Error('Email inválido');
}

// ✅ BIEN: JSDoc para métodos públicos
/**
 * Crear usuario con validación de email y contraseña
 * @param dto - Datos del usuario
 * @returns Usuario creado
 * @throws BadRequestException si datos son inválidos
 */
async createUser(dto: CreateUserDto): Promise<User> {
  // ...
}
```

### Estructura de Archivos

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── guards/
│   │       └── jwt.guard.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── repositories/
```

## 🧪 Testing

### Escribir Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('debería crear un usuario', async () => {
    const dto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const expectedUser: User = {
      id: '1',
      ...dto,
      createdAt: new Date(),
    };

    jest.spyOn(usersRepository, 'save').mockResolvedValue(expectedUser);

    const result = await service.create(dto);

    expect(result).toEqual(expectedUser);
    expect(usersRepository.save).toHaveBeenCalledWith(dto);
  });
});
```

### Coverage Mínimo

- Funciones públicas: 80%+
- Lógica de negocio: 90%+
- Excepto: Migraciones, archivos de configuración

## 🔄 Git Workflow

### Commits

```bash
# Commits atómicos y descriptivos
git commit -m "feat(auth): agregar validación de email en registro"
git commit -m "fix(billetera): corregir cálculo de saldo"
git commit -m "docs(api): actualizar documentación de endpoints"
git commit -m "test(users): agregar tests para UserService"
git commit -m "refactor(payments): simplificar lógica de pagos"
```

**Formato:**
```
<tipo>(<ámbito>): <descripción corta>

<descripción detallada si es necesario>

Fixes #123
```

**Tipos válidos:**
- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Cambios de formato (sin cambiar lógica)
- `refactor` - Refactorización de código
- `perf` - Mejora de performance
- `test` - Tests
- `chore` - Cambios de build, dependencies, etc.

### Push y Pull Request

```bash
# Actualizar con cambios upstream
git fetch upstream
git rebase upstream/main

# Push a tu fork
git push origin feature/nombre-descriptivo
```

**Pull Request Description Template:**

```markdown
## 📝 Descripción
Breve descripción de los cambios

## 🎯 Objetivo
Por qué se realizan estos cambios

## 🧪 Testing
- [ ] Tests unitarios pasan
- [ ] Tests E2E pasan
- [ ] Linting pasa
- [ ] TypeScript compila

## 📋 Checklist
- [ ] Código sigue estándares
- [ ] Documentación actualizada
- [ ] Sin valores hardcodeados
- [ ] Sin console.log o debugger

## 🔗 Issues Relacionados
Fixes #123
Related to #456
```

## 🐳 Docker en Desarrollo

```bash
# Construir sin caché
docker-compose build --no-cache

# Ejecutar en contenedor
docker-compose up

# Acceso interactivo
docker-compose exec backend npm test
docker-compose exec backend /bin/sh

# Limpiar datos
docker-compose down -v
```

## 📚 Recursos

- [CLAUDE.md](./CLAUDE.md) - Arquitectura del proyecto
- [README.md](./README.md) - Setup y uso
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## ❓ Preguntas?

- Abre un **Issue** en GitHub
- Revisa issues existentes
- Pregunta en **Discussions**

## 📄 Licencia

Al contribuir, aceptas que tu código será licenciado bajo MIT.

---

**Última actualización:** 2026-06-20  
¡Gracias por contribuir a Transit AI! 🚀
