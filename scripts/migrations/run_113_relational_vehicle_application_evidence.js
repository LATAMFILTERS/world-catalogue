'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '113_RELATIONAL_VEHICLE_APPLICATION_EVIDENCE';

function sslFor(connectionString) {
  return /(?:localhost|127\.0\.0\.1)/i.test(String(connectionString || ''))
    ? false
    : { rejectUnauthorized: false };
}

async function applyRelationalVehicleApplicationEvidenceMigration() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: sslFor(databaseUrl), max: 1 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE ld_catalog.ld_vehicle_applications
        ADD COLUMN IF NOT EXISTS evidence_authority VARCHAR(160),
        ADD COLUMN IF NOT EXISTS evidence_source_hash VARCHAR(128),
        ADD COLUMN IF NOT EXISTS evidence_payload_hash VARCHAR(128)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ld_vehicle_verified_resolution
        ON ld_catalog.ld_vehicle_applications
        (evidence_status, canonical_make, canonical_model, year_from, year_to, engine_displacement)
    `);
    await client.query('COMMIT');
    return { migration: MIGRATION, applied: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyRelationalVehicleApplicationEvidenceMigration()
    .then(report => console.log('[relational-vehicle-application-evidence]', JSON.stringify(report)))
    .catch(error => {
      console.error('[relational-vehicle-application-evidence] failed', error);
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyRelationalVehicleApplicationEvidenceMigration };
