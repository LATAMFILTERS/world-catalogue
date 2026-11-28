'use strict';
// Operator 2026-11-27: 19 Heavy Duty SKUs with a Donaldson code base whose official shop product page was opened that day (page exists for the exact part, outer diameter matches the catalogue).
// Records the verified Donaldson source and the code base governance. Dry-run by default (ROLLBACK), reporting the certification checks. --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
// base: [Donaldson shop product id, outer diameter (mm) on the page]
const PAGES = { P570315: ['62405', 145.2], P580947: ['prod1640139', 114.3], P566341: ['37384', 97.7], P566355: ['37398', 97.7], P566372: ['37415', 80.1], P566480: ['37493', 86.4], P566488: ['37501', 86.4], P566494: ['37507', 96.2], P566636: ['37676', 69.9], P566711: ['37667', 152.8],
  P567005: ['41931', 55.3], P567009: ['41935', 56], P567017: ['41943', 73.66], P567033: ['38462', 96.11], P567034: ['38463', 96.11], P567054: ['38475', 91.44], P567080: ['64709', 73], P567097: ['39463', 84.2], P567098: ['39465', 84.2] };
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', updated: [], skipped: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE upper(codigo_base)=ANY($1) AND catalog_active ORDER BY sku FOR UPDATE', [Object.keys(PAGES)])).rows;
    if (rows.length !== 19) throw new Error('SOURCE_CHANGED ' + rows.length);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2), { flag: 'wx' });
    for (const r of rows) {
      const base = r.codigo_base.toUpperCase();
      const [id, od] = PAGES[base];
      if (r.duty !== 'HEAVY_DUTY' || r.canonical_source_status === 'VERIFIED' || Math.abs(Number(r.outer_diameter_mm) - od) > Math.max(1.5, od * 0.02)) { report.skipped[r.sku] = `CHECK_FAILED od=${r.outer_diameter_mm}`; continue; }
      const url = `https://shop.donaldson.com/store/es-us/product/${base}/${id}`;
      const g = { ...(r.enrichment_data?.codigo_base_governance || {}), state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: new Date().toISOString(), evidence_url: url, required_authority: 'DONALDSON_PRIMARY',
        current_codigo_base: base, approved_codigo_base: base, approved_manufacturer: 'DONALDSON', approved_source_column: 'CANONICAL_POLICY', primary_manufacturer_verified: true, contamination_flags: [] };
      await db.query(`UPDATE public.elimfilters_catalog SET canonical_source_brand='DONALDSON', canonical_source_code=$2, canonical_source_status='VERIFIED', canonical_source_url=$3, canonical_verified_at=now(), canonical_evidence=$4::jsonb,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{codigo_base_governance}',$5::jsonb) WHERE sku=$1`,
      [r.sku, base, url, JSON.stringify({ source: 'DONALDSON_OFFICIAL_SHOP_20261127', authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', check: 'product page for the exact part; outer diameter matches', outer_diameter_mm: od }), JSON.stringify(g)]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [r.sku]);
      report.updated.push(r.sku);
    }
    const evaluate = fs.readFileSync(`${__dirname}/recertify_hd_skus_list.js`, 'utf8').match(/const EVALUATE = `([\s\S]*?)`;/)[1].replace(/\\\\/g, '\\');
    report.checks = (await db.query(`SELECT sku, blockers, resolver_sku_count, resolver_only_sku FROM (${evaluate}) a WHERE a.sku=ANY($1) AND (cardinality(a.blockers)>0 OR a.resolver_only_sku IS DISTINCT FROM a.sku)`, [report.updated])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
