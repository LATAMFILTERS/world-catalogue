const { Client } = require("pg");

const DRY_RUN = !process.argv.includes("--apply");

const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log(`\n=== DELETE: Fuel Separator duplicados EF9 (ya existen como ES9) ===`);
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN (sin cambios)" : "APLICANDO CAMBIOS"}\n`);

  const { rows } = await c.query(`
    SELECT e.sku AS sku_ef9, e.codigo_base, s.sku AS sku_es9_existente
    FROM elimfilters_catalog e
    JOIN elimfilters_catalog s
      ON s.codigo_base = e.codigo_base
      AND s.sku LIKE 'ES9%'
    WHERE e.filter_type = 'Fuel Separator'
      AND e.sku LIKE 'EF9%'
    ORDER BY e.sku
  `);

  console.log(`Duplicados a eliminar: ${rows.length}`);
  console.log("\nSKU duplicado  | Donaldson    | SKU correcto ya existe");
  console.log("─".repeat(55));
  rows.forEach(r => console.log(
    `${r.sku_ef9.padEnd(15)}| ${r.codigo_base.padEnd(13)}| ${r.sku_es9_existente}`
  ));

  if (!DRY_RUN) {
    const result = await c.query(`
      DELETE FROM elimfilters_catalog
      WHERE filter_type = 'Fuel Separator'
        AND sku LIKE 'EF9%'
        AND codigo_base IN (
          SELECT codigo_base FROM elimfilters_catalog WHERE sku LIKE 'ES9%'
        )
    `);
    console.log(`\n✅ Eliminados: ${result.rowCount} duplicados EF9`);
  } else {
    console.log(`\nDry-run OK. Para aplicar: node scripts/fix-fuelseparator-delete-duplicates.js --apply`);
  }

  await c.end();
});
