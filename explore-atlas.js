const { MongoClient } = require('mongodb');

async function exploreAtlas() {
  const uri = "mongodb+srv://vabreu_db_user:Kleo2026@cluster0.vairwow.mongodb.net/?appName=Cluster0";
  const client = new MongoClient(uri);
  await client.connect();
  
  console.log('CONECTADO A MONGODB ATLAS');
  console.log('='.repeat(70));
  
  // Listar TODAS las bases de datos
  const adminDb = client.db().admin();
  const databases = await adminDb.listDatabases();
  
  console.log('\nBASES DE DATOS ENCONTRADAS:', databases.databases.length);
  console.log('-'.repeat(70));
  
  for (const dbInfo of databases.databases) {
    console.log('\nDB:', dbInfo.name);
    console.log('   Size:', (dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2), 'MB');
    
    const db = client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();
    
    console.log('   Collections:', collections.length);
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log('      -', col.name, ':', count, 'docs');
      
      if (count > 0 && count < 10000) {
        const sample = await db.collection(col.name).findOne();
        const fields = Object.keys(sample);
        console.log('         Campos:', fields.slice(0, 5).join(', '));
      }
    }
  }
  
  await client.close();
  console.log('\nEXPLORACIÓN COMPLETADA');
}

exploreAtlas().catch(console.error);
