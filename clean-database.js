const { MongoClient } = require('mongodb');
const config = require('./modules/config');

async function cleanDatabase() {
  console.log('🔌 Conectando a MongoDB Atlas...');
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  console.log('\n📊 COLECCIONES ANTES DE LIMPIEZA:');
  console.log('═'.repeat(60));
  
  const collectionsBefore = await db.listCollections().toArray();
  for (const col of collectionsBefore) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`   ${col.name}: ${count} registros`);
  }
  
  console.log('\n🗑️ ELIMINANDO DATOS MOCK...');
  console.log('─'.repeat(60));
  
  // Eliminar colecciones mock
  const mockCollections = [
    'wix_filters',
    'fleetguard_filters', 
    'donaldson_filters',
    'master_unified_v5',
    'master_kits_v1',
    'processing_cache',
    'error_logs'
  ];
  
  for (const collectionName of mockCollections) {
    try {
      const exists = await db.listCollections({ name: collectionName }).hasNext();
      if (exists) {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`   ✅ ${collectionName}: ${result.deletedCount} registros eliminados`);
      } else {
        console.log(`   ⚠️  ${collectionName}: No existe`);
      }
    } catch (error) {
      console.log(`   ❌ ${collectionName}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📊 COLECCIONES DESPUÉS DE LIMPIEZA:');
  console.log('═'.repeat(60));
  
  const collectionsAfter = await db.listCollections().toArray();
  if (collectionsAfter.length === 0) {
    console.log('   ✅ Base de datos limpia (sin colecciones)');
  } else {
    for (const col of collectionsAfter) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} registros`);
    }
  }
  
  console.log('\n✅ LIMPIEZA COMPLETADA');
  console.log('═'.repeat(60));
  console.log('\n🎯 BASE DE DATOS LISTA PARA DATOS REALES');
  
  await client.close();
}

cleanDatabase().catch(console.error);
