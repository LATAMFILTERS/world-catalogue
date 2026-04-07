const { Client } = require("pg");

const DRY_RUN = !process.argv.includes("--apply");

const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log(`\n=== FIX: Fuel Separator EF9 → ES9 ===`);
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN (sin cambios)" : "APLICANDO CAMBIOS"}\n`);

  const { rows } = await c.query(`
    SELECT sku, codigo_base FROM elimfilters_catalog
    WHERE filter_type = 'Fuel Separator' AND sku LIKE 'EF9%'
    ORDER BY sku
  `);

  console.log("SKU actual   → SKU nuevo     | Donaldson");
  console.log("─".repeat(45));

  let fixed = 0;
  for (const row of rows) {
    const newSku = "ES9" + row.sku.slice(3);
    console.log(`${row.sku.padEnd(13)}→ ${newSku.padEnd(13)} | ${row.codigo_base}`);

    if (!DRY_RUN) {
      const { rows: exists } = await c.query(
        "SELECT 1 FROM elimfilters_catalog WHERE sku = $1", [newSku]
      );
      if (exists.length > 0) {
        console.log(`  ⚠️  SKIP: ${newSku} ya existe`);
        continue;
      }
      await c.query(
        "UPDATE elimfilters_catalog SET sku = $1 WHERE sku = $2",
        [newSku, row.sku]
      );
      fixed++;
    }
  }

  if (!DRY_RUN) {
    console.log(`\n✅ Corregidos: ${fixed}/${rows.length}`);
  } else {
    console.log(`\nDry-run OK. Para aplicar: node scripts/fix-fuelseparator-prefix.js --apply`);
  }

  await c.end();
});
