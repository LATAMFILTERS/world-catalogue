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
const familyCache = new Map();

const LANGS = ['en', 'es'];

// Governed HD/LD family prefixes (frontend/src/lib/product-families-data.ts).
// Only these get a crawlable hub; anything else 404s.
const FAMILY_PREFIXES = {
  EA1: { en: 'Heavy-Duty Air Filters', es: 'Filtros de aire para servicio pesado' },
  EA3: { en: 'Light-Duty Air Filters', es: 'Filtros de aire para servicio liviano' },
  EF9: { en: 'Heavy-Duty Diesel Fuel Filters', es: 'Filtros de combustible diésel para servicio pesado' },
  EF3: { en: 'Light-Duty Fuel Filters', es: 'Filtros de combustible para servicio liviano' },
  ES9: { en: 'Diesel Fuel Water Separator Filters', es: 'Filtros separadores de agua para diésel' },
  EL8: { en: 'Heavy-Duty Oil Filters', es: 'Filtros de aceite para servicio pesado' },
  EL3: { en: 'Light-Duty Oil Filters', es: 'Filtros de aceite para servicio liviano' },
  EH6: { en: 'Hydraulic Filters', es: 'Filtros hidráulicos' },
  EW7: { en: 'Coolant Filters', es: 'Filtros de refrigerante' },
  EC1: { en: 'Heavy-Duty Cabin Air Filters', es: 'Filtros de aire de cabina para servicio pesado' },
  EC3: { en: 'Light-Duty Cabin Air Filters', es: 'Filtros de aire de cabina para servicio liviano' },
  ET9: { en: 'Turbine-Style Fuel Water Separators', es: 'Separadores de agua de combustible tipo turbina' },
  ED4: { en: 'Air Brake Dryer Filter Cartridges', es: 'Cartuchos secadores de aire para frenos' },
};

const COPY = {
  en: {
    nav: 'Product Intelligence',
    families: 'Product Families',
    technologies: 'Technologies',
    contact: 'Contact',
    canonicalSku: 'Product Intelligence · Canonical SKU',
    duty: 'Duty',
    dutyFallback: 'Validated application dependent',
    typeFallback: 'Industrial filtration product',
    specsTitle: 'Specifications',
    specsEmpty: 'No public dimensional specification is exposed for this SKU in the current catalog record.',
    od: 'Outer diameter',
    thread: 'Thread size',
    length: 'Length / height',
    gasketOd: 'Gasket OD',
    gasketId: 'Gasket ID',
    installation: 'Installation',
    efficiency: 'Efficiency',
    testStd: 'Efficiency test standard',
    oemTitle: 'OEM references',
    oemEmpty: 'No public OEM reference is exposed for this SKU in the current catalog record.',
    xrefTitle: 'Aftermarket cross-references',
    xrefEmpty: 'No public aftermarket cross-reference is exposed for this SKU in the current catalog record.',
    vehicleTitle: 'Vehicle applications',
    equipTitle: 'Equipment applications',
    validationKicker: 'Application validation',
    validationTitle: 'Confirm the application before installation.',
    validationBody: 'Cross-reference relationships identify catalog intelligence, not universal interchangeability. Validate equipment, engine, dimensions, duty and product-level requirements for the intended application.',
    open: 'Open Product Intelligence',
    support: 'Technical support',
    productDescription: (sku, type) => `${sku} ELIMFILTERS ${type}: dimensions, OEM references and cross-reference intelligence. Validate the application before installation.`,
    familyKicker: (prefix) => `Product Intelligence · ${prefix} family`,
    familyLead: (count, prefix) => `${count} ELIMFILTERS ${prefix} SKUs. Open a SKU for its specifications and OEM references. Cross-reference relationships identify catalog intelligence, not universal interchangeability: validate the application before installation.`,
    familyDescription: (label, count, prefix) => `${label} by ELIMFILTERS: ${count} ${prefix} SKUs with specifications and OEM cross-reference intelligence. Validate the application before installation.`,
    familyEmpty: 'No SKUs are currently published for this family.',
    otherFamilies: 'Other families',
    skus: 'SKUs',
    footer: 'ELIMFILTERS Product Intelligence · The filter is the means. Asset protection is the objective.',
    switchLabel: 'Español',
  },
  es: {
    nav: 'Product Intelligence',
    families: 'Familias de producto',
    technologies: 'Tecnologías',
    contact: 'Contacto',
    canonicalSku: 'Product Intelligence · SKU canónico',
    duty: 'Servicio',
    dutyFallback: 'Depende de la aplicación validada',
    typeFallback: 'Producto de filtración industrial',
    specsTitle: 'Especificaciones',
    specsEmpty: 'El registro actual del catálogo no expone especificaciones dimensionales públicas para este SKU.',
    od: 'Diámetro exterior',
    thread: 'Rosca',
    length: 'Largo / altura',
    gasketOd: 'Empaque DE',
    gasketId: 'Empaque DI',
    installation: 'Instalación',
    efficiency: 'Eficiencia',
    testStd: 'Norma de eficiencia',
    oemTitle: 'Referencias OEM',
    oemEmpty: 'El registro actual del catálogo no expone referencias OEM públicas para este SKU.',
    xrefTitle: 'Referencias cruzadas de reposición',
    xrefEmpty: 'El registro actual del catálogo no expone referencias cruzadas públicas para este SKU.',
    vehicleTitle: 'Aplicaciones en vehículos',
    equipTitle: 'Aplicaciones en equipos',
    validationKicker: 'Validación de aplicación',
    validationTitle: 'Confirme la aplicación antes de instalar.',
    validationBody: 'Las referencias cruzadas son inteligencia de catálogo, no intercambiabilidad universal. Valide equipo, motor, dimensiones, servicio y requisitos del producto para la aplicación prevista.',
    open: 'Abrir Product Intelligence',
    support: 'Soporte técnico',
    productDescription: (sku, type) => `${sku} ELIMFILTERS ${type}: dimensiones, referencias OEM y referencias cruzadas. Valide la aplicación antes de instalar.`,
    familyKicker: (prefix) => `Product Intelligence · familia ${prefix}`,
    familyLead: (count, prefix) => `${count} SKUs ELIMFILTERS ${prefix}. Abra un SKU para ver sus especificaciones y referencias OEM. Las referencias cruzadas son inteligencia de catálogo, no intercambiabilidad universal: valide la aplicación antes de instalar.`,
    familyDescription: (label, count, prefix) => `${label} ELIMFILTERS: ${count} SKUs ${prefix} con especificaciones y referencias cruzadas OEM. Valide la aplicación antes de instalar.`,
    familyEmpty: 'Actualmente no hay SKUs publicados para esta familia.',
    otherFamilies: 'Otras familias',
    skus: 'SKUs',
    footer: 'ELIMFILTERS Product Intelligence · El filtro es el medio. La protección del activo es el objetivo.',
    switchLabel: 'English',
  },
};

// Catalogue filter_type values are English; map the common ones for Spanish pages.
const TYPE_ES = [
  [/water.?separ|separator/i, 'Filtro separador de agua'],
  [/fuel/i, 'Filtro de combustible'],
  [/cabin/i, 'Filtro de aire de cabina'],
  [/dryer/i, 'Cartucho secador de aire'],
  [/air/i, 'Filtro de aire'],
  [/oil|lube/i, 'Filtro de aceite'],
  [/hydraul/i, 'Filtro hidráulico'],
  [/coolant/i, 'Filtro de refrigerante'],
];

function langBase(lang) {
  return lang === 'es' ? `${BASE_URL}/es` : BASE_URL;
}

function partUrl(sku, lang) {
  return `${langBase(lang)}/part/${encodeURIComponent(String(sku).toUpperCase())}/`;
}

function familyUrl(prefix, lang) {
  return `${langBase(lang)}/family/${prefix}/`;
}

function localizedType(type, lang) {
  if (!type) return type;
  if (lang === 'es') {
    const hit = TYPE_ES.find(([pattern]) => pattern.test(type));
    return hit ? hit[1] : type;
  }
  const title = String(type).replace(/[_-]+/g, ' ').replace(/\b[a-z]/g, (c) => c.toUpperCase());
  return /filter|separator|element|cartridge|housing/i.test(title) ? title : `${title} Filter`;
}

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
    `SELECT sku, name, filter_type, duty, oem_codes, competitor_codes, brand_crossrefs,
            thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
            micron_rating, nominal_efficiency, iso_test_method, installation_type,
            equipment_applications, vehicle_applications
       FROM elimfilters_catalog
      WHERE upper(sku) = upper($1)
      LIMIT 1`,
    [code]
  );
  const row = result.rows[0] || null;
  if (row) putCached(code, row);
  return row;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function dim(mm) {
  const n = toNumber(mm);
  return n ? `${Math.round(n * 10) / 10} mm (${(n / 25.4).toFixed(2)} in)` : null;
}

// Same efficiency/micron rules as the Part Search UI (part-search/results.html).
function efficiencyValue(row) {
  const nominal = row.nominal_efficiency ? String(row.nominal_efficiency).trim() : null;
  const micron = row.micron_rating && String(row.micron_rating).toLowerCase() !== 'n/a' ? String(row.micron_rating).trim() : null;
  const nominalHasMicron = nominal && /micron/i.test(nominal);
  const pct = nominal && !nominalHasMicron ? nominal.replace('%', '').trim() : null;
  const micronText = micron ? `${micron} micron` : (nominalHasMicron ? nominal : null);
  if (!micronText && !pct) return null;
  return [pct ? `${pct}%` : null, micronText].filter(Boolean).join(' · ');
}

function specRows(row, t) {
  return [
    [t.od, dim(row.outer_diameter_mm)],
    [t.thread, row.thread_size],
    [t.length, dim(row.height_mm)],
    [t.gasketOd, dim(row.gasket_od_mm)],
    [t.gasketId, dim(row.gasket_id_mm)],
    [t.installation, row.installation_type],
    [t.efficiency, efficiencyValue(row)],
    [t.testStd, row.iso_test_method],
  ].filter(([, value]) => value != null && String(value).trim() !== '');
}

function applicationLines(row) {
  const isLD = row.duty === 'LIGHT_DUTY';
  const vehicle = Array.isArray(row.vehicle_applications) ? row.vehicle_applications : [];
  const equipment = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
  const useVehicle = isLD && vehicle.length > 0;
  const apps = useVehicle ? vehicle : equipment;
  const lines = apps.map((a) => {
    if (typeof a === 'string') return a.trim();
    if (!a || typeof a !== 'object') return '';
    const model = a.model || [a.model_family, a.model_type].filter(Boolean).join(' ');
    const name = a.make ? `${a.make}${model ? ` ${model}` : ''}` : (a.equipment || model || a.machine || '');
    if (!name) return '';
    const engine = String(a.engine || a.engine_code || '').replace(/^-+\s*/, '');
    const year = a.year || a.year_range || '';
    return [name, engine, year].filter(Boolean).join(' · ');
  }).filter(Boolean);
  return { vehicle: useVehicle, lines: [...new Set(lines)].slice(0, 60) };
}

function alternates(urlFor) {
  return [
    `<link rel="alternate" hreflang="en" href="${esc(urlFor('en'))}">`,
    `<link rel="alternate" hreflang="es" href="${esc(urlFor('es'))}">`,
    `<link rel="alternate" hreflang="x-default" href="${esc(urlFor('en'))}">`,
  ].join('\n');
}

const BASE_STYLE = `:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#050505;color:#fff;font-family:Arial,sans-serif;line-height:1.6}header,main,footer{max-width:1120px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:16px;align-items:center;border-bottom:1px solid #242424}a{color:#fff12d}.brand{font-weight:800;letter-spacing:.1em;text-decoration:none}.eyebrow{color:#fff12d;font-size:.75rem;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.muted{color:#999}footer{border-top:1px solid #242424;color:#999;font-size:.85rem}@media(max-width:720px){header{align-items:flex-start;flex-direction:column}}`;

function renderProduct(row, lang = 'en') {
  const t = COPY[lang] || COPY.en;
  const sku = String(row.sku || '').toUpperCase();
  const type = localizedType(row.filter_type, lang) || t.typeFallback;
  const name = (lang === 'en' && row.name) || `${type} ${sku}`;
  const duty = row.duty || t.dutyFallback;
  const oem = flatten(row.oem_codes);
  const aftermarket = [...flatten(row.competitor_codes), ...flatten(row.brand_crossrefs)];
  const specs = specRows(row, t);
  const apps = applicationLines(row);
  const canonical = partUrl(sku, lang);
  const familyPrefix = sku.slice(0, 3);
  const family = FAMILY_PREFIXES[familyPrefix];
  const familyLink = family ? ` · <a href="${esc(familyUrl(familyPrefix, lang))}">${esc(family[lang])}</a>` : '';
  const otherLang = lang === 'es' ? 'en' : 'es';
  const description = t.productDescription(sku, type);

  const height = toNumber(row.height_mm);
  const width = toNumber(row.outer_diameter_mm);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name,
    sku,
    mpn: sku,
    url: canonical,
    inLanguage: lang,
    description,
    category: type,
    brand: { '@type': 'Brand', '@id': `${SITE_URL}/#brand`, name: 'ELIMFILTERS' },
    manufacturer: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'ELIMFILTERS' },
    isRelatedTo: [...oem, ...aftermarket].slice(0, 80).map((value) => ({ '@type': 'Thing', name: value })),
    ...(height ? { height: { '@type': 'QuantitativeValue', value: height, unitCode: 'MMT' } } : {}),
    ...(width ? { width: { '@type': 'QuantitativeValue', value: width, unitCode: 'MMT' } } : {}),
    additionalProperty: [
      { '@type': 'PropertyValue', name: t.duty, value: duty },
      ...specs.map(([label, value]) => ({ '@type': 'PropertyValue', name: label, value: String(value) })),
    ],
  };

  const list = (items, empty) => items.length
    ? `<ul>${items.slice(0, 80).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
    : `<p class="muted">${esc(empty)}</p>`;
  const specTable = specs.length
    ? `<table><tbody>${specs.map(([label, value]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`).join('')}</tbody></table>`
    : `<p class="muted">${esc(t.specsEmpty)}</p>`;
  const appsPanel = apps.lines.length
    ? `<article class="panel apps"><h2>${esc(apps.vehicle ? t.vehicleTitle : t.equipTitle)}</h2>${list(apps.lines, '')}</article>`
    : '';

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(sku)} ${esc(type)} | ELIMFILTERS</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${alternates((l) => partUrl(sku, l))}
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:type" content="website">
<meta property="og:locale" content="${lang === 'es' ? 'es_419' : 'en_US'}">
<meta property="og:title" content="${esc(sku)} ${esc(type)} | ELIMFILTERS">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<script type="application/ld+json">${safeJson(schema)}</script>
<style>
${BASE_STYLE}.hero{padding-top:64px;padding-bottom:48px}.hero h1{font-size:clamp(2.5rem,7vw,5.5rem);line-height:.95;margin:.1em 0}.lead{font-size:1.15rem;max-width:800px;color:#d5d5d5}.meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.pill{border:1px solid #333;padding:7px 10px;font-size:.78rem}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}.panel{border-top:2px solid #fff12d;background:#0b0b0b;padding:24px}.panel h2{margin-top:0}ul{padding-left:20px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #222;vertical-align:top}th{color:#bbb;font-weight:600;width:45%}.apps ul{columns:2;column-gap:24px}.cta{margin:42px 0;padding:28px;border:1px solid #fff12d}.button{display:inline-block;background:#fff12d;color:#000;text-decoration:none;font-weight:800;padding:12px 18px;margin:6px 8px 6px 0}@media(max-width:720px){.grid{grid-template-columns:1fr}.apps ul{columns:1}.hero{padding-top:38px}}
</style>
</head>
<body>
<header><a class="brand" href="${SITE_URL}/">ELIMFILTERS</a><nav><a href="${langBase(lang)}/">${esc(t.nav)}</a>${familyLink} · <a href="${SITE_URL}/technologies/">${esc(t.technologies)}</a> · <a href="${SITE_URL}/contact/">${esc(t.contact)}</a> · <a href="${esc(partUrl(sku, otherLang))}" hreflang="${otherLang}" lang="${otherLang}">${esc(t.switchLabel)}</a></nav></header>
<main>
<section class="hero"><div class="eyebrow">${esc(t.canonicalSku)}</div><h1>${esc(sku)}</h1><p class="lead">${esc(name)}</p><div class="meta"><span class="pill">${esc(type)}</span><span class="pill">${esc(t.duty)}: ${esc(duty)}</span></div></section>
<section class="grid"><article class="panel"><h2>${esc(t.specsTitle)}</h2>${specTable}</article><article class="panel"><h2>${esc(t.oemTitle)}</h2>${list(oem, t.oemEmpty)}</article></section>
<section class="grid"><article class="panel"><h2>${esc(t.xrefTitle)}</h2>${list(aftermarket, t.xrefEmpty)}</article>${appsPanel}</section>
<section class="cta"><div class="eyebrow">${esc(t.validationKicker)}</div><h2>${esc(t.validationTitle)}</h2><p>${esc(t.validationBody)}</p><a class="button" href="${BASE_URL}/?q=${encodeURIComponent(sku)}">${esc(t.open)}</a><a class="button" href="${SITE_URL}/contact/">${esc(t.support)}</a></section>
</main>
<footer>${esc(t.footer)}</footer>
</body></html>`;
}

async function getFamilySkus(pool, prefix) {
  const hit = familyCache.get(prefix);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.rows;
  const result = await pool.query(
    `SELECT sku, filter_type
       FROM elimfilters_catalog
      WHERE upper(sku) LIKE $1
      ORDER BY sku
      LIMIT 5000`,
    [`${prefix}%`]
  );
  familyCache.set(prefix, { at: Date.now(), rows: result.rows });
  return result.rows;
}

function renderFamily(prefix, rows, lang = 'en') {
  const t = COPY[lang] || COPY.en;
  const label = FAMILY_PREFIXES[prefix][lang];
  const canonical = familyUrl(prefix, lang);
  const otherLang = lang === 'es' ? 'en' : 'es';
  const description = t.familyDescription(label, rows.length, prefix);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonical}#collection`,
    name: `${label} — ${prefix} ${t.skus}`,
    url: canonical,
    inLanguage: lang,
    description,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'ELIMFILTERS' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: rows.length,
      itemListElement: rows.slice(0, 1000).map(({ sku }, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: partUrl(sku, lang),
      })),
    },
  };
  const items = rows.map(({ sku, filter_type: type }) => {
    const code = String(sku).toUpperCase();
    const shown = localizedType(type, lang);
    return `<li><a href="${esc(partUrl(code, lang))}">${esc(code)}</a>${shown ? ` <span class="muted">${esc(shown)}</span>` : ''}</li>`;
  }).join('');
  const others = Object.keys(FAMILY_PREFIXES).filter((key) => key !== prefix)
    .map((key) => `<a href="${esc(familyUrl(key, lang))}">${esc(key)}</a>`).join(' · ');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(label)} — ${esc(prefix)} ${esc(t.skus)} | ELIMFILTERS</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${alternates((l) => familyUrl(prefix, l))}
<meta name="robots" content="index,follow">
<script type="application/ld+json">${safeJson(schema)}</script>
<style>
${BASE_STYLE}h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.05;margin:.2em 0}.lead{color:#d5d5d5;max-width:800px}ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 20px}ul .muted{font-size:.85rem}
</style>
</head>
<body>
<header><a class="brand" href="${SITE_URL}/">ELIMFILTERS</a><nav><a href="${langBase(lang)}/">${esc(t.nav)}</a> · <a href="${SITE_URL}/families/">${esc(t.families)}</a> · <a href="${SITE_URL}/contact/">${esc(t.contact)}</a> · <a href="${esc(familyUrl(prefix, otherLang))}" hreflang="${otherLang}" lang="${otherLang}">${esc(t.switchLabel)}</a></nav></header>
<main>
<div class="eyebrow">${esc(t.familyKicker(prefix))}</div>
<h1>${esc(label)}</h1>
<p class="lead">${esc(t.familyLead(rows.length, prefix))}</p>
${rows.length ? `<ul>${items}</ul>` : `<p class="muted">${esc(t.familyEmpty)}</p>`}
<p class="muted">${esc(t.otherFamilies)}: ${others}</p>
</main>
<footer>${esc(t.footer)}</footer>
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
      const entry = (urlFor) => LANGS.map((lang) => `<url><loc>${xml(urlFor(lang))}</loc>${LANGS.map((alt) => `<xhtml:link rel="alternate" hreflang="${alt}" href="${xml(urlFor(alt))}"/>`).join('')}</url>`).join('');
      const familyUrls = Object.keys(FAMILY_PREFIXES).map((prefix) => entry((lang) => familyUrl(prefix, lang))).join('');
      const urls = familyUrls + result.rows.map(({ sku }) => entry((lang) => partUrl(sku, lang))).join('');
      const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
      sitemapCache = { at: Date.now(), xml: body };
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
      res.type('application/xml').send(body);
    } catch (error) {
      console.error('[part-seo sitemap]', error.message);
      res.status(503).type('text/plain').send('Sitemap temporarily unavailable');
    }
  });

  for (const lang of LANGS) {
    const prefixPath = lang === 'es' ? '/es' : '';

    app.get([`${prefixPath}/part/:code`, `${prefixPath}/part/:code/`], async (req, res, next) => {
      if (!isPartHost(req)) return next();
      securityHeaders(res);
      const code = normalizeCode(req.params.code);
      if (!code) return res.status(404).set('X-Robots-Tag', 'noindex').send('Not found');
      try {
        const row = await getProduct(pool, code);
        if (!row) {
          res.setHeader('X-Robots-Tag', 'noindex,follow');
          return res.status(404).type('html').send(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Part not found | ELIMFILTERS</title></head><body><h1>Part not found</h1><p><a href="${BASE_URL}/?q=${encodeURIComponent(code)}">Search Product Intelligence for ${esc(code)}</a></p></body></html>`);
        }
        const canonicalCode = String(row.sku || '').toUpperCase();
        if (code !== canonicalCode) return res.redirect(301, partUrl(canonicalCode, lang));
        res.setHeader('ETag', `W/"${lang}-${crypto.createHash('sha1').update(JSON.stringify(row)).digest('hex')}"`);
        res.setHeader('X-Robots-Tag', 'index,follow,max-image-preview:large,max-snippet:-1');
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
        res.setHeader('Content-Language', lang);
        res.type('html').send(renderProduct(row, lang));
      } catch (error) {
        console.error('[part-seo page]', code, error.message);
        res.status(503).set('X-Robots-Tag', 'noindex').type('text/plain').send('Product Intelligence temporarily unavailable');
      }
    });

    app.get([`${prefixPath}/family/:prefix`, `${prefixPath}/family/:prefix/`], async (req, res, next) => {
      if (!isPartHost(req)) return next();
      securityHeaders(res);
      const prefix = normalizeCode(req.params.prefix);
      if (!FAMILY_PREFIXES[prefix]) return res.status(404).set('X-Robots-Tag', 'noindex').send('Not found');
      if (req.params.prefix !== prefix || !req.path.endsWith('/')) return res.redirect(301, familyUrl(prefix, lang));
      try {
        const rows = await getFamilySkus(pool, prefix);
        res.setHeader('X-Robots-Tag', rows.length ? 'index,follow' : 'noindex,follow');
        res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
        res.setHeader('Content-Language', lang);
        res.type('html').send(renderFamily(prefix, rows, lang));
      } catch (error) {
        console.error('[part-seo family]', prefix, error.message);
        res.status(503).set('X-Robots-Tag', 'noindex').type('text/plain').send('Product Intelligence temporarily unavailable');
      }
    });
  }

  console.log('[part-seo] crawlable SKU pages (en/es), family hubs, robots and sitemap installed');
}

module.exports = { installPartSeoPages, normalizeCode, flatten, renderProduct, renderFamily, FAMILY_PREFIXES };
