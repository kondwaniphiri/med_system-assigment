const { randomBytes, scrypt, timingSafeEqual } = require('crypto');
const derive = require('util').promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${(await derive(password, salt, 64)).toString('hex')}`;
}
async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  if (!stored.startsWith('scrypt$')) {
    // Upgrade existing plaintext accounts after a successful login.
    const a = Buffer.from(password), b = Buffer.from(stored);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const [, salt, hex] = stored.split('$');
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hex)) return false;
  return timingSafeEqual(await derive(password, salt, 64), Buffer.from(hex, 'hex'));
}
module.exports = { hashPassword, verifyPassword };
