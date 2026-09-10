'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '102_AIR_DRYER_CLASSIFICATION';

const AIR_DRYER_MATRIX = [
  { codigo_base: 'P584764', sku: 'ED44764', technology: 'DRYCORE™', filter_type: 'air_dryer' },
  { codigo_base: 'P951413', sku: 'ED41413', technology: 'DRYCORE™', filter_type: 'air_dryer' },
  { codigo_base: 'P953571', sku: 'ED43571', technology: 'DRYCORE™', filter_type: 'air_dryer' },
];

async function apply() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const dryRun = !process.argv.includes('--apply');
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();

  const report = {
    migration: MIGRATION,
    dry_run: dryRun,
    expected_rows: AIR_DRYER_MATRIX.length,
    matched_rows: 0,
    updated_rows: 0,
    verified: [],
  };

  try {
    await client.query('BEGIN');

    for (const target of AIR_DRYER_MATRIX) {
      const current = await client.query(`
        SELECT codigo_base, sku, duty, filter_type, technology
        FROM elimfilters_catalog
        WHERE upper(trim(codigo_base)) = $1
          AND upper(trim(sku)) = $2
        FOR UPDATE
      `, [target.codigo_base, target.sku]);

      if (current.rowCount !== 1) {
        throw new Error(`AIR_DRYER_IDENTITY_MISMATCH ${target.codigo_base}/${target.sku}: rows=${current.rowCount}`);
      }

      const row = current.rows[0];
      if (row.duty !== 'HEAVY_DUTY') {
        throw new Error(`AIR_DRYER_DUTY_MISMATCH ${target.sku}: ${row.duty}`);
      }
      if (row.technology !== target.technology) {
        throw new Error(`AIR_DRYER_TECHNOLOGY_MISMATCH ${target.sku}: ${row.technology}`);
      }

      report.matched_rows++;
      report.verified.push({
        codigo_base: row.codigo_base,
        sku: row.sku,
        duty: row.duty,
        previous_filter_type: row.filter_type,
        new_filter_type: target.filter_type,
        technology: row.technology,
      });

      if (!dryRun && row.filter_type !== target.filter_type) {
        const updated = await client.query(`
          UPDATE elimfilters_catalog
          SET filter_type = $1
          WHERE upper(trim(codigo_base)) = $2
            AND upper(trim(sku)) = $3
            AND duty = 'HEAVY_DUTY'
            AND technology = $4
        `, [target.filter_type, target.codigo_base, target.sku, target.technology]);
        report.updated_rows += updated.rowCount;
      }
    }

    if (dryRun) await client.query('ROLLBACK');
    else await client.query('COMMIT');

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
  apply()
    .then((report) => console.log(JSON.stringify(report, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { MIGRATION, AIR_DRYER_MATRIX, apply };
