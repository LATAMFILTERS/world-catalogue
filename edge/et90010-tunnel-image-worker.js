'use strict';

/**
 * Temporary edge-only reconciliation for the LIVE Cloudflare Tunnel origin.
 *
 * DNS for part-search.elimfilters.com points to Cloudflare Tunnel rather than
 * Render. Its legacy results.html accepts only https://cdn.elimfilters.com/
 * image URLs. The R2 object fleetguard/page-1/01-20/ET90010.png is verified
 * to exist in elimfilters-renders, whose custom domain is cdn.elimfilters.com.
 *
 * This Worker updates only the image_url property of an existing ET90010
 * result in GET /api/search. It never manufactures search results, nor edits
 * catalog identity, codes, fitments, performance or database records.
 *
 * Route: part-search.elimfilters.com/api/search*
 * To retire: remove the route after the tunnel origin serves ET90010 image_url
 * using the approved CDN. Leave the Worker's source for auditability.
 */
const IMAGE_URL =
  'https://cdn.elimfilters.com/fleetguard/page-1/01-20/ET90010.png';

function patchImage(body) {
  if (!body || !Array.isArray(body.results)) return false;
  let changed = false;
  for (const product of body.results) {
    if (!product || typeof product !== 'object') continue;
    const sku = String(product.elimfilters_sku || product.sku || '').trim().toUpperCase();
    if (sku !== 'ET90010') continue;
    if (product.image_url !== IMAGE_URL) {
      product.image_url = IMAGE_URL;
      changed = true;
    }
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
  headers.set('x-elimfilters-image-patch', 'ET90010');
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
