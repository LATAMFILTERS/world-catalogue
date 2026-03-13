#!/usr/bin/env node

/**
 * 🚀 SCRAPER FLEETGUARD REAL
 *
 * Ejecutar en Windows:
 *   npm install puppeteer
 *   node scripts/scrapeFleetguard.windows.js
 *
 * Esto extraerá los 20 primeros productos reales de la página 1 de Fleetguard
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE';

async function scrapeFleetguard() {
  let browser;

  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  🔍 SCRAPER FLEETGUARD - PÁGINA 1 (20 PRODUCTOS)  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log('📌 URL: ' + BASE_URL);
    console.log('🚀 Iniciando navegador...\n');

    // Puppeteer detectará Chrome automáticamente en Windows
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--disable-blink-features=AutomationControlled']
    });

    const page = await browser.newPage();

    // Simular navegador real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    page.setDefaultNavigationTimeout(60000);

    console.log('📄 Navegando a Fleetguard...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    console.log('⏳ Esperando carga de productos (5 segundos)...');
    await page.waitForTimeout(5000);

    // Extraer productos
    console.log('🔍 Extrayendo datos de la página...\n');

    const products = await page.evaluate(() => {
      const items = [];
      const seen = new Set();

      // Estrategia 1: Buscar todos los textos que contengan SKUs
      const pageText = document.body.innerText;
      const skuPattern = /([A-Z]{2}\d{4,6}(?:[A-Z]{0,2}))/g;
      const skuMatches = pageText.match(skuPattern) || [];

      skuMatches.forEach(sku => {
        if (!seen.has(sku) && items.length < 20) {
          seen.add(sku);
          items.push({
            sku: sku,
            name: `Fleetguard ${sku}`,
            source: 'text_pattern'
          });
        }
      });

      // Estrategia 2: Buscar en enlaces
      document.querySelectorAll('a').forEach(link => {
        if (items.length >= 20) return;

        const text = link.innerText.trim();
        const href = link.getAttribute('href') || '';
        const match = text.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);

        if (match && !seen.has(match[1])) {
          const sku = match[1];
          seen.add(sku);
          items.push({
            sku: sku,
            name: text,
            productUrl: href.startsWith('http') ? href : `https://www.fleetguard.com${href}`,
            source: 'link'
          });
        }
      });

      // Estrategia 3: Buscar en atributos data-
      document.querySelectorAll('[data-sku], [data-product-id]').forEach(el => {
        if (items.length >= 20) return;

        const sku = el.getAttribute('data-sku') || el.getAttribute('data-product-id');
        if (sku && !seen.has(sku)) {
          seen.add(sku);
          items.push({
            sku: sku,
            name: el.innerText?.trim() || `Product ${sku}`,
            source: 'data_attribute'
          });
        }
      });

      return items.slice(0, 20);
    });

    await browser.close();

    if (products.length === 0) {
      console.error('❌ No se encontraron productos en la página');
      console.log('💡 Posibles soluciones:');
      console.log('   1. La página requiere autenticación');
      console.log('   2. El contenido está protegido por CloudFlare');
      console.log('   3. Los selectores han cambiado');
      process.exit(1);
    }

    // Guardar resultados
    const outputDir = './scrape_reports';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const filename = `fleetguard-products-${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);

    const output = {
      timestamp: timestamp,
      page: 'Category Page 1',
      url: BASE_URL,
      total_products: products.length,
      products: products.map((p, index) => ({
        index: index + 1,
        sku: p.sku,
        name: p.name,
        productUrl: p.productUrl || `https://www.fleetguard.com/product/${p.sku}`,
        extracted_from: p.source
      }))
    };

    fs.writeFileSync(filepath, JSON.stringify(output, null, 2));

    console.log('\n✅ EXTRACCIÓN COMPLETADA\n');
    console.log(`📊 Resultados:`);
    console.log(`   • Productos encontrados: ${products.length}`);
    console.log(`   • Archivo: ${filepath}`);
    console.log(`   • Timestamp: ${timestamp}\n`);

    console.log('📋 Productos extraídos:\n');
    output.products.forEach(p => {
      console.log(`   ${p.index.toString().padStart(2)}. ${p.sku.padEnd(10)} - ${p.name}`);
    });

    console.log('\n✨ Los datos están listos para usar en la aplicación');
    console.log('💾 Próximo paso: git add scrape_reports/ && git commit && git push\n');

    process.exit(0);

  } catch (error) {
    if (browser) await browser.close();
    console.error('\n❌ ERROR DURANTE SCRAPING:\n');
    console.error(error.message);
    console.error('\n💡 Soluciones posibles:');
    console.error('   1. Asegúrate que Chrome/Chromium está instalado');
    console.error('   2. npm install puppeteer --save');
    console.error('   3. Intenta abrir el sitio manualmente en tu navegador');
    process.exit(1);
  }
}

// Ejecutar
scrapeFleetguard();
