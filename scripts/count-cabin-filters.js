const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});
c.connect().then(async () => {
  const r = await c.query(`
    SELECT filter_type, COUNT(*) as total,
           COUNT(CASE WHEN competitor_codes IS NOT NULL AND competitor_codes != '[]' THEN 1 END) as con_crossref,
           COUNT(CASE WHEN oem_codes IS NOT NULL AND oem_codes != '[]' THEN 1 END) as con_oem
    FROM elimfilters_catalog
    WHERE filter_type ILIKE '%cabin%' OR sku ILIKE 'EC1%'
    GROUP BY filter_type ORDER BY total DESC
  `);
  console.table(r.rows);
  await c.end();
});
