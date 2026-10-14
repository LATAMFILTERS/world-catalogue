'use strict';

/**
 * Retire EL30962: it is not one product.
 *
 * The row (Light Duty "oil", base "0962") merges 38 different MANN part
 * numbers that only share the digits 962: W962 and W962/2 … /53 (oil
 * spin-ons), WD962 and WD962/4 … /32 (hydraulic), WDK962/1 … /20 (fuel) and
 * H962 (an element). Its own base governance lists all 38 as candidates
 * (REVIEW_PRIMARY_CANDIDATE, high-cardinality contamination flags). It carries
 * 222 OEM and 577 competitor references, 316 applications that are mostly
 * heavy equipment (cranes, compactors, loaders), a height of 5,384.8 mm and an
 * outer diameter of 2,362.2 mm, and no Light Duty canonical identity.
 *
 * The 38 filters cannot be told apart from this row, and no MANN catalogue
 * capture exists to rebuild them. Operator order 2026-10-12 (option 1): retire
 * it, with no successor.
 *
 * Retiring = catalog_active false (reversible; the row and its history stay).
 * No supersession is recorded: no single product replaces it. References also
 * held by another active product keep resolving there (WD962/9 and WD962/19
 * on EH60416); the others stop resolving.
 *
 * Same mechanism as run_242.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const SKU = 'EL30962';
const BASE = '0962';

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const found = await db.query(
      `SELECT sku, codigo_base, duty, catalog_active,
              jsonb_array_length(coalesce(enrichment_data->'codigo_base_governance'->'observed_primary_candidates','[]'::jsonb)) AS candidates,
              EXISTS (SELECT 1 FROM ld_catalog.ld_canonical_product_identity i WHERE i.elimfilters_sku=c.sku AND i.status='ACTIVE') AS has_identity
       FROM public.elimfilters_catalog c WHERE sku=$1 FOR UPDATE`, [SKU]);
    if (found.rowCount !== 1) throw new Error('SKU_MISSING');
    const row = found.rows[0];
    if (row.codigo_base !== BASE || !row.catalog_active) throw new Error(`ROW_CHANGED base=${row.codigo_base} active=${row.catalog_active}`);
    // the premise: many candidate identities, none established
    if (row.candidates < 10) throw new Error(`NO_LONGER_A_MERGED_FAMILY candidates=${row.candidates}`);
    if (row.has_identity) throw new Error('CANONICAL_IDENTITY_NOW_ON_RECORD');

    const u = await db.query(
      `UPDATE public.elimfilters_catalog
       SET catalog_active=false,
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb)
       WHERE sku=$1`,
      [SKU, JSON.stringify({
        state: 'INACTIVE_RETIRED',
        reason: 'ROW_MERGES_MANY_DISTINCT_MANN_PARTS',
        merged_candidates: row.candidates,
        decided_by: 'OPERATOR',
        updated_at: '2026-10-12',
        migration: 'run_276',
      })]);
    if (u.rowCount !== 1) throw new Error('UPDATE_COUNT_CHANGED');
    // an inactive row must not keep answering cross-reference lookups
    report.cache_rows_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [SKU])).rowCount;

    report.merged_candidates = row.candidates;
    report.row = (await db.query('SELECT sku, codigo_base, catalog_active FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    report.still_resolve = (await db.query(
      `SELECT code, array_agg(sku ORDER BY sku) AS skus FROM public.crossref_resolved_cache
       WHERE upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) = ANY($1::text[]) GROUP BY code ORDER BY code`,
      [['WD9629', 'WD96219', 'W962']])).rows;

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
