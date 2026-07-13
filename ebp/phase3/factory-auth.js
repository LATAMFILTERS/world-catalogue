'use strict';

// EBP Phase 3 — Factory user authentication primitives (ADR-0023).
// Resolves ADR-0002 for Manufacturers only. Zero new npm dependencies:
// node:crypto covers password hashing (scrypt), token generation
// (randomBytes), and token hashing (sha256).

const { scrypt, randomBytes, randomUUID, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);

const SCRYPT_KEYLEN = 64;
const SESSION_TOKEN_BYTES = 32;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// Format: scrypt$<salt-hex>$<hash-hex> — self-describing so the algorithm
// could be swapped later without a full-table migration (ADR-0023).
async function hashPassword(plaintext) {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(plaintext, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(plaintext, storedHash) {
  if (typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derivedKey = await scryptAsync(plaintext, salt, expected.length);
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

// Raw token is returned to the caller exactly once; only the hash is ever
// persisted (ADR-0023). Used for both session tokens and invite/reset tokens.
function generateOpaqueToken() {
  const raw = randomBytes(SESSION_TOKEN_BYTES).toString('hex');
  return { raw, hash: hashToken(raw) };
}

function hashToken(rawToken) {
  return createHash('sha256').update(rawToken).digest('hex');
}

function sessionExpiryFromNow() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function inviteExpiryFromNow() {
  return new Date(Date.now() + INVITE_TTL_MS);
}

function passwordResetExpiryFromNow() {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MS);
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateOpaqueToken,
  hashToken,
  sessionExpiryFromNow,
  inviteExpiryFromNow,
  passwordResetExpiryFromNow,
  randomUUID,
  MAX_FAILED_LOGINS,
  LOCKOUT_MS,
};
