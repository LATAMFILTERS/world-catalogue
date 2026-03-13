#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const FLEETGUARD_BASE = 'https://www.fleetguard.com';
const CATALOG_URL = `${FLEETGUARD_BASE}/category/products/0ZGPl0000000F8j4AE`;
const REPORT_DIR = './scrape_reports';

class FleetguardProductionScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.products = [];
    this.errors = [];
  }

  async init() {
    console.log('🔧 Inicializando Puppeteer...');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
      });
      this.page = await this.browser.newPage();
      this.page.setDefaultNavigationTimeout(45000);
      console.log('✅ Puppeteer iniciado correctamente\n');
    } catch (err) {
      console.error('❌ Error al iniciar Puppeteer:', err.message);
      throw err;
    }
  }

  async getProductLinks(pageNum) {
    try {
      const url = `${CATALOG_URL}?page=${pageNum}`;
      console.log(`📄 Extrayendo enlaces de página ${pageNum}...`);

      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

      const links = await this.page.evaluate(() => {
        const productLinks = [];
        document.querySelectorAll('a[href*="/product/"]').forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('/product/') && !productLinks.includes(href)) {
            const fullUrl = href.startsWith('http') ? href : `https://www.fleetguard.com${href}`;
            productLinks.push(fullUrl);
          }
        });
        return [...new Set(productLinks)];
      });

      console.log(`  ✅ ${links.length} productos encontrados en página ${pageNum}\n`);
      return links;
    } catch (err) {
      console.error(`  ❌ Error en página ${pageNum}: ${err.message}\n`);
      this.errors.push({ page: pageNum, error: err.message });
      return [];
    }
  }

  async extractProductData(productUrl) {
    try {
      await this.page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 45000 });

      const data = await this.page.evaluate(() => {
        const product = {};

        // SKU - del título o URL
        const h1 = document.querySelector('h1');
        const titleText = h1 ? h1.innerText.trim() : '';
        const skuMatch = titleText.match(/([A-Z]{2}\d+[A-Z]{0,2})/);
        product.sku = skuMatch ? skuMatch[1] : 'UNKNOWN';
        product.name = titleText;

        // Descripción completa
        product.description = '';
        const descElements = document.querySelectorAll('p');
        descElements.forEach((el, idx) => {
          if (idx < 3) {
            const text = el.innerText.trim();
            if (text.length > 30 && !text.includes('log in')) {
              product.description += text + ' ';
            }
          }
        });
        product.description = product.description.trim().substring(0, 1000);

        // ESPECIFICACIONES - Extraer TODOS los campos
        product.specifications = {};

        // 1. Tablas de especificaciones
        document.querySelectorAll('table tr').forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const key = cells[0].innerText.trim();
            const value = cells[1].innerText.trim();
            if (key && value && key.length < 100 && !key.includes('Related')) {
              product.specifications[key] = value;
            }
          }
        });

        // 2. Divs con especificaciones (formato: "Label: Value")
        document.querySelectorAll('[class*="spec"], [class*="detail"], [class*="property"]').forEach(el => {
          const text = el.innerText.trim();
          if (text.includes(':') && !text.includes('Related')) {
            const [key, ...valueParts] = text.split(':');
            const cleanKey = key.trim();
            const cleanValue = valueParts.join(':').trim();
            if (cleanKey && cleanValue && cleanKey.length < 100) {
              product.specifications[cleanKey] = cleanValue;
            }
          }
        });

        // 3. Campos de datos individuales
        document.querySelectorAll('[data-test], [data-qa]').forEach(el => {
          const label = el.querySelector('label, .label, [class*="label"]');
          const value = el.querySelector('span, .value, [class*="value"]');
          if (label && value) {
            const key = label.innerText.trim();
            const val = value.innerText.trim();
            if (key && val && key.length < 100) {
              product.specifications[key] = val;
            }
          }
        });

        // Imagen URL
        const img = document.querySelector('img[alt*="Fleetguard"], img.product-image, picture img');
        product.imageUrl = img ? img.src : null;

        // URL del producto
        product.productUrl = window.location.href;

        return product;
      });

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async scrapePages(pageCount) {
    console.log(`\n🚀 INICIANDO SCRAPE FLEETGUARD - PRODUCCIÓN`);
    console.log(`📊 Páginas a scrapear: ${pageCount}`);
    console.log(`🔗 Base URL: ${CATALOG_URL}\n`);

    await this.init();

    try {
      for (let p = 1; p <= pageCount; p++) {
        const links = await this.getProductLinks(p);

        for (const link of links) {
          try {
            const sku = link.split('/product/')[1] || 'unknown';
            console.log(`  📦 Extrayendo: ${sku}`);

            const result = await this.extractProductData(link);

            if (result.success) {
              this.products.push(result.data);
              console.log(`     ✅ ${result.data.sku} - ${Object.keys(result.data.specifications).length} campos\n`);
            } else {
              this.errors.push({ sku, error: result.error });
              console.log(`     ❌ Error: ${result.error}\n`);
            }

            // Rate limiting
            await new Promise(r => setTimeout(r, 800));
          } catch (err) {
            console.error(`     ❌ Excepción: ${err.message}\n`);
            this.errors.push({ link, error: err.message });
          }
        }

        if (p < pageCount) {
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      return this.generateReport();
    } finally {
      if (this.browser) await this.browser.close();
    }
  }

  generateReport() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 REPORTE FINAL DE SCRAPING');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Productos extraídos: ${this.products.length}`);
    console.log(`❌ Errores encontrados: ${this.errors.length}`);
    console.log(`${'='.repeat(60)}\n`);

    // Guardar datos
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const dataFile = path.join(REPORT_DIR, `fleetguard-catalog-${timestamp}.json`);
    const reportFile = path.join(REPORT_DIR, `fleetguard-report-${timestamp}.json`);

    // Guardar datos completos
    fs.writeFileSync(dataFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalProducts: this.products.length,
      products: this.products
    }, null, 2));

    // Guardar reporte
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalScraped: this.products.length,
        totalErrors: this.errors.length,
        averageFieldsPerProduct: this.products.length > 0
          ? Math.round(
              this.products.reduce((sum, p) => sum + Object.keys(p.specifications).length, 0) /
              this.products.length
            )
          : 0
      },
      sample: this.products[0],
      errors: this.errors.slice(0, 10)
    }, null, 2));

    console.log(`💾 Datos guardados: ${dataFile}`);
    console.log(`📄 Reporte guardado: ${reportFile}\n`);

    return { success: true, dataFile, reportFile };
  }
}

async function main() {
  const pageCount = parseInt(process.argv[2]) || 1;

  if (pageCount > 500) {
    console.error('❌ Máximo 500 páginas permitidas');
    process.exit(1);
  }

  try {
    const scraper = new FleetguardProductionScraper();
    await scraper.scrapePages(pageCount);
    console.log('✨ Scraping completado exitosamente\n');
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ ERROR CRÍTICO: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
