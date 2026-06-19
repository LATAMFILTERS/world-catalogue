const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm@ballast.proxy.rlwy.net:18263/railway',
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'elimfilters_catalog' ORDER BY ordinal_position`))
  .then(res => {
    console.log('=== TABLE SCHEMA ===');
    res.rows.forEach(r => console.log(r.column_name, '-', r.data_type));
    return client.query(`SELECT * FROM elimfilters_catalog WHERE sku = 'EL81807' LIMIT 1`);
  })
  .then(res => {
    console.log('\n=== EL81807 ROW ===');
    const r = res.rows[0];
    if (!r) { console.log('NOT FOUND'); return; }
    Object.entries(r).forEach(([k, v]) => {
      const val = v === null ? 'NULL' : (typeof v === 'object' ? JSON.stringify(v).substring(0, 150) : String(v).substring(0, 150));
      console.log(`${k}: ${val}`);
    });
    client.end();
  })
  .catch(e => { console.error(e.message); client.end(); });
