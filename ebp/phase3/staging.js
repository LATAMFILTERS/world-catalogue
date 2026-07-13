'use strict';

// EBP Phase 3 — short-lived in-memory staging store for the Excel
// stage/confirm pipeline (ADR-0028, Stage 3 -> Stage 4). A staged, fully
// validated preview is held here between `POST .../excel/stage` and the
// follow-up `POST .../excel/confirm` — nothing is written to Postgres
// until confirm. No new dependency: this is process-local, which is an
// accepted MVP trade-off for this single-process deployment (documented
// here rather than silently assumed) — a multi-process deployment would
// need to move this to Redis (already a dependency elsewhere in the
// codebase) or require confirm to re-submit the full payload instead of
// a token.

const crypto = require('node:crypto');

const STAGING_TTL_MS = 15 * 60 * 1000; // 15 minutes
const store = new Map();

function put(batchCode, manufacturerId, preview) {
  const token = crypto.randomUUID();
  store.set(token, { batchCode, manufacturerId, preview, expiresAt: Date.now() + STAGING_TTL_MS });
  return token;
}

function take(token, batchCode, manufacturerId) {
  const entry = store.get(token);
  if (!entry) return null;
  store.delete(token); // single-use
  if (entry.expiresAt < Date.now()) return null;
  if (entry.batchCode !== batchCode || String(entry.manufacturerId) !== String(manufacturerId)) return null;
  return entry.preview;
}

function _clearAllForTests() {
  store.clear();
}

module.exports = { put, take, _clearAllForTests };
