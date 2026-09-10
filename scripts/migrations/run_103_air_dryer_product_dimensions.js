'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '103_AIR_DRYER_PRODUCT_DIMENSIONS';

const AIR_DRYER_DIMENSIONS = [
  { codigo_base: 'P584764', sku: 'ED44764', product_length_mm: 163, product_length_in: 6.42 },
  { codigo_base: 'P951413', sku: 'ED41413', product_length_mm: 165, product_length_in: 6.50 },
  { codigo_base: 'P953571', sku: 'ED43571', product_length_mm: 165, product_length_in: 6.50 },
];

async function ensureSchema(client) {
  await client.query(`
    ALTER TABLE public.elimfilters_catalog
      ADD COLUMN IF NOT EXISTS product_length_mm numeric,
      ADD COLUMN IF NOT EXISTS product_length_in numeric,
      ADD COLUMN IF NOT EXISTS product_dimensions_source text,
      ADD COLUMN IF NOT EXISTS product_dimensions_validation_status text
  `);
}

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
    expected_rows: AIR_DRYER_DIMENSIONS.length,
    matched_rows: 0,
    updated_rows: 0,
    verified: [],
  };

  try {
    await client.query('BEGIN');
    await ensureSchema(client);

    for (const target of AIR_DRYER_DIMENSIONS) {
      const current = await client.query(`
        SELECT sku, codigo_base, duty, filter_type, technology,
               thread_size, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
               product_length_mm, product_length_in
        FROM public.elimfilters_catalog
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
      if (row.filter_type !== 'air_dryer') {
        throw new Error(`AIR_DRYER_FILTER_TYPE_MISMATCH ${target.sku}: ${row.filter_type}`);
      }
      if (row.technology !== 'DRYCORE™') {
        throw new Error(`AIR_DRYER_TECHNOLOGY_MISMATCH ${target.sku}: ${row.technology}`);
      }

      report.matched_rows++;
      report.verified.push({
        codigo_base: row.codigo_base,
        sku: row.sku,
        thread_size: row.thread_size,
        outer_diameter_mm: row.outer_diameter_mm,
        gasket_od_mm: row.gasket_od_mm,
        gasket_id_mm: row.gasket_id_mm,
        previous_product_length_mm: row.product_length_mm,
        previous_product_length_in: row.product_length_in,
        new_product_length_mm: target.product_length_mm,
        new_product_length_in: target.product_length_in,
      });

      if (!dryRun) {
        const updated = await client.query(`
          UPDATE public.elimfilters_catalog
          SET product_length_mm = COALESCE(product_length_mm, $1),
              product_length_in = COALESCE(product_length_in, $2),
              product_dimensions_source = COALESCE(product_dimensions_source, 'OFFICIAL_DONALDSON_PRODUCT_PAGE'),
              product_dimensions_validation_status = CASE
                WHEN product_length_mm IS NULL OR product_length_in IS NULL
                  THEN 'FULL_PRODUCT_DIMENSIONS_OFFICIAL'
                ELSE COALESCE(product_dimensions_validation_status, 'FULL_PRODUCT_DIMENSIONS_OFFICIAL')
              END
          WHERE upper(trim(codigo_base)) = $3
            AND upper(trim(sku)) = $4
            AND duty = 'HEAVY_DUTY'
            AND filter_type = 'air_dryer'
            AND technology = 'DRYCORE™'
        `, [
          target.product_length_mm,
          target.product_length_in,
          target.codigo_base,
          target.sku,
        ]);
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

module.exports = { MIGRATION, AIR_DRYER_DIMENSIONS, apply };
