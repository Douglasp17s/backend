import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

/**
 * Cifrado simétrico AES-256-GCM para guardar la llave privada de cada billetera
 * custodial en la base de datos. La clave maestra viene de WALLET_ENCRYPTION_KEY.
 *
 * Formato almacenado: iv:authTag:textoCifrado (todo en hex).
 */
function claveMaestra(): Buffer {
  const secreto = process.env.WALLET_ENCRYPTION_KEY;
  if (!secreto) {
    throw new Error(
      'WALLET_ENCRYPTION_KEY no configurada. Define la variable de entorno en .env',
    );
  }
  // Deriva 32 bytes a partir del secreto (válido aunque el secreto sea corto).
  return scryptSync(secreto, 'transit-pay-salt', 32);
}

export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', claveMaestra(), iv);
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${cifrado.toString('hex')}`;
}

export function descifrar(payload: string): string {
  const [ivHex, tagHex, datosHex] = payload.split(':');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    claveMaestra(),
    Buffer.from(ivHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(datosHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}
