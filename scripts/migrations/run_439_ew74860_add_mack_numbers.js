'use strict';

/**
 * EW74860 (Donaldson P554860, coolant spin-on): adds the Mack numbers 25MF428 and 25MF435. Donaldson official site (2026-11-18): searching either number returns P554860
 * "FILTRO DE REFRIGERANTE, ENROSCABLE" (Mack 25MF428 and Mack 25MF435). Petroil lists 25MF428 on its C4428. A number held by another SKU is reported, never moved.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EW74860';
const URL_DON = 'https://shop.donaldson.com/store/es-us/search?Ntt=25MF428&Ntk=All';
const SRC = 'DONALDSON_OFFICIAL_SEARCH_MACK_25MF428_25MF435_P554860_20261118';
const SRC_LIST = SRC;
const OEM = { MACK: ['25MF428', '25MF435'] };
const OFFICIAL_AFTERMARKET = {};
const LIST = {};
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
    if (!cur || cur.codigo_base !== 'P554860') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const heldRows = (await db.query("SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) code, c.sku FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.catalog_active")).rows;
    const held = new Map(); for (const r of heldRows) { if (!held.has(r.code)) held.set(r.code, []); held.get(r.code).push(r.sku); }
    const oem = (cur.oem_codes || []).slice(); const comp = (cur.competitor_codes || []).slice(); const added = []; const skipped = [];
    const have = new Set([norm('P554860'), ...oem.concat(comp).map((x) => norm(x.code))]);
    const take = (map, target, mk) => { for (const [brand, codes] of Object.entries(map)) for (const code of codes) {
      const k = norm(code);
      if (have.has(k)) continue;
      if (held.has(k)) { skipped.push(`${brand}:${code}=${held.get(k).join('/')}`); continue; }
      have.add(k); target.push(mk(brand, code)); added.push(`${brand}:${code}`);
    } };
    take(OEM, oem, (brand, code) => ({ code, manufacturer: brand, classification: 'OEM', classification_source: SRC, source_url: URL_DON }));
    take(OFFICIAL_AFTERMARKET, comp, (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC, source_url: URL_DON }));
    take(LIST, comp, (brand, code) => ({ code, manufacturer: brand, classification: 'AFTERMARKET', classification_source: SRC_LIST, source_url: URL_DON }));
    report.added = added; report.held_elsewhere_not_loaded = skipped;
    if (added.length) {
      assertGovernedCatalogPatch(cur, { oem_codes: oem, competitor_codes: comp }, { validateApplications: false });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(oem), JSON.stringify(comp)]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    }
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part('P554860'), ld_catalog.norm_part('25MF428'), ld_catalog.norm_part('25MF435'))", [SKU])).rows;
    report.integrity = (await db.query('SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts, (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts, (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
