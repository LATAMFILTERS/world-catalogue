const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.LEGACY_DB_URL,
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => {
    // Check sub_type column data type and sample values
    return client.query(`
      SELECT 
        pg_typeof(sub_type) as col_type,
        sub_type,
        COUNT(*) as total
      FROM elimfilters_catalog
      WHERE sub_type IS NOT NULL
      GROUP BY sub_type
      ORDER BY total DESC
      LIMIT 30
    `);
  })
  .then(res => {
    console.log('=== All sub_type values in DB ===');
    res.rows.forEach(r => {
      const val = typeof r.sub_type === 'object' ? JSON.stringify(r.sub_type) : String(r.sub_type);
      console.log(`[${r.col_type}] "${val.substring(0, 100)}"  count: ${r.total}`);
    });
    
    // Also check if sub_type is stored as JSONB
    return client.query(`
      SELECT sub_type::text, COUNT(*) as total
      FROM elimfilters_catalog
      WHERE sub_type::text ILIKE '%celulo%' OR sub_type::text ILIKE '%cellulo%'
      GROUP BY sub_type::text
      LIMIT 20
    `);
  })
  .then(res => {
    console.log('\n=== Cellulose matches (cast to text) ===');
    if (res.rows.length === 0) {
      console.log('  None found via ILIKE on sub_type::text');
    } else {
      res.rows.forEach(r => console.log(`  "${r.sub_type}"  count: ${r.total}`));
    }
    client.end();
  })
  .catch(e => { console.error(e.message); client.end(); });
