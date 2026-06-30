const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  const r = await pool.query(`
    SELECT sku, filter_type, duty,
      COALESCE(name, '') as name,
      jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) as oem_cnt,
      jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) as comp_cnt
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%'
    ORDER BY sku
  `);
  console.log('ET9 SKUs: ' + r.rows.length);
  r.rows.forEach(row => console.log('  ' + row.sku + ' | ' + row.filter_type + ' | ' + row.duty + ' | oem:' + row.oem_cnt + ' comp:' + row.comp_cnt + ' | ' + row.name.substring(0,60)));
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
