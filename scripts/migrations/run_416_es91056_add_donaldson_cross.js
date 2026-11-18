'use strict';

/**
 * ES91056 (Donaldson P551056): adds the Donaldson cross-reference numbers from the official page (operator pasted 2026-11-18) that no active SKU holds yet.
 * Numbers already held by another SKU (or already on this row) are reported, never moved. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'ES91056';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P551056/62875';
const SRC = 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P551056_CROSS_REFERENCE_OPERATOR_PASTED_20261118';
const CROSS = {
  BURKEEN: ['16Z09'], 'CASE/CASE IH': ['1809623C1', '1811491C91', '1816568C91', '1813104C91'], CATERPILLAR: ['3I1672', '3I1210'], 'CHINA LOCAL': ['STCX960'],
  FREIGHTLINER: ['DNP553375'], GILLIG: ['8240863000'], 'INGERSOLL RAND': ['52296878'], INTERNATIONAL: ['1685159C1', '1816568C91', '1813104C91'],
  'NEW HOLLAND': ['7840136', '84446332', '87803210', '87802929'], 'STEWART & STEVENSON': ['280323'], 'UNITED CENTRAL INDUSTRIAL SUPP': ['688776'],
};
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== 'P551056') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const heldRows = (await db.query("SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code, c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active")).rows;
    const held = new Map(); for (const r of heldRows) { if (!held.has(r.code)) held.set(r.code, []); held.get(r.code).push(r.sku); }
    const oem = (cur.oem_codes || []).slice(); const added = []; const skipped = [];
    const have = new Set([norm('P551056')]);
    for (const [brand, codes] of Object.entries(CROSS)) for (const code of codes) {
      const k = norm(code);
      if (have.has(k)) continue;
      if (held.has(k)) { skipped.push(`${brand}:${code}=${held.get(k).join('/')}`); continue; }
      have.add(k); oem.push({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC, source_url: URL_DON }); added.push(`${brand}:${code}`);
    }
    report.added = added; report.held_elsewhere_not_loaded = skipped;
    if (added.length) {
      assertGovernedCatalogPatch(cur, { oem_codes: oem, competitor_codes: cur.competitor_codes || [] }, { validateApplications: false });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(oem)]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    }
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part('1685159C1'), ld_catalog.norm_part('84446332'), ld_catalog.norm_part('8240863000'), ld_catalog.norm_part('87803210'))", [SKU])).rows;
    report.integrity = (await db.query('SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts, (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts, (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
