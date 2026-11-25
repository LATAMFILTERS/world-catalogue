'use strict';

/**
 * Operator 2026-11-25: retire the Light Duty duplicates of Heavy Duty Donaldson products so the HD SKUs stop being blocked by a cross-duty shared code (the HD product keeps the codes, ruling 2026-11-12).
 * Only the two LD rows that are verifiably the same part as their HD partner by dimensions (within 3%) are retired here:
 *   EL30227 (LD, OD 108, H 260, 1 1/8-16, base 0227, no brand) = EL84004 (HD, P554004, OD 108, H 262)
 *   EL34030 (LD, OD 93,  H 137, 1-16,     base 4030, no brand) = EL88616 (HD, P558616, OD 93,  H 136)
 * NOT retired (held for the operator, they are not clear duplicates): EA38506 (LD air PANEL vs EA11558 HD air ROUND, 50 vehicle applications) and
 * EA33372 (LD air panel OD 165, 340 vehicle applications, shares codes with an HD OIL filter).
 * Whole rows, nothing deleted: catalog_active=false, resolution_status INACTIVE_RETIRED (same mechanism as run_388 / run_478 / run_482). Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const TARGETS = [
  { sku: 'EL30227', base: '0227', hd: 'EL84004', reason: 'LD_DUPLICATE_OF_HD_EL84004_BY_DIMENSIONS' },
  { sku: 'EL34030', base: '4030', hd: 'EL88616', reason: 'LD_DUPLICATE_OF_HD_EL88616_BY_DIMENSIONS' },
];
const close = (a, b) => a != null && b != null && Math.abs(Number(a) - Number(b)) <= 0.03 * Math.max(Number(a), Number(b));

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', retired: [] };
  const snap = { captured_at: new Date().toISOString(), rows: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    for (const t of TARGETS) {
      const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [t.sku])).rows[0];
      if (!row || !row.catalog_active || row.duty !== 'LIGHT_DUTY' || row.codigo_base !== t.base) throw new Error('SOURCE_CHANGED ' + t.sku);
      const hd = (await db.query('SELECT sku, duty, catalog_active, height_mm, outer_diameter_mm, filter_type FROM public.elimfilters_catalog WHERE sku=$1', [t.hd])).rows[0];
      if (!hd || !hd.catalog_active || hd.duty !== 'HEAVY_DUTY' || hd.filter_type !== row.filter_type || !close(hd.height_mm, row.height_mm) || !close(hd.outer_diameter_mm, row.outer_diameter_mm)) throw new Error('NOT_A_DIMENSIONAL_DUPLICATE ' + t.sku + ' vs ' + t.hd);
      const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND enrichment_data->'kit'->'components' @> $1::jsonb`, [JSON.stringify([{ sku: t.sku }])])).rows;
      if (kits.length) throw new Error('RETIRED_SKU_USED_IN_KIT ' + t.sku + ' ' + kits.map((k) => k.sku).join(','));
      const codes = [...new Set([...(row.oem_codes || []), ...(row.competitor_codes || [])].map((e) => e.code))];
      const normCodes = codes.map((c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''));
      const held = (await db.query(`SELECT upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) code, count(DISTINCT r.sku)::int others FROM public.exact_part_reference r JOIN public.elimfilters_catalog c ON c.sku=r.sku AND c.catalog_active
        WHERE r.sku<>$2 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($1::text[]) GROUP BY 1`, [normCodes, t.sku])).rows;
      const heldSet = new Set(held.map((h) => h.code));
      snap.rows.push(row);
      await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb) WHERE sku=$1`,
        [t.sku, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: t.reason, correct_product: t.hd, decided_by: 'OPERATOR', updated_at: '2026-11-25', migration: 'run_483' })]);
      const cache = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [t.sku])).rowCount;
      const exact = (await db.query('DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>$2', [t.sku, 'SUPERSEDED'])).rowCount;
      report.retired.push({ sku: t.sku, reason: t.reason, codes: codes.length, codes_held_only_by_this_sku: normCodes.filter((c) => !heldSet.has(c)).length, cache_rows_removed: cache, exact_rows_removed: exact });
    }
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ ...snap, row_sha256: sha(snap.rows) }, null, 2));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
