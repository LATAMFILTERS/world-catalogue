#!/usr/bin/env node
// READ-ONLY inventory: LD SKUs whose base/source code is a MANN WD (hydraulic) code.
//
// Policy (Victor, 2026-10-24): MANN WD hydraulic codes are HD. They must not be LD
// SKUs (EL3); a WD code belongs as a MANN competitor code on the HD hydraulic SKU
// (EH6 / NANOFORCE), whose base follows the HD rule Donaldson -> Fleetguard -> OEM.
//
// For each LD SKU this reports where its WD code already lives on the HD side:
//   HD_HAS_WD_AS_COMPETITOR  an HD SKU already lists the WD code (competitor/OEM/exact ref)
//   NO_HD_MATCH              no HD SKU references the WD code -> STOP_REVIEW (no SKU is invented)
//   MULTIPLE_HD_MATCHES      more than one HD SKU references it -> STOP_REVIEW
// Nothing is written to the database (READ ONLY + ROLLBACK). Output: out/ld-wd-inventory/.
//
// Usage: node scripts/hermes/ld-hydraulic-wd-inventory.mjs

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
const db = new pg.Client({ connectionString: url });
await db.connect();
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

let ld, hd, refs;
try {
  await db.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  // LD SKUs whose base code (canonical identity or relational source_sku) is a WD code.
  ({ rows: ld } = await db.query(`
    WITH rel AS (
      SELECT elimfilters_sku sku, array_agg(DISTINCT btrim(source_sku)) codes
      FROM ld_catalog.ld_vehicle_applications
      WHERE nullif(btrim(source_sku),'') IS NOT NULL GROUP BY 1
      HAVING bool_or(source_sku ~* '^\\s*WD\\s*[0-9]'))
    SELECT c.sku, c.duty, c.technology, c.filter_type, c.codigo_base,
           i.canonical_part_number AS identity_code, rel.codes AS relational_codes,
           jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb)) AS vehicle_apps
    FROM public.elimfilters_catalog c
    LEFT JOIN ld_catalog.ld_canonical_product_identity i ON i.elimfilters_sku = c.sku AND i.status = 'ACTIVE'
    LEFT JOIN rel ON rel.sku = c.sku
    WHERE c.duty = 'LIGHT_DUTY' AND c.catalog_active = true
      AND (i.canonical_part_number ~* '^\\s*WD\\s*[0-9]' OR rel.sku IS NOT NULL)
    ORDER BY c.sku`));
  // HD SKUs with their competitor and OEM code lists.
  ({ rows: hd } = await db.query(`
    SELECT sku, technology, filter_type, codigo_base, canonical_source_brand,
           coalesce(competitor_codes,'[]'::jsonb) competitor_codes, coalesce(oem_codes,'[]'::jsonb) oem_codes
    FROM public.elimfilters_catalog WHERE duty = 'HEAVY_DUTY' AND catalog_active = true`));
  ({ rows: refs } = await db.query(`
    SELECT r.sku, r.brand, r.part_number, r.reference_type
    FROM exact_part_reference r JOIN public.elimfilters_catalog c ON c.sku = r.sku
    WHERE c.duty = 'HEAVY_DUTY' AND r.part_number ~* '^\\s*WD\\s*[0-9]'`));
} finally {
  await db.query('ROLLBACK').catch(() => {});
  await db.end();
}

// Index every WD-looking code on the HD side -> HD SKUs that reference it.
const hdByCode = new Map();
const add = (code, sku, where) => {
  const k = norm(code);
  if (!/^WD\d/.test(k)) return;
  if (!hdByCode.has(k)) hdByCode.set(k, new Map());
  hdByCode.get(k).set(sku, [...(hdByCode.get(k).get(sku) || []), where]);
};
const codeOf = (x) => (x && typeof x === 'object' ? x.code || x.part_number || x.number : x);
for (const h of hd) {
  for (const x of h.competitor_codes || []) add(codeOf(x), h.sku, 'competitor_codes');
  for (const x of h.oem_codes || []) add(codeOf(x), h.sku, 'oem_codes');
}
for (const r of refs) add(r.part_number, r.sku, `exact_part_reference:${r.reference_type}`);
const hdInfo = new Map(hd.map((h) => [h.sku, h]));

const rows = ld.map((s) => {
  const allCodes = [...new Set([s.identity_code, ...(s.relational_codes || [])].filter(Boolean).map(norm))];
  const codes = allCodes.filter((c) => /^WD\d/.test(c));
  const otherCodes = allCodes.filter((c) => !/^WD\d/.test(c));
  const matches = new Map();
  for (const c of codes) for (const [sku, where] of hdByCode.get(c) || []) matches.set(sku, { sku, where, technology: hdInfo.get(sku)?.technology, codigo_base: hdInfo.get(sku)?.codigo_base });
  const m = [...matches.values()];
  return {
    ld_sku: s.sku, technology: s.technology, filter_type: s.filter_type, codigo_base: s.codigo_base,
    wd_codes: codes, vehicle_apps: s.vehicle_apps,
    other_source_codes: otherCodes,
    // WD mixed with non-WD sources: the LD SKU may be a real oil filter contaminated by a WD
    // import. Only the WD-sourced rows are wrong there; the SKU itself is not retired.
    wd_scope: otherCodes.length ? 'WD_MIXED_WITH_OTHER_SOURCES' : 'WD_SOLE_BASE',
    status: codes.length !== 1 ? 'MULTIPLE_WD_CODES_REVIEW' : m.length === 0 ? 'NO_HD_MATCH' : m.length === 1 ? 'HD_HAS_WD_AS_COMPETITOR' : 'MULTIPLE_HD_MATCHES',
    hd_matches: m,
  };
});

const outDir = path.resolve('out', 'ld-wd-inventory');
fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, `inventory-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(rows, null, 2));
const by = rows.reduce((m, r) => { const k = `${r.wd_scope}:${r.status}`; m[k] = (m[k] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ ld_skus_with_wd_base: rows.length, by_status: by,
  sample: rows.slice(0, 8).map((r) => `${r.ld_sku} ${r.wd_codes.join('+')} [${r.wd_scope}] -> ${r.status}${r.hd_matches[0] ? ' ' + r.hd_matches.map((x) => x.sku).join(',') : ''}`),
  file }, null, 2));
