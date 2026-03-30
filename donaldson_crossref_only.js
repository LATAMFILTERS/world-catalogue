/**
 * DONALDSON CROSSREF ONLY
 * Lee los JSON ya scrapeados (con attrs pero sin crossRefs)
 * Navega a cada producto, extrae el ID numerico del URL
 * Llama /store/rest/fetchproductcrossreflist?id=XXXX
 * Actualiza JSON local + MongoDB via Data API
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── CONFIG ─────────────────────────────────────────────────────────────────
const DATA_DIR   = 'E:\\ELIMFILTERS\\world-catalogue\\world-catalogue\\data\\donaldson_full_scrape';
const DONE_LOG   = path.resolve(__dirname, 'crossref_only_done.json');
const FAILED_LOG = path.resolve(__dirname, 'crossref_only_failed.json');

const API_KEY    = 'al-xQaq_Ol8qsqZ8H62koMejYFPFvZPqnUPeTrYSDX-s65';
const API_UPSERT = 'https://data.mongodb-api.com/app/data-axfww/endpoint/data/v1/action/updateOne';

const SLEEP_BETWEEN  = 3500;
const SLEEP_AFTER_NAV = 5000;
const MAX_RETRIES    = 3;
// ───────────────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms + Math.random() * 500));

function loadJson(fp, fallback) {
    if (fs.existsSync(fp)) try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch {}
    return fallback;
}

function saveJson(fp, data) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
}

// Actualiza MongoDB con los cross-references obtenidos
function updateMongo(sku, crossRefs) {
    const refs = crossRefs.map(c => ({
        manufacturer: c.manufacturer || c.brand || 'UNKNOWN',
        code: c.part || c.partNumber || c.code || ''
    })).filter(c => c.code);

    const body = JSON.stringify({
        dataSource: 'Cluster0',
        database:   'ELIMFILTERS_DB',
        collection: 'filters',
        filter:     { base_code: sku },
        update: {
            $set: {
                competitor_codes:        refs,
                'Cross Reference Codes': refs.map(c => c.code).join(' '),
                crossref_updated_at:     new Date().toISOString()
            }
        },
        upsert: false
    });

    return new Promise(resolve => {
        const req = https.request(API_UPSERT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': API_KEY }
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

// Obtiene cross-refs de un SKU via Puppeteer
async function getCrossRefs(page, sku) {
    const url = `https://shop.donaldson.com/store/en-us/product/${sku}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
            await sleep(SLEEP_AFTER_NAV);

            // Extraer ID numerico del URL final (despues del redirect)
            const finalUrl  = page.url();
            const urlParts  = finalUrl.split('/');
            const lastPart  = urlParts[urlParts.length - 1];
            const numericId = /^\d+$/.test(lastPart) ? lastPart : null;

            // Si no hay ID numerico en URL, buscar en el HTML
            let internalId = numericId;
            if (!internalId) {
                internalId = await page.evaluate(() => {
                    return document.querySelector('input[name="productId"]')?.value
                        || document.querySelector('input#product_id')?.value
                        || null;
                });
            }

            if (!internalId || !/^\d+$/.test(internalId)) {
                return { sku, crossRefs: [], reason: 'no_numeric_id', finalUrl };
            }

            // Llamar crossref API desde contexto del browser (mismo origen)
            const crossRefs = await page.evaluate(async (pid) => {
                try {
                    const res  = await fetch(`/store/rest/fetchproductcrossreflist?id=${pid}`, {
                        method: 'POST',
                        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                    });
                    const data = await res.json();
                    const list = data.crossReferenceList || data.crossreferencelist || data.list || [];
                    return list.map(item => ({
                        manufacturer: item.brand || item.manufacturer || '',
                        part:         item.partNumber || item.part || item.code || '',
                        notes:        item.notes || ''
                    }));
                } catch (e) {
                    return [];
                }
            }, internalId);

            return { sku, crossRefs, internalId, finalUrl };

        } catch (err) {
            if (attempt < MAX_RETRIES) await sleep(15000);
        }
    }
    return { sku, crossRefs: [], reason: 'timeout' };
}

async function run() {
    if (!fs.existsSync(DATA_DIR)) {
        console.error(`❌ DATA_DIR no existe: ${DATA_DIR}`);
        process.exit(1);
    }

    // Cargar progreso previo
    const done   = new Set(loadJson(DONE_LOG, []));
    const failed = loadJson(FAILED_LOG, []);

    // Leer todos los JSON scrapeados sin cross-refs
    const allFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const pending  = [];

    for (const f of allFiles) {
        const sku = f.replace('.json', '');
        if (done.has(sku)) continue;
        try {
            const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
            const hasAttrs    = Object.keys(d.attributes || {}).length > 0;
            const hasCrossRef = (d.crossReferences || []).length > 0;
            if (hasAttrs && !hasCrossRef) pending.push(sku);
        } catch {}
    }

    console.log('\n══════════════════════════════════════════');
    console.log('  DONALDSON CROSSREF ONLY');
    console.log('══════════════════════════════════════════');
    console.log(`  Con attrs pero sin crossRefs: ${pending.length}`);
    console.log(`  Ya procesados (done.json):    ${done.size}`);
    console.log('══════════════════════════════════════════\n');

    if (pending.length === 0) {
        console.log('✅ Todos los productos ya tienen cross-refs o no hay nada pendiente.');
        return;
    }

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');

    try {
        // Establecer sesion
        console.log('Estableciendo sesion...');
        await page.goto('https://shop.donaldson.com/store/en-us/home', { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(8000);
        console.log('Sesion lista.\n');

        let ok = 0, noId = 0, withRefs = 0;

        for (let i = 0; i < pending.length; i++) {
            const sku    = pending[i];
            const result = await getCrossRefs(page, sku);

            if (result.crossRefs.length > 0) {
                // Actualizar JSON local
                const fp = path.join(DATA_DIR, `${sku}.json`);
                try {
                    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
                    d.crossReferences = result.crossRefs;
                    d.crossref_updated_at = new Date().toISOString();
                    saveJson(fp, d);
                } catch {}

                // Actualizar MongoDB
                await updateMongo(sku, result.crossRefs);
                withRefs++;
            } else if (result.reason === 'no_numeric_id') {
                noId++;
            }

            done.add(sku);
            ok++;

            process.stdout.write(
                `\r[${i + 1}/${pending.length}] ${sku} | xRef:${result.crossRefs.length} | ` +
                `conRefs:${withRefs} sinId:${noId} | ${result.internalId || result.reason || '-'}`
            );

            // Guardar progreso cada 25
            if (ok % 25 === 0) {
                saveJson(DONE_LOG, [...done]);
                saveJson(FAILED_LOG, failed);
            }

            await sleep(SLEEP_BETWEEN);
        }

        saveJson(DONE_LOG, [...done]);
        saveJson(FAILED_LOG, failed);

        console.log('\n\n══════════════════════════════════════════');
        console.log('  COMPLETADO');
        console.log(`  Procesados:           ${ok}`);
        console.log(`  Con cross-references: ${withRefs}`);
        console.log(`  Sin ID numerico:      ${noId}`);
        console.log('══════════════════════════════════════════');

    } finally {
        await browser.close();
    }
}

run().catch(console.error);
