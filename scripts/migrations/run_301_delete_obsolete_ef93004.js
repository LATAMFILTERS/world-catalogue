'use strict';

/**
 * Physically deletes EF93004 (codigo_base FF63004, obsolete per ELIMFILTERS operator 2026-11-08).
 * Same shape as the operator-authorized ED40719 deletion: the row, its derived cache/ledger rows and its
 * cascading evidence rows go in ONE transaction; every deleted row is written to --snapshot first (revert source).
 * Asserted: no other catalogue row changes, no other SKU appears in the deleted dependents, nothing references
 * EF93004 inside another product's enrichment_data.
 * Dry-run by default (ROLLBACK). --execute commits.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const SKU = 'EF93004';
const BASE = 'FF63004';

// [table, sku column]; the cascade tables are deleted explicitly so they are snapshotted and counted.
const DEPENDENTS = [
  ['crossref_resolved_cache', 'sku'],
  ['catalog_sku_certification', 'sku'],
  ['exact_part_reference', 'sku'],
  ['catalog_codigo_base_evidence', 'sku'],
  ['catalog_codigo_base_sanitation_queue', 'sku'],
  ['product_model', 'elimfilters_sku'],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, deleted: {} };
  const snap = {};
  try {
    await db.query('BEGIN');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row) throw new Error('SKU_MISSING');
    if (row.codigo_base !== BASE) throw new Error('BASE_DRIFT ' + row.codigo_base);
    if (row.duty !== 'HEAVY_DUTY') throw new Error('NOT_HD');
    snap.catalog_row = row;

    const others = () => db.query(`SELECT md5(string_agg(md5(e::text),'|' ORDER BY e.sku)) h, count(*)::int n FROM public.elimfilters_catalog e WHERE e.sku<>$1`, [SKU]).then((r) => r.rows[0]);
    const before = await others();
    const refs = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND enrichment_data::text LIKE '%'||$1||'%'`, [SKU])).rows;
    if (refs.length) throw new Error('REFERENCED_BY_OTHER_PRODUCTS ' + JSON.stringify(refs));

    for (const [table, col] of DEPENDENTS) {
      const rows = (await db.query(`SELECT * FROM public.${table} WHERE ${col}=$1`, [SKU])).rows;
      snap[table] = rows;
      const del = await db.query(`DELETE FROM public.${table} WHERE ${col}=$1`, [SKU]);
      report.deleted[table] = del.rowCount;
    }
    const hermes = (await db.query('SELECT * FROM public.hermes_catalogue_evidence WHERE sku=$1', [SKU])).rows;
    snap.hermes_catalogue_evidence_set_null = hermes.map((r) => r.id ?? r);
    const delRow = await db.query('DELETE FROM public.elimfilters_catalog WHERE sku=$1', [SKU]);
    report.deleted.elimfilters_catalog = delRow.rowCount;
    if (delRow.rowCount !== 1) throw new Error('DELETE_COUNT');

    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    const after = await others();
    if (after.h !== before.h || after.n !== before.n) throw new Error('OTHER_PRODUCTS_CHANGED');
    report.residual = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.crossref_resolved_cache WHERE sku=$1) cache,
      (SELECT count(*)::int FROM public.catalog_sku_certification WHERE sku=$1) ledger,
      (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE sku=$1) resolver_v7,
      (SELECT count(*)::int FROM public.hermes_catalogue_evidence WHERE sku=$1) hermes`, [SKU])).rows[0];
    report.other_products = after.n;
    report.hd_active_conflict_skus = (await db.query(`SELECT count(DISTINCT v.sku)::int n FROM public.catalog_reference_classification_conflicts_v v JOIN public.elimfilters_catalog c ON c.sku=v.sku WHERE c.duty='HEAVY_DUTY' AND c.catalog_active`)).rows[0].n;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
