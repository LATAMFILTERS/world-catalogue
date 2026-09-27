'use strict';
const { Pool } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--apply');
const SKUS = ['EF98960','ET93223'];

(async () => {
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  const db = await pool.connect();
  const report = { mode: APPLY ? 'apply' : 'dry-run', pass: 0, updated: 0, blocked: [] };
  try {
    await db.query('BEGIN');
    for (const sku of SKUS) {
      const q = await db.query('SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (q.rowCount !== 1) { report.blocked.push({ sku, reason: 'SKU_NOT_UNIQUE_OR_MISSING' }); continue; }
      const row = q.rows[0];
      const gov = row.enrichment_data?.codigo_base_governance || {};
      const brand = gov.approved_manufacturer || row.canonical_source_brand;
      const code = gov.approved_codigo_base || gov.approved_code || row.codigo_base;
      const evidence = {
        authority: gov.evidence_authority || gov.verification_method || gov.required_authority || 'EXISTING_GOVERNANCE',
        governance_state: gov.state || null,
        verification_method: gov.verification_method || null,
        verification_note: gov.verification_note || null,
        donaldson_absence_verified: gov.donaldson_absence_verified === true,
        fallback_manufacturer_verified: gov.fallback_manufacturer_verified === true,
        fallback_commercial_code_verified: gov.fallback_commercial_code_verified === true,
        policy_version: gov.policy_version || null
      };
      const merged = {
        ...row,
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [],
        competitor_codes: Array.isArray(row.competitor_codes) ? row.competitor_codes : [],
        canonical_source_brand: brand,
        canonical_source_code: code,
        canonical_source_status: 'VERIFIED',
        canonical_verified_at: new Date().toISOString(),
        canonical_evidence: evidence
      };
      try { assertCanonicalWrite(merged, { skipApplicationValidation: true }); report.pass++; }
      catch (e) { report.blocked.push({ sku, reason: e.validation?.reasons || [e.message] }); continue; }
      if (APPLY) {
        await db.query(
          `UPDATE elimfilters_catalog
           SET canonical_source_brand=$1, canonical_source_code=$2, canonical_source_status='VERIFIED',
               canonical_verified_at=now(), canonical_evidence=$3::jsonb,
               oem_codes=coalesce(oem_codes,'[]'::jsonb), competitor_codes=coalesce(competitor_codes,'[]'::jsonb)
           WHERE id=$4`,
          [brand, code, JSON.stringify(evidence), row.id]
        );
        report.updated++;
      }
    }
    if (report.blocked.length) throw new Error('HD_READY_BLOCKED:' + report.blocked.length);
    if (APPLY) await db.query('COMMIT'); else await db.query('ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
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
