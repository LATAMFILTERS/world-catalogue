#!/usr/bin/env node
// Post-build gate for the phase-1 SKU pages in frontend/out (run from frontend/ after next build).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const { OEM_BRANDS, CROSS_BRANDS, PRIMARY_SOURCES, physicalIssuesFromSpecs } = createRequire(import.meta.url)('../lib/product-page-data.js');
const norm = (b) => b.toUpperCase().replace(/[-\s]/g, '');
const OEM_OK = new Set([...OEM_BRANDS].map(norm));
const CROSS_OK = new Set([...CROSS_BRANDS, 'MANN-FILTER'].map(norm));

const OUT = path.resolve(process.cwd(), 'out');
const root = path.resolve(process.cwd(), '..');
const list = JSON.parse(readFileSync(path.join(root, 'config/sku-sitemap-list.json'), 'utf8'));
const snapshot = JSON.parse(readFileSync(path.join(root, 'frontend/src/data/product-pages.json'), 'utf8'));
const registry = readFileSync(path.join(root, 'frontend/src/lib/canonical-technologies.ts'), 'utf8');
const BASE = 'https://elimfilters.com';
const PERFORMANCE = new Set(['Filtration rating', 'Efficiency', 'Efficiency test method', 'Rated flow', 'Burst pressure']);
const opts = snapshot.options || {};
for (const p of snapshot.products) {
  if (opts.showPerformanceSpecs === false) p.specs = p.specs.filter((s) => !PERFORMANCE.has(s.name));
  if (opts.showCrossReferences === false) p.crossRefs = [];
}
const FORBIDDEN = [/100\s?%/, /cero\s+bypass/i, /zero\s+bypass/i, /garantiz/i, /guarantee/i];
const errors = [];
const fail = (sku, msg) => errors.push(`${sku}: ${msg}`);
const read = (file) => readFileSync(file, 'utf8');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const listed = list.skus.map((e) => (typeof e === 'string' ? e : e.sku).toUpperCase());
const exported = snapshot.products.map((p) => p.sku);
const blockedSkus = (snapshot.blocked || []).map((b) => b.sku);
if ([...exported, ...blockedSkus].sort().join() !== listed.slice().sort().join()) errors.push(`snapshot published [${exported}] + blocked [${blockedSkus}] differ from config/sku-sitemap-list.json [${listed}]; run scripts/export-product-pages.mjs`);
for (const sku of blockedSkus) {
  if (existsSync(path.join(OUT, 'products', sku.toLowerCase()))) errors.push(`${sku}: blocked SKU has a generated page`);
}
if (!snapshot.products.length) {
  const sentinel = path.join(OUT, 'products', '_none');
  const files = ['index.html', '../_none.html'].map((f) => path.join(sentinel, f)).filter(existsSync);
  if (files.length && !/noindex/.test(read(files[0]))) errors.push('sentinel route /products/_none/ is indexable');
}
for (const p of snapshot.products) {
  const g = p.governance || {};
  if (g.canonicalSourceBrand && !PRIMARY_SOURCES.has(g.canonicalSourceBrand) && !g.ownDataVerified) errors.push(`${p.sku}: published with fallback canonical source ${g.canonicalSourceBrand} and no ownDataVerified`);
}
for (const p of snapshot.products) if (p.governance?.canonicalStatus !== 'VERIFIED') errors.push(`${p.sku}: published without canonical_source_status VERIFIED (policy VERIFIED-only)`);

const sitemap = existsSync(path.join(OUT, 'sitemap.xml')) ? read(path.join(OUT, 'sitemap.xml')) : '';
const sitemapProducts = [...sitemap.matchAll(/<loc>([^<]*\/products\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const expectedUrls = snapshot.products.map((p) => `${BASE}/products/${p.slug}/`);
if (sitemapProducts.slice().sort().join() !== expectedUrls.slice().sort().join()) errors.push(`sitemap product URLs [${sitemapProducts}] differ from the phase-1 list`);

const titles = new Set();
const descriptions = new Set();
for (const p of snapshot.products) {
  const sku = p.sku;
  if (!registry.toUpperCase().includes(p.technology)) fail(sku, `technology ${p.technology} not in canonical registry`);
  const file = path.join(OUT, 'products', p.slug, 'index.html');
  if (!existsSync(file)) { fail(sku, 'page not generated'); continue; }
  const html = read(file);
  const url = `${BASE}/products/${p.slug}/`;
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const description = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (!title.startsWith(`${sku} – `) || !title.endsWith(' | ELIMFILTERS')) fail(sku, `title format: "${title}"`);
  if (titles.has(title)) fail(sku, 'duplicate title'); titles.add(title);
  if (!description || descriptions.has(description)) fail(sku, 'missing or duplicate meta description'); descriptions.add(description);
  if (!description.includes(p.oem[0]?.code || p.crossRefs[0]?.code)) fail(sku, 'meta description lacks the main equivalence');
  if (!html.includes(`<link rel="canonical" href="${url}"`)) fail(sku, 'canonical missing or wrong');
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) fail(sku, 'noindex present');
  if ((html.match(/<h1[ >]/g) || []).length !== 1) fail(sku, 'expected exactly one h1');
  if (!/<table/.test(html)) fail(sku, 'no HTML spec table');
  for (const r of p.oem) if (!OEM_OK.has(norm(r.brand))) fail(sku, `OEM list shows a non-OEM brand: ${r.brand}`);
  for (const r of p.crossRefs) if (!CROSS_OK.has(norm(r.brand))) fail(sku, `cross-reference list shows a brand outside the allowed set: ${r.brand}`);
  // Physical plausibility: impossible geometry breaks the build, suspicious values only warn.
  const physical = physicalIssuesFromSpecs(snapshot.products.find((q) => q.sku === sku).specs);
  for (const e of physical.errors) fail(sku, `physically impossible: ${e}`);
  for (const w of physical.warnings) console.warn(`WARN ${sku}: ${w}`);
  if (new Set(p.specs.map((s) => s.name)).size !== p.specs.length) fail(sku, 'duplicate spec names in snapshot');
  const rowNames = [...html.matchAll(/<th[^>]*scope="row"[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]);
  if (new Set(rowNames).size !== rowNames.length) fail(sku, `duplicate spec rows in HTML: ${rowNames}`);
  for (const s of p.specs) if (!html.includes(`>${s.name}</th>`) || !decode(html).includes(s.value)) fail(sku, `spec row missing: ${s.name}`);
  for (const r of [...p.oem, ...p.crossRefs]) if (!html.includes(r.code)) fail(sku, `reference missing: ${r.brand} ${r.code}`);
  if (!html.includes(`${p.technology}™`)) fail(sku, 'technology name without ™');
  if (!html.includes('https://part-search.elimfilters.com/part/') || !html.includes('href="/contact/"')) fail(sku, 'CTAs missing');
  const visible = decode(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' '));
  for (const re of FORBIDDEN) if (re.test(visible)) fail(sku, `forbidden claim matches ${re}`);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { fail(sku, 'invalid JSON-LD'); return {}; } });
  const product = blocks.find((b) => b['@type'] === 'Product');
  const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
  if (!product || product.sku !== sku || product.mpn !== sku || product.brand?.name !== 'ELIMFILTERS' || product.offers?.['@type'] !== 'Offer' || !(product.additionalProperty || []).length) fail(sku, 'Product JSON-LD incomplete');
  if (!crumbs || crumbs.itemListElement?.length !== 4) fail(sku, 'BreadcrumbList incomplete');
  if (product?.offers && ('price' in product.offers || 'availability' in product.offers)) fail(sku, 'Offer carries price/availability that the catalogue does not hold');
  const famFile = path.join(OUT, 'families', p.family, 'index.html');
  if (!existsSync(famFile) || !read(famFile).includes(`href="/products/${p.slug}/"`)) fail(sku, `family page /families/${p.family}/ does not link to the SKU`);
}

if (errors.length) { console.error(`Product page validation FAILED:\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`Product page validation passed: ${snapshot.products.length} published SKU pages (${exported.join(', ') || 'none'}); ${blockedSkus.length} blocked, none generated or in the sitemap.`);
