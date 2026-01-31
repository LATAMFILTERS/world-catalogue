const { MongoClient } = require('mongodb');
const config = require('./modules/config');

async function findSupercatalogo() {
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  const collections = await db.listCollections().toArray();
  
  console.log('COLECCIONES:', collections.length);
  
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(col.name, ':', count, 'registros');
    
    if (count > 0) {
      const sample = await db.collection(col.name).findOne();
      console.log('CAMPOS:', Object.keys(sample).join(', '));
      console.log('SAMPLE:', JSON.stringify(sample, null, 2));
    }
  }
  
  await client.close();
}

findSupercatalogo().catch(console.error);
