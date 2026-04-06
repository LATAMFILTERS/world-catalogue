/**
 * Limpia los 4 productos EW7XXXX (Air Dryer con prefijo incorrecto):
 *  - Elimina EW71413, EW71415, EW73571 (duplicados de ED4 existentes)
 *  - Convierte EW74764 / P584764 → ED44764 con datos correctos
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

  // 1. Eliminar los 3 duplicados EW7 que ya tienen versión ED4
  const del = await c.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku IN ('EW71413', 'EW71415', 'EW73571')
  `);
  console.log(`✅ Eliminados ${del.rowCount} duplicados EW7 (ya existen como ED4)`);

  // 2. Renombrar EW74764 → ED44764 y corregir sus datos
  const upd = await c.query(`
    UPDATE elimfilters_catalog
    SET
      sku        = 'ED44764',
      filter_type = 'Air Dryer',
      sub_type   = 'Spin-On',
      technology = 'DRYCORE™'
    WHERE sku = 'EW74764'
  `);
  console.log(`✅ EW74764 → ED44764 (${upd.rowCount} fila actualizada)`);

  // 3. Verificar resultado final
  const result = await c.query(`
    SELECT sku, codigo_base, filter_type, sub_type, technology
    FROM elimfilters_catalog
    WHERE filter_type = 'Air Dryer'
    ORDER BY sku
  `);
  console.log(`\nAir Dryer final (${result.rows.length} productos):`);
  result.rows.forEach(r =>
    console.log(`  ${r.sku} | ${r.codigo_base} | ${(r.sub_type||"").padEnd(10)} | ${r.technology}`)
  );

  // 4. Confirmar sin duplicados
  const dupes = await c.query(`
    SELECT sku, COUNT(*) FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1
  `);
  console.log(dupes.rows.length === 0 ? "\n✅ Sin SKUs duplicados" : `\n⚠️ ${dupes.rows.length} duplicados aún`);

  await c.end();
}).catch(e => console.error(e.message));
