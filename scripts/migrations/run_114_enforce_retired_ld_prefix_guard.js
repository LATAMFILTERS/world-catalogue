'use strict';

/** Enforce retirement of EA5/EC5/EF5/EL5 on active canonical catalog tables. */
const { Client } = require('pg');
const { RETIRED_LD_PREFIXES } = require('../../lib/catalog-write-gateway');

const MIGRATION = '114_ENFORCE_RETIRED_LD_PREFIX_GUARD';
const APPLY = process.argv.includes('--apply');
const PREFIXES = [...RETIRED_LD_PREFIXES];

function sslFor(databaseUrl) {
  const host = new URL(databaseUrl).hostname.toLowerCase();
  return ['127.0.0.1', 'localhost', '::1'].includes(host) ? false : { rejectUnauthorized: false };
}

async function countRetired(client, table, column) {
  const result = await client.query(
    `SELECT count(*)::int AS n FROM ${table} WHERE left(upper(${column}),3)=ANY($1::text[])`,
    [PREFIXES]
  );
  return result.rows[0].n;
}
async function constraintExists(client, name) {
  const result = await client.query(
    'SELECT 1 FROM pg_constraint WHERE conname=$1 LIMIT 1',
    [name]
  );
  return result.rowCount === 1;
}

async function addConstraint(client, table, column, name) {
  if (await constraintExists(client, name)) return false;
  await client.query(
    `ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (left(upper(${column}),3) <> ALL (ARRAY['EA5','EC5','EF5','EL5']))`
  );
  return true;
}
async function run() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const client = new Client({ connectionString: databaseUrl, ssl: sslFor(databaseUrl) });
  const report = {
    migration: MIGRATION,
    mode: APPLY ? 'apply' : 'dry-run',
    retired_prefixes: PREFIXES,
    before: {},
    constraints: {},
  };

  await client.connect();
  try {
    await client.query('BEGIN');
    report.before.public_catalog = await countRetired(client, 'public.elimfilters_catalog', 'sku');
    report.before.ld_product_catalog = await countRetired(client, 'ld_catalog.ld_product_catalog', 'elimfilters_sku');
    if (report.before.public_catalog !== 0 || report.before.ld_product_catalog !== 0) {
      throw new Error(`RETIRED_PREFIX_ROWS_REMAIN public=${report.before.public_catalog} ld=${report.before.ld_product_catalog}`);
    }

    const publicName = 'elimfilters_catalog_no_retired_ld5_prefix';
    const ldName = 'ld_product_catalog_no_retired_ld5_prefix';
    report.constraints.public_catalog_before = await constraintExists(client, publicName);
    report.constraints.ld_product_catalog_before = await constraintExists(client, ldName);

    if (APPLY) {
      report.constraints.public_catalog_added = await addConstraint(client, 'public.elimfilters_catalog', 'sku', publicName);
      report.constraints.ld_product_catalog_added = await addConstraint(client, 'ld_catalog.ld_product_catalog', 'elimfilters_sku', ldName);
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    return report;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  run()
    .then((report) => console.log('[retired-ld-prefix-guard]', JSON.stringify(report, null, 2)))
    .catch((error) => {
      console.error('[retired-ld-prefix-guard] failed', error.stack || error.message);
      process.exit(1);
    });
}

module.exports = { MIGRATION, PREFIXES, sslFor, countRetired, run };
