'use strict';
// LD-E MANN official probe: node mann_probe.js <batchNo|label> -> ld_e<batch>_probe.json
// With FUEL_LD_E_OE_CANDIDATES=<oe_*_candidates.json> it probes those SKUs, adding the OE-search candidates.
const fs = require('fs');
// Work dir holds ld721.json (export.js), allbases.json (query.js) and page caches.
const S = process.env.FUEL_LD_E_WORK || __dirname;
const BATCH = process.argv[2];
const OE = process.env.FUEL_LD_E_OE_CANDIDATES ? JSON.parse(fs.readFileSync(process.env.FUEL_LD_E_OE_CANDIDATES, 'utf8')) : null;
const terminal = OE
  ? Object.keys(OE).filter((sku) => Object.keys(OE[sku].candidates).length).map((sku) => ({ sku }))
  : require('../../candidates/fuel_global_ld_terminal_20260927.json').terminals
    .filter((r) => r.terminal_state === 'BLOCKED_EVIDENCE_REQUIRED').slice((BATCH - 1) * 50, BATCH * 50);
const rows = new Map(require(S + '/ld721.json').map((r) => [r.sku, r]));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const num = (v) => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
const close = (a, b, t = 3) => a != null && b != null && Math.abs(a - b) <= t;
const isMann = (i) => /MANN/.test(String(i.manufacturer || i.brand || '').toUpperCase());
const CACHE_FILE = S + '/mann_pages.json';
const cache = new Map(fs.existsSync(CACHE_FILE) ? Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))) : []);

function text(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&#43;/g, '+').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
}
function dims(t) {
  const out = {};
  for (const m of t.matchAll(/(Outer diameter|Diameter|Height|Inner diameter|Length)(?:\s+\d)?\s*\(([A-H])\)\s*=\s*([0-9.,]+)\s*(mm|in)/gi)) {
    let n = Number(m[3].replace(',', '.'));
    if (String(m[4]).toLowerCase() === 'in') n *= 25.4;
    out[m[2].toUpperCase()] = out[m[2].toUpperCase()] ?? n;
  }
  return out;
}
async function page(code) {
  const slug = String(code).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9/\-()]/g, '')
    .replace(/\(/g, '%28').replace(/\)/g, '%29');
  if (cache.has(slug)) return cache.get(slug);
  let res = { found: false, url: null };
  for (const loc of ['en', 'us-en']) {
    const url = `https://www.mann-filter.com/${loc}/catalog/search-results/product.html/${slug}_mann-filter.html`;
    try {
      const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (!r.ok) continue;
      const t = text(await r.text());
      if (!/Dimensions/i.test(t)) continue;
      const oeIdx = t.lastIndexOf('OE Numbers');
      const oeBlock = oeIdx >= 0 ? t.slice(oeIdx, t.indexOf('Downloads', oeIdx) > 0 ? t.indexOf('Downloads', oeIdx) : oeIdx + 20000) : '';
      const heading = (t.match(/Search Results ([^ ]+_MANN-FILTER .*?) About this item/i) || [])[1] || null;
      const mainApp = (t.match(/Main application: (.*?) GTIN Code/i) || [])[1] || '';
      res = { found: true, url, fuel: /fuel/i.test(heading || ''), product_type: heading, main_application: mainApp.slice(0, 1500), dims: dims(t), oe_norm: norm(oeBlock), };
      break;
    } catch (_) { /* next locale */ }
  }
  cache.set(slug, res);
  return res;
}

(async () => {
  const out = [];
  for (const t of terminal) {
    const row = rows.get(t.sku);
    const refs = [...(row.competitor_codes || []), ...(row.oem_codes || [])];
    const oeSearch = OE ? Object.keys(OE[t.sku].candidates) : [];
    const candidates = [...new Map([...refs.filter(isMann).map((i) => [norm(i.code), String(i.code).trim()]), ...oeSearch.map((c) => [norm(c), c])]).values()];
    const oem = [...new Set((row.oem_codes || []).map((o) => norm(o.code)).filter((c) => c.length >= 6))];
    const od = num(row.outer_diameter_mm), h = num(row.height_mm);
    const probes = [];
    for (const code of candidates) {
      const p = await page(code);
      const oeMatches = p.found ? oem.filter((c) => p.oe_norm.includes(c)) : [];
      const pa = p.dims?.A ?? p.dims?.D ?? null, ph = p.dims?.H ?? null;
      const geometry = od != null && h != null && pa != null && ph != null ? (close(od, pa) && close(h, ph) ? 'MATCH' : 'CONFLICT') : 'INCOMPLETE';
      probes.push({ code, url: p.url, found: p.found, fuel: p.fuel === true, product_type: p.product_type || null, main_application: p.main_application || null,
        mann_a_mm: pa, mann_h_mm: ph, geometry, oe_matches: oeMatches });
    }
    out.push({ sku: t.sku, codigo_base: row.codigo_base, row_od_mm: od, row_h_mm: h, oem_count: oem.length, mann_candidates: candidates, oe_search_candidates: oeSearch, probes });
    process.stderr.write('.');
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(cache)));
  fs.writeFileSync(`${S}/ld_e${BATCH}_probe.json`, JSON.stringify(out, null, 1));
  console.log('\n' + out.length);
})();
