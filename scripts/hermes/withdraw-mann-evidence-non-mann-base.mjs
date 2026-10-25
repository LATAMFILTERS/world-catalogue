#!/usr/bin/env node
// Withdraw MANN-derived evidence from LD SKUs whose canonical source is VERIFIED with ANOTHER brand
// (e.g. FRAM G9 vs MANN PU 10 009 z: only the last four digits coincide). The vehicle batch took the
// MANN code from ld_vehicle_applications.source_sku and did not check the verified canonical brand.
//
// Per SKU, nothing is deleted from the product:
//   - catalog_application_evidence MANN_OFFICIAL_CATALOG rows -> verified=false (guard hides the payload again)
//   - exact_part_reference rows with source MANN_OFFICIAL_PAGE_OE_20261025 -> removed (added by us)
//   - dimensions written from the MANN page -> previous values restored (dimension_evidence.replaced),
//     new values cleared, status/source back to unverified
// The vehicle_applications payload cannot be rewritten without evidence (trigger run_077); it stays
// withheld until the SKU is processed against its own base brand.
//
// DRY RUN by default (ROLLBACK). Execute: --execute --confirm-count <affected SKUs in the dry run>.

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const execute = args.execute === 'true';
const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();
const DIM_COLS = ['outer_diameter_mm', 'outer_diameter_1_mm', 'inner_diameter_mm', 'inner_diameter_1_mm', 'gasket_od_mm', 'gasket_id_mm',
  'height_mm', 'product_length_mm', 'product_width_mm', 'inlet_mm', 'outlet_mm', 'thread_size'];

const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', affected: [] };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const { rows } = await db.query(`
    SELECT c.sku, c.canonical_source_brand, c.canonical_source_code, c.product_dimensions_source,
           c.enrichment_data->'dimension_evidence' AS dim_ev
    FROM public.elimfilters_catalog c
    WHERE c.catalog_active AND c.duty='LIGHT_DUTY'
      AND upper(coalesce(c.canonical_source_status,'')) IN ('VERIFIED','EXCEPTION_CONFIRMED')
      AND c.canonical_source_brand IS NOT NULL AND c.canonical_source_brand !~* '^MANN'
      AND EXISTS (SELECT 1 FROM public.catalog_application_evidence e WHERE e.sku=c.sku AND e.verified AND e.evidence_authority='MANN_OFFICIAL_CATALOG')
    ORDER BY c.sku`);
  for (const r of rows) {
    const ev = (await db.query(
      `UPDATE public.catalog_application_evidence
         SET verified=false, metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object('withdrawn_at', now(), 'withdrawn_reason', $2::text)
       WHERE sku=$1 AND evidence_authority='MANN_OFFICIAL_CATALOG' AND verified`,
      [r.sku, `canonical source verified as ${r.canonical_source_brand} ${r.canonical_source_code}; MANN code only shared SKU digits`])).rowCount;
    const refs = (await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND source='MANN_OFFICIAL_PAGE_OE_20261025'`, [r.sku])).rowCount;
    let dims = 0;
    if (r.product_dimensions_source === 'OFFICIAL_MANN_PRODUCT_PAGE' && r.dim_ev) {
      const set = {};
      for (const k of Object.keys(r.dim_ev.values || {})) if (DIM_COLS.includes(k)) set[k] = (r.dim_ev.replaced || {})[k] ?? null;
      const keys = Object.keys(set);
      await db.query(
        `UPDATE public.elimfilters_catalog SET ${keys.map((k, i) => `${k}=$${i + 2}`).join(', ')}${keys.length ? ',' : ''}
           product_dimensions_source=NULL, product_dimensions_validation_status=NULL,
           enrichment_data = jsonb_set(enrichment_data, '{dimension_evidence,withdrawn_at}', to_jsonb(now()::text))
         WHERE sku=$1`, [r.sku, ...keys.map((k) => set[k])]);
      dims = keys.length;
    }
    report.affected.push({ sku: r.sku, base: `${r.canonical_source_brand} ${r.canonical_source_code}`, evidence_withdrawn: ev, references_removed: refs, dimensions_restored: dims });
  }
  if (execute && Number(args['confirm-count']) !== report.affected.length) {
    throw new Error(`--confirm-count must equal the dry-run affected count (${report.affected.length}); nothing committed`);
  }
  await db.query(execute ? 'COMMIT' : 'ROLLBACK');
  report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  report.transaction = 'ROLLBACK_ERROR'; report.error = e.message; process.exitCode = 1;
} finally { await db.end(); }
const outDir = path.resolve('out', 'mann-withdraw'); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `withdraw-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ mode: report.mode, affected: report.affected.length,
  sample: report.affected.slice(0, 8).map((a) => `${a.sku} [${a.base}] ev-${a.evidence_withdrawn} refs-${a.references_removed} dims-${a.dimensions_restored}`),
  transaction: report.transaction, error: report.error, file: out }, null, 2));
