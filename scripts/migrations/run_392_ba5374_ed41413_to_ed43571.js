'use strict';

/**
 * BALDWIN BA5374 moves from ED41413 (Donaldson P951413) to ED43571 (Donaldson P953571).
 * Source: Donaldson official site, competitor-part search "BA5374" (operator-supplied link, 2026-11-17): the only Donaldson result is
 * P953571 (BALDWIN BA5374, SECADOR DE AIRE, ENROSCABLE); P951413 is not returned. Nothing else is moved or retired.
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
const TO = 'ED43571';
const CODE = 'BA5374';
const URL_DON = 'https://shop.donaldson.com/store/es-us/search?Ntt=BA5374';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[FROM, TO]])).rows;
    const from = rows.find((r) => r.sku === FROM); const to = rows.find((r) => r.sku === TO);
    if (!from || !to || to.codigo_base !== 'P953571' || from.codigo_base !== 'P951413') throw new Error('ROWS_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    const cols = ['oem_codes', 'competitor_codes'];
    const entry = cols.map((c) => (from[c] || []).find((x) => norm(x.code) === CODE) && c).find(Boolean);
    if (!entry) throw new Error('CODE_NOT_ON_SOURCE');
    const item = (from[entry] || []).find((x) => norm(x.code) === CODE);
    const fromPatch = { [entry]: (from[entry] || []).filter((x) => norm(x.code) !== CODE) };
    if ([...(to.oem_codes || []), ...(to.competitor_codes || [])].some((x) => norm(x.code) === CODE)) throw new Error('ALREADY_ON_TARGET');
    const toPatch = { [entry]: [...(to[entry] || []), { ...item, classification_source: 'DONALDSON_OFFICIAL_COMPETITOR_SEARCH_BA5374_OPERATOR_LINK_20261117', source_url: URL_DON }] };
    report.gateway = {
      from: assertGovernedCatalogPatch(from, fromPatch, { validateApplications: false }).valid,
      to: assertGovernedCatalogPatch(to, toPatch, { validateApplications: false }).valid,
    };
    await db.query(`UPDATE public.elimfilters_catalog SET ${entry}=$2::jsonb WHERE sku=$1`, [FROM, JSON.stringify(fromPatch[entry])]);
    await db.query(`UPDATE public.elimfilters_catalog SET ${entry}=$2::jsonb WHERE sku=$1`, [TO, JSON.stringify(toPatch[entry])]);
    await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2`, [FROM, CODE]);
    for (const s of [FROM, TO]) await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)`, [CODE])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
