# Arquitectura del Backend NestJS - Transit AI

## Resumen Ejecutivo

Backend refactorizado con arquitectura modular escalable basada en principios SOLID:

- ✅ **Módulos por dominio** (Auth, Transporte, Operaciones, Finanzas)
- ✅ **Manejo centralizado de errores** (Global Exception Filter)
- ✅ **Validación automática de DTOs** (Global Validation Pipe)
- ✅ **Respuestas normalizadas** (Response Interceptor)
- ✅ **Tipado fuerte** con TypeScript e interfaces compartidas
- ✅ **Decoradores reutilizables** (@CurrentUser, @Roles, @Public)

## Estructura de Directorios

```
/src
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts    ← Manejo de errores global
│   ├── interceptors/
│   │   └── response.interceptor.ts     ← Normalización de respuestas
│   ├── pipes/
│   │   └── validation.pipe.ts          ← Validación automática de DTOs
│   ├── decorators/
│   │   └── index.ts                    ← @CurrentUser, @Roles, @Public
│   ├── interfaces/
│   │   └── response.interface.ts       ← Tipos de respuesta API
│   └── common.module.ts
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── guards/
│   └── auth.module.ts
│
├── usuarios/
│   ├── usuarios.controller.ts
│   ├── usuarios.service.ts
│   ├── dto/
│   └── usuarios.module.ts
│
├── lineas/                             ← Transporte
├── rutas/
├── conductores/
├── sindicatos/
├── terminales/
│
├── turnos/                             ← Operaciones
├── asignaciones/
├── viajes/
├── desvios/
├── trasbordos/
├── internos/
│
├── billetera/                          ← Finanzas
├── blockchain/
│
├── grabaciones/                        ← Monitoreo
├── incidentes/
├── notificaciones/
│
├── preferencias/                       ← Especialistas
├── favoritos/
├── planificador/
├── ia/
│
├── prisma/                             ← Base de datos
├── app.module.ts                       ← Punto de entrada
├── app.controller.ts
├── app.service.ts
├── main.ts
└── ARQUITECTURA_BACKEND.md             ← Este archivo
```

## Capas de la Aplicación

### 1. **Controladores (HTTP)**

Responsables de:
- Recibir peticiones HTTP
- Validar autenticación (@UseGuards)
- Delegar al servicio
- Retornar respuesta

```typescript
@UseGuards(JwtAuthGuard)
@Controller('billetera')
export class BilleteraController {
  constructor(private readonly billeteraService: BilleteraService) {}

  @Get()
  async resumen(@CurrentUser() usuario: any) {
    return this.billeteraService.resumen(usuario.id);
  }
}
```

### 2. **Servicios (Lógica de Negocio)**

Responsables de:
- Lógica de negocio pura
- Interacción con base de datos (Prisma)
- Transacciones con blockchain
- Integración con servicios externos (Stripe)

```typescript
@Injectable()
export class BilleteraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
  ) {}

  async resumen(userId: string): Promise<WalletResponse> {
    // Lógica de negocio
  }
}
```

### 3. **DTOs (Data Transfer Objects)**

Responsables de:
- Validar entrada de datos
- Transformar tipos
- Documentar contrato de API

```typescript
export class RecargarDto {
  @IsNumber()
  @Min(0.1)
  monto: number;

  @IsEnum(['TARJETA', 'TRANSFERENCIA'])
  metodo?: string;
}
```

### 4. **Infraestructura Global**

#### a) **Filtro de Excepciones**
```
HttpException / Error → HttpExceptionFilter → ErrorResponse normalizado
```

#### b) **Pipe de Validación**
```
Request Body → GlobalValidationPipe → DTO validado o BadRequestException
```

#### c) **Interceptor de Respuesta**
```
Response → ResponseInterceptor → SuccessResponse normalizado
```

## Flujo de Petición

```
Petición HTTP
    ↓
[Guardias] - JwtAuthGuard, RolesGuard, etc.
    ↓
[Pipes] - GlobalValidationPipe valida DTO
    ↓
[Controlador] - Delega a servicio
    ↓
[Servicio] - Ejecuta lógica de negocio
    ↓
[Interceptor] - Normaliza respuesta exitosa
    ↓
Respuesta JSON: { ok: true, data: T }
    ↓
[Si hay error]
    ↓
[Exception Filter] - Captura y normaliza error
    ↓
Respuesta JSON: { ok: false, error: "..." }
```

## Formatos de Respuesta

### Respuesta Exitosa

```json
{
  "ok": true,
  "data": {
    "id": "123",
    "nombre": "Línea 1",
    "tarifa": 2.5
  }
}
```

### Respuesta de Error

```json
{
  "ok": false,
  "error": "Billetera insuficiente",
  "message": "No tienes saldo suficiente para realizar la transacción",
  "statusCode": 400,
  "timestamp": "2024-12-15T10:30:00Z",
  "path": "/billetera/pagar"
}
```

### Respuesta Paginada

```json
{
  "ok": true,
  "data": [
    { "id": "1", "nombre": "Usuario 1" },
    { "id": "2", "nombre": "Usuario 2" }
  ],
  "pagination": {
    "total": 100,
    "skip": 0,
    "take": 10,
    "pages": 10
  }
}
```

## Módulos por Dominio

### Autenticación
- **auth.service**: Login, logout, refresh token
- **usuarios.service**: CRUD de usuarios
- Guardias: JwtAuthGuard, RolesGuard

### Transporte
- **lineas.service**: CRUD de líneas de transporte
- **rutas.service**: CRUD de rutas y paradas
- **conductores.service**: Gestión de conductores
- **sindicatos.service**: Administración de sindicatos

### Operaciones
- **turnos.service**: Asignación de turnos
- **asignaciones.service**: Validación de asignaciones
- **viajes.service**: Registro de viajes en progreso
- **desvios.service**: Tracking de desvíos de ruta
- **trasbordos.service**: Solicitudes de trasbordo

### Finanzas
- **billetera.service**: Pagos, recargas, transacciones
- **blockchain.service**: Interacción on-chain (Hardhat)
- Integración Stripe para pagos con tarjeta real

### Monitoreo
- **grabaciones.service**: Videos de cámaras de buses
- **incidentes.service**: Reportes de incidentes
- **notificaciones.service**: Sistema de notificaciones

### Especialistas
- **planificador.service**: Cálculo de rutas (Google Maps)
- **ia.service**: Machine Learning (ETA, congestión, preferencias)

## Decoradores Personalizados

### @CurrentUser()
Extrae usuario del JWT

```typescript
@Get()
async resumen(@CurrentUser() usuario: any) {
  // usuario.id, usuario.rol, etc.
}
```

### @Roles(...)
Valida roles permitidos

```typescript
@Roles('SUPERADMIN', 'SINDICATO_ADMIN')
@Patch('/config')
async actualizarConfig(@Body() dto: ConfigDto) {
  // ...
}
```

### @Public()
Marca endpoint público (sin autenticación)

```typescript
@Public()
@Post('register')
async register(@Body() dto: RegisterDto) {
  // ...
}
```

## Patrón de Inyección de Dependencias

```typescript
@Injectable()
export class BilleteraService {
  constructor(
    private readonly prisma: PrismaService,        // BD
    private readonly blockchain: BlockchainService, // Cripto
    private readonly stripe: Stripe,               // Pagos
  ) {}
}
```

NestJS resuelve automáticamente las dependencias:
1. Busca en el contenedor de inyección
2. Instancia si es necesario
3. Inyecta en el constructor

## Transacciones y Consistencia

### Transacciones de Base de Datos

```typescript
async pagarPasaje(userId: string, lineaId: string) {
  return this.prisma.$transaction(async (tx) => {
    // Decrementar saldo
    const wallet = await tx.wallet.update({...});
    
    // Crear transacción
    const txRecord = await tx.walletTransaction.create({...});
    
    // Ambas operaciones se ejecutan juntas o no se ejecuta ninguna
    return { wallet, txRecord };
  });
}
```

### Transacciones on-Chain (Blockchain)

```typescript
async pagarPorQr(qr: string, lineaId: string, passengerId: string) {
  // 1. Verificar QR
  const tokenData = verificarTokenQr(qr);
  
  // 2. Validar saldo en blockchain
  const balance = await this.blockchain.obtenerSaldo(passengerWallet);
  
  // 3. Ejecutar transacción on-chain
  const txHash = await this.blockchain.transferir(
    passengerWallet,
    driverWallet,
    monto
  );
  
  // 4. Registrar en BD
  await this.prisma.walletTransaction.create({...});
}
```

## Manejo de Errores

Los errores se generan así:

```typescript
if (!wallet) {
  throw new NotFoundException('Billetera no encontrada');
}

if (balance < amount) {
  throw new BadRequestException({
    error: 'Saldo insuficiente',
    message: `Necesitas Bs ${amount}, tienes Bs ${balance}`
  });
}

// El Exception Filter los captura y normaliza automáticamente
```

## Seguridad

### Autenticación
- JWT (JSON Web Tokens)
- Tokens de corta duración (15 min)
- Refresh tokens con rotación

### Autorización
- @Roles() para validar permisos
- Guards por endpoint
- Control de acceso a recursos

### Validación
- DTOs con class-validator
- Whitelist de propiedades (forbidNonWhitelisted)
- Transformación automática de tipos

### Cifrado
- Claves privadas cifradas en BD
- Variables de entorno para secretos
- No se devuelven keys privadas en respuestas

## Testing

### Inyección de Dependencias para Tests

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    BilleteraService,
    {
      provide: PrismaService,
      useValue: mockPrisma,
    },
  ],
}).compile();

const service = module.get<BilleteraService>(BilleteraService);
```

### Mocking de Servicios

```typescript
const mockBlockchain = {
  transferir: jest.fn().mockResolvedValue('0x123...'),
};

// Inyectar mock
```

## Próximos Pasos

- [ ] Implementar Rate Limiting (throttle)
- [ ] Agregar logging centralizado (Winston)
- [ ] Cache con Redis
- [ ] Eventos (event emitter para notificaciones)
- [ ] Scheduled Jobs (cron para mantenimiento)
- [ ] Documentación OpenAPI/Swagger
- [ ] Tests unitarios y E2E
- [ ] CI/CD pipeline

## Referencias

- NestJS Docs: https://docs.nestjs.com
- SOLID Principles
- Clean Architecture
- Repository Pattern (Prisma)
