const { MongoClient } = require('mongodb');
require('dotenv').config();

const ADN_MAPPING = {
    "AIRE": { prefix: "EA1", tech: "MACROCORE™" },
    "AIR": { prefix: "EA1", tech: "MACROCORE™" },
    "ACEITE": { prefix: "EL8", tech: "SINTRAX™" },
    "OIL": { prefix: "EL8", tech: "SINTRAX™" },
    "LUBE": { prefix: "EL8", tech: "SINTRAX™" },
    "FUEL": { prefix: "EF9", tech: "SYNTEPORE™" },
    "COMBUSTIBLE": { prefix: "EF9", tech: "SYNTEPORE™" },
    "HYDRAULIC": { prefix: "EH6", tech: "NANOFORCE™" },
    "HIDRAULICO": { prefix: "EH6", tech: "NANOFORCE™" },
    "CABINA": { prefix: "EC1", tech: "MICROKAPPA™" },
    "CABIN": { prefix: "EC1", tech: "MICROKAPPA™" }
};

async function consolidateCollections() {
    const client = new MongoClient(process.env.MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB\n');
        
        const db = client.db('elimfilters');
        const superMaestro = db.collection('SUPER_MAESTRO_INTELLIGENT_2026');
        
        const coleccionesOrigen = [
            'DONALDSON_FINAL',
            'BALDWIN_FINAL', 
            'WIX_FINAL',
            'MANN_FILTER_NORMAL_FINAL',
            'MANN_FILTER_HD_FINAL',
            'FLEETGUARD_FINAL',
            'RACOR_PARFIT_FINAL',
            'INTERCHANGE_FINAL'
        ];
        
        const existentes = await db.listCollections().toArray();
        const nombresExistentes = existentes.map(c => c.name);
        
        console.log('📊 COLECCIONES DISPONIBLES:');
        coleccionesOrigen.forEach(col => {
            const existe = nombresExistentes.includes(col);
            console.log(`  ${existe ? '✅' : '❌'} ${col}`);
        });
        console.log('');
        
        let totalProcesados = 0;
        let totalGuardados = 0;
        
        for (const nombreCol of coleccionesOrigen) {
            if (!nombresExistentes.includes(nombreCol)) {
                console.log(`⏭️  Saltando ${nombreCol} (no existe)\n`);
                continue;
            }
            
            const origen = db.collection(nombreCol);
            const total = await origen.countDocuments();
            
            console.log(`📦 Procesando ${nombreCol}: ${total} documentos...`);
            
            const cursor = origen.find();
            let batch = [];
            let idsABorrar = [];
            let procesados = 0;
            
            for await (const doc of cursor) {
                procesados++;
                
                const catRaw = String(doc.Category || doc.FilterType || doc.Type || 'ACEITE').toUpperCase();
                let tipo = 'ACEITE';
                
                if (catRaw.includes('AIR') || catRaw.includes('AIRE')) tipo = 'AIRE';
                if (catRaw.includes('FUEL') || catRaw.includes('COMBUSTIBLE')) tipo = 'FUEL';
                if (catRaw.includes('HYD') || catRaw.includes('HIDRA')) tipo = 'HYDRAULIC';
                if (catRaw.includes('CAB') || catRaw.includes('CABIN')) tipo = 'CABIN';
                
                const idAdn = ADN_MAPPING[tipo] || ADN_MAPPING['ACEITE'];
                
                const master = String(doc.PartNumber || doc.MasterCode || doc.Code || '0000');
                const cleanCode = master.replace(/[^0-9]/g, '');
                const last4 = cleanCode.length >= 4 ? cleanCode.slice(-4) : master.slice(-4).padStart(4, '0');
                const skuFinal = idAdn.prefix + last4;
                
                const nuevoDoc = {
                    'ELIMFILTERS SKU': skuFinal,
                    'Master Code': master,
                    'Tecnología ADN': idAdn.tech,
                    'OEM Codes (AH)': doc.OEM_Numbers || doc.OEM_Codes || doc.OEM || [],
                    'Cross Reference (AI)': doc.Interchange || doc.Cross_Ref || doc.CrossReferences || [],
                    'Alternative Products (AJ)': doc.Alternatives || doc.AlternativeProducts || [],
                    'Duty': nombreCol.includes('HD') || nombreCol.includes('DONALDSON') || nombreCol.includes('FLEETGUARD') ? 'HD' : 'LD',
                    'Status': 'CONSOLIDADO_2026',
                    'Source': nombreCol,
                    'Created': new Date()
                };
                
                batch.push(nuevoDoc);
                idsABorrar.push(doc._id);
                
                if (batch.length >= 500) {
                    try {
                        await superMaestro.insertMany(batch, { ordered: false });
                        await origen.deleteMany({ _id: { $in: idsABorrar } });
                        totalGuardados += batch.length;
                        console.log(`  ✅ Guardados ${totalGuardados}/${total}...`);
                    } catch (err) {
                        console.log(`  ⚠️  Algunos duplicados ignorados`);
                    }
                    batch = [];
                    idsABorrar = [];
                }
            }
            
            if (batch.length > 0) {
                try {
                    await superMaestro.insertMany(batch, { ordered: false });
                    await origen.deleteMany({ _id: { $in: idsABorrar } });
                    totalGuardados += batch.length;
                } catch (err) {
                    console.log(`  ⚠️  Algunos duplicados ignorados`);
                }
            }
            
            console.log(`  ✅ ${nombreCol} completado: ${procesados} procesados\n`);
            totalProcesados += procesados;
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ CONSOLIDACIÓN COMPLETA`);
        console.log(`📊 Total procesados: ${totalProcesados}`);
        console.log(`💾 Total guardados: ${totalGuardados}`);
        console.log(`🗄️  Colección: SUPER_MAESTRO_INTELLIGENT_2026`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const finalCount = await superMaestro.countDocuments();
        console.log(`📈 Total en SUPER_MAESTRO: ${finalCount} documentos`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

consolidateCollections();
