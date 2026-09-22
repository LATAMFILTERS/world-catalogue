'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '112_VEHICLE_APPLICATION_NORMALIZATION';

async function applyVehicleApplicationNormalization() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, columns_added: true, backfilled: 0 };

  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE ld_catalog.ld_vehicle_applications
        ADD COLUMN IF NOT EXISTS market_code VARCHAR(8),
        ADD COLUMN IF NOT EXISTS platform_code VARCHAR(80),
        ADD COLUMN IF NOT EXISTS canonical_make VARCHAR(100),
        ADD COLUMN IF NOT EXISTS canonical_model VARCHAR(100),
        ADD COLUMN IF NOT EXISTS model_variant VARCHAR(100),
        ADD COLUMN IF NOT EXISTS year_from SMALLINT,
        ADD COLUMN IF NOT EXISTS year_to SMALLINT,
        ADD COLUMN IF NOT EXISTS engine_displacement VARCHAR(50),
        ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(30),
        ADD COLUMN IF NOT EXISTS filter_position VARCHAR(50),
        ADD COLUMN IF NOT EXISTS evidence_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
        ADD COLUMN IF NOT EXISTS evidence_source_url TEXT,
        ADD COLUMN IF NOT EXISTS evidence_checked_at TIMESTAMPTZ
    `);

    const backfill = await client.query(`
      UPDATE ld_catalog.ld_vehicle_applications
      SET canonical_make = COALESCE(canonical_make, NULLIF(trim(make), '')),
          canonical_model = COALESCE(canonical_model, NULLIF(trim(model_family), '')),
          year_from = COALESCE(
            year_from,
            CASE WHEN trim(coalesce(year,'')) ~ '^(19|20)[0-9]{2}$' THEN trim(year)::smallint END
          ),
          year_to = COALESCE(
            year_to,
            CASE WHEN trim(coalesce(year,'')) ~ '^(19|20)[0-9]{2}$' THEN trim(year)::smallint END
          )
      WHERE canonical_make IS NULL
         OR canonical_model IS NULL
         OR year_from IS NULL
         OR year_to IS NULL
    `);
    report.backfilled = backfill.rowCount;

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ld_vehicle_canonical_make_model
        ON ld_catalog.ld_vehicle_applications (canonical_make, canonical_model)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ld_vehicle_year_range
        ON ld_catalog.ld_vehicle_applications (year_from, year_to)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ld_vehicle_engine_code_norm
        ON ld_catalog.ld_vehicle_applications
        (upper(regexp_replace(coalesce(engine_code,''), '[^A-Z0-9]', '', 'g')))
    `);

    await client.query('COMMIT');
    return report;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyVehicleApplicationNormalization()
    .then(report => console.log('[vehicle-application-normalization]', JSON.stringify(report)))
    .catch(error => {
      console.error('[vehicle-application-normalization] failed', error);
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyVehicleApplicationNormalization };
