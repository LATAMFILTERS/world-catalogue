const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm@ballast.proxy.rlwy.net:18263/railway',
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => client.query(`SELECT sku, codigo_base, oem_codes, competitor_codes FROM elimfilters_catalog WHERE oem_codes::text ILIKE '%P502042%' OR competitor_codes::text ILIKE '%P502042%' OR codigo_base ILIKE '%P502042%'`))
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    client.end();
  })
  .catch(e => {
    console.error(e);
    client.end();
  });
