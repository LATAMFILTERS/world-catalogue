'use strict';

// EBP Phase 2 — manufacturer_code (EFM-XXXX) generation and validation.
// ADR-0015: cryptographically random (node:crypto, not Math.random), 4
// characters from a 32-char ambiguity-free alphabet (no 0/O, 1/I),
// non-sequential, not derived from name/country/real identity. Uniqueness,
// immutability, and format are additionally enforced at the DB level
// (UNIQUE + CHECK + trigger in migrations/ebp-phase2/001_schema.sql) — this
// module only guarantees a well-formed candidate and the retry loop; it is
// not itself the source of the uniqueness guarantee.

const { randomInt } = require('node:crypto');

// Ambiguity-free Crockford-like alphabet: digits 2-9, uppercase letters
// excluding I, L, O, U is not required by ADR-0015 (only O/0 and I/1 are
// listed) — this is exactly that 32-character set.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 4;
const CODE_FORMAT = /^EFM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;
const MAX_ATTEMPTS = 20;

function generateCandidate() {
  let suffix = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `EFM-${suffix}`;
}

function isValidFormat(code) {
  return typeof code === 'string' && CODE_FORMAT.test(code);
}

// isTaken: async (candidate) => boolean. Retries on collision up to
// MAX_ATTEMPTS; throws if it can't find a free code (practically
// unreachable at 32^4 = ~1M combinations, but never loop forever).
async function generateUniqueManufacturerCode(isTaken) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = generateCandidate();
    // eslint-disable-next-line no-await-in-loop
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new Error(`could not generate a unique manufacturer_code after ${MAX_ATTEMPTS} attempts`);
}

module.exports = { generateUniqueManufacturerCode, generateCandidate, isValidFormat, CODE_FORMAT };
