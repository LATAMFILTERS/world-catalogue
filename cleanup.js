const { MongoClient } = require('mongodb');
const config = require('./modules/config');

async function cleanupCollections() {
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  console.log('ELIMINANDO COLECCIONES INNECESARIAS...');
  console.log('='.repeat(70));
  
  const collectionsToDelete = [
    'WIX_IMPORT_PILOT',
    'FLEETGUARD_IMPORT_PILOT',
    'DONALDSON_IMPORT_PILOT',
    'CROSS_REFERENCE_MASTER'
  ];
  
  for (const colName of collectionsToDelete) {
    try {
      await db.collection(colName).drop();
      console.log('ELIMINADO:', colName);
    } catch (err) {
      console.log('ERROR:', colName, '-', err.message);
    }
  }
  
  console.log('\nCOLECCIONES RESTANTES:');
  const remaining = await db.listCollections().toArray();
  remaining.forEach(col => {
    console.log('  -', col.name);
  });
  
  await client.close();
  console.log('\nLIMPIEZA COMPLETADA');
}

cleanupCollections().catch(console.error);
