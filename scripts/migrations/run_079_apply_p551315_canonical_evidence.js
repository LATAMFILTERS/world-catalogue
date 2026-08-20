'use strict';

/**
 * Controlled canonical correction for EF91315.
 *
 * Official evidence reviewed on 2026-08-20:
 * https://shop.donaldson.com/store/en-us/product/P551315/20732
 *
 * The official page identifies P551315 as a Donaldson fuel filter, spin-on,
 * with 76.58 mm outer diameter. Production already contains the matching
 * EF91315 physical row but its historical codigo_base is ST1315.
 *
 * This migration changes only codigo_base, donaldson_url and governance
 * evidence. Alternate codes and every application payload are protected by
 * before/after hashes and are never rewritten.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');
const { normalizeCode } = require('../../lib/donaldson-official-evidence');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const VERIFIED_AT = '2026-08-20T04:45:00.000Z';
const OFFICIAL_URL = 'https://shop.donaldson.com/store/en-us/product/P551315/20732';
const ITEM = Object.freeze({
  sku: 'EF91315',
  previousCodigoBase: 'ST1315',
  codigoBase: 'P551315',
  duty: 'HEAVY_DUTY',
  filterType: 'fuel',
  outerDiameterMm: '76.58',
  threadSize: '7/8-14 UN',
});

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex');
}

function protectedSnapshot(row) {
  return {
    sku: row.sku,
    duty: row.duty,
    oem_codes: stableHash(row.oem_codes),
    competitor_codes: stableHash(row.competitor_codes),
    alternative_products: stableHash(row.alternative_products),
    alternatives: stableHash(row.alternatives),
    equipment_applications: stableHash(row.equipment_applications),
    vehicle_applications: stableHash(row.vehicle_applications),
  };
}

function evidenceRecord() {
  const record = {
    sku: ITEM.sku,
    previous_codigo_base: ITEM.previousCodigoBase,
    codigo_base: ITEM.codigoBase,
    normalized_reference: normalizeCode(ITEM.codigoBase),
    authority: 'DONALDSON',
    manufacturer: 'DONALDSON',
    source_url: OFFICIAL_URL,
    evidence_kind: 'OFFICIAL_PRODUCT_PAGE',
    verification_method: 'EXACT_OFFICIAL_DONALDSON_PRODUCT_PAGE_REVIEW',
    verified_at: VERIFIED_AT,
  };
  return { record, hash: stableHash(record) };
}

function countExactReference(items, reference) {
  const expected = normalizeCode(reference);
  return (Array.isArray(items) ? items : []).filter(item =>
    normalizeCode(item?.code || item?.reference) === expected
  ).length;
}

async function applyP551315CanonicalEvidence() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  const report = {
    migration: '079_APPLY_P551315_CANONICAL_EVIDENCE',
    selected: 1,
    updated: 0,
    already_applied: 0,
    skipped: 0,
    codigo_base_mutations: 0,
    alternate_column_mutations: 0,
    application_mutations: 0,
    absence_inferred: 0,
    audit_before: null,
    audit_after: null,
    details: [],
  };

  try {
    await client.query('BEGIN');
    const current = await client.query(`
      SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE
    `, [ITEM.sku]);
    if (current.rowCount !== 1) throw new Error('SKU_NOT_UNIQUE_OR_MISSING');

    const row = current.rows[0];
    report.audit_before = {
      codigo_base: row.codigo_base,
      governance_state: row.enrichment_data?.codigo_base_governance?.state || null,
      protected: protectedSnapshot(row),
    };

    const currentBase = normalizeCode(row.codigo_base);
    const targetBase = normalizeCode(ITEM.codigoBase);
    const currentGovernance = row.enrichment_data?.codigo_base_governance || {};
    if (currentBase === targetBase
        && currentGovernance.state === 'CANONICAL_VERIFIED'
        && normalizeCode(currentGovernance.approved_codigo_base) === targetBase) {
      report.already_applied = 1;
      report.audit_after = report.audit_before;
      report.details.push({ sku: ITEM.sku, status: 'ALREADY_APPLIED' });
      await client.query('COMMIT');
      return report;
    }

    if (row.duty !== ITEM.duty
        || String(row.filter_type || '').toLowerCase() !== ITEM.filterType
        || currentBase !== normalizeCode(ITEM.previousCodigoBase)
        || String(row.outer_diameter_mm) !== ITEM.outerDiameterMm
        || normalizeCode(row.thread_size) !== normalizeCode(ITEM.threadSize)) {
      throw new Error('DB_EXPECTATION_MISMATCH');
    }
    if (countExactReference(row.oem_codes, ITEM.codigoBase) !== 0
        || countExactReference(row.competitor_codes, ITEM.codigoBase) !== 0) {
      throw new Error('CODIGO_BASE_DUPLICATED_IN_ALTERNATES');
    }

    const { record, hash } = evidenceRecord();
    const governance = {
      ...currentGovernance,
      policy_version: '2026-08-19-v3.1',
      state: 'CANONICAL_VERIFIED',
      required_authority: 'VERIFIED_DONALDSON',
      primary_manufacturer_verified: true,
      approved_manufacturer: 'DONALDSON',
      approved_codigo_base: ITEM.codigoBase,
      current_codigo_base: ITEM.codigoBase,
      evidence_authority: 'OFFICIAL_DONALDSON_SHOP',
      evidence_kind: 'OFFICIAL_PRODUCT_PAGE',
      evidence_url: OFFICIAL_URL,
      evidence_hash: hash,
      evidence_hash_kind: 'CANONICAL_EVIDENCE_RECORD_SHA256',
      verification_method: record.verification_method,
      verified_at: VERIFIED_AT,
    };
    delete governance.donaldson_absence_verified;

    const enrichmentData = {
      ...(row.enrichment_data || {}),
      codigo_base_governance: governance,
    };
    assertCanonicalWrite({
      ...row,
      codigo_base: ITEM.codigoBase,
      donaldson_url: OFFICIAL_URL,
      enrichment_data: enrichmentData,
    });

    await client.query(`
      INSERT INTO catalog_codigo_base_evidence (
        sku,evidence_kind,authority,manufacturer,reference_code,
        normalized_reference,source_url,evidence_hash,verified_at,metadata
      ) VALUES ($1,'OFFICIAL_PRODUCT_PAGE','DONALDSON','DONALDSON',$2,$3,$4,$5,$6,$7::jsonb)
      ON CONFLICT DO NOTHING
    `, [ITEM.sku, ITEM.codigoBase, targetBase, OFFICIAL_URL, hash, VERIFIED_AT,
      JSON.stringify({ controlled_migration: '079', canonical_evidence_record: record,
        evidence_hash_kind: 'CANONICAL_EVIDENCE_RECORD_SHA256' })]);

    const updated = await client.query(`
      UPDATE elimfilters_catalog
      SET codigo_base=$1, donaldson_url=$2, enrichment_data=$3::jsonb
      WHERE sku=$4
        AND duty=$5
        AND upper(regexp_replace(codigo_base,'[^A-Z0-9]','','g'))=$6
      RETURNING *
    `, [ITEM.codigoBase, OFFICIAL_URL, JSON.stringify(enrichmentData), ITEM.sku,
      ITEM.duty, normalizeCode(ITEM.previousCodigoBase)]);
    if (updated.rowCount !== 1) throw new Error('CATALOG_ROW_CHANGED_DURING_APPLY');

    const after = updated.rows[0];
    report.audit_after = {
      codigo_base: after.codigo_base,
      governance_state: after.enrichment_data?.codigo_base_governance?.state || null,
      protected: protectedSnapshot(after),
    };
    if (JSON.stringify(report.audit_before.protected) !== JSON.stringify(report.audit_after.protected)) {
      throw new Error('PROTECTED_PAYLOAD_CHANGED');
    }
    if (countExactReference(after.oem_codes, ITEM.codigoBase) !== 0
        || countExactReference(after.competitor_codes, ITEM.codigoBase) !== 0) {
      throw new Error('CODIGO_BASE_DUPLICATED_IN_ALTERNATES_AFTER_APPLY');
    }

    await client.query(`
      UPDATE catalog_codigo_base_sanitation_queue
      SET current_codigo_base=$1, governance_state='CANONICAL_VERIFIED',
          required_authority='VERIFIED_DONALDSON', status='RESOLVED',
          last_error=NULL, updated_at=now()
      WHERE sku=$2
    `, [ITEM.codigoBase, ITEM.sku]);

    await client.query('COMMIT');
    report.updated = 1;
    report.codigo_base_mutations = 1;
    report.details.push({ sku: ITEM.sku, status: 'UPDATED',
      previous_codigo_base: ITEM.previousCodigoBase, codigo_base: ITEM.codigoBase,
      source_url: OFFICIAL_URL });
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    report.skipped = 1;
    report.details.push({ sku: ITEM.sku, status: 'SKIPPED', reason: error.message });
    throw Object.assign(error, { migrationReport: report });
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyP551315CanonicalEvidence()
    .then(result => console.log('[p551315-canonical-evidence]', JSON.stringify(result)))
    .catch(error => {
      console.error('[p551315-canonical-evidence] failed',
        JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = {
  ITEM,
  OFFICIAL_URL,
  protectedSnapshot,
  evidenceRecord,
  countExactReference,
  applyP551315CanonicalEvidence,
};
