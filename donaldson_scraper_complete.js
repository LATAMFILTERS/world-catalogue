/**
 * DONALDSON FULL SCRAPER - COMPLETE EDITION
 * Scrapes all 7,404 Engine & Vehicle SKUs
 * Saves to donaldson_full_scrape + updates MongoDB via Data API
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const CONFIG = {
    DATA_DIR    : 'E:\\ELIMFILTERS\\world-catalogue\\world-catalogue\\data\\donaldson_full_scrape',
    FAILED_LOG  : path.resolve(__dirname, 'donaldson_failed.json'),
    SKU_LIST    : path.resolve(__dirname, 'donaldson_sku_list.json'),

    CATALOG_N        : '4130398073',
    BASE_SEARCH      : 'https://shop.donaldson.com/store/en-us/search',
    RESULTS_PER_PAGE : 24,
    TOTAL_PRODUCTS   : 7404,

    SLEEP_BETWEEN    : 4000,
    SLEEP_AFTER_NAV  : 5000,
    SLEEP_ON_RETRY   : 15000,
    MAX_RETRIES      : 3,
    HEADLESS         : false,

    API_KEY   : 'al-xQaq_Ol8qsqZ8H62koMejYFPFvZPqnUPeTrYSDX-s65',
    API_UPSERT: 'https://data.mongodb-api.com/app/data-axfww/endpoint/data/v1/action/updateOne',
};

const sleep = ms => new Promise(r => setTimeout(r, ms + Math.random() * 500));

/* ── Helpers ── */
function skuFile(sku) {
    return path.join(CONFIG.DATA_DIR, `${sku}.json`);
}

function isAlreadyScraped(sku) {
    const f = skuFile(sku);
    if (!fs.existsSync(f)) return false;
    try {
        const d = JSON.parse(fs.readFileSync(f, 'utf8'));
        return Object.keys(d.attributes || {}).length > 0;
    } catch { return false; }
}

function saveJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function loadJson(filePath, fallback) {
    if (fs.existsSync(filePath)) {
        try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    }
    return fallback;
}

/* ── MongoDB upsert via Data API ── */
function upsertMongo(sku, data) {
    const crossRefs = (data.crossReferences || []).map(c => ({
        manufacturer: c.manufacturer || c.brand || 'UNKNOWN',
        code: c.part || c.partNumber || c.code || ''
    })).filter(c => c.code);

    const attrs = data.attributes || {};
    let height_mm = null, outer_mm = null, thread = null;
    for (const [k, v] of Object.entries(attrs)) {
        const kl = k.toLowerCase(), vs = String(v || '');
        if (kl.includes('length') || kl.includes('longitud')) {
            const m = vs.match(/(\d+[\.,]?\d*)\s*(?:MM|mm)/);
            if (m) height_mm = parseFloat(m[1].replace(',', '.'));
        }
        if (kl.includes('outer') || kl.includes('exterior') || kl.includes('o.d.')) {
            const m = vs.match(/(\d+[\.,]?\d*)\s*(?:MM|mm)/);
            if (m) outer_mm = parseFloat(m[1].replace(',', '.'));
        }
        if (kl.includes('thread') || kl.includes('rosca')) {
            thread = vs.split('(')[0].trim();
        }
    }

    const body = JSON.stringify({
        dataSource: 'Cluster0',
        database:   'ELIMFILTERS_DB',
        collection: 'filters',
        filter:     { base_code: sku },
        update: {
            $set: {
                description:             data.description || sku,
                thread_size:             thread,
                height_mm:               height_mm,
                outer_diameter_mm:       outer_mm,
                competitor_codes:        crossRefs,
                'Cross Reference Codes': crossRefs.map(c => c.code).join(' '),
                source:                  'donaldson_scraped',
                scraped_at:              new Date().toISOString()
            },
            $setOnInsert: {
                'ELIMFILTERS SKU':    null,
                elimfilters_sku:      null,
                base_code:            sku,
                'OEM Codes':          sku,
                filter_type:          null,
                subtype:              null,
                elimfilters_technology: null,
                oem_codes:            [{ manufacturer: 'DONALDSON', code: sku }],
                applications:         [],
                imported_at:          new Date().toISOString()
            }
        },
        upsert: true
    });

    return new Promise((resolve) => {
        const req = https.request(CONFIG.API_UPSERT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': CONFIG.API_KEY }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve(d));
        });
        req.on('error', () => resolve(null));
        req.write(body);
        req.end();
    });
}

/* ── PHASE 1: Collect all SKUs from search pagination ── */
async function collectAllSkus(page) {
    console.log('\n══════════════════════════════════════');
    console.log('  FASE 1 — Recolectando SKUs');
    console.log('══════════════════════════════════════');

    const existing = loadJson(CONFIG.SKU_LIST, []);
    if (existing.length >= 7000) {
        console.log(`✅ Lista existente: ${existing.length} SKUs cargados.`);
        return existing;
    }

    const allSkus = new Set(existing);
    let offset = existing.length > 0 ? Math.floor(existing.length / CONFIG.RESULTS_PER_PAGE) * CONFIG.RESULTS_PER_PAGE : 0;
    let pageNum = Math.floor(offset / CONFIG.RESULTS_PER_PAGE) + 1;
    let consecutiveEmpty = 0;

    while (allSkus.size < CONFIG.TOTAL_PRODUCTS + 100) {
        const url = `${CONFIG.BASE_SEARCH}?N=${CONFIG.CATALOG_N}&Nr=product.language%3AEnglish&catNav=true&st=parts&No=${offset}&Nrpp=${CONFIG.RESULTS_PER_PAGE}`;
        process.stdout.write(`\r  Página ${pageNum} | SKUs: ${allSkus.size}/${CONFIG.TOTAL_PRODUCTS}   `);

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(3000);

            const pageSkus = await page.evaluate(() => {
                const skus = new Set();
                document.querySelectorAll('a[href*="/product/"]').forEach(el => {
                    const m = el.href.match(/\/product\/([A-Z0-9][A-Z0-9\-]+)/i);
                    if (m) skus.add(m[1].toUpperCase());
                });
                document.querySelectorAll('[data-product-id]').forEach(el => {
                    const id = el.getAttribute('data-product-id');
                    if (id) skus.add(id.toUpperCase());
                });
                // Also check text content of part number links
                document.querySelectorAll('a.donaldson-part-details, a[class*="part"]').forEach(el => {
                    const txt = el.innerText.trim().toUpperCase();
                    if (/^[A-Z0-9][A-Z0-9\-]{3,}$/.test(txt)) skus.add(txt);
                });
                return [...skus];
            });

            if (pageSkus.length === 0) {
                consecutiveEmpty++;
                if (consecutiveEmpty >= 3) break;
            } else {
                consecutiveEmpty = 0;
                pageSkus.forEach(s => allSkus.add(s));
            }

            offset += CONFIG.RESULTS_PER_PAGE;
            pageNum++;
            saveJson(CONFIG.SKU_LIST, [...allSkus]);
            await sleep(2000);
        } catch (err) {
            consecutiveEmpty++;
            if (consecutiveEmpty >= 5) break;
            await sleep(5000);
        }
    }

    const skuArray = [...allSkus];
    saveJson(CONFIG.SKU_LIST, skuArray);
    console.log(`\n✅ Total SKUs recolectados: ${skuArray.length}`);
    return skuArray;
}

/* ── PHASE 2: Scrape individual product ── */
async function scrapeProduct(page, sku) {
    const url = `https://shop.donaldson.com/store/en-us/product/${sku}`;

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
            await sleep(CONFIG.SLEEP_AFTER_NAV);

            const productData = await page.evaluate(async (sku) => {
                function getAllFromShadow(root, selector, found = []) {
                    root.querySelectorAll(selector).forEach(el => found.push(el));
                    Array.from(root.querySelectorAll('*'))
                        .filter(e => e.shadowRoot)
                        .forEach(s => getAllFromShadow(s.shadowRoot, selector, found));
                    return found;
                }

                const internalId = document.querySelector('input[name="productId"]')?.value
                                 || window.location.pathname.split('/').pop();

                const description = document.querySelector('h1')?.innerText?.trim()
                    || document.querySelector('[class*="product-title"]')?.innerText?.trim()
                    || sku;

                const attributes = {};
                ['.prodSpecInfoDiv .row', '#attributes tr', '.product-info-spec-row', 'table tr'].forEach(sel => {
                    getAllFromShadow(document, sel).forEach(row => {
                        const cells = row.querySelectorAll('td, div.col-xs-6');
                        if (cells.length >= 2) {
                            const l = cells[0].innerText?.trim();
                            const v = cells[1].innerText?.trim();
                            if (l && v && l !== v) attributes[l] = v;
                        }
                    });
                });

                return { description, attributes, internalId, sku };
            }, sku);

            // Fetch cross-references via internal API
            if (productData.internalId && /^\d+$/.test(productData.internalId)) {
                const crossRefs = await page.evaluate(async (pId) => {
                    try {
                        const r = await fetch(`/store/rest/fetchproductcrossreflist?id=${pId}`, {
                            method: 'POST', headers: { 'Accept': 'application/json' }
                        });
                        const data = await r.json();
                        return (data.crossReferenceList || []).map(item => ({
                            manufacturer: item.brand || '',
                            part: item.partNumber || '',
                            notes: item.notes || ''
                        }));
                    } catch { return []; }
                }, productData.internalId);
                productData.crossReferences = crossRefs;
            } else {
                productData.crossReferences = [];
            }

            const finalData = {
                sku,
                url: page.url(),
                extractedAt: new Date().toISOString(),
                description: productData.description,
                attributes: productData.attributes,
                crossReferences: productData.crossReferences,
                equipment: [],
                alternatives: [],
                relatedParts: []
            };

            saveJson(skuFile(sku), finalData);
            await upsertMongo(sku, finalData);

            return { success: true, sku, crossRefs: finalData.crossReferences.length, attrs: Object.keys(finalData.attributes).length };

        } catch (err) {
            if (attempt < CONFIG.MAX_RETRIES) await sleep(CONFIG.SLEEP_ON_RETRY);
        }
    }
    return { success: false, sku };
}

/* ── MAIN ── */
async function run() {
    if (!fs.existsSync(CONFIG.DATA_DIR)) fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });

    console.log('🚀 DONALDSON COMPLETE SCRAPER');
    console.log(`📁 Output: ${CONFIG.DATA_DIR}\n`);

    const browser = await puppeteer.launch({
        headless: CONFIG.HEADLESS,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');

    try {
        // Establish session
        console.log('Estableciendo sesión...');
        await page.goto('https://shop.donaldson.com/store/en-us/home', { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(8000);

        // Phase 1: collect SKUs
        const allSkus = await collectAllSkus(page);
        if (allSkus.length === 0) { console.log('❌ No SKUs encontrados.'); return; }

        // Phase 2: scrape each product
        const toScrape = allSkus.filter(sku => !isAlreadyScraped(sku));
        console.log(`\n🎯 A procesar: ${toScrape.length} de ${allSkus.length} (ya scrapeados: ${allSkus.length - toScrape.length})\n`);

        let done = 0, failed = 0;
        const failedList = loadJson(CONFIG.FAILED_LOG, []);

        for (const sku of toScrape) {
            done++;
            const result = await scrapeProduct(page, sku);
            if (result.success) {
                process.stdout.write(`\r✅ [${done}/${toScrape.length}] ${sku} | ${result.crossRefs} crossRef | ${result.attrs} attrs   `);
            } else {
                failed++;
                failedList.push({ sku, ts: new Date().toISOString() });
                process.stdout.write(`\r❌ [${done}/${toScrape.length}] ${sku} FAILED | Total fallidos: ${failed}   `);
            }

            if (done % 50 === 0) saveJson(CONFIG.FAILED_LOG, failedList);
            await sleep(CONFIG.SLEEP_BETWEEN);
        }

        saveJson(CONFIG.FAILED_LOG, failedList);

        console.log(`\n\n══════════════════════════════`);
        console.log(`  COMPLETADO`);
        console.log(`══════════════════════════════`);
        console.log(`  Procesados:  ${done}`);
        console.log(`  Fallidos:    ${failed}`);
        console.log(`══════════════════════════════`);

    } finally {
        await browser.close();
    }
}

run().catch(console.error);
