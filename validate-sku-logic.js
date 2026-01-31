const { MongoClient } = require('mongodb');
const config = require('./modules/config');

// ✅ TABLA CORRECTA DE TECNOLOGÍAS
const TECHNOLOGY_MAP = {
  'EA1': 'MACROCORE™',
  'EA2': 'INTEKCORE™',
  'EF9': 'SYNTEPORE™',
  'ES9': 'AQUAGUARD™',
  'EL8': 'SINTRAX™',
  'EH6': 'NANOFORCE™',
  'ET9': 'AQUAGUARD™',
  'EW7': 'COOLTECH™',
  'EC1': 'MICROKAPPA™',
  'ED4': 'DRYCORE™',
  'ED3': 'BLUECLEAN™',
  'EG3': 'GASULTRA™',
  'EK5': 'DURATECH™',
  'EK3': 'DURATECH™',
  'EM9': 'MARINECLEAN™'
};

// ✅ MAPEO CORRECTO: Tipo de Filtro → Prefix
const FILTER_TYPE_TO_PREFIX = {
  'Air': 'EA1',
  'Aire': 'EA1',
  'Aire (Motor)': 'EA1',
  'Lube': 'EL8',
  'Oil': 'EL8',
  'Aceite': 'EL8',
  'Aceite (Lube)': 'EL8',
  'Fuel': 'EF9',
  'Combustible': 'EF9',
  'Combustible (Fuel)': 'EF9',
  'Hydraulic': 'EH6',
  'Hidráulico': 'EH6',
  'Coolant': 'EW7',
  'Refrigerante': 'EW7',
  'Separator': 'ES9',
  'Separador': 'ES9',
  'Separador de Agua': 'ES9'
};

async function validateSKULogic() {
  console.log('\n🔍 VALIDANDO LÓGICA DE SKU EN SUPER_MAESTRO_INTELLIGENT_2026');
  console.log('═'.repeat(70));
  
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  const collection = db.collection('SUPER_MAESTRO_INTELLIGENT_2026');
  const records = await collection.find().limit(20).toArray();
  
  console.log('\n📊 ANÁLISIS DE LÓGICA ACTUAL vs DOCUMENTACIÓN:');
  console.log('─'.repeat(70));
  
  const issues = [];
  
  records.forEach((record, idx) => {
    const inputCode = record['Input Code'];
    const currentSKU = record['ELIMFILTERS SKU'];
    const prefix = record['Prefix'];
    const filterType = record['Filter Type'];
    const technology = record['Tecnología ADN'];
    
    console.log(`\n[${idx + 1}] Input: ${inputCode}`);
    console.log(`    Current SKU: ${currentSKU}`);
    console.log(`    Filter Type: ${filterType}`);
    console.log(`    Prefix: ${prefix}`);
    console.log(`    Technology: ${technology}`);
    
    // VERIFICACIÓN 1: Prefix correcto según Filter Type
    const correctPrefix = FILTER_TYPE_TO_PREFIX[filterType];
    if (correctPrefix && prefix !== correctPrefix) {
      console.log(`    ❌ PREFIX INCORRECTO: debería ser ${correctPrefix}`);
      issues.push({
        inputCode,
        issue: 'WRONG_PREFIX',
        current: prefix,
        expected: correctPrefix
      });
    } else {
      console.log(`    ✅ Prefix correcto`);
    }
    
    // VERIFICACIÓN 2: Tecnología correcta según Prefix
    const correctTech = TECHNOLOGY_MAP[prefix];
    if (correctTech && technology !== correctTech) {
      console.log(`    ❌ TECNOLOGÍA INCORRECTA: debería ser ${correctTech}`);
      issues.push({
        inputCode,
        issue: 'WRONG_TECHNOLOGY',
        current: technology,
        expected: correctTech
      });
    } else {
      console.log(`    ✅ Tecnología correcta`);
    }
    
    // VERIFICACIÓN 3: Lógica de creación de SKU
    // Según documentación: SKU = PREFIX + últimos_4_dígitos_código_scraper
    // Pero actualmente: SKU = PREFIX + input_code
    
    const expectedSKUMethod1 = prefix + inputCode; // Método actual
    const last4 = inputCode.replace(/\D/g, '').slice(-4).padStart(4, '0');
    const expectedSKUMethod2 = prefix + last4; // Método documentado
    
    if (currentSKU === expectedSKUMethod1) {
      console.log(`    📋 SKU usa: PREFIX + INPUT_CODE (método actual)`);
    } else if (currentSKU === expectedSKUMethod2) {
      console.log(`    📋 SKU usa: PREFIX + ÚLTIMOS_4_DÍGITOS (método documentado)`);
    } else {
      console.log(`    ❌ SKU NO COINCIDE con ningún método conocido`);
      issues.push({
        inputCode,
        issue: 'SKU_FORMULA_UNKNOWN',
        current: currentSKU,
        method1: expectedSKUMethod1,
        method2: expectedSKUMethod2
      });
    }
  });
  
  // RESUMEN
  console.log('\n\n📋 RESUMEN DE VALIDACIÓN:');
  console.log('═'.repeat(70));
  console.log(`   Total registros analizados: ${records.length}`);
  console.log(`   Issues encontrados: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n⚠️  ISSUES DETECTADOS:');
    const grouped = {};
    issues.forEach(i => {
      if (!grouped[i.issue]) grouped[i.issue] = [];
      grouped[i.issue].push(i);
    });
    
    Object.entries(grouped).forEach(([type, items]) => {
      console.log(`\n   ${type}: ${items.length} casos`);
      items.slice(0, 3).forEach(item => {
        console.log(`      Input: ${item.inputCode}`);
        console.log(`      Current: ${item.current}`);
        console.log(`      Expected: ${item.expected}`);
      });
    });
  } else {
    console.log('\n✅ NO SE ENCONTRARON DISCREPANCIAS - LÓGICA CORRECTA');
  }
  
  // PREGUNTA CRÍTICA
  console.log('\n\n🎯 PREGUNTA CRÍTICA:');
  console.log('═'.repeat(70));
  console.log('\n¿Cuál es la lógica CORRECTA para crear el SKU?');
  console.log('\nOPCIÓN A (Actual en DB):');
  console.log('   SKU = PREFIX + INPUT_CODE');
  console.log('   Ejemplo: Input "50000" → SKU "EL80000"');
  console.log('\nOPCIÓN B (Según documentación):');
  console.log('   SKU = PREFIX + ÚLTIMOS_4_DÍGITOS_CÓDIGO_SCRAPER');
  console.log('   Ejemplo: Input "RE56422" → Scraper "C105004" → SKU "EA15004"');
  console.log('\n❓ ¿Cuál método debemos implementar?');
  
  await client.close();
}

validateSKULogic().catch(console.error);
