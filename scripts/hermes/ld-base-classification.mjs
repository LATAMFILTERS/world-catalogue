#!/usr/bin/env node
// READ-ONLY classification of active LD SKUs whose canonical source is not yet verified, against the LD base policy
// (Victor 2026-10-04, restated 2026-10-25): European vehicles -> MANN base; non-European -> FRAM base; when neither
// MANN nor FRAM makes it -> the most commercial OEM code. SKU = prefix + last four digits of the base code.
//
// Per SKU: vehicle origin (current payload), candidate MANN / FRAM / OEM codes (codigo_base + alternate lists), and
// whether a candidate of the brand the policy requires already carries the SKU's last four digits.
// Classes:
//   MANN_SAME_DIGITS         European, MANN code with the SKU digits      -> MANN flow (no renumbering)
//   MANN_OTHER_DIGITS        European, MANN code(s) with other digits      -> renumbering decision
//   EUROPEAN_NO_MANN_CODE    European, no MANN code on the SKU             -> MANN lookup / OEM base review
//   FRAM_SAME_DIGITS         non-European, FRAM code with the SKU digits   -> FRAM/WIX flow (no renumbering)
//   FRAM_OTHER_DIGITS        non-European, FRAM code(s) with other digits  -> renumbering decision
//   NON_EUROPEAN_NO_FRAM_CODE non-European, no FRAM code on the SKU        -> WIX/FRAM lookup / OEM base review
//   NO_ORIGIN                no usable applications                        -> origin cannot be decided here
// The origin comes from the current (unverified) payload, which is known to contain 4-digit cross contamination, so
// this is a work list, not a decision: nothing is written.
//
// Usage: node scripts/hermes/ld-base-classification.mjs [--prefix EA3]

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { originGroupOf } from './ld-origin-group.mjs';
import { norm, last4, codeOf, makerOf, FRAM_SHAPE } from './lib/ld-fram-base.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const prefix = args.prefix ? String(args.prefix).toUpperCase() : null;
const isMann = (m) => /^MANN\b|^MANN-FILTER/i.test(String(m || '').trim());
const isFram = (m) => /^FRAM\b/i.test(String(m || '').trim());
const MANN_SHAPE = /^(HU|W|WK|C|CU|CUK|CUA|FP|H|HUK|PU|WA|WP|ZR|CK|LC|K|CF|CP)\d{2,5}[A-Z0-9]{0,6}$/;

const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
const db = new pg.Client({ connectionString: url });
await db.connect();
let rows;
try {
  await db.query('BEGIN READ ONLY');
  ({ rows } = await db.query(`
    SELECT c.sku, c.codigo_base, c.canonical_source_brand, c.canonical_source_status, c.competitor_codes, c.oem_codes, c.vehicle_applications,
           EXISTS (SELECT 1 FROM public.catalog_application_evidence e WHERE e.sku=c.sku AND e.application_kind='VEHICLE' AND e.verified
                   AND e.payload_hash=md5(c.vehicle_applications::text)) AS apps_verified
    FROM public.elimfilters_catalog c
    WHERE c.catalog_active AND c.duty='LIGHT_DUTY'
      AND upper(coalesce(c.canonical_source_status,'')) NOT IN ('VERIFIED','EXCEPTION_CONFIRMED')
      AND ($1::text IS NULL OR c.sku LIKE $1::text || '%')
    ORDER BY c.sku`, [prefix]));
} finally { await db.query('ROLLBACK').catch(() => {}); await db.end(); }

const out = [];
for (const r of rows) {
  const alts = [...(Array.isArray(r.competitor_codes) ? r.competitor_codes : []), ...(Array.isArray(r.oem_codes) ? r.oem_codes : [])];
  const base = norm(r.codigo_base);
  const baseEntry = alts.find((e) => norm(codeOf(e)) === base);
  const baseBrand = baseEntry ? makerOf(baseEntry) : FRAM_SHAPE.test(base) ? 'FRAM?' : MANN_SHAPE.test(base) ? 'MANN?' : null;
  const uniq = (list) => [...new Set(list.map((x) => norm(x)).filter((x) => x.length >= 3))];
  const mann = uniq([...alts.filter((e) => isMann(makerOf(e))).map(codeOf), ...(/MANN/.test(baseBrand || '') ? [base] : [])]);
  const fram = uniq([...alts.filter((e) => isFram(makerOf(e))).map(codeOf), ...(/FRAM/.test(baseBrand || '') ? [base] : [])]);
  const oem = uniq((Array.isArray(r.oem_codes) ? r.oem_codes : [])
    .filter((e) => !/AFTERMARKET|COMPETITOR/i.test(String(e?.classification || e?.source_type || 'OEM'))).map(codeOf));
  const origin = originGroupOf(r.vehicle_applications);
  const d = last4(r.sku);
  let cls;
  if (origin.group === 'UNKNOWN') cls = 'NO_ORIGIN';
  else if (origin.group === 'EUROPEAN') cls = mann.some((c) => last4(c) === d) ? 'MANN_SAME_DIGITS' : mann.length ? 'MANN_OTHER_DIGITS' : 'EUROPEAN_NO_MANN_CODE';
  else cls = fram.some((c) => last4(c) === d) ? 'FRAM_SAME_DIGITS' : fram.length ? 'FRAM_OTHER_DIGITS' : 'NON_EUROPEAN_NO_FRAM_CODE';
  out.push({ sku: r.sku, cls, codigo_base: r.codigo_base, base_brand: baseBrand, base_digits_match: last4(r.codigo_base) === d,
    origin: origin.group, european_share: origin.european_share, app_rows: origin.rows, apps_verified: r.apps_verified,
    mann_codes: mann, fram_codes: fram, oem_codes: oem.slice(0, 12), oem_count: oem.length,
    same_digit_mann: mann.filter((c) => last4(c) === d), same_digit_fram: fram.filter((c) => last4(c) === d) });
}

const dir = path.resolve('out', 'ld-base-classification'); fs.mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = path.join(dir, `classification-${stamp}.json`);
fs.writeFileSync(file, JSON.stringify({ generated_at: new Date().toISOString(), prefix, rows: out }, null, 2));
const csv = ['sku,class,codigo_base,base_brand,base_digits_match,origin,european_share,app_rows,apps_verified,mann_codes,fram_codes,oem_count',
  ...out.map((o) => [o.sku, o.cls, o.codigo_base, o.base_brand, o.base_digits_match, o.origin, o.european_share, o.app_rows, o.apps_verified,
    o.mann_codes.join(' '), o.fram_codes.join(' '), o.oem_count].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
fs.writeFileSync(file.replace(/\.json$/, '.csv'), csv);

const by = (k) => out.reduce((m, o) => { const v = typeof k === 'function' ? k(o) : o[k]; m[v] = (m[v] || 0) + 1; return m; }, {});
const sample = (cls) => out.filter((o) => o.cls === cls).filter((_, i, a) => i % Math.max(1, Math.floor(a.length / 4)) === 0).slice(0, 4)
  .map((o) => `${o.sku} base=${o.codigo_base}(${o.base_brand || '-'}) eu=${o.european_share} mann=[${o.mann_codes.slice(0, 3)}] fram=[${o.fram_codes.slice(0, 3)}] oem=${o.oem_count}`);
const classes = by('cls');
console.log(JSON.stringify({ total: out.length, classes,
  by_prefix: Object.fromEntries(Object.entries(by((o) => `${o.sku.slice(0, 3)} ${o.cls}`)).sort()),
  apps_verified_by_class: by((o) => `${o.cls} ${o.apps_verified ? 'VERIFIED' : 'UNVERIFIED'}`),
  base_brand_of_codigo_base: by((o) => o.base_brand || '(desconocida)'),
  samples: Object.fromEntries(Object.keys(classes).map((c) => [c, sample(c)])),
  json: file, csv: file.replace(/\.json$/, '.csv') }, null, 2));
