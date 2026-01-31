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
        
        // NOMBRES CORRECTOS según lo que existe
        const coleccionesOrigen = [
            'DONALDSON_FINAL',
            'BALDWIN_PDF_2016_FINAL',
            'WIX_MASTER_INTERCHANGE_FINAL',
            'MANN_FILTER_HD_FINAL',
            'FLEETGUARD_FINAL',
            'RACOR_PARFIT_FINAL',
            'INTERCHANGE_FINAL'
        ];
        
        console.log('📊 INICIANDO CONSOLIDACIÓN:\n');
        
        let totalProcesados = 0;
        let totalGuardados = 0;
        let totalErrores = 0;
        
        for (const nombreCol of coleccionesOrigen) {
            const origen = db.collection(nombreCol);
            const total = await origen.countDocuments();
            
            console.log(`📦 Procesando ${nombreCol}: ${total} documentos...`);
            
            const cursor = origen.find();
            let batch = [];
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
                
                // Reducir tamaño del lote a 100 para evitar problemas
                if (batch.length >= 100) {
                    try {
                        const result = await superMaestro.insertMany(batch, { ordered: false });
                        totalGuardados += result.insertedCount;
                        console.log(`  ✅ Guardados ${totalGuardados}/${total}...`);
                    } catch (err) {
                        if (err.code === 11000) {
                            totalErrores += (batch.length - (err.result?.nInserted || 0));
                            totalGuardados += (err.result?.nInserted || 0);
                            console.log(`  ⚠️  Algunos duplicados (${err.result?.nInserted || 0} guardados)`);
                        } else {
                            console.error(`  ❌ Error: ${err.message}`);
                            totalErrores += batch.length;
                        }
                    }
                    batch = [];
                }
            }
            
            // Guardar lote final
            if (batch.length > 0) {
                try {
                    const result = await superMaestro.insertMany(batch, { ordered: false });
                    totalGuardados += result.insertedCount;
                } catch (err) {
                    if (err.code === 11000) {
                        totalErrores += (batch.length - (err.result?.nInserted || 0));
                        totalGuardados += (err.result?.nInserted || 0);
                        console.log(`  ⚠️  Algunos duplicados (${err.result?.nInserted || 0} guardados)`);
                    } else {
                        console.error(`  ❌ Error: ${err.message}`);
                        totalErrores += batch.length;
                    }
                }
            }
            
            console.log(`  ✅ ${nombreCol} completado: ${procesados} procesados\n`);
            totalProcesados += procesados;
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ CONSOLIDACIÓN COMPLETA`);
        console.log(`📊 Total procesados: ${totalProcesados}`);
        console.log(`💾 Total guardados: ${totalGuardados}`);
        console.log(`⚠️  Total errores/duplicados: ${totalErrores}`);
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
