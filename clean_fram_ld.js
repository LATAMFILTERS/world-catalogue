const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const LD_FRAM = /^(PH|XG|TG|DG)\d/i;

async function main() {
  const rows = await pool.query(`
    SELECT sku, competitor_codes FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
    AND competitor_codes IS NOT NULL
    AND jsonb_array_length(competitor_codes) > 0
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(competitor_codes) AS elem
      WHERE UPPER(elem->>'manufacturer') = 'FRAM'
      AND (
        UPPER(elem->>'code') LIKE 'PH%'
        OR UPPER(elem->>'code') LIKE 'XG%'
        OR UPPER(elem->>'code') LIKE 'TG%'
        OR UPPER(elem->>'code') LIKE 'DG%'
      )
    )
  `);

  console.log('SKUs a limpiar:', rows.rows.length);
  let fixed = 0;

  for (const row of rows.rows) {
    const orig = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    const clean = orig.filter(c => {
      if ((c.manufacturer || '').toUpperCase() === 'FRAM' && LD_FRAM.test(c.code || '')) return false;
      return true;
    });
    if (clean.length < orig.length) {
      const removed = orig.filter(c => (c.manufacturer || '').toUpperCase() === 'FRAM' && LD_FRAM.test(c.code || ''));
      console.log(row.sku + ': removidos ' + removed.map(c => c.code).join(', '));
      await pool.query('UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2',
        [JSON.stringify(clean), row.sku]);
      fixed++;
    }
  }

  console.log('Total limpiados:', fixed);
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
