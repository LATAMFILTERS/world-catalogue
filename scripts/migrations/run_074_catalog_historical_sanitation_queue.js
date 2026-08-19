'use strict';

/**
 * Creates the historical catalog sanitation queue and immutable evidence ledger.
 * Safe migration: no sku, codigo_base, oem_codes, competitor_codes, duty, or specs are changed.
 */

require('dotenv').config();
const { Pool } = require('pg');

async function installHistoricalSanitationQueue() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_codigo_base_evidence (
        id bigserial PRIMARY KEY,
        sku text NOT NULL REFERENCES elimfilters_catalog(sku) ON UPDATE CASCADE ON DELETE CASCADE,
        evidence_kind text NOT NULL,
        authority text NOT NULL,
        manufacturer text NOT NULL,
        reference_code text NOT NULL,
        normalized_reference text NOT NULL,
        source_url text NOT NULL,
        evidence_hash text NOT NULL,
        verified_at timestamptz NOT NULL DEFAULT now(),
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        UNIQUE (sku, evidence_kind, authority, normalized_reference, evidence_hash)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_catalog_codigo_base_evidence_sku
      ON catalog_codigo_base_evidence(sku)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_catalog_codigo_base_evidence_authority
      ON catalog_codigo_base_evidence(authority, normalized_reference)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS catalog_codigo_base_sanitation_queue (
        sku text PRIMARY KEY REFERENCES elimfilters_catalog(sku) ON UPDATE CASCADE ON DELETE CASCADE,
        duty text NOT NULL,
        current_codigo_base text NOT NULL,
        governance_state text NOT NULL,
        required_authority text,
        priority integer NOT NULL,
        status text NOT NULL DEFAULT 'PENDING',
        contamination_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
        attempts integer NOT NULL DEFAULT 0,
        last_attempt_at timestamptz,
        last_error text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CHECK (status IN ('PENDING','RESOLVED','BLOCKED'))
      )
    `);

    await client.query(`
      INSERT INTO catalog_codigo_base_sanitation_queue (
        sku, duty, current_codigo_base, governance_state, required_authority,
        priority, status, contamination_flags, updated_at
      )
      SELECT
        c.sku,
        c.duty,
        c.codigo_base,
        coalesce(c.enrichment_data->'codigo_base_governance'->>'state', 'UNCLASSIFIED'),
        c.enrichment_data->'codigo_base_governance'->>'required_authority',
        CASE coalesce(c.enrichment_data->'codigo_base_governance'->>'state', 'UNCLASSIFIED')
          WHEN 'CANONICAL_EVIDENCED_NOT_VERIFIED' THEN 10
          WHEN 'REVIEW_PRIMARY_CANDIDATE' THEN 20
          WHEN 'VERIFY_PRIMARY_ABSENCE' THEN 30
          WHEN 'SELECT_VERIFIED_FALLBACK' THEN 40
          WHEN 'SKU_SUFFIX_REVIEW' THEN 50
          ELSE 90
        END
        + CASE WHEN jsonb_array_length(coalesce(c.enrichment_data->'codigo_base_governance'->'contamination_flags','[]'::jsonb)) > 0 THEN 5 ELSE 0 END,
        CASE WHEN coalesce((c.enrichment_data->'codigo_base_governance'->>'primary_manufacturer_verified')::boolean, false)
               OR coalesce((c.enrichment_data->'codigo_base_governance'->>'fallback_manufacturer_verified')::boolean, false)
             THEN 'RESOLVED' ELSE 'PENDING' END,
        coalesce(c.enrichment_data->'codigo_base_governance'->'contamination_flags','[]'::jsonb),
        now()
      FROM elimfilters_catalog c
      ON CONFLICT (sku) DO UPDATE SET
        duty = EXCLUDED.duty,
        current_codigo_base = EXCLUDED.current_codigo_base,
        governance_state = EXCLUDED.governance_state,
        required_authority = EXCLUDED.required_authority,
        priority = EXCLUDED.priority,
        contamination_flags = EXCLUDED.contamination_flags,
        updated_at = now()
    `);

    const verify = await client.query(`
      SELECT
        (SELECT count(*)::int FROM elimfilters_catalog) AS catalog_rows,
        (SELECT count(*)::int FROM catalog_codigo_base_sanitation_queue) AS queued_rows,
        (SELECT count(*)::int FROM catalog_codigo_base_sanitation_queue WHERE status='PENDING') AS pending_rows,
        (SELECT count(*)::int FROM catalog_codigo_base_sanitation_queue WHERE status='RESOLVED') AS resolved_rows,
        (SELECT count(*)::int FROM catalog_codigo_base_evidence) AS evidence_rows
    `);

    await client.query('COMMIT');
    return {
      migration: '074_HISTORICAL_SANITATION_QUEUE',
      ...verify.rows[0],
      protected_catalog_fields_mutated: 0,
      evidence_required_for_resolution: true,
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  installHistoricalSanitationQueue()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => { console.error(error); process.exit(1); });
}

module.exports = { installHistoricalSanitationQueue };
