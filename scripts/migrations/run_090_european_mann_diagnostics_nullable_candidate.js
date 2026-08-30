'use strict';

require('dotenv').config();
const { Pool } = require('pg');
const { applyEuropeanMannUnresolvedDiagnostics } = require('./run_089_european_mann_unresolved_diagnostics');

const MIGRATION = '090_EUROPEAN_MANN_DIAGNOSTICS_NULLABLE_CANDIDATE';

async function applyEuropeanMannDiagnosticsNullableCandidate() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // This is a staging-only table. Rebuild it with a surrogate primary key so
    // NO_PUBLIC_EXACT_MATCH families can legitimately preserve public_sku=NULL.
    // A composite PRIMARY KEY(normalized_sku, public_sku) implicitly made
    // public_sku NOT NULL and caused migration 089 to fail on no-overlap rows.
    await client.query('DROP TABLE IF EXISTS ld_catalog.ld_european_mann_unresolved_diagnostics');
    await client.query(`
      CREATE TABLE ld_catalog.ld_european_mann_unresolved_diagnostics (
        id bigserial PRIMARY KEY,
        normalized_sku text NOT NULL,
        mann_part_number text NOT NULL,
        segment text,
        source_match_state text NOT NULL,
        public_sku text,
        normalized_application_rows integer NOT NULL DEFAULT 0,
        matched_application_rows integer NOT NULL DEFAULT 0,
        coverage numeric(8,5) NOT NULL DEFAULT 0,
        candidate_rank integer,
        candidate_count integer NOT NULL DEFAULT 0,
        normalized_oem_count integer NOT NULL DEFAULT 0,
        oem_overlap integer NOT NULL DEFAULT 0,
        diagnostic_state text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX ux_ld_european_mann_unresolved_candidate
      ON ld_catalog.ld_european_mann_unresolved_diagnostics (
        normalized_sku,
        coalesce(public_sku, '__NO_PUBLIC_CANDIDATE__')
      )
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  const diagnostics = await applyEuropeanMannUnresolvedDiagnostics();
  return {
    migration: MIGRATION,
    nullable_public_candidate: true,
    diagnostics
  };
}

if (require.main === module) {
  applyEuropeanMannDiagnosticsNullableCandidate()
    .then(report => console.log('[european-mann-unresolved-diagnostics-v2]', JSON.stringify(report)))
    .catch(error => {
      console.error('[european-mann-unresolved-diagnostics-v2] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyEuropeanMannDiagnosticsNullableCandidate };
