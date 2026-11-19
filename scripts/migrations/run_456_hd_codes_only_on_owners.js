'use strict';

/**
 * Operator ruling 2026-11-18:
 *  - FS1000 and Cummins/DAF 3329289 go only on ES91000 (Donaldson P551000). Removed from EF91000, EF91103 and Light Duty EF30965.
 *  - LF3000 and 3318853 go on EL83000 (Donaldson P553000) and its alternative products. This run removes them only from the Light Duty rows EL32005 / EL32300
 *    (never alternatives of a Donaldson HD part). HD rows EL82637, EL83548, EL87300, EL89009 are left until the P553000 alternative-products list is supplied.
 * Each SKU is patched through the governed gateway; a SKU the gateway blocks is reported and skipped (never bypassed). Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const PLAN = {
  EF91000: ['FS1000', '3329289'],
  EF91103: ['FS1000', '3329289'],
  EF30965: ['FS1000', '3329289'],
  EL32005: ['LF3000', '3318853'],
  EL32300: ['LF3000', '3318853'],
};

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [Object.keys(PLAN)])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    for (const r of rows) {
      const drop = new Set(PLAN[r.sku].map(norm));
      const isDrop = (x) => drop.has(norm(x.code));
      const o = (r.oem_codes || []).filter((x) => !isDrop(x));
      const c = (r.competitor_codes || []).filter((x) => !isDrop(x));
      const removed = [...(r.oem_codes || []), ...(r.competitor_codes || [])].filter(isDrop).map((x) => `${x.manufacturer}:${x.code}`);
      try {
        await db.query('SAVEPOINT s');
        const gw = assertGovernedCatalogPatch(r, { oem_codes: o, competitor_codes: c }, { validateApplications: false }).valid;
        await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [r.sku, JSON.stringify(o), JSON.stringify(c)]);
        await db.query('RELEASE SAVEPOINT s');
        report.skus[r.sku] = { removed, gateway: gw };
      } catch (e) {
        await db.query('ROLLBACK TO SAVEPOINT s');
        report.skus[r.sku] = { removed_if_allowed: removed, BLOCKED: String(e.message).slice(0, 300) };
      }
    }
    for (const s of [...Object.keys(PLAN), 'ES91000', 'EL83000']) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('FS1000'),ld_catalog.norm_part('3329289'))")).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
