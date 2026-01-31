const { MongoClient } = require('mongodb');
const config = require('./modules/config');

async function cleanEverything() {
  console.log('🔌 Conectando a MongoDB Atlas...');
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  console.log('\n📊 ESTADO ANTES DE LIMPIEZA:');
  console.log('═'.repeat(70));
  
  const collectionsBefore = await db.listCollections().toArray();
  let totalBefore = 0;
  
  for (const col of collectionsBefore) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`   ${col.name}: ${count} registros`);
    totalBefore += count;
  }
  
  console.log(`\n   📊 TOTAL: ${totalBefore} registros en ${collectionsBefore.length} colecciones`);
  
  console.log('\n\n🗑️ ELIMINANDO TODO:');
  console.log('═'.repeat(70));
  
  let totalDeleted = 0;
  
  for (const col of collectionsBefore) {
    try {
      const result = await db.collection(col.name).deleteMany({});
      console.log(`   ✅ ${col.name}: ${result.deletedCount} registros eliminados`);
      totalDeleted += result.deletedCount;
    } catch (error) {
      console.log(`   ❌ ${col.name}: Error - ${error.message}`);
    }
  }
  
  console.log('\n═'.repeat(70));
  console.log(`📊 TOTAL ELIMINADO: ${totalDeleted} registros`);
  
  // Verificación final
  console.log('\n\n🔍 VERIFICACIÓN FINAL:');
  console.log('═'.repeat(70));
  
  const collectionsAfter = await db.listCollections().toArray();
  
  if (collectionsAfter.length === 0) {
    console.log('✅ BASE DE DATOS COMPLETAMENTE LIMPIA');
    console.log('   No hay colecciones');
  } else {
    let hasData = false;
    for (const col of collectionsAfter) {
      const count = await db.collection(col.name).countDocuments();
      if (count > 0) {
        console.log(`   ⚠️  ${col.name}: ${count} registros (NO ELIMINADOS)`);
        hasData = true;
      }
    }
    if (!hasData) {
      console.log('✅ TODAS LAS COLECCIONES VACÍAS');
    }
  }
  
  await client.close();
  
  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║    ✅ LIMPIEZA COMPLETADA - BASE DE DATOS LISTA         ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

cleanEverything().catch(console.error);
