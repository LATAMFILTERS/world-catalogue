'use strict';

/**
 * MANN TB 1374/15 X was held by both ED41413 (Donaldson P951413) and ED43571 (Donaldson P953571). Donaldson official site, competitor-part search
 * "TB1374/15X*" (operator-supplied link, 2026-11-17): the only Donaldson result is P953571 ("Reemplaza pieza P781466"; note "P953571 = P781466 + 5g Lubricant"),
 * P951413 is not returned. The entry stays on ED43571 and is removed from ED41413. The other ED41413 entries (including MANN-HUMMEL TB1374) are not touched.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const FROM = 'ED41413';
const KEEP = 'ED43571';
const CODE = 'TB1374/15X';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[FROM, KEEP]])).rows;
    const from = rows.find((r) => r.sku === FROM); const keep = rows.find((r) => r.sku === KEEP);
    if (!from || !keep) throw new Error('ROWS_CHANGED');
    if (![...(keep.oem_codes || []), ...(keep.competitor_codes || [])].some((x) => norm(x.code) === norm(CODE))) throw new Error('CODE_NOT_ON_KEEPER');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    const patch = { oem_codes: (from.oem_codes || []).filter((x) => norm(x.code) !== norm(CODE)), competitor_codes: (from.competitor_codes || []).filter((x) => norm(x.code) !== norm(CODE)) };
    report.removed = (from.oem_codes || []).length - patch.oem_codes.length + (from.competitor_codes || []).length - patch.competitor_codes.length;
    if (!report.removed) throw new Error('CODE_NOT_ON_SOURCE');
    report.gateway = assertGovernedCatalogPatch(from, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [FROM, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2`, [FROM, norm(CODE)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [FROM]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)`, [CODE])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
