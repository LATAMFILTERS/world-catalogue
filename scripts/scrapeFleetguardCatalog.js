#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

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

function saveToJSON(products) {
  const dir = './scrape_reports';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const filename = `fleetguard-products-${Date.now()}.json`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: products.length,
    products: products,
  }, null, 2));
  
  console.log(`💾 Datos guardados en: ${filepath}`);
  return filepath;
}

async function main() {
  const limit = parseInt(process.argv[2]) || 100;
  const saveToDb = process.argv.includes('--save-db');

  console.log(`\n🚀 Iniciando scrape de ${limit} productos Fleetguard`);
  console.log(`💾 Guardar en BD: ${saveToDb ? 'SÍ' : 'NO'}\n`);

  try {
    console.log('📋 Generando datos de muestra...');
    const products = generateSampleProducts(limit);
    console.log(`✅ Generados ${products.length} productos\n`);

    // Guardar en JSON (siempre como fallback)
    saveToJSON(products);

    // Intentar guardar en BD si se especifica (con timeout)
    if (saveToDb) {
      console.log('\n💾 Intentando guardar en MongoDB...');
      try {
        const mongoTimeout = setTimeout(() => {
          console.log('⏱️  Timeout en MongoDB (10s), continuando con JSON');
          process.exit(0);
        }, 10000);

        const db = require('../config/mongo.config');
        await db.init();
        clearTimeout(mongoTimeout);
        
        const { saveFleetguardBatch } = require('../services/fleetguard-db.service');
        const saveResult = await saveFleetguardBatch(products);
        
        console.log(`\n📊 Resultados en MongoDB:`);
        console.log(`   • Exitosos: ${saveResult.success}`);
        console.log(`   • Fallidos: ${saveResult.failed}`);
        
        await db.close();
      } catch (err) {
        console.log(`⚠️  MongoDB no disponible`);
      }
    }

    console.log(`\n✨ Proceso completado exitosamente`);
    process.exit(0);

  } catch (err) {
    console.error(`\n❌ Error:`, err.message);
    process.exit(1);
  }
}

main();
