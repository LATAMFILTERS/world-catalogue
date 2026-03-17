/**
 * FLEETGUARD CATALOG SCRAPER - COMPLETO
 *
 * Extrae el catálogo completo de fleetguard.com incluyendo:
 * - Todas las categorías de productos
 * - Datos completos de cada producto (nombre, SKU, descripción, specs)
 * - Cross references (números de competidores)
 * - Aplicaciones de vehículos (Make/Model/Year)
 * - Imágenes
 *
 * USO:
 *   node scripts/scrape_fleetguard_catalog.js
 *   node scripts/scrape_fleetguard_catalog.js --category "Lube Filter"
 *   node scripts/scrape_fleetguard_catalog.js --resume
 *
 * REQUIERE: puppeteer instalado y Chrome/Chromium disponible
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
const CONFIG = {
  BASE_URL: 'https://www.fleetguard.com',
  OUTPUT_DIR: './fleetguard_catalog',
  PRODUCTS_FILE: './fleetguard_catalog/products.json',
  PROGRESS_FILE: './fleetguard_catalog/progress.json',
  DELAY_MIN: 1500,   // ms entre requests (respetar el servidor)
  DELAY_MAX: 3000,
  HEADLESS: false,   // false = ver el browser, true = modo silencioso
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Categorías principales del catálogo Fleetguard
const CATEGORY_URLS = [
  { name: 'Lube Filter',           url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE' },
  { name: 'Fuel Filter',           url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8k4AE' },
  { name: 'Air Filter',            url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8l4AE' },
  { name: 'Water Filter',          url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8m4AE' },
  { name: 'Fuel Water Separator',  url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8n4AE' },
  { name: 'Hydraulic Filter',      url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8o4AE' },
  { name: 'Breather',              url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8p4AE' },
];

// ─── UTILIDADES ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomDelay = () => sleep(CONFIG.DELAY_MIN + Math.random() * (CONFIG.DELAY_MAX - CONFIG.DELAY_MIN));

function log(msg, level = 'INFO') {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] [${level}] ${msg}`);
}

function saveProgress(data) {
  fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(data, null, 2));
}

function loadProgress() {
  if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf8'));
  }
  return { completed: [], failed: [], lastRun: null };
}

function saveProducts(products) {
  const existing = fs.existsSync(CONFIG.PRODUCTS_FILE)
    ? JSON.parse(fs.readFileSync(CONFIG.PRODUCTS_FILE, 'utf8'))
    : [];

  // Merge evitando duplicados por SKU
  const skuMap = {};
  [...existing, ...products].forEach(p => {
    if (p.sku) skuMap[p.sku] = p;
  });

  const merged = Object.values(skuMap);
  fs.writeFileSync(CONFIG.PRODUCTS_FILE, JSON.stringify(merged, null, 2));
  log(`💾 Guardados ${merged.length} productos totales`);
  return merged.length;
}

// ─── SCRAPING FUNCTIONS ───────────────────────────────────────────────────────

/**
 * Navegar a una URL con reintentos
 */
async function navigateTo(page, url, retries = CONFIG.RETRY_ATTEMPTS) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.TIMEOUT
      });
      return true;
    } catch (err) {
      log(`⚠️  Error navegando a ${url} (intento ${i+1}/${retries}): ${err.message}`, 'WARN');
      if (i < retries - 1) await sleep(3000 * (i + 1));
    }
  }
  return false;
}

/**
 * Extraer URLs de productos desde una página de categoría
 */
async function extractProductUrls(page) {
  return await page.evaluate(() => {
    const urls = [];

    // Selectores comunes en sitios de catálogo industrial
    const selectors = [
      'a[href*="/product/"]',
      'a[href*="/products/"]',
      '.product-card a',
      '.product-item a',
      '.product-tile a',
      '[data-product-id] a',
      '.product-name a',
      'a.product-link',
      '.catalog-product a',
    ];

    for (const sel of selectors) {
      const links = document.querySelectorAll(sel);
      if (links.length > 0) {
        links.forEach(a => {
          if (a.href && !urls.includes(a.href)) {
            urls.push(a.href);
          }
        });
        break;
      }
    }

    // Fallback: buscar cualquier link con patrón de SKU Fleetguard
    if (urls.length === 0) {
      document.querySelectorAll('a').forEach(a => {
        if (a.href && /\/(LF|FF|AF|WF|FS|HF|BV|CV)\d+/i.test(a.href)) {
          if (!urls.includes(a.href)) urls.push(a.href);
        }
      });
    }

    return urls;
  });
}

/**
 * Obtener URL de la siguiente página (paginación)
 */
async function getNextPageUrl(page) {
  return await page.evaluate(() => {
    // Selectores de paginación
    const nextSelectors = [
      'a[aria-label="Next"]',
      'a.next-page',
      'a[rel="next"]',
      '.pagination .next a',
      'button.next-page',
      'a:contains("Next")',
      '[data-page-next] a',
    ];

    for (const sel of nextSelectors) {
      const el = document.querySelector(sel);
      if (el && el.href) return el.href;
      if (el && !el.disabled) {
        // Es un botón, retornar señal
        return '__CLICK_NEXT__';
      }
    }

    // Buscar link "Next" o ">" en paginación
    const allLinks = document.querySelectorAll('.pagination a, nav a');
    for (const link of allLinks) {
      const text = link.textContent.trim();
      if (text === 'Next' || text === '>' || text === '›' || text === '→') {
        return link.href || '__CLICK__' + link.className;
      }
    }

    return null;
  });
}

/**
 * Extraer datos completos de una página de producto
 */
async function extractProductData(page, url) {
  return await page.evaluate((productUrl) => {
    const getText = (selectors) => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim()) return el.textContent.trim();
      }
      return null;
    };

    const getAllText = (selectors) => {
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) return Array.from(els).map(e => e.textContent.trim()).filter(Boolean);
      }
      return [];
    };

    // ── NOMBRE Y SKU ──
    const name = getText([
      'h1.product-name',
      'h1.product-title',
      '.product-detail h1',
      'h1',
      '.pdp-title',
      '[data-product-name]',
    ]);

    // Extraer SKU del título o de campos específicos
    let sku = getText([
      '.product-sku',
      '[data-sku]',
      '.sku-value',
      '.part-number',
      '[data-part-number]',
      '.product-id',
    ]);

    // Si no hay SKU explícito, extraerlo del nombre o URL
    if (!sku && name) {
      const skuMatch = name.match(/\b(LF|FF|AF|WF|FS|HF|BV|CV|ES|RS|DF)\d{3,6}[A-Z]?\b/i);
      if (skuMatch) sku = skuMatch[0].toUpperCase();
    }
    if (!sku) {
      const urlMatch = productUrl.match(/(LF|FF|AF|WF|FS|HF|BV|CV)\d+[A-Z]?/i);
      if (urlMatch) sku = urlMatch[0].toUpperCase();
    }

    // ── DESCRIPCIÓN ──
    const description = getText([
      '.product-description',
      '.product-detail-description',
      '.pdp-description',
      '#description',
      '[data-description]',
      '.product-overview p',
    ]);

    // ── IMAGEN ──
    let image = null;
    const imgSelectors = [
      '.product-image img',
      '.pdp-image img',
      '.product-photo img',
      '#product-image img',
      '.gallery-image img',
    ];
    for (const sel of imgSelectors) {
      const img = document.querySelector(sel);
      if (img) {
        image = img.src || img.dataset.src || img.dataset.lazySrc;
        if (image) break;
      }
    }

    // ── ESPECIFICACIONES TÉCNICAS ──
    const specs = {};

    // Buscar tablas de specs
    const specSelectors = [
      '.product-specs table',
      '.specifications table',
      '.product-attributes table',
      '.tech-specs table',
      '#specifications table',
      '.spec-table',
    ];

    for (const sel of specSelectors) {
      const table = document.querySelector(sel);
      if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const key = cells[0].textContent.trim().replace(/:$/, '');
            const val = cells[1].textContent.trim();
            if (key && val) specs[key] = val;
          }
        });
        break;
      }
    }

    // Buscar specs en formato dl/dt/dd
    const dlEls = document.querySelectorAll('.product-specs dl, .specifications dl, .product-attributes dl');
    dlEls.forEach(dl => {
      const dts = dl.querySelectorAll('dt');
      const dds = dl.querySelectorAll('dd');
      dts.forEach((dt, i) => {
        if (dds[i]) specs[dt.textContent.trim()] = dds[i].textContent.trim();
      });
    });

    // Buscar specs en pares de divs label/value
    const specPairs = document.querySelectorAll(
      '.spec-row, .attribute-row, .product-attribute, [class*="spec-item"], [class*="attribute-item"]'
    );
    specPairs.forEach(pair => {
      const label = pair.querySelector('.spec-label, .attribute-label, .label, [class*="name"]');
      const value = pair.querySelector('.spec-value, .attribute-value, .value, [class*="value"]');
      if (label && value) {
        specs[label.textContent.trim().replace(/:$/, '')] = value.textContent.trim();
      }
    });

    // ── CROSS REFERENCES ──
    const crossReferences = [];

    // Buscar tabla de cross references
    const crossRefSelectors = [
      '#cross-reference table',
      '.cross-reference table',
      '#crossRef table',
      '.cross-ref table',
      '[id*="cross"] table',
      '[class*="cross-ref"] table',
      '.interchange table',
    ];

    for (const sel of crossRefSelectors) {
      const table = document.querySelector(sel);
      if (table) {
        const rows = table.querySelectorAll('tr');
        let headers = [];
        rows.forEach((row, i) => {
          const cells = row.querySelectorAll('th, td');
          if (i === 0) {
            headers = Array.from(cells).map(c => c.textContent.trim());
          } else {
            const entry = {};
            cells.forEach((cell, j) => {
              entry[headers[j] || `col_${j}`] = cell.textContent.trim();
            });
            if (Object.values(entry).some(v => v)) crossReferences.push(entry);
          }
        });
        if (crossReferences.length > 0) break;
      }
    }

    // Si no hay tabla, buscar lista de cross refs
    if (crossReferences.length === 0) {
      const crossItems = document.querySelectorAll(
        '.cross-reference-item, .interchange-item, [data-cross-ref], .alt-part-number'
      );
      crossItems.forEach(item => {
        const brand = item.querySelector('.brand, .manufacturer') || item;
        const partNum = item.querySelector('.part-number, .number') || item;
        crossReferences.push({
          brand: brand.textContent.trim(),
          partNumber: partNum.textContent.trim(),
        });
      });
    }

    // ── APLICACIONES (FITMENT) ──
    const applications = [];

    // Buscar tabla de fitment/applications
    const appSelectors = [
      '#fitment table',
      '.vehicle-fitment table',
      '.applications table',
      '#applications table',
      '[class*="fitment"] table',
      '.where-used table',
    ];

    for (const sel of appSelectors) {
      const table = document.querySelector(sel);
      if (table) {
        const rows = table.querySelectorAll('tr');
        let headers = [];
        rows.forEach((row, i) => {
          const cells = row.querySelectorAll('th, td');
          if (i === 0) {
            headers = Array.from(cells).map(c => c.textContent.trim());
          } else {
            const entry = {};
            cells.forEach((cell, j) => {
              entry[headers[j] || `col_${j}`] = cell.textContent.trim();
            });
            if (Object.values(entry).some(v => v)) applications.push(entry);
          }
        });
        if (applications.length > 0) break;
      }
    }

    // ── CATEGORÍA ──
    const breadcrumbs = getAllText([
      '.breadcrumb a',
      'nav[aria-label="breadcrumb"] a',
      '.breadcrumbs a',
    ]);

    // ── PRECIO (si visible) ──
    const price = getText([
      '.price',
      '.product-price',
      '[data-price]',
      '.price-value',
    ]);

    return {
      url: productUrl,
      sku,
      name,
      description,
      image,
      price,
      specs,
      crossReferences,
      applications,
      breadcrumbs,
      scrapedAt: new Date().toISOString(),
    };
  }, url);
}

/**
 * Scraping de una categoría completa con paginación
 */
async function scrapeCategory(page, category) {
  log(`\n${'='.repeat(60)}`);
  log(`📂 Categoría: ${category.name}`);
  log(`🔗 URL: ${category.url}`);

  const allProductUrls = [];
  let currentUrl = category.url;
  let pageNum = 1;

  // Iterar por todas las páginas de la categoría
  while (currentUrl) {
    log(`  📄 Página ${pageNum}...`);

    const ok = await navigateTo(page, currentUrl);
    if (!ok) {
      log(`  ❌ No se pudo cargar la página ${pageNum}`, 'ERROR');
      break;
    }

    // Esperar a que carguen los productos
    await new Promise(r => setTimeout(r, 2000));

    // Extraer URLs de productos en esta página
    const urls = await extractProductUrls(page);
    log(`  ✅ Encontrados ${urls.length} productos en página ${pageNum}`);

    allProductUrls.push(...urls.filter(u => !allProductUrls.includes(u)));

    // Buscar siguiente página
    const nextUrl = await getNextPageUrl(page);

    if (nextUrl && nextUrl !== currentUrl) {
      currentUrl = nextUrl;
      pageNum++;
      await randomDelay();
    } else {
      break;
    }
  }

  log(`  📊 Total URLs de productos en "${category.name}": ${allProductUrls.length}`);
  return allProductUrls;
}

/**
 * Scraping de todas las categorías y luego de cada producto
 */
async function scrapeAllProducts(page, categoryUrls, progress) {
  const products = [];
  const completedUrls = new Set(progress.completed);

  // Fase 1: Recopilar todas las URLs de productos
  log('\n🔍 FASE 1: Recopilando URLs de productos...');

  let allProductUrls = [];

  // Primero intentar descubrir categorías desde la página principal
  log('🌐 Explorando categorías desde la página principal...');
  const ok = await navigateTo(page, CONFIG.BASE_URL + '/category/products');
  if (ok) {
    await new Promise(r => setTimeout(r, 2000));
    const discoveredCategories = await page.evaluate(() => {
      const cats = [];
      const catLinks = document.querySelectorAll(
        'a[href*="category"], .category-tile a, .nav-category a, [class*="category"] a'
      );
      catLinks.forEach(a => {
        if (a.href && a.href.includes('/category/')) {
          cats.push({ name: a.textContent.trim(), url: a.href });
        }
      });
      return cats;
    });

    if (discoveredCategories.length > 0) {
      log(`✅ Descubiertas ${discoveredCategories.length} categorías desde navegación`);
      categoryUrls = discoveredCategories;
    }
  }

  // Scraping de cada categoría
  for (const category of categoryUrls) {
    const urls = await scrapeCategory(page, category);
    urls.forEach(u => {
      if (!allProductUrls.includes(u)) {
        allProductUrls.push(u);
      }
    });

    // Guardar progreso
    saveProgress({ ...progress, lastRun: new Date().toISOString() });
    await randomDelay();
  }

  // Guardar lista de URLs para referencia
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'product_urls.json'),
    JSON.stringify(allProductUrls, null, 2)
  );
  log(`\n📝 Guardadas ${allProductUrls.length} URLs de productos`);

  // Fase 2: Scraping de cada producto
  log('\n🔍 FASE 2: Extrayendo datos de cada producto...');

  let processed = 0;
  const batchSize = 50; // Guardar cada N productos
  let batch = [];

  for (const url of allProductUrls) {
    if (completedUrls.has(url)) {
      log(`  ⏭️  Saltando (ya procesado): ${url}`);
      processed++;
      continue;
    }

    log(`  [${processed + 1}/${allProductUrls.length}] Scraping: ${url}`);

    try {
      const ok = await navigateTo(page, url);
      if (!ok) throw new Error('No se pudo cargar la página');

      await new Promise(r => setTimeout(r, 1500));

      // Esperar a que carguen los datos del producto
      try {
        await page.waitForSelector('h1, .product-name, .product-title', { timeout: 10000 });
      } catch (e) {
        // Continuar aunque no encuentre el selector exacto
      }

      const product = await extractProductData(page, url);

      if (product.sku || product.name) {
        batch.push(product);
        progress.completed.push(url);
        log(`  ✅ ${product.sku || 'N/A'} - ${product.name || 'Sin nombre'}`);
        log(`     Specs: ${Object.keys(product.specs).length} | CrossRefs: ${product.crossReferences.length} | Apps: ${product.applications.length}`);
      } else {
        progress.failed.push({ url, reason: 'No SKU or name found' });
        log(`  ⚠️  Sin datos encontrados en: ${url}`, 'WARN');
      }

    } catch (err) {
      progress.failed.push({ url, reason: err.message });
      log(`  ❌ Error: ${err.message}`, 'ERROR');
    }

    processed++;

    // Guardar batch y progreso
    if (batch.length >= batchSize) {
      saveProducts(batch);
      saveProgress(progress);
      products.push(...batch);
      batch = [];
    }

    await randomDelay();
  }

  // Guardar último batch
  if (batch.length > 0) {
    saveProducts(batch);
    products.push(...batch);
  }

  return products;
}

// ─── EXPORTAR A CSV ──────────────────────────────────────────────────────────
function exportToCsv(products) {
  // CSV principal de productos
  const headers = ['sku', 'name', 'description', 'category', 'price', 'url', 'image', 'scrapedAt'];
  const rows = products.map(p => [
    p.sku || '',
    (p.name || '').replace(/,/g, ';'),
    (p.description || '').replace(/,/g, ';').replace(/\n/g, ' ').slice(0, 500),
    (p.breadcrumbs || []).join(' > ').replace(/,/g, ';'),
    p.price || '',
    p.url || '',
    p.image || '',
    p.scrapedAt || '',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, 'products.csv'), csv);

  // CSV de cross references
  const crossHeaders = ['sku', 'brand', 'partNumber', 'notes'];
  const crossRows = [];
  products.forEach(p => {
    (p.crossReferences || []).forEach(cr => {
      const brand = cr.brand || cr.Brand || cr.Manufacturer || Object.values(cr)[0] || '';
      const part = cr.partNumber || cr['Part Number'] || cr.Number || Object.values(cr)[1] || '';
      crossRows.push([p.sku || '', brand, part, ''].map(v => `"${v}"`).join(','));
    });
  });

  if (crossRows.length > 0) {
    const crossCsv = [crossHeaders.join(','), ...crossRows].join('\n');
    fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, 'cross_references.csv'), crossCsv);
    log(`📊 Cross references CSV: ${crossRows.length} registros`);
  }

  // CSV de specs
  // Primero recopilar todas las claves de specs
  const allSpecKeys = new Set();
  products.forEach(p => Object.keys(p.specs || {}).forEach(k => allSpecKeys.add(k)));
  const specKeys = Array.from(allSpecKeys);

  if (specKeys.length > 0) {
    const specHeaders = ['sku', ...specKeys];
    const specRows = products.map(p => {
      const row = [p.sku || ''];
      specKeys.forEach(k => row.push((p.specs[k] || '').replace(/,/g, ';')));
      return row.map(v => `"${v}"`).join(',');
    });
    const specCsv = [specHeaders.map(h => `"${h}"`).join(','), ...specRows].join('\n');
    fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, 'specifications.csv'), specCsv);
    log(`📊 Specifications CSV: ${products.length} productos, ${specKeys.length} columnas`);
  }

  log(`📊 Products CSV: ${products.length} productos`);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isResume = args.includes('--resume');
  const categoryFilter = args.find(a => a.startsWith('--category='))?.split('=')[1];

  // Crear directorio de output
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // Cargar progreso si existe
  const progress = isResume ? loadProgress() : { completed: [], failed: [], lastRun: null };

  if (isResume) {
    log(`📂 Reanudando scraping. Productos completados: ${progress.completed.length}`);
  }

  // Filtrar categorías si se especificó
  let categoriesToScrape = CATEGORY_URLS;
  if (categoryFilter) {
    categoriesToScrape = CATEGORY_URLS.filter(c =>
      c.name.toLowerCase().includes(categoryFilter.toLowerCase())
    );
    log(`🔍 Filtrando a categoría: ${categoryFilter}`);
  }

  log('🚀 Iniciando Fleetguard Catalog Scraper...');
  log(`📁 Output: ${path.resolve(CONFIG.OUTPUT_DIR)}`);

  // Lanzar browser
  const browser = await puppeteer.launch({
    headless: CONFIG.HEADLESS,
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
    ],
  });

  try {
    const page = await browser.newPage();

    // Configurar user agent realista
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    // Evitar detección de bot
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });

    // Bloquear recursos innecesarios (acelerar)
    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      if (['font', 'media', 'stylesheet'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Scraping principal
    const products = await scrapeAllProducts(page, categoriesToScrape, progress);

    // Exportar resultados
    log('\n📊 Exportando resultados...');
    const existingProducts = fs.existsSync(CONFIG.PRODUCTS_FILE)
      ? JSON.parse(fs.readFileSync(CONFIG.PRODUCTS_FILE, 'utf8'))
      : [];

    const allProducts = existingProducts;

    exportToCsv(allProducts);

    // Resumen final
    log('\n' + '='.repeat(60));
    log('✅ SCRAPING COMPLETADO');
    log(`📦 Total productos: ${allProducts.length}`);
    log(`❌ Fallidos: ${progress.failed.length}`);
    log(`📁 Archivos guardados en: ${path.resolve(CONFIG.OUTPUT_DIR)}/`);
    log('   - products.json        → Todos los datos en JSON');
    log('   - products.csv         → Productos (SKU, nombre, etc.)');
    log('   - cross_references.csv → Cross references por SKU');
    log('   - specifications.csv   → Specs técnicas por SKU');
    log('='.repeat(60));

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  log(`💥 Error fatal: ${err.message}`, 'ERROR');
  console.error(err);
  process.exit(1);
});
