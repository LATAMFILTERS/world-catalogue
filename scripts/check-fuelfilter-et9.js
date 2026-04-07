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
    WHERE filter_type = 'Fuel Filter'
      AND sku LIKE 'ET9%'
    ORDER BY sku
  `);
  console.log(`\nFuel Filter con prefijo ET9: ${r.rows.length} registros\n`);
  r.rows.forEach(row => {
    console.log(`SKU: ${row.sku}  |  codigo_base: ${row.codigo_base}  |  tech: ${row.technology}`);
    console.log(`  name: ${row.name}`);
    console.log(`  oem:  ${row.oem}`);
    console.log(`  xref: ${row.xref}`);
    console.log();
  });
  await c.end();
});
