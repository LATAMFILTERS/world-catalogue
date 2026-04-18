const { Client } = require("pg");

const DRY_RUN = !process.argv.includes("--apply");

const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log(`\n=== FIX: G-series MACROCORE™ filter_type 'Air Filter' → 'Air Housing' ===`);
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN (sin cambios)" : "APLICANDO CAMBIOS"}\n`);

  const { rows } = await c.query(`
    SELECT sku, codigo_base FROM elimfilters_catalog
    WHERE filter_type = 'Air Filter'
      AND sku LIKE 'EA2%'
    ORDER BY sku
  `);

  console.log(`Afectados: ${rows.length} registros`);
  rows.slice(0, 10).forEach(r => console.log(`  ${r.sku}  ${r.codigo_base}`));
  if (rows.length > 10) console.log(`  ... y ${rows.length - 10} más`);

  if (!DRY_RUN) {
    const result = await c.query(`
      UPDATE elimfilters_catalog
      SET filter_type = 'Air Housing'
      WHERE filter_type = 'Air Filter'
        AND sku LIKE 'EA2%'
    `);
    console.log(`\n✅ Actualizados: ${result.rowCount} registros → filter_type = 'Air Housing'`);
  } else {
    console.log(`\nDry-run OK. Para aplicar: node scripts/fix-macrocore-filtertype.js --apply`);
  }

  await c.end();
});
