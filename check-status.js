const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('elimfilters');
    
    console.log('\n📊 ESTADO ACTUAL DE TODAS LAS COLECCIONES:\n');
    
    // SUPER_MAESTRO
    const superCount = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026').countDocuments();
    console.log('✅ SUPER_MAESTRO: ' + superCount + ' documentos\n');
    
    // Por fuente
    const bySource = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026')
        .aggregate([
            { $group: { _id: '$Source', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
    
    console.log('Por fuente:');
    bySource.forEach(s => console.log('  ' + s._id + ': ' + s.count));
    
    console.log('\n\n📦 COLECCIONES _FINAL RESTANTES:\n');
    
    // Colecciones restantes
    const colsToCheck = [
        'DONALDSON_FINAL',
        'BALDWIN_PDF_2016_FINAL',
        'WIX_MASTER_INTERCHANGE_FINAL',
        'MANN_FILTER_HD_FINAL',
        'FLEETGUARD_FINAL',
        'RACOR_PARFIT_FINAL',
        'INTERCHANGE_FINAL'
    ];
    
    for (const col of colsToCheck) {
        try {
            const count = await db.collection(col).countDocuments();
            console.log('  ' + col + ': ' + count + ' docs ' + (count === 0 ? '✅ PROCESADA' : '⏳ PENDIENTE'));
        } catch(e) {
            console.log('  ' + col + ': NO EXISTE ✅');
        }
    }
    
    console.log('\n\n🔍 MUESTRA DE DOCUMENTO EN SUPER_MAESTRO:\n');
    const sample = await db.collection('SUPER_MAESTRO_INTELLIGENT_2026').findOne();
    if (sample) {
        console.log('Campos guardados (' + Object.keys(sample).length + ' campos):');
        Object.keys(sample).forEach(k => console.log('  - ' + k));
    }
    
    await client.close();
})();
