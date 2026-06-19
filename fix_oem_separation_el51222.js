/**
 * CORRECCIÓN: Mover OEM codes de ld_competitor_cross_references a ld_oem_cross_references
 * SKU: EL51222 (W 712/22)
 */

require('dotenv').config();
const { Client } = require('pg');

// Marcas que son OEM (fabricantes de equipos originales / distribuidores OEM directos)
const OEM_BRANDS = new Set([
  'GENERAL MOTORS',
  'CHRYSLER',
  'DAEWOO',
  'ISUZU',
  'MITSUBISHI',
  'TOYOTA',
  'SUZUKI',
  'SAAB',
  'VOLVO TRUCKS',
  'JOHN DEERE',
  'CATERPILLAR',
  'HYSTER',
  'MOTORCRAFT',   // Ford OEM
  'MOPAR',        // Chrysler OEM
  'MANN',         // MANN variante adicional
]);

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query('SET search_path TO ld_catalog, public');

  // 1. Obtener todos los registros actuales de EL51222 en competitor que son OEM
  const toMove = await client.query(`
    SELECT id, elimfilters_sku, source_sku, competitor_brand, competitor_part_number
    FROM ld_competitor_cross_references
    WHERE elimfilters_sku = 'EL51222'
    AND competitor_brand = ANY($1)
  `, [Array.from(OEM_BRANDS)]);

  console.log(`\nRegistros OEM encontrados en competitor_cross_references: ${toMove.rows.length}`);

  let moved = 0;
  let errors = 0;
  const idsToDelete = [];

  for (const row of toMove.rows) {
    try {
      // Insert into OEM table
      await client.query(`
        INSERT INTO ld_oem_cross_references
          (elimfilters_sku, source_sku, oem_brand, oem_part_number)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (elimfilters_sku, oem_brand, oem_part_number) DO NOTHING
      `, [row.elimfilters_sku, row.source_sku, row.competitor_brand, row.competitor_part_number]);

      idsToDelete.push(row.id);
      moved++;
    } catch(e) {
      console.error(`Error en ${row.competitor_brand} ${row.competitor_part_number}: ${e.message}`);
      errors++;
    }
  }

  // 2. Delete from competitor table
  if (idsToDelete.length > 0) {
    await client.query(`
      DELETE FROM ld_competitor_cross_references WHERE id = ANY($1)
    `, [idsToDelete]);
  }

  console.log(`\n✅ Corrección completada:`);
  console.log(`   Movidos a ld_oem_cross_references: ${moved}`);
  console.log(`   Errores: ${errors}`);

  // 3. Verify counts
  const compCount = await client.query(`SELECT COUNT(*) as c FROM ld_competitor_cross_references WHERE elimfilters_sku = 'EL51222'`);
  const oemCount = await client.query(`SELECT COUNT(*) as c FROM ld_oem_cross_references WHERE elimfilters_sku = 'EL51222'`);
  
  console.log(`\n📊 Estado final EL51222:`);
  console.log(`   ld_competitor_cross_references: ${compCount.rows[0].c} refs`);
  console.log(`   ld_oem_cross_references:        ${oemCount.rows[0].c} refs`);

  // Show what's in OEM now
  const oemSample = await client.query(`
    SELECT oem_brand, oem_part_number 
    FROM ld_oem_cross_references 
    WHERE elimfilters_sku = 'EL51222'
    ORDER BY oem_brand, oem_part_number
  `);
  console.log(`\n🔩 OEM Codes en DB:`);
  console.table(oemSample.rows);

  await client.end();
}

run().catch(console.error);
