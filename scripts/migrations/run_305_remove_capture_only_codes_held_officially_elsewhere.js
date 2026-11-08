'use strict';

/**
 * Remove 7 reference entries that a SKU holds only from the bulk Donaldson capture (productos*.json) while another
 * active HD SKU holds the same number from a Donaldson official product page: 45252 and 45253 (hydraulic cartridges
 * EH61735/EH61736 against air filters), 5829830 and LA940 (EA17360 against EA10747), 67219 (EA20161 against EA11071),
 * 6857 (EA27455 against EL83191). Operator rule 2026-11-08: one reference belongs to one product. Same rule as run_304.
 *
 * Touches only the matching entry of those SKUs in oem_codes/competitor_codes, their matching exact_part_reference
 * rows (snapshotted) and, through the catalogue trigger, their cache rows. The holder SKUs are not written.
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> for revert.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
// [hydraulic sku, code, air sku that keeps it]
const ITEMS = [
  ['EH61735', '45252', 'EA11039'], ['EH61736', '45253', 'EA14931'], ['EA17360', '5829830', 'EA10747'],
  ['EA17360', 'LA940', 'EA10747'], ['EA20161', '67219', 'EA11071'], ['EA27455', '6857', 'EL83191'],
];
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => norm(e && typeof e === 'object' ? e.code || e.reference : e);

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', items: [] };
  const snap = { rows: [], exact_part_reference: [], crossref_resolved_cache: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const hy = [...new Set(ITEMS.map((i) => i[0]))], air = [...new Set(ITEMS.map((i) => i[2]))], all = [...hy, ...air];
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) FOR UPDATE', [all])).rows;
    const by = Object.fromEntries(rows.map((r) => [r.sku, r]));
    const othersHash = () => db.query(`SELECT md5(string_agg(md5(e::text),'|' ORDER BY e.sku)) h FROM public.elimfilters_catalog e WHERE NOT (e.sku=ANY($1::text[]))`, [all]).then((r) => r.rows[0].h);
    const airHash = () => db.query(`SELECT md5(string_agg(md5(e::text),'|' ORDER BY e.sku)) h FROM public.elimfilters_catalog e WHERE e.sku=ANY($1::text[])`, [air]).then((r) => r.rows[0].h);
    const conflicts = () => db.query(`SELECT count(*)::int n FROM public.exact_part_conflicts WHERE skus && $1::varchar[]`, [all]).then((r) => r.rows[0].n);
    const [oBefore, aBefore] = [await othersHash(), await airHash()];
    report.conflicts_before = await conflicts();

    for (const [sku, code, airSku] of ITEMS) {
      const h = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [sku])).rows[0], a = by[airSku];
      if (!h || !a || h.duty !== 'HEAVY_DUTY' || a.duty !== 'HEAVY_DUTY') throw new Error('ROW_CHANGED ' + sku);
            const key = norm(code);
      if (!(await db.query(`SELECT 1 FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2 AND source LIKE 'DONALDSON_OFFICIAL%'`, [airSku, key])).rowCount) throw new Error('AIR_SIDE_NOT_OFFICIAL ' + airSku);
      if (!(await db.query(`SELECT 1 FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2 AND source NOT LIKE 'DONALDSON_OFFICIAL%'`, [sku, key])).rowCount) throw new Error('REMOVED_SIDE_NOT_CAPTURE_ONLY ' + sku);
      if ((await db.query(`SELECT 1 FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2 AND source LIKE 'DONALDSON_OFFICIAL%'`, [sku, key])).rowCount) throw new Error('REMOVED_SIDE_HAS_OFFICIAL ' + sku);
      const patch = {}; let removed = 0;
      for (const f of ['oem_codes', 'competitor_codes']) {
        const cur = Array.isArray(h[f]) ? h[f] : [];
        const next = cur.filter((e) => codeOf(e) !== key);
        removed += cur.length - next.length;
        patch[f] = next;
      }
      if (!removed) throw new Error('CODE_NOT_ON_HYDRAULIC ' + sku);
      assertGovernedCatalogPatch(h, patch);
      if (!snap.rows.some((x) => x.sku === sku)) snap.rows.push(by[sku]);
      snap.crossref_resolved_cache.push(...(await db.query(`SELECT * FROM public.crossref_resolved_cache WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g'))=$2`, [sku, key])).rows);
      snap.exact_part_reference.push(...(await db.query(`SELECT * FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2`, [sku, key])).rows);
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      const epr = (await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2`, [sku, key])).rowCount;
      const cache = (await db.query(`SELECT count(*)::int n FROM public.crossref_resolved_cache WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g'))=$2`, [sku, key])).rows[0].n;
      report.items.push({ sku, code, kept_on: airSku, entries_removed: removed, exact_part_reference_removed: epr, cache_rows_left_for_code: cache });
      if (cache) throw new Error('CACHE_STILL_HOLDS ' + sku + ' ' + code);
    }
    if ((await othersHash()) !== oBefore) throw new Error('OTHER_ROWS_CHANGED');
    if ((await airHash()) !== aBefore) throw new Error('AIR_ROWS_CHANGED');
    report.conflicts_after = await conflicts();
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
