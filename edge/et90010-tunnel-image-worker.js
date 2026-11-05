'use strict';

/**
 * Temporary edge-only reconciliation for the LIVE Cloudflare Tunnel origin.
 *
 * DNS for part-search.elimfilters.com points to Cloudflare Tunnel rather than
 * Render. Its legacy results.html accepts only https://cdn.elimfilters.com/
 * image URLs. The mapped R2 objects are independently present in
 * elimfilters-renders and verified to render over cdn.elimfilters.com.
 *
 * This Worker supplies image_url only when an exact existing SKU is returned
 * by GET /api/search and its image_url is missing. Never create search results,
 * replace an existing image URL, change references, certify fitments or modify
 * PostgreSQL. It is a temporary public presentation fix until the existing
 * Lenovo R2 image reconciler persists the image_url values.
 *
 * Route: part-search.elimfilters.com/api/search*
 * Retire the route when all mapped SKUs have valid catalog image_url values.
 * Leave this source for auditability.
 */
const IMAGE_URL_BY_SKU = Object.freeze({
  ET90010: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ET90010.png',
  EA17484: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EA17484.png',
  EL30358: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL30358.png',
  ES90352: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ES90352.png',
  ES90674: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ES90674.png',
  ES90944: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ES90944.png',
  ES91840: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ES91840.png',
  ET90900: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ET90900.png',
  ET91000: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ET91000.png',
  ET92020P: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ET92020P.png',
  ET92020S: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ET92020S.png',
  ET92020T: 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ET92020T.png'
});

function patchImage(body) {
  if (!body || !Array.isArray(body.results)) return false;
  let changed = false;
  for (const product of body.results) {
    if (!product || typeof product !== 'object') continue;
    const sku = String(product.elimfilters_sku || product.sku || '').trim().toUpperCase();
    const approvedUrl = IMAGE_URL_BY_SKU[sku];
    if (!approvedUrl) continue;
    // Never override catalog images that are already populated.
    if (product.image_url != null && String(product.image_url).trim()) continue;
    product.image_url = approvedUrl;
    changed = true;
  }
  return changed;
}

async function handleSearch(request) {
  const upstream = await fetch(request);
  const target = new URL(request.url);
  if (request.method !== 'GET' || target.pathname !== '/api/search' ||
      !upstream.ok || !String(upstream.headers.get('content-type') || '').includes('json')) {
    return upstream;
  }
  let body;
  try { body = await upstream.clone().json(); }
  catch { return upstream; }
  if (!patchImage(body)) return upstream;

  const headers = new Headers(upstream.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-elimfilters-image-patch', 'R2_MATCHED_MISSING_ONLY');
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  return new Response(JSON.stringify(body), {
    status: upstream.status,
    statusText: upstream.statusText,
    headers
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleSearch(event.request));
});
