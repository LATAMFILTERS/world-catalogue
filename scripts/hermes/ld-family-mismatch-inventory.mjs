#!/usr/bin/env node
// READ-ONLY inventory of LD SKUs whose official MANN product is NOT a Light Duty product
// of the SKU's family, collected from the vehicle-batch outputs:
//   - summary.json rows held as FAMILY_MISMATCH (MANN title: Hydraulics, Cooling Liquid, ...)
//   - commit-results.json rows refused because the base is a MANN WD / WDK code (HD by ruling)
//
// Operator rulings (Victor, 2026-10-24/25): MANN WD and WDK are Heavy Duty; an HD product must
// not appear in LD. Expected HD family by MANN title:
//   Hydraulic*            -> EH6 (NANOFORCE)
//   Cooling Liquid        -> EW7 (THERMACORE)
//   Fuel / WDK            -> EF9 or ES9 (SYNTAPORE / HYDROCORE)
//   Oil (WD oil)          -> EL8 (SYNTRAX HD)
//   Secondary Element/Air -> EA1 (MACROCORE HD)
//   Cabin (in EA3)        -> NOT HD: an LD cabin product filed as engine air -> LD_RECLASS_REVIEW
// Output has the shape retire-ld-wd-into-hd.mjs consumes (status, hd_matches, wd_codes, target_prefixes).
// Nothing is written to the database.

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (x) => (x && typeof x === 'object' ? x.code || x.part_number || x.number : x);

// 1. Collect candidates from every batch run.
const cand = new Map();
const root = 'out/mann-batch';
for (const run of fs.existsSync(root) ? fs.readdirSync(root) : []) {
  const dir = path.join(root, run);
  const sumFile = path.join(dir, 'summary.json');
  if (fs.existsSync(sumFile)) {
    for (const r of JSON.parse(fs.readFileSync(sumFile, 'utf8')).rows || []) {
      if (String(r.reason || '').startsWith('FAMILY_MISMATCH') && r.mann_code) {
        cand.set(r.sku, { ld_sku: r.sku, code: r.mann_code, mann_title: r.mann_title || r.reason.replace(/^FAMILY_MISMATCH:\s*/, '') });
      }
    }
  }
  const comFile = path.join(dir, 'commit-results.json');
  if (fs.existsSync(comFile)) {
    for (const r of JSON.parse(fs.readFileSync(comFile, 'utf8'))) {
      const m = /MANN WD code (\S+) is HD/.exec(r.error || '');
      if (m && !cand.has(r.sku)) cand.set(r.sku, { ld_sku: r.sku, code: m[1], mann_title: /^WDK/i.test(m[1]) ? 'WDK fuel (HD)' : 'WD (HD)' });
    }
  }
}

const expected = (title, code) => {
  const t = String(title || '');
  if (/cabin|interior/i.test(t)) return { family: 'LD_CABIN', prefixes: [] };
  if (/^WDK/i.test(code) || /fuel/i.test(t)) return { family: 'HD_FUEL', prefixes: ['EF9', 'ES9'] };
  if (/hydraul/i.test(t)) return { family: 'HD_HYDRAULIC', prefixes: ['EH6'] };
  if (/cooling|coolant/i.test(t)) return { family: 'HD_COOLANT', prefixes: ['EW7'] };
  if (/oil/i.test(t) || /^WD/i.test(code)) return { family: /oil/i.test(t) ? 'HD_LUBE' : 'HD_UNSPECIFIED_WD', prefixes: /oil/i.test(t) ? ['EL8'] : ['EH6', 'EL8'] };
  if (/secondary|air/i.test(t)) return { family: 'HD_AIR', prefixes: ['EA1'] };
  return { family: 'UNKNOWN', prefixes: [] };
};

// 2. HD side: which HD SKUs cite each code.
const url = process.env.CATALOG_DATABASE_URL;
if (!url) throw new Error('CATALOG_DATABASE_URL is required');
const db = new pg.Client({ connectionString: url });
await db.connect();
let hd, refs, ld;
try {
  await db.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  ({ rows: hd } = await db.query(`SELECT sku, competitor_codes, oem_codes FROM public.elimfilters_catalog WHERE duty='HEAVY_DUTY' AND catalog_active`));
  ({ rows: refs } = await db.query(`SELECT r.sku, r.part_number FROM exact_part_reference r JOIN public.elimfilters_catalog c ON c.sku=r.sku AND c.duty='HEAVY_DUTY' AND c.catalog_active`));
  ({ rows: ld } = await db.query(`SELECT sku, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])`, [[...cand.keys()]]));
} finally {
  await db.query('ROLLBACK').catch(() => {});
  await db.end();
}
const byCode = new Map();
const add = (code, sku) => { const k = norm(code); if (!k) return; if (!byCode.has(k)) byCode.set(k, new Set()); byCode.get(k).add(sku); };
for (const h of hd) for (const x of [...(h.competitor_codes || []), ...(h.oem_codes || [])]) add(codeOf(x), h.sku);
for (const r of refs) add(r.part_number, r.sku);
const active = new Map(ld.map((r) => [r.sku, r.catalog_active]));

const rows = [...cand.values()].filter((c) => active.get(c.ld_sku) === true).map((c) => {
  const exp = expected(c.mann_title, c.code);
  const code = norm(c.code);
  const all = [...(byCode.get(code) || [])];
  const inFamily = all.filter((s) => exp.prefixes.some((p) => s.startsWith(p)));
  const status = exp.family === 'LD_CABIN' ? 'LD_RECLASS_REVIEW'
    : exp.family === 'UNKNOWN' ? 'UNKNOWN_FAMILY_REVIEW'
    : inFamily.length === 0 ? 'NO_HD_MATCH' : inFamily.length === 1 ? 'HD_HAS_WD_AS_COMPETITOR' : 'MULTIPLE_HD_MATCHES';
  return {
    ld_sku: c.ld_sku, wd_codes: [code], mann_code: c.code, mann_title: c.mann_title, expected_family: exp.family,
    target_prefixes: exp.prefixes, wd_scope: 'WD_SOLE_BASE', status,
    hd_matches: inFamily.map((sku) => ({ sku })), hd_other_family_citing: all.filter((s) => !inFamily.includes(s)),
  };
});

const outDir = path.resolve('out', 'ld-family-inventory'); fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, `inventory-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(file, JSON.stringify(rows, null, 2));
const by = rows.reduce((m, r) => { const k = `${r.expected_family}:${r.status}`; m[k] = (m[k] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ candidates_found: cand.size, active_ld: rows.length, by_family_status: by,
  sample: rows.slice(0, 10).map((r) => `${r.ld_sku} ${r.mann_code} [${r.expected_family}] -> ${r.status}${r.hd_matches.length ? ' ' + r.hd_matches.map((x) => x.sku).join(',') : ''}`),
  file }, null, 2));
