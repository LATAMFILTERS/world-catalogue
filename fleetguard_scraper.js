require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.filterserviceandsupply.com/fleetguard-';

const SKU_TYPE_MAP = { 'LF': 'lube-filter', 'FF': 'fuel-filter', 'AF': 'air-filter', 'WF': 'water-filter', 'FS': 'fuel-water-separator' };

function getFilterType(sku) {
    const prefix = sku.replace(/[0-9]/g, '').toUpperCase();
    return SKU_TYPE_MAP[prefix] || 'filter';
}

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) return fetchPage(res.headers.location).then(resolve).catch(reject);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

function extractImageUrl(html, sku) {
    const patterns = [
        /href="(https:\/\/cdn11\.bigcommerce\.com[^"]*1280x1280[^"]*\.jpg[^"]*)"/,
        /src="(https:\/\/cdn11\.bigcommerce\.com[^"]*600x600[^"]*\.jpg[^"]*)"/,
        new RegExp('(https://cdn11\\.bigcommerce\\.com[^"]*' + sku + '[^"]*\\.jpg)', 'i'),
    ];
    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1].replace(/\/\d+x\d+\//, '/1280x1280/');
    }
    return null;
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(dest);
        protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) { file.close(); fs.unlink(dest, () => {}); return downloadImage(res.headers.location, dest).then(resolve).catch(reject); }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    });
}

async function scrapeFleetguardImage(fleetguardSku, outputDir = './references') {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, fleetguardSku + '.jpg');
    if (fs.existsSync(outputPath)) { console.log('[CACHE] ' + fleetguardSku + ' ya existe'); return { success: true, path: outputPath, cached: true }; }
    const filterType = getFilterType(fleetguardSku);
    const skuLower = fleetguardSku.toLowerCase();
    const pageUrl = BASE_URL + skuLower + '-spin-on-' + filterType;
    console.log('[SCRAPE] Buscando: ' + pageUrl);
    try {
        const { status, body } = await fetchPage(pageUrl);
        if (status !== 200) {
            const altUrl = BASE_URL + skuLower + '-' + filterType;
            const alt = await fetchPage(altUrl);
            if (alt.status !== 200) return { success: false, error: 'HTTP ' + alt.status };
            const imageUrl = extractImageUrl(alt.body, fleetguardSku);
            if (!imageUrl) return { success: false, error: 'Image not found in alt page' };
            await downloadImage(imageUrl, outputPath);
            return { success: true, path: outputPath, imageUrl };
        }
        const imageUrl = extractImageUrl(body, fleetguardSku);
        if (!imageUrl) return { success: false, error: 'Image not found in page' };
        console.log('[IMG] URL: ' + imageUrl);
        await downloadImage(imageUrl, outputPath);
        console.log('[OK] Guardado: ' + outputPath);
        return { success: true, path: outputPath, imageUrl };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

if (require.main === module) {
    const sku = process.argv[2] || 'LF3620';
    scrapeFleetguardImage(sku).then(result => console.log('\nResultado:', JSON.stringify(result, null, 2)));
}

module.exports = { scrapeFleetguardImage };
