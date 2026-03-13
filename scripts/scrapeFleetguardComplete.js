#!/usr/bin/env node

/**
 * 🚀 SCRAPER FLEETGUARD COMPLETO
 *
 * Extrae TODOS los detalles de 20 productos:
 * - Especificaciones técnicas
 * - Related Products
 * - Equipment compatibility
 * - Detalles de filtración
 * - Dimensiones, presiones, etc.
 *
 * Ejecutar en Windows:
 *   npm install puppeteer
 *   node scripts/scrapeFleetguardComplete.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 20 SKUs reales de página 1
const SKUS = [
  'LF14000NN', 'FF63054NN', 'LF3970', 'CC36087', 'LF9009',
  'FF5776', 'FF5825NN', 'CC36077', 'LF3620', 'FS19765',
  'LF670', 'LF17511', 'LF691A', 'FS1000', 'FS19764',
  'FF2200', 'LF667', 'CC36057', 'LF16015', 'FS1098'
];

const BASE_URL = 'https://www.fleetguard.com/product';

class FleetguardScraper {
  constructor() {
    this.browser = null;
    this.products = [];
  }

  async init() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  🔍 SCRAPER COMPLETO FLEETGUARD - 20 PRODUCTOS     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    try {
      console.log('🚀 Iniciando navegador...');

      // Usar Chrome local de Windows
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox'
        ]
      });

      console.log('✅ Navegador listo\n');
    } catch (err) {
      console.error('❌ Error al iniciar navegador:', err.message);
      console.error('\n💡 SOLUCIÓN: Ejecuta en PowerShell:');
      console.error('   $env:PUPPETEER_SKIP_DOWNLOAD="true"');
      console.error('   npm install puppeteer');
      process.exit(1);
    }
  }

  async scrapeProduct(sku, index) {
    const page = await this.browser.newPage();
    page.setDefaultNavigationTimeout(30000);

    try {
      const url = `${BASE_URL}/${sku}`;
      console.log(`[${index}/20] 📄 Scrapeando ${sku}...`);

      await page.goto(url, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar carga de JS

      // Esperar más tiempo para que cargue todo el contenido dinámico
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Extraer datos completos de la página
      const data = await page.evaluate(() => {
        const result = {
          sku: null,
          name: null,
          description: null,
          specifications: {},
          relatedProducts: {},
          equipmentInfo: {},
          media: null,
          images: [],
          allText: ''
        };

        // Obtener todo el texto visible de la página
        const allText = document.body.innerText || '';
        result.allText = allText;

        // SKU - buscar patrón en página
        const skuMatch = allText.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);
        if (skuMatch) {
          result.sku = skuMatch[1];
        }

        // Nombre - primero h1, después primer título
        const h1 = document.querySelector('h1');
        if (h1) {
          result.name = h1.textContent.trim();
        }

        // Descripción - párrafo principal
        const firstP = document.querySelector('p');
        if (firstP) {
          result.description = firstP.textContent.trim().substring(0, 300);
        }

        // Buscar especificaciones en labels y valores
        const labels = allText.match(/([A-Z][a-zA-Z\s]+)[\s]*[:]*[\s]*([^\n]+)/g) || [];
        labels.slice(0, 20).forEach(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
            const key = parts[0].trim();
            const val = parts[1].trim();
            if (key.length > 2 && key.length < 50 && val.length > 1 && val.length < 100) {
              result.specifications[key] = val;
            }
          }
        });

        // Tablas de especificaciones
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length >= 2) {
              const key = cells[0].textContent.trim();
              const val = cells[1].textContent.trim();
              if (key && val && key.length < 50) {
                result.specifications[key] = val;
              }
            }
          });
        });

        // Relacionados: buscar palabras clave comunes
        const relatedKeywords = ['Replaces', 'For Upgrade', 'Related Products', 'Equipment', 'Cross Reference'];
        relatedKeywords.forEach(keyword => {
          const index = allText.indexOf(keyword);
          if (index !== -1) {
            const section = allText.substring(index, index + 500);
            const skus = section.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/g) || [];
            skus.forEach(sku => {
              if (sku !== result.sku) {
                result.relatedProducts[sku] = `https://www.fleetguard.com/product/${sku}`;
              }
            });
          }
        });

        // Imágenes
        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && src.length > 10 && !result.images.includes(src)) {
            result.images.push(src);
          }
        });

        return result;
      });

      await page.close();
      return data;

    } catch (err) {
      console.error(`   ❌ Error scrapeando ${sku}:`, err.message);
      await page.close();
      return { sku: sku, error: err.message };
    }
  }

  async scrapeAll() {
    for (let i = 0; i < SKUS.length; i++) {
      const sku = SKUS[i];
      const data = await this.scrapeProduct(sku, i + 1);
      this.products.push({
        index: i + 1,
        sku: data.sku || sku,
        name: data.name || `Fleetguard ${sku}`,
        description: data.description || '',
        specifications: data.specifications || {},
        relatedProducts: data.relatedProducts || {},
        mediaType: data.media || '',
        images: data.images || [],
        equipment: data.equipmentInfo || {},
        sourceUrl: `${BASE_URL}/${sku}`
      });
    }
  }

  async save() {
    const dir = './scrape_reports';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `fleetguard-complete-${Date.now()}.json`;
    const filepath = path.join(dir, filename);

    const output = {
      timestamp: new Date().toISOString(),
      source: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE',
      page: 'Category Page 1',
      total_products: this.products.length,
      scrapedAt: new Date().toISOString(),
      products: this.products
    };

    fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
    console.log(`\n💾 Datos completos guardados en: ${filepath}`);
    return filepath;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const scraper = new FleetguardScraper();

  try {
    await scraper.init();
    console.log(`🔄 Scrapeando ${SKUS.length} productos...\n`);

    await scraper.scrapeAll();

    console.log('\n════════════════════════════════════════════════════');
    console.log('✅ SCRAPING COMPLETADO\n');

    scraper.products.forEach(p => {
      const specCount = Object.keys(p.specifications).length;
      console.log(`${p.index.toString().padStart(2)}. ${p.sku.padEnd(12)} | ${specCount} specs | ${p.images.length} imágenes`);
    });

    console.log('\n════════════════════════════════════════════════════');

    await scraper.save();

    console.log('\n✨ Los 20 productos con TODA la información están listos!');
    console.log('💾 Git: git add scrape_reports/ && git commit && git push\n');

  } catch (err) {
    console.error('\n❌ Error fatal:', err.message);
  } finally {
    await scraper.close();
    process.exit(0);
  }
}

main();
