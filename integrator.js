/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INTEGRATOR.JS — Pipeline Unificado ELIMFILTERS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Conecta los nodos aislados en un flujo completo:
 *
 *  [1] INPUT CODE(S)
 *       ↓
 *  [2] MASTER SCRAPER (detecta fabricante → Donaldson/FRAM/Racor/Marine)
 *       ↓
 *  [3] CLASSIFICATION SERVICE (filter_type → EL8/EA1/EF9/EH6/ES9/...)
 *       ↓
 *  [4] SKU GENERATOR (genera TRILOGY STANDARD/PERFORMANCE/ELITE)
 *       ↓
 *  [5] DESCRIPTION SERVICE (enriquece con títulos, beneficios, media)
 *       ↓
 *  [6] EQUIPMENT APPLICATIONS (extrae y normaliza aplicaciones)
 *       ↓
 *  [7] POSTGRES UPSERT (ON CONFLICT DO UPDATE → elimfilters_catalog)
 *       ↓
 *  [8] RESULTADO (SKUs insertados, stats, errores)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('pg');
const filterOrchestrator = require('./services/filter.orchestrator');
const masterScraper      = require('./services/scrapers/master.scraper');
const skuGenerator       = require('./services/sku.generator');
const descriptionService = require('./services/description.service');
const classificationService = require('./services/classification.service');

// ─── DB Config ────────────────────────────────────────────────────────────────
const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
};

// ─── NODE 6: Normalizar equipment_applications ────────────────────────────────
function normalizeEquipmentApplications(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const result = [];
  for (const item of list) {
    if (!item) continue;
    if (typeof item === 'string' && item.trim()) {
      result.push({ description: item.trim() });
      continue;
    }
    if (typeof item === 'object') {
      const entry = {};
      if (item.machine || item.equipment || item.model)
        entry.model = (item.machine || item.equipment || item.model).toString().trim();
      if (item.make || item.brand || item.manufacturer)
        entry.make = (item.make || item.brand || item.manufacturer).toString().trim();
      if (item.year || item.years)
        entry.year = (item.year || item.years).toString().trim();
      if (item.engine)
        entry.engine = item.engine.toString().trim();
      if (item.type || item.filter_type)
        entry.type = (item.type || item.filter_type).toString().trim();
      if (Object.keys(entry).length > 0) result.push(entry);
    }
  }
  return result;
}

// ─── NODE 3: Clasificar tipo de filtro ────────────────────────────────────────
function resolveFilterType(scrapingResult, inputCode) {
  // Intenta desde el resultado del scraping
  const product = scrapingResult.main_product || scrapingResult.data || {};
  const desc = [
    product.description, product.category, product.filterType,
    scrapingResult.filter_type, inputCode
  ].filter(Boolean).join(' ').toLowerCase();

  if (desc.includes('hydraulic') || desc.includes('hidraul')) return 'HYDRAULIC';
  if (desc.includes('fuel') || desc.includes('combustible')) return 'FUEL';
  if (desc.includes('separator') || desc.includes('separador')) return 'FUEL_SEPARATOR';
  if (desc.includes('air') || desc.includes('aire')) return 'AIR';
  if (desc.includes('cabin') || desc.includes('cabina')) return 'CABIN';
  if (desc.includes('coolant') || desc.includes('refriger')) return 'COOLANT';
  if (desc.includes('marine') || desc.includes('marino')) return 'MARINE';
  if (desc.includes('dryer') || desc.includes('secador')) return 'AIR_DRYER';
  if (desc.includes('oil') || desc.includes('aceite') || desc.includes('lube')) return 'OIL';

  // Fallback: clasificación por código
  const classified = classificationService.classifyFilter(inputCode, desc);
  return classified?.category || 'OIL';
}

// ─── NODE 7: Upsert en PostgreSQL ──────────────────────────────────────────────
async function upsertFilter(client, skuData) {
  const {
    sku, codigo_base, filter_type, technology, installation_type,
    thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
    iso_test_method, micron_rating, nominal_efficiency,
    burst_pressure_psi, collapse_pressure_psi, duty,
    oem_codes, competitor_codes, equipment_applications
  } = skuData;

  await client.query(`
    INSERT INTO elimfilters_catalog (
      sku, codigo_base, filter_type, technology, installation_type,
      thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
      iso_test_method, micron_rating, nominal_efficiency,
      burst_pressure_psi, collapse_pressure_psi, duty,
      oem_codes, competitor_codes, equipment_applications
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
      $17::jsonb, $18::jsonb, $19::jsonb
    )
    ON CONFLICT (sku) DO UPDATE SET
      codigo_base            = COALESCE(EXCLUDED.codigo_base, elimfilters_catalog.codigo_base),
      filter_type            = COALESCE(EXCLUDED.filter_type, elimfilters_catalog.filter_type),
      technology             = COALESCE(EXCLUDED.technology, elimfilters_catalog.technology),
      installation_type      = COALESCE(EXCLUDED.installation_type, elimfilters_catalog.installation_type),
      thread_size            = COALESCE(EXCLUDED.thread_size, elimfilters_catalog.thread_size),
      height_mm              = COALESCE(EXCLUDED.height_mm, elimfilters_catalog.height_mm),
      outer_diameter_mm      = COALESCE(EXCLUDED.outer_diameter_mm, elimfilters_catalog.outer_diameter_mm),
      gasket_od_mm           = COALESCE(EXCLUDED.gasket_od_mm, elimfilters_catalog.gasket_od_mm),
      gasket_id_mm           = COALESCE(EXCLUDED.gasket_id_mm, elimfilters_catalog.gasket_id_mm),
      micron_rating          = COALESCE(EXCLUDED.micron_rating, elimfilters_catalog.micron_rating),
      nominal_efficiency     = COALESCE(EXCLUDED.nominal_efficiency, elimfilters_catalog.nominal_efficiency),
      burst_pressure_psi     = COALESCE(EXCLUDED.burst_pressure_psi, elimfilters_catalog.burst_pressure_psi),
      collapse_pressure_psi  = COALESCE(EXCLUDED.collapse_pressure_psi, elimfilters_catalog.collapse_pressure_psi),
      duty                   = COALESCE(EXCLUDED.duty, elimfilters_catalog.duty),
      oem_codes              = CASE
        WHEN elimfilters_catalog.oem_codes IS NULL OR elimfilters_catalog.oem_codes = '[]'::jsonb
        THEN EXCLUDED.oem_codes
        ELSE elimfilters_catalog.oem_codes
      END,
      competitor_codes       = CASE
        WHEN elimfilters_catalog.competitor_codes IS NULL OR elimfilters_catalog.competitor_codes = '[]'::jsonb
        THEN EXCLUDED.competitor_codes
        ELSE elimfilters_catalog.competitor_codes
      END,
      equipment_applications = CASE
        WHEN elimfilters_catalog.equipment_applications IS NULL OR elimfilters_catalog.equipment_applications = '[]'::jsonb
        THEN EXCLUDED.equipment_applications
        ELSE elimfilters_catalog.equipment_applications
      END
  `, [
    sku,
    codigo_base || null,
    filter_type || null,
    technology || null,
    installation_type || null,
    thread_size || null,
    height_mm || null,
    outer_diameter_mm || null,
    gasket_od_mm || null,
    gasket_id_mm || null,
    iso_test_method || null,
    micron_rating || null,
    nominal_efficiency || null,
    burst_pressure_psi || null,
    collapse_pressure_psi || null,
    duty || 'HEAVY_DUTY',
    JSON.stringify(oem_codes || []),
    JSON.stringify(competitor_codes || []),
    JSON.stringify(equipment_applications || [])
  ]);
}

// ─── PIPELINE COMPLETO ─────────────────────────────────────────────────────────
async function processCode(client, inputCode, opts = {}) {
  const { manufacturer = '', application = '', verbose = true } = opts;
  const log = verbose ? console.log : () => {};

  log(`\n── [1] INPUT: ${inputCode}`);

  // [2] SCRAPING
  log(`── [2] SCRAPING...`);
  let scrapingResult;
  try {
    scrapingResult = await masterScraper.scrape(inputCode);
  } catch (e) {
    log(`   SCRAPING ERROR: ${e.message}`);
    scrapingResult = { success: false };
  }

  // [3] CLASIFICACIÓN
  log(`── [3] CLASIFICACIÓN`);
  const filterType = resolveFilterType(scrapingResult, inputCode);
  log(`   → ${filterType}`);

  // [4] SKU GENERATION
  log(`── [4] SKU GENERATOR`);
  let trilogy;
  if (scrapingResult.success && scrapingResult.trilogy?.length > 0) {
    trilogy = scrapingResult.trilogy;
  } else {
    trilogy = skuGenerator.generateDirectTrilogy(inputCode, filterType);
  }

  // [5] DESCRIPTION ENRICHMENT
  log(`── [5] DESCRIPTIONS`);
  trilogy = trilogy.map(t => {
    try { return descriptionService.enrichSKU(t); } catch { return t; }
  });

  // [6] EQUIPMENT APPLICATIONS
  log(`── [6] EQUIPMENT APPLICATIONS`);
  const rawApplications = scrapingResult.raw_scraping_data?.main_product?.applications
    || scrapingResult.raw_scraping_data?.main_product?.equipment_applications
    || scrapingResult.data?.equipment_applications
    || [];
  const equipmentApps = normalizeEquipmentApplications(rawApplications);

  // Specs del scraping
  const mainProduct = scrapingResult.raw_scraping_data?.main_product || scrapingResult.data || {};
  const specs = mainProduct.specs || {};

  // OEM codes del scraping
  const oemCodes = (
    specs.oem_codes ||
    mainProduct.oem_codes ||
    scrapingResult.raw_scraping_data?.cross_references ||
    []
  ).map(c => {
    if (!c) return null;
    const mfr = (c.manufacturer || c.brand || '').toUpperCase().trim();
    const code = (c.code || c.partNumber || '').toUpperCase().trim();
    return (mfr && code) ? { manufacturer: mfr, code } : null;
  }).filter(Boolean);

  // [7] UPSERT
  log(`── [7] POSTGRES UPSERT (${trilogy.length} SKUs)`);
  const inserted = [];
  for (const t of trilogy) {
    const row = {
      sku:                  t.sku || t.elimfilters_sku,
      codigo_base:          inputCode.toUpperCase(),
      filter_type:          t.filter_type || filterType,
      technology:           t.technology || null,
      installation_type:    specs.installation_type || t.installation_type || null,
      thread_size:          specs.thread_size || t.thread_size || null,
      height_mm:            parseFloat(specs.height_mm || t.height_mm) || null,
      outer_diameter_mm:    parseFloat(specs.outer_diameter_mm || t.outer_diameter_mm) || null,
      gasket_od_mm:         parseFloat(specs.gasket_od_mm || t.gasket_od_mm) || null,
      gasket_id_mm:         parseFloat(specs.gasket_id_mm || t.gasket_id_mm) || null,
      iso_test_method:      specs.iso_test_method || null,
      micron_rating:        specs.micron_rating || t.micron_rating || null,
      nominal_efficiency:   parseFloat(specs.efficiency || t.efficiency) || null,
      burst_pressure_psi:   parseFloat(specs.max_pressure_psi || t.max_pressure_psi) || null,
      collapse_pressure_psi:parseFloat(specs.collapse_pressure_psi) || null,
      duty:                 t.duty || scrapingResult.duty || 'HEAVY_DUTY',
      oem_codes:            oemCodes,
      competitor_codes:     [],
      equipment_applications: equipmentApps
    };
    try {
      await upsertFilter(client, row);
      inserted.push(row.sku);
      log(`   ✓ ${row.sku} (${row.filter_type})`);
    } catch (e) {
      log(`   ✗ ${row.sku}: ${e.message}`);
    }
  }

  // [8] RESULTADO
  return {
    input_code:  inputCode,
    filter_type: filterType,
    skus:        inserted,
    scraper:     scrapingResult.source || 'NONE',
    apps_count:  equipmentApps.length,
    oem_count:   oemCodes.length
  };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function integrate(codes, opts = {}) {
  if (!Array.isArray(codes)) codes = [codes];

  const client = new Client(dbConfig);
  await client.connect();
  console.log(`INTEGRATOR: Conectado a PostgreSQL`);
  console.log(`Procesando ${codes.length} código(s)...\n`);

  const results = { success: [], failed: [], total: codes.length };

  try {
    for (const code of codes) {
      try {
        const r = await processCode(client, code, opts);
        results.success.push(r);
      } catch (e) {
        console.error(`ERROR ${code}: ${e.message}`);
        results.failed.push({ code, error: e.message });
      }
    }
  } finally {
    await client.end();
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`INTEGRATOR COMPLETO`);
  console.log(`  Exitosos: ${results.success.length}`);
  console.log(`  Fallidos: ${results.failed.length}`);
  const totalSkus = results.success.reduce((s, r) => s + r.skus.length, 0);
  console.log(`  SKUs insertados/actualizados: ${totalSkus}`);
  console.log('═'.repeat(50));

  return results;
}

module.exports = { integrate, processCode };

// ─── CLI directo: node integrator.js P551808 P552100 ──────────────────────────
if (require.main === module) {
  const codes = process.argv.slice(2);
  if (codes.length === 0) {
    console.error('Uso: node integrator.js CODIGO1 CODIGO2 ...');
    process.exit(1);
  }
  integrate(codes, { verbose: true })
    .then(() => process.exit(0))
    .catch(e => { console.error(e.message); process.exit(1); });
}
