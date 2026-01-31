const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('elimfilters');
    
    console.log('\n🔍 BÚSQUEDA COMPLETA DEL CÓDIGO 51792:\n');
    
    // Buscar en Cross Reference
    const inCrossRef = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026')
        .findOne({ 'Cross Reference (AI)': '51792' });
    
    if (inCrossRef) {
        console.log('✅ ENCONTRADO en Cross Reference:');
        console.log('  SKU: ' + inCrossRef['ELIMFILTERS SKU']);
        console.log('  Master Code: ' + inCrossRef['Master Code']);
        console.log('  Source: ' + inCrossRef.Source);
        console.log('  OEM Codes: ' + JSON.stringify(inCrossRef['OEM Codes (AH)']));
        console.log('  Cross Ref: ' + JSON.stringify(inCrossRef['Cross Reference (AI)']));
    }
    
    // Buscar en OEM Codes
    const inOEM = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026')
        .findOne({ 'OEM Codes (AH)': '51792' });
    
    if (inOEM) {
        console.log('\n✅ ENCONTRADO en OEM Codes:');
        console.log('  SKU: ' + inOEM['ELIMFILTERS SKU']);
        console.log('  Master Code: ' + inOEM['Master Code']);
    }
    
    if (!inCrossRef && !inOEM) {
        console.log('❌ 51792 NO encontrado en ningún lado');
        console.log('\nBuscando documentos de WIX...');
        const wixDocs = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026')
            .find({ Source: 'WIX_MASTER_INTERCHANGE_FINAL' })
            .limit(3)
            .toArray();
        
        console.log('\nMuestra de 3 documentos WIX:');
        wixDocs.forEach((doc, i) => {
            console.log('\n  Doc ' + (i+1) + ':');
            console.log('    SKU: ' + doc['ELIMFILTERS SKU']);
            console.log('    Master: ' + doc['Master Code']);
            console.log('    OEM: ' + JSON.stringify(doc['OEM Codes (AH)']));
            console.log('    Cross: ' + JSON.stringify(doc['Cross Reference (AI)']));
        });
    }
    
    console.log('\n\n📊 ESTADÍSTICAS SUPER_MAESTRO:\n');
    const total = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026').countDocuments();
    console.log('Total documentos: ' + total);
    
    const bySource = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026')
        .aggregate([
            { $group: { _id: '$Source', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
    
    console.log('\nPor fuente:');
    bySource.forEach(s => console.log('  ' + s._id + ': ' + s.count));
    
    await client.close();
})();
