'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '100_RACOR_SEPARATOR_SEARCH_IDENTITY_REPAIR';

const SKU_MAP = [
  ['EF91851', 'ES91851'],
  ['EF91852', 'ES91852'],
  ['EF91853', 'ES91853'],
  ['EF91854', 'ES91854'],
  ['EF91855', 'ES91855'],
  ['EF91856', 'ES91856'],
  ['EF91857', 'ES91857'],
  ['EF91858', 'ES91858'],
  ['EF91859', 'ES91859'],
];

async function applyRacorSeparatorSearchIdentityRepair() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(`
      SELECT sku
      FROM public.elimfilters_catalog
      WHERE sku = ANY($1::text[])
    `, [SKU_MAP.map(([, newSku]) => newSku)]);

    const currentSkus = new Set(existing.rows.map((row) => row.sku));
    const activeMap = SKU_MAP.filter(([, newSku]) => currentSkus.has(newSku));

    let updatedCacheRows = 0;
    for (const [oldSku, newSku] of activeMap) {
      const result = await client.query(`
        UPDATE public.crossref_resolved_cache
        SET sku = $2
        WHERE sku = $1
          AND EXISTS (
            SELECT 1
            FROM public.elimfilters_catalog c
            WHERE c.sku = $2
          )
      `, [oldSku, newSku]);
      updatedCacheRows += result.rowCount;
    }

    const verification = await client.query(`
      SELECT code, sku, manufacturer
      FROM public.crossref_resolved_cache
      WHERE code = ANY($1::text[])
      ORDER BY code, sku
    `, [[
      'R60S','R60T','R60P',
      'R90S','R90T','R90P',
      'R120S','R120T','R120P'
    ]]);

    const expectedByCode = new Map([
      ['R60S','ES91851'], ['R60T','ES91852'], ['R60P','ES91853'],
      ['R90S','ES91854'], ['R90T','ES91855'], ['R90P','ES91856'],
      ['R120S','ES91857'], ['R120T','ES91858'], ['R120P','ES91859'],
    ]);

    for (const row of verification.rows) {
      const expected = expectedByCode.get(row.code);
      if (expected && row.sku !== expected) {
        throw new Error(`RACOR_SEARCH_IDENTITY_MISMATCH ${row.code}: expected ${expected}, got ${row.sku}`);
      }
    }

    await client.query('COMMIT');
    return {
      migration: MIGRATION,
      updated_cache_rows: updatedCacheRows,
      verified_references: verification.rows,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  applyRacorSeparatorSearchIdentityRepair()
    .then((report) => console.log('[racor-separator-search-identity-repair]', JSON.stringify(report)))
    .catch((error) => {
      console.error('[racor-separator-search-identity-repair] failed', error);
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyRacorSeparatorSearchIdentityRepair };
