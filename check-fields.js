const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('elimfilters');
    
    console.log('\n🔍 VERIFICANDO CAMPOS DE COLECCIONES ORIGEN:\n');
    
    // Necesitamos ver un documento de los archivos Excel originales
    // Vamos a verificar si unified_filters tiene los campos completos
    
    const unified = await db.collection('unified_filters').findOne();
    
    if (unified) {
        console.log('unified_filters tiene ' + Object.keys(unified).length + ' campos:');
        Object.keys(unified).forEach(k => console.log('  - ' + k));
    } else {
        console.log('unified_filters: No hay datos');
    }
    
    await client.close();
})();
