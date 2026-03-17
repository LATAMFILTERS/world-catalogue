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

  // Merge evitando duplicados por id (fallback a sku)
  const idMap = {};
  [...existing, ...products].forEach(p => {
    const key = p.id || p.sku;
    if (key) idMap[key] = p;
  });

  const merged = Object.values(idMap);
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

// ─── SALESFORCE B2B COMMERCE API ─────────────────────────────────────────────

const WEBSTORE_ID = '0ZEPL0000001Jv34AE';
const SF_API_BASE = `/es/webruntime/api/services/data/v66.0/commerce/webstores/${WEBSTORE_ID}`;

function slugify(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Llamada GET a la API de Salesforce desde el contexto del browser (mismo origen, sin CORS)
 */
async function apiGet(page, path) {
  return await page.evaluate(async (apiPath) => {
    try {
      const res = await fetch(apiPath, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) return { __error__: res.status, __msg__: res.statusText };
      return await res.json();
    } catch (e) {
      return { __error__: 'fetch_failed', __msg__: e.message };
    }
  }, path);
}

/**
 * Obtener todos los IDs/nombres de productos de una categoría via API (con paginación)
 */
async function getCategoryProductIds(page, categoryId) {
  const allItems = [];
  let pageNum = 0;
  const pageSize = 20;

  while (true) {
    const path = `${SF_API_BASE}/search/products?categoryId=${categoryId}&page=${pageNum}&pageSize=${pageSize}&includeQuantityRule=false&skipDecoration=true&language=es&asGuest=true&htmlEncode=false`;
    const data = await apiGet(page, path);

    if (data.__error__) {
      log(`  ⚠️  API error (página ${pageNum}): ${data.__msg__}`, 'WARN');
      break;
    }

    const pageData = data.productsPage || data;
    const products = pageData.products || [];
    const total = pageData.total || 0;

    if (products.length === 0) break;

    products.forEach(p => {
      allItems.push({
        id: p.id,
        name: p.name || '',
        sku: (p.fields && p.fields.StockKeepingUnit) || p.sku || '',
      });
    });

    log(`  📄 Página ${pageNum + 1}: ${products.length} productos (acumulado: ${allItems.length}/${total})`);

    if (allItems.length >= total || products.length < pageSize) break;
    pageNum++;
    await sleep(500);
  }

  return allItems;
}

/**
 * Obtener detalles completos de productos via API (en lotes de 20)
 */
async function getProductDetails(page, ids) {
  const results = [];
  const batchSize = 20;

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const idsParam = encodeURIComponent(batch.join(','));
    const path = `${SF_API_BASE}/products?ids=${idsParam}&includeAttributeSetInfo=true&includeQuantityRule=true&includeProductSellingModels=true&includeGroupByAttributeVariationInfo=true&language=es&asGuest=true&htmlEncode=false`;

    const data = await apiGet(page, path);

    if (data.__error__) {
      log(`  ⚠️  Error en lote de detalles: ${data.__msg__}`, 'WARN');
      continue;
    }

    const products = data.products || [];
    results.push(...products);
    await sleep(400);
  }

  return results;
}

/**
 * Construir objeto producto a partir de la respuesta de la API
 */
function buildProduct(apiProduct, meta) {
  const fields = apiProduct.fields || {};

  // Extraer specs de campos del producto
  const specs = {};
  const skipFields = new Set(['Id', 'CreatedDate', 'LastModifiedDate', 'IsActive', 'ProductCode',
    'StockKeepingUnit', 'Name', 'Description', 'IsArchived', 'Type']);

  Object.entries(fields).forEach(([key, val]) => {
    if (val !== null && val !== undefined && !skipFields.has(key) && typeof val !== 'object') {
      specs[key] = String(val);
    }
  });

  // También extraer de attributeSetInfo si existe
  const attrSetInfo = apiProduct.attributeSetInfo;
  if (attrSetInfo && typeof attrSetInfo === 'object') {
    Object.entries(attrSetInfo).forEach(([, val]) => {
      if (val && typeof val === 'object' && val.label && val.value !== undefined) {
        specs[val.label] = String(val.value || '');
      }
    });
  }

  const defaultImage = apiProduct.defaultImage || {};
  const name = apiProduct.name || meta.name || '';

  return {
    id: apiProduct.id,
    sku: fields.StockKeepingUnit || apiProduct.sku || meta.sku || '',
    name,
    description: apiProduct.description || fields.Description || '',
    category: meta.category || '',
    image: defaultImage.url || '',
    price: '',
    specs,
    crossReferences: [],
    applications: [],
    breadcrumbs: [meta.category || ''],
    url: `https://www.fleetguard.com/es/producto/${slugify(name)}/${apiProduct.id}`,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Scraping de una categoría completa via API
 */
async function scrapeCategory(page, category) {
  log(`\n${'='.repeat(60)}`);
  log(`📂 Categoría: ${category.name}`);

  const categoryId = category.url.split('/').pop();
  const productList = await getCategoryProductIds(page, categoryId);
  log(`  📦 ${productList.length} productos en "${category.name}"`);
  return productList;
}

/**
 * Scraping completo: todas las categorías + detalles de cada producto via API
 */
async function scrapeAllProducts(page, categoryUrls, progress) {
  const completedIds = new Set(progress.completed);

  // Primero visitar homepage para obtener sesión Salesforce
  log('🌐 Obteniendo sesión de Fleetguard...');
  await navigateTo(page, CONFIG.BASE_URL + '/es/');
  await sleep(4000);

  // ── FASE 1: Recopilar todos los IDs de productos via API ─────────────────
  log('\n🔍 FASE 1: Recopilando productos via API...');

  const allProductList = [];
  for (const category of categoryUrls) {
    const productList = await scrapeCategory(page, category);
    productList.forEach(p => {
      if (!allProductList.find(x => x.id === p.id)) {
        allProductList.push({ ...p, category: category.name });
      }
    });
    await randomDelay();
  }

  log(`\n📝 Total: ${allProductList.length} productos únicos`);
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'product_ids.json'),
    JSON.stringify(allProductList, null, 2)
  );

  // ── FASE 2: Obtener detalles completos via API ────────────────────────────
  log('\n🔍 FASE 2: Obteniendo detalles de productos via API...');

  const toProcess = allProductList.filter(p => !completedIds.has(p.id));
  log(`📊 ${toProcess.length} por procesar (${allProductList.length - toProcess.length} ya completados)`);

  const allProcessed = [];
  const batchSize = 20;

  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize);
    const ids = batch.map(p => p.id);

    log(`  [${i + 1}-${Math.min(i + batchSize, toProcess.length)}/${toProcess.length}] Obteniendo detalles...`);

    const details = await getProductDetails(page, ids);
    details.forEach(detail => {
      const meta = batch.find(p => p.id === detail.id) || {};
      const product = buildProduct(detail, meta);
      allProcessed.push(product);
      progress.completed.push(detail.id);
      log(`  ✅ ${product.sku || 'N/A'} - ${product.name || 'Sin nombre'}`);
    });

    saveProducts(allProcessed.slice(-batchSize));
    saveProgress(progress);
    await randomDelay();
  }

  return allProcessed;
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
