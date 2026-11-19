'use strict';

/**
 * EL83000 (Donaldson P553000): registers the Donaldson alternative products listed in the replacement list pasted by the operator 2026-11-18
 * (Donaldson ELF7300, P553548 and the P559xxx series). Only entries whose manufacturer is Donaldson in that list; no third-party codes.
 * Field alternative_products only. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL83000';
const SRC = 'OPERATOR_PASTED_DONALDSON_P553000_REPLACEMENT_LIST_20261118';
const CODES = ['ELF7300', 'P553548', 'P559015', 'P559047', 'P559070', 'P559091', 'P559219', 'P559220', 'P559235', 'P559242', 'P559255', 'P559256', 'P559266',
  'P559279', 'P559284', 'P559286', 'P559303', 'P559468', 'P559577', 'P559580', 'P559583', 'P559599', 'P559611'];

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== 'P553000') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    const alt = CODES.map((code) => ({ code, manufacturer: 'DONALDSON', relationship: 'ALTERNATIVE_PRODUCT', source: SRC }));
    report.gateway = assertGovernedCatalogPatch(cur, { alternative_products: alt }, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET alternative_products=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(alt)]);
    report.after = (await db.query("SELECT jsonb_array_length(alternative_products) n, codigo_base FROM public.elimfilters_catalog WHERE sku=$1", [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
