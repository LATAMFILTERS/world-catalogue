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

async function processInterchange() {
    const client = new MongoClient(process.env.MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB\n');
        
        const db = client.db('elimfilters');
        const superMaestro = db.collection('SUPER_MAESTRO_INTELLIGENT_2026');
        const origen = db.collection('INTERCHANGE_FINAL');
        
        const total = await origen.countDocuments();
        
        if (total === 0) {
            console.log('⏭️  INTERCHANGE_FINAL ya procesada\n');
            await client.close();
            return;
        }
        
        console.log(`📦 Procesando INTERCHANGE_FINAL: ${total} documentos...`);
        
        let procesados = 0;
        let guardados = 0;
        let batch = [];
        let idsABorrar = [];
        
        while (true) {
            const docs = await origen.find().limit(7500).toArray();
            
            if (docs.length === 0) {
                console.log(`  ✅ INTERCHANGE_FINAL COMPLETADA`);
                break;
            }
            
            for (const doc of docs) {
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
                    'Duty': 'LD',
                    'Status': 'CONSOLIDADO_2026',
                    'Source': 'INTERCHANGE_FINAL',
                    'Created': new Date()
                };
                
                batch.push(nuevoDoc);
                idsABorrar.push(doc._id);
            }
            
            if (batch.length > 0) {
                try {
                    const result = await superMaestro.insertMany(batch, { ordered: false });
                    guardados += result.insertedCount;
                } catch (err) {
                    if (err.code === 11000 && err.result?.nInserted) {
                        guardados += err.result.nInserted;
                    }
                }
                
                await origen.deleteMany({ _id: { $in: idsABorrar } });
                
                batch = [];
                idsABorrar = [];
            }
            
            if (procesados % 15000 === 0) {
                const restantes = await origen.countDocuments();
                console.log(`  ✅ ${procesados}/${total} | ${restantes} restantes`);
            }
        }
        
        const restantes = await origen.countDocuments();
        if (restantes === 0) {
            await origen.drop();
            console.log(`  🗑️  INTERCHANGE_FINAL ELIMINADA\n`);
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ CONSOLIDACIÓN COMPLETA`);
        console.log(`📊 Procesados: ${procesados}`);
        console.log(`💾 Guardados: ${guardados}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const finalCount = await superMaestro.countDocuments();
        console.log(`📈 SUPER_MAESTRO TOTAL: ${finalCount} documentos`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

processInterchange();
