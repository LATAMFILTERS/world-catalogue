#!/usr/bin/env node

/**
 * 🚀 SCRAPER FICHA TÉCNICA COMPLETA - FLEETGUARD
 *
 * Extrae la FICHA TÉCNICA COMPLETA de cada producto:
 * - Especificaciones técnicas
 * - Datos detallados
 * - Equipment compatibility
 * - Dimensiones, presiones, capacidades
 *
 * EJECUCIÓN EN WINDOWS:
 *   node scripts/scraper-fichas-tecnicas.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Sin filtros de prefijo - scrapear todos los SKUs de Fleetguard

const BASE_URL = 'https://www.fleetguard.com/en-US/product';
const SEARCH_URL = 'https://www.fleetguard.com/en-US/products';

class FichasTecnicasScraper {
  constructor() {
    this.browser = null;
    this.products = [];
    this.filteredSkus = [];
  }

  // Extraer SKUs de una página de listado
  async extractSkusFromPage(page, pageNumber) {
    try {
      const url = `${SEARCH_URL}?page=${pageNumber}`;
      console.log(`\n[Página ${pageNumber}] Navegando a ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 45000
      });

      // Esperar carga de contenido
      await new Promise(resolve => setTimeout(resolve, 2000));

      const skus = await page.evaluate(() => {
        const productLinks = document.querySelectorAll('a[href*="/product/"]');
        const extractedSkus = [];

        productLinks.forEach(link => {
          const match = link.href.match(/\/product\/([A-Z0-9]+)/);
          if (match && match[1]) {
            extractedSkus.push(match[1]);
          }
        });

        return [...new Set(extractedSkus)]; // Eliminar duplicados
      });

      console.log(`   ✓ Encontrados ${skus.length} productos en página ${pageNumber}`);
      return skus;

    } catch (error) {
      console.error(`   ✗ Error extrayendo SKUs de página ${pageNumber}: ${error.message}`);
      return [];
    }
  }

  async init() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🔍 SCRAPER FICHAS TÉCNICAS - FLEETGUARD 500 PÁGINAS     ║');
    console.log('║  📂 TODOS LOS PRODUCTOS                                  ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
      console.log('🚀 Iniciando navegador Chrome...\n');

      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080'
        ]
      });

      console.log('✅ Navegador iniciado correctamente\n');
    } catch (err) {
      console.error('❌ Error al iniciar navegador:', err.message);
      console.error('\n💡 SOLUCIÓN:');
      console.error('   En PowerShell ejecuta:');
      console.error('   npm install puppeteer');
      process.exit(1);
    }
  }

  async scrapeProducto(sku, index) {
    const page = await this.browser.newPage();
    page.setDefaultNavigationTimeout(45000);

    try {
      const url = `${BASE_URL}/${sku}`;
      console.log(`\n[${index}/${this.filteredSkus.length}] 📄 SCRAPEANDO: ${sku}`);
      console.log(`   URL: ${url}`);

      // User-Agent realista
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Headers realistas - FORZAR INGLÉS
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.fleetguard.com/en-US/',
        'Cookie': 'language=en; locale=en_US'
      });

      // Navegar a la página del producto
      console.log('   ⏳ Navegando...');
      try {
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 45000
        });
      } catch (navError) {
        // Si falla networkidle2, intentar con domcontentloaded
        console.log('   ⚠️  networkidle2 timeout, intentando domcontentloaded...');
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 45000
        });
      }

      // Esperar y hacer scroll para cargar contenido dinámico
      console.log('   ⏳ Esperando carga de contenido dinámico...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Scroll para cargar imágenes y contenido lazy-load
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extraer TODO el contenido de la página
      console.log('   🔍 Extrayendo contenido...');
      const product = await page.evaluate((SKU) => {
        const result = {
          sku: SKU,
          name: '',
          description: '',
          features: [],
          specifications: {},
          technicalData: {},
          equipment: [],
          relatedProducts: [],
          replaces: [],
          replacedBy: [],
          forUpgradeUse: [],
          upgradeOf: [],
          oemCrossReference: [],
          maintenanceKits: [],
          images: [],
          pageText: ''
        };

        // Obtener todo el texto de la página
        const allText = document.body.innerText || '';
        result.pageText = allText;

        // NOMBRE: buscar h1, h2 o título principal
        const titleElements = [
          document.querySelector('h1[class*="product-name"]'),
          document.querySelector('h1[class*="title"]'),
          document.querySelector('h1'),
          document.querySelector('h2')
        ];

        for (const el of titleElements) {
          if (el && el.textContent.trim().length > 3 && !el.textContent.includes('Login')) {
            result.name = el.textContent.trim();
            break;
          }
        }

        // DESCRIPCIÓN: párrafo principal, no navegación
        const descElements = [
          document.querySelector('[class*="product-description"]'),
          document.querySelector('[class*="description"]'),
          document.querySelector('[class*="details"]'),
          document.querySelector('[class*="product-info"] p'),
          document.querySelector('p')
        ];

        for (const el of descElements) {
          if (el) {
            const text = el.textContent.trim();
            if (text.length > 20 &&
                !text.includes('Login') &&
                !text.includes('Cookie') &&
                !text.includes('facebook') &&
                !text.includes('Skip to')) {
              result.description = text.substring(0, 500);
              break;
            }
          }
        }

        // CARACTERÍSTICAS: buscar listas con características
        const liElements = document.querySelectorAll('li');
        liElements.forEach(li => {
          const text = li.textContent.trim();
          if (text.length > 5 && text.length < 200) {
            result.features.push(text);
          }
        });

        // ESPECIFICACIONES TÉCNICAS: desde tablas y elementos específicos
        // Buscar tablas de especificaciones
        const specTables = document.querySelectorAll('[class*="spec"], [class*="technical"], table');
        specTables.forEach((table, tableIndex) => {
          if (table.tagName === 'TABLE') {
            const rows = table.querySelectorAll('tr');
            rows.forEach((row, rowIndex) => {
              const cells = row.querySelectorAll('td, th');
              if (cells.length >= 2) {
                const key = cells[0].textContent.trim();
                const value = cells[1].textContent.trim();

                // Filtrar navegación y contenido basura
                if (key && value &&
                    key.length > 2 && key.length < 100 &&
                    value.length > 1 && value.length < 500 &&
                    !key.match(/^(Home|Facebook|LinkedIn|YouTube|Instagram|Cookie|Accept|Privacy|Carrito|Saltar|Skip)/) &&
                    !key.includes('©') &&
                    !key.includes('Nashville') &&
                    !value.includes('facebook.com')) {
                  const cleanKey = key.replace(/[:\*]/g, '').trim();
                  result.specifications[cleanKey] = value;
                }
              }
            });
          }
        });

        // Buscar datos técnicos en divs específicos
        const techDivs = document.querySelectorAll('[class*="specification"], [class*="detail"], [data-spec], [data-technical]');
        techDivs.forEach((div, idx) => {
          const text = div.textContent.trim();
          if (text.length > 5 && text.length < 300 && !text.includes('facebook') && !text.includes('cookie')) {
            result.specifications[`tech_${idx}`] = text;
          }
        });

        // DATOS TÉCNICOS: desde divs con clases específicas
        const specs = document.querySelectorAll('[class*="spec"], [class*="feature"], [class*="tech"]');
        specs.forEach(spec => {
          const text = spec.textContent.trim();
          if (text.length > 3 && text.length < 300) {
            const cleanText = text.replace(/\n\n+/g, ' | ');
            const key = `spec_${Object.keys(result.technicalData).length}`;
            result.technicalData[key] = cleanText;
          }
        });

        // EQUIPOS COMPATIBLES: buscar sección de equipos
        const equipmentKeywords = ['Equipment', 'Compatible With', 'For Use With', 'Fits'];
        equipmentKeywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'gi');
          if (regex.test(allText)) {
            const idx = allText.toLowerCase().indexOf(keyword.toLowerCase());
            const section = allText.substring(idx, idx + 500);
            const models = section.match(/[A-Z0-9]{4,8}/g) || [];
            result.equipment = [...new Set(models)].slice(0, 10);
          }
        });

        // PRODUCTOS RELACIONADOS: buscar enlaces a otros SKUs
        const links = document.querySelectorAll('a[href*="/product/"]');
        links.forEach(link => {
          const match = link.href.match(/\/product\/([A-Z0-9]+)/);
          if (match && match[1] !== SKU) {
            result.relatedProducts.push({
              sku: match[1],
              name: link.textContent.trim(),
              url: link.href
            });
          }
        });
        result.relatedProducts = [...new Map(result.relatedProducts.map(p => [p.sku, p])).values()].slice(0, 10);

        // REPLACES / REPLACED BY
        const allText = document.body.innerText || '';
        const replacesSectionMatch = allText.match(/Replaces\s*:?\s*([A-Z0-9\s,]+?)(?=\n|For Upgrade|Equipment|OEM|Maintenance|$)/i);
        if (replacesSectionMatch) {
          result.replaces = replacesSectionMatch[1]
            .split(/[\s,]+/)
            .filter(s => s && s.match(/^[A-Z0-9]+$/))
            .slice(0, 10);
        }

        // FOR UPGRADE, USE
        const upgradeMatch = allText.match(/For Upgrade,?\s*Use\s*:?\s*([A-Z0-9\s,]+?)(?=\n|Upgrade Of|Equipment|OEM|Maintenance|$)/i);
        if (upgradeMatch) {
          result.forUpgradeUse = upgradeMatch[1]
            .split(/[\s,]+/)
            .filter(s => s && s.match(/^[A-Z0-9]+$/))
            .slice(0, 10);
        }

        // UPGRADE OF
        const upgradeOfMatch = allText.match(/Upgrade\s*Of\s*:?\s*([A-Z0-9\s,]+?)(?=\n|Equipment|OEM|Maintenance|$)/i);
        if (upgradeOfMatch) {
          result.upgradeOf = upgradeOfMatch[1]
            .split(/[\s,]+/)
            .filter(s => s && s.match(/^[A-Z0-9]+$/))
            .slice(0, 10);
        }

        // OEM CROSS REFERENCE
        const oemSection = document.querySelector('[class*="oem"], [class*="cross"], [class*="reference"]');
        if (oemSection) {
          const oemText = oemSection.textContent;
          const oemMatches = oemText.match(/[A-Z0-9]{4,}/g) || [];
          result.oemCrossReference = [...new Set(oemMatches)].slice(0, 10);
        }

        // MAINTENANCE KITS
        const kitsMatch = allText.match(/Maintenance\s*Kits?\s*:?\s*([A-Z0-9\s,\-]+?)(?=\n|Equipment|OEM|$)/i);
        if (kitsMatch) {
          result.maintenanceKits = kitsMatch[1]
            .split(/[\s,]+/)
            .filter(s => s && s.match(/^[A-Z0-9\-]+$/))
            .slice(0, 10);
        }

        // RELATED PARTS (buscar en secciones específicas)
        const partsSection = document.querySelector('[class*="related"], [class*="parts"], [class*="accessories"]');
        if (partsSection) {
          const partLinks = partsSection.querySelectorAll('a[href*="/product/"]');
          partLinks.forEach(link => {
            const match = link.href.match(/\/product\/([A-Z0-9]+)/);
            if (match && match[1] !== SKU && !result.relatedProducts.some(p => p.sku === match[1])) {
              result.relatedProducts.push({
                sku: match[1],
                name: link.textContent.trim(),
                url: link.href
              });
            }
          });
        }

        // IMÁGENES
        const imgs = document.querySelectorAll('img[src*="fleetguard"], img[src*="widen"]');
        imgs.forEach(img => {
          if (img.src && img.src.length > 10) {
            result.images.push(img.src);
          }
        });
        result.images = [...new Set(result.images)].slice(0, 5);

        return result;
      }, sku);

      // Procesar el texto para extraer más especificaciones
      if (product.pageText) {
        const lines = product.pageText.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          const nextLine = lines[i + 1].trim();

          // Si una línea es corta y la siguiente tiene números/valores, probablemente sea una especificación
          if (
            line.length > 3 &&
            line.length < 50 &&
            !line.includes('Iniciar') &&
            nextLine.length > 0 &&
            nextLine.length < 80 &&
            (nextLine.match(/[\d\.\-\/]/g) || nextLine.length > 5)
          ) {
            const key = line.replace(/[:\*]/g, '').trim();
            if (!product.specifications[key]) {
              product.specifications[key] = nextLine;
            }
          }
        }
      }

      // Limpiar especificaciones duplicadas y filtrar basura
      const filteredSpecs = {};
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (
          key.length > 2 &&
          key.length < 100 &&
          value &&
          value.length > 1 &&
          value.length < 500 &&
          !key.includes('Carrito') &&
          !key.includes('vacío') &&
          !key.includes('Iniciar')
        ) {
          filteredSpecs[key] = value;
        }
      });
      product.specifications = filteredSpecs;

      console.log(`   ✅ EXTRAÍDO CORRECTAMENTE`);
      console.log(`      - Nombre: ${product.name}`);
      console.log(`      - Especificaciones: ${Object.keys(product.specifications).length}`);
      console.log(`      - Características: ${product.features.length}`);
      console.log(`      - Imágenes: ${product.images.length}`);

      return product;

    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
      return {
        sku,
        error: error.message,
        name: `Error - ${sku}`,
        specifications: {}
      };
    } finally {
      await page.close();
    }
  }

  async collectAllSkus() {
    console.log('📋 FASE 1: Recopilando SKUs de 500 páginas...\n');

    const page = await this.browser.newPage();
    page.setDefaultNavigationTimeout(45000);

    // Headers para obtener inglés
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Referer': 'https://www.fleetguard.com/en-US/',
      'Cookie': 'language=en; locale=en_US'
    });

    try {
      for (let pageNum = 1; pageNum <= 500; pageNum++) {
        const pageSkus = await this.extractSkusFromPage(page, pageNum);

        // Agregar todos los productos encontrados
        pageSkus.forEach(sku => {
          if (!this.filteredSkus.includes(sku)) {
            this.filteredSkus.push(sku);
          }
        });

        // Si no encuentra SKUs, probablemente no hay más páginas
        if (pageSkus.length === 0) {
          console.log(`\n⚠️  No se encontraron productos en página ${pageNum}. Deteniendo búsqueda.`);
          break;
        }

        // Delay para no sobrecargar
        if (pageNum % 10 === 0) {
          console.log(`   ⏸️  Pausa de 5 segundos...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      await page.close();
    }

    console.log(`\n✅ Total de SKUs recopilados: ${this.filteredSkus.length}\n`);
  }

  async scrapeAll() {
    console.log('\n📋 FASE 2: Scrapeando fichas técnicas...\n');

    for (let i = 0; i < this.filteredSkus.length; i++) {
      const product = await this.scrapeProducto(this.filteredSkus[i], i + 1);
      this.products.push(product);

      // Delay para no sobrecargar servidor
      if (i < this.filteredSkus.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Cada 50 productos, pausa más larga
      if ((i + 1) % 50 === 0) {
        console.log(`\n⏸️  Pausa de 10 segundos después de ${i + 1} productos...\n`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  async save() {
    const timestamp = Date.now();
    const filename = `fleetguard-fichas-tecnicas-${timestamp}.json`;
    const filepath = path.join(__dirname, '../scrape_reports', filename);

    // Crear directorio si no existe
    if (!fs.existsSync(path.join(__dirname, '../scrape_reports'))) {
      fs.mkdirSync(path.join(__dirname, '../scrape_reports'), { recursive: true });
    }

    const output = {
      timestamp: new Date().toISOString(),
      source: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE',
      totalProducts: this.products.length,
      successCount: this.products.filter(p => !p.error).length,
      errorCount: this.products.filter(p => p.error).length,
      products: this.products
    };

    fs.writeFileSync(filepath, JSON.stringify(output, null, 2));

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  ✅ SCRAPING COMPLETADO                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log(`📊 RESULTADOS:`);
    console.log(`   ✅ Productos extraídos: ${output.successCount}/${output.totalProducts}`);
    console.log(`   ❌ Errores: ${output.errorCount}`);
    console.log(`\n📁 Guardado en: ${filepath}\n`);

    // También mostrar resumen en consola
    this.products.forEach(p => {
      if (!p.error) {
        console.log(`\n📦 ${p.sku}`);
        console.log(`   Nombre: ${p.name}`);
        console.log(`   Especificaciones: ${Object.keys(p.specifications).length}`);
        if (p.description) {
          console.log(`   Descripción: ${p.description.substring(0, 80)}...`);
        }
      }
    });
  }

  async run() {
    try {
      await this.init();
      await this.scrapeAll();
      await this.save();
      await this.browser.close();
      console.log('✅ Proceso finalizado correctamente\n');
    } catch (error) {
      console.error('❌ Error fatal:', error);
      if (this.browser) {
        await this.browser.close();
      }
      process.exit(1);
    }
  }
}

// Ejecutar
const scraper = new FichasTecnicasScraper();
scraper.run();
