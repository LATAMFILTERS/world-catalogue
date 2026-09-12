'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '107_DESCRIPTION_BRAND_SANITATION';

async function applyDescriptionBrandSanitation() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  const client = await pool.connect();
  const report = { migration: MIGRATION, updated: 0, remaining: [] };

  try {
    await client.query('BEGIN');

    const updated = await client.query(`
      UPDATE public.elimfilters_catalog
      SET description = regexp_replace(description, 'MANN[- ]?FILTER', 'ELIMFILTERS', 'gi')
      WHERE description ~* 'MANN[- ]?FILTER'
      RETURNING sku
    `);
    report.updated = updated.rowCount;

    const remaining = await client.query(`
      SELECT sku FROM public.elimfilters_catalog WHERE description ~* 'MANN[- ]?FILTER'
    `);
    report.remaining = remaining.rows.map(r => r.sku);
    if (report.remaining.length) {
      throw new Error(`DESCRIPTION_BRAND_SANITATION_INCOMPLETE ${JSON.stringify(report.remaining)}`);
    }

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
  applyDescriptionBrandSanitation()
    .then(report => console.log('[description-brand-sanitation]', JSON.stringify(report)))
    .catch(error => {
      console.error('[description-brand-sanitation] failed', error);
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyDescriptionBrandSanitation };
