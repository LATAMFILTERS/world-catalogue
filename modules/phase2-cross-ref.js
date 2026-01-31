const { MongoClient } = require('mongodb');

async function execute(config, logger) {
  logger.info('═══════════════════════════════════════════');
  logger.info('FASE 2: CREAR CROSS REFERENCE MASTER');
  logger.info('═══════════════════════════════════════════\n');
  
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  const stats = {
    total_relationships: 0,
    unique_codes: 0
  };
  
  try {
    const crossRefCollection = db.collection(config.COLLECTIONS.CROSS_REF);
    await crossRefCollection.deleteMany({});
    
    logger.info('Procesando WIX cross-references...');
    const wixData = await db.collection(config.COLLECTIONS.WIX_IMPORT).find().toArray();
    
    const relationships = [];
    for (const row of wixData) {
      if (row.Código_Fabricante && row.Código_WIX) {
        relationships.push({
          oem_code: String(row.Código_Fabricante).trim(),
          filter_code: String(row.Código_WIX).trim(),
          manufacturer: String(row.Marca || 'UNKNOWN').trim(),
          source: 'WIX',
          created_at: new Date()
        });
      }
    }
    
    logger.info('Procesando Fleetguard cross-references...');
    const fleetguardData = await db.collection(config.COLLECTIONS.FLEETGUARD_IMPORT).find().toArray();
    
    for (const row of fleetguardData) {
      if (row.Competitor_Part && row.Fleetguard_Part) {
        relationships.push({
          oem_code: String(row.Competitor_Part).trim(),
          filter_code: String(row.Fleetguard_Part).trim(),
          manufacturer: String(row.Manufacturer_Code || 'UNKNOWN').trim(),
          source: 'FLEETGUARD',
          created_at: new Date()
        });
      }
    }
    
    logger.info('Procesando Donaldson cross-references...');
    const donaldsonData = await db.collection(config.COLLECTIONS.DONALDSON_IMPORT).find().toArray();
    
    for (const row of donaldsonData) {
      if (row.Manufacturer_Part && row.Donaldson_Part) {
        relationships.push({
          oem_code: String(row.Manufacturer_Part).trim(),
          filter_code: String(row.Donaldson_Part).trim(),
          manufacturer: String(row.Manufacturer_Code || 'UNKNOWN').trim(),
          source: 'DONALDSON',
          created_at: new Date()
        });
      }
    }
    
    logger.info(`Total relaciones encontradas: ${relationships.length}`);
    
    if (relationships.length > 0) {
      await crossRefCollection.insertMany(relationships);
      logger.success(`✅ ${relationships.length} relaciones insertadas`);
    }
    
    // Crear índices
    logger.info('Creando índices...');
    await crossRefCollection.createIndex({ oem_code: 1 });
    await crossRefCollection.createIndex({ filter_code: 1 });
    await crossRefCollection.createIndex({ manufacturer: 1 });
    logger.success('✅ Índices creados');
    
    // Estadísticas
    const uniqueCodes = await crossRefCollection.distinct('filter_code');
    stats.total_relationships = relationships.length;
    stats.unique_codes = uniqueCodes.length;
    
    logger.info('\n───────────────────────────────────────────');
    logger.success('✅ FASE 2 COMPLETADA');
    logger.info(`Relaciones totales: ${stats.total_relationships}`);
    logger.info(`Códigos únicos: ${stats.unique_codes}`);
    
    return stats;
    
  } finally {
    await client.close();
  }
}

module.exports = { execute };
