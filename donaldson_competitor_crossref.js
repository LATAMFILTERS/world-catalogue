/**
 * DONALDSON COMPETITOR CROSSREF BUILDER
 * Busca patrones de codigos competidores en Donaldson
 * Extrae: Codigo competidor → SKU Donaldson
 * Guarda en JSON + MongoDB
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── CONFIG ─────────────────────────────────────────────────────────────────
const OUTPUT_FILE = path.resolve(__dirname, 'donaldson_competitor_crossrefs.json');
const DONE_FILE   = path.resolve(__dirname, 'competitor_crossref_done.json');

const BASE_URL  = 'https://shop.donaldson.com/store/es-us/search';
const NRPP      = 24; // resultados por pagina

const API_KEY    = 'al-xQaq_Ol8qsqZ8H62koMejYFPFvZPqnUPeTrYSDX-s65';
const API_UPSERT = 'https://data.mongodb-api.com/app/data-axfww/endpoint/data/v1/action/updateOne';

// Prefijos a buscar en Donaldson — ordenados por importancia para LATAM
const PREFIXES = [
    // Fleetguard / Cummins Filtration
    { prefix: 'LF',  brand: 'FLEETGUARD' },  // Lube
    { prefix: 'FS',  brand: 'FLEETGUARD' },  // Fuel Separator
    { prefix: 'WF',  brand: 'FLEETGUARD' },  // Water / Coolant
    { prefix: 'AF',  brand: 'FLEETGUARD' },  // Air
    { prefix: 'HF',  brand: 'FLEETGUARD' },  // Hydraulic
    { prefix: 'SB',  brand: 'FLEETGUARD' },  // Separator Bowl
    { prefix: 'SF',  brand: 'FLEETGUARD' },  // Spin-on Fuel
    // Baldwin Filters
    { prefix: 'BT',  brand: 'BALDWIN' },
    { prefix: 'PT',  brand: 'BALDWIN' },
    { prefix: 'RS',  brand: 'BALDWIN' },
    { prefix: 'PA',  brand: 'BALDWIN' },
    { prefix: 'BF',  brand: 'BALDWIN' },
    { prefix: 'PF',  brand: 'BALDWIN' },
    // FRAM
    { prefix: 'PH',  brand: 'FRAM' },
    { prefix: 'CA',  brand: 'FRAM' },
    { prefix: 'PS',  brand: 'FRAM' },
    { prefix: 'CH',  brand: 'FRAM' },
    // MANN+Hummel
    { prefix: 'HU',  brand: 'MANN' },
    { prefix: 'WK',  brand: 'MANN' },
    { prefix: 'W7',  brand: 'MANN' },
    { prefix: 'W8',  brand: 'MANN' },
    { prefix: 'W9',  brand: 'MANN' },
    { prefix: 'PU',  brand: 'MANN' },
    { prefix: 'OC',  brand: 'MANN' },
    { prefix: 'OX',  brand: 'MANN' },
    // WIX / NAPA
    { prefix: '510', brand: 'WIX' },
    { prefix: '511', brand: 'WIX' },
    { prefix: '512', brand: 'WIX' },
    { prefix: '513', brand: 'WIX' },
    { prefix: '514', brand: 'WIX' },
    { prefix: '515', brand: 'WIX' },
    { prefix: '516', brand: 'WIX' },
    { prefix: '517', brand: 'WIX' },
    { prefix: '330', brand: 'WIX' },
    { prefix: '331', brand: 'WIX' },
    { prefix: '332', brand: 'WIX' },
    { prefix: '333', brand: 'WIX' },
    // Luber-finer
    { prefix: 'LFP', brand: 'LUBER-FINER' },
    { prefix: 'LFH', brand: 'LUBER-FINER' },
    { prefix: 'LFF', brand: 'LUBER-FINER' },
    // Motorcraft / Ford
    { prefix: 'FL',  brand: 'MOTORCRAFT' },
    { prefix: 'FD',  brand: 'MOTORCRAFT' },
    // Caterpillar (complementa lo de fetchproductcrossreflist)
    { prefix: '1R',  brand: 'CATERPILLAR' },
    { prefix: '4T',  brand: 'CATERPILLAR' },
    { prefix: '9X',  brand: 'CATERPILLAR' },
    // AC Delco
    { prefix: 'PF2', brand: 'AC DELCO' },
    { prefix: 'PF3', brand: 'AC DELCO' },
    // Hengst
    { prefix: 'H3',  brand: 'HENGST' },
    { prefix: 'H7',  brand: 'HENGST' },
    // Hastings
    { prefix: 'LF4', brand: 'HASTINGS' },
    { prefix: 'PF6', brand: 'HASTINGS' },
];
// ───────────────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms + Math.random() * 800));

function loadJson(fp, fallback) {
    if (fs.existsSync(fp)) try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch {}
    return fallback;
}
function saveJson(fp, data) { fs.writeFileSync(fp, JSON.stringify(data, null, 2)); }

// Actualiza MongoDB: agrega competitor_codes al documento del SKU Donaldson
function upsertCrossRef(donaldsonSku, competitorBrand, competitorCode) {
    const body = JSON.stringify({
        dataSource: 'Cluster0',
        database:   'ELIMFILTERS_DB',
        collection: 'filters',
        filter:     { base_code: donaldsonSku },
        update: {
            $addToSet: {
                competitor_codes: { manufacturer: competitorBrand, code: competitorCode }
            },
            $set: { crossref_updated_at: new Date().toISOString() }
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

// Extrae resultados de "Partes de la competencia" de la pagina actual
async function extractCompetitorResults(page) {
    return await page.evaluate(() => {
        const results = [];

        // Buscar cards de productos en la pagina
        const cards = document.querySelectorAll(
            '.product-tile, .product-record, [class*="product-item"], [class*="product-card"], .result-item'
        );

        cards.forEach(card => {
            // Extraer SKU Donaldson (el codigo del producto principal)
            const skuEl = card.querySelector(
                '.product-number, .part-number, [class*="product-id"], [class*="sku"], .product-name a, h2 a, h3 a'
            );

            // Extraer texto completo del card
            const fullText = card.innerText || card.textContent || '';

            // Patron: buscar "BRAND XXXXX" en el texto
            // Donaldson muestra: "P552100\nFLEETGUARD LF3620\nFILTRO DE..."
            const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 2);

            let donaldsonSku = null;
            let competitorText = null;

            for (let i = 0; i < lines.length; i++) {
                // Primer codigo que parece un SKU Donaldson
                if (!donaldsonSku && /^[A-Z]{1,4}\d{3,}/.test(lines[i]) && !lines[i].includes(' ')) {
                    donaldsonSku = lines[i];
                }
                // Segunda linea con formato "BRAND CODE" (marca + codigo separados por espacio)
                if (donaldsonSku && !competitorText && i > 0) {
                    const parts = lines[i].split(' ');
                    if (parts.length >= 2 && /^[A-Z]{2,}$/.test(parts[0])) {
                        competitorText = lines[i];
                    }
                }
            }

            // Tambien intentar con href del link del producto
            const link = card.querySelector('a[href*="/product/"]');
            if (link && !donaldsonSku) {
                const m = link.href.match(/\/product\/([A-Z0-9]+)/i);
                if (m) donaldsonSku = m[1].toUpperCase();
            }

            if (donaldsonSku && competitorText) {
                // Separar brand y code del competitorText
                const spaceIdx = competitorText.indexOf(' ');
                const brand = competitorText.substring(0, spaceIdx).trim();
                const code  = competitorText.substring(spaceIdx + 1).trim();
                if (brand && code && code.length > 1) {
                    results.push({ donaldsonSku, brand, code, raw: lines.slice(0, 4) });
                }
            }
        });

        // Contar total de resultados en tab "Partes de la competencia"
        let total = 0;
        document.querySelectorAll('button, a, [role="tab"], .tab-item').forEach(el => {
            const txt = el.innerText || '';
            const m = txt.match(/competencia[^(]*\((\d+)\)/i);
            if (m) total = parseInt(m[1]);
        });

        return { results, total };
    });
}

// Procesa un prefijo completo paginando todos los resultados
async function scrapePrefix(page, prefixObj) {
    const { prefix, brand } = prefixObj;
    const allResults = [];
    let offset = 0;
    let totalExpected = -1;
    let emptyPages = 0;

    console.log(`\n  [${brand}] Buscando ${prefix}*...`);

    while (true) {
        const url = `${BASE_URL}?Ntt=${prefix}*&Ntk=All&No=${offset}&Nrpp=${NRPP}`;

        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await sleep(4000);

            // Intentar hacer click en tab "Partes de la competencia" si no esta activo
            await page.evaluate(() => {
                document.querySelectorAll('button, a, [role="tab"]').forEach(el => {
                    if ((el.innerText || '').toLowerCase().includes('competencia')) {
                        el.click();
                    }
                });
            });
            await sleep(2000);

            const { results, total } = await extractCompetitorResults(page);

            if (totalExpected === -1 && total > 0) {
                totalExpected = total;
                console.log(`     Total: ${total} resultados`);
            }

            if (results.length === 0) {
                emptyPages++;
                if (emptyPages >= 2) break;
            } else {
                emptyPages = 0;
                allResults.push(...results);
                process.stdout.write(
                    `\r     [${prefix}*] ${allResults.length}/${totalExpected > 0 ? totalExpected : '?'} extraidos   `
                );
            }

            // Si ya extrajimos suficientes o llegamos al total esperado
            if (totalExpected > 0 && allResults.length >= totalExpected) break;
            if (results.length < NRPP && totalExpected <= 0) break;

            offset += NRPP;
            await sleep(3000);

        } catch (err) {
            console.log(`\n     ERROR en ${prefix} offset ${offset}: ${err.message}`);
            break;
        }
    }

    return allResults;
}

async function run() {
    const done       = new Set(loadJson(DONE_FILE, []));
    const allCrossRefs = loadJson(OUTPUT_FILE, {});

    console.log('══════════════════════════════════════════════');
    console.log('  DONALDSON COMPETITOR CROSSREF BUILDER');
    console.log('══════════════════════════════════════════════');
    console.log(`  Prefijos a buscar: ${PREFIXES.length}`);
    console.log(`  Ya procesados:     ${done.size}`);
    console.log(`  Cross-refs previos: ${Object.keys(allCrossRefs).length}`);
    console.log('══════════════════════════════════════════════\n');

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
        await page.goto('https://shop.donaldson.com/store/es-us/home', { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(8000);
        console.log('Sesion lista.\n');

        let totalFound = 0;
        let mongoUpdates = 0;

        for (let i = 0; i < PREFIXES.length; i++) {
            const prefixObj = PREFIXES[i];
            const key = `${prefixObj.brand}:${prefixObj.prefix}`;

            if (done.has(key)) {
                console.log(`  [${i+1}/${PREFIXES.length}] ${key} — ya procesado, saltando`);
                continue;
            }

            console.log(`\n[${i+1}/${PREFIXES.length}]`);
            const results = await scrapePrefix(page, prefixObj);

            // Guardar resultados
            for (const r of results) {
                if (!allCrossRefs[r.donaldsonSku]) allCrossRefs[r.donaldsonSku] = [];
                const exists = allCrossRefs[r.donaldsonSku].some(
                    x => x.brand === r.brand && x.code === r.code
                );
                if (!exists) {
                    allCrossRefs[r.donaldsonSku].push({ brand: r.brand, code: r.code });
                    // Actualizar MongoDB
                    await upsertCrossRef(r.donaldsonSku, r.brand, r.code);
                    mongoUpdates++;
                }
            }

            totalFound += results.length;
            done.add(key);

            // Guardar progreso
            saveJson(OUTPUT_FILE, allCrossRefs);
            saveJson(DONE_FILE, [...done]);

            console.log(`\n  Nuevos cross-refs encontrados: ${results.length} | Total acumulado: ${totalFound}`);

            // Pausa entre prefijos
            await sleep(5000);
        }

        console.log('\n══════════════════════════════════════════════');
        console.log('  COMPLETADO');
        console.log(`  Total cross-refs encontrados: ${totalFound}`);
        console.log(`  SKUs Donaldson con cross-refs: ${Object.keys(allCrossRefs).length}`);
        console.log(`  Updates a MongoDB: ${mongoUpdates}`);
        console.log('══════════════════════════════════════════════');

        // Mostrar muestra
        const sample = Object.entries(allCrossRefs).slice(0, 5);
        console.log('\nMuestra de resultados:');
        sample.forEach(([sku, refs]) => {
            console.log(`  ${sku}: ${refs.map(r => `${r.brand} ${r.code}`).join(' | ')}`);
        });

    } finally {
        await browser.close();
    }
}

run().catch(console.error);
