const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});
c.connect().then(async () => {
  // Muestra de Air Filters con EA2
  const r = await c.query(`
    SELECT sku, codigo_base, filter_type, technology, name
    FROM elimfilters_catalog
    WHERE filter_type = 'Air Filter'
      AND sku LIKE 'EA2%'
    ORDER BY sku LIMIT 20
  `);
  console.log(`\nAir Filter con prefijo EA2 (total de muestra): ${r.rows.length}\n`);
  console.table(r.rows);

  // Conteo total
  const cnt = await c.query(`
    SELECT COUNT(*) as total FROM elimfilters_catalog
    WHERE filter_type = 'Air Filter' AND sku LIKE 'EA2%'
  `);
  console.log(`Total Air Filter con EA2: ${cnt.rows[0].total}`);

  await c.end();
});
