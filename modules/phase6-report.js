const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function execute(config, logger) {
  logger.info('═══════════════════════════════════════════');
  logger.info('FASE 6: GENERAR REPORTE FINAL');
  logger.info('═══════════════════════════════════════════\n');
  
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  const superMaestro = db.collection(config.COLLECTIONS.SUPER_MAESTRO);
  const kitsCollection = db.collection(config.COLLECTIONS.MASTER_KITS);
  
  try {
    // Estadísticas de filtros
    const totalFiltros = await superMaestro.countDocuments();
    
    const filtrosPorDuty = await superMaestro.aggregate([
      { $group: { _id: '$Duty', count: { $sum: 1 } } }
    ]).toArray();
    
    const filtrosPorTipo = await superMaestro.aggregate([
      { $group: { _id: '$Filter Type', count: { $sum: 1 } } }
    ]).toArray();
    
    const filtrosPorPrefijo = await superMaestro.aggregate([
      { $group: { _id: '$Prefix', count: { $sum: 1 } } }
    ]).toArray();
    
    // Estadísticas de kits
    const totalKits = await kitsCollection.countDocuments();
    
    const kitsPorSerie = await kitsCollection.aggregate([
      { $group: { _id: '$kit_series', count: { $sum: 1 } } }
    ]).toArray();
    
    const kitsPorIndustria = await kitsCollection.aggregate([
      { $group: { _id: '$industry_segment', count: { $sum: 1 } } }
    ]).toArray();
    
    // Muestras
    const sampleFiltros = await superMaestro.find().limit(5).toArray();
    const sampleKits = await kitsCollection.find().limit(3).toArray();
    
    // Construir reporte
    const reporte = {
      timestamp: new Date().toISOString(),
      mode: config.PILOT_MODE ? 'PILOTO' : 'PRODUCCIÓN',
      pilot_size: config.PILOT_SIZE,
      
      resumen: {
        total_filtros: totalFiltros,
        total_kits: totalKits,
        ratio_kit_filtro: (totalKits / totalFiltros * 100).toFixed(2) + '%'
      },
      
      filtros: {
        total: totalFiltros,
        por_duty: filtrosPorDuty,
        por_tipo: filtrosPorTipo,
        por_prefijo: filtrosPorPrefijo,
        muestra: sampleFiltros.map(f => ({
          sku: f['ELIMFILTERS SKU'],
          master: f['Master Code'],
          duty: f.Duty,
          tipo: f['Filter Type'],
          kits: f.related_kits || []
        }))
      },
      
      kits: {
        total: totalKits,
        por_serie: kitsPorSerie,
        por_industria: kitsPorIndustria,
        muestra: sampleKits.map(k => ({
          sku: k.kit_sku,
          serie: k.kit_series,
          filtros: k.filters_included.length,
          industria: k.industry_segment
        }))
      },
      
      checkpoints: {}
    };
    
    // Cargar checkpoints
    const checkpointDir = path.join(process.cwd(), 'checkpoints');
    if (fs.existsSync(checkpointDir)) {
      const files = fs.readdirSync(checkpointDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const data = JSON.parse(
            fs.readFileSync(path.join(checkpointDir, file), 'utf8')
          );
          reporte.checkpoints[file.replace('.json', '')] = data;
        }
      }
    }
    
    // Guardar reporte
    const reportePath = path.join('logs', 'final-report.json');
    fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2));
    
    // Mostrar resumen en consola
    logger.info('\n╔════════════════════════════════════════════════════════════╗');
    logger.info('║           REPORTE FINAL - CONSOLIDACIÓN PILOTO            ║');
    logger.info('╚════════════════════════════════════════════════════════════╝\n');
    
    logger.success(`📊 FILTROS CREADOS: ${totalFiltros}`);
    logger.info('\nPor Duty:');
    filtrosPorDuty.forEach(d => logger.info(`  ${d._id}: ${d.count}`));
    
    logger.info('\nPor Tipo:');
    filtrosPorTipo.forEach(t => logger.info(`  ${t._id}: ${t.count}`));
    
    logger.info('\nPor Prefijo:');
    filtrosPorPrefijo.forEach(p => logger.info(`  ${p._id}: ${p.count}`));
    
    logger.success(`\n🎁 KITS CREADOS: ${totalKits}`);
    logger.info('\nPor Serie:');
    kitsPorSerie.forEach(s => logger.info(`  ${s._id}: ${s.count}`));
    
    logger.info('\nPor Industria:');
    kitsPorIndustria.forEach(i => logger.info(`  ${i._id}: ${i.count}`));
    
    logger.info('\n───────────────────────────────────────────');
    logger.success(`✅ Reporte guardado: ${reportePath}`);
    
    return reporte;
    
  } finally {
    await client.close();
  }
}

module.exports = { execute };
