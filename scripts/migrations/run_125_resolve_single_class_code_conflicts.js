'use strict';
const fs = require('fs');
const { Pool } = require('pg');
const { assertCrossReferenceReclassification } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--apply');
const MANIFEST = 'C:/Users/ELIMSERVER/world-catalogue-pg-gap/scripts/candidates/cross_reference_code_level_single_class_20260927.json';
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
function patchRow(row, decisions) {
  let oem = Array.isArray(row.oem_codes) ? [...row.oem_codes] : [];
  let competitor = Array.isArray(row.competitor_codes) ? [...row.competitor_codes] : [];

  for (const d of decisions) {
    const refs = dedupe([
      ...oem.filter((r) => normCode(r) === d.code),
      ...competitor.filter((r) => normCode(r) === d.code)
    ]);
    oem = oem.filter((r) => normCode(r) !== d.code);
    competitor = competitor.filter((r) => normCode(r) !== d.code);
    if (d.target === 'OEM') oem.push(...refs);
    else competitor.push(...refs);
  }

  return { oem_codes: dedupe(oem), competitor_codes: dedupe(competitor) };
}

(async () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const grouped = new Map();
  for (const item of manifest) {
    if (!grouped.has(item.sku)) grouped.set(item.sku, []);
    grouped.get(item.sku).push(item);
  }
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  const db = await pool.connect();
  const report = { mode: APPLY ? 'apply' : 'dry-run', skus: grouped.size, codes: manifest.length, pass: 0, updated: 0, blocked: [] };

  try {
    await db.query('BEGIN');
    for (const [sku, decisions] of grouped) {
      const q = await db.query('SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (q.rowCount !== 1) {
        report.blocked.push({ sku, reason: 'SKU_NOT_UNIQUE_OR_MISSING' });
        continue;
      }
      const row = q.rows[0];
      const patch = patchRow(row, decisions);
      try {
        assertCrossReferenceReclassification(row, patch);
        report.pass++;
      } catch (e) {
        report.blocked.push({ sku, reason: e.validation?.reasons || [e.message] });
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
      'C:/Users/ELIMSERVER/world-catalogue-pg-gap/scripts/candidates/cross_reference_single_class_code_resolution_report_20260927.json',
      JSON.stringify(report, null, 2) + '\n'
    );
    console.log(JSON.stringify({
      mode: report.mode,
      skus: report.skus,
      codes: report.codes,
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
