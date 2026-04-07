const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});
c.connect().then(async () => {
  // Muestra los primeros 5 de cada tipo para ver la diferencia
  for (const type of ["Coolant", "Coolant Filter"]) {
    const r = await c.query(`
      SELECT sku, codigo_base, filter_type, technology, name
      FROM elimfilters_catalog
      WHERE filter_type = $1
      ORDER BY sku LIMIT 8
    `, [type]);
    console.log(`\n=== ${type} (${r.rows.length} muestra) ===`);
    console.table(r.rows);
  }
  await c.end();
});
