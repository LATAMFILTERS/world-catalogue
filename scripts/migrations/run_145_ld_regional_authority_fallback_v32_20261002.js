'use strict';

require('dotenv').config();
const { Client } = require('pg');
const { FUNCTION_SQL } = require('./run_144_hd_air_dryer_authority_policy_v32_20261002');

async function main() {
  const connectionString = process.env.SEARCH_DB_URL || process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Missing SEARCH_DB_URL/CATALOG_DATABASE_URL/DATABASE_URL');

  const client = new Client({ connectionString });
  await client.connect();
  await client.query('BEGIN');
  try {
    await client.query(FUNCTION_SQL);

    const policy = await client.query(
      "SELECT origin_group,canonical_brand,active FROM ld_catalog.ld_canonical_source_policy ORDER BY origin_group"
    );
    const expected = new Map(policy.rows.map((r) => [String(r.origin_group).toUpperCase(), r]));
    if (!expected.get('EUROPEAN')?.active || expected.get('EUROPEAN')?.canonical_brand !== 'MANN-FILTER') {
      throw new Error('EUROPEAN_LD_POLICY_MISMATCH');
    }
    if (!expected.get('NON_EUROPEAN')?.active || expected.get('NON_EUROPEAN')?.canonical_brand !== 'FRAM') {
      throw new Error('NON_EUROPEAN_LD_POLICY_MISMATCH');
    }

    const fn = await client.query(
      "SELECT pg_get_functiondef(p.oid) fn FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='enforce_elimfilters_codigo_base_policy'"
    );
    const body = fn.rows[0]?.fn || '';
    for (const required of [
      'mann_absence_verified',
      'fram_absence_verified',
      "approved_source <> 'OEM_CODES'",
      'HD SKU % OEM fallback requires verified Fleetguard manufacturing absence'
    ]) {
      if (!body.includes(required)) throw new Error('TRIGGER_POLICY_MISSING:' + required);
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({
      policy_version: '2026-10-02-v3.2',
      ld_policy: policy.rows,
      trigger_updated: true
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
