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
// Snapshot of exact SKU-tagged Cloudflare R2 objects from elimfilters-renders.
// Existing product results only; never create products or overwrite a catalog image.
// Filename anomalies are limited to 9 uniquely assigned SKU-prefixed files.
const IMAGE_URL_BY_SKU = Object.freeze({
  EA10014: 'https://cdn.elimfilters.com/EA1/EA10014.png',
  EA10489: 'https://cdn.elimfilters.com/EA1/EA10489.png',
  EA10695: 'https://cdn.elimfilters.com/EA1/EA10695.png',
  EA11132: 'https://cdn.elimfilters.com/EA1/EA11132.png',
  EA135396: 'https://cdn.elimfilters.com/_unclassified/EA135396-MACROCORE-approved-opt.png',
  EA14603: 'https://cdn.elimfilters.com/EA1/EA14603.png',
  EA15189: 'https://cdn.elimfilters.com/EA1/EA15189.png',
  EA15292: 'https://cdn.elimfilters.com/EA1/EA15292.png',
  EA17484: 'https://cdn.elimfilters.com/EA1/EA17484.png',
  EA17557: 'https://cdn.elimfilters.com/EA1/EA17557.png',
  EA17682: 'https://cdn.elimfilters.com/EA1/EA17682.png',
  EA19371: 'https://cdn.elimfilters.com/EA1/EA19371.png',
  EA20080: 'https://cdn.elimfilters.com/EA2/EA20080.png',
  EA22580: 'https://cdn.elimfilters.com/EA2/EA22580.png',
  EA30755: 'https://cdn.elimfilters.com/EA3/EA30755.png',
  EA33603: 'https://cdn.elimfilters.com/EA3/EA33603.png',
  EC10249: 'https://cdn.elimfilters.com/EC1/EC10249.png',
  EC14547: 'https://cdn.elimfilters.com/EC1/EC14547.png',
  EC16090: 'https://cdn.elimfilters.com/EC1/EC16090.png',
  EC18643: 'https://cdn.elimfilters.com/EC1/EC18643.png',
  EC30025: 'https://cdn.elimfilters.com/EC3/EC30025.png',
  EC30546: 'https://cdn.elimfilters.com/EC3/EC30546.png',
  EC30729: 'https://cdn.elimfilters.com/EC3/EC30729.png',
  EC39892: 'https://cdn.elimfilters.com/EC3/EC39892.png',
  ED43571: 'https://cdn.elimfilters.com/ED4/ED43571.png',
  ED47754: 'https://cdn.elimfilters.com/ED4/ED47754.png',
  EF38279: 'https://cdn.elimfilters.com/EF3/EF38279.png',
  EF90057: 'https://cdn.elimfilters.com/EF9/EF90057.png',
  EF90202: 'https://cdn.elimfilters.com/EF9/EF90202.png',
  EF90345: 'https://cdn.elimfilters.com/EF9/EF90345.png',
  EF90440: 'https://cdn.elimfilters.com/EF9/EF90440.png',
  EF90472: 'https://cdn.elimfilters.com/EF9/EF90472.png',
  EF90529: 'https://cdn.elimfilters.com/EF9/EF90529.png',
  EF90541: 'https://cdn.elimfilters.com/EF9/EF90541.png',
  EF90879: 'https://cdn.elimfilters.com/EF9/EF90879.png',
  EF90880: 'https://cdn.elimfilters.com/EF9/EF90880.png',
  EF90881: 'https://cdn.elimfilters.com/EF9/EF90881.png',
  EF91311: 'https://cdn.elimfilters.com/EF9/EF91311.png',
  EF91315: 'https://cdn.elimfilters.com/EF9/EF91315.png',
  EF91319: 'https://cdn.elimfilters.com/EF9/EF91319.png',
  EF92000: 'https://cdn.elimfilters.com/EF9/EF92000.png',
  EF92200: 'https://cdn.elimfilters.com/EF9/EF92200.png',
  EF92203: 'https://cdn.elimfilters.com/EF9/EF92203.png',
  EF92478: 'https://cdn.elimfilters.com/EF9/EF92478.png',
  EF93004: 'https://cdn.elimfilters.com/EF9/EF93004.png',
  EF93854: 'https://cdn.elimfilters.com/EF9/EF93854.png',
  EF95112: 'https://cdn.elimfilters.com/EF9/EF95112.png',
  EF95776: 'https://cdn.elimfilters.com/EF9/EF95776.png',
  EF95811: 'https://cdn.elimfilters.com/EF9/EF95811.png',
  EF95951: 'https://cdn.elimfilters.com/EF9/EF95951.png',
  EF96245: 'https://cdn.elimfilters.com/EF9/EF96245.png',
  EF96745: 'https://cdn.elimfilters.com/EF9/EF96745.png',
  EF96915: 'https://cdn.elimfilters.com/EF9/EF96915.png',
  EF96916: 'https://cdn.elimfilters.com/EF9/EF96916.png',
  EF97440: 'https://cdn.elimfilters.com/EF9/EF97440.png',
  EF98960: 'https://cdn.elimfilters.com/EF9/EF98960.png',
  EF99125: 'https://cdn.elimfilters.com/EF9/EF99125.png',
  EH60388: 'https://cdn.elimfilters.com/EH6/EH60388.png',
  EH62766: 'https://cdn.elimfilters.com/EH6/EH62766.png',
  EH65876: 'https://cdn.elimfilters.com/EH6/EH65876.png',
  EL30013: 'https://cdn.elimfilters.com/EL3/EL30013.png',
  EL30246: 'https://cdn.elimfilters.com/EL3/EL30246.webp',
  EL30358: 'https://cdn.elimfilters.com/EL3/EL30358.png',
  EL30855: 'https://cdn.elimfilters.com/EL3/EL30855.png',
  EL31665: 'https://cdn.elimfilters.com/EL3/EL31665.png',
  EL31934: 'https://cdn.elimfilters.com/EL3/EL31934.png',
  EL31955: 'https://cdn.elimfilters.com/EL3/EL31955.png',
  EL32478: 'https://cdn.elimfilters.com/EL3/EL32478.png',
  EL33393: 'https://cdn.elimfilters.com/EL3/EL33393.png',
  EL33506: 'https://cdn.elimfilters.com/EL3/EL33506.png',
  EL33593: 'https://cdn.elimfilters.com/EL3/EL33593.png',
  EL33614: 'https://cdn.elimfilters.com/EL3/EL33614.png',
  EL33807: 'https://cdn.elimfilters.com/EL3/EL33807.png',
  EL33824: 'https://cdn.elimfilters.com/EL3/EL33824.png',
  EL34997: 'https://cdn.elimfilters.com/EL3/EL34997.png',
  EL36122: 'https://cdn.elimfilters.com/EL3/EL36122.png',
  EL36607: 'https://cdn.elimfilters.com/EL3/EL36607.png',
  EL36889: 'https://cdn.elimfilters.com/EL3/EL36889.png',
  EL39972: 'https://cdn.elimfilters.com/EL3/EL39972.png',
  EL80008: 'https://cdn.elimfilters.com/EL8/EL80008.png',
  EL80226: 'https://cdn.elimfilters.com/EL8/EL80226.png',
  EL80352: 'https://cdn.elimfilters.com/EL8/EL80352.png',
  EL80369: 'https://cdn.elimfilters.com/EL8/EL80369.png',
  EL80422: 'https://cdn.elimfilters.com/EL8/EL80422.png',
  EL80425: 'https://cdn.elimfilters.com/EL8/EL80425.png',
  EL80428: 'https://cdn.elimfilters.com/EL8/EL80428.png',
  EL80520: 'https://cdn.elimfilters.com/EL8/EL80520.png',
  EL80779: 'https://cdn.elimfilters.com/EL8/EL80779.png',
  EL80920: 'https://cdn.elimfilters.com/EL8/EL80920.png',
  EL80947: 'https://cdn.elimfilters.com/EL8/EL80947.png',
  EL81343: 'https://cdn.elimfilters.com/EL8/EL81343.png',
  EL81670: 'https://cdn.elimfilters.com/EL8/EL81670.png',
  EL81807: 'https://cdn.elimfilters.com/EL8/EL81807.png',
  EL82043: 'https://cdn.elimfilters.com/EL8/EL82043.png',
  EL82100: 'https://cdn.elimfilters.com/EL8/EL82100.png',
  EL83000: 'https://cdn.elimfilters.com/EL8/EL83000.png',
  EL83191: 'https://cdn.elimfilters.com/EL8/EL83191.png',
  EL84004: 'https://cdn.elimfilters.com/EL8/EL84004.png',
  EL84005: 'https://cdn.elimfilters.com/EL8/EL84005.png',
  EL84403: 'https://cdn.elimfilters.com/EL8/EL84403.png',
  EL84407: 'https://cdn.elimfilters.com/EL8/EL84407.png',
  EL87345: 'https://cdn.elimfilters.com/EL8/EL87345.png',
  EL87483: 'https://cdn.elimfilters.com/EL8/EL87483.png',
  EL87900: 'https://cdn.elimfilters.com/EL8/EL87900.png',
  EL88615: 'https://cdn.elimfilters.com/EL8/EL88615.png',
  EL89000: 'https://cdn.elimfilters.com/EL8/EL89000.png',
  ES19430: 'https://cdn.elimfilters.com/ES9/ES91430.png',
  ES90106: 'https://cdn.elimfilters.com/ES9/ES90106.png',
  ES90352: 'https://cdn.elimfilters.com/ES9/ES90352.png',
  ES90463: 'https://cdn.elimfilters.com/ES9/ES90463.png',
  ES90588: 'https://cdn.elimfilters.com/ES9/ES90588.png',
  ES90674: 'https://cdn.elimfilters.com/ES9/ES90674.png',
  ES90944: 'https://cdn.elimfilters.com/ES9/ES90944.png',
  ES90990: 'https://cdn.elimfilters.com/ES9/ES90990.png',
  ES91108: 'https://cdn.elimfilters.com/ES9/ES91108.png',
  ES91242: 'https://cdn.elimfilters.com/ES9/ES91242.png',
  ES91354: 'https://cdn.elimfilters.com/ES9/ES91354.png',
  ES91432: 'https://cdn.elimfilters.com/ES9/ES91432.png',
  ES91840: 'https://cdn.elimfilters.com/ES9/ES91840.png',
  ES93242: 'https://cdn.elimfilters.com/ES9/ES93242.png',
  ES99030: 'https://cdn.elimfilters.com/ES9/ES99030.png',
  ET90010: 'https://cdn.elimfilters.com/ET9/ET90010.png',
  ET90500: 'https://cdn.elimfilters.com/ET9/ET90500.png',
  ET90900: 'https://cdn.elimfilters.com/ET9/ET90900.png',
  ET91000: 'https://cdn.elimfilters.com/ET9/ET91000.png',
  ET92010P: 'https://cdn.elimfilters.com/ET9/ET92010.png',
  ET92010S: 'https://cdn.elimfilters.com/ET9/ET92010.png',
  ET92010T: 'https://cdn.elimfilters.com/ET9/ET92010.png',
  ET92020P: 'https://cdn.elimfilters.com/ET9/ET92020.png',
  ET92020S: 'https://cdn.elimfilters.com/ET9/ET92020.png',
  ET92020T: 'https://cdn.elimfilters.com/ET9/ET92020.png',
  ET92040P: 'https://cdn.elimfilters.com/ET9/ET92040.png',
  ET92040S: 'https://cdn.elimfilters.com/ET9/ET92040.png',
  ET92040T: 'https://cdn.elimfilters.com/ET9/ET92040.png',
  EW74685: 'https://cdn.elimfilters.com/EW7/EW74685.png'
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
const EL30246_APPROVED_URL = 'https://cdn.elimfilters.com/EL3/EL30246.webp';
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
