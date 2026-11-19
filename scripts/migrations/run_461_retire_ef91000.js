'use strict';

/**
 * EF91000 is a mislabeled row: fuel spin-on 93 mm carrying base CS41000, which Donaldson types as lube cartridge P550286 (Donaldson search, 2026-11-18),
 * and carrying codes (FS1000, 3329289) that Donaldson assigns only to P551000 = ES91000. Operator ruling 2026-11-18: retire it.
 * Least destructive retirement (run_340 mechanism): catalog_active=false, resolution_status INACTIVE_RETIRED superseded_by ES91000,
 * cache rows removed, SUPERSEDED reference EF91000 -> ES91000 so the old code still resolves. The row and its history are NOT deleted.
 * Links to EF91000 in the alternatives of ES98000 / EF91103 are removed (governed patch; skipped and reported if the gateway blocks).
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EF91000';

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row || !row.catalog_active || row.codigo_base !== 'CS41000') throw new Error('SOURCE_CHANGED');
    const es = (await db.query("SELECT catalog_active,codigo_base FROM public.elimfilters_catalog WHERE sku='ES91000'")).rows[0];
    if (!es || !es.catalog_active || es.codigo_base !== 'P551000') throw new Error('ES91000_NOT_READY');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row }, null, 2));

    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}',
        '{"state":"INACTIVE_RETIRED","reason":"MISLABELED_ROW_BASE_CS41000_IS_DONALDSON_P550286_LUBE_CARTRIDGE_FUEL_CODES_BELONG_TO_P551000","superseded_by":"ES91000","decided_by":"OPERATOR","updated_at":"2026-11-18","migration":"run_461"}'::jsonb)
      WHERE sku=$1`, [SKU]);
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [SKU]);
    await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
      VALUES ('SUPERSEDED','ELIMFILTERS','EF91000','ES91000','RUN_461_RETIRED_INTO_ES91000') ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`);

    report.links = {};
    for (const s of ['ES98000', 'EF91103']) {
      const r = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [s])).rows[0];
      const clean = (v) => (Array.isArray(v) ? v.filter((x) => (typeof x === 'string' ? x : x && x.code) !== SKU) : v);
      const patch = { alternatives: clean(r.alternatives), alternative_products: clean(r.alternative_products) };
      try {
        await db.query('SAVEPOINT s');
        assertGovernedCatalogPatch(r, patch, { validateApplications: false });
        await db.query('UPDATE public.elimfilters_catalog SET alternatives=$2::jsonb, alternative_products=$3::jsonb WHERE sku=$1', [s, JSON.stringify(patch.alternatives), patch.alternative_products == null ? null : JSON.stringify(patch.alternative_products)]);
        await db.query('RELEASE SAVEPOINT s');
        report.links[s] = 'link removed';
      } catch (e) { await db.query('ROLLBACK TO SAVEPOINT s'); report.links[s] = 'BLOCKED ' + String(e.message).slice(0, 160); }
    }
    for (const s of ['ES91000', 'EF91103', 'ES98000']) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('FS1000'),ld_catalog.norm_part('3329289'),ld_catalog.norm_part('EF91000'))")).rows;
    report.active_ef91000 = (await db.query("SELECT catalog_active FROM public.elimfilters_catalog WHERE sku=$1", [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
