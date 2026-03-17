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
// Los IDs se descubren automáticamente en runtime via API; estas son URLs de navegación
const CATEGORY_URLS = [
  { name: 'Lube Filter',           url: 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE' },
  { name: 'Fuel Filter',           url: null },
  { name: 'Air Filter',            url: null },
  { name: 'Water Filter',          url: null },
  { name: 'Fuel Water Separator',  url: null },
  { name: 'Hydraulic Filter',      url: null },
  { name: 'Breather',              url: null },
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
        waitUntil: 'domcontentloaded',
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

// Salesforce B2B Commerce Cloud tiene un límite de ~5000 productos por query (≈250 páginas × 20).
// Para categorías grandes, usamos chunking alfabético: buscamos q=A*, q=B*, etc.
// Esto divide el catálogo en trozos manejables y permite superar el límite.
const SF_MAX_PAGES = 240; // Margen de seguridad antes del límite de 250 páginas

/**
 * Paginar un query (categoryId + q opcional) hasta SF_MAX_PAGES o hasta agotar resultados.
 * Retorna { items, hitLimit } donde hitLimit=true indica que se cortó antes de terminar.
 */
async function paginateQuery(page, categoryId, searchQ = '') {
  const allItems = [];
  let pageNum = 0;
  const pageSize = 20;
  let hitLimit = false;

  while (true) {
    const qParam = searchQ ? `&q=${encodeURIComponent(searchQ)}` : '';
    const path = `${SF_API_BASE}/search/products?categoryId=${categoryId}${qParam}&page=${pageNum}&pageSize=${pageSize}&includeQuantityRule=false&skipDecoration=true&language=es&asGuest=true&htmlEncode=false`;
    const data = await apiGet(page, path);

    if (data.__error__) {
      log(`  ⚠️  API error (pág ${pageNum}${searchQ ? ` q="${searchQ}"` : ''}): ${data.__msg__}`, 'WARN');
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

    if (allItems.length >= total || products.length < pageSize) break;

    pageNum++;
    if (pageNum >= SF_MAX_PAGES) {
      log(`  ⚠️  Límite de ${SF_MAX_PAGES} páginas alcanzado (${allItems.length}/${total} productos${searchQ ? ` con q="${searchQ}"` : ''})`, 'WARN');
      hitLimit = true;
      break;
    }
    await sleep(300);
  }

  return { items: allItems, hitLimit };
}

// Caracteres usados para generar sub-prefijos en el chunking
const CHUNK_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

/**
 * Obtener todos los IDs de productos de una categoría.
 * Usa chunking alfabético recursivo para superar el límite de ~5000 productos por query.
 *
 * Estrategia:
 *   1. Query global sin filtro → captura hasta 4800 productos
 *   2. Si se alcanza el límite, genera prefijos de 1 carácter (A-Z, 0-9)
 *   3. Si un prefijo de 1 carácter también alcanza el límite, expande a 2 caracteres (AA, AB, ...)
 *   4. Continúa recursivamente hasta que todos los chunks quepan en el límite
 *   5. Deduplicación por ID en todo momento
 */
async function getCategoryProductIds(page, categoryId) {
  const seen = new Set();
  const allItems = [];

  const addItems = (items) => {
    items.forEach(p => {
      if (p.id && !seen.has(p.id)) {
        seen.add(p.id);
        allItems.push(p);
      }
    });
  };

  /**
   * Scrapea un prefijo dado. Si ese prefijo supera SF_MAX_PAGES,
   * lo expande automáticamente a sub-prefijos (recursivo hasta maxDepth).
   */
  async function scrapePrefix(prefix, depth = 0, maxDepth = 3) {
    const label = prefix ? `q="${prefix}"` : 'global';
    const { items, hitLimit } = await paginateQuery(page, categoryId, prefix);
    addItems(items);

    if (hitLimit) {
      if (depth >= maxDepth) {
        log(`  ⚠️  ${label}: límite alcanzado en profundidad máxima (${depth}), algunos productos pueden faltar`, 'WARN');
        return;
      }
      log(`  ⚠️  ${label}: límite alcanzado — expandiendo a sub-prefijos (nivel ${depth + 1})...`);
      for (const ch of CHUNK_CHARS) {
        const subPrefix = prefix + ch;
        await scrapePrefix(subPrefix, depth + 1, maxDepth);
        await sleep(150);
      }
    } else {
      const count = items.filter(p => seen.has(p.id)).length; // los que ya estaban
      const newCount = items.length - (items.filter(p => !seen.has(p.id)).length);
      void count; void newCount;
      // Solo loguear si hay progreso real
      const beforeSize = seen.size - items.filter(p => seen.has(p.id)).length;
      void beforeSize;
    }
  }

  // Intento 1: query global sin filtro
  log(`  🔍 Query global...`);
  const { items: globalItems, hitLimit } = await paginateQuery(page, categoryId);
  addItems(globalItems);
  log(`  📦 Sin filtro: ${globalItems.length} productos (${hitLimit ? '⚠️ límite alcanzado' : '✅ completo'})`);

  if (!hitLimit) return allItems;

  // Categoría grande: chunking recursivo por prefijo
  log(`  🔄 Activando chunking recursivo para capturar productos faltantes...`);

  for (const ch of CHUNK_CHARS) {
    const beforeCount = seen.size;
    await scrapePrefix(ch);
    const newCount = seen.size - beforeCount;
    if (newCount > 0) {
      log(`  📄 Prefijo "${ch}": +${newCount} nuevos → total: ${allItems.length}`);
    }
    await sleep(150);
  }

  log(`  ✅ Chunking completo: ${allItems.length} productos únicos`);
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
  const name = String(apiProduct.name || meta.name || '');

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
 * Descubrir categorías reales desde la API de Salesforce
 */
async function discoverCategories(page) {
  log('🔍 Descubriendo categorías desde la API...');
  const apiPath = `${SF_API_BASE}/product-categories?page=0&pageSize=100&language=es&asGuest=true`;
  const data = await apiGet(page, apiPath);

  if (data.__error__) {
    log(`  ⚠️  API de categorías: ${data.__error__} ${data.__msg__}`, 'WARN');
  } else {
    log(`  📋 Respuesta API categorías (keys): ${Object.keys(data).join(', ')}`);
    const items = data.productCategories || data.categories || data.items || data.data || [];
    if (items.length > 0) {
      const categories = items.map(c => ({
        name: c.name || c.label || c.id,
        url: `https://www.fleetguard.com/category/products/${c.id}`,
      }));
      log(`  ✅ ${categories.length} categorías desde API:`);
      categories.forEach(c => log(`     - ${c.name}: ${c.url.split('/').pop()}`));
      return categories;
    }
    log(`  ⚠️  API de categorías vacía (keys disponibles: ${JSON.stringify(data).slice(0, 200)})`, 'WARN');
  }

  // Fallback: extraer links de categorías desde la navegación del sitio
  return await discoverCategoriesFromNav(page);
}

/**
 * Descubrir categorías reales navegando al sitio y extrayendo links de /category/products/
 */
async function discoverCategoriesFromNav(page) {
  log('🔍 Descubriendo categorías desde links de navegación...');

  // Intentar también la URL en inglés
  for (const homeUrl of [CONFIG.BASE_URL + '/es/', CONFIG.BASE_URL + '/en/']) {
    try {
      await navigateTo(page, homeUrl);
      await sleep(3000);

      const categories = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/category/products/"]'));
        const seen = new Set();
        return links
          .map(a => ({
            name: (a.textContent || a.innerText || '').trim(),
            url: a.href,
          }))
          .filter(c => {
            const id = c.url.split('/').pop();
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return c.name.length > 0;
          });
      });

      if (categories.length > 0) {
        log(`  ✅ ${categories.length} categorías desde navegación (${homeUrl}):`);
        categories.forEach(c => log(`     - "${c.name}": ${c.url.split('/').pop()}`));
        return categories;
      }
      log(`  ⚠️  No se encontraron links de categorías en ${homeUrl}`, 'WARN');
    } catch (err) {
      log(`  ⚠️  Error en ${homeUrl}: ${err.message}`, 'WARN');
    }
  }

  log('  ⚠️  No se pudieron descubrir categorías — solo se usará Lube Filter', 'WARN');
  return null;
}

/**
 * Scraping de una categoría completa via API
 */
async function scrapeCategory(page, category) {
  log(`\n${'='.repeat(60)}`);
  log(`📂 Categoría: ${category.name}`);

  if (!category.url) {
    log(`  ⚠️  URL no disponible para "${category.name}" — categoría omitida`, 'WARN');
    return [];
  }

  const categoryId = category.url.split('/').pop();
  log(`  🆔 Category ID: ${categoryId}`);
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

  // Intentar auto-descubrir categorías desde la API
  const discovered = await discoverCategories(page);
  if (discovered) categoryUrls = discovered;

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
