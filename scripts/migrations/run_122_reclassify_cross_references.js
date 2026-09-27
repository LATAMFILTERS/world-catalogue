'use strict';
const { Pool } = require('pg');
const { classifyReference } = require('../../lib/cross-reference-classification');
const { assertCrossReferenceReclassification } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--apply');
const normCode = (ref = {}) => String(ref.code || ref.reference || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const key = (ref = {}) =>
  String(ref.manufacturer || ref.brand || '').trim().toUpperCase() + '|' +
  String(ref.code || ref.reference || '').trim().toUpperCase();

function dedupe(refs) {
  const seen = new Set();
  return refs.filter((ref) => {
    const k = key(ref) === '|' ? 'RAW|' + JSON.stringify(ref) : key(ref);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function reclassify(row) {
  const originalOem = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const originalComp = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  const oem = [], competitor = [], unknownOem = [], unknownComp = [];
  for (const ref of originalOem) {
    const c = classifyReference(ref);
    if (c === 'OEM') oem.push(ref);
    else if (c === 'AFTERMARKET') competitor.push(ref);
    else unknownOem.push(ref);
  }
  for (const ref of originalComp) {
    const c = classifyReference(ref);
    if (c === 'OEM') oem.push(ref);
    else if (c === 'AFTERMARKET') competitor.push(ref);
    else unknownComp.push(ref);
  }
  return {
    oem_codes: dedupe([...oem, ...unknownOem]),
    competitor_codes: dedupe([...competitor, ...unknownComp]),
  };
}

(async () => {
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  const db = await pool.connect();
  const report = { mode: APPLY ? 'apply' : 'dry-run', scanned: 0, changed: 0, updated: 0, blocked: [] };
  try {
    await db.query('BEGIN');
    const { rows } = await db.query(
      'SELECT id,sku,duty,oem_codes,competitor_codes FROM elimfilters_catalog ORDER BY id FOR UPDATE'
    );
    report.scanned = rows.length;
    for (const row of rows) {
      const patch = reclassify(row);
      const beforeOem = JSON.stringify(Array.isArray(row.oem_codes) ? row.oem_codes : []);
      const beforeComp = JSON.stringify(Array.isArray(row.competitor_codes) ? row.competitor_codes : []);
      if (beforeOem === JSON.stringify(patch.oem_codes) &&
          beforeComp === JSON.stringify(patch.competitor_codes)) continue;
      const oemCodes = new Set(patch.oem_codes.map(normCode).filter(Boolean));
      const compCodes = new Set(patch.competitor_codes.map(normCode).filter(Boolean));
      const cross = [...oemCodes].filter((code) => compCodes.has(code));
      if (cross.length) {
        report.blocked.push({ sku: row.sku, reasons: ['CODE_LEVEL_CLASSIFICATION_CONFLICT'], codes: cross });
        continue;
      }
      try {
        assertCrossReferenceReclassification(row, patch);
      } catch (e) {
        report.blocked.push({ sku: row.sku, reasons: e.validation?.reasons || [e.message] });
        continue;
      }
      report.changed++;
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
    const fs = require('fs');
    fs.writeFileSync('C:/Users/ELIMSERVER/world-catalogue-pg-gap/scripts/candidates/cross_reference_reclassification_report_20260927.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({mode:report.mode,scanned:report.scanned,changed:report.changed,updated:report.updated,blocked_count:report.blocked.length,transaction:report.transaction}, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch {}
    report.transaction = 'ROLLBACK';
    report.error = e.message;
    const fs = require('fs');
    fs.writeFileSync('C:/Users/ELIMSERVER/world-catalogue-pg-gap/scripts/candidates/cross_reference_reclassification_report_20260927.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({mode:report.mode,scanned:report.scanned,changed:report.changed,updated:report.updated,blocked_count:report.blocked.length,transaction:report.transaction}, null, 2));
    process.exitCode = 1;
  } finally {
    db.release();
    await pool.end();
  }
})().catch((e) => { console.error(e); process.exit(1); });
