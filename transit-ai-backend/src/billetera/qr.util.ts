import { createHmac } from 'crypto';

/**
 * Token de pago por QR. El pasajero genera un token de corta duración firmado
 * con HMAC; el chofer lo escanea y el backend verifica la firma antes de cobrar.
 *
 * Formato: base64url(payloadJson).firmaHex
 */
interface QrPayload {
  u: string; // userId del pasajero
  exp: number; // expiración (unix ms)
}

function secreto(): string {
  const secret = process.env.BILLETERA_QR_SECRET;
  if (!secret) {
    throw new Error(
      'BILLETERA_QR_SECRET no configurada. Define la variable de entorno en .env',
    );
  }
  return secret;
}

function firmar(base: string): string {
  return createHmac('sha256', secreto()).update(base).digest('hex');
}

/** Genera un token de pago válido por `segundos` (default 90s). */
export function generarTokenQr(userId: string, segundos = 90): string {
  const payload: QrPayload = { u: userId, exp: Date.now() + segundos * 1000 };
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${base}.${firmar(base)}`;
}

/** Verifica el token y devuelve el userId del pasajero, o null si es inválido/expiró. */
export function verificarTokenQr(token: string): string | null {
  const [base, firma] = (token || '').split('.');
  if (!base || !firma) return null;
  if (firmar(base) !== firma) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(base, 'base64url').toString('utf8'),
    ) as QrPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload.u;
  } catch {
    return null;
  }
}
