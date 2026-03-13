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

// 20 SKUs REALES de página 1
const SKUS = [
  'LF14000NN', 'FF63054NN', 'LF3970', 'CC36087', 'LF9009',
  'FF5776', 'FF5825NN', 'CC36077', 'LF3620', 'FS19765',
  'LF670', 'LF17511', 'LF691A', 'FS1000', 'FS19764',
  'FF2200', 'LF667', 'CC36057', 'LF16015', 'FS1098'
];

const BASE_URL = 'https://www.fleetguard.com/product';

class FichasTecnicasScraper {
  constructor() {
    this.browser = null;
    this.products = [];
  }

  async init() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🔍 SCRAPER FICHAS TÉCNICAS - FLEETGUARD 20 PRODUCTOS    ║');
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
      console.log(`\n[${index}/20] 📄 SCRAPEANDO: ${sku}`);
      console.log(`   URL: ${url}`);

      // User-Agent realista
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Headers realistas
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.fleetguard.com/'
      });

      // Navegar a la página del producto
      console.log('   ⏳ Navegando...');
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 45000
      });

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
          images: [],
          pageText: ''
        };

        // Obtener todo el texto de la página
        const allText = document.body.innerText || '';
        result.pageText = allText;

        // NOMBRE: buscar h1 o título principal
        const h1 = document.querySelector('h1');
        if (h1) {
          result.name = h1.textContent.trim();
        }

        // DESCRIPCIÓN: primer párrafo o elemento con clase descripción
        const descElements = [
          document.querySelector('[class*="description"]'),
          document.querySelector('[class*="details"]'),
          document.querySelector('p')
        ];

        for (const el of descElements) {
          if (el && el.textContent.trim().length > 10) {
            result.description = el.textContent.trim().substring(0, 500);
            break;
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

        // ESPECIFICACIONES TÉCNICAS: desde tablas
        const tables = document.querySelectorAll('table');
        tables.forEach((table, tableIndex) => {
          const rows = table.querySelectorAll('tr');
          rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td, th');
            if (cells.length >= 2) {
              const key = cells[0].textContent.trim();
              const value = cells[1].textContent.trim();

              if (key && value && key.length > 2 && key.length < 100) {
                const cleanKey = key.replace(/[:\*]/g, '').trim();
                result.specifications[cleanKey] = value;
                result.technicalData[`table${tableIndex}_${rowIndex}`] = {
                  key: cleanKey,
                  value: value
                };
              }
            }
          });
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

  async scrapeAll() {
    for (let i = 0; i < SKUS.length; i++) {
      const product = await this.scrapeProducto(SKUS[i], i + 1);
      this.products.push(product);

      // Delay para no sobrecargar servidor
      if (i < SKUS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
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
