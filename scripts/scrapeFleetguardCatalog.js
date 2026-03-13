#!/usr/bin/env node

const db = require('../config/mongo.config');
require('dotenv').config();

// Generar productos de muestra basados en SKU
function generateSampleProducts(count) {
  const products = [];
  const prefixes = ['LF', 'FF', 'AF', 'WF'];
  
  for (let i = 0; i < count; i++) {
    const prefix = prefixes[i % prefixes.length];
    const num = Math.floor(1000 + (i * 100) % 9000);
    const sku = `${prefix}${num}`;
    
    products.push({
      sku: sku,
      name: `${prefix} Filter ${sku}`,
      description: `High-quality ${prefix} filter for heavy-duty applications`,
      specifications: {
        'Type': prefix === 'LF' ? 'Lube' : prefix === 'FF' ? 'Fuel' : prefix === 'AF' ? 'Air' : 'Water',
        'Thread Size': 'Standard'
      },
      imageUrl: `https://cdn.fleetguard.com/${sku}.jpg`,
      productUrl: `https://fleetguard.com/product/${sku}`,
      oem_cross_reference: [],
      equipment_compatibility: [],
      maintenance_kits: [],
      related_parts: {}
    });
  }
  
  return products;
}

async function main() {
  const limit = parseInt(process.argv[2]) || 100;
  const saveToDb = process.argv.includes('--save-db');
  const useSample = process.argv.includes('--sample');

  console.log(`\n🚀 Iniciando scrape de ${limit} productos Fleetguard`);
  console.log(`💾 Guardar en BD: ${saveToDb ? 'SÍ' : 'NO'}`);
  console.log(`📋 Modo: ${useSample ? 'MUESTRA' : 'EN VIVO'}\n`);

  try {
    let products = [];

    if (useSample) {
      console.log('📋 Generando datos de muestra...');
      products = generateSampleProducts(limit);
      console.log(`✅ Generados ${products.length} productos de muestra`);
    } else {
      // Aquí iría el scraper real
      const { FleetguardCheerioScraper } = require('../services/fleetguard-catalog-cheerio.scraper');
      const scraper = new FleetguardCheerioScraper();
      console.log('📥 Descargando catálogo...');
      const pages = Math.ceil(limit / 20);
      const report = await scraper.scrapeCatalog(pages);
      products = scraper.products || [];
      console.log(`✅ Descargados ${products.length} productos`);
    }

    // Guardar en BD si se especifica
    if (saveToDb && products.length > 0) {
      console.log('\n💾 Conectando a MongoDB...');
      await db.init();
      
      const { saveFleetguardBatch } = require('../services/fleetguard-db.service');
      const saveResult = await saveFleetguardBatch(products);
      
      console.log(`\n📊 Resultados de guardado:`);
      console.log(`   • Exitosos: ${saveResult.success}`);
      console.log(`   • Fallidos: ${saveResult.failed}`);
      console.log(`   • Nuevos: ${saveResult.upserted}`);
    } else if (products.length > 0) {
      console.log(`\n📦 Primer producto de muestra:`);
      console.log(JSON.stringify(products[0], null, 2));
    }

    console.log(`\n✨ Proceso completado exitosamente`);
    process.exit(0);

  } catch (err) {
    console.error(`\n❌ Error:`, err.message);
    console.error(err.stack);
    process.exit(1);

  } finally {
    try {
      await db.close();
    } catch (e) {
      // Silent
    }
  }
}

main();
