const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkSpace() {
    const client = new MongoClient(process.env.MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB');
        
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();
        
        console.log('\n📊 BASES DE DATOS:');
        dbs.databases.forEach(db => {
            const sizeMB = (db.sizeOnDisk / 1024 / 1024).toFixed(2);
            console.log(`  ${db.name}: ${sizeMB} MB`);
        });
        
        // Ver colecciones en elimfilters
        const db = client.db('elimfilters');
        const collections = await db.listCollections().toArray();
        
        console.log('\n📁 COLECCIONES EN elimfilters:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            const stats = await db.collection(col.name).stats();
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`  ${col.name}: ${count} docs, ${sizeMB} MB`);
        }
        
    } finally {
        await client.close();
    }
}

checkSpace();
