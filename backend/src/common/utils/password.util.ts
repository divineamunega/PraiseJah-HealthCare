import * as crypto from 'crypto';
/**
 * Generates a cryptographically secure temporary password
 * @param length length of password, default 12
 */
export function generateTempPassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}
