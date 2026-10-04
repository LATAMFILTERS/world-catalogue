'use strict';

require('dotenv').config();
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const TARGET_SKU = 'EH68944';
const TARGET_REFERENCE = 'HF28944';
const SUCCESSOR_SKU = 'EH65153';
const SUCCESSOR_REFERENCE = 'HF35153';
const REJECTED_DONALDSON = 'P560972';
const FLEETGUARD_SOURCE = 'https://www.fleetguard.com/product/HF28944';
const SUCCESSOR_SOURCE = 'https://www.fleetguard.com/product/HF35153';

function normalize(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function cleanBrandCrossrefs(value) {
  const refs = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
  for (const key of Object.keys(refs)) {
    const list = Array.isArray(refs[key]) ? refs[key] : [];
    const next = list.filter((code) => normalize(code) !== normalize(REJECTED_DONALDSON));
    if (next.length) refs[key] = next;
    else delete refs[key];
  }
  return refs;
}

async function main() {
  const connectionString = process.env.SEARCH_DB_URL || process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Missing SEARCH_DB_URL/CATALOG_DATABASE_URL/DATABASE_URL');

  const apply = process.argv.includes('--apply');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('BEGIN');

    const targetResult = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE',
      [TARGET_SKU]
    );
    const successorResult = await client.query(
      'SELECT sku,codigo_base,catalog_active,filter_type FROM elimfilters_catalog WHERE sku=$1',
      [SUCCESSOR_SKU]
    );

    if (targetResult.rowCount !== 1) throw new Error('TARGET_SKU_NOT_FOUND:' + TARGET_SKU);
    if (successorResult.rowCount !== 1) throw new Error('SUCCESSOR_SKU_NOT_FOUND:' + SUCCESSOR_SKU);

    const target = targetResult.rows[0];
    const successor = successorResult.rows[0];

    if (normalize(target.codigo_base) !== normalize(TARGET_REFERENCE)) {
      throw new Error('TARGET_BASE_MISMATCH:' + String(target.codigo_base || ''));
    }
    if (normalize(successor.codigo_base) !== normalize(SUCCESSOR_REFERENCE)) {
      throw new Error('SUCCESSOR_BASE_MISMATCH:' + String(successor.codigo_base || ''));
    }
    if (successor.catalog_active !== true) {
      throw new Error('SUCCESSOR_NOT_ACTIVE:' + SUCCESSOR_SKU);
    }

    const beforeCompetitors = Array.isArray(target.competitor_codes) ? target.competitor_codes : [];
    const cleanedCompetitors = beforeCompetitors.filter((entry) =>
      !(normalize(entry?.manufacturer) === 'DONALDSON' && normalize(entry?.code || entry?.reference) === normalize(REJECTED_DONALDSON))
    );

    if (cleanedCompetitors.length < beforeCompetitors.length) {
      assertGovernedCatalogPatch(
        target,
        { competitor_codes: cleanedCompetitors },
        { rejectionCleanup: true }
      );
    }

    assertGovernedCatalogPatch(target, { catalog_active: false }, { applicationWrite: false });

    const enrichment = { ...(target.enrichment_data || {}) };
    delete enrichment.equipment_inherited_from;
    delete enrichment.equipment_inheritance_date;
    delete enrichment.equipment_inheritance_shared_codes;

    enrichment.supersession_governance = {
      state: 'OFFICIAL_SUPERSESSION',
      predecessor_sku: TARGET_SKU,
      predecessor_reference: TARGET_REFERENCE,
      successor_sku: SUCCESSOR_SKU,
      successor_reference: SUCCESSOR_REFERENCE,
      authority: 'FLEETGUARD_ATMUS',
      predecessor_source_url: FLEETGUARD_SOURCE,
      successor_source_url: SUCCESSOR_SOURCE,
      application_inheritance_allowed: false,
      recorded_at: new Date().toISOString(),
    };
    enrichment.resolution_status = {
      state: 'INACTIVE_SUPERSEDED',
      reason: 'FLEETGUARD_OFFICIAL_REPLACEMENT',
      rejected_canonical_relation: REJECTED_DONALDSON,
      updated_at: new Date().toISOString(),
    };

    const brandCrossrefs = cleanBrandCrossrefs(target.brand_crossrefs);

    const report = {
      target_sku: TARGET_SKU,
      target_reference: TARGET_REFERENCE,
      successor_sku: SUCCESSOR_SKU,
      successor_reference: SUCCESSOR_REFERENCE,
      target_was_active: target.catalog_active === true,
      rejected_crossref_removed: cleanedCompetitors.length < beforeCompetitors.length,
      applications_preserved_for_history: {
        equipment: Array.isArray(target.equipment_applications) ? target.equipment_applications.length : 0,
        vehicle: Array.isArray(target.vehicle_applications) ? target.vehicle_applications.length : 0,
      },
      apply,
    };

    if (!apply) {
      await client.query('ROLLBACK');
      console.log(JSON.stringify({ dry_run: true, ...report }, null, 2));
      return;
    }

    await client.query(
      `UPDATE elimfilters_catalog
          SET catalog_active=false,
              competitor_codes=$2::jsonb,
              brand_crossrefs=$3::jsonb,
              enrichment_data=$4::jsonb
        WHERE sku=$1`,
      [TARGET_SKU, JSON.stringify(cleanedCompetitors), JSON.stringify(brandCrossrefs), JSON.stringify(enrichment)]
    );

    const quarantineExists = await client.query(
      "SELECT to_regclass('public.bad_crossref_quarantine') AS table_name"
    );
    if (quarantineExists.rows[0]?.table_name) {
      await client.query(
        `INSERT INTO bad_crossref_quarantine
          (query_code,source_sku,source_base,source_duty,source_filter_type,source_field,brand,reason)
         SELECT $1,$2,$3,$4,$5,'competitor_codes','DONALDSON','USER_REJECTED_RELATION__SUPERSEDED_SKU'
         WHERE NOT EXISTS (
           SELECT 1 FROM bad_crossref_quarantine
           WHERE query_code=$1 AND source_sku=$2 AND source_field='competitor_codes'
         )`,
        [REJECTED_DONALDSON, TARGET_SKU, target.codigo_base, target.duty, target.filter_type]
      );
    }

    const certificationExists = await client.query(
      "SELECT to_regclass('public.catalog_sku_certification') AS table_name"
    );
    if (certificationExists.rows[0]?.table_name) {
      await client.query('DELETE FROM catalog_sku_certification WHERE sku=$1', [TARGET_SKU]);
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({ applied: true, ...report }, null, 2));
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
