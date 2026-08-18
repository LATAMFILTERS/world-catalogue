'use strict';

/**
 * Builds the durable evidence-review queue for codigo_base governance.
 *
 * This migration DOES NOT mutate elimfilters_catalog.codigo_base.
 * It materializes every non-canonical governance state into a review queue so
 * evidence can be collected, verified, approved and then applied deliberately.
 *
 * Priority order:
 *   10 REVIEW_DONALDSON_CANDIDATE
 *   20 REVIEW_MANN_CANDIDATE
 *   30 REVIEW_DONALDSON_ABSENCE
 *   40 REVIEW_DONALDSON_AND_FLEETGUARD_ABSENCE
 *   50 REVIEW_MANN_ABSENCE
 *   90 everything else
 */

require('dotenv').config();
const { Pool } = require('pg');
const { POLICY_VERSION } = require('../../lib/catalog-codigo-base-governance');

const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

const PRIORITY_SQL = `CASE enrichment_data->'codigo_base_governance'->>'state'
  WHEN 'REVIEW_DONALDSON_CANDIDATE' THEN 10
  WHEN 'REVIEW_MANN_CANDIDATE' THEN 20
  WHEN 'REVIEW_DONALDSON_ABSENCE' THEN 30
  WHEN 'REVIEW_DONALDSON_AND_FLEETGUARD_ABSENCE' THEN 40
  WHEN 'REVIEW_MANN_ABSENCE' THEN 50
  ELSE 90
END`;

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS codigo_base_review_queue (
        sku text PRIMARY KEY REFERENCES elimfilters_catalog(sku) ON UPDATE CASCADE ON DELETE CASCADE,
        policy_version text NOT NULL,
        duty text,
        current_codigo_base text,
        governance_state text NOT NULL,
        required_authority text NOT NULL,
        observed_preferred_candidates jsonb NOT NULL DEFAULT '[]'::jsonb,
        observed_fallback_candidates jsonb NOT NULL DEFAULT '[]'::jsonb,
        priority integer NOT NULL,
        review_status text NOT NULL DEFAULT 'PENDING'
          CHECK (review_status IN ('PENDING','IN_REVIEW','APPROVED','REJECTED','RESOLVED')),
        verified_authority text,
        approved_codigo_base text,
        evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
        reviewer text,
        reviewed_at timestamptz,
        resolution_note text,
        snapshot_updated_at timestamptz NOT NULL DEFAULT now(),
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_codigo_base_review_queue_status_priority
      ON codigo_base_review_queue(review_status, priority, governance_state, sku)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_codigo_base_review_queue_state
      ON codigo_base_review_queue(governance_state)
    `);

    const upsert = await client.query(`
      INSERT INTO codigo_base_review_queue (
        sku,
        policy_version,
        duty,
        current_codigo_base,
        governance_state,
        required_authority,
        observed_preferred_candidates,
        observed_fallback_candidates,
        priority,
        snapshot_updated_at
      )
      SELECT
        sku,
        enrichment_data->'codigo_base_governance'->>'policy_version',
        duty,
        codigo_base,
        enrichment_data->'codigo_base_governance'->>'state',
        enrichment_data->'codigo_base_governance'->>'required_authority',
        coalesce(enrichment_data->'codigo_base_governance'->'observed_preferred_candidates', '[]'::jsonb),
        coalesce(enrichment_data->'codigo_base_governance'->'observed_fallback_candidates', '[]'::jsonb),
        ${PRIORITY_SQL},
        now()
      FROM elimfilters_catalog
      WHERE enrichment_data->'codigo_base_governance'->>'policy_version' = $1
        AND enrichment_data->'codigo_base_governance'->>'state' <> 'CANONICAL_EVIDENCED'
      ON CONFLICT (sku) DO UPDATE SET
        policy_version = EXCLUDED.policy_version,
        duty = EXCLUDED.duty,
        current_codigo_base = EXCLUDED.current_codigo_base,
        governance_state = EXCLUDED.governance_state,
        required_authority = EXCLUDED.required_authority,
        observed_preferred_candidates = EXCLUDED.observed_preferred_candidates,
        observed_fallback_candidates = EXCLUDED.observed_fallback_candidates,
        priority = EXCLUDED.priority,
        snapshot_updated_at = now()
      RETURNING sku
    `, [POLICY_VERSION]);

    // Rows that have since become canonical leave the active queue but retain
    // their evidence/history as RESOLVED rather than being deleted.
    const resolved = await client.query(`
      UPDATE codigo_base_review_queue q
      SET review_status = 'RESOLVED',
          reviewed_at = coalesce(reviewed_at, now()),
          resolution_note = coalesce(resolution_note, 'Catalog governance state is now CANONICAL_EVIDENCED'),
          snapshot_updated_at = now()
      FROM elimfilters_catalog c
      WHERE c.sku = q.sku
        AND c.enrichment_data->'codigo_base_governance'->>'policy_version' = $1
        AND c.enrichment_data->'codigo_base_governance'->>'state' = 'CANONICAL_EVIDENCED'
        AND q.review_status <> 'RESOLVED'
    `, [POLICY_VERSION]);

    const summary = await client.query(`
      SELECT
        count(*) FILTER (WHERE review_status <> 'RESOLVED')::int AS active_rows,
        count(*) FILTER (WHERE review_status = 'RESOLVED')::int AS resolved_rows,
        count(*) FILTER (WHERE review_status = 'PENDING')::int AS pending_rows
      FROM codigo_base_review_queue
      WHERE policy_version = $1
    `, [POLICY_VERSION]);

    const states = await client.query(`
      SELECT governance_state, priority, count(*)::int AS rows
      FROM codigo_base_review_queue
      WHERE policy_version = $1
        AND review_status <> 'RESOLVED'
      GROUP BY governance_state, priority
      ORDER BY priority, governance_state
    `, [POLICY_VERSION]);

    const verification = await client.query(`
      SELECT
        (SELECT count(*)::int
           FROM elimfilters_catalog
          WHERE enrichment_data->'codigo_base_governance'->>'policy_version' = $1
            AND enrichment_data->'codigo_base_governance'->>'state' <> 'CANONICAL_EVIDENCED') AS catalog_unresolved,
        (SELECT count(*)::int
           FROM codigo_base_review_queue
          WHERE policy_version = $1
            AND review_status <> 'RESOLVED') AS queue_active
    `, [POLICY_VERSION]);

    if (verification.rows[0].catalog_unresolved !== verification.rows[0].queue_active) {
      throw new Error(`Review queue verification failed: ${JSON.stringify(verification.rows[0])}`);
    }

    await client.query('COMMIT');

    console.log(JSON.stringify({
      policy_version: POLICY_VERSION,
      queue_table: 'codigo_base_review_queue',
      upserted_rows: upsert.rowCount,
      newly_resolved_rows: resolved.rowCount,
      active_rows: summary.rows[0].active_rows,
      pending_rows: summary.rows[0].pending_rows,
      resolved_rows: summary.rows[0].resolved_rows,
      states: states.rows,
      verification: verification.rows[0],
      codigo_base_mutations: 0,
      next_batch: 'priority_10_REVIEW_DONALDSON_CANDIDATE'
    }, null, 2));
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
