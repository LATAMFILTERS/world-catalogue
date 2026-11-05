#!/usr/bin/env node
// READ-ONLY audit of active LIGHT_DUTY SKUs against the LD rules (Victor 2026-10-04 / 2026-10-25):
//   - prefixes: EA3 air MACROCORE, EC3 cabin MICROKAPPA, EL3 oil SYNTRAX, EF3 fuel SYNTAPORE (no other LD prefix)
//   - base brand: European vehicles -> MANN; non-European -> FRAM; neither makes it -> most commercial OEM
//   - SKU = prefix + last four digits of the base code
//   - MANN WD / WDK codes are HD, not LD
// Checks per SKU: PREFIX_NOT_LD, TECH_MISMATCH, SUFFIX_MISMATCH, HD_MANN_CODE (WD/WDK base), BASE_BRAND
// (MANN / FRAM / OTHER by code shape and canonical_source_brand), ORIGIN (ld-origin-group on the vehicle payload),
// RULE_FIT (MANN+EU, FRAM+non-EU, OEM, or MISMATCH), and canonical status. Output: out/audit/ld-rules-<ts>.json.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { originGroupOf } from './ld-origin-group.mjs';

const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const TECH = { EA3: 'MACROCORE', EC3: 'MICROKAPPA', EL3: 'SYNTRAX', EF3: 'SYNTAPORE' };
const MANN_SHAPE = /^(C|CU|CUK|CF|W|WK|WP|HU|H|PU|P|BFU|WA|WDK|WD|WH|CP|CR|FP|FK)\d/;
const FRAM_SHAPE = /^(CA|CF|CH|PH|G|HPG|C|PS|XG|TG|FS|CS|PH)\d/;
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL });
await db.connect(); await db.query('BEGIN READ ONLY');
const { rows } = await db.query(`SELECT sku, codigo_base, technology, canonical_source_brand b, canonical_source_status s, vehicle_applications va
  FROM public.elimfilters_catalog WHERE catalog_active AND duty='LIGHT_DUTY' ORDER BY sku`);
await db.query('ROLLBACK'); await db.end();
const out = rows.map((r) => {
  const pre = r.sku.slice(0, 3); const base = norm(r.codigo_base); const tech = String(r.technology || '').toUpperCase().replace(/[^A-Z]/g, '');
  const brand = String(r.b || '').toUpperCase().includes('MANN') ? 'MANN' : String(r.b || '').toUpperCase().includes('FRAM') ? 'FRAM'
    : MANN_SHAPE.test(base) && !FRAM_SHAPE.test(base) ? 'MANN?' : FRAM_SHAPE.test(base) ? 'FRAM?' : 'OTHER';
  let origin = 'NO_ORIGIN';
  try { origin = (originGroupOf(r.va || []) || {}).group || 'NO_ORIGIN'; } catch { origin = 'NO_ORIGIN'; }
  const eu = origin === 'EUROPEAN'; const noneu = origin === 'NON_EUROPEAN';
  const issues = [];
  if (!TECH[pre]) issues.push('PREFIX_NOT_LD');
  else if (tech && tech !== TECH[pre]) issues.push('TECH_MISMATCH');
  if (base && base.replace(/\D/g, '').slice(-4).padStart(4, '0') !== r.sku.replace(/\D/g, '').slice(-4)) issues.push('SUFFIX_MISMATCH');
  if (/^WDK?\d/.test(base)) issues.push('HD_MANN_CODE');
  let fit = 'UNKNOWN_ORIGIN';
  if (eu) fit = brand.startsWith('MANN') ? 'OK_MANN_EU' : 'EU_NOT_MANN';
  else if (noneu) fit = brand.startsWith('FRAM') ? 'OK_FRAM_NON_EU' : 'NON_EU_NOT_FRAM';
  if (fit === 'EU_NOT_MANN' || fit === 'NON_EU_NOT_FRAM') issues.push(fit);
  return { sku: r.sku, base: r.codigo_base, brand, origin, tech, status: r.s || null, issues };
});
const by = (f) => out.reduce((m, r) => { const k = f(r); m[k] = (m[k] || 0) + 1; return m; }, {});
const issueCount = out.reduce((m, r) => { for (const i of r.issues) m[i] = (m[i] || 0) + 1; return m; }, {});
const dir = path.resolve('out', 'audit'); fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `ld-rules-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ld_active: out.length, by_prefix: by((r) => r.sku.slice(0, 3)), base_brand: by((r) => r.brand), origin: by((r) => r.origin),
  canonical_status: by((r) => r.status), tech_mismatch_values: by((r) => (r.issues.includes('TECH_MISMATCH') ? r.sku.slice(0, 3) + ' ' + r.tech : null)),
  brand_by_origin: by((r) => r.origin + ' / ' + r.brand), clean: out.filter((r) => !r.issues.length).length, issues: issueCount,
  samples: Object.fromEntries(Object.keys(issueCount).map((k) => [k, out.filter((r) => r.issues.includes(k)).slice(0, 5).map((r) => `${r.sku}=${r.base} (${r.brand}, ${r.origin})`)])), file }, null, 1));
