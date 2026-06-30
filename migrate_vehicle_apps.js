// Migrate LD fitments: equipment_applications → vehicle_applications
// HD keeps equipment_applications as-is
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('=== MIGRATE: equipment_applications → vehicle_applications (LD) ===\n');

  // 1. Estado antes
  const before = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty='LIGHT_DUTY' AND equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications)>0) as ld_equip_before,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty='LIGHT_DUTY' AND vehicle_applications IS NOT NULL AND jsonb_array_length(vehicle_applications)>0) as ld_veh_before,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty='HEAVY_DUTY' AND equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications)>0) as hd_equip_before
  `);
  const b = before.rows[0];
  console.log('--- Estado ANTES ---');
  console.log(`  LD equipment_applications con datos: ${b.ld_equip_before}`);
  console.log(`  LD vehicle_applications con datos:   ${b.ld_veh_before}`);
  console.log(`  HD equipment_applications con datos: ${b.hd_equip_before}`);
  console.log('');

  // 2. Migrar: copiar equipment_applications → vehicle_applications para LD
  //    y limpiar equipment_applications en LD
  const migrate = await pool.query(`
    UPDATE elimfilters_catalog
    SET
      vehicle_applications = equipment_applications,
      equipment_applications = '[]'::jsonb
    WHERE duty = 'LIGHT_DUTY'
      AND equipment_applications IS NOT NULL
      AND jsonb_array_length(equipment_applications) > 0
    RETURNING sku
  `);
  console.log(`  Migrados: ${migrate.rows.length} SKUs LD`);
  console.log('');

  // 3. Estado después
  const after = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty='LIGHT_DUTY' AND equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications)>0) as ld_equip_after,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty='LIGHT_DUTY' AND vehicle_applications IS NOT NULL AND jsonb_array_length(vehicle_applications)>0) as ld_veh_after,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty='HEAVY_DUTY' AND equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications)>0) as hd_equip_after,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty='HEAVY_DUTY' AND vehicle_applications IS NOT NULL AND jsonb_array_length(vehicle_applications)>0) as hd_veh_after
  `);
  const a = after.rows[0];
  console.log('--- Estado DESPUÉS ---');
  console.log(`  LD equipment_applications con datos: ${a.ld_equip_after}  (debe ser 0)`);
  console.log(`  LD vehicle_applications con datos:   ${a.ld_veh_after}    (debe ser ~3667)`);
  console.log(`  HD equipment_applications con datos: ${a.hd_equip_after}  (debe ser ~3602)`);
  console.log(`  HD vehicle_applications con datos:   ${a.hd_veh_after}    (debe ser 0)`);
  console.log('');

  // 4. Muestra de verificación
  const ldSample = await pool.query(`
    SELECT sku, jsonb_array_length(vehicle_applications) as veh_count
    FROM elimfilters_catalog
    WHERE duty='LIGHT_DUTY' AND vehicle_applications IS NOT NULL AND jsonb_array_length(vehicle_applications)>0
    ORDER BY veh_count DESC LIMIT 5
  `);
  console.log('--- Top 5 LD por cantidad de vehicle_applications ---');
  ldSample.rows.forEach(r => console.log(`  ${r.sku}: ${r.veh_count} entries`));

  const hdSample = await pool.query(`
    SELECT sku, jsonb_array_length(equipment_applications) as equip_count
    FROM elimfilters_catalog
    WHERE duty='HEAVY_DUTY' AND equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications)>0
    ORDER BY equip_count DESC LIMIT 5
  `);
  console.log('--- Top 5 HD por cantidad de equipment_applications ---');
  hdSample.rows.forEach(r => console.log(`  ${r.sku}: ${r.equip_count} entries`));

  console.log('\n=== MIGRACIÓN COMPLETADA ===');
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
