'use strict';

/**
 * ELIMFILTERS Donaldson CRM evidence scraper.
 *
 * Extracts official Donaldson product-page evidence without writing to the DB.
 * Every expandable tab, Show More control and collapsed (+) row is exhausted
 * before extraction. Output is append-only JSONL plus progress and not-found
 * files, so interrupted runs can resume safely.
 *
 * Usage:
 *   node scripts/scrape_donaldson_crm.js --part P953571
 *   node scripts/scrape_donaldson_crm.js --input scripts/donaldson_hd_codes.json
 *   node scripts/scrape_donaldson_crm.js --category air-dryer
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, 'donaldson_crm_results.jsonl');
const PROGRESS = path.join(ROOT, 'donaldson_crm_progress.json');
const NOT_FOUND = path.join(ROOT, 'donaldson_crm_not_found.txt');
const BASE = 'https://shop.donaldson.com/store/en-us';
const CATEGORIES = {
  'air-dryer': `${BASE}/search?N=2748940002&Nr=product.language%3AEnglish&catNav=true&st=parts`,
};
const EXPECTED_CATEGORY_COUNTS = { 'air-dryer': 3 };

const args = process.argv.slice(2);
const value = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const normalize = (v) => String(v || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function appendJsonl(row) { fs.appendFileSync(OUTPUT, `${JSON.stringify(row)}\n`, 'utf8'); }
function saveProgress(done) {
  fs.writeFileSync(PROGRESS, JSON.stringify({ done: [...done].sort(), updated_at: new Date().toISOString() }, null, 2));
}

function numeric(text) {
  const n = Number(String(text || '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(n) ? n : null;
}

function metricFromOfficial(attrs) {
  const pick = (name) => attrs[name] || attrs[name.toLowerCase()] || null;
  const cm = (s) => {
    if (!s) return null;
    const m = String(s).match(/([\d.]+)\s*cm\b/i); if (m) return Number(m[1]);
    const mm = String(s).match(/([\d.]+)\s*mm\b/i); if (mm) return Number(mm[1]) / 10;
    const inch = String(s).match(/([\d.]+)\s*inch\b/i); if (inch) return Number(inch[1]) * 2.54;
    const ft = String(s).match(/([\d.]+)\s*ft\b/i); return ft ? Number(ft[1]) * 30.48 : null;
  };
  const kg = (s) => {
    if (!s) return null;
    const m = String(s).match(/([\d.]+)\s*kg\b/i); if (m) return Number(m[1]);
    const lb = String(s).match(/([\d.]+)\s*lb\b/i); return lb ? Number(lb[1]) / 2.20462 : null;
  };
  const m3 = (s) => {
    if (!s) return null;
    const m = String(s).match(/([\d.]+)\s*m(?:3|³)\b/i); if (m) return Number(m[1]);
    const ft3 = String(s).match(/([\d.]+)\s*ft(?:3|³)\b/i); return ft3 ? Number(ft3[1]) / 35.3147 : null;
  };
  const L = cm(pick('Packaged Length'));
  const W = cm(pick('Packaged Width'));
  const H = cm(pick('Packaged Height'));
  const V = m3(pick('Packaged Volume')) || (L && W && H ? L * W * H / 1e6 : null);
  const K = kg(pick('Packaged Weight'));
  return {
    unit_packaged_length_cm: L, unit_packaged_width_cm: W, unit_packaged_height_cm: H,
    unit_packaged_weight_kg: K, unit_packaged_volume_m3: V,
    unit_packaged_weight_lb: K == null ? null : K * 2.20462,
    unit_packaged_length_ft: L == null ? null : L * 0.0328084,
    unit_packaged_width_ft: W == null ? null : W * 0.0328084,
    unit_packaged_height_ft: H == null ? null : H * 0.0328084,
    unit_packaged_volume_ft3: L && W && H ? (L * 0.0328084) * (W * 0.0328084) * (H * 0.0328084) : (V == null ? null : V * 35.3147),
  };
}

async function clickVisible(page, selector) {
  let count = 0;
  for (const el of await page.locator(selector).all()) {
    try { if (await el.isVisible()) { await el.click({ timeout: 2500 }); count++; await sleep(350); } } catch {}
  }
  return count;
}

const SECTIONS = [
  { name: 'attributes', label: 'Attributes', scope: '#attributesBody' },
  { name: 'cross_reference', label: 'Cross Reference', scope: '#crossreferenceBody' },
  { name: 'equipment', label: 'Equipment', scope: '#equiptmentBody' },
  { name: 'alternate_parts', label: 'Alternate Parts', scope: '#alternateBody' },
  { name: 'related_parts', label: 'Related Parts', scope: '#relatedPartsBody' },
  { name: 'resources', label: 'Resources', scope: '#resourcesBody' },
];

async function visibleCount(page, selector) {
  return page.locator(selector).evaluateAll((els) => els.filter((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
  }).length).catch(() => 0);
}

async function activateTab(page, section) {
  const direct = page.locator(`a[href="${section.scope}"],a[data-target="${section.scope}"],[data-target="${section.scope}"]`).first();
  const textTab = page.getByText(section.label, { exact: true }).first();
  for (const candidate of [direct, textTab]) {
    try {
      if (await candidate.isVisible()) { await candidate.click(); await sleep(1000); return true; }
    } catch {}
  }
  return false;
}

async function exhaustSection(page, section) {
  const activated = await activateTab(page, section);
  const scopeExists = await page.locator(section.scope).count().catch(() => 0);
  if (!activated && !scopeExists) {
    return { available: false, activated: false, show_more_clicks: 0, plus_buttons_expanded: 0,
      row_count: 0, remaining_show_more: 0, remaining_plus: 0, complete: true };
  }

  const scope = scopeExists ? section.scope : 'body';
  const showSelector = `${scope} #showMoreProductSpecsButton,${scope} #showAllCrossReferenceListButton,${scope} #showMorePdpListButton,${scope} button:has-text("Show More"),${scope} a:has-text("Show More"),${scope} button:has-text("Mostrar más"),${scope} a:has-text("Mostrar más"),${scope} button:has-text("View More"),${scope} button:has-text("Load More")`;
  const plusSelector = `${scope} .fa-plus,${scope} [aria-expanded="false"],${scope} button:has-text("+")`;
  let showMoreClicks = 0, plusClicks = 0, stable = 0, previousRows = -1;

  for (let pass = 0; pass < 150 && stable < 3; pass++) {
    // Expand current rows first, then load more rows, then expand newly loaded rows.
    plusClicks += await clickVisible(page, plusSelector);
    const more = await clickVisible(page, showSelector);
    showMoreClicks += more;
    if (more) plusClicks += await clickVisible(page, plusSelector);
    await sleep(800);
    const rows = await page.locator(`${scope} tr`).count().catch(() => 0);
    const remainingShow = await visibleCount(page, showSelector);
    const remainingPlus = await visibleCount(page, plusSelector);
    stable = rows === previousRows && remainingShow === 0 && remainingPlus === 0 ? stable + 1 : 0;
    previousRows = rows;
  }

  const remainingShowMore = await visibleCount(page, showSelector);
  const remainingPlus = await visibleCount(page, plusSelector);
  const rowCount = await page.locator(`${scope} tr`).count().catch(() => 0);
  return {
    available: true, activated, show_more_clicks: showMoreClicks,
    plus_buttons_expanded: plusClicks, row_count: rowCount,
    remaining_show_more: remainingShowMore, remaining_plus: remainingPlus,
    complete: stable >= 3 && remainingShowMore === 0 && remainingPlus === 0,
  };
}

async function exhaustAllSections(page) {
  const sections = {};
  for (const section of SECTIONS) sections[section.name] = await exhaustSection(page, section);
  const available = Object.values(sections).filter((s) => s.available);
  return {
    sections,
    expansion_complete: available.length > 0 && available.every((s) => s.complete),
    remaining_show_more: available.reduce((n, s) => n + s.remaining_show_more, 0),
    remaining_plus: available.reduce((n, s) => n + s.remaining_plus, 0),
  };
}
async function extractPage(page, requestedCode) {
  return page.evaluate((requested) => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const pairs = (scope) => {
      const out = {};
      scope?.querySelectorAll('tr').forEach((tr) => {
        const c = tr.querySelectorAll('th,td');
        if (c.length >= 2) { const k = text(c[0]); const v = text(c[1]); if (k && v) out[k] = v; }
      });
      return out;
    };
    const rows = (scope) => [...(scope?.querySelectorAll('tr') || [])].map((tr) =>
      [...tr.querySelectorAll('th,td')].map(text).filter(Boolean)).filter((r) => r.length > 1);
    const uniqueRows = (input) => {
      const seen = new Set();
      return input.filter((row) => {
        const key = JSON.stringify(row.map((value) => String(value || '').trim()));
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    const pathCode = location.pathname.match(/\/product\/([^/?#]+)/i)?.[1] || requested;
    const canonical = String(pathCode || requested).trim().toUpperCase();
    const description = text(document.querySelector('.prodSubTitleMob,.prodSubTitle,h6.desLengthCheck,h6'));
    const attrsScope = document.querySelector('#attributesBody') || document;
    const attributes = pairs(attrsScope);
    const crossRows = rows(document.querySelector('#crossreferenceBody'));
    const equipmentRows = uniqueRows(rows(document.querySelector('#equiptmentBody')));
    const alternatives = [...document.querySelectorAll('.compareListProdAlternate [data-partnumber],#alternateBody [data-partnumber]')]
      .map((e) => e.getAttribute('data-partnumber')).filter(Boolean);
    const related = [...document.querySelectorAll('a[href*="/product/"]')].map((a) => ({ label: text(a), url: a.href }))
      .filter((x) => x.label && !x.url.includes(`/product/${canonical}/`));
    const resources = [...document.querySelectorAll('a[href$=".pdf"],a[href*="/content/dam/"]')]
      .map((a) => ({ label: text(a), url: a.href }));
    const image_url = document.querySelector('img[src*="assets.donaldson.com"]')?.src || null;
    return { requested_code: requested, part_number: canonical, description, attributes,
      cross_references_raw: crossRows, equipment_raw: equipmentRows,
      alternatives: [...new Set(alternatives)], related_parts: related, resources, image_url };
  }, requestedCode);
}

async function resolveProductUrl(page, code) {
  await page.goto(`${BASE}/search?Ntt=${encodeURIComponent(code)}&st=parts`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1800);
  const href = await page.locator(`a[href*="/product/${code}/" i]`).first().getAttribute('href').catch(() => null);
  return href ? new URL(href, BASE).href : null;
}

async function categoryCodes(page, category) {
  await page.goto(CATEGORIES[category], { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  const codes = new Set();
  const productUrls = new Set();
  let pagesVisited = 0;
  for (let pass = 0; pass < 30; pass++) {
    pagesVisited++;
    const links = await page.locator('a[href*="/product/"]').evaluateAll((els) => els.map((a) => a.href));
    links.forEach((href) => {
      productUrls.add(href);
      const code = href.match(/\/product\/([^/?#]+)/)?.[1];
      if (code) codes.add(normalize(code));
    });
    const found = links.map((href) => href.match(/\/product\/([^/?#]+)/)?.[1]).filter(Boolean);
    console.log(`[catalog:${category}] page=${pagesVisited} links=${found.length} unique_codes=${codes.size}`);
    const next = page.locator('a[aria-label="Next page"],button[aria-label="Next page"],li.next:not(.disabled) a,a:has-text("Next"),button:has-text("Next")').first();
    const visible = await next.isVisible().catch(() => false);
    const disabled = visible ? await next.evaluate((el) => el.matches(':disabled,[disabled],[aria-disabled="true"]') || el.closest('.disabled') !== null).catch(() => true) : true;
    if (!visible || disabled) break;
    const before = page.url();
    await next.click();
    await sleep(2200);
    if (page.url() === before && pass > 0) break;
  }
  const audit = {
    category, catalog_pages_visited: pagesVisited, codes_discovered: codes.size,
    discovered_codes: [...codes].sort(), product_urls: [...productUrls].sort(),
    expected_codes: EXPECTED_CATEGORY_COUNTS[category] || null,
    catalog_complete: !EXPECTED_CATEGORY_COUNTS[category] || codes.size === EXPECTED_CATEGORY_COUNTS[category],
  };
  fs.writeFileSync(path.join(ROOT, `donaldson_${category}_catalog_audit.json`), JSON.stringify(audit, null, 2));
  if (!audit.catalog_complete) {
    fs.writeFileSync(path.join(ROOT, `donaldson_${category}_incomplete_catalog.html`), await page.content(), 'utf8');
    await page.screenshot({ path: path.join(ROOT, `donaldson_${category}_incomplete_catalog.png`), fullPage: true });
  }
  console.log(`[catalog:${category}] audit=${JSON.stringify(audit)}`);
  if (!audit.catalog_complete) throw new Error(`INCOMPLETE_CATALOG: ${category} expected ${audit.expected_codes}, discovered ${audit.codes_discovered}`);
  return [...codes];
}

async function main() {
  const browser = await chromium.launch({ headless: !args.includes('--headed') });
  const context = await browser.newContext({ locale: 'en-US' });
  const page = await context.newPage();
  let codes = [];
  const part = value('--part'), input = value('--input'), category = value('--category');
  if (part) codes = [normalize(part)];
  else if (input) {
    const raw = loadJson(path.resolve(input), []);
    codes = [...new Set((Array.isArray(raw) ? raw : raw.codes || raw.results || []).map((x) => normalize(typeof x === 'string' ? x : x.codigo_base || x.part_number)).filter(Boolean))];
  } else if (category && CATEGORIES[category]) codes = await categoryCodes(page, category);
  else throw new Error('Use --part, --input or a supported --category');

  const done = new Set(loadJson(PROGRESS, { done: [] }).done || []);
  console.log(`[run] requested=${codes.length} already_done=${codes.filter((c) => done.has(c)).length}`);
  for (const code of codes) {
    if (done.has(code)) { console.log(`[skip] ${code} already complete in progress file`); continue; }
    const started = new Date().toISOString();
    console.log(`[product] ${code} start`);
    try {
      const sourceUrl = await resolveProductUrl(page, code);
      if (!sourceUrl) {
        appendJsonl({ codigo_base: code, status: 'NOT_FOUND', scraped_at: started });
        console.log(`[product] ${code} NOT_FOUND`);
        fs.appendFileSync(NOT_FOUND, `${code}\n`); done.add(code); saveProgress(done); continue;
      }
      await page.goto(sourceUrl, { waitUntil: 'networkidle', timeout: 90000 });
      const audit = await exhaustAllSections(page);
      const official = await extractPage(page, code);
      const metric = metricFromOfficial(official.attributes);
      appendJsonl({ codigo_base: code, status: audit.expansion_complete ? 'OK' : 'PARTIAL', source_url: page.url(), scraped_at: new Date().toISOString(), official, metric, audit });
      console.log(`[product] ${code} status=${audit.expansion_complete ? 'OK' : 'PARTIAL'} remaining_show_more=${audit.remaining_show_more} remaining_plus=${audit.remaining_plus}`);
    } catch (error) {
      appendJsonl({ codigo_base: code, status: 'ERROR', error: error.message, scraped_at: new Date().toISOString() });
      console.error(`[product] ${code} ERROR ${error.message}`);
    }
    done.add(code); saveProgress(done);
  }
  await browser.close();
}

main().catch((error) => { console.error(error); process.exit(1); });