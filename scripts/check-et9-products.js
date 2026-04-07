const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});
c.connect().then(async () => {
  const r = await c.query(`
    SELECT sku, codigo_base, filter_type, technology, name,
           oem_codes::text AS oem, competitor_codes::text AS xref
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%'
    ORDER BY filter_type, sku
  `);
  console.log(`\nProductos ET9: ${r.rows.length}\n`);
  r.rows.forEach(row => {
    console.log(`${row.sku}  |  ${row.codigo_base}  |  ${row.filter_type}  |  ${row.technology}`);
    if (row.name) console.log(`  name: ${row.name}`);
  });
  await c.end();
});
