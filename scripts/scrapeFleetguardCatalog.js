#!/usr/bin/env node

require('dotenv').config();
const { FleetguardCatalogScraper } = require('../services/fleetguard-catalog.scraper');
const dbService = require('../services/fleetguard-db.service');
const db = require('../config/mongo.config');

/**
 * Script para scraping completo del catálogo Fleetguard
 *
 * Uso:
 *   node scrapeFleetguardCatalog.js [maxPages] [--save-db]
 *
 * Ejemplos:
 *   node scrapeFleetguardCatalog.js              # Scrape 2 páginas (test)
 *   node scrapeFleetguardCatalog.js 10           # Scrape 10 páginas
 *   node scrapeFleetguardCatalog.js 500          # Scrape todas (500 páginas)
 *   node scrapeFleetguardCatalog.js 10 --save-db # Scrape y guarda en MongoDB
 */

async function main() {
  const args = process.argv.slice(2);
  const maxPages = parseInt(args[0]) || 2;
  const saveToDb = args.includes('--save-db');

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   FLEETGUARD CATALOG SCRAPER - v1.0                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n⚙️  Configuración:`);
  console.log(`  • Máximo páginas: ${maxPages}`);
  console.log(`  • Guardar en MongoDB: ${saveToDb ? 'SÍ' : 'NO'}`);
  console.log(`  • Timestamp: ${new Date().toISOString()}\n`);

  const scraper = new FleetguardCatalogScraper();

  try {
    // Iniciar scraping
    console.log('🚀 Iniciando scraping...\n');
    const report = await scraper.scrapeCatalog(maxPages);

    // Mostrar resumen
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN DE SCRAPING                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Estado: ${report.summary.status}`);
    console.log(`📊 Productos extraídos: ${report.statistics.total_products_extracted}`);
    console.log(`📄 Páginas procesadas: ${report.statistics.total_pages_scraped}`);
    console.log(`❌ Errores: ${report.statistics.total_errors}`);
    console.log(`⏱️  Duración: ${report.duration_seconds}s`);

    // Guardar en MongoDB si se especifica
    if (saveToDb) {
      console.log('\n🔄 Guardando en MongoDB...');

      // Conectar a MongoDB
      await db.init();

      const dbResults = await dbService.saveFleetguardBatch(scraper.products);

      console.log('\n📊 Resultados de MongoDB:');
      console.log(`  • Insertados: ${dbResults.upserted}`);
      console.log(`  • Actualizados: ${dbResults.success - dbResults.upserted}`);
      console.log(`  • Fallidos: ${dbResults.failed}`);

      // Obtener estadísticas finales
      const stats = await dbService.getFleetguardStats();
      console.log('\n📈 Estadísticas finales:');
      console.log(`  • Total en base de datos: ${stats.total_products}`);
      console.log(`  • Colección: ${stats.collection}`);

      await db.close();
    }

    // Mostrar muestra de datos
    if (scraper.products.length > 0) {
      console.log('\n📋 Muestra de primer producto:');
      const sample = scraper.products[0];
      console.log(`  SKU: ${sample.sku}`);
      console.log(`  Nombre: ${sample.name}`);
      console.log(`  Especificaciones: ${Object.keys(sample.specifications || {}).length}`);
      console.log(`  Partes relacionadas: ${Object.keys(sample.relatedParts || {}).length}`);
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
