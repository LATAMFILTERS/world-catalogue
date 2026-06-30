// Audit: is the MANN base code stored in oem_codes for LD products?
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('=== AUDIT: MANN code presence in LD oem_codes ===\n');

  // 1. How many LD have oem_codes at all
  const ldTotal = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0) as with_oem,
      COUNT(*) FILTER (WHERE oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0) as no_oem
    FROM elimfilters_catalog WHERE duty = 'LIGHT_DUTY'
  `);
  const t = ldTotal.rows[0];
  console.log(`LD total: ${t.total} | con oem_codes: ${t.with_oem} | sin oem_codes: ${t.no_oem}\n`);

  // 2. LD with manufacturer=MANN explicitly
  const withMann = await pool.query(`
    SELECT COUNT(DISTINCT sku) as cnt FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY' AND oem_codes IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(oem_codes) e
      WHERE UPPER(COALESCE(e->>'manufacturer','')) LIKE '%MANN%'
    )
  `);
  console.log(`LD con manufacturer=MANN explícito: ${withMann.rows[0].cnt}`);

  // 3. Sample of LD WITHOUT mann in oem_codes - what do they have?
  console.log('\n--- Muestra LD sin MANN en oem_codes ---');
  const withoutMann = await pool.query(`
    SELECT sku, filter_type, oem_codes
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
      AND oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
      AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(oem_codes) e
        WHERE UPPER(COALESCE(e->>'manufacturer','')) LIKE '%MANN%'
      )
    LIMIT 10
  `);
  withoutMann.rows.forEach(r => {
    const codes = (r.oem_codes || []).slice(0, 3);
    console.log(`  ${r.sku} (${r.filter_type}):`);
    codes.forEach(c => console.log(`    ${JSON.stringify(c)}`));
  });

  // 4. Check if 'codigo_base' field exists and what it contains for LD
  console.log('\n--- codigo_base en LD (primeros 10) ---');
  const codigoBase = await pool.query(`
    SELECT sku, filter_type, codigo_base, oem_codes
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
    LIMIT 10
  `);
  codigoBase.rows.forEach(r => {
    console.log(`  ${r.sku} | codigo_base=${r.codigo_base}`);
  });

  // 5. What columns exist in the table?
  console.log('\n--- Todas las columnas de elimfilters_catalog ---');
  const cols = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'elimfilters_catalog'
    ORDER BY ordinal_position
  `);
  cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  // 6. Sample full row for one LD product to see ALL fields
  console.log('\n--- Fila completa de un LD (EL31003) ---');
  const fullRow = await pool.query(`SELECT * FROM elimfilters_catalog WHERE sku = 'EL31003'`);
  if (fullRow.rows.length > 0) {
    const row = fullRow.rows[0];
    Object.entries(row).forEach(([k, v]) => {
      const val = typeof v === 'object' ? JSON.stringify(v).substring(0, 80) : String(v || '').substring(0, 80);
      if (val && val !== 'null' && val !== '[]' && val !== '{}') {
        console.log(`  ${k}: ${val}`);
      }
    });
  } else {
    console.log('  EL31003 no encontrado, buscando cualquier EL3...');
    const anyLD = await pool.query(`SELECT * FROM elimfilters_catalog WHERE sku LIKE 'EL3%' LIMIT 1`);
    if (anyLD.rows.length > 0) {
      const row = anyLD.rows[0];
      Object.entries(row).forEach(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v).substring(0, 80) : String(v || '').substring(0, 80);
        if (val && val !== 'null' && val !== '[]' && val !== '{}') {
          console.log(`  ${k}: ${val}`);
        }
      });
    }
  }

  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
