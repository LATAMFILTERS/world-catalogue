'use strict';

/**
 * Etapa 2 controlled sample: applies the plant-confirmed units_per_case for
 * three codigo_base values. Only touches units_per_case + provenance fields
 * (packaging_source, packaging_validation_status, packaging_validated_at,
 * packaging_notes). Never sets weight, dimensions, or volume — those remain
 * NULL until independently confirmed, so logistics_data_complete stays
 * false for these SKUs, which is the correct, expected outcome here.
 */

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '099_CONFIRMED_UNITS_PER_CASE_SAMPLE';

const CONFIRMED = Object.freeze({
  P552100: 6,
  P554004: 12,
  P502042: 12,
});

async function applyConfirmedUnitsPerCaseSample() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, updates: [] };

  try {
    await client.query('BEGIN');

    for (const [codigoBase, unitsPerCase] of Object.entries(CONFIRMED)) {
      const { rows } = await client.query(
        `UPDATE elimfilters_catalog
         SET units_per_case = $1,
             packaging_source = 'PLANT_CONFIRMED',
             packaging_validation_status = 'PARTIAL_UNITS_PER_CASE_ONLY',
             packaging_validated_at = now(),
             packaging_notes = 'units_per_case confirmed by plant. Weight/dimensions/volume pending separate confirmation.'
         WHERE codigo_base = $2
         RETURNING sku, units_per_case, logistics_data_complete`,
        [unitsPerCase, codigoBase]
      );
      report.updates.push({ codigo_base: codigoBase, confirmed_units_per_case: unitsPerCase, rows: rows });
    }

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
  applyConfirmedUnitsPerCaseSample()
    .then((r) => console.log('[confirmed-units-per-case-sample]', JSON.stringify(r)))
    .catch((error) => {
      console.error('[confirmed-units-per-case-sample] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyConfirmedUnitsPerCaseSample };
