'use strict';

/**
 * FLEETGUARD LF14001NN was the codigo_base of the retired EL84001 (run_405) and stopped resolving. Donaldson official site, competitor-part search
 * "LF14001NN" (2026-11-17): the only Donaldson result is DBL7900 ("FLEETGUARD LF14001NN"), the base of EL87900. Loaded on EL87900 as a Fleetguard alternate.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL87900';
const CODE = 'LF14001NN';
const URL_DON = 'https://shop.donaldson.com/store/es-us/search?Ntt=LF14001NN&Ntk=All';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || !cur.catalog_active) throw new Error('ROW_CHANGED');
    const held = (await db.query(`SELECT DISTINCT c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active AND upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g'))=$1`, [CODE])).rows;
    if (held.length) throw new Error('HELD ' + held.map((r) => r.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    const comp = [...(cur.competitor_codes || []), { code: CODE, manufacturer: 'FLEETGUARD', classification: 'AFTERMARKET', classification_source: 'DONALDSON_OFFICIAL_COMPETITOR_SEARCH_LF14001NN_DBL7900_20261117', source_url: URL_DON }];
    report.gateway = assertGovernedCatalogPatch(cur, { competitor_codes: comp }, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(comp)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)`, [CODE])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
