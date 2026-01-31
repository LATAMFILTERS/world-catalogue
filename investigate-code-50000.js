const { MongoClient } = require('mongodb');
const config = require('./modules/config');

async function investigateCode50000() {
  console.log('\n📊 INVESTIGACIÓN DETALLADA: CÓDIGO 50000');
  console.log('═'.repeat(70));
  
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  // 1. Buscar en SUPER_MAESTRO_INTELLIGENT_2026
  console.log('\n1️⃣ BUSCANDO EN SUPER_MAESTRO_INTELLIGENT_2026:');
  console.log('─'.repeat(70));
  
  const maestro = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026')
    .findOne({ 'Input Code': '50000' });
  
  if (maestro) {
    console.log('✅ ENCONTRADO:');
    console.log(JSON.stringify(maestro, null, 2));
    
    console.log('\n📋 ANÁLISIS DEL CÓDIGO:');
    console.log(`   Input Code: ${maestro['Input Code']}`);
    console.log(`   ELIMFILTERS SKU: ${maestro['ELIMFILTERS SKU']}`);
    console.log(`   Source: ${maestro['Source']?.join(', ') || 'N/A'}`);
    console.log(`   Scraper Source: ${maestro['Scraper Source']}`);
    console.log(`   Status: ${maestro['Status']}`);
    console.log(`   OEM Codes: ${maestro['OEM Codes (AH)']?.join(', ') || 'Ninguno'}`);
    console.log(`   Cross References: ${maestro['Cross Reference (AI)']?.join(', ') || 'Ninguno'}`);
  }
  
  // 2. Buscar en otras colecciones
  console.log('\n\n2️⃣ BUSCANDO EN OTRAS COLECCIONES:');
  console.log('─'.repeat(70));
  
  const collections = [
    'WIX_IMPORT_PILOT',
    'FLEETGUARD_IMPORT_PILOT',
    'DONALDSON_IMPORT_PILOT',
    'CROSS_REFERENCE_MASTER'
  ];
  
  for (const collName of collections) {
    try {
      const result = await db.collection(collName).findOne({
        $or: [
          { 'Input Code': '50000' },
          { 'input_code': '50000' },
          { 'code': '50000' },
          { 'manufacturer_code': '50000' },
          { 'oem_code': '50000' },
          { 'OEM Codes (AH)': '50000' },
          { 'Cross Reference (AI)': '50000' }
        ]
      });
      
      if (result) {
        console.log(`\n✅ ENCONTRADO EN ${collName}:`);
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n❌ No encontrado en ${collName}`);
      }
    } catch (err) {
      console.log(`\n⚠️  Error buscando en ${collName}: ${err.message}`);
    }
  }
  
  // 3. Analizar el patrón del código
  console.log('\n\n3️⃣ ANÁLISIS DEL PATRÓN:');
  console.log('─'.repeat(70));
  
  console.log('\n🔍 CÓDIGO: 50000');
  console.log('   Formato: 5 dígitos numéricos');
  console.log('   Rango: 50000-50999 (probable rango de códigos mock)');
  
  // Verificar si hay códigos reales OEM en el sistema
  console.log('\n\n4️⃣ COMPARACIÓN CON CÓDIGOS OEM REALES:');
  console.log('─'.repeat(70));
  
  const realOEMPatterns = {
    'John Deere': /^RE\d{5}$|^AR\d{5}$|^AT\d{5}$/,
    'Caterpillar': /^\d{1}R-\d{4}$/,
    'Cummins': /^[A-Z]{2}\d{5}$/,
    'Komatsu': /^\d{3}-\d{2}-\d{5}$/,
    'Case IH': /^\d{8,10}$/,
    'Donaldson': /^[A-Z]\d{6}$/,
    'Fleetguard': /^[A-Z]{2}\d{4,5}$/,
    'Baldwin': /^[A-Z]{2}\d{4}$/,
    'WIX': /^\d{5}$/,
    'FRAM': /^[A-Z]{2}\d{5}$/
  };
  
  console.log('📋 PATRONES DE CÓDIGOS OEM CONOCIDOS:');
  let matches = [];
  Object.entries(realOEMPatterns).forEach(([brand, pattern]) => {
    const isMatch = pattern.test('50000');
    console.log(`   ${brand}: ${pattern} → ${isMatch ? '✅ COINCIDE' : '❌ NO COINCIDE'}`);
    if (isMatch) matches.push(brand);
  });
  
  if (matches.length > 0) {
    console.log(`\n⚠️  El código "50000" coincide con patrones de: ${matches.join(', ')}`);
    console.log('   Podría ser un código WIX real o un código mock simulando WIX');
  } else {
    console.log('\n❌ El código "50000" NO coincide con patrones OEM conocidos');
  }
  
  // 5. Conclusión
  console.log('\n\n📋 CONCLUSIÓN:');
  console.log('═'.repeat(70));
  
  if (maestro && maestro['Status'] === 'PILOT_2026') {
    console.log('✅ CÓDIGO 50000 ES UN CÓDIGO MOCK/SIMULADO');
    console.log('   Propósito: Testing/Piloto del sistema');
    console.log('   Fuente: Datos generados para pruebas');
    console.log('   NO ES un código OEM real de ningún fabricante');
    console.log('\n   Los códigos 50000-50999 son placeholders que simulan:');
    console.log('   - Códigos que serían obtenidos de scrapers Donaldson/FRAM');
    console.log('   - Estructura de datos real sin usar códigos OEM verdaderos');
  } else {
    console.log('⚠️  VERIFICAR MANUALMENTE');
    console.log('   El código podría ser real, revisar documentación fuente');
  }
  
  await client.close();
}

investigateCode50000().catch(console.error);
