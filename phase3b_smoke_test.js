/**
 * Phase 3B Smoke Test — validate scraper on 5 SKUs (1 per segment + extra)
 */
'use strict';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

function buildUrls(segment, sku) {
  const seg = (segment || '').toLowerCase();
  const cleanSku = sku.trim();
  if (seg.includes('oil')) {
    return [`https://www.oilfilter-crossreference.com/convert/MANN-FILTER/${cleanSku}`,
            `https://www.oilfilter-crossreference.com/convert/MANN/${cleanSku}`];
  }
  if (seg.includes('fuel')) {
    return [`https://www.fuelfilter-crossreference.com/convert/MANN/${cleanSku}`,
            `https://www.fuelfilter-crossreference.com/convert/MANN-FILTER/${cleanSku}`];
  }
  return [`https://www.airfilter-crossreference.com/convert/MANN/${cleanSku}`,
          `https://www.airfilter-crossreference.com/convert/MANN-HUMMEL/${cleanSku}`];
}

function parseSpecsAirFuel(html) {
  const specs = {};
  const re = /<div class="spec-item"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const colon = text.indexOf(':');
    if (colon > -1) {
      specs[text.slice(0, colon).trim()] = text.slice(colon + 1).trim();
    }
  }
  return specs;
}

function parseSpecsOil(html) {
  const specs = {};
  const re = /<dt>([^<]+)<\/dt>\s*<dd>([^<]+)<\/dd>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const val = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
    specs[m[1].trim()] = val;
  }
  return specs;
}

function parseCrossRefs(html, selfSku) {
  const re = /href="\/convert\/([A-Za-z0-9_%-]+)\/([^"?]+)"/g;
  const seen = new Set();
  const refs = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const brand = decodeURIComponent(m[1]).toUpperCase().trim();
    const code  = decodeURIComponent(m[2]).trim();
    if (brand === 'MANN' || brand === 'MANN-HUMMEL' || brand === 'MANN-FILTER') continue;
    if (code.toUpperCase() === selfSku.toUpperCase()) continue;
    const key = brand + '|' + code;
    if (!seen.has(key)) { seen.add(key); refs.push({ brand, code }); }
  }
  return refs;
}

function parseAppRows(html) {
  const tbodyRe = /<tbody>([\s\S]*?)<\/tbody>/g;
  const tbodyM = tbodyRe.exec(html);
  if (!tbodyM) return [];
  const tbody = tbodyM[1];
  const rows = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
  let rowM;
  while ((rowM = rowRe.exec(tbody)) !== null) {
    const cells = [];
    let cellM;
    const cellReCopy = new RegExp(cellRe.source, 'g');
    while ((cellM = cellReCopy.exec(rowM[1])) !== null) cells.push(cellM[1].replace(/[\s\n\r]+/g,' ').trim());
    if (cells.length >= 4 && cells[0] && cells[0] !== 'Brand' && cells[0] !== 'Make') {
      rows.push({ make: cells[0], model: cells[1], year: cells[5] || '' });
    }
  }
  return rows;
}

const TESTS = [
  { elimSku: 'EA50012',  sourceSku: 'C10012',   segment: 'Air Filter'   },
  { elimSku: 'EA50015',  sourceSku: 'C28125',   segment: 'Air Filter'   },
  { elimSku: 'EO50001',  sourceSku: 'W71295',   segment: 'Oil Filter'   },
  { elimSku: 'EF50001',  sourceSku: 'WK8307',   segment: 'Fuel Filter'  },
  { elimSku: 'EC50001',  sourceSku: 'CUK2450',  segment: 'Cabin Filter' }
];

async function testSku(t) {
  const isOil = t.segment.toLowerCase().includes('oil');
  const urls = buildUrls(t.segment, t.sourceSku);

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status !== 200) continue;
      const html = await res.text();
      if (!html.includes(t.sourceSku)) continue;

      const specs    = isOil ? parseSpecsOil(html) : parseSpecsAirFuel(html);
      const crossRefs = parseCrossRefs(html, t.sourceSku);
      const apps     = parseAppRows(html);

      console.log('\n' + '─'.repeat(60));
      console.log(`✓ ${t.elimSku} (${t.sourceSku}) — ${t.segment}`);
      console.log(`  URL: ${url}`);
      console.log(`  Specs: ${JSON.stringify(specs)}`);
      console.log(`  Cross Refs (${crossRefs.length}): ${crossRefs.slice(0,5).map(r=>r.brand+'|'+r.code).join(', ')}`);
      console.log(`  App Rows (${apps.length}): ${apps.slice(0,3).map(r=>r.make+' '+r.model+' '+r.year).join(' | ')}`);
      return;
    } catch (e) {
      console.error(`  ERROR ${url}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 800));
  }
  console.log(`✗ NOT FOUND: ${t.sourceSku}`);
}

(async () => {
  console.log('=== PHASE 3B SMOKE TEST ===\n');
  for (const t of TESTS) {
    await testSku(t);
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('\n=== SMOKE TEST COMPLETE ===');
})();
