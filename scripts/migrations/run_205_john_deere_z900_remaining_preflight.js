'use strict';

require('dotenv').config();
const { Client } = require('pg');

function norm(v) {
  return String(v || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

async function main() {
  const url =
    process.env.CATALOG_DATABASE_URL ||
    process.env.ELIMFILTERS_DATABASE_URL ||
    process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');

  const db = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await db.connect();

  try {
    const targets = [
      'UC16183','UC21217','MIU13224','MIA881446','AM131102',
      'P550094','FF5066','FF5480','P551760','FF5190',
      '2405003S','187Q0699150','1A637026450'
    ].map(norm);

    const refs = await db.query(`
      SELECT DISTINCT
        c.sku,
        c.codigo_base,
        c.filter_type,
        c.duty,
        c.canonical_source_brand,
        c.canonical_source_code,
        x.manufacturer,
        x.code AS matched_code,
        x.source
      FROM public.elimfilters_catalog c
      CROSS JOIN LATERAL (
        SELECT e->>'manufacturer' manufacturer, e->>'code' code, 'OEM' source
        FROM jsonb_array_elements(COALESCE(c.oem_codes,'[]'::jsonb)) e
        UNION ALL
        SELECT e->>'manufacturer', e->>'code', 'COMPETITOR'
        FROM jsonb_array_elements(COALESCE(c.competitor_codes,'[]'::jsonb)) e
      ) x
      WHERE upper(regexp_replace(COALESCE(x.code,''),'[^A-Z0-9]','','g')) = ANY($1)
      ORDER BY x.code, c.sku
    `, [targets]);

    const identities = await db.query(`
      SELECT
        sku,codigo_base,filter_type,duty,
        canonical_source_brand,canonical_source_code,
        height_mm,outer_diameter_mm,thread_size
      FROM public.elimfilters_catalog
      WHERE sku = ANY($1)
         OR upper(regexp_replace(COALESCE(codigo_base,''),'[^A-Z0-9]','','g')) = ANY($2)
         OR upper(regexp_replace(COALESCE(canonical_source_code,''),'[^A-Z0-9]','','g')) = ANY($2)
      ORDER BY sku
    `, [
      ['EF90094','EF91760','EF95190','EF95003','EH69150','EH61446'],
      ['P550094','FF5066','FF5480','P551760','FF5190','2405003S','187Q0699150','1A637026450'].map(norm)
    ]);

    const candidates = await db.query(`
      SELECT sku,codigo_base,canonical_source_brand,canonical_source_code
      FROM public.elimfilters_catalog
      WHERE sku = ANY($1)
      ORDER BY sku
    `, [['EF95003','EH69150']]);

    console.log(JSON.stringify({
      refs: refs.rows,
      identities: identities.rows,
      candidate_occupancy: candidates.rows
    }, null, 2));
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
