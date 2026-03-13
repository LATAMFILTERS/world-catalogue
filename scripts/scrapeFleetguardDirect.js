#!/usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE';

async function scrapeWithSystemChromium() {
  let browser;
  try {
    console.log('\n🚀 Iniciando scrape con Chromium del sistema...');
    
    // Usar chromium del sistema
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-web-resources',
        '--disable-extensions'
      ]
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    console.log(`📄 Navegando a: ${BASE_URL}`);
    await page.goto(BASE_URL, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('⏳ Esperando carga de productos...');
    
    // Esperar a que cargue contenido
    await page.waitForTimeout(3000);

    // Extraer datos de la página
    const products = await page.evaluate(() => {
      const items = [];
      
      // Buscar todos los elementos que contengan productos
      document.querySelectorAll('a, div, span').forEach(el => {
        const text = el.textContent?.trim() || '';
        const href = el.getAttribute('href') || '';
        
        // Buscar patrones SKU: LF14000NN, FF1098, etc.
        const skuMatch = text.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);
        
        if (skuMatch && text.length < 100) {
          const sku = skuMatch[1];
          
          // Evitar duplicados
          if (!items.find(i => i.sku === sku)) {
            items.push({
              sku: sku,
              name: text,
              href: href,
              rawText: text.substring(0, 100)
            });
          }
          
          if (items.length >= 30) return; // Buscar 30 para asegurar 20 únicos
        }
      });
      
      return items;
    });

    await browser.close();

    console.log(`✅ Datos extraídos. Encontrados ${products.length} productos\n`);
    return products;

  } catch (err) {
    if (browser) await browser.close();
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

async function saveResults(products) {
  const dir = './scrape_reports';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filtered = products
    .filter((p, i, arr) => arr.findIndex(x => x.sku === p.sku) === i)
    .slice(0, 20)
    .map((p, i) => ({
      index: i + 1,
      sku: p.sku,
      name: p.name,
      productUrl: p.href.startsWith('http') ? p.href : `https://www.fleetguard.com${p.href}`
    }));

  const filename = `fleetguard-real-page1-${Date.now()}.json`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, JSON.stringify({
    timestamp: new Date().toISOString(),
    page: 'Page 1',
    url: BASE_URL,
    total: filtered.length,
    products: filtered,
  }, null, 2));

  console.log(`💾 Guardado en: ${filepath}\n`);
  return filtered;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('🔍 SCRAPER REAL FLEETGUARD - PÁGINA 1 (Sistema Chromium)');
  console.log('═'.repeat(60));

  const products = await scrapeWithSystemChromium();
  const filtered = await saveResults(products);

  console.log(`✅ ${filtered.length} productos únicos extraídos:\n`);
  filtered.forEach(p => {
    console.log(`   ${p.index}. ${p.sku} - ${p.name}`);
  });

  console.log('\n✨ Proceso completado exitosamente');
  process.exit(0);
}

main();
