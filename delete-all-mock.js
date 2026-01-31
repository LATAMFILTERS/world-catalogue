const { MongoClient } = require('mongodb');
const config = require('./modules/config');

async function deleteAllMockData() {
  console.log('🔌 Conectando a MongoDB Atlas...');
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  console.log('\n🗑️ ELIMINANDO TODAS LAS COLECCIONES MOCK:');
  console.log('═'.repeat(70));
  
  const collectionsToDelete = [
    'WIX_IMPORT_PILOT',
    'FLEETGUARD_IMPORT_PILOT',
    'DONALDSON_IMPORT_PILOT',
    'SUPER_MAESTRO_INTELLIGENT_2026',
    'CROSS_REFERENCE_MASTER',
    'master_unified_v5',
    'master_kits_v1',
    'processing_cache',
    'error_logs'
  ];
  
  let totalDeleted = 0;
  
  for (const collName of collectionsToDelete) {
    try {
      const exists = await db.listCollections({ name: collName }).hasNext();
      
      if (exists) {
        const count = await db.collection(collName).countDocuments();
        const result = await db.collection(collName).deleteMany({});
        console.log(`   ✅ ${collName}: ${result.deletedCount} registros eliminados`);
        totalDeleted += result.deletedCount;
      } else {
        console.log(`   ⚠️  ${collName}: No existe`);
      }
    } catch (error) {
      console.log(`   ❌ ${collName}: Error - ${error.message}`);
    }
  }
  
  console.log('\n═'.repeat(70));
  console.log(`\n📊 TOTAL ELIMINADO: ${totalDeleted} registros`);
  
  // Verificar que quedó limpio
  console.log('\n🔍 VERIFICANDO LIMPIEZA:');
  console.log('─'.repeat(70));
  
  const collections = await db.listCollections().toArray();
  
  if (collections.length === 0) {
    console.log('✅ BASE DE DATOS COMPLETAMENTE LIMPIA');
  } else {
    console.log(`⚠️  Colecciones restantes: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
  }
  
  await client.close();
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         ✅ BASE DE DATOS LIMPIA Y LISTA               ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  console.log('\n🎯 PRÓXIMO PASO: IMPORTAR SUPERCATALOGO ELIMFILTERS REAL');
}

deleteAllMockData().catch(console.error);
