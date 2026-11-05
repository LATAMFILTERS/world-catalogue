#!/usr/bin/env node
// READ-ONLY completeness audit of active HEAVY_DUTY SKUs, per prefix. Columns checked:
//   oem: oem_codes has >=1 code | comp: competitor_codes has >=1 code | equip: equipment_applications has >=1 row
//   specs: at least one official dimension (outer_diameter_mm, height_mm, product_length_mm, product_width_mm) AND
//          product_dimensions_validation_status official/verified | alt: alternatives or alternative_products non-empty
//   desc: description non-empty. FULL = all six.
// Output: out/audit/hd-completeness-<ts>.json (per-SKU missing list) + summary on stdout.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL });
await db.connect(); await db.query('BEGIN READ ONLY');
const { rows } = await db.query(`SELECT sku, codigo_base, technology,
  jsonb_typeof(oem_codes)='array' AND jsonb_array_length(oem_codes)>0 AS oem,
  jsonb_typeof(competitor_codes)='array' AND jsonb_array_length(competitor_codes)>0 AS comp,
  jsonb_typeof(equipment_applications)='array' AND jsonb_array_length(equipment_applications)>0 AS equip,
  (coalesce(outer_diameter_mm,height_mm,product_length_mm,product_width_mm) IS NOT NULL) AS dims,
  upper(coalesce(product_dimensions_validation_status,'')) IN ('VERIFIED','FULL_PRODUCT_DIMENSIONS_OFFICIAL') AS dims_official,
  (jsonb_typeof(alternatives)='array' AND jsonb_array_length(alternatives)>0) OR (alternative_products IS NOT NULL AND alternative_products::text NOT IN ('null','[]','{}')) AS alt,
  btrim(coalesce(description,''))<>'' AS descr
  FROM public.elimfilters_catalog WHERE catalog_active AND duty='HEAVY_DUTY' ORDER BY sku`);
await db.query('ROLLBACK'); await db.end();
const cols = ['oem', 'comp', 'equip', 'specs', 'alt', 'descr'];
for (const r of rows) { r.specs = r.dims && r.dims_official; r.missing = cols.filter((c) => !r[c]); r.full = r.missing.length === 0; }
const sum = (list) => ({ skus: list.length, full: list.filter((r) => r.full).length, ...Object.fromEntries(cols.map((c) => [c, list.filter((r) => r[c]).length])),
  dims_any: list.filter((r) => r.dims).length });
const byPrefix = {}; for (const r of rows) (byPrefix[r.sku.slice(0, 3)] ||= []).push(r);
const out = path.resolve('out', 'audit'); fs.mkdirSync(out, { recursive: true });
const file = path.join(out, `hd-completeness-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(rows.map((r) => ({ sku: r.sku, base: r.codigo_base, missing: r.missing })), null, 1));
const missCombo = rows.reduce((m, r) => { const k = r.missing.join('+') || 'COMPLETE'; m[k] = (m[k] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ total: sum(rows), by_prefix: Object.fromEntries(Object.entries(byPrefix).sort().map(([k, v]) => [k, sum(v)])),
  top_missing_combinations: Object.entries(missCombo).sort((a, b) => b[1] - a[1]).slice(0, 12), file }, null, 1));
