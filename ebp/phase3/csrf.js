'use strict';

// EBP Phase 3 — Factory Portal CSRF protection (ADR-0033). Synchronizer-
// token pattern: a cryptographically random token is generated at login,
// stored on the session row, embedded as a hidden `_csrf` field on every
// server-rendered form, and compared with a timing-safe equality check
// on every state-changing request. SameSite=Strict on the session cookie
// is defense in depth, never treated as the sole mitigation.

const crypto = require('node:crypto');

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Constant-time comparison that never throws on a missing/malformed
// value and never leaks timing information through an early-return
// length check on attacker-controlled input.
function csrfTokensMatch(expected, submitted) {
  if (typeof expected !== 'string' || typeof submitted !== 'string') return false;
  const expectedBuf = Buffer.from(expected, 'utf8');
  const submittedBuf = Buffer.from(submitted, 'utf8');
  if (expectedBuf.length !== submittedBuf.length) {
    // Still perform a same-cost comparison against a buffer of the
    // expected length so a length mismatch and a content mismatch take
    // statistically indistinguishable time.
    crypto.timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, submittedBuf);
}

module.exports = { generateCsrfToken, csrfTokensMatch };
