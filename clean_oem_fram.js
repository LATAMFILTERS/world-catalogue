const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const LD = /^(PH|XG|TG|DG)\d/i;

async function main() {
  // Also scan ALL HD products for FRAM LD codes in oem_codes (not just EL82016/EL87780)
  const rows = await pool.query(`
    SELECT sku, oem_codes FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
    AND oem_codes IS NOT NULL
    AND jsonb_array_length(oem_codes) > 0
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(oem_codes) AS elem
      WHERE UPPER(elem->>'manufacturer') = 'FRAM'
      AND (
        UPPER(elem->>'code') LIKE 'PH%'
        OR UPPER(elem->>'code') LIKE 'XG%'
        OR UPPER(elem->>'code') LIKE 'TG%'
        OR UPPER(elem->>'code') LIKE 'DG%'
      )
    )
  `);

  console.log('SKUs con FRAM LD en oem_codes:', rows.rows.length);
  let fixed = 0;

  for (const row of rows.rows) {
    const orig = Array.isArray(row.oem_codes) ? row.oem_codes : [];
    const clean = orig.filter(c => {
      if ((c.manufacturer || '').toUpperCase() === 'FRAM' && LD.test(c.code || '')) return false;
      return true;
    });
    const removed = orig.filter(c => (c.manufacturer || '').toUpperCase() === 'FRAM' && LD.test(c.code || ''));
    await pool.query(
      'UPDATE elimfilters_catalog SET oem_codes = $1::jsonb WHERE sku = $2',
      [JSON.stringify(clean), row.sku]
    );
    console.log(row.sku + ': removidos ' + removed.map(c => c.code).join(', '));
    fixed++;
  }

  console.log('Total limpiados:', fixed);
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
