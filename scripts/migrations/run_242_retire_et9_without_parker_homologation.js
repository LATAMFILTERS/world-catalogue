'use strict';

/**
 * Retire the last three ET9 rows still on a Donaldson base.
 *
 *   ET93201S, ET93201T (base P553201)   ET932007P (base P553207)
 *
 * Operator rulings 2026-10-12: ET9 never takes a Donaldson base, and the Racor
 * base applies only to products homologated with Parker. No Racor number is on
 * record for these three, and neither Racor catalog reviewed (7480 marine,
 * 7529 fuel filtration) lists S3201S, S3201T or B32007P. Their Donaldson bases
 * already belong to EF93201 and ES93207. Operator order: retire them.
 *
 * Retiring = catalog_active false (reversible; the row and its history stay).
 * No supersession is recorded: nothing proves these Racor-dimensioned rows are
 * the same product as the Donaldson filter that holds the base.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

// sku, Donaldson base on the row, active product that holds that base
const ROWS = [
  ['ET93201S', 'P553201', 'EF93201'],
  ['ET93201T', 'P553201', 'EF93201'],
  ['ET932007P', 'P553207', 'ES93207'],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', retired: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const [sku, base, holder] of ROWS) {
      const found = await db.query('SELECT sku, codigo_base, catalog_active FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      if (found.rows[0].codigo_base !== base) throw new Error(`BASE_CHANGED ${sku}: found ${found.rows[0].codigo_base}`);
      const held = await db.query(
        'SELECT 1 FROM public.elimfilters_catalog WHERE sku=$1 AND codigo_base=$2 AND catalog_active', [holder, base]);
      if (!held.rowCount) throw new Error(`BASE_HOLDER_MISSING ${holder} ${base}`);
      const homologated = await db.query(
        `SELECT 1 FROM public.catalog_codigo_base_evidence WHERE sku=$1 AND (metadata ? 'racor_reference' OR manufacturer='RACOR')`, [sku]);
      if (homologated.rowCount) throw new Error(`RACOR_REFERENCE_NOW_ON_RECORD ${sku}`);

      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET catalog_active=false,
             enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb)
         WHERE sku=$1`,
        [sku, JSON.stringify({
          state: 'INACTIVE_RETIRED',
          reason: 'ET9_ON_DONALDSON_BASE_WITHOUT_PARKER_HOMOLOGATION',
          codigo_base_held_by: holder,
          decided_by: 'OPERATOR',
          updated_at: '2026-10-12',
          migration: 'run_242',
        })]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${sku}`);
      // an inactive row must not keep answering cross-reference lookups
      const cache = await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [sku]);
      report.retired.push({ sku, codigo_base: base, base_held_by: holder, was_active: found.rows[0].catalog_active, cache_rows_removed: cache.rowCount });
    }

    report.active_products_per_base = (await db.query(
      `SELECT codigo_base, array_agg(sku ORDER BY sku) AS skus FROM public.elimfilters_catalog
       WHERE codigo_base = ANY($1::text[]) AND catalog_active GROUP BY 1 ORDER BY 1`, [[...new Set(ROWS.map(r => r[1]))]])).rows;
    report.active_et9_on_any_donaldson_base = (await db.query(
      `SELECT sku, codigo_base FROM public.elimfilters_catalog
       WHERE sku LIKE 'ET9%' AND codigo_base ~ '^P[0-9]{6}$' AND catalog_active ORDER BY sku`)).rows;

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
