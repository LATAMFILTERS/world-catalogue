const { MongoClient } = require('mongodb');

async function checkData() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('elimfilters_supercatalogo');
  
  // Contar documentos
  const count = await db.collection('super_maestro').countDocuments();
  console.log(`📊 Total registros en super_maestro: ${count}`);
  
  // Obtener un registro de muestra
  const sample = await db.collection('super_maestro').findOne();
  
  // Ver columnas disponibles
  if (sample) {
    console.log('\n📋 Columnas en super_maestro:');
    const columns = Object.keys(sample);
    console.log(`Total columnas: ${columns.length}`);
    columns.forEach(key => console.log(`  ✓ ${key}`));
    
    // Verificar las 39 columnas críticas
    console.log('\n🎯 VERIFICANDO 39 COLUMNAS CRÍTICAS:');
    const criticalColumns = [
      'Input Code', 'ELIMFILTERS SKU', 'Description', 'Filter Type', 'Subtype',
      'Duty', 'Application', 'Installation Type', 'ELIMFILTERS Technology',
      'Media Type', 'Micron Rating', 'Beta Ratio', 'ISO Test Method',
      'Special Features', 'Height (mm)', 'Height (inch)', 'Outer Diameter (mm)',
      'Outer Diameter (inch)', 'Inner Diameter (mm)', 'Inner Diameter (inch)',
      'Thread Size', 'Gasket OD (mm)', 'Gasket OD (inch)', 'Gasket ID (mm)',
      'Gasket ID (inch)', 'Max Pressure (PSI)', 'Rated Flow (L/min)',
      'Rated Flow (GPM)', 'Nominal Efficiency (%)', 'Burst Pressure (PSI)',
      'Collapse Pressure (PSI)', 'Bypass Valve Pressure (PSI)', 'Pressure Valve',
      'Anti-Drainback Valve', 'Equipment Applications', 'Engine Applications',
      'Equipment Year', 'OEM Codes', 'Cross References'
    ];
    
    let found = 0;
    criticalColumns.forEach(col => {
      if (columns.includes(col)) {
        console.log(`  ✅ ${col}`);
        found++;
      } else {
        console.log(`  ❌ ${col} - FALTA`);
      }
    });
    
    console.log(`\n📊 Columnas encontradas: ${found}/39`);
  }
  
  await client.close();
}

checkData().catch(console.error);
