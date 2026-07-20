const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.LEGACY_DB_URL,
  ssl: { rejectUnauthorized: false }
});
client.connect()
  .then(() => client.query(`SELECT sku, filter_type, installation_type, sub_type, technology, description FROM elimfilters_catalog WHERE sku = 'EL81807'`))
  .then(res => {
    const r = res.rows[0];
    console.log('filter_type:', r.filter_type);
    console.log('installation_type:', r.installation_type);
    console.log('sub_type:', r.sub_type);
    console.log('technology:', r.technology);
    console.log('description:', r.description);
    client.end();
  })
  .catch(e => console.error(e));
