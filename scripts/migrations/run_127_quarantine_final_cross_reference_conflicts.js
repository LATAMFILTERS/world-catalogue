'use strict';
const fs = require('fs');
const crypto = require('crypto');
const { Pool } = require('pg');
const { classifyReference } = require('../../lib/cross-reference-classification');
const { assertGovernedCatalogPatch, assertCrossReferenceReclassification } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--apply');
const SKUS = ['EA14046','EL83993','EF37233','EA31211','ES91844','EA18375','EA10464','EA14088','EA19511','EA16486','EA10591','EA10641'];
const normCode = (r = {}) => String(r.code || r.reference || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const normMfr = (r = {}) => String(r.manufacturer || r.brand || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const refKey = (r = {}) => [normMfr(r), normCode(r), String(r.classification || r.source_type || '').toUpperCase()].join('|');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

function dedupe(refs) {
  const seen = new Set();
  return refs.filter((r) => { const k = refKey(r); if (seen.has(k)) return false; seen.add(k); return true; });
}
function build(row) {
  const source = [];
  for (const ref of Array.isArray(row.oem_codes) ? row.oem_codes : []) source.push({ ref, origin: 'OEM' });
  for (const ref of Array.isArray(row.competitor_codes) ? row.competitor_codes : []) source.push({ ref, origin: 'AFTERMARKET' });

  const byCode = new Map();
  for (const item of source) {
    const code = normCode(item.ref);
    const key = code || '(NO_CODE)';
    if (!byCode.has(key)) byCode.set(key, []);
    byCode.get(key).push(item);
  }

  const quarantine = [];
  for (const [code, items] of byCode) {
    const known = new Set(items.map((x) => classifyReference(x.ref)).filter((x) => x !== 'UNKNOWN'));
    if (code === '(NO_CODE)' || known.size > 1) quarantine.push(...items.map((x) => ({ ...x, normalized_reference: code })));
  }
  const qset = new Set(quarantine.map((x) => x.origin + '|' + refKey(x.ref) + '|' + x.normalized_reference));
  const intermediateSource = source.filter((x) => !qset.has(x.origin + '|' + refKey(x.ref) + '|' + (normCode(x.ref) || '(NO_CODE)')));
  const intermediate = {
    oem_codes: dedupe(intermediateSource.filter((x) => x.origin === 'OEM').map((x) => x.ref)),
    competitor_codes: dedupe(intermediateSource.filter((x) => x.origin === 'AFTERMARKET').map((x) => x.ref))
  };

  const groups = new Map();
  for (const item of intermediateSource) {
    const code = normCode(item.ref);
    if (!groups.has(code)) groups.set(code, []);
    groups.get(code).push(item);
  }
  const oem = [], competitor = [];
  for (const items of groups.values()) {
    const known = new Set(items.map((x) => classifyReference(x.ref)).filter((x) => x !== 'UNKNOWN'));
    if (known.size === 1) {
      const target = [...known][0];
      for (const item of items) (target === 'OEM' ? oem : competitor).push(item.ref);
    } else {
      for (const item of items) (item.origin === 'OEM' ? oem : competitor).push(item.ref);
    }
  }
  return { quarantine, intermediate, final: { oem_codes: dedupe(oem), competitor_codes: dedupe(competitor) } };
}
(async () => {
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  const db = await pool.connect();
  const report = { mode: APPLY ? 'apply' : 'dry-run', skus: SKUS.length, pass: 0, updated: 0, quarantined: 0, blocked: [] };

  try {
    await db.query('BEGIN');
    await db.query(`
      CREATE TABLE IF NOT EXISTS catalog_reference_identity_quarantine (
        quarantine_key text PRIMARY KEY,
        sku text NOT NULL,
        normalized_reference text NOT NULL,
        manufacturer text,
        reference_code text,
        classification text,
        original_column text NOT NULL,
        reason text NOT NULL,
        raw_reference jsonb NOT NULL,
        quarantined_at timestamptz NOT NULL DEFAULT now(),
        status text NOT NULL DEFAULT 'EVIDENCE_REQUIRED'
      )
    `);
    for (const sku of SKUS) {
      const q = await db.query('SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (q.rowCount !== 1) { report.blocked.push({ sku, reason: 'SKU_NOT_UNIQUE_OR_MISSING' }); continue; }
      const row = q.rows[0];
      const built = build(row);
      if (!built.quarantine.length) { report.blocked.push({ sku, reason: 'NO_QUARANTINE_CANDIDATE' }); continue; }

      const evidence = {
        authority: 'ELIMFILTERS_REFERENCE_GOVERNANCE_V1',
        source_url: 'internal://catalog-reference-classification-conflicts/2026-09-27',
        evidence_hash: sha(built.quarantine),
        reason: 'Mixed OEM/aftermarket identity or malformed legacy reference quarantined from public alternate arrays.'
      };
      try {
        assertGovernedCatalogPatch(row, built.intermediate, { referenceCorrection: true, correctionEvidence: evidence });
        const intermediateRow = { ...row, ...built.intermediate };
        assertCrossReferenceReclassification(intermediateRow, built.final);
      } catch (e) {
        report.blocked.push({ sku, reason: e.validation?.reasons || [e.message] });
        continue;
      }
      report.pass++;
      report.quarantined += built.quarantine.length;
      if (APPLY) {
        for (const item of built.quarantine) {
          const manufacturer = item.ref?.manufacturer || item.ref?.brand || null;
          const code = item.ref?.code || item.ref?.reference || null;
          const classification = classifyReference(item.ref);
          const qkey = sha([sku, item.normalized_reference, manufacturer, code, item.origin, item.ref]);
          await db.query(`
            INSERT INTO catalog_reference_identity_quarantine
              (quarantine_key,sku,normalized_reference,manufacturer,reference_code,classification,original_column,reason,raw_reference)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
            ON CONFLICT (quarantine_key) DO NOTHING
          `, [qkey, sku, item.normalized_reference, manufacturer, code, classification, item.origin,
              'IDENTITY_CLASSIFICATION_CONFLICT_OR_MALFORMED_REFERENCE', JSON.stringify(item.ref)]);
        }
        await db.query(
          'UPDATE elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb WHERE id=$3',
          [JSON.stringify(built.final.oem_codes), JSON.stringify(built.final.competitor_codes), row.id]
        );
        report.updated++;
      }
    }
    if (report.blocked.length) throw new Error('FINAL_QUARANTINE_BLOCKED:' + report.blocked.length);
    if (APPLY) await db.query('COMMIT'); else await db.query('ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    fs.writeFileSync(
      'C:/Users/ELIMSERVER/world-catalogue-pg-gap/scripts/candidates/cross_reference_final_quarantine_report_20260927.json',
      JSON.stringify(report, null, 2) + '\n'
    );
    console.log(JSON.stringify(report, null, 2));
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
