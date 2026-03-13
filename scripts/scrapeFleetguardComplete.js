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
          images: []
        };

        // SKU desde el título o atributo
        const titleEl = document.querySelector('h1, [data-product-title]');
        if (titleEl) {
          const text = titleEl.textContent;
          const match = text.match(/([A-Z]{2}\d{4,6}[A-Z]{0,2})/);
          result.sku = match ? match[1] : text.trim();
          result.name = text.trim();
        }

        // Descripción
        const descEl = document.querySelector('[data-description], .description, .product-description');
        if (descEl) {
          result.description = descEl.textContent.trim().substring(0, 300);
        }

        // Especificaciones técnicas
        const specElements = document.querySelectorAll(
          '[data-spec], .specification, .spec-item, dl dt, .property'
        );
        specElements.forEach(el => {
          const label = el.textContent.trim();
          const nextEl = el.nextElementSibling;
          const value = nextEl ? nextEl.textContent.trim() : '';
          if (label && value && label.length < 50) {
            result.specifications[label] = value;
          }
        });

        // Tabla de especificaciones
        const specTable = document.querySelector('table');
        if (specTable) {
          const rows = specTable.querySelectorAll('tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length >= 2) {
              const key = cells[0].textContent.trim();
              const val = cells[1].textContent.trim();
              if (key && val) {
                result.specifications[key] = val;
              }
            }
          });
        }

        // Related Products
        const relatedSection = document.querySelector('[data-related], .related-products');
        if (relatedSection) {
          const links = relatedSection.querySelectorAll('a');
          links.forEach(link => {
            const text = link.textContent.trim();
            const href = link.getAttribute('href');
            if (text && text.length < 50) {
              result.relatedProducts[text] = href || '';
            }
          });
        }

        // Imágenes
        const imgElements = document.querySelectorAll('img[src*="fleetguard"], img[data-product]');
        imgElements.forEach(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && !result.images.includes(src)) {
            result.images.push(src);
          }
        });

        // Media type (para filtros)
        const mediaEl = document.querySelector('[data-media], .media-type');
        if (mediaEl) {
          result.media = mediaEl.textContent.trim();
        }

        // Equipment compatibility
        const equipEl = document.querySelector('[data-equipment], .equipment-list');
        if (equipEl) {
          result.equipmentInfo.raw = equipEl.textContent.trim().substring(0, 200);
        }

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
