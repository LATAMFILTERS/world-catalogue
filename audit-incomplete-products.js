const {Client} = require('pg');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

async function audit() {
  const client = new Client(dbConfig);
  try {
    console.log('Conectando a BD...');
    await client.connect();
    console.log('✓ Conectado\n');

    console.log('═'.repeat(100));
    console.log('AUDITORÍA: PRODUCTOS CON DATOS INCOMPLETOS');
    console.log('═'.repeat(100) + '\n');

    // 1. Productos principales con muchos NULLs
    console.log('1️⃣  PRODUCTOS CON CAMPOS TÉCNICOS NULL:\n');
    const incomplete = await client.query(`
      SELECT
        sku, codigo_base,
        CASE WHEN iso_test_method IS NULL THEN 'NULL' ELSE '✓' END as iso_test,
        CASE WHEN burst_pressure_psi IS NULL THEN 'NULL' ELSE '✓' END as burst_psi,
        CASE WHEN collapse_pressure_psi IS NULL THEN 'NULL' ELSE '✓' END as collapse_psi,
        CASE WHEN installation_type IS NULL THEN 'NULL' ELSE '✓' END as install_type,
        jsonb_array_length(COALESCE(oem_codes, '[]'::jsonb)) as oem_count
      FROM elimfilters_catalog
      WHERE sku LIKE 'EL%'
        AND (iso_test_method IS NULL OR burst_pressure_psi IS NULL
          OR collapse_pressure_psi IS NULL OR installation_type IS NULL)
      ORDER BY sku
      LIMIT 50
    `);

    console.log(`ENCONTRADOS: ${incomplete.rows.length} productos incompletos\n`);
    incomplete.rows.forEach(p => {
      console.log(`  ${p.sku.padEnd(10)} | ${p.codigo_base?.padEnd(15) || 'NULL'.padEnd(15)} | iso:${p.iso_test} burst:${p.burst_psi} collapse:${p.collapse_psi} install:${p.install_type} | OEM:${p.oem_count}`);
    });

    // 2. Productos que comparten OEM codes
    console.log('\n\n2️⃣  PRODUCTOS QUE COMPARTEN OEM CODES:\n');
    const shared = await client.query(`
      SELECT
        e1.sku as main_sku,
        e1.codigo_base as main_codigo,
        e2.sku as alt_sku,
        e2.codigo_base as alt_codigo,
        COUNT(*) as shared_codes
      FROM elimfilters_catalog e1
      JOIN elimfilters_catalog e2 ON
        e1.sku != e2.sku AND
        e1.sku LIKE 'EL%' AND
        e2.sku LIKE 'EL%'
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(e1.oem_codes) as e1_code
        JOIN jsonb_array_elements(e2.oem_codes) as e2_code ON
          e1_code->>'code' = e2_code->>'code'
      )
      GROUP BY e1.sku, e1.codigo_base, e2.sku, e2.codigo_base
      HAVING COUNT(*) >= 2
      ORDER BY e1.sku, shared_codes DESC
      LIMIT 30
    `);

    console.log(`ENCONTRADAS: ${shared.rows.length} pares de productos con OEM codes compartidos\n`);
    shared.rows.forEach(p => {
      console.log(`  ${p.main_sku.padEnd(10)} (${p.main_codigo?.padEnd(12) || 'NULL'}) ↔ ${p.alt_sku.padEnd(10)} (${p.alt_codigo?.padEnd(12) || 'NULL'}) → ${p.shared_codes} codes`);
    });

    // 3. Resumen de estadísticas
    console.log('\n\n3️⃣  ESTADÍSTICAS GENERALES:\n');
    const stats = await client.query(`
      SELECT
        COUNT(*) as total_productos,
        COUNT(CASE WHEN sku LIKE 'EL%' THEN 1 END) as el_productos,
        COUNT(CASE WHEN iso_test_method IS NULL THEN 1 END) as null_iso,
        COUNT(CASE WHEN burst_pressure_psi IS NULL THEN 1 END) as null_burst,
        COUNT(CASE WHEN collapse_pressure_psi IS NULL THEN 1 END) as null_collapse,
        COUNT(CASE WHEN installation_type IS NULL THEN 1 END) as null_install,
        AVG(jsonb_array_length(COALESCE(oem_codes, '[]'::jsonb))) as avg_oem_codes
      FROM elimfilters_catalog
    `);

    const s = stats.rows[0];
    console.log(`  Total productos: ${s.total_productos}`);
    console.log(`  Productos EL: ${s.el_productos}`);
    console.log(`  CON iso_test_method NULL: ${s.null_iso} (${((s.null_iso / s.el_productos) * 100).toFixed(1)}%)`);
    console.log(`  CON burst_pressure_psi NULL: ${s.null_burst} (${((s.null_burst / s.el_productos) * 100).toFixed(1)}%)`);
    console.log(`  CON collapse_pressure_psi NULL: ${s.null_collapse} (${((s.null_collapse / s.el_productos) * 100).toFixed(1)}%)`);
    console.log(`  CON installation_type NULL: ${s.null_install} (${((s.null_install / s.el_productos) * 100).toFixed(1)}%)`);
    console.log(`  Promedio OEM codes: ${parseFloat(s.avg_oem_codes).toFixed(2)}`);

    console.log('\n' + '═'.repeat(100));
    console.log('RECOMENDACIONES:');
    console.log('═'.repeat(100));
    console.log(`
1. TOP PRIORIDAD: ${incomplete.rows.length} productos con campos técnicos NULL
   → Buscar alternativas que compartan OEM codes
   → Mergear datos de alternativas

2. PRODUCTOS RELACIONADOS: ${shared.rows.length} pares de productos con OEM codes compartidos
   → Verificar si uno es alternativa del otro
   → Considerar mergear datos

3. DATOS CRÍTICOS FALTANTES:
   → iso_test_method: ${((s.null_iso / s.el_productos) * 100).toFixed(1)}% sin llenar
   → burst_pressure_psi: ${((s.null_burst / s.el_productos) * 100).toFixed(1)}% sin llenar
   → collapse_pressure_psi: ${((s.null_collapse / s.el_productos) * 100).toFixed(1)}% sin llenar
    `);

  } catch(e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

audit();
