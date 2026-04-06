const { Client } = require("pg");

const c = new Client({
  host:     "ballast.proxy.rlwy.net",
  port:     18263,
  database: "railway",
  user:     "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log("PostgreSQL conectado\n");

  const tables = await c.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log("TABLAS EN LA BASE DE DATOS:");
  for (const t of tables.rows) {
    const cnt = await c.query(`SELECT COUNT(*) FROM ${t.table_name}`);
    console.log(`  ${t.table_name.padEnd(30)} → ${cnt.rows[0].count} filas`);
  }

  // Detalle de elimfilters_catalog
  if (tables.rows.find(r => r.table_name === "elimfilters_catalog")) {
    console.log("\nDETALLE elimfilters_catalog:");

    const byType = await c.query(`
      SELECT filter_type, COALESCE(sub_type,'') as sub_type, technology, COUNT(*) as total
      FROM elimfilters_catalog
      GROUP BY filter_type, sub_type, technology
      ORDER BY filter_type, total DESC
    `);
    byType.rows.forEach(r =>
      console.log(`  ${(r.filter_type||"").padEnd(16)} | ${(r.sub_type||"").padEnd(16)} | ${(r.technology||"").padEnd(12)} | ${r.total} productos`)
    );

    const byPrefix = await c.query(`
      SELECT SUBSTRING(sku, 1, 3) as prefix, COUNT(*) as total
      FROM elimfilters_catalog
      GROUP BY prefix
      ORDER BY total DESC
    `);
    console.log("\nPOR PREFIJO SKU:");
    byPrefix.rows.forEach(r =>
      console.log(`  ${r.prefix} → ${r.total} productos`)
    );

    const sample = await c.query(`
      SELECT sku, codigo_base, filter_type, technology,
             array_length(equipment_applications::jsonb::text::text[], 1) as equip_count
      FROM elimfilters_catalog
      LIMIT 3
    `);
    console.log("\nMUESTRA (3 productos):");
    sample.rows.forEach(r =>
      console.log(`  ${r.sku} | ${r.codigo_base} | ${r.filter_type} | ${r.technology}`)
    );
  }

  await c.end();
  console.log("\nListo.");
}).catch(e => console.error("Error:", e.message));
