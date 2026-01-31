const knowledge = require('../services/knowledgeService');
const groqService = require('../services/groqService');
const donaldson = require('../scrapers/donaldsonScraper');
const framScraper = require('../scrapers/framScraper');
const skuServ = require('../services/skuService');
const mapper = require('../services/mapperService');
const Filter = require('../models/Filter');

exports.handleFilterSearch = async (req, res) => {
    const input = req.body.query || req.body.code;
    if (!input) {
        return res.status(400).json({ error: 'Query/code requerido' });
    }

    const cleanCode = input.toUpperCase().trim();
    console.log(`\n🔍 --- Nueva Búsqueda: ${cleanCode} ---`);

    try {
        // PASO 1: Buscar en caché (MongoDB)
        const cached = await Filter.findOne({
            $or: [
                { sku: cleanCode },
                { part_number: cleanCode },
                { oem_codes: cleanCode },
                { cross_references: cleanCode }
            ]
        });

        if (cached) {
            console.log('✅ ENCONTRADO EN CACHE');
            return res.json({ 
                success: true,
                source: 'CACHE', 
                sku: cached.sku,
                description: cached.description,
                duty: cached.duty,
                technology: cached.technology,
                specs: cached.specs || {},
                oem_codes: cached.oem_codes || [],
                cross_references: cached.cross_references || [],
                equipment_applications: cached.equipment_applications || [],
                related_kits: []
            });
        }

        console.log('⚠️ NO EN CACHE - INICIANDO CREACIÓN');

        // PASO 2: Clasificar duty con GROQ
        console.log('🤖 Clasificando duty con GROQ...');
        const duty = await groqService.classifyDuty(cleanCode);
        console.log(`✅ DUTY: ${duty}`);

        // PASO 3: Scraper según duty
        console.log(`🌐 Ejecutando scraper (${duty})...`);
        let scraperData;

        if (duty === 'HD') {
            scraperData = await donaldson.runDonaldsonFull(cleanCode);
        } else {
            scraperData = await framScraper.scrapeFram(cleanCode);
        }

        if (!scraperData || !scraperData.partNumber) {
            return res.status(404).json({ 
                error: `Código ${cleanCode} no encontrado en catálogos ${duty}`
            });
        }

        console.log('✅ Datos obtenidos por scraper');

        // PASO 4: Generar SKU ELIMFILTERS
        const sku = skuServ.generateElimSKU(scraperData.category || 'AIRE', scraperData.partNumber);
        const brandInfo = skuServ.getBrandInfo(scraperData.category);

        console.log(`✨ SKU generado: ${sku}`);

        // PASO 5: Mapear y guardar
        const mapped = mapper.mapToSheet(scraperData, sku, duty, cleanCode);
        
        const newFilter = await Filter.create({
            ...mapped,
            sku,
            part_number: cleanCode,
            duty,
            technology: brandInfo.tech,
            description: `${scraperData.category} Filter`,
            source_type: 'SCRAPER'
        });

        console.log(`💾 Guardado en MongoDB: ${sku}`);

        // PASO 6: Retornar
        return res.json({
            success: true,
            source: 'NEW_SCRAPE',
            sku: newFilter.sku,
            description: newFilter.description,
            duty: newFilter.duty,
            technology: newFilter.technology,
            specs: newFilter.specs || {},
            oem_codes: newFilter.oem_codes || [],
            cross_references: newFilter.cross_references || [],
            equipment_applications: newFilter.equipment_applications || [],
            related_kits: []
        });

    } catch (e) {
        console.error('❌ Error:', e.message);
        res.status(500).json({ error: e.message });
    }
};
