'use strict';
const fs = require('fs');
const { Pool } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--apply');
const MANIFEST = 'C:/Users/ELIMSERVER/world-catalogue-pg-gap/scripts/candidates/fuel_global_ld_remaining_auto_verify_20260927.json';

(async () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  const db = await pool.connect();
  const report = { mode: APPLY ? 'apply' : 'dry-run', manifest: manifest.length, pass: 0, updated: 0, blocked: [] };
  try {
    await db.query('BEGIN');
    for (const item of manifest) {
      const q = await db.query('SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE', [item.sku]);
      if (q.rowCount !== 1) { report.blocked.push({ sku: item.sku, reason: 'SKU_NOT_UNIQUE_OR_MISSING' }); continue; }
      const row = q.rows[0];
      const gov = row.enrichment_data?.codigo_base_governance || {};
      const brand = gov.approved_manufacturer || row.canonical_source_brand;
      const code = gov.approved_codigo_base || gov.approved_code || row.codigo_base;
      const evidence = {
        authority: gov.evidence_authority || gov.required_authority || 'EXISTING_LD_GOVERNANCE',
        governance_state: gov.state || gov.governance_state || null,
        origin_group: gov.origin_group || null,
        evidence_note: gov.evidence_note || gov.promoted_reason || null,
        primary_manufacturer_verified: gov.primary_manufacturer_verified === true,
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
      catch (e) { report.blocked.push({ sku: item.sku, reason: e.validation?.reasons || [e.message] }); continue; }
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
    if (report.blocked.length) throw new Error('LD_READY_BLOCKED:' + report.blocked.length);
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
