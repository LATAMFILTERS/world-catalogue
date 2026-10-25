#!/usr/bin/env node
// Remove MANN WD (Heavy Duty hydraulic) material from LD SKUs that ALSO have other,
// non-WD source codes (wd_scope = WD_MIXED_WITH_OTHER_SOURCES). The LD SKU stays;
// only what came from the WD import is removed.
//
// Operator ruling (Victor, 2026-10-24): a WD hydraulic is HD and must not appear in LD.
//
// Per SKU (inside one transaction):
//   1. ld_catalog relational rows whose source_sku is the WD code (vehicle applications,
//      specifications, competitor/OEM cross references when those tables carry source_sku)
//      are backed up to the report file and deleted (precedent: run_100 quarantine).
//   2. public vehicle_applications are not edited (trigger run_077 requires verified evidence);
//      the WD rows still in that payload are counted and stay withheld by the guard.
//   3. public competitor_codes / oem_codes: entries whose code is the WD code are removed
//      through the write gateway in rejection-cleanup mode (remove-only).
// The HD side is not changed. Nothing new is created.
//
// DRY RUN by default (ROLLBACK). Execute: --execute --confirm-count <N>.
// Usage:
//   node scripts/hermes/strip-wd-from-mixed-ld.mjs --inventory out\ld-wd-inventory\inventory-....json

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import pg from 'pg';

const require = createRequire(import.meta.url);
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
if (!args.inventory) throw new Error('--inventory <file> is required');
const execute = args.execute === 'true';
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => (e && typeof e === 'object' ? e.code || e.part_number || e.reference : e);

const inventory = JSON.parse(fs.readFileSync(args.inventory, 'utf8'));
const targets = inventory.filter((r) => r.wd_scope === 'WD_MIXED_WITH_OTHER_SOURCES' && r.wd_codes.length >= 1);
if (execute && Number(args['confirm-count']) !== targets.length) throw new Error(`--confirm-count must be ${targets.length}`);

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('database is not local');
const db = new pg.Client({ connectionString: url });
await db.connect();

const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', eligible: targets.length, done: [], skipped: [], backup: {} };
try {
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  // Relational tables in ld_catalog that carry source_sku (decided from the live schema).
  const { rows: tables } = await db.query(`
    SELECT c1.table_name FROM information_schema.columns c1
    WHERE c1.table_schema='ld_catalog' AND c1.column_name='source_sku'
      AND c1.table_name IN ('ld_vehicle_applications','ld_product_specifications','ld_competitor_cross_references','ld_oem_cross_references')
      AND EXISTS (SELECT 1 FROM information_schema.columns c2
                  WHERE c2.table_schema='ld_catalog' AND c2.table_name=c1.table_name AND c2.column_name='elimfilters_sku')`);
  const relTables = tables.map((t) => t.table_name);
  report.relational_tables = relTables;

  for (const t of targets) {
    const sku = t.ld_sku;
    const wd = new Set(t.wd_codes);
    const { rows: [row] } = await db.query(
      'SELECT sku, duty, catalog_active, vehicle_applications, competitor_codes, oem_codes FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
    if (!row || row.duty !== 'LIGHT_DUTY' || !row.catalog_active) { report.skipped.push({ sku, reason: 'LD_ROW_CHANGED_OR_INACTIVE' }); continue; }

    // 1. relational WD rows: back up, then delete
    const removed = {};
    let wdAppKeys = new Set();
    for (const tbl of relTables) {
      const { rows: wdRows } = await db.query(
        `SELECT * FROM ld_catalog.${tbl} WHERE elimfilters_sku=$1 AND upper(regexp_replace(source_sku,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`,
        [sku, [...wd]]);
      if (!wdRows.length) continue;
      (report.backup[sku] ||= {})[tbl] = wdRows;
      if (tbl === 'ld_vehicle_applications') {
        wdAppKeys = new Set(wdRows.map((r) => [norm(r.make), norm(r.model_family), norm(r.model_type)].join('|')));
      }
      removed[tbl] = (await db.query(
        `DELETE FROM ld_catalog.${tbl} WHERE elimfilters_sku=$1 AND upper(regexp_replace(source_sku,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`,
        [sku, [...wd]])).rowCount;
    }

    // 2. public vehicle_applications are NOT edited here: the DB trigger (run_077) only accepts an
    //    application payload with verified evidence, and the remaining rows have none. They are
    //    already withheld by the presentation guard. Once the WD source rows are gone, the SKU can
    //    resolve to a single base code and the MANN batch replaces the payload with evidence.
    const apps = Array.isArray(row.vehicle_applications) ? row.vehicle_applications : [];
    const wdAppsStillInPayload = apps.filter((a) => wdAppKeys.has([norm(a.make), norm(a.model_family), norm(a.model_type)].join('|'))).length;
    // 3. WD codes in the LD reference lists (remove-only)
    const keepComp = (row.competitor_codes || []).filter((e) => !wd.has(norm(codeOf(e))));
    const keepOem = (row.oem_codes || []).filter((e) => !wd.has(norm(codeOf(e))));
    const refsChanged = keepComp.length !== (row.competitor_codes || []).length || keepOem.length !== (row.oem_codes || []).length;
    if (refsChanged) {
      assertGovernedCatalogPatch(row, { competitor_codes: keepComp, oem_codes: keepOem }, { rejectionCleanup: true });
    }
    await db.query(
      `UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb, oem_codes=$3::jsonb,
         enrichment_data = jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{wd_hd_cleanup}', $4::jsonb)
       WHERE sku=$1`,
      [sku, JSON.stringify(keepComp), JSON.stringify(keepOem), JSON.stringify({
        removed_wd_codes: [...wd], relational_rows_removed: removed,
        public_vehicle_apps_from_wd_pending_evidence_rewrite: wdAppsStillInPayload,
        decided_by: 'OPERATOR', updated_at: '2026-10-24', procedure: 'strip-wd-from-mixed-ld',
      })]);
    const keepApps = apps;
    report.done.push({
      sku, wd: [...wd], relational_removed: removed,
      vehicle_apps: `${apps.length}->${keepApps.length}`,
      wd_apps_pending_in_public_payload: wdAppsStillInPayload,
      competitor_removed: (row.competitor_codes || []).length - keepComp.length,
      oem_removed: (row.oem_codes || []).length - keepOem.length,
    });
  }

  // Post-check: no WD code left on any processed LD row's reference lists.
  const skus = report.done.map((d) => d.sku);
  const left = (await db.query(`
    SELECT count(*)::int n FROM public.elimfilters_catalog c,
      jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb) || coalesce(c.oem_codes,'[]'::jsonb)) e
    WHERE c.sku = ANY($1::text[]) AND upper(regexp_replace(coalesce(e->>'code', e#>>'{}'),'[^A-Za-z0-9]','','g')) ~ '^WD[0-9]'`, [skus])).rows[0].n;
  if (left) throw new Error(`POSTCHECK_WD_STILL_ON_LD ${left}`);

  await db.query(execute ? 'COMMIT' : 'ROLLBACK');
  report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) {
  await db.query('ROLLBACK').catch(() => {});
  report.transaction = 'ROLLBACK_ERROR';
  report.error = e.message;
  process.exitCode = 1;
} finally {
  await db.end();
}
const out = path.join(path.dirname(args.inventory), `strip-wd-${execute ? 'execute' : 'dryrun'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const tot = report.done.reduce((m, d) => { m.apps += Number(d.vehicle_apps.split('->')[0]) - Number(d.vehicle_apps.split('->')[1]); m.comp += d.competitor_removed; m.oem += d.oem_removed;
  for (const [k, v] of Object.entries(d.relational_removed)) m.rel[k] = (m.rel[k] || 0) + v; return m; }, { apps: 0, comp: 0, oem: 0, rel: {} });
console.log(JSON.stringify({ mode: report.mode, eligible: report.eligible, processed: report.done.length, skipped: report.skipped,
  totals: { wd_apps_pending_in_public_payload: report.done.reduce((n, d) => n + d.wd_apps_pending_in_public_payload, 0), competitor_codes_removed: tot.comp, oem_codes_removed: tot.oem, relational_rows_removed: tot.rel },
  sample: report.done.slice(0, 8).map((d) => `${d.sku} ${d.wd.join('+')} apps ${d.vehicle_apps} comp-${d.competitor_removed} rel=${JSON.stringify(d.relational_removed)}`),
  relational_tables: report.relational_tables, transaction: report.transaction, error: report.error, file: out }, null, 2));
