/**
 * Fix Air Housing SKU prefix: EA1 → EA2
 *
 * Los productos con filter_type = 'Air Housing' deben tener prefijo EA2,
 * no EA1. Este script encuentra los afectados y corrige el SKU en PostgreSQL.
 *
 * Uso:
 *   node scripts/fix-airhousing-sku-prefix.js           (dry-run por defecto)
 *   node scripts/fix-airhousing-sku-prefix.js --apply   (aplica cambios)
 */

const { Client } = require("pg");

const DRY_RUN = !process.argv.includes("--apply");

const pgClient = new Client({
  host:     process.env.PGHOST     || "ballast.proxy.rlwy.net",
  port:     process.env.PGPORT     || 18263,
  database: process.env.PGDATABASE || "railway",
  user:     process.env.PGUSER     || "postgres",
  password: process.env.PGPASSWORD || "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("\n=== FIX: Air Housing EA1 → EA2 ===");
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN (sin cambios)" : "APLICANDO CAMBIOS"}\n`);

  await pgClient.connect();
  console.log("PostgreSQL conectado\n");

  // Buscar Air Housings con SKU que empiece en EA1
  const { rows } = await pgClient.query(`
    SELECT sku, codigo_base, filter_type, technology
    FROM elimfilters_catalog
    WHERE filter_type = 'Air Housing'
      AND sku LIKE 'EA1%'
    ORDER BY sku
  `);

  if (rows.length === 0) {
    console.log("✅ No se encontraron Air Housings con prefijo EA1. Todo correcto.");
    await pgClient.end();
    return;
  }

  console.log(`Encontrados: ${rows.length} productos con prefijo EA1 incorrectos\n`);
  console.log("SKU actual          → SKU nuevo             | Donaldson      | Tipo");
  console.log("─".repeat(80));

  let fixed = 0, errors = 0;

  for (const row of rows) {
    // EA1XXXXX → EA2XXXXX  (reemplaza solo los primeros 3 chars)
    const newSku = "EA2" + row.sku.slice(3);

    console.log(
      `${row.sku.padEnd(20)}→ ${newSku.padEnd(22)} | ${(row.codigo_base || "").padEnd(14)} | ${row.filter_type}`
    );

    if (!DRY_RUN) {
      try {
        // Verificar que el nuevo SKU no exista ya
        const { rows: existing } = await pgClient.query(
          "SELECT 1 FROM elimfilters_catalog WHERE sku = $1", [newSku]
        );

        if (existing.length > 0) {
          console.log(`  ⚠️  SKIP: ${newSku} ya existe en la tabla`);
          continue;
        }

        await pgClient.query(
          "UPDATE elimfilters_catalog SET sku = $1 WHERE sku = $2",
          [newSku, row.sku]
        );
        fixed++;
      } catch (e) {
        console.error(`  ❌ Error: ${e.message}`);
        errors++;
      }
    }
  }

  if (!DRY_RUN) {
    console.log(`\n✅ Corregidos: ${fixed}`);
    if (errors > 0) console.log(`❌ Errores   : ${errors}`);
  } else {
    console.log(`\nℹ️  Dry-run completado. Para aplicar: node scripts/fix-airhousing-sku-prefix.js --apply`);
  }

  await pgClient.end();
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
