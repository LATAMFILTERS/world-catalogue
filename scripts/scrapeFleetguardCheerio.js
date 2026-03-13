#!/usr/bin/env node

require('dotenv').config();
const { FleetguardCheerioScraper } = require('../services/fleetguard-catalog-cheerio.scraper');
const dbService = require('../services/fleetguard-db.service');
const db = require('../config/mongo.config');

/**
 * Script para scraping con Cheerio (sin Chromium)
 *
 * Uso:
 *   node scrapeFleetguardCheerio.js [maxPages] [--save-db]
 *
 * Nota: OEM Cross Reference requiere Puppeteer/Chromium
 */

async function main() {
  const args = process.argv.slice(2);
  const maxPages = parseInt(args[0]) || 2;
  const saveToDb = args.includes('--save-db');

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   FLEETGUARD CATALOG SCRAPER (CHEERIO) - v1.0             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n⚙️  Configuración:`);
  console.log(`  • Máximo páginas: ${maxPages}`);
  console.log(`  • Guardar en MongoDB: ${saveToDb ? 'SÍ' : 'NO'}`);
  console.log(`  • Método: Cheerio (HTML estático)`);
  console.log(`  • Timestamp: ${new Date().toISOString()}\n`);

  const scraper = new FleetguardCheerioScraper();

  try {
    console.log('🚀 Iniciando scraping...\n');
    const report = await scraper.scrapeCatalog(maxPages);

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN DE SCRAPING                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Estado: ${report.summary.status}`);
    console.log(`📊 Productos extraídos: ${report.statistics.total_products_extracted}`);
    console.log(`📄 Páginas procesadas: ${report.statistics.total_pages_scraped}`);
    console.log(`❌ Errores: ${report.statistics.total_errors}`);
    console.log(`⏱️  Duración: ${report.duration_seconds}s`);

    console.log(`\n⚠️  Nota: ${report.note}`);

    if (saveToDb) {
      console.log('\n🔄 Guardando en MongoDB...');
      await db.init();
      const dbResults = await dbService.saveFleetguardBatch(scraper.products);

      console.log('\n📊 Resultados de MongoDB:');
      console.log(`  • Insertados: ${dbResults.upserted}`);
      console.log(`  • Actualizados: ${dbResults.success - dbResults.upserted}`);
      console.log(`  • Fallidos: ${dbResults.failed}`);

      const stats = await dbService.getFleetguardStats();
      console.log('\n📈 Estadísticas finales:');
      console.log(`  • Total en base de datos: ${stats.total_products}`);

      await db.close();
    }

    if (scraper.products.length > 0) {
      console.log('\n📋 Muestra de primer producto:');
      const sample = scraper.products[0];
      console.log(`  SKU: ${sample.sku}`);
      console.log(`  Nombre: ${sample.name}`);
      console.log(`  Especificaciones: ${Object.keys(sample.specifications || {}).length}`);
      console.log(`  Partes relacionadas: ${Object.keys(sample.related_parts || {}).length}`);
    }

    console.log('\n✨ ¡Scraping completado exitosamente!\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ ERROR CRÍTICO:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
