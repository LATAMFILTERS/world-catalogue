'use strict';

/**
 * Isuzu 8-97148-270-0 resolves to three products. Operator decision 2026-10-26:
 *
 *  - EL82042 (Donaldson P502042) is a DUAL-FLOW lube filter (full-flow + bypass).
 *    The description must say so, so it is not confused with EL80973.
 *  - EL80973 (Donaldson P550973) is the single-stage FULL-FLOW lube filter for the
 *    same number. Its description says so too, for the same reason.
 *  - EL31228 (Light Duty, MANN base 1228, carries 8-97148-270-1 / 97148270) is
 *    removed from the catalog.
 *
 * Retiring = catalog_active false (reversible; row and history stay), and its
 * cross-reference cache rows are deleted so it stops answering lookups. Same
 * mechanism as run_276. Isuzu 8971482700 keeps resolving to EL82042 and EL80973.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const LUBE = 'SYNTRAX™ high-performance lube filter is designed to protect engines from harmful contaminants while supporting efficient oil flow and reliable engine performance.';
const DESCRIBE = {
  EL82042: { base: 'P502042', text: `ELIMFILTERS® EL82042 SYNTRAX™ dual-flow lube filter combines full-flow and bypass filtration in one spin-on unit, designed to protect engines from harmful contaminants while supporting efficient oil flow and reliable engine performance.` },
  EL80973: { base: 'P550973', text: `ELIMFILTERS® EL80973 SYNTRAX™ full-flow lube filter is designed to protect engines from harmful contaminants while supporting efficient oil flow and reliable engine performance.` },
};
const RETIRE = { sku: 'EL31228', base: '1228' };

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', db: new URL(url).host };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const [sku, { base, text }] of Object.entries(DESCRIBE)) {
      const r = await db.query('SELECT codigo_base, catalog_active, description FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (r.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
      const row = r.rows[0];
      if (row.codigo_base !== base || !row.catalog_active) throw new Error(`ROW_CHANGED ${sku} base=${row.codigo_base} active=${row.catalog_active}`);
      // only replace the generic lube model wording (run_279); anything else was edited by hand
      if (row.description !== text && row.description !== `ELIMFILTERS® ${sku} ${LUBE}`) throw new Error(`DESCRIPTION_CHANGED ${sku}`);
      const u = await db.query('UPDATE public.elimfilters_catalog SET description=$2 WHERE sku=$1', [sku, text]);
      report[sku] = { updated: u.rowCount, description: text };
    }

    const f = await db.query('SELECT codigo_base, duty, catalog_active FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [RETIRE.sku]);
    if (f.rowCount !== 1) throw new Error('SKU_MISSING EL31228');
    if (f.rows[0].codigo_base !== RETIRE.base || f.rows[0].duty === 'HEAVY_DUTY') throw new Error(`ROW_CHANGED EL31228 base=${f.rows[0].codigo_base} duty=${f.rows[0].duty}`);
    if (f.rows[0].catalog_active) {
      await db.query(
        `UPDATE public.elimfilters_catalog SET catalog_active=false,
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb)
         WHERE sku=$1`,
        [RETIRE.sku, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'OPERATOR_REMOVED_ISUZU_8971482700_LD_DUPLICATE', decided_by: 'OPERATOR', updated_at: '2026-10-26', migration: 'run_285' })]);
    }
    report.EL31228 = {
      retired: true,
      cache_rows_removed: (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [RETIRE.sku])).rowCount,
    };

    report.isuzu_8971482700_resolves_to = (await db.query(
      `SELECT DISTINCT sku FROM public.crossref_resolved_cache WHERE regexp_replace(code,'[^0-9]','','g') IN ('8971482700','8971482701','97148270') ORDER BY sku`)).rows.map((r) => r.sku);
    if (report.isuzu_8971482700_resolves_to.includes(RETIRE.sku)) throw new Error('EL31228_STILL_RESOLVES');

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
