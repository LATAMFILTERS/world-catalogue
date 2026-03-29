const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb+srv://elimfilters_db_admin:Elim2026@cluster0.dll4jew.mongodb.net/ELIMFILTERS_DB?appName=Cluster0&retryWrites=true&w=majority';
const SCRAPE_DIR = 'E:\\ELIMFILTERS\\world-catalogue\\world-catalogue\\data\\donaldson_full_scrape';
const MISSING_FILE = 'C:\\Users\\VICTOR ABREU\\world-catalogue\\missing_skus.json';
const BATCH_SIZE = 50;

function cleanCode(code) {
    if (!code) return '';
    return code.toString().split('\t')[0].split('\n')[0].trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '');
}

function parseAttributes(attrs) {
    const result = {};
    if (!attrs) return result;
    for (const [key, val] of Object.entries(attrs)) {
        const k = key.toLowerCase();
        const v = String(val || '');
        if (k.includes('longitud') || k.includes('length')) {
            const mm = v.match(/(\d+[\.,]?\d*)\s*MM/i);
            const inch = v.match(/(\d+[\.,]?\d*)\s*(Pulgadas|inch)/i);
            if (mm) result.height_mm = parseFloat(mm[1]);
            if (inch) result.height_inch = parseFloat(inch[1]);
        }
        if (k.includes('exterior') || k.includes('outer')) {
            const mm = v.match(/(\d+[\.,]?\d*)\s*MM/i);
            const inch = v.match(/(\d+[\.,]?\d*)\s*(Pulgadas|inch)/i);
            if (mm) result.outer_diameter_mm = parseFloat(mm[1]);
            if (inch) result.outer_diameter_inch = parseFloat(inch[1]);
        }
        if (k.includes('rosca') || k.includes('thread')) {
            result.thread_size = v.split('(')[0].trim();
        }
    }
    return result;
}

function buildDocument(data) {
    const sku = data.sku.toUpperCase();
    const specs = parseAttributes(data.attributes);
    const crossRefs = (data.crossReferences || []).map(c => ({
        manufacturer: c.brand || c.manufacturer || 'UNKNOWN',
        code: c.code || c.partNumber || ''
    })).filter(c => c.code);
    const equipment = (data.equipment || []).map(e => ({
        machine: e.machine || e.model || '',
        engine: e.engine || ''
    }));

    return {
        'ELIMFILTERS SKU': null,
        elimfilters_sku: null,
        base_code: sku,
        'OEM Codes': sku,
        description: data.description || sku,
        filter_type: null,
        subtype: null,
        elimfilters_technology: null,
        marketing_narrative: null,
        thread_size: specs.thread_size || null,
        height_mm: specs.height_mm || null,
        height_inch: specs.height_inch || null,
        outer_diameter_mm: specs.outer_diameter_mm || null,
        outer_diameter_inch: specs.outer_diameter_inch || null,
        inner_diameter_mm: null,
        inner_diameter_inch: null,
        gasket_od_mm: null,
        gasket_od_inch: null,
        gasket_id_mm: null,
        gasket_id_inch: null,
        iso_test_method: null,
        micron_rating: null,
        beta_ratio: null,
        nominal_efficiency: null,
        max_pressure_psi: null,
        burst_pressure_psi: null,
        collapse_pressure_psi: null,
        bypass_valve_pressure_psi: null,
        anti_drainback_valve: null,
        oem_codes: [{ manufacturer: 'DONALDSON', code: sku }],
        competitor_codes: crossRefs,
        'Cross Reference Codes': crossRefs.map(c => c.code).join(' '),
        applications: equipment,
        source: 'donaldson_scrape',
        imported_at: new Date().toISOString()
    };
}

async function main() {
    // 1. Limpiar y deduplicar SKUs
    console.log('Leyendo missing_skus.json...');
    const raw = JSON.parse(fs.readFileSync(MISSING_FILE, 'utf8'));
    const cleanSkus = [...new Set(
        raw.map(s => cleanCode(s)).filter(s => s && s.length >= 4)
    )];
    console.log(`SKUs únicos limpios: ${cleanSkus.length}`);

    // 2. Conectar MongoDB
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    const collection = mongoose.connection.db.collection('unified_filters');

    // 3. Obtener cuáles ya existen en MongoDB
    const existing = await collection.distinct('base_code');
    const existingSet = new Set(existing.map(c => String(c).toUpperCase()));
    const toImport = cleanSkus.filter(s => !existingSet.has(s));
    console.log(`Ya en MongoDB: ${cleanSkus.length - toImport.length}`);
    console.log(`A importar: ${toImport.length}`);

    // 4. Importar por lotes
    let imported = 0, notFound = 0, errors = 0;

    for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
        const batch = toImport.slice(i, i + BATCH_SIZE);
        const ops = [];

        for (const sku of batch) {
            const filePath = path.join(SCRAPE_DIR, `${sku}.json`);
            if (!fs.existsSync(filePath)) {
                notFound++;
                continue;
            }
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const doc = buildDocument(data);
                ops.push({
                    updateOne: {
                        filter: { base_code: sku },
                        update: { $setOnInsert: doc },
                        upsert: true
                    }
                });
            } catch (e) {
                errors++;
            }
        }

        if (ops.length > 0) {
            await collection.bulkWrite(ops);
            imported += ops.length;
        }

        const pct = Math.round((i / toImport.length) * 100);
        process.stdout.write(`\r Progreso: ${pct}% | Importados: ${imported} | Sin archivo: ${notFound}`);
    }

    console.log(`\n\n=============================`);
    console.log(`IMPORTACIÓN COMPLETADA`);
    console.log(`=============================`);
    console.log(`Importados:     ${imported}`);
    console.log(`Sin archivo:    ${notFound}`);
    console.log(`Errores:        ${errors}`);
    console.log(`=============================`);

    await mongoose.disconnect();
}

main().catch(console.error);
