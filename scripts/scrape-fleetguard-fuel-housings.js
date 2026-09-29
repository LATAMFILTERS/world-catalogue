'use strict';

/**
 * Fleetguard Fuel Filter Housing crawler.
 * Source: Fleetguard Fuel Processors category (18 pages).
 * Inclusion is strict: Fleetguard must classify the detail page as
 * "Carcasa del filtro de combustible" / "Fuel Filter Housing".
 * No direct DB writes. Produces an audited import-ready JSONL batch.
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('patchright');

const CATEGORY_URL = 'https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-combustible/procesadores-de-combustible/0ZGPL0000000FSi4AM';
const EXPECTED_PAGES = 18;
const OUT_DIR = path.join(__dirname, 'Fleetguard Scraper');
const TYPE_ALIASES = new Set([
  'carcasa del filtro de combustible',
  'carcasa de filtro de combustible',
  'fuel filter housing',
]);

function normalizeText(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function makeEt9Sku(code) {
  const digits = String(code || '').match(/\d/g)?.join('') || '';
  if (digits.length < 4) throw new Error(`Fleetguard code has fewer than 4 digits: ${code}`);
  return `ET9${digits.slice(-4)}`;
}
function atomicJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

async function waitRender(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.waitForFunction(() => document.body && document.body.innerText.length > 100, null, { timeout: 20000 });
  for (let i = 0; i < 4; i += 1) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function pageProducts(page) {
  return page.locator('li.product-item').evaluateAll((items) => items.map((item) => {
    const name = item.querySelector('h2.product-name');
    const category = item.querySelector('.category-section');
    return {
      code: (name?.textContent || '').trim(),
      recordId: name?.getAttribute('data-id') || null,
      category: (category?.innerText || category?.textContent || '').replace(/\s+/g, ' ').trim(),
    };
  }).filter((row) => row.code));
}

function productDetailUrl(product) {
  if (!product.recordId) throw new Error(`Missing Fleetguard recordId for ${product.code}`);
  return `https://www.fleetguard.com/es/product/${encodeURIComponent(product.code)}/${product.recordId}`;
}

function isHousingCategory(category) {
  return TYPE_ALIASES.has(normalizeText(category));
}
async function pageSignature(page) {
  const products = await pageProducts(page);
  return products.map((row) => row.code).join('|');
}

async function pageNumber(page) {
  const text = normalizeText(await page.locator('body').innerText());
  let m = text.match(/pagina\s+(\d+)\s+de\s+(\d+)/);
  if (!m) m = text.match(/page\s+(\d+)\s+of\s+(\d+)/);
  return m ? { current: Number(m[1]), total: Number(m[2]) } : { current: null, total: null };
}

async function clickNext(page) {
  const oldSignature = await pageSignature(page);
  const nextButtons = page.locator('.parts-footer button:has(svg[data-key="chevronright"])');
  for (let i = 0; i < await nextButtons.count(); i += 1) {
    const button = nextButtons.nth(i);
    if (!(await button.isVisible())) continue;
    if (await button.isDisabled().catch(() => false)) continue;
    await button.click();
    await page.waitForFunction((oldValue) => {
      const codes = [...document.querySelectorAll('li.product-item h2.product-name')].map((el) => el.textContent.trim()).join('|');
      return codes && codes !== oldValue;
    }, oldSignature, { timeout: 20000 }).catch(() => {});
    await waitRender(page);
    return (await pageSignature(page)) !== oldSignature;
  }
  return false;
}

async function collectCategoryUniverse(page, url, expectedPages) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitRender(page);
  const universe = new Map();
  const pages = [];
  for (let ordinal = 1; ordinal <= expectedPages; ordinal += 1) {
    const products = await pageProducts(page);
    const housings = products.filter((row) => isHousingCategory(row.category));
    const reported = await pageNumber(page);
    pages.push({ ordinal, reported_page: reported.current, reported_total: reported.total, products: products.length, housings: housings.length });
    if (reported.total && reported.total !== expectedPages) throw new Error(`Fleetguard reports ${reported.total} pages; expected ${expectedPages}`);
    if (reported.current && reported.current !== ordinal) throw new Error(`Pagination mismatch: expected page ${ordinal}, Fleetguard reports ${reported.current}`);
    for (const product of housings) universe.set(product.code, productDetailUrl(product));
    console.log(`[category ${ordinal}/${expectedPages}] products=${products.length} housings=${housings.length} unique_housings=${universe.size}`);
    if (ordinal < expectedPages && !(await clickNext(page))) {
      throw new Error(`Pagination stopped at page ${ordinal}; expected ${expectedPages}`);
    }
  }
  return { links: [...universe.values()], pages };
}

async function clickDetailSections(page) {
  const wanted = /oem cross reference|referencia cruzada oem|application|aplicacion|equipment|equipo/i;
  const buttons = page.getByRole('button');
  for (let i = 0; i < await buttons.count(); i += 1) {
    const button = buttons.nth(i);
    try {
      const label = normalizeText(await button.innerText());
      if (label && wanted.test(label) && await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(300);
      }
    } catch (_) {}
  }
}

async function headingClassification(page) {
  const headings = await page.locator('h1,h2,h3,h4').allInnerTexts();
  for (const heading of headings) {
    const normalized = normalizeText(heading);
    if (TYPE_ALIASES.has(normalized)) return normalized;
  }
  return null;
}

async function extractTables(page) {
  return page.locator('table').evaluateAll((tables) => tables.map((table) =>
    [...table.querySelectorAll('tr')].map((row) =>
      [...row.querySelectorAll('th,td')].map((cell) => cell.innerText.replace(/\s+/g, ' ').trim())
    ).filter((row) => row.length)
  ).filter((table) => table.length));
}
function extractSpecPairs(tables) {
  const pairs = {};
  for (const table of tables) {
    for (const row of table) {
      if (row.length === 2 && row[0] && row[1] && row[0].length < 100 && !(row[0] in pairs)) {
        pairs[row[0]] = row[1];
      }
    }
  }
  return pairs;
}

async function extractCode(page, url, bodyText) {
  const headings = await page.locator('h1,h2').allInnerTexts();
  for (const heading of headings) {
    const candidate = heading.trim().toUpperCase();
    if (/^[A-Z0-9-]{4,20}$/.test(candidate) && /\d/.test(candidate)) return candidate;
  }
  const slug = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || '').toUpperCase();
  if (/^[A-Z0-9-]{4,20}$/.test(slug) && /\d/.test(slug)) return slug;
  const match = bodyText.toUpperCase().match(/\b(?:FH\d{4,6}[A-Z]*|\d{7}[A-Z]?)\b/);
  if (!match) throw new Error(`Could not resolve Fleetguard part code from ${url}`);
  return match[0];
}

async function scrapeDetail(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitRender(page);
  await clickDetailSections(page);
  const bodyText = await page.locator('body').innerText();
  const classification = await headingClassification(page);
  const accepted = TYPE_ALIASES.has(classification);
  const code = await extractCode(page, page.url(), bodyText);
  const tables = await extractTables(page);
  return {
    url: page.url(),
    codigo_base: code,
    accepted,
    classification,
    sku: accepted ? makeEt9Sku(code) : null,
    technology: accepted ? 'TURBOCORE™' : null,
    filter_type: accepted ? 'fuel' : null,
    sub_type: accepted ? 'Fuel Filter Housing' : null,
    specs: extractSpecPairs(tables),
    tables,
    raw_text: bodyText,
    scraped_at: new Date().toISOString(),
  };
}

function collisionReport(records) {
  const bySku = new Map();
  for (const row of records) {
    if (!row.accepted || !row.sku) continue;
    if (!bySku.has(row.sku)) bySku.set(row.sku, new Set());
    bySku.get(row.sku).add(row.codigo_base);
  }
  return [...bySku.entries()]
    .filter(([, codes]) => codes.size > 1)
    .map(([sku, codes]) => ({ sku, codigo_base: [...codes].sort() }))
    .sort((a, b) => a.sku.localeCompare(b.sku));
}
function importRow(row) {
  return {
    sku: row.sku,
    codigo_base: row.codigo_base,
    filter_type: 'fuel',
    technology: 'TURBOCORE™',
    duty: 'HEAVY_DUTY',
    installation_type: 'Fuel Filter Housing',
    sub_type: 'Fuel Filter Housing',
    specs: row.specs || {},
    oem_codes: [],
    competitor_codes: [],
    source_url: row.url,
    enrichment_data: {
      fleetguard_classification: row.classification,
      fleetguard_tables: row.tables || [],
      scraped_at: row.scraped_at,
    },
  };
}

function writeJsonl(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, rows.map((row) => JSON.stringify(row)).join('\n') + '\n', 'utf8');
}

function hasFlag(name) {
  return process.argv.includes(name);
}
async function main() {
  const fresh = hasFlag('--fresh');
  const headed = hasFlag('--headed');
  const pagesArg = process.argv.find((arg) => arg.startsWith('--pages='));
  const expectedPages = pagesArg ? Number(pagesArg.split('=')[1]) : EXPECTED_PAGES;
  const urlArg = process.argv.find((arg) => arg.startsWith('--url='));
  const sourceUrl = urlArg ? urlArg.slice('--url='.length) : CATEGORY_URL;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const progressFile = path.join(OUT_DIR, 'fleetguard_fuel-housings_progress.json');
  const resultsFile = path.join(OUT_DIR, 'fleetguard_fuel-housings_results.json');
  const importFile = path.join(OUT_DIR, 'fleetguard_fuel-housings_import_ready.jsonl');
  const auditFile = path.join(OUT_DIR, 'fleetguard_fuel-housings_audit.json');

  let progress = { source_url: sourceUrl, expected_pages: expectedPages, links: [], pages: [], done: [] };
  let results = {};
  if (!fresh) {
    if (fs.existsSync(progressFile)) progress = { ...progress, ...JSON.parse(fs.readFileSync(progressFile, 'utf8')) };
    if (fs.existsSync(resultsFile)) results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  }

  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, locale: 'es-ES' });
  page.setDefaultTimeout(15000);
  try {
    if (!progress.links.length) {
      const category = await collectCategoryUniverse(page, sourceUrl, expectedPages);
      progress.links = category.links;
      progress.pages = category.pages;
      atomicJson(progressFile, progress);
      console.log(`Category universe: ${progress.links.length} unique product links`);
    }

    const done = new Set(progress.done || []);
    for (let i = 0; i < progress.links.length; i += 1) {
      const url = progress.links[i];
      if (done.has(url)) continue;
      try {
        const row = await scrapeDetail(page, url);
        results[url] = row;
        progress.done.push(url);
        done.add(url);
        atomicJson(resultsFile, results);
        atomicJson(progressFile, progress);
        console.log(`[${i + 1}/${progress.links.length}] ${row.accepted ? 'HOUSING' : 'excluded'} ${row.codigo_base} -> ${row.sku || '-'}`);
      } catch (error) {
        results[url] = { url, accepted: false, error: error.message, scraped_at: new Date().toISOString() };
        atomicJson(resultsFile, results);
        console.error(`[${i + 1}/${progress.links.length}] ERROR ${url}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }
  const rows = Object.values(results);
  const accepted = rows.filter((row) => row.accepted).sort((a, b) => a.sku.localeCompare(b.sku));
  const errors = rows.filter((row) => row.error);
  const collisions = collisionReport(accepted);
  const complete = progress.done.length === progress.links.length;
  const pagesComplete = progress.pages.length === expectedPages;

  const audit = {
    source_url: sourceUrl,
    expected_pages: expectedPages,
    pages_complete: pagesComplete,
    page_log: progress.pages,
    category_unique_products: progress.links.length,
    processed: progress.done.length,
    accepted_fuel_filter_housings: accepted.length,
    excluded_non_housings: rows.filter((row) => !row.accepted && !row.error).length,
    errors,
    collisions,
    import_ready: complete && pagesComplete && errors.length === 0 && collisions.length === 0,
    rule: 'ET9 + last 4 numeric digits of Fleetguard code; suffix letters retained only in codigo_base; TURBOCORE™',
    generated_at: new Date().toISOString(),
  };
  atomicJson(auditFile, audit);

  if (audit.import_ready) writeJsonl(importFile, accepted.map(importRow));
  else if (fs.existsSync(importFile)) fs.unlinkSync(importFile);

  console.log(JSON.stringify({ ...audit, page_log: undefined, errors: errors.map((e) => e.url) }, null, 2));
  if (!audit.import_ready) throw new Error('NOT IMPORT READY: resolve pagination/errors/collisions first');
  console.log(`IMPORT READY: ${accepted.length} verified Fleetguard Fuel Filter Housings`);
}

main().catch((error) => {
  console.error(`[fleetguard-fuel-housings] ${error.stack || error.message}`);
  process.exitCode = 1;
});

module.exports = {
  makeEt9Sku,
  normalizeText,
  collisionReport,
};
