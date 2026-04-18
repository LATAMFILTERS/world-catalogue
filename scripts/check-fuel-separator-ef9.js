const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});
c.connect().then(async () => {
  const r = await c.query(`
    SELECT sku, codigo_base, filter_type, technology, name
    FROM elimfilters_catalog
    WHERE filter_type = 'Fuel Separator'
      AND sku LIKE 'EF9%'
    ORDER BY sku
  `);
  console.log(`\nFuel Separator con prefijo EF9 (debería ser ES9): ${r.rows.length} registros\n`);
  console.table(r.rows);
  await c.end();
});
