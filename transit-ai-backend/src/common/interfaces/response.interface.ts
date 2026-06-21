/**
 * Interfaces de Respuesta Estandarizada
 *
 * Define la forma de todas las respuestas de la API
 * Proporciona tipado fuerte para frontend
 */

/**
 * Respuesta exitosa genérica
 */
export interface SuccessResponse<T = any> {
  ok: true;
  data?: T;
  message?: string;
}

/**
 * Respuesta de error genérica
 */
export interface ErrorResponse {
  ok: false;
  error: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  details?: Record<string, any>;
}

/**
 * Tipo unión de respuestas
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  ok: true;
  data: T[];
  pagination: {
    total: number;
    skip: number;
    take: number;
    pages: number;
  };
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  ok: true;
  data: {
    usuario: {
      id: string;
      nombre: string;
      email: string;
      rol: 'PASSENGER' | 'DRIVER' | 'SUPERADMIN' | 'SINDICATO_ADMIN';
    };
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Respuesta de billetera
 */
export interface WalletResponse {
  ok: true;
  data: {
    address: string;
    categoria: 'GENERAL' | 'ESTUDIANTE' | 'ADULTO_MAYOR';
    saldoBs: number;
    saldoCentavos: number;
  };
}

/**
 * Respuesta de transacción
 */
export interface TransactionResponse {
  ok: true;
  data: {
    id: string;
    tipo: 'TOPUP' | 'FARE_PAYMENT' | 'PASS_PURCHASE';
    montoBs: number;
    tarifaBaseBs?: number;
    txHash: string;
    blockNumber: number | null;
    fecha: string;
  };
}

/**
 * Respuesta de QR
 */
export interface QrResponse {
  ok: true;
  data: {
    qr: string;
    expiraEnSeg: number;
  };
}
