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

// Audit step 2 (2026-11-05): contain two unproven cross-identity responses.
// EL30013 is a retired FRAM PH13 candidate (run_286); its public exact-reference
// fallback currently yields unrelated hydraulic EH64348. Hide only this
// unverified fallback, never change the EH64348 product or its other searches.
// EL30246 currently carries a CDN image named EL36122.png. Do not display an
// image branded with a different SKU without a verified migration record.
// Both are presentation guards: underlying PostgreSQL evidence is unchanged.
function guardConflictedSkuResponse(body, searchParams) {
  if (!body || !Array.isArray(body.results)) return { changed:false, held:null };
  const q = String(searchParams.get('q') || '').trim().toUpperCase();
  if (q === 'EL30013' && body.source === 'exact_part_reference'
      && body.results.length > 0
      && body.results.every(p => String(p?.elimfilters_sku || p?.sku || '').toUpperCase() === 'EH64348')) {
    body.results = [];
    body.source = 'no_match';
    body.reference_safety_status = 'IDENTITY_REVIEW_REQUIRED';
    return {changed:true, held:'EL30013_WRONG_FAMILY_REFERENCE'};
  }
  let changed = false;
  for (const product of body.results) {
    if (!product || String(product.elimfilters_sku || product.sku || '').toUpperCase() !== 'EL30246') continue;
    if (typeof product.image_url !== 'string') continue;
    try {
      const url = new URL(product.image_url);
      const file = decodeURIComponent(url.pathname.split('/').pop() || '').toUpperCase();
      if (url.protocol === 'https:' && url.hostname === 'cdn.elimfilters.com' && /^EL36122(?:[. _(-])/.test(file)) {
        product.image_url = null;
        changed = true;
      }
    } catch { /* leave invalid URL to existing frontend validation */ }
  }
  return {changed,held:changed?'EL30246_IMAGE_IDENTITY_UNVERIFIED':null};
}

// Approved visual revision uploaded to R2 on 2026-11-05 at the exact active SKU.
// Replace only the old, mismatched EL36122 image on EL30246's existing result.
// Do not alter catalog identities, reference history, or other SKU images.
const EL30246_APPROVED_URL = 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL30246.webp';
function patchApprovedEL30246Image(body) {
  if (!body || !Array.isArray(body.results)) return false;
  let changed = false;
  for (const p of body.results) {
    if (!p || String(p.elimfilters_sku || p.sku || '').trim().toUpperCase() !== 'EL30246') continue;
    const old = String(p.image_url || '').trim();
    if (old === EL30246_APPROVED_URL) continue;
    if (old) continue; // A different image requires separate approval.
    p.image_url = EL30246_APPROVED_URL;
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

// The Tunnel still serves a legacy results.html. Keep the reciprocal assembly
// -> replacement-element link at the edge until the origin HTML is upgraded.
const ET90010_REPLACEMENT_SCRIPT = `<script>
(function () {
  var requested = new URLSearchParams(location.search).get('q');
  if (String(requested || '').trim().toUpperCase() !== 'ET90010') return;

  function placeReplacementLink() {
    var cards = document.querySelectorAll('.product-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var sku = card.querySelector('.card-sku');
      if (!sku || sku.textContent.trim().toUpperCase() !== 'ET90010') continue;
      if (card.querySelector('[data-replacement-element="ET90010-ES90674"]')) return;
      var badges = card.querySelector('.card-badges');
      if (!badges || !badges.parentNode) return;

      var lang = String(document.documentElement.lang || '').toLowerCase();
      var queryLang = new URLSearchParams(location.search).get('lang');
      if (queryLang) lang = queryLang.toLowerCase();
      var label = lang.startsWith('es') ? 'ELEMENTO FILTRANTE REEMPLAZABLE'
        : lang.startsWith('pt') ? 'ELEMENTO FILTRANTE SUBSTITUÍVEL'
        : 'REPLACEABLE FILTER ELEMENT';
      var row = document.createElement('div');
      row.setAttribute('data-replacement-element', 'ET90010-ES90674');
      row.style.cssText = 'display:flex;align-items:center;gap:0.55rem;flex-wrap:wrap;margin-top:-2.6rem;font-family:JetBrains Mono,monospace;font-size:0.76rem;letter-spacing:0.04em;color:rgba(255,255,255,0.85)';
      var text = document.createElement('span');
      text.textContent = label;
      var link = document.createElement('a');
      link.href = '/results.html?q=ES90674&mode=part';
      link.textContent = 'ELIMFILTERS ES90674';
      link.setAttribute('aria-label', 'ELIMFILTERS ES90674');
      link.style.cssText = 'color:#FFF12D;text-decoration:none;border:1px solid rgba(255,241,45,0.35);padding:0.35rem 0.55rem;border-radius:4px';
      row.appendChild(text);
      row.appendChild(link);
      badges.insertAdjacentElement('afterend', row);
      return;
    }
  }
  placeReplacementLink();
  var root = document.getElementById('app') || document.body;
  new MutationObserver(placeReplacementLink).observe(root, { childList: true, subtree: true });
})();
</script>`;

// Legacy Tunnel results route is older than source Part Search: annotate only
// exact Baldwin B76 searches; never change resolver results, references or apps.
const B76_REFERENCE_GUIDE_SCRIPT = `<script>
(function () {
  if (String(new URLSearchParams(location.search).get('q') || '').trim().toUpperCase() !== 'B76') return;
  function annotateB76() {
    var app = document.getElementById('app');
    if (!app) return;
    var cards = app.querySelectorAll('.product-card');
    if (!cards.length) return;
    var primary = false;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var node = card.querySelector('.card-sku');
      var sku = node ? node.textContent.trim().toUpperCase() : '';
      if (sku === 'EL83191') primary = true;
      if (card.querySelector('[data-b76-match-role]')) continue;
      var copy = {
        EL83191: ['PRIMARY B76 MATCH', 'COINCIDENCIA PRINCIPAL B76'],
        EL84004: ['RELATED VERSION P554004 · VERIFY APPLICATION', 'OTRA VERSIÓN P554004 · REVISAR APLICACIÓN'],
        EL87483: ['BLUE ALTERNATIVE DBL7483 · VERIFY APPLICATION', 'ALTERNATIVA BLUE DBL7483 · REVISAR APLICACIÓN']
      }[sku];
      if (!copy) continue;
      var span = document.createElement('p');
      span.setAttribute('data-b76-match-role', sku);
      span.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:0.75rem;color:#FFF12D;margin:0 0 0.9rem';
      span.textContent = (String(document.documentElement.lang || '').toLowerCase().startsWith('es') ? copy[1] : copy[0]);
      var inner = card.querySelector('.card-inner') || card;
      inner.insertBefore(span, inner.firstChild);
    }
    if (primary && !app.querySelector('[data-b76-reference-guide]')) {
      var box = document.createElement('div');
      box.setAttribute('data-b76-reference-guide', '');
      box.style.cssText = 'margin:1.2rem auto 0;padding:1rem 1.25rem;max-width:1600px;border:1px solid rgba(255,241,45,0.35);border-radius:5px;color:#ddd;font:0.88rem/1.6 Outfit,sans-serif';
      var strong = document.createElement('strong');
      strong.style.color = '#FFF12D';
      strong.textContent = 'BALDWIN B76 → DONALDSON P553191 → ELIMFILTERS EL83191';
      var p = document.createElement('p');
      p.textContent = String(document.documentElement.lang || '').toLowerCase().startsWith('es')
        ? 'Correspondencia principal documentada. P554004 y DBL7483 son versiones relacionadas; verificar sus especificaciones y aplicaciones antes de sustituir. Para motores Euro 5/6 Donaldson indica P551807 (EL81807).'
        : 'Documented primary match. P554004 and DBL7483 are related versions; verify specifications and applications before substitution. For Euro 5/6 engines Donaldson specifies P551807 (EL81807).';
      box.appendChild(strong);
      box.appendChild(p);
      app.insertBefore(box, app.firstChild);
    }
  }
  annotateB76();
  var root = document.getElementById('app') || document.body;
  new MutationObserver(annotateB76).observe(root, {childList:true,subtree:true});
})();
</script>`;

async function handleResultsPage(request, upstream, target) {
  const requested = String(target.searchParams.get('q') || '').trim().toUpperCase();
  if (request.method !== 'GET' || target.pathname !== '/results.html'
      || (requested !== 'ES90674' && requested !== 'ET90010' && requested !== 'B76')
      || !upstream.ok || !String(upstream.headers.get('content-type') || '').includes('text/html')) {
    return upstream;
  }
  const headers = new Headers(upstream.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.set('cache-control', 'no-store');
  if (requested === 'B76') headers.set('x-elimfilters-reference-presentation', 'B76_CANONICAL_AND_ALTERNATE');
  else headers.set('x-elimfilters-assembly-link', requested === 'ET90010' ? 'ET90010-ES90674' : 'ES90674-ET90010');
  const transformed = new HTMLRewriter()
    .on('body', {element(element) {
      element.append(requested === 'B76' ? B76_REFERENCE_GUIDE_SCRIPT : requested === 'ET90010' ? ET90010_REPLACEMENT_SCRIPT : ES90674_ASSEMBLY_SCRIPT, {html: true});
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
  const guarded = guardConflictedSkuResponse(body, target.searchParams);
  const el30246ImagePatched = patchApprovedEL30246Image(body);
  if (!imagePatched && !descriptionPatched && !guarded.changed && !el30246ImagePatched) return upstream;

  const headers = new Headers(upstream.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  if (imagePatched) headers.set('x-elimfilters-image-patch', 'R2_MATCHED_MISSING_ONLY');
  if (descriptionPatched) headers.set('x-elimfilters-identity-display', 'VERIFIED_CURRENT_SKU');
  if (guarded.held && !el30246ImagePatched) headers.set('x-elimfilters-reference-guard', guarded.held);
  if (el30246ImagePatched) headers.set('x-elimfilters-image-correction', 'EL30246_R2_APPROVED');
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
