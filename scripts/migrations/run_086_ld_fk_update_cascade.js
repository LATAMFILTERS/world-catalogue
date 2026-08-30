'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '086_LD_FK_UPDATE_CASCADE';

const CHILDREN = [
  ['ld_competitor_cross_references', 'ld_competitor_cross_references_elimfilters_sku_fkey'],
  ['ld_oem_cross_references', 'ld_oem_cross_references_elimfilters_sku_fkey'],
  ['ld_production_readiness', 'ld_production_readiness_elimfilters_sku_fkey'],
  ['ld_product_specifications', 'ld_product_specifications_elimfilters_sku_fkey'],
  ['ld_vehicle_applications', 'ld_vehicle_applications_elimfilters_sku_fkey'],
];

async function applyLdFkUpdateCascade() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, constraints_updated: 0, constraints: [] };

  try {
    await client.query('BEGIN');

    for (const [table, constraint] of CHILDREN) {
      const existing = await client.query(`
        SELECT pg_get_constraintdef(oid) AS def
        FROM pg_constraint
        WHERE conrelid = $1::regclass AND conname = $2
      `, [`ld_catalog.${table}`, constraint]);

      if (existing.rowCount !== 1) {
        throw new Error(`LD_FK_CONSTRAINT_NOT_FOUND:${constraint}`);
      }

      const def = existing.rows[0].def || '';
      if (!/ON UPDATE CASCADE/i.test(def)) {
        await client.query(`ALTER TABLE ld_catalog.${table} DROP CONSTRAINT ${constraint}`);
        await client.query(`
          ALTER TABLE ld_catalog.${table}
          ADD CONSTRAINT ${constraint}
          FOREIGN KEY (elimfilters_sku)
          REFERENCES ld_catalog.ld_product_catalog(elimfilters_sku)
          ON UPDATE CASCADE
          ON DELETE CASCADE
        `);
        report.constraints_updated += 1;
      }

      const verified = await client.query(`
        SELECT pg_get_constraintdef(oid) AS def
        FROM pg_constraint
        WHERE conrelid = $1::regclass AND conname = $2
      `, [`ld_catalog.${table}`, constraint]);

      if (verified.rowCount !== 1 || !/ON UPDATE CASCADE/i.test(verified.rows[0].def || '')) {
        throw new Error(`LD_FK_UPDATE_CASCADE_NOT_VERIFIED:${constraint}`);
      }

      report.constraints.push({ table: `ld_catalog.${table}`, constraint, def: verified.rows[0].def });
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
  applyLdFkUpdateCascade()
    .then(report => console.log('[ld-fk-update-cascade]', JSON.stringify(report)))
    .catch(error => {
      console.error('[ld-fk-update-cascade] failed', JSON.stringify(error.migrationReport || { error: error.message }));
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyLdFkUpdateCascade };
