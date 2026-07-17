'use strict';

// EBP Phase 3 — readable, non-sequential operational codes for Batches and
// Offers. Same generation discipline as Phase 2's EFM-XXXX (ADR-0015):
// cryptographically random (node:crypto, not Math.random), 32-char
// ambiguity-free alphabet (no 0/O, 1/I), retry-on-collision.

const { randomInt } = require('node:crypto');

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const SUFFIX_LENGTH = 6;
const MAX_ATTEMPTS = 20;

const BATCH_CODE_FORMAT = /^MRB-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
const OFFER_CODE_FORMAT = /^OFR-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

function generateCandidate(prefix) {
  let suffix = '';
  for (let i = 0; i < SUFFIX_LENGTH; i += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${suffix}`;
}

async function generateUniqueCode(prefix, isTaken) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = generateCandidate(prefix);
    // eslint-disable-next-line no-await-in-loop
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new Error(`could not generate a unique ${prefix} code after ${MAX_ATTEMPTS} attempts`);
}

module.exports = {
  generateUniqueBatchCode: (isTaken) => generateUniqueCode('MRB', isTaken),
  generateUniqueOfferCode: (isTaken) => generateUniqueCode('OFR', isTaken),
  BATCH_CODE_FORMAT,
  OFFER_CODE_FORMAT,
};
