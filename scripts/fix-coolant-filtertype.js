const { Client } = require("pg");

const DRY_RUN = !process.argv.includes("--apply");

const c = new Client({
  host: "ballast.proxy.rlwy.net", port: 18263,
  database: "railway", user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log(`\n=== FIX: filter_type 'Coolant' → 'Coolant Filter' ===`);
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN (sin cambios)" : "APLICANDO CAMBIOS"}\n`);

  const { rows } = await c.query(`
    SELECT sku, codigo_base FROM elimfilters_catalog
    WHERE filter_type = 'Coolant'
    ORDER BY sku
  `);

  console.log(`Afectados: ${rows.length} registros`);
  rows.forEach(r => console.log(`  ${r.sku}  ${r.codigo_base}`));

  if (!DRY_RUN) {
    const result = await c.query(`
      UPDATE elimfilters_catalog
      SET filter_type = 'Coolant Filter'
      WHERE filter_type = 'Coolant'
    `);
    console.log(`\n✅ Actualizados: ${result.rowCount} registros`);
  } else {
    console.log(`\nDry-run OK. Para aplicar: node scripts/fix-coolant-filtertype.js --apply`);
  }

  await c.end();
});
