/**
 * Investiga los productos sin ninguna sección de datos en PostgreSQL
 * Muestra SKU, tipo, código Donaldson y construye las URLs para verificar manualmente
 */
const { Client } = require("pg");
const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log("PostgreSQL conectado\n");

  const empty = await c.query(`
    SELECT sku, codigo_base, filter_type, sub_type, technology,
           donaldson_url, name
    FROM elimfilters_catalog
    WHERE (oem_codes IS NULL OR oem_codes::text = '[]' OR oem_codes::text = 'null')
      AND (competitor_codes IS NULL OR competitor_codes::text = '[]' OR competitor_codes::text = 'null')
      AND (equipment_applications IS NULL OR equipment_applications::text = '[]' OR equipment_applications::text = 'null')
      AND thread_size IS NULL AND height_mm IS NULL
      AND outer_diameter_mm IS NULL AND micron_rating IS NULL
    ORDER BY filter_type, sku
  `);

  console.log(`PRODUCTOS SIN NINGÚN DATO: ${empty.rows.length}\n`);

  // Agrupar por tipo
  const byType = {};
  empty.rows.forEach(r => {
    const t = r.filter_type || "Desconocido";
    if (!byType[t]) byType[t] = [];
    byType[t].push(r);
  });

  for (const [type, products] of Object.entries(byType)) {
    console.log(`\n── ${type} (${products.length}) ──────────────────────`);
    products.forEach(r => {
      console.log(`  ${r.sku} | ${r.codigo_base} | ${r.name || "(sin nombre)"}`);
      if (r.donaldson_url) console.log(`    URL: ${r.donaldson_url}`);
    });
  }

  // Exportar lista de codigo_base para re-scrape
  const fs = require("fs");
  const path = require("path");
  const codes = empty.rows.map(r => r.codigo_base).filter(Boolean);
  const outFile = path.join(__dirname, "..", "scrape_reports", "empty-products-to-rescrape.json");
  fs.writeFileSync(outFile, JSON.stringify({ total: codes.length, codes }, null, 2));
  console.log(`\n✅ Lista exportada: ${outFile}`);
  console.log(`   ${codes.length} códigos listos para re-scrape`);

  await c.end();
}).catch(e => console.error(e.message));
