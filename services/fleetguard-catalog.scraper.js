const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Scraper robusto para catálogo Fleetguard (500 páginas)
 * Extrae: SKU, nombre, descripción, especificaciones, partes relacionadas, kits
 */

const FLEETGUARD_BASE = 'https://www.fleetguard.com';
const CATALOG_URL = `${FLEETGUARD_BASE}/category/products/0ZGPl0000000F8j4AE`;
const REPORT_DIR = './scrape_reports';

// Rate limiting
const DELAY_BETWEEN_PRODUCTS = 2000; // 2 segundos entre productos
const DELAY_BETWEEN_PAGES = 3000; // 3 segundos entre páginas
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

class FleetguardCatalogScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.products = [];
    this.errors = [];
    this.startTime = null;
    this.stats = { pages: 0, products: 0, errors: 0 };
  }

  async init() {
    console.log('🔧 Inicializando Puppeteer...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    await this.page.setDefaultNavigationTimeout(TIMEOUT_MS);
    await this.page.setDefaultTimeout(TIMEOUT_MS);
    console.log('✅ Puppeteer iniciado');
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async navigateWithRetry(url, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.goto(url, { waitUntil: 'networkidle2' });
        return true;
      } catch (err) {
        console.log(`⚠️ Intento ${i + 1}/${retries} fallido para ${url}`);
        if (i === retries - 1) {
          throw err;
        }
        await this.sleep(2000 * (i + 1)); // Exponential backoff
      }
    }
  }

  async extractProductData(productUrl) {
    try {
      await this.navigateWithRetry(productUrl);

      // Esperar a que cargue el contenido principal
      await this.page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});

      const product = await this.page.evaluate(() => {
        const data = {};

        // SKU (generalmente en la URL o en el título)
        const titleMatch = document.body.innerText.match(/([A-Z]{2}\d+[A-Z]{0,2})/);
        data.sku = titleMatch ? titleMatch[1] : 'UNKNOWN';

        // Nombre/Descripción
        const h1 = document.querySelector('h1');
        data.name = h1 ? h1.innerText.trim() : '';

        // Descripción larga
        const descElements = document.querySelectorAll('p');
        data.description = '';
        descElements.forEach(el => {
          const text = el.innerText.trim();
          if (text.length > 20 && !text.includes('log in or sign up')) {
            data.description += text + ' ';
          }
        });
        data.description = data.description.trim();

        // Especificaciones - Tabla de especificaciones técnicas
        data.specifications = {};
        const tables = document.querySelectorAll('table');
        tables.forEach((table, idx) => {
          // Saltar si es tabla de related parts, equipment o kits
          const tableText = table.innerText;
          if (!tableText.includes('Related') && !tableText.includes('Equipment') &&
              !tableText.includes('Maintenance') && !tableText.includes('Part Number')) {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              const cells = row.querySelectorAll('td, th');
              if (cells.length >= 2) {
                const key = cells[0].innerText.trim();
                const value = cells[1].innerText.trim();
                if (key && value && key.length < 50) {
                  data.specifications[key] = value;
                }
              }
            });
          }
        });

        // ===== PARTES RELACIONADAS (Related Parts section) =====
        data.related_parts = {};
        const relatedPartsSection = Array.from(document.querySelectorAll('*'))
          .find(el => el.innerText.includes('Related Parts'));

        if (relatedPartsSection) {
          // Buscar estructura de filas con labels
          const rows = relatedPartsSection.querySelectorAll('[class*="row"], tr, .flex');
          rows.forEach(row => {
            const text = row.innerText;
            if (text.includes('Replaces') || text.includes('For Upgrade') || text.includes('Upgrade Of')) {
              const parts = row.querySelectorAll('a[href*="/product/"]');
              const label = text.split('\n')[0].trim();
              if (label && parts.length > 0) {
                data.related_parts[label] = Array.from(parts).map(p => p.innerText.trim());
              }
            }
          });
        }

        // ===== CROSS-REFERENCES OEM (OEM Cross Reference section) =====
        data.oem_cross_reference = [];
        const tabs = document.querySelectorAll('[role="tab"], button');
        let oemTabFound = false;

        // Buscar y hacer click en tab OEM Cross Reference
        for (const tab of tabs) {
          if (tab.innerText.includes('OEM Cross Reference')) {
            tab.click?.();
            oemTabFound = true;
            break;
          }
        }

        // Extraer tabla OEM si existe
        const oemSection = Array.from(document.querySelectorAll('*'))
          .find(el => el.innerText.includes('OEM Cross Reference'));

        if (oemSection) {
          const oemTable = oemSection.querySelector('table');
          if (oemTable) {
            const oemRows = oemTable.querySelectorAll('tbody tr');
            oemRows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 2) {
                data.oem_cross_reference.push({
                  oem_code: cells[0].innerText.trim(),
                  manufacturer: cells[1]?.innerText.trim() || '',
                  description: cells[2]?.innerText.trim() || '',
                });
              }
            });
          }
        }

        // ===== EQUIPMENT COMPATIBILITY (Equipment section) =====
        data.equipment_compatibility = [];
        const equipmentSection = Array.from(document.querySelectorAll('*'))
          .find(el => el.innerText.includes('Equipment'));

        if (equipmentSection) {
          const equipTable = equipmentSection.querySelector('table');
          if (equipTable) {
            const equipRows = equipTable.querySelectorAll('tbody tr');
            equipRows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 3) {
                data.equipment_compatibility.push({
                  equipment: cells[0].innerText.trim(),
                  engine: cells[1]?.innerText.trim() || '',
                  year: cells[2]?.innerText.trim() || '',
                  qty_req: cells[3]?.innerText.trim() || '1',
                });
              }
            });
          }
        }

        // ===== MAINTENANCE KITS (Maintenance Kits section) =====
        data.maintenance_kits = [];
        const kitsSection = Array.from(document.querySelectorAll('*'))
          .find(el => el.innerText.includes('Maintenance Kit'));

        if (kitsSection) {
          const kitsTable = kitsSection.querySelector('table');
          if (kitsTable) {
            const kitRows = kitsTable.querySelectorAll('tbody tr');
            kitRows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 2) {
                const kitSku = cells[0].querySelector('a')?.innerText.trim() || cells[0].innerText.trim();
                const partNumber = cells[1]?.querySelector('a')?.innerText.trim() || cells[1].innerText.trim();
                const qty = cells[2]?.innerText.trim() || '1';
                const family = cells[3]?.innerText.trim() || '';

                if (kitSku && partNumber) {
                  data.maintenance_kits.push({
                    maintenance_kit: kitSku,
                    part_number: partNumber,
                    quantity: qty,
                    product_family: family,
                  });
                }
              }
            });
          }
        }

        // Imagen
        const img = document.querySelector('img[alt*="Fleetguard"]') ||
                   document.querySelector('picture img') ||
                   document.querySelector('img.product-image');
        data.imageUrl = img ? img.src : null;

        // URL del producto
        data.productUrl = window.location.href;

        return data;
      });

      return product;
    } catch (err) {
      throw new Error(`Error extrayendo producto de ${productUrl}: ${err.message}`);
    }
  }

  async getProductLinks(pageNumber) {
    try {
      const url = `${CATALOG_URL}?page=${pageNumber}`;
      console.log(`📄 Navegando página ${pageNumber}...`);
      await this.navigateWithRetry(url);

      // Esperar a que carguen los productos
      await this.page.waitForSelector('a[href*="/product/"]', { timeout: 15000 }).catch(() => {});

      const links = await this.page.evaluate(() => {
        const productLinks = [];
        const anchors = document.querySelectorAll('a[href*="/product/"]');
        anchors.forEach(a => {
          const href = a.getAttribute('href');
          if (href && href.includes('/product/')) {
            // Obtener solo links únicos (primero por página)
            if (!productLinks.some(l => l.includes(href))) {
              productLinks.push(href);
            }
          }
        });
        return productLinks;
      });

      console.log(`✅ Encontrados ${links.length} productos en página ${pageNumber}`);
      return links;
    } catch (err) {
      console.error(`❌ Error en página ${pageNumber}: ${err.message}`);
      this.errors.push({ page: pageNumber, error: err.message });
      return [];
    }
  }

  async getTotalPages() {
    try {
      await this.navigateWithRetry(CATALOG_URL);

      const totalPages = await this.page.evaluate(() => {
        // Buscar el texto de paginación
        const pagination = Array.from(document.querySelectorAll('*'))
          .find(el => el.innerText.includes('Page'));

        if (pagination) {
          const match = pagination.innerText.match(/Page \d+ of (\d+)/);
          return match ? parseInt(match[1]) : 1;
        }
        return 1;
      });

      return totalPages;
    } catch (err) {
      console.error('Error obteniendo total de páginas:', err.message);
      return 1;
    }
  }

  async scrapeCatalog(maxPages = null) {
    try {
      this.startTime = Date.now();
      await this.init();

      console.log('\n🚀 Iniciando scraping de catálogo Fleetguard...');
      const totalPages = await this.getTotalPages();
      const pagesToScrape = maxPages ? Math.min(maxPages, totalPages) : totalPages;

      console.log(`📊 Total de páginas: ${totalPages} (Scrapeando ${pagesToScrape})\n`);

      for (let page = 1; page <= pagesToScrape; page++) {
        console.log(`\n--- Página ${page}/${pagesToScrape} ---`);

        try {
          const productLinks = await this.getProductLinks(page);

          for (const link of productLinks) {
            try {
              const productUrl = link.startsWith('http') ? link : `${FLEETGUARD_BASE}${link}`;
              console.log(`  📦 Extrayendo: ${productUrl.split('/product/')[1]?.substring(0, 20)}`);

              const productData = await this.extractProductData(productUrl);
              this.products.push(productData);
              this.stats.products++;

              await this.sleep(DELAY_BETWEEN_PRODUCTS);
            } catch (err) {
              console.error(`  ❌ Error en producto: ${err.message}`);
              this.errors.push({ link, error: err.message });
              this.stats.errors++;
            }
          }

          this.stats.pages++;
          if (page < pagesToScrape) {
            await this.sleep(DELAY_BETWEEN_PAGES);
          }
        } catch (err) {
          console.error(`Error procesando página ${page}: ${err.message}`);
          this.stats.errors++;
        }
      }

      return this.generateReport();
    } catch (err) {
      console.error('Error crítico en scraping:', err.message);
      throw err;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    const report = {
      timestamp: new Date().toISOString(),
      duration_seconds: parseFloat(duration),
      statistics: {
        total_pages_scraped: this.stats.pages,
        total_products_extracted: this.stats.products,
        total_errors: this.stats.errors,
      },
      products_sample: this.products.slice(0, 5),
      errors: this.errors.slice(0, 10),
      summary: {
        status: this.stats.errors === 0 ? 'SUCCESS' : 'PARTIAL',
        message: `Scrapeadas ${this.stats.products} productos de ${this.stats.pages} páginas en ${duration}s`,
      }
    };

    // Guardar reporte
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    const reportPath = path.join(REPORT_DIR, `fleetguard-scrape-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Reporte guardado en: ${reportPath}`);

    return report;
  }

  async saveToFile(filename = 'fleetguard-catalog.json') {
    const filepath = path.join(__dirname, `../${filename}`);
    fs.writeFileSync(filepath, JSON.stringify(this.products, null, 2));
    console.log(`💾 Datos guardados en: ${filepath}`);
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    const scraper = new FleetguardCatalogScraper();

    // Obtener número de páginas del argumento (default: 2 para testing)
    const maxPages = parseInt(process.argv[2]) || 2;

    try {
      const report = await scraper.scrapeCatalog(maxPages);
      await scraper.saveToFile();
      console.log('\n✅ Scraping completado');
      console.log(JSON.stringify(report.summary, null, 2));
    } catch (err) {
      console.error('\n❌ Scraping fallido:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = { FleetguardCatalogScraper };
