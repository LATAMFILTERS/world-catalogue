'use strict';

/**
 * EL33807 (Light Duty, FRAM PH3807): operator 2026-11-25, "no se deben vincular códigos HD con LD, son códigos base diferentes" + "aplica EL33807". Ruling 2026-11-12 (as run_339 / run_481): a code held by an
 * active Heavy Duty product stays on the Heavy Duty product and is dropped from the Light Duty one. The set of codes is computed at run time against the active HD SKUs (crossref cache, normalised part numbers)
 * and written to the report. Only EL33807 is written (oem_codes, competitor_codes, its exact_part_reference rows, its cache); every HD row is hash-checked before and after.
 * The own code base PH3807 is never touched. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL33807';
const BASE = 'PH3807';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.duty !== 'LIGHT_DUTY' || cur.codigo_base !== BASE || !cur.catalog_active) throw new Error('SOURCE_CHANGED');
    const mine = [...new Set([...(cur.oem_codes || []), ...(cur.competitor_codes || [])].map((x) => norm(x.code)))];
    const hdHeld = (await db.query(`SELECT DISTINCT ld_catalog.norm_part(k.code) AS code FROM public.crossref_resolved_cache k JOIN public.elimfilters_catalog e ON e.sku=k.sku AND e.duty='HEAVY_DUTY' AND e.catalog_active
      WHERE ld_catalog.norm_part(k.code) = ANY($1::text[])`, [mine])).rows.map((r) => r.code);
    const drop = new Set(hdHeld);
    drop.delete(norm(BASE));
    const hdHashSql = "SELECT sku, md5(row(oem_codes, competitor_codes, codigo_base, catalog_active)::text) h FROM public.elimfilters_catalog WHERE duty='HEAVY_DUTY' ORDER BY sku";
    const hdBefore = sha((await db.query(hdHashSql)).rows);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, dropped_codes: [...drop], row_sha256: sha(cur) }, null, 2));
    const keep = (list) => (list || []).filter((x) => !drop.has(norm(x.code)));
    const patch = { oem_codes: keep(cur.oem_codes), competitor_codes: keep(cur.competitor_codes) };
    report.before = [(cur.oem_codes || []).length, (cur.competitor_codes || []).length];
    report.codes_total = mine.length;
    report.codes_dropped = drop.size;
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    report.exact_rows_removed = (await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`, [SKU, [...drop]])).rowCount;
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    if (sha((await db.query(hdHashSql)).rows) !== hdBefore) throw new Error('HD_ROWS_CHANGED');
    const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (s.codigo_base !== BASE || s.canonical_source_brand !== 'FRAM') throw new Error('IDENTITY_CHANGED');
    report.after = [(s.oem_codes || []).length, (s.competitor_codes || []).length];
    report.vehicle_applications_kept = (s.vehicle_applications || []).length;
    report.still_shared_with_hd = (await db.query(`SELECT count(DISTINCT ld_catalog.norm_part(k.code))::int n FROM public.crossref_resolved_cache k JOIN public.crossref_resolved_cache m ON ld_catalog.norm_part(m.code)=ld_catalog.norm_part(k.code) AND m.sku=$1
      JOIN public.elimfilters_catalog e ON e.sku=k.sku AND e.duty='HEAVY_DUTY' AND e.catalog_active`, [SKU])).rows[0].n;
    report.resolver_ph3807 = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)`, [BASE])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
