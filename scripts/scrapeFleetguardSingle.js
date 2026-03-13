#!/usr/bin/env node

/**
 * 🔍 SCRAPER DE UN SOLO PRODUCTO
 *
 * Extrae TODO de LF14000NN para verificar que funciona
 * Si funciona, se aplica a los 19 restantes
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SKU = 'LF14000NN';
const BASE_URL = 'https://www.fleetguard.com/product';

class SingleProductScraper {
  constructor() {
    this.browser = null;
  }

  async init() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  🔍 SCRAPER DE PRODUCTO ÚNICO - ' + SKU + '             ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    try {
      console.log('🚀 Iniciando navegador...');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
      });
      console.log('✅ Navegador listo\n');
    } catch (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  }

  async scrape() {
    const page = await this.browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    try {
      const url = `${BASE_URL}/${SKU}`;
      console.log(`📄 Navegando a: ${url}\n`);

      await page.goto(url, { waitUntil: 'networkidle2' });
      console.log('⏳ Esperando 7 segundos para carga completa...');
      await new Promise(resolve => setTimeout(resolve, 7000));

      // Extraer datos
      console.log('🔍 Extrayendo datos...\n');
      const data = await page.evaluate(() => {
        const allText = document.body.innerText || '';

        return {
          sku: null,
          name: null,
          description: null,
          specifications: {},
          relatedProducts: {},
          images: [],
          fullText: allText.substring(0, 2000) // Primeros 2000 caracteres
        };
      });

      // Procesar datos
      const skuMatch = data.fullText.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);
      data.sku = skuMatch ? skuMatch[1] : SKU;

      const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
      data.name = h1 || `Fleetguard ${SKU}`;

      const firstP = await page.$eval('p', el => el.textContent.trim()).catch(() => null);
      data.description = firstP ? firstP.substring(0, 300) : '';

      // Especificaciones de tablas
      const specs = await page.evaluate(() => {
        const result = {};
        const tables = document.querySelectorAll('table');

        tables.forEach(table => {
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length >= 2) {
              const key = cells[0].textContent.trim();
              const val = cells[1].textContent.trim();
              if (key && val) {
                result[key] = val;
              }
            }
          });
        });

        return result;
      });

      data.specifications = specs;

      // Imágenes
      const imgs = await page.$$eval('img', elements =>
        elements
          .map(img => img.getAttribute('src') || img.getAttribute('data-src'))
          .filter(src => src && src.length > 10)
      );

      data.images = imgs;

      // Related Products
      const related = await page.evaluate(() => {
        const text = document.body.innerText;
        const result = {};
        const keywords = ['Replaces', 'For Upgrade', 'Related Products'];

        keywords.forEach(kw => {
          const idx = text.indexOf(kw);
          if (idx !== -1) {
            const section = text.substring(idx, idx + 500);
            const matches = section.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/g) || [];
            matches.forEach(sku => {
              if (sku !== 'LF14000NN' && !result[sku]) {
                result[sku] = `Related from ${kw}`;
              }
            });
          }
        });

        return result;
      });

      data.relatedProducts = related;

      await page.close();
      return data;

    } catch (err) {
      console.error(`❌ Error:`, err.message);
      await page.close();
      process.exit(1);
    }
  }

  async save(data) {
    const dir = './scrape_reports';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `fleetguard-single-${SKU}-${Date.now()}.json`;
    const filepath = path.join(dir, filename);

    const output = {
      timestamp: new Date().toISOString(),
      sku: data.sku,
      name: data.name,
      description: data.description,
      specifications: data.specifications,
      relatedProducts: data.relatedProducts,
      images: data.images,
      url: `https://www.fleetguard.com/product/${SKU}`
    };

    fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
    return filepath;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const scraper = new SingleProductScraper();

  try {
    await scraper.init();
    const data = await scraper.scrape();
    const filepath = await scraper.save(data);

    console.log('\n════════════════════════════════════════════════════');
    console.log('✅ DATOS EXTRAÍDOS DE ' + SKU);
    console.log('════════════════════════════════════════════════════\n');

    console.log(`📍 SKU: ${data.sku}`);
    console.log(`📝 Nombre: ${data.name}\n`);

    if (data.description) {
      console.log(`📄 Descripción: ${data.description.substring(0, 150)}...\n`);
    }

    console.log(`📊 Especificaciones encontradas: ${Object.keys(data.specifications).length}`);
    if (Object.keys(data.specifications).length > 0) {
      console.log('   Ejemplos:');
      Object.entries(data.specifications).slice(0, 5).forEach(([key, val]) => {
        console.log(`   • ${key}: ${val}`);
      });
      console.log();
    }

    console.log(`🔗 Productos relacionados: ${Object.keys(data.relatedProducts).length}`);
    if (Object.keys(data.relatedProducts).length > 0) {
      Object.entries(data.relatedProducts).slice(0, 5).forEach(([sku, info]) => {
        console.log(`   • ${sku}: ${info}`);
      });
      console.log();
    }

    console.log(`📷 Imágenes encontradas: ${data.images.length}`);
    if (data.images.length > 0) {
      console.log(`   Primeras 2:`);
      data.images.slice(0, 2).forEach(img => {
        console.log(`   • ${img.substring(0, 80)}...`);
      });
      console.log();
    }

    console.log('════════════════════════════════════════════════════');
    console.log(`💾 Guardado en: ${filepath}\n`);

    console.log('✨ SI LOS DATOS SON CORRECTOS:');
    console.log('   Ejecuta: node scripts/scrapeFleetguardComplete.js');
    console.log('   Eso scrappará los 20 productos con el mismo método.\n');

  } catch (err) {
    console.error('Error fatal:', err);
  } finally {
    await scraper.close();
    process.exit(0);
  }
}

main();
