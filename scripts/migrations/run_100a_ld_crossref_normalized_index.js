'use strict';

/**
 * Adds a functional index on ld_catalog.ld_competitor_cross_references that
 * matches the exact normalization expressions used by the existing
 * ld_catalog.prevent_ambiguous_cross_reference() trigger (see
 * run_082_ld_canonical_identity_policy_pgfix.js): normalized competitor_brand,
 * ld_catalog.norm_part(competitor_part_number), and elimfilters_sku. That
 * trigger currently does its ambiguity lookup with a sequential scan; this
 * index lets it (and the sibling ld_cross_reference_conflicts_v /
 * ld_competitor_cross_references_safe_v views) use an index scan instead.
 *
 * Schema-only, additive, idempotent: CREATE INDEX CONCURRENTLY IF NOT EXISTS,
 * run outside a transaction block per Postgres requirement for CONCURRENTLY.
 * This script only creates and verifies the index -- it does not run any
 * other migration.
 */

require('dotenv').config();
const { Client } = require('pg');

const MIGRATION = '100A_LD_CROSSREF_NORMALIZED_INDEX';
const INDEX_NAME = 'idx_ld_crossref_normalized_brand_part_sku';
const INDEX_DDL = `
  CREATE INDEX CONCURRENTLY IF NOT EXISTS ${INDEX_NAME}
  ON ld_catalog.ld_competitor_cross_references (
    upper(regexp_replace(coalesce(competitor_brand, ''), '[^A-Z0-9]', '', 'g')),
    ld_catalog.norm_part(competitor_part_number),
    elimfilters_sku
  )
`;

async function indexStatus(client) {
  const { rows } = await client.query(
    `SELECT i.indisvalid
       FROM pg_class c
       JOIN pg_index i ON i.indexrelid = c.oid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'ld_catalog' AND c.relname = $1`,
    [INDEX_NAME]
  );
  if (rows.length === 0) return { exists: false, valid: false };
  return { exists: true, valid: rows[0].indisvalid === true };
}

async function applyLdCrossrefNormalizedIndex() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  // CREATE INDEX CONCURRENTLY cannot run inside a transaction block; a plain
  // Client defaults to autocommit per statement, which is required here.
  // Never wrap this in BEGIN/COMMIT.
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const report = { migration: MIGRATION, index: INDEX_NAME };

  try {
    await client.query(INDEX_DDL);
    const status = await indexStatus(client);

    if (!status.exists) throw new Error('LD_CROSSREF_NORMALIZED_INDEX_NOT_FOUND');
    if (!status.valid) {
      await client.query(`DROP INDEX CONCURRENTLY IF EXISTS ld_catalog.${INDEX_NAME}`);
      throw new Error('LD_CROSSREF_NORMALIZED_INDEX_INVALID_DROPPED');
    }

    report.exists = status.exists;
    report.valid = status.valid;
    return report;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  applyLdCrossrefNormalizedIndex()
    .then(report => console.log('[ld-crossref-normalized-index]', JSON.stringify(report)))
    .catch(error => {
      console.error('[ld-crossref-normalized-index] failed', JSON.stringify({ error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, INDEX_NAME, applyLdCrossrefNormalizedIndex };
