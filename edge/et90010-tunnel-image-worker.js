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

// Identity corrections were performed in the catalog on 2026-10-07/08.
// The source DB's free-form description still begins with the retired SKU.
// Correct only that stale introductory identifier on the public response;
// never rewrite fitment, OEM, image, evidence or validation status.
const VERIFIED_SKU_RENAMES = Object.freeze({
  EA15967: 'EA135396',
  EL82352: 'EL80352'
});

function patchRetiredSkuDescription(body) {
  if (!body || !Array.isArray(body.results)) return false;
  let changed = false;
  for (const product of body.results) {
    if (!product || typeof product !== 'object') continue;
    const sku = String(product.elimfilters_sku || product.sku || '').trim().toUpperCase();
    const prior = VERIFIED_SKU_RENAMES[sku];
    if (!prior || typeof product.description !== 'string') continue;
    const prefix = 'ELIMFILTERS® ' + prior + ' ';
    if (!product.description.startsWith(prefix)) continue;
    product.description = 'ELIMFILTERS® ' + sku + ' ' + product.description.slice(prefix.length);
    changed = true;
  }
  return changed;
}

// The public hostname currently uses a Cloudflare Tunnel serving an older
// results.html than the Render/GitHub checkout. Keep this small, ES90674-only
// presentation adaptation until the Lenovo origin is updated.
const ES90674_ASSEMBLY_SCRIPT = `<script>
(function () {
  var wanted = new URLSearchParams(location.search).get('q');
  if (String(wanted || '').trim().toUpperCase() !== 'ES90674') return;
  var spanish = String(document.documentElement.lang || '').toLowerCase().startsWith('es')
    || new URLSearchParams(location.search).get('lang') === 'es';

  function placeAssemblyNote() {
    var cards = document.querySelectorAll('.product-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var sku = card.querySelector('.card-sku');
      if (!sku || sku.textContent.trim().toUpperCase() !== 'ES90674') continue;
      if (card.querySelector('[data-assembly-compatibility="ES90674-ET90010"]')) return;
      var grid = card.querySelector('.equip-grid');
      var host = grid || card.querySelector('.card-inner');
      if (!host) return;
      var section = document.createElement('div');
      section.setAttribute('data-assembly-compatibility', 'ES90674-ET90010');
      if (!grid) {
        section.className = 'specs-section';
        var title = document.createElement('p');
        title.className = 'specs-title';
        title.textContent = spanish ? 'COMPATIBILIDAD CON CONJUNTOS' : 'ASSEMBLY COMPATIBILITY';
        section.appendChild(title);
      }
      var link = document.createElement('a');
      link.className = 'equip-chip';
      link.href = '/results.html?q=ET90010&mode=part';
      link.style.textDecoration = 'none';
      link.style.display = 'block';
      var heading = document.createElement('span');
      heading.className = 'equip-name';
      heading.textContent = 'ET90010 — TURBOCORE™';
      var description = document.createElement('span');
      description.style.display = 'block';
      description.style.marginTop = '0.35rem';
      description.style.color = 'var(--muted)';
      description.textContent = spanish
        ? 'Conjunto completo · Ver ficha'
        : 'Complete assembly · View product';
      link.appendChild(heading);
      link.appendChild(description);
      section.appendChild(link);
      var note = document.createElement('p');
      note.style.fontSize = '0.8rem';
      note.style.lineHeight = '1.55';
      note.style.marginTop = '0.55rem';
      note.style.color = 'var(--muted)';
      note.textContent = spanish
        ? 'ES90674 es un elemento de reemplazo para ET90010. No se afirma compatibilidad exclusiva ni con modelos específicos de maquinaria.'
        : 'ES90674 is a replacement element for ET90010. Exclusive compatibility or machine-model fitment is not established.';
      section.appendChild(note);
      host.appendChild(section);
      return;
    }
  }
  placeAssemblyNote();
  var root = document.getElementById('app') || document.body;
  new MutationObserver(placeAssemblyNote).observe(root, {childList:true,subtree:true});
})();
</script>`;

async function handleResultsPage(request, upstream, target) {
  if (request.method !== 'GET' || target.pathname !== '/results.html'
      || String(target.searchParams.get('q') || '').trim().toUpperCase() !== 'ES90674'
      || !upstream.ok || !String(upstream.headers.get('content-type') || '').includes('text/html')) {
    return upstream;
  }
  const headers = new Headers(upstream.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.set('cache-control', 'no-store');
  headers.set('x-elimfilters-assembly-link', 'ES90674-ET90010');
  const transformed = new HTMLRewriter()
    .on('body', {element(element) {
      element.append(ES90674_ASSEMBLY_SCRIPT, {html: true});
    }})
    .transform(upstream);
  return new Response(transformed.body, {status: transformed.status, headers});
}

async function handleSearch(request) {
  const upstream = await fetch(request);
  const target = new URL(request.url);
  if (target.pathname === '/results.html') return handleResultsPage(request, upstream, target);
  if (request.method !== 'GET' || target.pathname !== '/api/search' ||
      !upstream.ok || !String(upstream.headers.get('content-type') || '').includes('json')) {
    return upstream;
  }
  let body;
  try { body = await upstream.clone().json(); }
  catch { return upstream; }
  const imagePatched = patchImage(body);
  const descriptionPatched = patchRetiredSkuDescription(body);
  if (!imagePatched && !descriptionPatched) return upstream;

  const headers = new Headers(upstream.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  if (imagePatched) headers.set('x-elimfilters-image-patch', 'R2_MATCHED_MISSING_ONLY');
  if (descriptionPatched) headers.set('x-elimfilters-identity-display', 'VERIFIED_CURRENT_SKU');
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
