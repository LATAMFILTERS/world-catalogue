const { MongoClient } = require('mongodb');

async function execute(config, logger) {
  logger.info('═══════════════════════════════════════════');
  logger.info('FASE 1: IMPORTAR ARCHIVOS FUENTE (MOCK DATA)');
  logger.info('═══════════════════════════════════════════\n');
  
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  logger.success('Conectado a MongoDB');
  
  const db = client.db(config.DB_NAME);
  const stats = {
    total_imported: 0,
    files_processed: 0,
    errors: []
  };
  
  try {
    // Datos MOCK para piloto
    logger.info('\n📁 Generando datos MOCK para piloto...');
    
    // WIX Mock Data
    const wixMockData = [];
    for (let i = 0; i < config.PILOT_SIZE; i++) {
      wixMockData.push({
        Marca: i % 2 === 0 ? 'CAT' : 'JOHN DEERE',
        Código_Fabricante: `OEM${String(i).padStart(5, '0')}`,
        Código_WIX: `${50000 + i}`
      });
    }
    
    const wixCollection = db.collection(config.COLLECTIONS.WIX_IMPORT);
    await wixCollection.deleteMany({});
    await wixCollection.insertMany(wixMockData);
    logger.success(`✅ WIX Mock: ${wixMockData.length} registros`);
    stats.total_imported += wixMockData.length;
    stats.files_processed++;
    
    // Fleetguard Mock Data
    const fleetguardMockData = [];
    for (let i = 0; i < 500; i++) {
      fleetguardMockData.push({
        Competitor_Part: `COMP${String(i).padStart(5, '0')}`,
        Fleetguard_Part: `LF${4000 + i}`,
        Manufacturer_Code: i % 2 === 0 ? 'CAT' : 'CUMMINS'
      });
    }
    
    const fleetCollection = db.collection(config.COLLECTIONS.FLEETGUARD_IMPORT);
    await fleetCollection.deleteMany({});
    await fleetCollection.insertMany(fleetguardMockData);
    logger.success(`✅ Fleetguard Mock: ${fleetguardMockData.length} registros`);
    stats.total_imported += fleetguardMockData.length;
    stats.files_processed++;
    
    // Donaldson Mock Data
    const donaldsonMockData = [];
    for (let i = 0; i < 500; i++) {
      donaldsonMockData.push({
        Manufacturer_Part: `MFG${String(i).padStart(5, '0')}`,
        Donaldson_Part: `P${550000 + i}`,
        Manufacturer_Code: i % 3 === 0 ? 'VOLVO' : i % 3 === 1 ? 'MACK' : 'KOMATSU'
      });
    }
    
    const donaldsonCollection = db.collection(config.COLLECTIONS.DONALDSON_IMPORT);
    await donaldsonCollection.deleteMany({});
    await donaldsonCollection.insertMany(donaldsonMockData);
    logger.success(`✅ Donaldson Mock: ${donaldsonMockData.length} registros`);
    stats.total_imported += donaldsonMockData.length;
    stats.files_processed++;
    
    logger.info('\n───────────────────────────────────────────');
    logger.success(`✅ FASE 1 COMPLETADA (MOCK DATA)`);
    logger.info(`Archivos procesados: ${stats.files_processed}`);
    logger.info(`Total registros: ${stats.total_imported}`);
    
    return stats;
    
  } finally {
    await client.close();
  }
}

module.exports = { execute };
