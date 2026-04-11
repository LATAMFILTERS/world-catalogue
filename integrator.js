/**
 * INTEGRATOR.JS — Pipeline Unificado ELIMFILTERS (standalone)
 *
 * Nodos:
 *  [1] INPUT CODE(S)
 *  [2] SCRAPER  → Donaldson shop API (https nativo, sin axios)
 *  [3] CLASIFICACIÓN → filter_type por patrón de código
 *  [4] SKU GENERATOR → TRILOGY STANDARD/PERFORMANCE/ELITE
 *  [5] EQUIPMENT APPLICATIONS → normalización
 *  [6] POSTGRES UPSERT → elimfilters_catalog
 *  [7] RESULTADO
 *
 * Uso: node integrator.js P551808
 *      node integrator.js P551808 P552100 P527682
 */

const https = require('https');
const { Client } = require('pg');

// ─── DB ───────────────────────────────────────────────────────────────────────
const dbConfig = {
  host: 'ballast.proxy.rlwy.net', port: 18263, database: 'railway',
  user: 'postgres', password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

// ─── NODO 2: SCRAPER (Donaldson) ──────────────────────────────────────────────
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json, text/html' }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractText(html, selector) {
  // Extrae texto de un tag por class o atributo
  const m = html.match(new RegExp(`class="${selector}"[^>]*>([^<]+)<`, 'i'));
  return m ? m[1].trim() : null;
}

function extractSpecs(html) {
  const specs = {};
  // Busca pares clave/valor en tablas de especificaciones
  const rows = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  for (const row of rows) {
    const cells = (row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').trim());
    if (cells.length >= 2 && cells[0] && cells[1]) {
      const key = cells[0].toLowerCase().replace(/[\s\-\/]+/g, '_');
      specs[key] = cells[1];
    }
  }
  return specs;
}

function extractOemCodes(html) {
  // Busca tabla de cross-references en la página de producto Donaldson
  const codes = [];
  const tableMatch = html.match(/cross.reference[\s\S]{0,200}<table([\s\S]*?)<\/table>/i);
  if (!tableMatch) return codes;
  const rows = tableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  for (const row of rows) {
    const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [])
      .map(c => c.replace(/<[^>]+>/g, '').trim());
    if (cells.length >= 2 && cells[0] && cells[1] && cells[0] !== 'Brand')
      codes.push({ manufacturer: cells[0].toUpperCase(), code: cells[1].toUpperCase() });
  }
  return codes;
}

async function scrapeDonaldson(code) {
  try {
    // Intento 1: URL directa de producto
    const directUrl = `https://www.donaldson.com/en-us/industrial-dust-collection/filters-filter-media/${code.toLowerCase()}/`;
    // Intento 2: búsqueda en shop
    const searchUrl = `https://shop.donaldson.com/store/en-us/home?Ntt=${encodeURIComponent(code)}`;

    const { status, body } = await httpsGet(searchUrl);
    if (status !== 200) return { success: false };

    const specs = extractSpecs(body);
    const oemCodes = extractOemCodes(body);

    // Buscar descripción
    const descMatch = body.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const description = descMatch ? descMatch[1].trim() : '';

    return { success: true, description, specs, oem_codes: oemCodes };
  } catch {
    return { success: false };
  }
}

// ─── NODO 3: CLASIFICACIÓN ────────────────────────────────────────────────────
const FILTER_PATTERNS = [
  // Donaldson
  { re: /^P\d/i,      type: 'OIL',            prefix: 'EL8' },
  { re: /^R\d/i,      type: 'AIR',            prefix: 'EA1' },
  { re: /^X\d/i,      type: 'FUEL',           prefix: 'EF9' },
  { re: /^FF/i,       type: 'FUEL',           prefix: 'EF9' },
  { re: /^LF/i,       type: 'OIL',            prefix: 'EL8' },
  { re: /^DBL/i,      type: 'OIL',            prefix: 'EL8' },
  { re: /^DF/i,       type: 'FUEL',           prefix: 'EF9' },
  { re: /^DBA/i,      type: 'AIR',            prefix: 'EA1' },
  { re: /^HH/i,       type: 'HYDRAULIC',      prefix: 'EH6' },
  // FRAM
  { re: /^PH/i,       type: 'OIL',            prefix: 'EL8' },
  { re: /^XG/i,       type: 'OIL',            prefix: 'EL8' },
  { re: /^CA/i,       type: 'CABIN',          prefix: 'EC1' },
  { re: /^CF/i,       type: 'CABIN',          prefix: 'EC1' },
  { re: /^PS/i,       type: 'FUEL',           prefix: 'EF9' },
  // Racor
  { re: /^\d{4}(FH|MA)/i, type: 'TURBINE',   prefix: 'ET9' },
  { re: /^900\d/i,    type: 'TURBINE',        prefix: 'ET9' },
  // ELIMFILTERS internal
  { re: /^EL8/,       type: 'OIL',            prefix: 'EL8' },
  { re: /^EA1/,       type: 'AIR',            prefix: 'EA1' },
  { re: /^EF9/,       type: 'FUEL',           prefix: 'EF9' },
  { re: /^EH6/,       type: 'HYDRAULIC',      prefix: 'EH6' },
  { re: /^ES9/,       type: 'FUEL_SEPARATOR', prefix: 'ES9' },
  { re: /^EC1/,       type: 'CABIN',          prefix: 'EC1' },
  { re: /^ET9/,       type: 'TURBINE',        prefix: 'ET9' },
  { re: /^ED4/,       type: 'AIR_DRYER',      prefix: 'ED4' },
];

function classifyCode(code) {
  const c = code.toUpperCase().trim();
  for (const p of FILTER_PATTERNS) {
    if (p.re.test(c)) return { filter_type: p.type, prefix: p.prefix };
  }
  return { filter_type: 'OIL', prefix: 'EL8' }; // default
}

// ─── NODO 4: SKU GENERATOR ────────────────────────────────────────────────────
// Formato: PREFIX + últimos 4 dígitos del código de origen
// HD (Donaldson): P551808 → EL8 + "1808" = EL81808
// LD (FRAM):      PH4967  → EL8 + "4967" = EL84967

function getLast4Digits(code) {
  const digits = code.replace(/\D/g, '');
  return digits.slice(-4).padStart(4, '0');
}

async function generateSKU(client, inputCode, filterType, prefix) {
  const correlative = getLast4Digits(inputCode);
  const sku = `${prefix}${correlative}`;

  // Si ya existe ese SKU, lo retorna igualmente (upsert lo actualizará)
  return [{
    sku,
    filter_type: filterType,
    technology: 'DURATEC',
    variant: 'STANDARD',
    codigo_base: inputCode.toUpperCase()
  }];
}

// ─── NODO 5: EQUIPMENT APPLICATIONS ──────────────────────────────────────────
function normalizeApps(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(item => {
    if (typeof item === 'string' && item.trim()) return { description: item.trim() };
    if (typeof item === 'object' && item) {
      const e = {};
      const model = item.machine || item.equipment || item.model;
      const make  = item.make || item.brand || item.manufacturer;
      if (model) e.model = String(model).trim();
      if (make)  e.make  = String(make).trim();
      if (item.year)   e.year   = String(item.year).trim();
      if (item.engine) e.engine = String(item.engine).trim();
      if (Object.keys(e).length) return e;
    }
    return null;
  }).filter(Boolean);
}

// ─── NODO 6: POSTGRES UPSERT ──────────────────────────────────────────────────
async function upsert(client, row) {
  await client.query(`
    INSERT INTO elimfilters_catalog (
      sku, codigo_base, filter_type, technology,
      height_mm, outer_diameter_mm, thread_size, micron_rating,
      duty, oem_codes, competitor_codes, equipment_applications
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb)
    ON CONFLICT (sku) DO UPDATE SET
      codigo_base   = COALESCE(EXCLUDED.codigo_base, elimfilters_catalog.codigo_base),
      filter_type   = COALESCE(EXCLUDED.filter_type, elimfilters_catalog.filter_type),
      technology    = COALESCE(EXCLUDED.technology, elimfilters_catalog.technology),
      height_mm     = COALESCE(EXCLUDED.height_mm, elimfilters_catalog.height_mm),
      outer_diameter_mm = COALESCE(EXCLUDED.outer_diameter_mm, elimfilters_catalog.outer_diameter_mm),
      thread_size   = COALESCE(EXCLUDED.thread_size, elimfilters_catalog.thread_size),
      micron_rating = COALESCE(EXCLUDED.micron_rating, elimfilters_catalog.micron_rating),
      duty          = COALESCE(EXCLUDED.duty, elimfilters_catalog.duty),
      oem_codes     = CASE
        WHEN elimfilters_catalog.oem_codes IS NULL OR elimfilters_catalog.oem_codes = '[]'::jsonb
        THEN EXCLUDED.oem_codes ELSE elimfilters_catalog.oem_codes END,
      equipment_applications = CASE
        WHEN elimfilters_catalog.equipment_applications IS NULL OR elimfilters_catalog.equipment_applications = '[]'::jsonb
        THEN EXCLUDED.equipment_applications ELSE elimfilters_catalog.equipment_applications END
  `, [
    row.sku, row.codigo_base, row.filter_type, row.technology,
    row.height_mm || null, row.outer_diameter_mm || null,
    row.thread_size || null, row.micron_rating || null,
    row.duty || 'HEAVY_DUTY',
    JSON.stringify(row.oem_codes || []),
    JSON.stringify(row.competitor_codes || []),
    JSON.stringify(row.equipment_applications || [])
  ]);
}

// ─── PIPELINE PRINCIPAL ───────────────────────────────────────────────────────
async function processCode(client, inputCode) {
  const code = inputCode.trim().toUpperCase();
  process.stdout.write(`[1] ${code} `);

  // [2] Scraping
  process.stdout.write(`→ scraping `);
  const scraped = await scrapeDonaldson(code);

  // [3] Clasificación — busca primero en DB por oem_codes, fallback por patrón
  let { filter_type, prefix } = classifyCode(code);
  const dbMatch = await client.query(
    `SELECT filter_type FROM elimfilters_catalog
     WHERE EXISTS (
       SELECT 1 FROM jsonb_array_elements(oem_codes) e
       WHERE UPPER(e->>'code') = $1 OR UPPER(e->>'partNumber') = $1
     ) LIMIT 1`,
    [code]
  );
  if (dbMatch.rows.length > 0 && dbMatch.rows[0].filter_type) {
    const dbType = dbMatch.rows[0].filter_type.toUpperCase();
    const remap = classifyCode(dbType + '0000'); // get prefix from db type
    if (remap.prefix !== 'EL8' || dbType.includes('OIL') || dbType.includes('LUBE')) {
      // Solo reasigna si el DB tiene algo más específico
      const typeMap = {
        'AIR': {filter_type:'AIR', prefix:'EA1'},
        'AIRE': {filter_type:'AIR', prefix:'EA1'},
        'FUEL': {filter_type:'FUEL', prefix:'EF9'},
        'COMBUSTIBLE': {filter_type:'FUEL', prefix:'EF9'},
        'HYDRAULIC': {filter_type:'HYDRAULIC', prefix:'EH6'},
        'HIDRAULICO': {filter_type:'HYDRAULIC', prefix:'EH6'},
        'LUBE': {filter_type:'OIL', prefix:'EL8'},
        'OIL': {filter_type:'OIL', prefix:'EL8'},
        'FUEL_SEPARATOR': {filter_type:'FUEL_SEPARATOR', prefix:'ES9'},
        'SEPARATOR': {filter_type:'FUEL_SEPARATOR', prefix:'ES9'},
        'CABIN': {filter_type:'CABIN', prefix:'EC1'},
      };
      for (const [key, val] of Object.entries(typeMap)) {
        if (dbType.includes(key)) { ({ filter_type, prefix } = val); break; }
      }
    }
  }
  process.stdout.write(`→ ${filter_type} `);

  // [4] SKU Trilogy
  const trilogy = await generateSKU(client, code, filter_type, prefix);
  process.stdout.write(`→ SKUs: ${trilogy.map(t => t.sku).join(', ')} `);

  // [5] Equipment apps
  const apps = normalizeApps(scraped.equipment_applications || []);

  // [6] OEM codes del scraping
  const oemCodes = (scraped.oem_codes || []).filter(c => c.manufacturer && c.code);

  // Specs
  const specs = scraped.specs || {};

  // [7] Upsert
  const inserted = [];
  for (const t of trilogy) {
    await upsert(client, {
      ...t,
      height_mm:         parseFloat(specs.height_mm || specs.height) || null,
      outer_diameter_mm: parseFloat(specs.outer_diameter || specs.od) || null,
      thread_size:       specs.thread_size || specs.thread || null,
      micron_rating:     specs.micron_rating || specs.micron || null,
      oem_codes:         oemCodes,
      competitor_codes:  [],
      equipment_applications: apps
    });
    inserted.push(t.sku);
  }

  console.log(`→ OK`);
  return { code, filter_type, skus: inserted };
}

async function integrate(codes) {
  if (!Array.isArray(codes)) codes = [codes];
  const client = new Client(dbConfig);
  await client.connect();
  console.log(`Conectado. Procesando ${codes.length} código(s)...\n`);

  const results = [];
  try {
    for (const code of codes) {
      try {
        results.push(await processCode(client, code));
      } catch (e) {
        console.log(`\n  ERROR ${code}: ${e.message}`);
        results.push({ code, error: e.message });
      }
    }
  } finally {
    await client.end();
  }

  const ok = results.filter(r => !r.error);
  const totalSkus = ok.reduce((s, r) => s + (r.skus?.length || 0), 0);
  console.log(`\nCompleto: ${ok.length}/${codes.length} exitosos, ${totalSkus} SKUs insertados.`);
  return results;
}

module.exports = { integrate };

// CLI: node integrator.js P551808 P552100
if (require.main === module) {
  const codes = process.argv.slice(2);
  if (!codes.length) { console.error('Uso: node integrator.js CODIGO1 CODIGO2 ...'); process.exit(1); }
  integrate(codes).then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1); });
}
