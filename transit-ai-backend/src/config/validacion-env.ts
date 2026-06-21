/**
 * Validación de variables de entorno
 *
 * Se ejecuta al iniciar la aplicación para asegurar que todas
 * las variables necesarias estén configuradas correctamente
 */

/**
 * Variables de entorno requeridas
 */
const VARIABLES_REQUERIDAS = {
  NODE_ENV: 'Ambiente (development, staging, production)',
  PORT: 'Puerto del servidor',
  DATABASE_URL: 'URL de conexión a PostgreSQL',
  JWT_SECRET: 'Secreto para firmar tokens JWT',
  JWT_EXPIRATION: 'Expiración del token (ej: 15m)',
  REFRESH_TOKEN_EXPIRATION: 'Expiración del refresh token (ej: 7d)',
  BLOCKCHAIN_RPC_URL: 'URL RPC del nodo blockchain',
  BLOCKCHAIN_NETWORK: 'Red blockchain (localhost, sepolia, mainnet)',
  BLOCKCHAIN_OWNER_KEY: 'Clave privada del propietario del contrato',
  WALLET_ENCRYPTION_KEY: 'Clave para cifrar wallets custodiales',
  BILLETERA_QR_SECRET: 'Secreto para tokens QR',
  STRIPE_SECRET_KEY: 'Clave secreta de Stripe',
  STRIPE_PUBLISHABLE_KEY: 'Clave publicable de Stripe',
  STRIPE_CURRENCY: 'Moneda para Stripe (BOB)',
  FRONTEND_URL: 'URL del frontend para CORS',
} as const;

/**
 * Variables de entorno opcionales (con valores por defecto)
 */
const VARIABLES_OPCIONALES: Record<string, string> = {
  LOG_LEVEL: 'info',
  DEBUG_SQL: 'false',
  REQUEST_TIMEOUT: '30000',
  RATE_LIMIT_MAX: '100',
  ABONO_VIAJES: '40',
  ABONO_DIAS: '30',
};

/**
 * Valida que todas las variables de entorno requeridas estén presentes
 * @throws Error si falta alguna variable requerida
 */
export function validarVariablesEntorno(): void {
  const variablesAusentes: string[] = [];

  // Verificar variables requeridas
  for (const [variable, descripcion] of Object.entries(VARIABLES_REQUERIDAS)) {
    if (!process.env[variable]) {
      variablesAusentes.push(`- ${variable}: ${descripcion}`);
    }
  }

  if (variablesAusentes.length > 0) {
    const mensaje = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ VARIABLES DE ENTORNO FALTANTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Las siguientes variables de entorno son REQUERIDAS:

${variablesAusentes.join('\n')}

PASOS PARA ARREGLARLO:
1. Copia .env.example a .env
2. Rellena todos los valores en .env
3. Nunca commits .env al repositorio

Para desarrollo local, algunos valores por defecto pueden funcionar.
Para PRODUCCIÓN, TODOS los valores deben ser seguros y únicos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    throw new Error(mensaje);
  }

  // Validaciones específicas
  validarJwtSecret();
  validarDatabaseUrl();
  validarBlockchainConfig();
  validarStripeKeys();
  validarProduccion();
}

/**
 * Valida el JWT_SECRET
 */
function validarJwtSecret(): void {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length < 32) {
    console.warn(
      '⚠️  JWT_SECRET es muy corto. Usa al menos 32 caracteres para producción.'
    );
  }
}

/**
 * Valida la DATABASE_URL
 */
function validarDatabaseUrl(): void {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith('postgresql://')) {
    console.warn(
      '⚠️  DATABASE_URL debe ser una conexión PostgreSQL válida'
    );
  }
}

/**
 * Valida configuración de blockchain
 */
function validarBlockchainConfig(): void {
  const network = process.env.BLOCKCHAIN_NETWORK;

  if (!['localhost', 'sepolia', 'mainnet'].includes(network || '')) {
    console.warn(
      `⚠️  BLOCKCHAIN_NETWORK="${network}" no es válido. ` +
      'Usa: localhost, sepolia, mainnet'
    );
  }

  if (network === 'mainnet' && !process.env.BLOCKCHAIN_OWNER_KEY) {
    throw new Error(
      'BLOCKCHAIN_OWNER_KEY es OBLIGATORIO para mainnet'
    );
  }
}

/**
 * Valida claves de Stripe
 */
function validarStripeKeys(): void {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publicKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (secretKey && !secretKey.startsWith('sk_')) {
    console.warn('⚠️  STRIPE_SECRET_KEY debe comenzar con sk_');
  }

  if (publicKey && !publicKey.startsWith('pk_')) {
    console.warn('⚠️  STRIPE_PUBLISHABLE_KEY debe comenzar con pk_');
  }
}

/**
 * Validaciones para producción
 */
function validarProduccion(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  console.log('🔒 Ejecutándose en PRODUCCIÓN - Realizando verificaciones...');

  const erroresProd: string[] = [];

  // En producción, ciertos valores no deben tener defaults
  if (process.env.FRONTEND_URL?.includes('localhost')) {
    erroresProd.push('FRONTEND_URL apunta a localhost en PRODUCCIÓN');
  }

  if (process.env.BLOCKCHAIN_NETWORK === 'localhost') {
    erroresProd.push(
      'BLOCKCHAIN_NETWORK está en localhost en PRODUCCIÓN'
    );
  }

  if (process.env.DEBUG_SQL === 'true') {
    console.warn('⚠️  DEBUG_SQL está habilitado en PRODUCCIÓN - riesgo de seguridad');
  }

  if (erroresProd.length > 0) {
    throw new Error(
      `Configuración no válida para PRODUCCIÓN:\n${erroresProd.join('\n')}`
    );
  }

  console.log('✅ Configuración de producción validada');
}

/**
 * Obtiene una variable de entorno con valor por defecto
 */
export function obtenerConfig(clave: string, defecto?: string): string {
  return process.env[clave] || defecto || '';
}
