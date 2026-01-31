const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('elimfilters');
    
    console.log('\n🗑️  INICIANDO RESET DE BASE DE DATOS...\n');
    
    try {
        await db.collection('SUPER_MAESTRO_INTELLIGENT_2026').drop();
        console.log('✅ SUPER_MAESTRO_INTELLIGENT_2026 eliminada');
        console.log('   Liberados ~180 MB\n');
    } catch(e) {
        console.log('⚠️  SUPER_MAESTRO_INTELLIGENT_2026 no existe o ya fue borrada\n');
    }
    
    console.log('📊 ESTADO ACTUAL:\n');
    
    const collections = await db.listCollections().toArray();
    console.log('Colecciones restantes: ' + collections.length);
    
    let totalDocs = 0;
    for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        totalDocs += count;
        if (count > 0) {
            console.log('  - ' + col.name + ': ' + count + ' docs');
        }
    }
    
    console.log('\nTotal documentos: ' + totalDocs);
    console.log('\n✅ BASE DE DATOS LISTA PARA CONSOLIDACIÓN CORRECTA\n');
    
    await client.close();
})();
