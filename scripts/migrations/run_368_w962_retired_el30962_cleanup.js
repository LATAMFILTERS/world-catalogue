'use strict';

/**
 * Completes run_367 (W 962 resolves to ONE principal, EL83771). The retired Light Duty row EL30962 (inactive) still held 17 W 962-family
 * entries (MANN W962, W962/2 ... /53) and kept the family ambiguous in the resolver. They are removed from that retired row only.
 * (The matching ld_catalog.ld_competitor_cross_references rows 131528, 131529, 131530, which pointed W 962 / W 962/6 / W 962/14 at
 * the Light Duty FRAM PH3776 EL33776, were deleted by run_369.)
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL30962';
const re = /^W\s?962(\/?\d{1,2}[A-Z]?)?$/i;
const isFam = (x) => re.test(String(x.code || x.reference || '').trim());

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.catalog_active) throw new Error('EXPECTED_RETIRED_ROW');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    const drop = [...cur.oem_codes, ...cur.competitor_codes].filter(isFam);
    report.removed = drop.map((x) => `${x.manufacturer}:${x.code}`);
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(cur.oem_codes.filter((x) => !isFam(x))), JSON.stringify(cur.competitor_codes.filter((x) => !isFam(x)))]);
    await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND part_number ~* '^W\s?962'`, [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,manufacturer,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN ('W962','W96214','W9626','W9628','W96228')`)).rows.map((r) => `${r.code}->${r.sku}(${r.status})`);
    if (report.resolver.some((r) => !r.includes('EL83771'))) throw new Error('RESOLVER_NOT_SINGLE_PRINCIPAL ' + report.resolver.join(','));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
