'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const { buildManufacturerIdentityRecord } = require('../../lib/catalog-manufacturer-identity');

const APPLY = process.argv.includes('--execute');
const expectedArg = process.argv.find((value) => value.startsWith('--expected='));
const EXPECTED = expectedArg ? Number(expectedArg.split('=')[1]) : 1886;
const QUEUE_STATE = 'PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY';
const REQUIRED_AUTHORITY = 'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE';
const LAST_ERROR = 'EXPLICIT_PRIMARY_ABSENCE_AUTHORITY_REQUIRED';

function assertRuntimeDatabase(databaseUrl) {
  const parsed = new URL(databaseUrl);
  if (!['127.0.0.1', 'localhost'].includes(parsed.hostname) || parsed.port !== '5432' || parsed.pathname !== '/catalogo_elimfilters') {
    throw new Error('REFUSE_NON_RUNTIME_5432_DB');
  }
}

async function runMigration({ apply = APPLY, expected = EXPECTED } = {}) {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  assertRuntimeDatabase(databaseUrl);
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.CATALOG_DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  const summary = {
    migration: '213_HERMES_SEPARATE_MANUFACTURER_IDENTITY_PRIORITY',
    mode: apply ? 'EXECUTE' : 'DRY_RUN',
    selected: 0,
    identity_verified_fleetguard: 0,
    identity_review_required: 0,
    manufacturer_priority_pending: 0,
    hermes_identity_evidence_upserts: 0,
    catalog_mutations: 0,
    sku_mutations: 0,
    codigo_base_mutations: 0,
    alternate_mutations: 0,
    application_approvals: 0,
    equivalence_approvals: 0,
    publication_approvals: 0,
    queue_mutations: 0,
  };

  try {
    const selected = await client.query(`
      SELECT q.sku,q.current_codigo_base,q.governance_state,q.required_authority,
             c.codigo_base,c.duty,
             e.id AS evidence_id,e.evidence_kind,e.authority,e.manufacturer,
             e.reference_code,e.normalized_reference,e.source_url,e.evidence_hash,e.verified_at
      FROM catalog_codigo_base_sanitation_queue q
      JOIN elimfilters_catalog c ON c.sku=q.sku
      LEFT JOIN LATERAL (
        SELECT evidence.*
        FROM catalog_codigo_base_evidence evidence
        WHERE evidence.sku=q.sku
          AND evidence.evidence_kind='OFFICIAL_PRODUCT_SITEMAP'
          AND evidence.authority='FLEETGUARD_OFFICIAL_PRODUCT_SITEMAP'
          AND evidence.manufacturer='FLEETGUARD'
          AND evidence.normalized_reference=upper(regexp_replace(q.current_codigo_base,'[^A-Z0-9]','','g'))
          AND evidence.source_url LIKE 'https://www.fleetguard.com/product/%'
          AND evidence.evidence_hash IS NOT NULL
          AND evidence.verified_at IS NOT NULL
        ORDER BY evidence.verified_at DESC,evidence.id DESC
        LIMIT 1
      ) e ON true
      WHERE q.status='PENDING'
        AND q.governance_state=$1
        AND q.required_authority=$2
        AND q.last_error=$3
        AND c.duty='HEAVY_DUTY'
      ORDER BY q.sku
    `, [QUEUE_STATE, REQUIRED_AUTHORITY, LAST_ERROR]);

    summary.selected = selected.rowCount;
    if (summary.selected !== expected) throw new Error(`EXPECTED_${expected}_ROWS_GOT_${summary.selected}`);

    const records = selected.rows.map((row) => {
      const record = buildManufacturerIdentityRecord(row, row.evidence_id ? {
        id: row.evidence_id,
        evidence_kind: row.evidence_kind,
        authority: row.authority,
        manufacturer: row.manufacturer,
        reference_code: row.reference_code,
        normalized_reference: row.normalized_reference,
        source_url: row.source_url,
        evidence_hash: row.evidence_hash,
        verified_at: row.verified_at,
      } : null);
      if (record.verification_status === 'VERIFIED') summary.identity_verified_fleetguard += 1;
      else summary.identity_review_required += 1;
      summary.manufacturer_priority_pending += 1;
      return record;
    });
    if (summary.identity_verified_fleetguard + summary.identity_review_required !== summary.selected) {
      throw new Error('IDENTITY_CLASSIFICATION_COUNT_MISMATCH');
    }

    if (!apply) return summary;

    await client.query('BEGIN');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS hermes_catalogue_evidence (
          evidence_id text PRIMARY KEY,
          sku varchar REFERENCES elimfilters_catalog(sku) ON UPDATE CASCADE ON DELETE SET NULL,
          field_group text NOT NULL CHECK (field_group IN ('SOURCE_IDENTITY','MANUFACTURER_IDENTITY','APPLICATIONS','CROSS_REFERENCES','DIMENSIONS','TECHNICAL_SPECS','IMAGE','PACKAGING')),
          field_name text,
          authority text,
          source_type text NOT NULL,
          source_url text,
          source_hash text,
          verification_status text NOT NULL CHECK (verification_status IN ('VERIFIED','REVIEW_REQUIRED','CONFLICTING','REJECTED')),
          payload jsonb NOT NULL DEFAULT '{}'::jsonb,
          provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
          captured_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      await client.query('CREATE INDEX IF NOT EXISTS hermes_catalogue_evidence_sku_idx ON hermes_catalogue_evidence(sku)');
      await client.query('CREATE INDEX IF NOT EXISTS hermes_catalogue_evidence_group_idx ON hermes_catalogue_evidence(field_group,verification_status)');
      await client.query(`
        ALTER TABLE hermes_catalogue_evidence
          DROP CONSTRAINT IF EXISTS hermes_catalogue_evidence_field_group_check
      `);
      await client.query(`
        ALTER TABLE hermes_catalogue_evidence
          ADD CONSTRAINT hermes_catalogue_evidence_field_group_check
          CHECK (field_group IN ('SOURCE_IDENTITY','MANUFACTURER_IDENTITY','APPLICATIONS','CROSS_REFERENCES','DIMENSIONS','TECHNICAL_SPECS','IMAGE','PACKAGING'))
      `);

      const upsert = await client.query(`
        INSERT INTO hermes_catalogue_evidence (
          evidence_id,sku,field_group,field_name,authority,source_type,source_url,
          source_hash,verification_status,payload,provenance,captured_at,updated_at
        )
        SELECT evidence_id,sku,field_group,field_name,authority,source_type,source_url,
               source_hash,verification_status,payload,provenance,captured_at,now()
        FROM jsonb_to_recordset($1::jsonb) AS item(
          evidence_id text,sku varchar,field_group text,field_name text,authority text,
          source_type text,source_url text,source_hash text,verification_status text,
          payload jsonb,provenance jsonb,captured_at timestamptz
        )
        ON CONFLICT (evidence_id) DO UPDATE SET
          sku=EXCLUDED.sku,field_group=EXCLUDED.field_group,field_name=EXCLUDED.field_name,
          authority=EXCLUDED.authority,source_type=EXCLUDED.source_type,
          source_url=EXCLUDED.source_url,source_hash=EXCLUDED.source_hash,
          verification_status=EXCLUDED.verification_status,payload=EXCLUDED.payload,
          provenance=EXCLUDED.provenance,captured_at=EXCLUDED.captured_at,updated_at=now()
      `, [JSON.stringify(records)]);
      summary.hermes_identity_evidence_upserts = upsert.rowCount;
      if (summary.hermes_identity_evidence_upserts !== summary.selected) {
        throw new Error(`HERMES_IDENTITY_UPSERT_COUNT_MISMATCH:${summary.hermes_identity_evidence_upserts}`);
      }

      const verified = await client.query(`
        SELECT
          count(DISTINCT evidence.sku)::int AS rows,
          count(DISTINCT evidence.sku) FILTER (WHERE evidence.verification_status='VERIFIED' AND evidence.payload->>'status'='VERIFIED')::int AS identity_verified,
          count(DISTINCT evidence.sku) FILTER (WHERE evidence.verification_status='REVIEW_REQUIRED' AND evidence.payload->>'status'='REVIEW_REQUIRED')::int AS identity_review_required,
          count(DISTINCT queue.sku) FILTER (WHERE queue.status='PENDING' AND queue.governance_state=$1 AND queue.required_authority=$2 AND queue.last_error=$3)::int AS priority_pending
        FROM catalog_codigo_base_sanitation_queue queue
        JOIN hermes_catalogue_evidence evidence ON evidence.sku=queue.sku AND evidence.field_group='MANUFACTURER_IDENTITY'
        WHERE queue.status='PENDING'
          AND queue.governance_state=$1
          AND queue.required_authority=$2
          AND queue.last_error=$3
          AND queue.duty='HEAVY_DUTY'
      `, [QUEUE_STATE, REQUIRED_AUTHORITY, LAST_ERROR]);
      const post = verified.rows[0];
      if (Number(post.rows) !== summary.selected ||
          Number(post.identity_verified) !== summary.identity_verified_fleetguard ||
          Number(post.identity_review_required) !== summary.identity_review_required ||
          Number(post.priority_pending) !== summary.selected) {
        throw new Error('POST_APPLY_IDENTITY_PRIORITY_VERIFICATION_FAILED');
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
  runMigration().then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}

module.exports = { runMigration, QUEUE_STATE, REQUIRED_AUTHORITY, LAST_ERROR };
