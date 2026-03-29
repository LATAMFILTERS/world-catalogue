/**
 * DONALDSON SCRAPER - Pending SKUs
 * Scrapes 779 pending SKUs and updates MongoDB via Data API
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs   = require('fs');
const path = require('path');
const https = require('https');

const CHROME_PATH  = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCRAPE_DIR   = 'E:\\ELIMFILTERS\\world-catalogue\\world-catalogue\\data\\donaldson_full_scrape';
const MISSING_FILE = 'missing_skus.json';
const API_KEY      = 'al-xQaq_Ol8qsqZ8H62koMejYFPFvZPqnUPeTrYSDX-s65';
const UPDATE_URL   = 'https://data.mongodb-api.com/app/data-axfww/endpoint/data/v1/action/updateOne';
const DELAY_MS     = 3000;

/* ── Get pending SKUs ── */
const raw      = JSON.parse(fs.readFileSync(MISSING_FILE, 'utf8'));
const allClean = [...new Set(raw.map(s => s.toString().split('\t')[0].trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')).filter(s => s.length >= 4))];
const pending  = allClean.filter(sku => !fs.existsSync(path.join(SCRAPE_DIR, sku + '.json')));
console.log(`SKUs pendientes: ${pending.length}`);

/* ── MongoDB update via Data API (HTTPS port 443) ── */
function updateMongo(sku, data) {
    const crossRefs = (data.crossReferences || []).map(c => ({
        manufacturer: c.brand || c.manufacturer || 'UNKNOWN',
        code: c.partNumber || c.code || ''
    })).filter(c => c.code);

    const attrs = data.attributes || {};
    let height_mm = null, outer_mm = null, thread = null;
    for (const [k, v] of Object.entries(attrs)) {
        const kl = k.toLowerCase(), vs = String(v || '');
        if (kl.includes('longitud') || kl.includes('length')) {
            const m = vs.match(/(\d+[\.,]?\d*)\s*MM/i);
            if (m) height_mm = parseFloat(m[1]);
        }
        if (kl.includes('exterior') || kl.includes('outer')) {
            const m = vs.match(/(\d+[\.,]?\d*)\s*MM/i);
            if (m) outer_mm = parseFloat(m[1]);
        }
        if (kl.includes('rosca') || kl.includes('thread')) {
            thread = vs.split('(')[0].trim();
        }
    }

    const body = JSON.stringify({
        dataSource: 'Cluster0',
        database:   'ELIMFILTERS_DB',
        collection: 'filters',
        filter:     { base_code: sku },
        update: { $set: {
            description:      data.description || sku,
            thread_size:      thread,
            height_mm:        height_mm,
            outer_diameter_mm: outer_mm,
            competitor_codes: crossRefs,
            'Cross Reference Codes': crossRefs.map(c => c.code).join(' '),
            applications:     (data.equipment || []).map(e => ({ machine: e.machine || '', engine: e.engine || '' })),
            source:           'donaldson_scraped',
            scraped_at:       new Date().toISOString()
        }}
    });

    return new Promise((resolve, reject) => {
        const req = https.request(UPDATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': API_KEY }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve(d));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

/* ── Scrape single SKU ── */
async function scrapeSku(page, sku) {
    try {
        await page.goto(`https://shop.donaldson.com/store/en-us/product/${sku}`, {
            waitUntil: 'networkidle2', timeout: 30000
        });
        await new Promise(r => setTimeout(r, 4000));

        const data = await page.evaluate(async (sku) => {
            // Description
            const descEl = document.querySelector('h1') || document.querySelector('.product-name') || document.querySelector('[class*="title"]');
            const description = (descEl ? descEl.innerText.trim() : '') || sku;

            // Attributes from spec tables
            const attributes = {};
            document.querySelectorAll('table tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    const k = cells[0].innerText.trim();
                    const v = cells[1].innerText.trim();
                    if (k && v) attributes[k] = v;
                }
            });
            // Also try definition lists
            document.querySelectorAll('dl').forEach(dl => {
                const dts = dl.querySelectorAll('dt');
                const dds = dl.querySelectorAll('dd');
                dts.forEach((dt, i) => {
                    if (dds[i]) attributes[dt.innerText.trim()] = dds[i].innerText.trim();
                });
            });

            // Product ID from URL for cross-ref API call
            const urlParts = window.location.href.split('/');
            const pId = urlParts[urlParts.length - 1];
            let crossReferences = [];
            if (/^\d+$/.test(pId)) {
                try {
                    const r = await fetch(`/store/rest/fetchproductcrossreflist?id=${pId}`, { method: 'POST' });
                    const j = await r.json();
                    crossReferences = j.crossReferenceList || [];
                } catch (e) {}
            }

            return {
                sku,
                url: window.location.href,
                extractedAt: new Date().toISOString(),
                description,
                attributes,
                crossReferences,
                equipment:    [],
                alternatives: [],
                relatedParts: []
            };
        }, sku);

        return data;
    } catch (e) {
        return null;
    }
}

/* ── Main ── */
async function main() {
    if (pending.length === 0) {
        console.log('No hay SKUs pendientes.');
        return;
    }

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: CHROME_PATH,
        args: ['--no-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');

    // Establish session
    console.log('Estableciendo sesión en Donaldson...');
    await page.goto('https://shop.donaldson.com/store/en-us/home', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 8000));
    console.log('Sesión lista. Iniciando scraping...\n');

    let scraped = 0, failed = 0;
    const failedSkus = [];

    for (let i = 0; i < pending.length; i++) {
        const sku = pending[i];
        process.stdout.write(`\r[${i + 1}/${pending.length}] ${sku} | OK: ${scraped} | Fail: ${failed}   `);

        const data = await scrapeSku(page, sku);

        if (data && data.description) {
            // Save JSON file
            fs.writeFileSync(path.join(SCRAPE_DIR, `${sku}.json`), JSON.stringify(data, null, 2));
            // Update MongoDB
            try { await updateMongo(sku, data); } catch (e) {}
            scraped++;
        } else {
            failed++;
            failedSkus.push(sku);
        }

        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    // Save failed list for retry
    if (failedSkus.length > 0) {
        fs.writeFileSync('failed_skus.json', JSON.stringify(failedSkus, null, 2));
        console.log(`\nFallidos guardados en failed_skus.json`);
    }

    console.log(`\n\n=============================`);
    console.log(`Scrapeados:  ${scraped}`);
    console.log(`Fallidos:    ${failed}`);
    console.log(`=============================`);

    await browser.close();
}

main().catch(console.error);
