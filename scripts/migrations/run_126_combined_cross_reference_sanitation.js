'use strict';
const fs = require('fs');
const { Pool } = require('pg');
const { classifyReference } = require('../../lib/cross-reference-classification');
const { assertCrossReferenceReclassification } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--apply');
const normCode = (r = {}) => String(r.code || r.reference || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const refKey = (r = {}) => [
  String(r.manufacturer || r.brand || '').toUpperCase().trim(),
  normCode(r),
  String(r.classification || r.source_type || '').toUpperCase().trim()
].join('|');

function dedupe(refs) {
  const seen = new Set();
  return refs.filter((r) => {
    const k = refKey(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
function crossCodeCount(oem, competitor) {
  const a = new Set((Array.isArray(oem) ? oem : []).map(normCode).filter(Boolean));
  const b = new Set((Array.isArray(competitor) ? competitor : []).map(normCode).filter(Boolean));
  let n = 0;
  for (const code of a) if (b.has(code)) n++;
  return n;
}
function sanitize(row) {
  const source = [];
  for (const ref of Array.isArray(row.oem_codes) ? row.oem_codes : []) source.push({ ref, origin: 'OEM' });
  for (const ref of Array.isArray(row.competitor_codes) ? row.competitor_codes : []) source.push({ ref, origin: 'AFTERMARKET' });

  const byCode = new Map();
  for (const item of source) {
    const code = normCode(item.ref);
    if (!code) continue;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(item);
  }

  const oem = [], competitor = [];
  for (const items of byCode.values()) {
    const known = new Set(items.map((x) => classifyReference(x.ref)).filter((x) => x !== 'UNKNOWN'));
    if (known.size === 1) {
      const target = [...known][0];
      for (const item of items) (target === 'OEM' ? oem : competitor).push(item.ref);
      continue;
    }
    for (const item of items) {
      const cls = classifyReference(item.ref);
      if (cls === 'OEM') oem.push(item.ref);
      else if (cls === 'AFTERMARKET') competitor.push(item.ref);
      else (item.origin === 'OEM' ? oem : competitor).push(item.ref);
    }
  }
  return { oem_codes: dedupe(oem), competitor_codes: dedupe(competitor) };
}

(async () => {
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  const db = await pool.connect();
  const report = { mode: APPLY ? 'apply' : 'dry-run', scanned: 0, changed: 0, pass: 0, updated: 0, blocked: [] };

  try {
    await db.query('BEGIN');
    const { rows } = await db.query('SELECT * FROM elimfilters_catalog ORDER BY id FOR UPDATE');
    report.scanned = rows.length;
    for (const row of rows) {
      const patch = sanitize(row);
      const beforeOem = JSON.stringify(Array.isArray(row.oem_codes) ? row.oem_codes : []);
      const beforeComp = JSON.stringify(Array.isArray(row.competitor_codes) ? row.competitor_codes : []);
      if (beforeOem === JSON.stringify(patch.oem_codes) && beforeComp === JSON.stringify(patch.competitor_codes)) continue;
      report.changed++;
      const oldCross = crossCodeCount(row.oem_codes, row.competitor_codes);
      const newCross = crossCodeCount(patch.oem_codes, patch.competitor_codes);
      if (newCross > oldCross) {
        report.blocked.push({ sku: row.sku, reason: ['CROSS_COLUMN_DUPLICATE_COUNT_INCREASE'], old_cross: oldCross, new_cross: newCross });
        continue;
      }
      try {
        assertCrossReferenceReclassification(row, patch);
        report.pass++;
      } catch (e) {
        report.blocked.push({ sku: row.sku, reason: e.validation?.reasons || [e.message] });
        continue;
      }
      if (APPLY) {
        await db.query(
          'UPDATE elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb WHERE id=$3',
          [JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes), row.id]
        );
        report.updated++;
      }
    }
    if (APPLY) await db.query('COMMIT'); else await db.query('ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    fs.writeFileSync(
      'C:/Users/ELIMSERVER/world-catalogue-pg-gap/scripts/candidates/cross_reference_combined_sanitation_report_20260927.json',
      JSON.stringify(report, null, 2) + '\n'
    );
    console.log(JSON.stringify({
      mode: report.mode,
      scanned: report.scanned,
      changed: report.changed,
      pass: report.pass,
      updated: report.updated,
      blocked_count: report.blocked.length,
      transaction: report.transaction
    }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch {}
    report.transaction = 'ROLLBACK';
    report.error = e.message;
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } finally {
    db.release();
    await pool.end();
  }
})().catch((e) => { console.error(e); process.exit(1); });
