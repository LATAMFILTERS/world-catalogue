'use strict';

require('dotenv').config();
const { Pool } = require('pg');

const MIGRATION = '101_R90_REFERENCE_SANITATION';

function normalizedCodeSql(alias) {
  return `upper(regexp_replace(coalesce(${alias}->>'code',''), '[^A-Za-z0-9]', '', 'g'))`;
}

async function applyR90ReferenceSanitation() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  const client = await pool.connect();

  const report = {
    migration: MIGRATION,
    removed_from_invalid_skus: 0,
    normalized_el84004: 0,
    cache_rows_removed: 0,
    remaining_r90_catalog_refs: []
  };

  try {
    await client.query('BEGIN');

    const invalidSkus = ['EH61369', 'EL30235', 'EL30236', 'EL87739'];

    const invalidCleanup = await client.query(`
      UPDATE public.elimfilters_catalog c
      SET
        oem_codes = COALESCE((
          SELECT jsonb_agg(x)
          FROM jsonb_array_elements(COALESCE(c.oem_codes, '[]'::jsonb)) x
          WHERE ${normalizedCodeSql('x')} <> 'R90'
        ), '[]'::jsonb),
        competitor_codes = COALESCE((
          SELECT jsonb_agg(x)
          FROM jsonb_array_elements(COALESCE(c.competitor_codes, '[]'::jsonb)) x
          WHERE ${normalizedCodeSql('x')} <> 'R90'
        ), '[]'::jsonb)
      WHERE c.sku = ANY($1::text[])
        AND (
          EXISTS (
            SELECT 1 FROM jsonb_array_elements(COALESCE(c.oem_codes, '[]'::jsonb)) x
            WHERE ${normalizedCodeSql('x')} = 'R90'
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(COALESCE(c.competitor_codes, '[]'::jsonb)) x
            WHERE ${normalizedCodeSql('x')} = 'R90'
          )
        )
      RETURNING sku
    `, [invalidSkus]);
    report.removed_from_invalid_skus = invalidCleanup.rowCount;

    // EL84004 is the only catalog record where TECNOCAR R90 is retained.
    // R90 is an aftermarket/competitor reference, not an OEM code, so remove
    // any OEM duplicates and keep one normalized competitor reference only.
    const el84004 = await client.query(`
      UPDATE public.elimfilters_catalog c
      SET
        oem_codes = COALESCE((
          SELECT jsonb_agg(x)
          FROM jsonb_array_elements(COALESCE(c.oem_codes, '[]'::jsonb)) x
          WHERE ${normalizedCodeSql('x')} <> 'R90'
        ), '[]'::jsonb),
        competitor_codes = (
          COALESCE((
            SELECT jsonb_agg(x)
            FROM jsonb_array_elements(COALESCE(c.competitor_codes, '[]'::jsonb)) x
            WHERE ${normalizedCodeSql('x')} <> 'R90'
          ), '[]'::jsonb)
          || jsonb_build_array(jsonb_build_object('code', 'R90', 'manufacturer', 'TECNOCAR'))
        )
      WHERE c.sku = 'EL84004'
      RETURNING sku
    `);
    report.normalized_el84004 = el84004.rowCount;

    // The public resolver cache previously carried stale R90 mappings across
    // unrelated LD/HD products. R90 is now intentionally fail-closed at the
    // API layer, so remove every cached R90 resolution. Full exact references
    // such as R90S, R90T and R90P are unaffected.
    const cacheCleanup = await client.query(`
      DELETE FROM public.crossref_resolved_cache
      WHERE upper(regexp_replace(coalesce(code,''), '[^A-Za-z0-9]', '', 'g')) = 'R90'
    `);
    report.cache_rows_removed = cacheCleanup.rowCount;

    const remaining = await client.query(`
      WITH refs AS (
        SELECT c.sku, c.duty, c.filter_type, 'OEM'::text AS source, x AS ref
        FROM public.elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.oem_codes, '[]'::jsonb)) x
        WHERE ${normalizedCodeSql('x')} = 'R90'
        UNION ALL
        SELECT c.sku, c.duty, c.filter_type, 'COMPETITOR'::text AS source, x AS ref
        FROM public.elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.competitor_codes, '[]'::jsonb)) x
        WHERE ${normalizedCodeSql('x')} = 'R90'
      )
      SELECT sku, duty, filter_type, source, ref
      FROM refs
      ORDER BY sku, source
    `);
    report.remaining_r90_catalog_refs = remaining.rows;

    const invalidRemaining = remaining.rows.filter(row =>
      row.sku !== 'EL84004' || row.source !== 'COMPETITOR'
    );
    if (invalidRemaining.length) {
      throw new Error(`R90_SANITATION_INCOMPLETE ${JSON.stringify(invalidRemaining)}`);
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
  applyR90ReferenceSanitation()
    .then(report => console.log('[r90-reference-sanitation]', JSON.stringify(report)))
    .catch(error => {
      console.error('[r90-reference-sanitation] failed', error);
      process.exit(1);
    });
}

module.exports = { MIGRATION, applyR90ReferenceSanitation };
