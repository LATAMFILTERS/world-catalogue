'use strict';

/**
 * Complete ET96380 Part Search presentation:
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
const SKU = 'ET96380';
const SOURCE_URL = 'https://github.com/LATAMFILTERS/world-catalogue/blob/main/scripts/candidates/et96380_turbocore_assembly.json';


const PERKINS_URL = 'https://shop.perkins.com/product/perkins-130306380-fuel-filter-assembly?tabs-f11a=tab2';
const ENGINES = '102.05;103.06;103.07;103.09;103.1;103.11;103.13;103.15;104.19;104.22;1103A-33;1103A-33T;1103C-33;1103C-33T;1103D-33;1103D-33T;1104A-44;1104A-44T;1104C-44;1104C-44T;1104C-44TA;1104D-44T;402C-05;402D-05;402F-05;403A-11;403A-15;403C-07;403C-11;403C-15;403D-07;403D-11;403D-15;403D-15T;403F-11;403F-15;403F-15T;404A-22;404C-15;404C-22;404C-22T;404D-15;404D-22;404D-22T;404D-22TA;404F-22;404F-22T;403F-E17T;404F-E22T;404F-E22TA;403J-07;403J-11;403J-17;403J-17T;404J-22;404J-E22T;404J-E22TA;403J-E17T;403J-11T;403EA-11;403EA-17;404EA-22;404EA-22T'.split(';');
// Operator-supplied equipment (brand level, no models published): Perkins 400 Series powered machinery.
const BRANDS = [
  ['FG WILSON', 'GENERATOR SET', 'COMPACT GENERATOR SETS'],
  ['GENERAC / TOWERLIGHT', 'LIGHT TOWER', 'DIESEL AND HYBRID LIGHT TOWERS VT SERIES'],
  ['SDMO', 'GENERATOR SET', 'INDUSTRIAL AND MARINE GENERATOR SETS'],
  ['HIMOINSA', 'GENERATOR SET', 'INDUSTRIAL AND MARINE GENERATOR SETS'],
  ['CAROD', 'GENERATOR SET', 'INDUSTRIAL AND MARINE GENERATOR SETS'],
  ['LEXIGEN', 'GENERATOR SET', 'INDUSTRIAL AND MARINE GENERATOR SETS'],
  ['AURORA', 'GENERATOR SET', 'INDUSTRIAL AND MARINE GENERATOR SETS'],
  ['CATERPILLAR', 'MINI SKID STEER', 'MINI SKID STEERS, COMPACTORS AND MINI EXCAVATORS WITH PERKINS DIESEL'],
  ['JCB', 'MINI SKID STEER', 'MINI SKID STEERS, COMPACTORS AND MINI EXCAVATORS WITH PERKINS DIESEL'],
  ['BOBCAT', 'MINI SKID STEER', 'MINI SKID STEERS, COMPACTORS AND MINI EXCAVATORS WITH PERKINS DIESEL'],
  ['RABAUD', 'CHIPPER / CRUSHER', 'CRUSHERS AND WOOD CHIPPERS WITH PERKINS DIESEL'],
  ['SAELEN', 'CHIPPER / CRUSHER', 'CRUSHERS AND WOOD CHIPPERS WITH PERKINS DIESEL'],
  ['LASKI', 'CHIPPER / CRUSHER', 'CRUSHERS AND WOOD CHIPPERS WITH PERKINS DIESEL'],
  ['BUGNOT THIERION', 'CHIPPER / CRUSHER', 'CRUSHERS AND WOOD CHIPPERS WITH PERKINS DIESEL'],
];
const EQUIPMENT = [
  ...ENGINES.map((m) => ({ make: 'PERKINS', model: m, equipment: 'PERKINS ' + m, type: 'DIESEL ENGINE', engine: 'PERKINS ' + m, filter_position: 'PRE-FILTER / WATER SEPARATOR' })),
  ...BRANDS.map(([make, type, desc]) => ({ make, equipment: make + ' ' + desc, type, engine: 'PERKINS 400 SERIES', filter_position: 'PRE-FILTER / WATER SEPARATOR' })),
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
    if (current.rowCount !== 1) throw new Error('ET96380_NOT_FOUND');
    const row = current.rows[0];
    if (row.catalog_active !== true) throw new Error('ET96380_NOT_ACTIVE');
    if (row.codigo_base !== SKU) throw new Error('ET96380_BASE_DRIFT');
    if (String(row.canonical_source_brand || '').toUpperCase() !== 'ELIMFILTERS') throw new Error('ET96380_CANONICAL_BRAND_DRIFT');
    if (String(row.canonical_source_code || '').toUpperCase() !== SKU) throw new Error('ET96380_CANONICAL_CODE_DRIFT');

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
      corroborating_fitment_url: PERKINS_URL
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
          corroborating_fitment_source: 'PERKINS_OFFICIAL_SHOP_PAGE_ENGINES_ONLY',
          corroborating_fitment_url: PERKINS_URL,
          operator_decision_date: '2026-11-08'
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

    if (report.postcheck.equipment_count !== EQUIPMENT.length) throw new Error('ET96380_EQUIPMENT_COUNT_INVALID');
    if (report.postcheck.vehicle_count !== 0) throw new Error('ET96380_HD_VEHICLE_APPLICATIONS_PRESENT');
    if (!report.postcheck.equipment_verified || !report.postcheck.engine_verified) {
      throw new Error('ET96380_APPLICATION_EVIDENCE_NOT_PRESENT');
    }

    await db.query(
      "UPDATE public.catalog_sku_certification " +
      "SET application_domain_consistent=true, " +
      "evidence=coalesce(evidence,'{}'::jsonb) || $2::jsonb, audited_at=now() " +
      "WHERE sku=$1",
      [SKU, JSON.stringify({
        equipment_application_count: EQUIPMENT.length,
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
