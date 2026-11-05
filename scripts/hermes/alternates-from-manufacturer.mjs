#!/usr/bin/env node
// Fills elimfilters_catalog.alternatives (array of ELIMFILTERS SKUs) from alternates the MANUFACTURER declares
// (operator rule approved 2026-11-04):
//   - Donaldson "Alternatives" of a product page (capture files in productos.json format, official.alternatives)
//   - Fleetguard "Replaces" / "Replaced By" (out/fleetguard/fleetguard-capture-*.json, related)
//   - Racor micron variants of one element: same Racor base digits, P/S/T suffix (S3209P/S/T)
// A pair is linked only when both codes are the codigo_base of an ACTIVE SKU; links are written both ways.
// Existing alternatives are kept (union, never removed). Dry-run by default (ROLLBACK); --execute to COMMIT.
// Usage: node scripts/hermes/alternates-from-manufacturer.mjs --capture <productos.json> [--capture <more.json>] [--execute]
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const argv = process.argv.slice(2);
const execute = argv.includes('--execute');
const captures = argv.flatMap((a, i) => (a === '--capture' ? [argv[i + 1]] : []));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const pairs = []; // [codeA, codeB, source]
for (const f of captures) {
  for (const r of JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''))) {
    if (r.status !== 'EXTRAIDO') continue;
    for (const a of (r.official && r.official.alternatives) || []) pairs.push([norm(r.requested_code), norm(a), 'DONALDSON_ALTERNATIVES:' + path.basename(f)]);
  }
}
const fgDir = path.resolve('out', 'fleetguard');
for (const f of fs.existsSync(fgDir) ? fs.readdirSync(fgDir).filter((x) => /^fleetguard-capture-\d+\.json$/.test(x)) : []) {
  for (const [code, p] of Object.entries(JSON.parse(fs.readFileSync(path.join(fgDir, f), 'utf8')).products || {})) {
    for (const k of ['Replaces', 'Replaced By']) for (const o of ((p.related || {})[k] || [])) pairs.push([norm(code), norm(o), 'FLEETGUARD_' + k.toUpperCase().replace(' ', '_')]);
  }
}
const db = new pg.Client({ connectionString: process.env.CATALOG_DATABASE_URL }); await db.connect();
const report = { mode: execute ? 'EXECUTE' : 'DRY_RUN_ROLLBACK', declared_pairs: pairs.length, linked: [], skus_updated: 0 };
try {
  await db.query('BEGIN');
  const rows = (await db.query(`SELECT sku, codigo_base, alternatives FROM public.elimfilters_catalog WHERE catalog_active`)).rows;
  const byBase = new Map(); for (const r of rows) { const k = norm(r.codigo_base); if (k) (byBase.get(k) || byBase.set(k, []).get(k)).push(r); }
  // Racor P/S/T micron variants
  const racor = rows.filter((r) => /^[SB]\d{4,5}[PST]$/.test(norm(r.codigo_base)));
  const fam = new Map(); for (const r of racor) { const k = norm(r.codigo_base).slice(0, -1); (fam.get(k) || fam.set(k, []).get(k)).push(r); }
  for (const list of fam.values()) for (const a of list) for (const b of list) if (a !== b) pairs.push([norm(a.codigo_base), norm(b.codigo_base), 'RACOR_MICRON_VARIANT']);
  const add = new Map(); // sku -> Map(altSku -> source)
  for (const [x, y, src] of pairs) {
    const A = byBase.get(x) || []; const B = byBase.get(y) || [];
    if (A.length !== 1 || B.length !== 1 || A[0].sku === B[0].sku) continue;
    for (const [s, t] of [[A[0], B[0]], [B[0], A[0]]]) {
      if ((s.alternatives || []).includes(t.sku)) continue;
      (add.get(s.sku) || add.set(s.sku, new Map()).get(s.sku)).set(t.sku, src);
    }
  }
  for (const [sku, m] of add) {
    const row = rows.find((r) => r.sku === sku);
    const next = [...new Set([...(Array.isArray(row.alternatives) ? row.alternatives : []), ...m.keys()])];
    await db.query(`UPDATE public.elimfilters_catalog SET alternatives=$2::jsonb,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{alternatives_evidence}', coalesce(enrichment_data->'alternatives_evidence','{}'::jsonb) || $3::jsonb)
      WHERE sku=$1 AND catalog_active`, [sku, JSON.stringify(next), JSON.stringify(Object.fromEntries([...m].map(([t, s]) => [t, { source: s, recorded_at: new Date().toISOString(), rule: 'operator 2026-11-04 manufacturer-declared alternates' }])))]);
    report.skus_updated++; for (const [t, s] of m) report.linked.push(`${sku}->${t} ${s}`);
  }
  await db.query(execute ? 'COMMIT' : 'ROLLBACK'); report.transaction = execute ? 'COMMIT' : 'ROLLBACK';
} catch (e) { await db.query('ROLLBACK').catch(() => {}); report.transaction = 'ROLLBACK_ERROR'; report.error = e.message; process.exitCode = 1; }
finally { await db.end(); }
const bySrc = report.linked.reduce((m, l) => { const s = l.split(' ').pop().split(':')[0]; m[s] = (m[s] || 0) + 1; return m; }, {});
console.log(JSON.stringify({ mode: report.mode, declared_pairs: report.declared_pairs, skus_updated: report.skus_updated, links: report.linked.length, by_source: bySrc,
  sample: report.linked.slice(0, 10), transaction: report.transaction, error: report.error }, null, 1));
