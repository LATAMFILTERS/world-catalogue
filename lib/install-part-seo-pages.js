const crypto = require('crypto');

const PART_HOSTS = new Set([
  'part-search.elimfilters.com',
  'elimfilters-search-pro.onrender.com',
]);
const BASE_URL = 'https://part-search.elimfilters.com';
const SITE_URL = 'https://elimfilters.com';
const MAX_CACHE = Number(process.env.PART_SEO_CACHE_MAX || 2000);
const CACHE_TTL_MS = Number(process.env.PART_SEO_CACHE_TTL_MS || 15 * 60 * 1000);
const productCache = new Map();
let sitemapCache = { at: 0, xml: null };

function isPartHost(req) {
  const host = String(req.get('host') || req.hostname || '').split(':')[0].toLowerCase();
  return PART_HOSTS.has(host) || host.startsWith('part-search.');
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function xml(value) {
  return esc(value).replace(/&#39;/g, '&apos;');
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function normalizeCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9._-]/g, '')
    .slice(0, 120);
}

function flatten(value, label = '') {
  const out = [];
  const visit = (node, prefix) => {
    if (node == null) return;
    if (typeof node === 'string' || typeof node === 'number') {
      const code = String(node).trim();
      if (code) out.push(prefix ? `${prefix}: ${code}` : code);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item, prefix);
      return;
    }
    if (typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) visit(child, key || prefix);
    }
  };
  visit(value, label);
  return [...new Set(out)].slice(0, 120);
}

function securityHeaders(res) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

function getCached(code) {
  const hit = productCache.get(code);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    productCache.delete(code);
    return null;
  }
  return hit.row;
}

function putCached(code, row) {
  productCache.set(code, { at: Date.now(), row });
  if (productCache.size <= MAX_CACHE) return;
  const remove = Math.max(1, Math.floor(MAX_CACHE * 0.1));
  for (const key of productCache.keys()) {
    productCache.delete(key);
    if (productCache.size <= MAX_CACHE - remove) break;
  }
}

async function getProduct(pool, code) {
  const cached = getCached(code);
  if (cached) return cached;
  const result = await pool.query(
    `SELECT sku, name, filter_type, duty, oem_codes, competitor_codes, brand_crossrefs
       FROM elimfilters_catalog
      WHERE upper(sku) = upper($1)
      LIMIT 1`,
    [code]
  );
  const row = result.rows[0] || null;
  if (row) putCached(code, row);
  return row;
}

function renderProduct(row) {
  const sku = String(row.sku || '').toUpperCase();
  const name = row.name || `${row.filter_type || 'Industrial filter'} ${sku}`;
  const type = row.filter_type || 'Industrial filtration product';
  const duty = row.duty || 'Validated application dependent';
  const oem = flatten(row.oem_codes);
  const aftermarket = [...flatten(row.competitor_codes), ...flatten(row.brand_crossrefs)];
  const canonical = `${BASE_URL}/part/${encodeURIComponent(sku)}/`;
  const description = `${sku} ELIMFILTERS ${type}. Review OEM and aftermarket cross-reference intelligence and validate the application before installation.`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name,
    sku,
    mpn: sku,
    url: canonical,
    description,
    category: type,
    brand: { '@type': 'Brand', '@id': `${SITE_URL}/#brand`, name: 'ELIMFILTERS' },
    manufacturer: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'ELIMFILTERS' },
    isRelatedTo: [...oem, ...aftermarket].slice(0, 80).map((value) => ({ '@type': 'Thing', name: value })),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Duty', value: duty },
      { '@type': 'PropertyValue', name: 'Product type', value: type },
    ],
  };

  const list = (items, empty) => items.length
    ? `<ul>${items.slice(0, 80).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
    : `<p class="muted">${esc(empty)}</p>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(sku)} ${esc(type)} | ELIMFILTERS Product Intelligence</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(sku)} ${esc(type)} | ELIMFILTERS">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<script type="application/ld+json">${safeJson(schema)}</script>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#050505;color:#fff;font-family:Arial,sans-serif;line-height:1.6}header,main,footer{max-width:1120px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:16px;align-items:center;border-bottom:1px solid #242424}a{color:#fff12d}.brand{font-weight:800;letter-spacing:.1em;text-decoration:none}.eyebrow{color:#fff12d;font-size:.75rem;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.hero{padding-top:64px;padding-bottom:48px}.hero h1{font-size:clamp(2.5rem,7vw,5.5rem);line-height:.95;margin:.1em 0}.lead{font-size:1.15rem;max-width:800px;color:#d5d5d5}.meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.pill{border:1px solid #333;padding:7px 10px;font-size:.78rem}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.panel{border-top:2px solid #fff12d;background:#0b0b0b;padding:24px}.panel h2{margin-top:0}ul{padding-left:20px}.muted{color:#999}.cta{margin:42px 0;padding:28px;border:1px solid #fff12d}.button{display:inline-block;background:#fff12d;color:#000;text-decoration:none;font-weight:800;padding:12px 18px;margin:6px 8px 6px 0}footer{border-top:1px solid #242424;color:#999;font-size:.85rem}@media(max-width:720px){.grid{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}.hero{padding-top:38px}}
</style>
</head>
<body>
<header><a class="brand" href="${SITE_URL}/">ELIMFILTERS</a><nav><a href="${BASE_URL}/">Product Intelligence</a> · <a href="${SITE_URL}/technologies/">Technologies</a> · <a href="${SITE_URL}/contact/">Contact</a></nav></header>
<main>
<section class="hero"><div class="eyebrow">Product Intelligence · Canonical SKU</div><h1>${esc(sku)}</h1><p class="lead">${esc(name)}</p><div class="meta"><span class="pill">${esc(type)}</span><span class="pill">Duty: ${esc(duty)}</span></div></section>
<section class="grid"><article class="panel"><h2>OEM references</h2>${list(oem, 'No public OEM reference is exposed for this SKU in the current catalog record.')}</article><article class="panel"><h2>Aftermarket cross-references</h2>${list(aftermarket, 'No public aftermarket cross-reference is exposed for this SKU in the current catalog record.')}</article></section>
<section class="cta"><div class="eyebrow">Application validation</div><h2>Confirm the application before installation.</h2><p>Cross-reference relationships identify catalog intelligence, not universal interchangeability. Validate equipment, engine, dimensions, duty and product-level requirements for the intended application.</p><a class="button" href="${BASE_URL}/?q=${encodeURIComponent(sku)}">Open Product Intelligence</a><a class="button" href="${SITE_URL}/contact/">Technical support</a></section>
</main>
<footer>ELIMFILTERS Product Intelligence · The filter is the means. Asset protection is the objective.</footer>
</body></html>`;
}

function installPartSeoPages(app, pool) {
  if (!app || !pool) {
    console.warn('[part-seo] not installed: app or database pool unavailable');
    return;
  }

  app.get('/robots.txt', (req, res, next) => {
    if (!isPartHost(req)) return next();
    securityHeaders(res);
    res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', async (req, res, next) => {
    if (!isPartHost(req)) return next();
    securityHeaders(res);
    try {
      if (sitemapCache.xml && Date.now() - sitemapCache.at < 60 * 60 * 1000) {
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
        return res.type('application/xml').send(sitemapCache.xml);
      }
      const result = await pool.query(`SELECT sku FROM elimfilters_catalog WHERE sku IS NOT NULL AND sku <> '' ORDER BY sku`);
      const urls = result.rows.map(({ sku }) => `<url><loc>${xml(`${BASE_URL}/part/${encodeURIComponent(String(sku).toUpperCase())}/`)}</loc></url>`).join('');
      const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
      sitemapCache = { at: Date.now(), xml: body };
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
      res.type('application/xml').send(body);
    } catch (error) {
      console.error('[part-seo sitemap]', error.message);
      res.status(503).type('text/plain').send('Sitemap temporarily unavailable');
    }
  });

  app.get(['/part/:code', '/part/:code/'], async (req, res, next) => {
    if (!isPartHost(req)) return next();
    securityHeaders(res);
    const code = normalizeCode(req.params.code);
    if (!code) return res.status(404).set('X-Robots-Tag', 'noindex').send('Not found');
    try {
      const row = await getProduct(pool, code);
      if (!row) {
        res.setHeader('X-Robots-Tag', 'noindex,follow');
        return res.status(404).type('html').send(`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Part not found | ELIMFILTERS</title></head><body><h1>Part not found</h1><p><a href="${BASE_URL}/?q=${encodeURIComponent(code)}">Search Product Intelligence for ${esc(code)}</a></p></body></html>`);
      }
      const canonicalCode = String(row.sku || '').toUpperCase();
      if (code !== canonicalCode) return res.redirect(301, `${BASE_URL}/part/${encodeURIComponent(canonicalCode)}/`);
      res.setHeader('ETag', `W/"${crypto.createHash('sha1').update(JSON.stringify(row)).digest('hex')}"`);
      res.setHeader('X-Robots-Tag', 'index,follow,max-image-preview:large,max-snippet:-1');
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
      res.type('html').send(renderProduct(row));
    } catch (error) {
      console.error('[part-seo page]', code, error.message);
      res.status(503).set('X-Robots-Tag', 'noindex').type('text/plain').send('Product Intelligence temporarily unavailable');
    }
  });

  console.log('[part-seo] crawlable SKU pages, robots and sitemap installed');
}

module.exports = { installPartSeoPages, normalizeCode, flatten, renderProduct };
