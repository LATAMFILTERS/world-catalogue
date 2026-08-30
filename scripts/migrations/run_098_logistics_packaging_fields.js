'use strict';

/**
 * Adds the 16 logistics/packaging fields to elimfilters_catalog for the
 * logistics enrichment project. Purely additive: every new column is
 * nullable with no default, so no existing row is silently marked as
 * having units_per_case=1, 0kg weight, or 0 volume.
 *
 * Governance rules encoded here:
 * - units_per_case: NULL, 1 (individually-packaged: air filters, HS housings),
 *   or a multiple of 6 (6/12/18/24/30/36) for shrink-wrapped HD master cartons.
 *   Never defaulted — must come from a confirmed source.
 * - packaging_source: constrained to the 5-tier evidence priority defined by
 *   the project (plant confirmation > manufacturer docs > official page
 *   scrape > derived calculation > manual review).
 * - logistics_data_complete: generated column, true only when all 16 fields
 *   are populated. This is the single source of truth the API/portal must
 *   use to decide whether a SKU is eligible for requisitions — a SKU is
 *   never marked complete based on partial or provisional data.
 *
 * Idempotent: safe to run multiple times (IF NOT EXISTS everywhere).
 */

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '098_LOGISTICS_PACKAGING_FIELDS';

async function scalar(client, sql) {
  const result = await client.query(sql);
  return Number(result.rows[0]?.n || 0);
}

async function applyLogisticsPackagingFields() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, before: {}, after: {} };

  try {
    await client.query('BEGIN');

    report.before.total_skus = await scalar(client, 'SELECT COUNT(*) n FROM elimfilters_catalog');

    await client.query(`
      ALTER TABLE elimfilters_catalog
        ADD COLUMN IF NOT EXISTS units_per_case integer,
        ADD COLUMN IF NOT EXISTS unit_net_weight_kg numeric(10,4),
        ADD COLUMN IF NOT EXISTS unit_packaged_weight_kg numeric(10,4),
        ADD COLUMN IF NOT EXISTS unit_packaged_volume_m3 numeric(12,6),
        ADD COLUMN IF NOT EXISTS master_carton_length_cm numeric(8,2),
        ADD COLUMN IF NOT EXISTS master_carton_width_cm numeric(8,2),
        ADD COLUMN IF NOT EXISTS master_carton_height_cm numeric(8,2),
        ADD COLUMN IF NOT EXISTS master_carton_net_weight_kg numeric(10,4),
        ADD COLUMN IF NOT EXISTS master_carton_gross_weight_kg numeric(10,4),
        ADD COLUMN IF NOT EXISTS master_carton_volume_m3 numeric(12,6),
        ADD COLUMN IF NOT EXISTS packaging_type text,
        ADD COLUMN IF NOT EXISTS packaging_source text,
        ADD COLUMN IF NOT EXISTS packaging_source_url text,
        ADD COLUMN IF NOT EXISTS packaging_validation_status text,
        ADD COLUMN IF NOT EXISTS packaging_validated_at timestamptz,
        ADD COLUMN IF NOT EXISTS packaging_notes text
    `);

    // Never silently defaulted: NULL, exactly 1 (individually packaged), or
    // a multiple of 6 up to 36 (shrink-wrapped HD master carton sizes).
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE elimfilters_catalog
          ADD CONSTRAINT chk_units_per_case_governed
          CHECK (units_per_case IS NULL OR units_per_case = 1 OR (units_per_case IN (6,12,18,24,30,36)));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        ALTER TABLE elimfilters_catalog
          ADD CONSTRAINT chk_packaging_source_governed
          CHECK (packaging_source IS NULL OR packaging_source IN (
            'PLANT_CONFIRMED',
            'MANUFACTURER_DOCUMENTATION',
            'OFFICIAL_SOURCE_SCRAPE',
            'DERIVED_CALCULATION',
            'MANUAL_REVIEW'
          ));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Positive-value guards: never allow a silent 0 to pass as real data.
    for (const col of [
      'unit_net_weight_kg', 'unit_packaged_weight_kg', 'unit_packaged_volume_m3',
      'master_carton_length_cm', 'master_carton_width_cm', 'master_carton_height_cm',
      'master_carton_net_weight_kg', 'master_carton_gross_weight_kg', 'master_carton_volume_m3',
    ]) {
      await client.query(`
        DO $$ BEGIN
          ALTER TABLE elimfilters_catalog
            ADD CONSTRAINT chk_${col}_positive
            CHECK (${col} IS NULL OR ${col} > 0);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `);
    }

    // Single source of truth for requisition eligibility: true only when
    // every one of the 16 logistics fields is populated. No SKU is ever
    // "complete" based on provisional or default values because there is
    // no default to fall back on.
    await client.query(`
      ALTER TABLE elimfilters_catalog
        DROP COLUMN IF EXISTS logistics_data_complete
    `);
    await client.query(`
      ALTER TABLE elimfilters_catalog
        ADD COLUMN logistics_data_complete boolean GENERATED ALWAYS AS (
          units_per_case IS NOT NULL
          AND unit_net_weight_kg IS NOT NULL
          AND unit_packaged_weight_kg IS NOT NULL
          AND unit_packaged_volume_m3 IS NOT NULL
          AND master_carton_length_cm IS NOT NULL
          AND master_carton_width_cm IS NOT NULL
          AND master_carton_height_cm IS NOT NULL
          AND master_carton_net_weight_kg IS NOT NULL
          AND master_carton_gross_weight_kg IS NOT NULL
          AND master_carton_volume_m3 IS NOT NULL
          AND packaging_type IS NOT NULL
          AND packaging_source IS NOT NULL
          AND packaging_source_url IS NOT NULL
          AND packaging_validation_status IS NOT NULL
          AND packaging_validated_at IS NOT NULL
          AND packaging_notes IS NOT NULL
        ) STORED
    `);

    report.after.total_skus = await scalar(client, 'SELECT COUNT(*) n FROM elimfilters_catalog');
    report.after.logistics_complete = await scalar(client,
      'SELECT COUNT(*) n FROM elimfilters_catalog WHERE logistics_data_complete = true');
    report.after.logistics_incomplete = report.after.total_skus - report.after.logistics_complete;

    await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw Object.assign(error, { migrationReport: report });
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyLogisticsPackagingFields()
    .then((r) => console.log('[logistics-packaging-fields]', JSON.stringify(r)))
    .catch((error) => {
      console.error('[logistics-packaging-fields] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyLogisticsPackagingFields };
