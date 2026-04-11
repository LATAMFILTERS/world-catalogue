const https = require('https');
const fs = require('fs');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return fetch(res.headers.location).then(resolve).catch(reject);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractScriptSrcs(html, baseUrl) {
  const matches = html.match(/<script[^>]+src=["']([^"']+)["']/gi) || [];
  return matches
    .map(m => { const match = m.match(/src=["']([^"']+)["']/i); return match ? match[1] : null; })
    .filter(Boolean)
    .map(src => src.startsWith('http') ? src : new URL(src, baseUrl).href)
    .filter(src => !src.includes('google') && !src.includes('amazon') && !src.includes('statcounter'));
}

function searchApiPatterns(js) {
  const patterns = [
    /fetch\s*\(\s*[`'"](\/[^`'"]+)[`'"]/g,
    /axios\.(get|post)\s*\(\s*[`'"](\/[^`'"]+)[`'"]/g,
    /\$\.(get|post|ajax)\s*\(\s*[`'"](\/[^`'"]+)[`'"]/g,
    /url\s*[:=]\s*[`'"](\/api\/[^`'"]+)[`'"]/gi,
    /path\s*[:=]\s*[`'"](\/[^`'"]+)[`'"]/gi,
    /"(\/api\/[^"]{3,60})"/g,
    /'(\/api\/[^']{3,60})'/g,
    /`(\/api\/[^`]{3,60})`/g,
  ];
  const found = new Set();
  for (const p of patterns) {
    let m;
    while ((m = p.exec(js)) !== null) {
      const url = m[m.length - 1];
      if (url && url.length > 3) found.add(url);
    }
  }
  return [...found];
}

async function analyzeSite(label, pageUrl) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label}: ${pageUrl}`);
  console.log('='.repeat(60));

  const { body: html } = await fetch(pageUrl);

  // 1. Buscar datos embebidos en script tags (Next.js / Nuxt style)
  const inlineScripts = html.match(/<script[^>]*>([\s\S]{200,}?)<\/script>/gi) || [];
  for (const s of inlineScripts) {
    const content = s.replace(/<\/?script[^>]*>/gi, '');
    // Buscar JSON grande o window.__DATA__ style
    if (content.includes('__NEXT_DATA__') || content.includes('__NUXT__') || content.includes('window.__')) {
      console.log('\n[FOUND] Inline script con datos globales:');
      console.log(content.substring(0, 1000));
    }
    // Buscar arrays de datos de filtros
    const apis = searchApiPatterns(content);
    if (apis.length > 0) {
      console.log('\n[API patterns en inline script]:');
      apis.forEach(a => console.log(' ', a));
    }
  }

  // 2. Analizar JS bundles
  const scriptSrcs = extractScriptSrcs(html, pageUrl);
  console.log(`\nJS bundles encontrados: ${scriptSrcs.length}`);
  scriptSrcs.forEach(s => console.log(' ', s));

  for (const src of scriptSrcs.slice(0, 5)) {
    console.log(`\nAnalizando: ${src}`);
    try {
      const { body: js } = await fetch(src);
      const apis = searchApiPatterns(js);
      if (apis.length > 0) {
        console.log('[API patterns]:');
        apis.forEach(a => console.log(' ', a));
      }
      // Buscar la palabra "convert" o "crossref" cerca de URLs
      const idx = js.indexOf('convert');
      if (idx >= 0) console.log('[convert context]:', js.substring(Math.max(0,idx-100), idx+200));
      const idx2 = js.indexOf('DONALDSON');
      if (idx2 >= 0) console.log('[DONALDSON context]:', js.substring(Math.max(0,idx2-100), idx2+200));
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}

async function main() {
  await analyzeSite('OIL', 'https://www.oilfilter-crossreference.com/convert/DONALDSON/P552100');
  await analyzeSite('AIR', 'https://www.airfilter-crossreference.com/convert/DONALDSON/P527682');
}

main().catch(e => console.error(e.message));
