const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const path = require('node:path');

const HOP_BY_HOP = new Set([
  'connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailer','transfer-encoding','upgrade','expect'
]);

const PRIMARY_SKU_BY_REFERENCE = Object.freeze({
  LF3620: 'EL82100'
});

const APPROVED_UI = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap" rel="stylesheet">
<style id="part-search-approved-ui">
html,body,input,select,textarea{font-family:'Barlow',sans-serif!important}
.intro-label,.mode-tab,.logo-badge,.duty-chip,.btn-search,.field-label,.footer-line,.status-msg,.results-count,.results-mode,.ac-val,.ac-type{font-family:'Chakra Petch',sans-serif!important}
.input-icon{display:none!important}
.input-wrap input{font-family:'Barlow',sans-serif!important;font-size:1rem!important;font-weight:400!important;letter-spacing:.01em!important;padding:.95rem 1rem!important}
#logo{min-width:260px!important;min-height:78px!important;overflow:visible!important;left:50%!important;margin-left:-130px!important}
.intro-label{font-weight:700!important;letter-spacing:-.055em!important;line-height:.88!important;text-transform:uppercase!important;font-size:clamp(1.55rem,6vw,2.4rem)!important;margin-bottom:3.5rem!important}
#logo img{width:260px!important;height:auto!important;max-width:none!important;display:block!important;object-fit:contain!important}
.logo-badge{position:fixed!important;top:1.5rem!important;right:2rem!important;left:auto!important;z-index:300!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;min-height:0!important;padding:0!important;border:none!important;border-radius:0!important;color:rgba(255,255,255,.65)!important;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;font-size:.72rem!important;font-weight:600!important;letter-spacing:.14em!important;line-height:1!important;text-transform:uppercase!important;pointer-events:auto!important;transition:color .2s ease!important}
.logo-badge:hover{color:#FFF12D!important}
.btn-search{min-width:220px!important;min-height:56px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:.9rem 2.25rem!important;font-family:'Chakra Petch',sans-serif!important;font-size:1rem!important;font-weight:600!important;line-height:1!important;letter-spacing:.18em!important;text-transform:uppercase!important}
.btn-search::before,.btn-search::after{content:none!important;display:none!important}
@media(max-width:1024px){#logo{min-width:220px!important;min-height:66px!important;margin-left:-110px!important}#logo img{width:220px!important}.logo-badge{top:1.25rem!important;right:1.25rem!important}}
@media(max-width:640px){#ui{justify-content:flex-start!important;padding:7.5rem 1rem 3rem!important}#search-panel{width:100%!important;max-width:100%!important}.mode-tabs{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}.mode-tab{width:100%!important;min-width:0!important;padding:.7rem .2rem!important;font-size:.78rem!important}.btn-search{width:min(100%,360px)!important;min-width:0!important;min-height:58px!important}#logo{min-width:165px!important;min-height:52px!important;top:1rem!important;left:50%!important;margin-left:-82px!important}#logo img{width:165px!important}.logo-badge{top:1rem!important;right:1rem!important;font-size:.66rem!important;letter-spacing:.12em!important}}
</style>
<script>
(function(){
function normalizePartSearch(){
document.querySelectorAll('.btn-search').forEach(function(button){button.replaceChildren(document.createTextNode('SEARCH'))});
document.querySelectorAll('.input-icon').forEach(function(icon){icon.remove()});
document.querySelectorAll('.logo-badge').forEach(function(badge){badge.replaceChildren(document.createTextNode('HOME'))});
var logo=document.getElementById('logo');var logoImg=logo&&logo.querySelector('img');
if(logoImg){logoImg.src='https://elimfilters.com/assets/elimfilters-logo-white.png';logoImg.alt='ELIMFILTERS — Total Asset Protection'}
}
normalizePartSearch();document.addEventListener('DOMContentLoaded',normalizePartSearch);window.addEventListener('load',normalizePartSearch);
})();
</script>
<!-- PART_SEARCH_UI_BUILD_20260902_LOGO_CENTERED_HERO_FONTS -->`;

function normalizeMojibake(text) {
  return String(text || '')
    .replace(/â€”/g, '—').replace(/â€“/g, '–').replace(/â†’/g, '→')
    .replace(/Â→/g, '→').replace(/Ã¢â€ â€™/g, '→').replace(/â€º/g, '›')
    .replace(/â„¢/g, '™').replace(/Â®/g, '®').replace(/Â©/g, '©')
    .replace(/Âµ/g, 'µ').replace(/â”€/g, '─');
}

function approvedHomeHtml() {
  let html = normalizeMojibake(fs.readFileSync(path.join(__dirname, 'part-search', 'index.html'), 'utf8'));
  html = html
    .replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '')
    .replace(/'Outfit'\s*,\s*sans-serif/g, "'Barlow', sans-serif")
    .replace(/'JetBrains Mono'\s*,\s*monospace/g, "'Chakra Petch', sans-serif")
    .replace(/<span\b[^>]*class=["'][^"']*input-icon[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/(<button\b[^>]*class=["'][^"']*btn-search[^"']*["'][^>]*>)[\s\S]*?(<\/button>)/gi, '$1SEARCH$2')
    .replace(/(<span\b[^>]*class=["'][^"']*logo-badge[^"']*["'][^>]*>)[\s\S]*?(<\/span>)/gi, '$1HOME$2')
    .replace(/SEARCH\s*(?:→|›)/g, 'SEARCH');
  return html.replace('</body>', `${APPROVED_UI}\n</body>`);
}

function approvedResultsHtml() {
  return normalizeMojibake(fs.readFileSync(path.join(__dirname, 'part-search', 'results.html'), 'utf8'))
    .replace(
      'const items = data.products || data.filters || [];',
      'const items = data.results || data.products || data.filters || [];'
    );
}

function localPageFor(target) {
  if (target.pathname === '/' || target.pathname === '/index.html') return approvedHomeHtml();
  if (target.pathname === '/results.html') return approvedResultsHtml();
  return null;
}

function cleanRequestHeaders(req, target) {
  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const key = name.toLowerCase();
    if (value == null || HOP_BY_HOP.has(key) || key === 'host') continue;
    headers[name] = value;
  }
  headers.host = target.host;
  if (req.headers.host) headers['x-forwarded-host'] = req.headers.host;
  return headers;
}

function cleanResponseHeaders(headers) {
  const out = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value == null || HOP_BY_HOP.has(name.toLowerCase())) continue;
    out[name] = value;
  }
  return out;
}

function normalizeReference(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function productSku(product) {
  return String(product && (product.elimfilters_sku || product.sku) || '').toUpperCase();
}

function primaryOnlySearchBody(body, rawReference) {
  if (!body || !Array.isArray(body.results) || body.results.length <= 1) return body;

  const requestedPrimary = PRIMARY_SKU_BY_REFERENCE[normalizeReference(rawReference)];
  const primaryIndex = requestedPrimary
    ? body.results.findIndex(product => productSku(product) === requestedPrimary)
    : 0;
  const resolvedIndex = primaryIndex >= 0 ? primaryIndex : 0;
  const primary = { ...body.results[resolvedIndex] };
  const secondary = body.results.filter((_, index) => index !== resolvedIndex);
  const existingAlternatives = Array.isArray(primary.alternatives) ? primary.alternatives : [];
  const alternativeSkus = [...new Set([
    ...existingAlternatives.map(alternative => typeof alternative === 'object'
      ? (alternative.sku || alternative.elimfilters_sku || alternative.code)
      : alternative),
    ...secondary.map(productSku)
  ].filter(Boolean).map(value => String(value).toUpperCase()))];

  primary.alternatives = alternativeSkus.map(sku => ({ sku }));
  primary.is_primary = true;

  return {
    ...body,
    results: [primary],
    primary_sku: productSku(primary),
    alternative_skus: alternativeSkus,
    result_policy: 'PRIMARY_ONLY_WITH_LINKED_ALTERNATIVES'
  };
}

function shouldNormalizePartSearchResponse(req, target, proxyRes) {
  const contentType = String(proxyRes.headers['content-type'] || '').toLowerCase();
  return req.method === 'GET'
    && target.pathname === '/api/search'
    && proxyRes.statusCode === 200
    && contentType.includes('application/json');
}

function createBridgeServer(upstreamUrl) {
  const upstream = new URL(upstreamUrl);
  if (!['http:','https:'].includes(upstream.protocol)) {
    throw new Error('BRIDGE_UPSTREAM_URL must use http or https');
  }
  const transport = upstream.protocol === 'https:' ? https : http;
  return http.createServer((req, res) => {
    const target = new URL(req.url || '/', upstream);

    if (req.method === 'GET') {
      const localHtml = localPageFor(target);
      if (localHtml != null) {
        const body = Buffer.from(localHtml, 'utf8');
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'content-length': body.length
        });
        res.end(body);
        return;
      }
    }

    const proxyReq = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || undefined,
      method: req.method,
      path: `${target.pathname}${target.search}`,
      headers: cleanRequestHeaders(req, target)
    }, (proxyRes) => {
      if (shouldNormalizePartSearchResponse(req, target, proxyRes)) {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          try {
            const upstreamBody = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const repairedBody = primaryOnlySearchBody(upstreamBody, target.searchParams.get('q'));
            const body = Buffer.from(JSON.stringify(repairedBody));
            const headers = cleanResponseHeaders(proxyRes.headers);
            delete headers['content-length'];
            delete headers.etag;
            headers['cache-control'] = 'no-store';
            headers['content-length'] = body.length;
            res.writeHead(200, headers);
            res.end(body);
          } catch (error) {
            const body = Buffer.concat(chunks);
            res.writeHead(proxyRes.statusCode || 502, cleanResponseHeaders(proxyRes.headers));
            res.end(body);
          }
        });
        return;
      }
      res.writeHead(proxyRes.statusCode || 502, cleanResponseHeaders(proxyRes.headers));
      proxyRes.pipe(res);
    });
    proxyReq.on('error', (error) => {
      if (res.headersSent) return res.destroy(error);
      const body = Buffer.from(JSON.stringify({ error: 'bridge_upstream_unavailable' }));
      res.writeHead(502, {'content-type':'application/json; charset=utf-8','cache-control':'no-store','content-length':body.length});
      res.end(body);
    });
    req.on('aborted', () => proxyReq.destroy());
    req.pipe(proxyReq);
  });
}

module.exports = { createBridgeServer, primaryOnlySearchBody };
