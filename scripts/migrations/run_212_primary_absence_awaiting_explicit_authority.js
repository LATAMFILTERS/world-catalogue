'use strict';

/**
 * Reclassifies unresolved HEAVY_DUTY primary-manufacturer absence cases into
 * a dedicated fail-closed queue lane.
 *
 * This migration NEVER:
 * - changes elimfilters_catalog
 * - sets donaldson_absence_verified=true
 * - promotes Fleetguard or OEM references
 * - resolves the queue
 *
 * It only changes queue workflow metadata so "not found" cases cannot be
 * mistaken for verified manufacturing absence.
 */

require('dotenv').config();
const { Pool } = require('pg');

const APPLY = process.argv.includes('--execute');
const expectedArg = process.argv.find((v) => v.startsWith('--expected='));
const EXPECTED = expectedArg ? Number(expectedArg.split('=')[1]) : null;

const FROM_STATE = 'VERIFY_PRIMARY_ABSENCE';
const TO_STATE = 'PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY';
const FROM_ERROR = 'PRIMARY_ABSENCE_REQUIRES_EXPLICIT_EVIDENCE';
const TO_ERROR = 'EXPLICIT_PRIMARY_ABSENCE_AUTHORITY_REQUIRED';
const REQUIRED_AUTHORITY = 'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE';

function assertRuntimeDatabase(databaseUrl) {
  const parsed = new URL(databaseUrl);
  if (
    !['127.0.0.1', 'localhost'].includes(parsed.hostname) ||
    parsed.port !== '5432' ||
    parsed.pathname !== '/catalogo_elimfilters'
  ) {
    throw new Error('REFUSE_NON_RUNTIME_5432_DB');
  }
}

async function runPrimaryAbsenceAwaitingAuthorityMigration({ apply = APPLY, expected = EXPECTED } = {}) {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  assertRuntimeDatabase(databaseUrl);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  const client = await pool.connect();

  const summary = {
    migration: '212_PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY',
    mode: apply ? 'EXECUTE' : 'DRY_RUN',
    selected: 0,
    updated: 0,
    catalog_mutations: 0,
    sku_mutations: 0,
    codigo_base_mutations: 0,
    alternate_mutations: 0,
    donaldson_absence_flags_mutated: 0,
    fallback_promotions: 0,
    queue_resolved: 0,
  };

  try {
    const selected = await client.query(`
      SELECT
        q.sku,
        q.current_codigo_base,
        q.priority,
        q.attempts,
        c.enrichment_data->'codigo_base_governance' AS governance
      FROM catalog_codigo_base_sanitation_queue q
      JOIN elimfilters_catalog c ON c.sku=q.sku
      WHERE q.status='PENDING'
        AND q.attempts < 3
        AND q.governance_state=$1
        AND q.last_error=$2
        AND c.duty='HEAVY_DUTY'
      ORDER BY q.priority,q.attempts,q.sku
    `, [FROM_STATE, FROM_ERROR]);

    summary.selected = selected.rowCount;

    if (expected !== null && summary.selected !== expected) {
      throw new Error(`EXPECTED_${expected}_ROWS_GOT_${summary.selected}`);
    }

    const incorrectlyVerified = selected.rows.filter(
      (row) => row.governance?.donaldson_absence_verified === true
    );
    if (incorrectlyVerified.length) {
      throw new Error(
        `REFUSE_ALREADY_VERIFIED_ABSENCE_ROWS:${incorrectlyVerified.map((r) => r.sku).join(',')}`
      );
    }

    if (!apply || summary.selected === 0) return summary;

    await client.query('BEGIN');
    try {
      const updated = await client.query(`
        UPDATE catalog_codigo_base_sanitation_queue q
        SET governance_state=$1,
            required_authority=$2,
            priority=35,
            last_error=$3,
            updated_at=now()
        FROM elimfilters_catalog c
        WHERE c.sku=q.sku
          AND q.status='PENDING'
          AND q.attempts < 3
          AND q.governance_state=$4
          AND q.last_error=$5
          AND c.duty='HEAVY_DUTY'
          AND coalesce(
                (c.enrichment_data->'codigo_base_governance'->>'donaldson_absence_verified')::boolean,
                false
              )=false
        RETURNING q.sku
      `, [TO_STATE, REQUIRED_AUTHORITY, TO_ERROR, FROM_STATE, FROM_ERROR]);

      summary.updated = updated.rowCount;
      if (summary.updated !== summary.selected) {
        throw new Error(`PRIMARY_ABSENCE_LANE_COUNT_MISMATCH:${summary.updated}!=${summary.selected}`);
      }

      const post = await client.query(`
        SELECT
          count(*) FILTER (
            WHERE q.status='PENDING'
              AND q.governance_state=$1
              AND q.last_error=$2
          )::int AS awaiting_rows,
          count(*) FILTER (
            WHERE q.status='PENDING'
              AND q.governance_state=$3
              AND q.last_error=$4
          )::int AS old_lane_rows,
          count(*) FILTER (
            WHERE q.status='RESOLVED'
              AND q.governance_state=$1
          )::int AS incorrectly_resolved
        FROM catalog_codigo_base_sanitation_queue q
        JOIN elimfilters_catalog c ON c.sku=q.sku
        WHERE c.duty='HEAVY_DUTY'
      `, [TO_STATE, TO_ERROR, FROM_STATE, FROM_ERROR]);

      if (Number(post.rows[0].old_lane_rows) !== 0) {
        throw new Error(`PRIMARY_ABSENCE_OLD_LANE_REMAINS:${post.rows[0].old_lane_rows}`);
      }
      if (Number(post.rows[0].incorrectly_resolved) !== 0) {
        throw new Error(`PRIMARY_ABSENCE_AWAITING_ROWS_RESOLVED:${post.rows[0].incorrectly_resolved}`);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    return summary;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runPrimaryAbsenceAwaitingAuthorityMigration()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}

module.exports = {
  FROM_STATE,
  TO_STATE,
  FROM_ERROR,
  TO_ERROR,
  REQUIRED_AUTHORITY,
  runPrimaryAbsenceAwaitingAuthorityMigration,
};
