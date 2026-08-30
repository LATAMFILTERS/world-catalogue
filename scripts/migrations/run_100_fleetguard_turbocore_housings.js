'use strict';

/**
 * Creates 10 new ELIMFILTERS SKUs for Fleetguard fuel/water separator
 * housings that Donaldson does not manufacture. Per the confirmed
 * brand-coverage-gap rule, when Donaldson has no equivalent, the next most
 * commercial brand's code becomes the base -- here Fleetguard, since these
 * housings are considered the same family as the existing RACOR-equivalent
 * ET9 TURBOCORE turbine series (confirmed by Victor Abreu, 2026-08-30).
 *
 * SKU = ET9 prefix + last 4 digits only of the Fleetguard code (no letter
 * suffixes), per the confirmed numbering rule.
 * codigo_base is the Fleetguard code itself (no Donaldson equivalent exists).
 * No packaging/logistics fields are set here -- this only creates catalog
 * identity records, per governance: never fabricate weight/dimensions.
 */

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '100_FLEETGUARD_TURBOCORE_HOUSINGS';

const NEW_HOUSINGS = Object.freeze([
  { sku: 'ET93029', codigo_base: 'FH23029' },
  { sku: 'ET93061', codigo_base: 'FH23061' },
  { sku: 'ET93600', codigo_base: 'FH23600' },
  { sku: 'ET93060', codigo_base: 'FH23060' },
  { sku: 'ET93616', codigo_base: 'FH23616M' },
  { sku: 'ET93815', codigo_base: 'FH23815VG' },
  { sku: 'ET93068', codigo_base: 'FH23068M' },
  { sku: 'ET91462', codigo_base: 'FH21462' },
  { sku: 'ET92168', codigo_base: 'FH22168' },
  { sku: 'ET97890', codigo_base: '3967890S' },
]);

async function applyFleetguardTurbocoreHousings() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, inserted: [], skipped: [], rejected: [] };

  try {
    // Each row gets its own transaction so one integrity-guard rejection
    // (e.g. a Fleetguard code already registered as an alternate on a
    // different SKU) doesn't block the rest of the batch.
    for (const { sku, codigo_base } of NEW_HOUSINGS) {
      const description = `ELIMFILTERS® ${sku} Turbine-series fuel/water separator housing. `
        + `TURBOCORE™ three-stage coalescing media removes water and fine particulate from diesel fuel `
        + `before it reaches the engine, protecting injectors from corrosion and abrasive wear. `
        + `Fleetguard-equivalent housing, same turbine family as the existing ET9 TURBOCORE / RACOR-equivalent series.`;

      const competitorCodes = JSON.stringify([{ manufacturer: 'FLEETGUARD', code: codigo_base }]);

      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          `INSERT INTO elimfilters_catalog
             (sku, codigo_base, filter_type, technology, duty, description, competitor_codes, installation_type, created_at)
           VALUES ($1, $2, 'fuel', 'TURBOCORE™', 'HEAVY_DUTY', $3, $4::jsonb, 'Replacement Cartridge Element', now())
           ON CONFLICT (sku) DO NOTHING
           RETURNING sku`,
          [sku, codigo_base, description, competitorCodes]
        );
        await client.query('COMMIT');

        if (rows.length) report.inserted.push(sku);
        else report.skipped.push({ sku, reason: 'ALREADY_EXISTS' });
      } catch (rowError) {
        await client.query('ROLLBACK');
        report.rejected.push({ sku, codigo_base, reason: rowError.message });
      }
    }

    return report;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyFleetguardTurbocoreHousings()
    .then((r) => console.log('[fleetguard-turbocore-housings]', JSON.stringify(r)))
    .catch((error) => {
      console.error('[fleetguard-turbocore-housings] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyFleetguardTurbocoreHousings };
