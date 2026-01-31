const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('elimfilters');
    
    // Ver todas las colecciones
    const collections = await db.listCollections().toArray();
    const collNames = collections.map(c => c.name);
    
    console.log('\n📊 COLECCIONES DISPONIBLES:\n');
    collNames.forEach(name => console.log('  - ' + name));
    
    // Buscar el ejemplo 51792
    console.log('\n\n🔍 BUSCANDO 51792 EN SUPER_MAESTRO:\n');
    const wixDoc = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026')
        .findOne({ 'Master Code': '51792' });
    
    if (wixDoc) {
        console.log('Encontrado:');
        console.log('  SKU: ' + wixDoc['ELIMFILTERS SKU']);
        console.log('  Master Code: ' + wixDoc['Master Code']);
        console.log('  OEM Codes: ' + JSON.stringify(wixDoc['OEM Codes (AH)']));
        console.log('  Cross Ref: ' + JSON.stringify(wixDoc['Cross Reference (AI)']));
    } else {
        console.log('No encontrado con Master Code 51792');
    }
    
    // Ver si hay datos de cross-reference
    console.log('\n\n🔍 VERIFICANDO TABLAS DE CROSS-REFERENCE:\n');
    
    const hasInterchange = collNames.includes('INTERCHANGE_FINAL');
    console.log('INTERCHANGE_FINAL: ' + (hasInterchange ? 'Existe' : 'No existe'));
    
    if (hasInterchange) {
        const count = await db.collection('INTERCHANGE_FINAL').countDocuments();
        console.log('  Documentos: ' + count);
        
        if (count > 0) {
            const sample = await db.collection('INTERCHANGE_FINAL').findOne();
            console.log('  Campos: ' + Object.keys(sample).join(', '));
        }
    }
    
    await client.close();
})();
