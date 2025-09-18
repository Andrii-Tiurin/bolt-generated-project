import crypto from 'crypto';

const DEFAULT_ITERATIONS = 210000;
const DEFAULT_KEY_LENGTH = 32;
const DIGEST = 'sha512';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, DEFAULT_KEY_LENGTH, DIGEST);
  return `pbkdf2$${DEFAULT_ITERATIONS}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') {
    return false;
  }
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return false;
  }
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }
  const salt = Buffer.from(parts[2], 'hex');
  const hashBuffer = Buffer.from(parts[3], 'hex');
  if (salt.length === 0 || hashBuffer.length === 0) {
    return false;
  }
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, hashBuffer.length, DIGEST);
  try {
    return crypto.timingSafeEqual(hashBuffer, derivedKey);
  } catch (error) {
    return false;
  }
}
