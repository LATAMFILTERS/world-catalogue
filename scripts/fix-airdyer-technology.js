/**
 * Corrige todos los Air Dryer en elimfilters_catalog:
 *  - Fuerza technology = DRYCORE™ en todos los Air Dryer
 *  - Elimina filas duplicadas (mismo SKU, conserva la más reciente o la de mayor id)
 *
 * Uso:
 *   node scripts/fix-airdryer-technology.js
 */

const { Client } = require("pg");

const c = new Client({
  host:     process.env.PGHOST     || "ballast.proxy.rlwy.net",
  port:     process.env.PGPORT     || 18263,
  database: process.env.PGDATABASE || "railway",
  user:     process.env.PGUSER     || "postgres",
  password: process.env.PGPASSWORD || "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  console.log("PostgreSQL conectado\n");

  // ─── 1. Ver qué hay antes ────────────────────────────────────────────────
  const before = await c.query(`
    SELECT technology, COUNT(*) as total
    FROM elimfilters_catalog
    WHERE filter_type = 'Air Dryer'
    GROUP BY technology
    ORDER BY total DESC
  `);
  console.log("ANTES — Air Dryer por tecnología:");
  before.rows.forEach(r => console.log(`  ${(r.technology||"NULL").padEnd(14)} → ${r.total} productos`));

  // ─── 2. Forzar DRYCORE™ en todos los Air Dryer ──────────────────────────
  const fix = await c.query(`
    UPDATE elimfilters_catalog
    SET technology = 'DRYCORE™'
    WHERE filter_type = 'Air Dryer'
      AND (technology != 'DRYCORE™' OR technology IS NULL)
  `);
  console.log(`\n✅ Tecnología corregida: ${fix.rowCount} filas actualizadas a DRYCORE™`);

  // ─── 3. Detectar SKUs duplicados ─────────────────────────────────────────
  const dupes = await c.query(`
    SELECT sku, COUNT(*) as cnt
    FROM elimfilters_catalog
    GROUP BY sku
    HAVING COUNT(*) > 1
  `);

  if (dupes.rows.length === 0) {
    console.log("✅ Sin SKUs duplicados");
  } else {
    console.log(`\n⚠️  SKUs duplicados encontrados: ${dupes.rows.length}`);
    dupes.rows.forEach(r => console.log(`  ${r.sku} → ${r.cnt} veces`));

    // Eliminar duplicados manteniendo el registro con el id más alto (más reciente)
    const del = await c.query(`
      DELETE FROM elimfilters_catalog
      WHERE ctid NOT IN (
        SELECT MAX(ctid)
        FROM elimfilters_catalog
        GROUP BY sku
      )
    `);
    console.log(`✅ Duplicados eliminados: ${del.rowCount} filas borradas`);
  }

  // ─── 4. Verificar resultado final ────────────────────────────────────────
  const after = await c.query(`
    SELECT filter_type, COALESCE(sub_type,'') as sub_type, technology, COUNT(*) as total
    FROM elimfilters_catalog
    WHERE filter_type = 'Air Dryer'
    GROUP BY filter_type, sub_type, technology
    ORDER BY total DESC
  `);
  console.log("\nDESPUÉS — Air Dryer:");
  after.rows.forEach(r =>
    console.log(`  ${(r.filter_type).padEnd(14)} | ${(r.sub_type).padEnd(14)} | ${(r.technology||"").padEnd(12)} | ${r.total} productos`)
  );

  await c.end();
  console.log("\nListo.");
}).catch(e => console.error("Error:", e.message));
