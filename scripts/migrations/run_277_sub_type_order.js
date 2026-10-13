'use strict';

/**
 * Operator rule 2026-10-13:
 *   filter_media = 'GENUINE FILTER MEDIA' on every SKU
 *   sub_type     = a form/role value from a closed list, never a media or brand name
 *
 * sub_type held 102 different values, mostly media ("Cellulose", "Synthetic")
 * and source names ("Fleetguard"). The data file gives the new value for each
 * of the 13,390 active products; null means no stored evidence of the form,
 * so the field is emptied instead of guessed. Sources, in order: Donaldson
 * captured Type (Primary / Safety -> Secondary) for air, installation_type,
 * Donaldson captured Style, the former sub_type text. Built by
 * C:\ELIMSERVER\evidence\type-subtype-order-20261013\propuesta.js.
 *
 * filter_type is not touched: the public Type name comes from
 * lib/public-filter-type.js.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const DATA = require('./run_277_sub_type_order.data.json');
const MEDIA = 'GENUINE FILTER MEDIA';
const ROLES = ['', 'Primary', 'Secondary'];
const FORMS = ['', 'Radial Seal', 'Axial Seal', 'Spin On', 'Cartridge', 'Panel', 'Round', 'Cone', 'Obround',
  'Finned', 'In Line', 'Strainer', 'Housing', 'Assembly'];
const ALLOWED = new Set(ROLES.flatMap((r) => FORMS.map((f) => `${r} ${f}`.trim())).filter(Boolean));

(async () => {
  for (const [sku, sub] of DATA) {
    if (!/^[A-Z]{2}[0-9][0-9A-Z]+$/.test(sku) || (sub !== null && !ALLOWED.has(sub))) throw new Error(`DATA_INVALID ${sku} ${sub}`);
  }
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', data_rows: DATA.length };

  try {
    await db.query('BEGIN');
    report.sub_type_updated = (await db.query(
      `UPDATE public.elimfilters_catalog c
       SET sub_type = d.sub
       FROM unnest($1::text[], $2::text[]) AS d(sku, sub)
       WHERE c.sku = d.sku AND c.catalog_active AND c.sub_type IS DISTINCT FROM d.sub`,
      [DATA.map((r) => r[0]), DATA.map((r) => r[1])])).rowCount;
    report.filter_media_updated = (await db.query(
      `UPDATE public.elimfilters_catalog SET filter_media = $1 WHERE filter_media IS DISTINCT FROM $1`, [MEDIA])).rowCount;
    report.active_not_in_data = (await db.query(
      `SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE catalog_active AND sku <> ALL($1::text[])`,
      [DATA.map((r) => r[0])])).rows[0].n;
    report.other_media = (await db.query(
      `SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE filter_media IS DISTINCT FROM $1`, [MEDIA])).rows[0].n;
    report.active_sub_types = (await db.query(
      `SELECT coalesce(sub_type, '(empty)') AS sub_type, count(*)::int AS n FROM public.elimfilters_catalog
       WHERE catalog_active GROUP BY 1 ORDER BY 2 DESC`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
