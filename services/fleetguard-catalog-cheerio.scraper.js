const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Scraper alternativo usando Cheerio (sin Chromium)
 * Extrae datos estáticos del HTML
 */

const FLEETGUARD_BASE = 'https://www.fleetguard.com';
const CATALOG_URL = `${FLEETGUARD_BASE}/category/products/0ZGPl0000000F8j4AE`;
const REPORT_DIR = './scrape_reports';

const DELAY_BETWEEN_PRODUCTS = 1500;
const DELAY_BETWEEN_PAGES = 2000;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 15000;

class FleetguardCheerioScraper {
  constructor() {
    this.products = [];
    this.errors = [];
    this.startTime = null;
    this.stats = { pages: 0, products: 0, errors: 0 };

    // Configurar axios con headers
    this.axios = axios.create({
      timeout: TIMEOUT_MS,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchWithRetry(url, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.axios.get(url);
        return response.data;
      } catch (err) {
        console.log(`⚠️  Intento ${i + 1}/${retries} fallido para ${url}`);
        if (i === retries - 1) throw err;
        await this.sleep(1000 * (i + 1));
      }
    }
  }

  extractProductData(html, productUrl) {
    try {
      const $ = cheerio.load(html);
      const data = {};

      // SKU - del título o URL
      const urlMatch = productUrl.match(/\/product\/([A-Z0-9]+)/);
      const h1Text = $('h1').first().text();
      const titleMatch = h1Text.match(/([A-Z]{2}\d+[A-Z]{0,2})/);

      data.sku = titleMatch ? titleMatch[1] : (urlMatch ? urlMatch[1] : 'UNKNOWN');

      // Nombre
      data.name = $('h1').first().text().trim() || '';

      // Descripción - primeros párrafos
      data.description = '';
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 20 && !text.includes('log in or sign up') && i < 3) {
          data.description += text + ' ';
        }
      });
      data.description = data.description.trim();

      // Especificaciones - tablas
      data.specifications = {};
      $('table').each((idx, table) => {
        const $table = $(table);
        const tableText = $table.text();

        // Saltar tablas de related parts, equipment, kits
        if (!tableText.includes('Related') && !tableText.includes('Equipment') &&
            !tableText.includes('Maintenance') && !tableText.includes('Part Number')) {

          $table.find('tr').each((i, row) => {
            const cells = $(row).find('td, th');
            if (cells.length >= 2) {
              const key = $(cells[0]).text().trim();
              const value = $(cells[1]).text().trim();
              if (key && value && key.length < 50) {
                data.specifications[key] = value;
              }
            }
          });
        }
      });

      // Partes relacionadas
      data.related_parts = {};
      const relatedSection = $('*').filter(function() {
        return $(this).text().includes('Related Parts');
      }).first();

      if (relatedSection.length > 0) {
        const relatedText = relatedSection.text();

        // Buscar patrones: "Replaces", "For Upgrade", "Upgrade Of"
        const replaces = relatedText.match(/Replaces\s+([A-Z]{2}\d+[A-Z0-9]*)/g);
        if (replaces) {
          data.related_parts['Replaces'] = replaces.map(r =>
            r.replace('Replaces ', '').trim()
          );
        }

        const forUpgrade = relatedText.match(/For Upgrade[,\s]+Use\s+([A-Z]{2}\d+[A-Z0-9]*)/g);
        if (forUpgrade) {
          data.related_parts['For Upgrade, Use'] = forUpgrade.map(u =>
            u.replace(/For Upgrade[,\s]+Use\s+/, '').trim()
          );
        }

        const upgradeOf = relatedText.match(/Upgrade Of\s+([A-Z]{2}\d+[A-Z0-9]*)/g);
        if (upgradeOf) {
          data.related_parts['Upgrade Of'] = upgradeOf.map(u =>
            u.replace('Upgrade Of ', '').trim()
          );
        }

        // Links explícitos en Related Parts
        relatedSection.find('a[href*="/product/"]').each((i, link) => {
          const sku = $(link).text().trim();
          const label = $(link).parent().parent().find('td, div').eq(0).text().trim() || 'Related';

          if (sku && sku.match(/^[A-Z]{2}\d+/)) {
            if (!data.related_parts[label]) {
              data.related_parts[label] = [];
            }
            if (!data.related_parts[label].includes(sku)) {
              data.related_parts[label].push(sku);
            }
          }
        });
      }

      // Equipment compatibility - si está visible sin hacer click
      data.equipment_compatibility = [];
      const equipSection = $('*').filter(function() {
        return $(this).text().includes('Equipment');
      }).first();

      if (equipSection.length > 0) {
        equipSection.find('table').each((idx, table) => {
          if (!$(table).text().includes('OEM Cross')) {
            $(table).find('tbody tr').each((i, row) => {
              const cells = $(row).find('td');
              if (cells.length >= 3) {
                data.equipment_compatibility.push({
                  equipment: $(cells[0]).text().trim(),
                  engine: $(cells[1])?.text().trim() || '',
                  year: $(cells[2])?.text().trim() || '',
                  qty_req: $(cells[3])?.text().trim() || '1',
                });
              }
            });
          }
        });
      }

      // OEM Cross Reference - nota sobre que requiere JavaScript
      data.oem_cross_reference = []; // Nota: requiere click en tab
      data._note_oem = 'OEM Cross Reference requiere JavaScript (tab dinámico)';

      // Maintenance Kits - si está visible
      data.maintenance_kits = [];
      const kitsSection = $('*').filter(function() {
        return $(this).text().includes('Maintenance Kit');
      }).first();

      if (kitsSection.length > 0) {
        kitsSection.find('table').each((idx, table) => {
          $(table).find('tbody tr').each((i, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 2) {
              const kitSku = $(cells[0]).find('a').text().trim() || $(cells[0]).text().trim();
              const partNumber = $(cells[1]).find('a').text().trim() || $(cells[1]).text().trim();
              const qty = $(cells[2])?.text().trim() || '1';
              const family = $(cells[3])?.text().trim() || '';

              if (kitSku && partNumber && kitSku.match(/^[A-Z]{2}/)) {
                data.maintenance_kits.push({
                  maintenance_kit: kitSku,
                  part_number: partNumber,
                  quantity: qty,
                  product_family: family,
                });
              }
            }
          });
        });
      }

      // Imagen
      const img = $('img[alt*="Fleetguard"]').first().attr('src') ||
                  $('picture img').first().attr('src') ||
                  $('img.product-image').first().attr('src');
      data.imageUrl = img ? (img.startsWith('http') ? img : `${FLEETGUARD_BASE}${img}`) : null;

      // URL
      data.productUrl = productUrl;

      return data;
    } catch (err) {
      throw new Error(`Error extrayendo producto: ${err.message}`);
    }
  }

  async getProductLinks(pageNumber) {
    try {
      const url = `${CATALOG_URL}?page=${pageNumber}`;
      console.log(`📄 Navegando página ${pageNumber}...`);

      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      const links = [];
      $('a[href*="/product/"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/product/')) {
          const fullUrl = href.startsWith('http') ? href : `${FLEETGUARD_BASE}${href}`;
          if (!links.some(l => l === fullUrl)) {
            links.push(fullUrl);
          }
        }
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
      const html = await this.fetchWithRetry(CATALOG_URL);
      const $ = cheerio.load(html);

      // Buscar texto de paginación
      let totalPages = 1;
      $('*').each((i, el) => {
        const text = $(el).text();
        const match = text.match(/Page \d+ of (\d+)/);
        if (match) {
          totalPages = parseInt(match[1]);
        }
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

      console.log('\n🚀 Iniciando scraping de catálogo Fleetguard (Cheerio)...');
      const totalPages = await this.getTotalPages();
      const pagesToScrape = maxPages ? Math.min(maxPages, totalPages) : totalPages;

      console.log(`📊 Total de páginas: ${totalPages} (Scrapeando ${pagesToScrape})\n`);

      for (let page = 1; page <= pagesToScrape; page++) {
        console.log(`\n--- Página ${page}/${pagesToScrape} ---`);

        try {
          const productLinks = await this.getProductLinks(page);

          for (const link of productLinks) {
            try {
              console.log(`  📦 Extrayendo: ${link.split('/product/')[1]?.substring(0, 20)}`);

              const html = await this.fetchWithRetry(link);
              const productData = this.extractProductData(html, link);
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
    }
  }

  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    const report = {
      timestamp: new Date().toISOString(),
      duration_seconds: parseFloat(duration),
      method: 'Cheerio (HTML estático)',
      note: 'OEM Cross Reference requiere Puppeteer para hacer click en tabs',
      statistics: {
        total_pages_scraped: this.stats.pages,
        total_products_extracted: this.stats.products,
        total_errors: this.stats.errors,
      },
      products_sample: this.products.slice(0, 3),
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

    const reportPath = path.join(REPORT_DIR, `fleetguard-scrape-cheerio-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Reporte guardado en: ${reportPath}`);

    return report;
  }

  async saveToFile(filename = 'fleetguard-catalog-cheerio.json') {
    const filepath = path.join(__dirname, `../${filename}`);
    fs.writeFileSync(filepath, JSON.stringify(this.products, null, 2));
    console.log(`💾 Datos guardados en: ${filepath}`);
  }
}

if (require.main === module) {
  (async () => {
    const scraper = new FleetguardCheerioScraper();
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

module.exports = { FleetguardCheerioScraper };
