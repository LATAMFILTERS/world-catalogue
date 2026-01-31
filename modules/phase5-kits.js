const { MongoClient } = require('mongodb');
const config = require('./config');

async function generarSKUKit(filtrosIncluidos, duty, kitsCollection) {
  const prefix = duty === 'HD' ? config.PREFIXES.HD_KIT : config.PREFIXES.LD_KIT;
  
  // Jerarquía de prioridad
  const jerarquia = ['Lube', 'Fuel', 'Air', 'Hydraulic', 'Cabin'];
  
  for (const tipo of jerarquia) {
    const filtro = filtrosIncluidos.find(f => f['Filter Type'] === tipo);
    
    if (!filtro) continue;
    
    const skuFiltro = filtro['ELIMFILTERS SKU'];
    const last4 = skuFiltro.slice(-4);
    const kitSKU = prefix + last4;
    
    // Verificar si existe
    const existe = await kitsCollection.findOne({ kit_sku: kitSKU });
    
    if (!existe) {
      return { kitSKU, usedFilter: tipo };
    }
  }
  
  // Fallback
  const oil = filtrosIncluidos.find(f => f['Filter Type'] === 'Lube');
  const fuel = filtrosIncluidos.find(f => f['Filter Type'] === 'Fuel');
  
  if (oil && fuel) {
    const oil2 = oil['ELIMFILTERS SKU'].slice(-2);
    const fuel2 = fuel['ELIMFILTERS SKU'].slice(-2);
    return { kitSKU: prefix + oil2 + fuel2, usedFilter: 'Oil+Fuel' };
  }
  
  // Último recurso
  return { 
    kitSKU: prefix + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    usedFilter: 'Random'
  };
}

function detectarIndustria(equipoNombre) {
  const texto = equipoNombre.toLowerCase();
  
  if (texto.includes('caterpillar') || texto.includes('cat ') || texto.includes('komatsu')) {
    return 'Construction';
  }
  if (texto.includes('john deere') || texto.includes('case') || texto.includes('new holland')) {
    return 'Agriculture';
  }
  if (texto.includes('volvo') || texto.includes('mack') || texto.includes('cummins')) {
    return 'Truck';
  }
  if (texto.includes('ford') || texto.includes('toyota') || texto.includes('honda')) {
    return 'Automotive';
  }
  
  return 'Industrial';
}

async function execute(config, logger) {
  logger.info('═══════════════════════════════════════════');
  logger.info('FASE 5: GENERAR KITS AUTOMÁTICAMENTE');
  logger.info('═══════════════════════════════════════════\n');
  
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  const superMaestro = db.collection(config.COLLECTIONS.SUPER_MAESTRO);
  const kitsCollection = db.collection(config.COLLECTIONS.MASTER_KITS);
  
  const stats = {
    kits_created: 0,
    kits_skipped: 0,
    filters_updated: 0
  };
  
  try {
    // Limpiar kits existentes
    await kitsCollection.deleteMany({});
    logger.info('Kits anteriores eliminados\n');
    
    // Obtener equipos únicos
    const equiposUnicos = await superMaestro.aggregate([
      { $unwind: '$Equipment Applications' },
      { $group: { _id: '$Equipment Applications' } }
    ]).toArray();
    
    logger.info(`Equipos únicos encontrados: ${equiposUnicos.length}\n`);
    
    for (let i = 0; i < equiposUnicos.length; i++) {
      const equipoNombre = equiposUnicos[i]._id;
      
      try {
        // Buscar TODOS los filtros para este equipo
        const filtrosRaw = await superMaestro.find({
          'Equipment Applications': equipoNombre
        }).toArray();
        
        if (filtrosRaw.length === 0) continue;
        
        // Agrupar por tipo
        const grupos = {
          oil: filtrosRaw.find(f => f['Filter Type'] === 'Lube'),
          airPrimary: filtrosRaw.find(f => f['Filter Type'] === 'Air'),
          fuelPrimary: filtrosRaw.find(f => f['Filter Type'] === 'Fuel'),
          hydraulic: filtrosRaw.find(f => f['Filter Type'] === 'Hydraulic'),
          cabin: filtrosRaw.find(f => f['Filter Type'] === 'Cabin')
        };
        
        // Validar mínimos (Oil + Air + Fuel)
        if (!grupos.oil || !grupos.airPrimary || !grupos.fuelPrimary) {
          stats.kits_skipped++;
          continue;
        }
        
        // Construir array de filtros incluidos
        const filtrosIncluidos = [];
        if (grupos.oil) filtrosIncluidos.push(grupos.oil);
        if (grupos.airPrimary) filtrosIncluidos.push(grupos.airPrimary);
        if (grupos.fuelPrimary) filtrosIncluidos.push(grupos.fuelPrimary);
        if (grupos.hydraulic) filtrosIncluidos.push(grupos.hydraulic);
        if (grupos.cabin) filtrosIncluidos.push(grupos.cabin);
        
        // Detectar duty
        const duty = filtrosIncluidos[0].Duty;
        
        // Generar SKU del kit
        const { kitSKU, usedFilter } = await generarSKUKit(
          filtrosIncluidos, 
          duty, 
          kitsCollection
        );
        
        // Obtener engines
        const engines = [...new Set(
          filtrosIncluidos.flatMap(f => f['Engine Applications'] || [])
        )];
        
        // Detectar industria
        const industria = detectarIndustria(equipoNombre);
        
        // Crear kit
        const kit = {
          'kit_sku': kitSKU,
          'kit_type': 'Complete Maintenance',
          'kit_series': duty === 'HD' ? 'HD-PRO' : 'LD-PLUS',
          'kit_description_en': `Complete Maintenance Kit for ${equipoNombre}`,
          
          'filters_included': filtrosIncluidos.map(f => f['ELIMFILTERS SKU']),
          
          'equipment_applications': [equipoNombre],
          'engine_applications': engines,
          'industry_segment': industria,
          
          'warranty_months': 12,
          'change_interval_km': duty === 'HD' ? 10000 : 15000,
          'change_interval_hours': duty === 'HD' ? 500 : 250,
          
          'normsku_base': kitSKU,
          'oem_kit_reference': '',
          'product_image_url': '',
          'url_technical_sheet_pdf': '',
          
          'stock_status': 'Available',
          'audit_status': 'Auto-Generated',
          'created_at': new Date(),
          'created_by': 'system_auto',
          'updated_at': null,
          'updated_by': null
        };
        
        // Guardar kit
        await kitsCollection.insertOne(kit);
        stats.kits_created++;
        
        // Actualizar filtros con referencia al kit
        const updateResult = await superMaestro.updateMany(
          { 'ELIMFILTERS SKU': { $in: kit.filters_included } },
          { $addToSet: { 'related_kits': kitSKU } }
        );
        
        stats.filters_updated += updateResult.modifiedCount;
        
        if ((i + 1) % 10 === 0) {
          logger.info(`[${i + 1}/${equiposUnicos.length}] Kit ${kitSKU} creado (${usedFilter})`);
          logger.updateProgress('phase5', i + 1, equiposUnicos.length);
        }
        
      } catch (error) {
        logger.error(`Error en equipo "${equipoNombre}": ${error.message}`);
      }
    }
    
    logger.info('\n───────────────────────────────────────────');
    logger.success('✅ FASE 5 COMPLETADA');
    logger.info(`Kits creados: ${stats.kits_created}`);
    logger.info(`Kits omitidos: ${stats.kits_skipped}`);
    logger.info(`Filtros actualizados: ${stats.filters_updated}`);
    
    return stats;
    
  } finally {
    await client.close();
  }
}

module.exports = { execute };
