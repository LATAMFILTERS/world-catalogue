'use strict';
/** Fleetguard Fuel Processor -> Fuel Filter Housing extractor.
 * Evidence-first: discovers the complete current category through Fleetguard's
 * public Commerce API, includes only official housing classifications, enriches
 * each accepted part, and never writes PostgreSQL directly.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.fleetguard.com';
const API = `${BASE}/es/webruntime/api`;
const DATA = `${API}/services/data/v67.0`;
const WEBSTORE = '0ZEPL0000001Jv34AE';
const CATEGORY = '0ZGPL0000000FSi4AM';
const PRODUCT_APEX = '@udd/01pPL000001p0sJ';
const OUT = path.join(__dirname, 'Fleetguard Scraper');
const ALIASES = new Set([
  'carcasa de combustible',
  'carcasa del filtro de combustible',
  'carcasa de filtro de combustible',
  'fuel filter housing',
  'fuel housing',
]);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const stamp = () => new Date().toISOString();

async function fetchJson(url, options = {}, retries = 4) {
  let last;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, headers: { 'user-agent': 'ELIMFILTERS catalog research/1.0', accept: 'application/json', ...(options.headers || {}) } });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      last = e;
      if (i + 1 < retries) await sleep(600 * (i + 1));
    }
  }
  throw new Error(`${last?.message || last} :: ${url}`);
}

function searchUrl(page) {
  const q = new URLSearchParams({ categoryId: CATEGORY, page: String(page), includeQuantityRule: 'false', skipDecoration: 'true', language: 'es', asGuest: 'true', htmlEncode: 'false' });
  return `${DATA}/commerce/webstores/${WEBSTORE}/search/products?${q}`;
}
function batchUrl(ids) {
  const q = new URLSearchParams({ ids: ids.join(','), includeAttributeSetInfo: 'true', includeQuantityRule: 'true', includeProductSellingModels: 'true', includeGroupByAttributeVariationInfo: 'true', language: 'es', asGuest: 'true', htmlEncode: 'false' });
  return `${DATA}/commerce/webstores/${WEBSTORE}/products?${q}`;
}
function apexUrl(method, params) {
  const q = new URLSearchParams({ cacheable: 'true', classname: PRODUCT_APEX, isContinuation: 'false', method, namespace: '', params: JSON.stringify(params), language: 'es', asGuest: 'true', htmlEncode: 'false' });
  return `${API}/apex/execute?${q}`;
}
function makeSku(code) {
  const digits = String(code || '').match(/\d/g) || [];
  if (digits.length < 4) throw new Error(`Cannot generate ET9: ${code}`);
  return `ET9${digits.slice(-4).join('')}`;
}
function isHousing(product) {
  const f = product.fields || {};
  const label = norm(f.CNPR_ShortDescRT__c);
  return { accepted: ALIASES.has(label), label, field: 'CNPR_ShortDescRT__c', classCode: f.Product_Class_Code__c || null, classDescription: f.Product_Class_Description__c || null };
}
function specObject(payload) {
  const out = {};
  for (const row of payload?.returnValue || []) {
    const key = row.displayName?.Trasnlatedlanguage__c || row.displayName?.Spec_Name__c || row.specName;
    if (key && row.specValue != null) out[key] = row.specValue;
  }
  return out;
}
function crossRows(value) {
  return Object.entries(value || {}).flatMap(([brand, raw]) => String(raw || '').split(/[,;]+/).map(code => code.trim()).filter(Boolean).map(code => ({ brand, code })));
}
async function discoverUniverse() {
  const first = await fetchJson(searchUrl(0));
  const total = Number(first.productsPage?.total ?? first.categories?.productCount ?? 0);
  const pageSize = Number(first.productsPage?.pageSize || 20);
  if (!total || !pageSize) throw new Error('Fleetguard category did not report total/pageSize');
  const pages = Math.ceil(total / pageSize);
  const ids = [];
  const pageLog = [];
  for (let page = 0; page < pages; page++) {
    const data = page === 0 ? first : await fetchJson(searchUrl(page));
    const rows = data.productsPage?.products || [];
    pageLog.push({ page, count: rows.length });
    for (const row of rows) if (row.id) ids.push(row.id);
  }
  const unique = [...new Set(ids)];
  if (unique.length !== total) throw new Error(`Universe mismatch: API total=${total}, unique ids=${unique.length}`);
  return { total, pageSize, pages, ids: unique, pageLog };
}

async function fetchProducts(ids) {
  const all = [];
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20);
    const data = await fetchJson(batchUrl(batch));
    all.push(...(data.products || []));
    process.stdout.write(`\rFleetguard product metadata ${Math.min(i + 20, ids.length)}/${ids.length}`);
  }
  process.stdout.write('\n');
  return all;
}
async function enrich(product, index, total) {
  const f = product.fields || {};
  const code = String(f.ProductCode || f.StockKeepingUnit || product.name || '').trim().toUpperCase();
  const classification = isHousing(product);
  if (!classification.accepted) return null;
  const [specsRaw, crossRaw, equipmentRaw, relatedRaw] = await Promise.all([
    fetchJson(apexUrl('retrieveProductSpecifications', { language: 'es', productId: product.id, productName: null })),
    fetchJson(apexUrl('getCrossReferences', { productId: product.id })),
    fetchJson(apexUrl('getRelatedEquipments', { limitToOne: false, productId: product.id })),
    fetchJson(apexUrl('replaceAndUpgrade', { accountId: null, isSimplifiedVersion: false, productId: product.id })),
  ]);
  const row = {
    fleetguard_id: product.id,
    codigo_base: code,
    sku: makeSku(code),
    technology: 'TURBOCORE™',
    filter_type: 'fuel',
    sub_type: 'Fuel Filter Housing',
    classification,
    description_es: f.CNPR_LongDescRT__c || f.Description || null,
    description_en: f.LongDesc__c || null,
    additional_information: f.CNPR_Additional_Information__c || null,
    region: f.Product_Region__c || null,
    mounting_configuration: f.Mounting_Configuration__c || null,
    product_status: f.ProductStatus__c || null,
    obsolete: f.ObsoleteFlag__c || null,
    saleable: f.SaleableFlag__c || null,
    specs: specObject(specsRaw),
    specs_raw: specsRaw.returnValue || [],
    cross_references: crossRows(crossRaw.returnValue),
    cross_references_raw: crossRaw.returnValue || {},
    equipment_applications: equipmentRaw.returnValue || [],
    related_parts: relatedRaw.returnValue || {},
    image_url: product.defaultImage?.url || null,
    source_url: `${BASE}/es/product/${encodeURIComponent(code)}`,
    fleetguard_fields: f,
    scraped_at: stamp(),
  };
  console.log(`[${index}/${total}] ${code} -> ${row.sku}`);
  return row;
}

function collisionReport(rows) {
  const m = new Map();
  for (const r of rows) {
    if (!m.has(r.sku)) m.set(r.sku, new Set());
    m.get(r.sku).add(r.codigo_base);
  }
  return [...m.entries()].filter(([, codes]) => codes.size > 1).map(([sku, codes]) => ({ sku, codigo_base: [...codes].sort() }));
}
function writeJson(file, value) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, file), JSON.stringify(value, null, 2), 'utf8'); }
function writeJsonl(file, rows) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, file), rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8'); }

async function main() {
  console.log('Fleetguard Fuel Filter Housing extraction');
  const universe = await discoverUniverse();
  console.log(`Current Fleetguard category universe: ${universe.total} products, ${universe.pageSize}/API page, ${universe.pages} API pages`);
  const products = await fetchProducts(universe.ids);
  const uniqueProducts = new Map(products.map(p => [p.id, p]));
  if (uniqueProducts.size !== universe.total) throw new Error(`Metadata mismatch: expected ${universe.total}, got ${uniqueProducts.size}`);

  const acceptedMeta = [];
  const excluded = [];
  const suspicious = [];
  for (const p of uniqueProducts.values()) {
    const c = isHousing(p);
    const f = p.fields || {};
    const summary = { id: p.id, code: f.ProductCode || f.StockKeepingUnit || p.name, short_description: f.CNPR_ShortDescRT__c || null, class_code: f.Product_Class_Code__c || null, class_description: f.Product_Class_Description__c || null };
    if (c.accepted) acceptedMeta.push(p); else excluded.push(summary);
    if (!c.accepted && c.classCode === 'FHB') suspicious.push(summary);
  }
  console.log(`Strict housing classification: ${acceptedMeta.length}; excluded non-housings: ${excluded.length}`);
  const rows = [];
  const errors = [];
  for (let i = 0; i < acceptedMeta.length; i++) {
    try { rows.push(await enrich(acceptedMeta[i], i + 1, acceptedMeta.length)); }
    catch (error) {
      const f = acceptedMeta[i].fields || {};
      errors.push({ id: acceptedMeta[i].id, code: f.ProductCode || f.StockKeepingUnit || acceptedMeta[i].name, error: error.message });
      console.error(`[${i + 1}/${acceptedMeta.length}] ERROR ${errors.at(-1).code}: ${error.message}`);
    }
    await sleep(120);
  }

  rows.sort((a, b) => a.sku.localeCompare(b.sku) || a.codigo_base.localeCompare(b.codigo_base));
  const collisions = collisionReport(rows);
  const audit = {
    source_category: `${BASE}/es/category/productos/filtraci%C3%B3n-de-combustible/procesadores-de-combustible/${CATEGORY}`,
    fleetguard_reported_total: universe.total,
    api_page_size: universe.pageSize,
    api_pages: universe.pages,
    page_log: universe.pageLog,
    metadata_records: uniqueProducts.size,
    accepted_fuel_filter_housings: rows.length,
    excluded_non_housings: excluded.length,
    strict_classification_aliases: [...ALIASES],
    suspicious_fhb_not_text_classified: suspicious,
    collisions,
    errors,
    import_ready: uniqueProducts.size === universe.total && !errors.length && !collisions.length && !suspicious.length,
    sku_rule: 'ET9 + last 4 numeric digits of Fleetguard code; alphabetic suffixes remain only in codigo_base',
    technology: 'TURBOCORE™',
    generated_at: stamp(),
  };
  writeJson('fleetguard_fuel-housings_results.json', rows);
  writeJson('fleetguard_fuel-housings_excluded.json', excluded);
  writeJson('fleetguard_fuel-housings_audit.json', audit);
  if (audit.import_ready) writeJsonl('fleetguard_fuel-housings_import_ready.jsonl', rows);
  else {
    const p = path.join(OUT, 'fleetguard_fuel-housings_import_ready.jsonl');
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  console.log(JSON.stringify({ total: universe.total, housings: rows.length, excluded: excluded.length, suspicious: suspicious.length, collisions: collisions.length, errors: errors.length, import_ready: audit.import_ready }, null, 2));
  if (!audit.import_ready) process.exitCode = 2;
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
