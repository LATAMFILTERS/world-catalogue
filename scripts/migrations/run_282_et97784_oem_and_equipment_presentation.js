'use strict';

/**
 * Complete ET97784 Part Search presentation:
 *  - governed Heavy Duty equipment applications for Toyota Hilux 2GD-FTV / 1GD-FTV
 *  - verified application evidence so the presentation guard may expose them
 *
 * The OEM display identity is handled by Part Search from the canonical ELIMFILTERS
 * identity; codigo_base is NOT duplicated into oem_codes.
 *
 * Dry-run by default. Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const SKU = 'ET97784';
const SOURCE_URL = 'https://github.com/LATAMFILTERS/world-catalogue/blob/main/scripts/candidates/et97784_turbocore_assembly.json';
const FITMENT_URL = 'https://directionplus.com.au/installation-guides/vehicle-fitment-guides/fuel-manager-pre-filter-fitment-guide/';

const EQUIPMENT = [
  {
    make: 'TOYOTA',
    model: 'HILUX',
    equipment: 'TOYOTA HILUX',
    type: 'PICKUP',
    engine: '2GD-FTV 2.4L COMMON RAIL',
    filter_position: 'UPSTREAM OF OE FUEL FILTER'
  },
  {
    make: 'TOYOTA',
    model: 'HILUX',
    equipment: 'TOYOTA HILUX',
    type: 'PICKUP',
    engine: '1GD-FTV 2.8L COMMON RAIL',
    filter_position: 'UPSTREAM OF OE FUEL FILTER'
  }
];

function sha(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function main() {
  const url =
    process.env.CATALOG_DATABASE_URL ||
    process.env.ELIMFILTERS_DATABASE_URL ||
    process.env.SEARCH_DB_URL ||
    process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');

  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();

  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '45s'");

    const current = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU]);
    if (current.rowCount !== 1) throw new Error('ET97784_NOT_FOUND');
    const row = current.rows[0];
    if (row.catalog_active !== true) throw new Error('ET97784_NOT_ACTIVE');
    if (row.codigo_base !== SKU) throw new Error('ET97784_BASE_DRIFT');
    if (String(row.canonical_source_brand || '').toUpperCase() !== 'ELIMFILTERS') throw new Error('ET97784_CANONICAL_BRAND_DRIFT');
    if (String(row.canonical_source_code || '').toUpperCase() !== SKU) throw new Error('ET97784_CANONICAL_CODE_DRIFT');

    const candidate = {
      ...row,
      equipment_applications: EQUIPMENT,
      vehicle_applications: [],
      oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [],
      competitor_codes: Array.isArray(row.competitor_codes) ? row.competitor_codes : []
    };
    report.gateway_before_application_evidence = assertCanonicalWrite(candidate, {
      validateApplications: true,
      applicationWrite: false
    });

    const evidenceHash = sha({
      sku: SKU,
      authority: 'ELIMFILTERS_INTERNAL_PRODUCT_DEFINITION',
      applications: EQUIPMENT,
      source_url: SOURCE_URL,
      corroborating_fitment_url: FITMENT_URL
    });

    report.application_write = await applyVerifiedApplications(db, {
      sku: SKU,
      equipment_applications: EQUIPMENT,
      vehicle_applications: [],
      evidence: {
        authority: 'ELIMFILTERS_INTERNAL_PRODUCT_DEFINITION',
        source_url: SOURCE_URL,
        evidence_hash: evidenceHash,
        metadata: {
          product_scope: 'COMPLETE_FUEL_WATER_SEPARATOR_ASSEMBLY',
          service_element_sku: 'ES91434',
          corroborating_fitment_source: 'DIRECTION_PLUS_FM628DPK_HILUX_FITMENT',
          corroborating_fitment_url: FITMENT_URL,
          operator_decision_date: '2026-10-14'
        }
      }
    });

    const after = (await db.query(
      'SELECT sku,equipment_applications,vehicle_applications,enrichment_data FROM public.elimfilters_catalog WHERE sku=$1',
      [SKU]
    )).rows[0];

    const verified = (await db.query(
      "SELECT " +
      "EXISTS (SELECT 1 FROM public.catalog_application_evidence e " +
      "WHERE e.sku=$1 AND e.application_kind='EQUIPMENT' AND e.verified=true " +
      "AND e.payload_hash=md5($2::jsonb::text) " +
      "AND nullif(btrim(e.source_url),'') IS NOT NULL " +
      "AND nullif(btrim(e.evidence_hash),'') IS NOT NULL) AS equipment_verified, " +
      "EXISTS (SELECT 1 FROM public.catalog_application_evidence e " +
      "WHERE e.sku=$1 AND e.application_kind='ENGINE' AND e.verified=true " +
      "AND e.payload_hash=md5($2::jsonb::text) " +
      "AND nullif(btrim(e.source_url),'') IS NOT NULL " +
      "AND nullif(btrim(e.evidence_hash),'') IS NOT NULL) AS engine_verified",
      [SKU, JSON.stringify(EQUIPMENT)]
    )).rows[0];

    report.postcheck = {
      equipment_count: Array.isArray(after.equipment_applications) ? after.equipment_applications.length : 0,
      vehicle_count: Array.isArray(after.vehicle_applications) ? after.vehicle_applications.length : 0,
      equipment_verified: verified.equipment_verified,
      engine_verified: verified.engine_verified,
      application_governance: after.enrichment_data && after.enrichment_data.application_governance
        ? after.enrichment_data.application_governance
        : null
    };

    if (report.postcheck.equipment_count !== 2) throw new Error('ET97784_EQUIPMENT_COUNT_INVALID');
    if (report.postcheck.vehicle_count !== 0) throw new Error('ET97784_HD_VEHICLE_APPLICATIONS_PRESENT');
    if (!report.postcheck.equipment_verified || !report.postcheck.engine_verified) {
      throw new Error('ET97784_APPLICATION_EVIDENCE_NOT_PRESENT');
    }

    await db.query(
      "UPDATE public.catalog_sku_certification " +
      "SET application_domain_consistent=true, " +
      "evidence=coalesce(evidence,'{}'::jsonb) || $2::jsonb, audited_at=now() " +
      "WHERE sku=$1",
      [SKU, JSON.stringify({
        equipment_application_count: 2,
        equipment_application_authority: 'ELIMFILTERS_INTERNAL_PRODUCT_DEFINITION',
        equipment_application_evidence_hash: evidenceHash
      })]
    );

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error);
    process.exit(1);
  });
}

module.exports = { SKU, EQUIPMENT, main };
