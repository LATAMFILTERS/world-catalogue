const { MongoClient } = require('mongodb');
const Agents = require('./agents');

async function execute(config, logger) {
  logger.info('═══════════════════════════════════════════');
  logger.info('FASE 4: CONSOLIDAR FILTROS');
  logger.info('═══════════════════════════════════════════\n');

  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);

  // Inicializar agentes
  const agents = {
    limpiador: new Agents.Agente1_Limpiador(),
    consultor: new Agents.Agente2_ConsultorMaster(db),
    promptEngineer: new Agents.Agente3_PromptEngineer(),
    bifurcador: new Agents.Agente4_Bifurcador(),
    donaldson: new Agents.Agente5_Donaldson(),
    fram: new Agents.Agente6_FRAM(),
    normalizador: new Agents.Agente7_Normalizador(),
    arquitectoSKU: new Agents.Agente8_ArquitectoSKU(),
    inyectorADN: new Agents.Agente9_InyectorADN(),
    matcherKits: new Agents.Agente10_MatcherKits(db),
    escritorMongo: new Agents.Agente11_EscritorMongo(db),
    sincronizadorSheets: new Agents.Agente12_SincronizadorSheets()
  };

  const stats = {
    processed: 0,
    created: 0,
    cached: 0,
    errors: 0
  };

  try {
    // Obtener códigos de cross-reference
    const crossRefCollection = db.collection(config.COLLECTIONS.CROSS_REF);
    const totalCodes = await crossRefCollection.countDocuments();

    logger.info(`Total códigos en cross-reference: ${totalCodes}`);
    logger.info(`Procesando en modo piloto: ${config.PILOT_SIZE} registros\n`);

    const codes = await crossRefCollection
      .find()
      .limit(config.PILOT_SIZE)
      .toArray();

    for (let i = 0; i < codes.length; i++) {
      const record = codes[i];
      const inputCode = record.filter_code;

      try {
        // AGENTE 1: Limpiar código
        const cleanCode = agents.limpiador.clean(inputCode);

        // AGENTE 2: Consultar cache
        const cached = await agents.consultor.findByCode(cleanCode);
        if (cached.hit) {
          stats.cached++;
          if ((i + 1) % 100 === 0) {
            logger.info(`[${i + 1}/${codes.length}] ${inputCode} → CACHED`);
            logger.updateProgress('phase4', i + 1, codes.length);
          }
          continue;
        }

        // AGENTE 3: Clasificar Duty
        const duty = await agents.promptEngineer.classifyDuty(cleanCode);

        // AGENTE 4: Bifurcar
        const route = agents.bifurcador.route(duty);

        // AGENTE 5 o 6: Scraper
        let scraperData;
        if (route === 'DONALDSON') {
          scraperData = await agents.donaldson.scrape(cleanCode);
        } else {
          scraperData = await agents.fram.scrape(cleanCode);
        }

        // AGENTE 7: Normalizar
        scraperData = agents.normalizador.normalize(scraperData);

        // AGENTE 8: Generar SKU
        const sku = agents.arquitectoSKU.generate(
          scraperData.partNumber,
          scraperData.category
        );

        // AGENTE 9: Inyectar ADN
        const adnInfo = agents.inyectorADN.inject(scraperData.category);

        // Construir registro completo con 39 columnas
        const filterData = {
          // SECCIÓN 1: IDENTIFICACIÓN Y CLASIFICACIÓN
          'Input Code': inputCode,
          'ELIMFILTERS SKU': sku,
          'Description': adnInfo.description,
          'Filter Type': scraperData.category,
          'Subtype': scraperData.subtype || null,
          'Duty': duty,
          'Application': adnInfo.application,
          'Installation Type': scraperData.installationType || null,
          
          // SECCIÓN 2: TECNOLOGÍA Y CARACTERÍSTICAS
          'ELIMFILTERS Technology': adnInfo.technology,
          'Media Type': adnInfo.mediaType,
          'Micron Rating': scraperData.specs['Micron Rating'] || null,
          'Beta Ratio': scraperData.specs['Beta Ratio'] || null,
          'ISO Test Method': scraperData.specs['ISO Test Method'] || null,
          'Special Features': scraperData.specs['Special Features'] || null,
          
          // SECCIÓN 3: DIMENSIONES
          'Height (mm)': scraperData.specs['Height (mm)'] || null,
          'Height (inch)': scraperData.specs['Height (inch)'] || null,
          'Outer Diameter (mm)': scraperData.specs['Outer Diameter (mm)'] || null,
          'Outer Diameter (inch)': scraperData.specs['Outer Diameter (inch)'] || null,
          'Inner Diameter (mm)': scraperData.specs['Inner Diameter (mm)'] || null,
          'Inner Diameter (inch)': scraperData.specs['Inner Diameter (inch)'] || null,
          'Thread Size': scraperData.specs['Thread Size'] || null,
          'Gasket OD (mm)': scraperData.specs['Gasket OD (mm)'] || null,
          'Gasket OD (inch)': scraperData.specs['Gasket OD (inch)'] || null,
          'Gasket ID (mm)': scraperData.specs['Gasket ID (mm)'] || null,
          'Gasket ID (inch)': scraperData.specs['Gasket ID (inch)'] || null,
          
          // SECCIÓN 4: RENDIMIENTO
          'Max Pressure (PSI)': scraperData.specs['Max Pressure (PSI)'] || null,
          'Rated Flow (L/min)': scraperData.specs['Rated Flow (L/min)'] || null,
          'Rated Flow (GPM)': scraperData.specs['Rated Flow (GPM)'] || null,
          'Nominal Efficiency (%)': scraperData.specs['Nominal Efficiency (%)'] || null,
          'Burst Pressure (PSI)': scraperData.specs['Burst Pressure (PSI)'] || null,
          'Collapse Pressure (PSI)': scraperData.specs['Collapse Pressure (PSI)'] || null,
          'Bypass Valve Pressure (PSI)': scraperData.specs['Bypass Valve Pressure (PSI)'] || null,
          
          // SECCIÓN 5: VÁLVULAS Y APLICACIONES
          'Pressure Valve': scraperData.specs['Pressure Valve'] || null,
          'Anti-Drainback Valve': scraperData.specs['Anti-Drainback Valve'] || null,
          'Equipment Applications': scraperData.equipmentApplications || [],
          'Engine Applications': scraperData.engineApplications || [],
          'Equipment Year': scraperData.equipmentYear || null,
          
          // SECCIÓN 6: REFERENCIAS
          'OEM Codes': scraperData.oemCodes || [],
          'Cross References': scraperData.crossReferences || []
        };

        // AGENTE 11: Guardar en MongoDB
        await agents.escritorMongo.save(filterData);
        
        stats.processed++;
        stats.created++;

        if ((i + 1) % 100 === 0) {
          logger.info(`[${i + 1}/${codes.length}] ${inputCode} → CREATED`);
          logger.updateProgress('phase4', i + 1, codes.length);
        }

      } catch (error) {
        stats.errors++;
        logger.error(`Error procesando ${inputCode}: ${error.message}`);
      }
    }

    logger.info('\n───────────────────────────────────────────');
    logger.info('✅ FASE 4 COMPLETADA');
    logger.info(`Procesados: ${stats.processed}`);
    logger.info(`Creados: ${stats.created}`);
    logger.info(`Cacheados: ${stats.cached}`);
    logger.info(`Errores: ${stats.errors}`);

    await client.close();
    return stats;

  } catch (error) {
    logger.error(`Error crítico en fase 4: ${error.message}`);
    throw error;
  }
}

module.exports = { execute };