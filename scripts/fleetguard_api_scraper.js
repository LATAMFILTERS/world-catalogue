/**
 * FLEETGUARD API SCRAPER
 *
 * Intenta extraer el catálogo usando la API interna de Salesforce Commerce Cloud
 * que usa fleetguard.com. Más rápido que Puppeteer, no requiere browser.
 *
 * USO:
 *   node scripts/fleetguard_api_scraper.js
 *   node scripts/fleetguard_api_scraper.js --test    → solo 10 productos de prueba
 *   node scripts/fleetguard_api_scraper.js --resume  → continuar scraping previo
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const OUTPUT_DIR = './fleetguard_catalog';
const DELAY_MS = 800; // ms entre requests

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/html, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://www.fleetguard.com/',
  'Origin': 'https://www.fleetguard.com',
};

// SKU prefixes de Fleetguard
const FLEETGUARD_PREFIXES = {
  LF: 'Lube Filter',
  FF: 'Fuel Filter',
  AF: 'Air Filter',
  WF: 'Water Filter',
  FS: 'Fuel Water Separator',
  HF: 'Hydraulic Filter',
  BV: 'Breather Vent',
  CV: 'Coolant Filter',
  ES: 'Element',
  RS: 'Racor Filter',
  DF: 'Diesel Filter',
};

// Rango de números a probar por prefijo
const SKU_RANGES = {
  LF: { start: 100,  end: 20000 },
  FF: { start: 100,  end: 10000 },
  AF: { start: 100,  end: 10000 },
  WF: { start: 1000, end: 10000 },
  FS: { start: 1000, end: 10000 },
  HF: { start: 100,  end: 10000 },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const log = (msg) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);

// ─── HTTP REQUEST ─────────────────────────────────────────────────────────────
function fetch(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: { ...HEADERS, ...extraHeaders },
      timeout: 15000,
    };

    const req = protocol.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location;
        if (loc) return fetch(loc.startsWith('http') ? loc : 'https://www.fleetguard.com' + loc, extraHeaders)
          .then(resolve).catch(reject);
      }

      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── PARSE JSON SAFELY ────────────────────────────────────────────────────────
function parseJSON(str) {
  try { return JSON.parse(str); }
  catch { return null; }
}

// ─── DESCUBRIR API ENDPOINTS ─────────────────────────────────────────────────
async function discoverApiEndpoints() {
  log('🔍 Descubriendo API endpoints de Fleetguard...');

  // Endpoints comunes de Salesforce B2C Commerce Cloud (SFCC/Demandware)
  const candidateApis = [
    // SFCC OCAPI
    '/s/fleetguard/dw/shop/v22_4/product_search?q=LF3620&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    '/on/demandware.store/Sites-fleetguard-Site/en_US/Search-Show?q=LF3620&format=ajax',
    // SFCC SCAPI
    '/product/shopper-products/v1/organizations/f_ecom_bhce_prd/products/LF3620',
    // Generic API patterns
    '/api/products?sku=LF3620',
    '/api/v1/products?partNumber=LF3620',
    '/api/catalog/products?search=LF3620',
    // GraphQL
    '/graphql',
  ];

  const discovered = [];

  for (const endpoint of candidateApis) {
    const url = 'https://www.fleetguard.com' + endpoint;
    try {
      const { status, body } = await fetch(url);
      if (status === 200) {
        const json = parseJSON(body);
        if (json) {
          log(`✅ API encontrada: ${endpoint}`);
          discovered.push({ endpoint, sample: json });
        }
      }
    } catch {
      // silently skip
    }
    await sleep(300);
  }

  return discovered;
}

// ─── PARSE PRODUCT FROM HTML ─────────────────────────────────────────────────
function parseProductFromHtml(html, url) {
  // Extraer datos de JSON-LD (schema.org)
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      const content = script.replace(/<script[^>]*>|<\/script>/gi, '');
      const data = parseJSON(content);
      if (data && (data['@type'] === 'Product' || (Array.isArray(data) && data.find(d => d['@type'] === 'Product')))) {
        const product = Array.isArray(data) ? data.find(d => d['@type'] === 'Product') : data;
        return {
          sku: product.sku || product.mpn || '',
          name: product.name || '',
          description: product.description || '',
          image: Array.isArray(product.image) ? product.image[0] : (product.image || ''),
          price: product.offers?.price || '',
          brand: product.brand?.name || 'Fleetguard',
          specs: {},
          crossReferences: [],
          applications: [],
          url,
          scrapedAt: new Date().toISOString(),
          source: 'json-ld',
        };
      }
    }
  }

  // Extraer de window.__INITIAL_STATE__ o similar
  const stateMatch = html.match(/window\.__(?:INITIAL_STATE|DATA|STORE|STATE)__\s*=\s*({[\s\S]*?});/);
  if (stateMatch) {
    const state = parseJSON(stateMatch[1]);
    if (state) {
      // Intentar encontrar datos del producto en el estado
      const productData = state.product || state.pdp?.product || state.catalog?.currentProduct;
      if (productData) {
        return {
          sku: productData.id || productData.sku || productData.partNumber || '',
          name: productData.name || productData.title || '',
          description: productData.description || productData.shortDescription || '',
          image: productData.imageUrl || productData.image?.src || '',
          price: productData.price?.value || productData.listPrice || '',
          brand: productData.brand || 'Fleetguard',
          specs: productData.attributes || productData.specs || {},
          crossReferences: productData.crossReferences || productData.interchange || [],
          applications: productData.applications || productData.fitment || [],
          url,
          scrapedAt: new Date().toISOString(),
          source: 'window-state',
        };
      }
    }
  }

  // Extraer datos crudos con regex
  const product = {
    sku: '',
    name: '',
    description: '',
    image: '',
    price: '',
    brand: 'Fleetguard',
    specs: {},
    crossReferences: [],
    applications: [],
    url,
    scrapedAt: new Date().toISOString(),
    source: 'html-regex',
  };

  // SKU desde URL o meta tags
  const skuFromUrl = url.match(/(LF|FF|AF|WF|FS|HF|BV|CV|ES|RS|DF)\d{3,6}[A-Z]?/i);
  if (skuFromUrl) product.sku = skuFromUrl[0].toUpperCase();

  // SKU desde meta tags
  const skuMeta = html.match(/content="([A-Z]{2}\d{3,6}[A-Z]?)"[^>]*name="sku"/i);
  if (skuMeta) product.sku = skuMeta[1];

  // Nombre del producto
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                     html.match(/<title>([^|<]+)/i);
  if (titleMatch) product.name = titleMatch[1].trim();

  // Meta description
  const descMatch = html.match(/name="description"[^>]*content="([^"]+)"/i) ||
                    html.match(/content="([^"]+)"[^>]*name="description"/i);
  if (descMatch) product.description = descMatch[1];

  // Imagen OG
  const imgMatch = html.match(/property="og:image"[^>]*content="([^"]+)"/i) ||
                   html.match(/content="([^"]+)"[^>]*property="og:image"/i);
  if (imgMatch) product.image = imgMatch[1];

  return product;
}

// ─── SCRAPE SINGLE PRODUCT ───────────────────────────────────────────────────
async function scrapeProduct(sku) {
  // Intentar URL directa del producto
  const urls = [
    `https://www.fleetguard.com/product/${sku}`,
    `https://www.fleetguard.com/products/${sku}`,
    `https://www.fleetguard.com/parts/${sku}`,
    `https://www.fleetguard.com/catalog/${sku}`,
  ];

  for (const url of urls) {
    try {
      const { status, body } = await fetch(url);
      if (status === 200 && body.length > 500) {
        return parseProductFromHtml(body, url);
      }
    } catch {
      // try next URL
    }
  }

  return null;
}

// ─── MAIN CATALOG EXTRACTION ─────────────────────────────────────────────────
async function extractFromCategoryPage(categoryUrl) {
  log(`📂 Extrayendo categoría: ${categoryUrl}`);

  const products = [];
  let url = categoryUrl;
  let page = 1;

  while (url) {
    try {
      const { status, body } = await fetch(url);
      if (status !== 200) break;

      // Extraer SKUs visibles en la página
      const skuPattern = /\b(LF|FF|AF|WF|FS|HF|BV|CV)\d{3,6}[A-Z]?\b/gi;
      const foundSkus = new Set();
      let match;
      while ((match = skuPattern.exec(body)) !== null) {
        foundSkus.add(match[0].toUpperCase());
      }

      log(`  Página ${page}: encontrados ${foundSkus.size} SKUs`);

      // Extraer links de productos
      const productLinkPattern = /href="(\/(?:product|products|catalog)\/[^"]+)"/gi;
      const productUrls = new Set();
      while ((match = productLinkPattern.exec(body)) !== null) {
        productUrls.add('https://www.fleetguard.com' + match[1]);
      }

      // Intentar extraer datos JSON directamente de la página
      const jsonDataPattern = /\bproducts?\b.*?(\[{[\s\S]{20,500}?}\])/gi;
      while ((match = jsonDataPattern.exec(body)) !== null) {
        const data = parseJSON(match[1]);
        if (Array.isArray(data) && data[0]?.sku) {
          data.forEach(p => {
            if (p.sku) products.push({ ...p, url: url, scrapedAt: new Date().toISOString() });
          });
        }
      }

      // Siguiente página
      const nextMatch = body.match(/href="([^"]*(?:page=\d+|offset=\d+)[^"]*)"[^>]*(?:class|aria-label)="[^"]*next/i) ||
                        body.match(/(?:class|aria-label)="[^"]*next[^"]*"[^>]*href="([^"]*)"/i);

      if (nextMatch && nextMatch[1] !== url) {
        url = nextMatch[1].startsWith('http')
          ? nextMatch[1]
          : 'https://www.fleetguard.com' + nextMatch[1];
        page++;
      } else {
        url = null;
      }

      await sleep(DELAY_MS);
    } catch (err) {
      log(`  ⚠️ Error: ${err.message}`);
      break;
    }
  }

  return products;
}

// ─── EXPORT FUNCTIONS ─────────────────────────────────────────────────────────
function saveResults(products) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // JSON completo
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'products.json'),
    JSON.stringify(products, null, 2)
  );

  // CSV de productos
  const csvLines = ['sku,name,description,image,price,url'];
  products.forEach(p => {
    csvLines.push([
      p.sku, p.name, p.description, p.image, p.price, p.url
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'products.csv'), csvLines.join('\n'));

  // CSV de cross references
  const crossLines = ['sku,brand,part_number'];
  products.forEach(p => {
    (p.crossReferences || []).forEach(cr => {
      crossLines.push([p.sku, cr.brand || cr.Brand || '', cr.partNumber || cr['Part Number'] || '']
        .map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
    });
  });
  if (crossLines.length > 1) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'cross_references.csv'), crossLines.join('\n'));
  }

  log(`\n💾 Guardados ${products.length} productos en ${OUTPUT_DIR}/`);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const isResume = args.includes('--resume');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  log('🚀 Fleetguard API Scraper iniciado');

  // 1. Intentar descubrir API endpoints
  const apis = await discoverApiEndpoints();

  // 2. Extraer desde la página de categoría conocida
  const categoryUrl = 'https://www.fleetguard.com/category/products/0ZGPL0000000F8j4AE';
  const products = await extractFromCategoryPage(categoryUrl);

  // 3. Si encontramos pocos productos, guardar lo que tenemos
  if (products.length > 0) {
    saveResults(products);
    log(`✅ Total extraído: ${products.length} productos`);
  } else {
    log('⚠️  No se pudieron extraer productos directamente.');
    log('💡 Usa el scraper con Puppeteer (scripts/scrape_fleetguard_catalog.js) para sitios con JS dinámico.');
  }

  // 4. Guardar reporte de descubrimiento
  const report = {
    date: new Date().toISOString(),
    categoryUrl,
    apisFound: apis.length,
    productsFound: products.length,
    note: apis.length === 0
      ? 'El sitio usa JavaScript dinámico. Se requiere Puppeteer para extracción completa.'
      : `APIs encontradas: ${apis.map(a => a.endpoint).join(', ')}`,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'scraper_report.json'),
    JSON.stringify(report, null, 2)
  );

  log('\n📋 Reporte guardado en: ' + path.join(OUTPUT_DIR, 'scraper_report.json'));
}

main().catch(console.error);
