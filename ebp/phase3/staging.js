'use strict';

// EBP Phase 3 — persistent Excel stage/confirm pipeline storage (ADR-0030,
// correction round 2026-07-13). Replaces the original process-local
// in-memory Map, which did not survive a process restart. Every function
// here takes `pool` — this module never manages its own connection
// lifecycle, same convention as repository.js.
//
// The staging row's `id` IS the staging token returned to the caller.
// `take()` is a single atomic UPDATE ... WHERE status = 'STAGED' AND
// expires_at > NOW() RETURNING, so a staged import can be consumed
// exactly once even under concurrent confirm requests — no separate
// SELECT-then-UPDATE race window.

const STAGING_TTL_MS = 15 * 60 * 1000; // 15 minutes
const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function put(pool, { manufacturerId, factoryUserId, batchId, workbookHash, preview, errors }) {
  const expiresAt = new Date(Date.now() + STAGING_TTL_MS);
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturer_excel_staging
      (manufacturer_id, factory_user_id, batch_id, workbook_hash, preview_json, errors_json, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id`,
    [
      manufacturerId,
      factoryUserId || null,
      batchId,
      workbookHash,
      JSON.stringify(preview || null),
      errors ? JSON.stringify(errors) : null,
      expiresAt,
    ]
  );
  return rows[0].id;
}

// Returns the staged preview and atomically marks the row CONSUMED, or
// null if the token is unknown, already consumed, expired, or scoped to a
// different batch/manufacturer (tenant isolation enforced in the same
// query, not as a separate check).
async function take(pool, stagingId, batchId, manufacturerId) {
  // Malformed input (not a valid UUID) can never match a real row — return
  // the same "not found" result a well-formed-but-unknown id would, rather
  // than letting Postgres's invalid-input error surface as a raw 500.
  if (!UUID_FORMAT.test(String(stagingId || ''))) return null;
  const { rows } = await pool.query(
    `UPDATE ebp_manufacturer_excel_staging
     SET status = 'CONSUMED', consumed_at = NOW()
     WHERE id = $1 AND batch_id = $2 AND manufacturer_id = $3
       AND status = 'STAGED' AND expires_at > NOW()
     RETURNING preview_json`,
    [stagingId, batchId, manufacturerId]
  );
  return rows[0] ? rows[0].preview_json : null;
}

// Read-only peek (does not consume) — used by the Factory Portal preview
// screen, which must be able to render the staged result without
// immediately consuming it (confirm is a separate, explicit action).
async function peek(pool, stagingId, batchId, manufacturerId) {
  if (!UUID_FORMAT.test(String(stagingId || ''))) return null;
  const { rows } = await pool.query(
    `SELECT preview_json, errors_json, status, expires_at FROM ebp_manufacturer_excel_staging
     WHERE id = $1 AND batch_id = $2 AND manufacturer_id = $3`,
    [stagingId, batchId, manufacturerId]
  );
  return rows[0] || null;
}

module.exports = { put, take, peek, STAGING_TTL_MS };
