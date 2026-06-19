/**
 * LIMPIEZA DE DATOS BASURA EN ld_competitor_cross_references
 * Elimina registros donde competitor_part_number contiene texto descriptivo
 * en lugar de un número de parte real.
 */

require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query('SET search_path TO ld_catalog, public');

  // 1. Audit: cuántos registros basura existen
  const audit = await client.query(`
    SELECT COUNT(*) as c 
    FROM ld_competitor_cross_references
    WHERE 
      LENGTH(competitor_part_number) > 50
      OR competitor_part_number ILIKE '%PREMIUM%'
      OR competitor_part_number ILIKE '%FILTER%'
      OR competitor_part_number ILIKE '%SEAL%'
      OR competitor_part_number ILIKE '%EQUIPMENT%'
      OR competitor_part_number ILIKE '%PREVENT%'
      OR competitor_part_number ILIKE '%COMBUSTION%'
      OR competitor_part_number ILIKE '%AIRBORNE%'
  `);
  
  console.log(`\n🔍 Registros basura detectados: ${audit.rows[0].c}`);

  // 2. Show samples before deleting
  const samples = await client.query(`
    SELECT id, elimfilters_sku, competitor_brand, LEFT(competitor_part_number, 80) as code_preview
    FROM ld_competitor_cross_references
    WHERE 
      LENGTH(competitor_part_number) > 50
      OR competitor_part_number ILIKE '%PREMIUM%'
      OR competitor_part_number ILIKE '%FILTER%'
      OR competitor_part_number ILIKE '%SEAL%'
      OR competitor_part_number ILIKE '%EQUIPMENT%'
    LIMIT 20
  `);
  console.log('\n📋 Muestra de registros a eliminar:');
  console.table(samples.rows);

  // 3. Delete
  const del = await client.query(`
    DELETE FROM ld_competitor_cross_references
    WHERE 
      LENGTH(competitor_part_number) > 50
      OR competitor_part_number ILIKE '%PREMIUM%'
      OR competitor_part_number ILIKE '%FILTER%'
      OR competitor_part_number ILIKE '%SEAL%'
      OR competitor_part_number ILIKE '%EQUIPMENT%'
      OR competitor_part_number ILIKE '%PREVENT%'
      OR competitor_part_number ILIKE '%COMBUSTION%'
      OR competitor_part_number ILIKE '%AIRBORNE%'
  `);

  console.log(`\n✅ Eliminados: ${del.rowCount} registros basura`);

  // 4. Final count
  const final = await client.query('SELECT COUNT(*) as c FROM ld_competitor_cross_references');
  console.log(`📊 Total ld_competitor_cross_references ahora: ${final.rows[0].c}`);

  await client.end();
}

run().catch(console.error);
