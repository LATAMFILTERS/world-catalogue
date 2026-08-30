'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '092_EUROPEAN_MANN_MATCH_RECONCILIATION';

async function applyEuropeanMannMatchReconciliation() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, staging_only: true, mutations: { sku: 0, codigo_base: 0, canonical_identity: 0 }, summary: {}, sample: [] };
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ld_catalog.ld_european_mann_match_reconciliation (
        normalized_sku text PRIMARY KEY,
        mann_part_number text NOT NULL,
        source_match_state text NOT NULL,
        full_candidate_count integer NOT NULL DEFAULT 0,
        partial_candidate_count integer NOT NULL DEFAULT 0,
        best_coverage numeric(8,5) NOT NULL DEFAULT 0,
        only_full_public_sku text,
        reconciliation_state text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query('TRUNCATE ld_catalog.ld_european_mann_match_reconciliation');
    await client.query(`
      WITH fam AS (
        SELECT
          d.normalized_sku,
          min(d.mann_part_number) AS mann_part_number,
          min(d.source_match_state) AS source_match_state,
          count(*) FILTER (WHERE d.public_sku IS NOT NULL AND d.coverage=1)::int AS full_candidate_count,
          count(*) FILTER (WHERE d.public_sku IS NOT NULL AND d.coverage>0 AND d.coverage<1)::int AS partial_candidate_count,
          max(d.coverage) AS best_coverage,
          min(d.public_sku) FILTER (WHERE d.public_sku IS NOT NULL AND d.coverage=1) AS only_full_public_sku
        FROM ld_catalog.ld_european_mann_unresolved_diagnostics d
        GROUP BY d.normalized_sku
      )
      INSERT INTO ld_catalog.ld_european_mann_match_reconciliation(
        normalized_sku, mann_part_number, source_match_state,
        full_candidate_count, partial_candidate_count, best_coverage,
        only_full_public_sku, reconciliation_state, updated_at
      )
      SELECT
        normalized_sku, mann_part_number, source_match_state,
        full_candidate_count, partial_candidate_count, best_coverage,
        CASE WHEN full_candidate_count=1 THEN only_full_public_sku ELSE NULL END,
        CASE
          WHEN full_candidate_count>1 THEN 'MULTIPLE_FULL_MATCHES'
          WHEN full_candidate_count=1 THEN 'CORRECTED_SINGLE_FULL_CANDIDATE'
          WHEN partial_candidate_count>0 THEN 'PARTIAL_ONLY'
          ELSE 'NO_APPLICATION_OVERLAP'
        END,
        now()
      FROM fam
    `);
    const summary = await client.query(`
      SELECT reconciliation_state, count(*)::int AS n
      FROM ld_catalog.ld_european_mann_match_reconciliation
      GROUP BY reconciliation_state
      ORDER BY reconciliation_state
    `);
    report.summary.states = summary.rows;
    const discrepancies = await client.query(`
      SELECT source_match_state, reconciliation_state, count(*)::int AS n
      FROM ld_catalog.ld_european_mann_match_reconciliation
      GROUP BY source_match_state, reconciliation_state
      ORDER BY source_match_state, reconciliation_state
    `);
    report.summary.source_vs_corrected = discrepancies.rows;
    const sample = await client.query(`
      SELECT normalized_sku, mann_part_number, source_match_state,
             full_candidate_count, partial_candidate_count, best_coverage,
             only_full_public_sku, reconciliation_state
      FROM ld_catalog.ld_european_mann_match_reconciliation
      WHERE reconciliation_state='CORRECTED_SINGLE_FULL_CANDIDATE'
      ORDER BY normalized_sku
      LIMIT 20
    `);
    report.sample = sample.rows;
    await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw Object.assign(error, { migrationReport: report });
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyEuropeanMannMatchReconciliation()
    .then(report => console.log('[european-mann-match-reconciliation]', JSON.stringify(report)))
    .catch(error => {
      console.error('[european-mann-match-reconciliation] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyEuropeanMannMatchReconciliation };
