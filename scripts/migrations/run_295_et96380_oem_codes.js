'use strict';

/**
 * ET96380: load the operator-supplied OEM references (Perkins, Caterpillar, FG Wilson, Kubota).
 * A code already held by another SKU (resolver or any oem/competitor list) is skipped and reported, never moved.
 * Only ET96380 changes (asserted). Dry-run by default (ROLLBACK); --execute commits; --snapshot writes the before row.
 */
require('dotenv').config();
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const SKU = 'ET96380';
const OPERATOR = 'https://github.com/LATAMFILTERS/world-catalogue/blob/main/scripts/candidates/et96380_turbocore_assembly.json';
const PERKINS_URL = 'https://shop.perkins.com/product/perkins-130306380-fuel-filter-assembly?tabs-f11a=tab2';
const OEM = [
  ['PERKINS', '130306380'], ['PERKINS', '130446120'], ['PERKINS', '130306180'], ['PERKINS', '130306360'],
  ['CATERPILLAR', '276-1804'], ['CATERPILLAR', '2761804'],
  ['FG WILSON', '0000000038'], ['FG WILSON', '915-093'], ['FG WILSON', '10000-00038'], ['FG WILSON', '10000-06412'], ['FG WILSON', '10000-46303'],
  ['KUBOTA', 'P130306380'],
];
const norm = (v) => String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, loaded: [], skipped_held_by_other_sku: [] };
  try {
    await db.query('BEGIN');
    const others = () => db.query(`SELECT md5(string_agg(c::text,'|' ORDER BY c.sku)) h FROM public.elimfilters_catalog c WHERE sku<>$1`, [SKU]).then((r) => r.rows[0].h);
    const h0 = await others();
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row) throw new Error('SKU_MISSING');
    if (SNAPSHOT) require('fs').writeFileSync(SNAPSHOT, JSON.stringify(row, null, 1));
    const seen = new Set();
    const oem = [];
    for (const [manufacturer, code] of OEM) {
      const k = norm(code);
      if (seen.has(k)) continue;
      seen.add(k);
      const held = (await db.query(
        `SELECT DISTINCT sku FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=$1 AND sku<>$2
         UNION SELECT sku FROM public.elimfilters_catalog WHERE sku<>$2 AND (
           regexp_replace(upper(oem_codes::text),'[^A-Z0-9]','','g') LIKE '%'||$1||'%'
        OR regexp_replace(upper(competitor_codes::text),'[^A-Z0-9]','','g') LIKE '%'||$1||'%')`, [k, SKU])).rows.map((r) => r.sku);
      if (held.length) { report.skipped_held_by_other_sku.push({ manufacturer, code, held_by: held }); continue; }
      oem.push({ manufacturer, code, classification: 'OEM', product_scope: 'COMPLETE_ASSEMBLY',
        source_url: code === '130306380' ? PERKINS_URL : OPERATOR,
        evidence_status: code === '130306380' ? 'PERKINS_OFFICIAL_SHOP_PAGE' : 'OPERATOR_PROVIDED' });
      report.loaded.push(`${manufacturer} ${code}`);
    }
    assertGovernedCatalogPatch(row, { oem_codes: oem });
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(oem)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    if (await others() !== h0) throw new Error('OTHER_ROWS_CHANGED');
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 ORDER BY code`, [SKU])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts,
      (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts,
      (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows`, [SKU])).rows[0];
    const i = report.integrity;
    if (i.exact_conflicts || i.classification_conflicts || i.quarantine_rows) throw new Error('INTEGRITY_FAILED ' + JSON.stringify(i));
    report.cert = (await db.query('SELECT certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku=$1', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
