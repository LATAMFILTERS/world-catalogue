import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.cwd(), 'out');
if (!fs.existsSync(out)) {
  console.log('[validate-index-hygiene] out not found; skipping');
  process.exit(0);
}

const violations = [];
const read = (rel) => {
  const full = path.join(out, rel);
  if (!fs.existsSync(full)) {
    violations.push(`${rel} missing`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
};

const sitemap = read('sitemap.xml');
const sitemapIndex = read('sitemap-index.xml');

const noindexRoutes = [
  '/search/',
  '/customer-intelligence/',
];
for (const route of noindexRoutes) {
  if (sitemap.includes(`https://elimfilters.com${route}`)) {
    violations.push(`sitemap.xml contains noindex route: ${route}`);
  }
}

const retiredSignals = [
  '/commercial-lines/duractech/',
  '/knowledge-system/',
  '/fleet-optimization/',
  '/home/',
  '/home.html',
  '/language/',
  '/wp-content/',
  '/wp-admin/',
];
for (const signal of retiredSignals) {
  if (sitemap.includes(`https://elimfilters.com${signal}`)) {
    violations.push(`sitemap.xml contains retired/legacy signal: ${signal}`);
  }
}

if (!sitemap.includes('https://elimfilters.com/commercial-lines/duratech/')) {
  violations.push('sitemap.xml missing canonical DURATECH route');
}
if (!sitemapIndex.includes('https://elimfilters.com/sitemap.xml')) {
  violations.push('sitemap-index.xml missing main sitemap');
}

const noindexFiles = [
  ['search/index.html', '/search/'],
  ['customer-intelligence/index.html', '/customer-intelligence/'],
];
for (const [rel, route] of noindexFiles) {
  const html = read(rel);
  if (html && !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) {
    violations.push(`${route} must emit robots noindex`);
  }
}

const migrationHtml = read('commercial-lines/duractech/index.html');
if (migrationHtml) {
  if (!/noindex/i.test(migrationHtml)) violations.push('/commercial-lines/duractech/ must remain noindex');
  if (!migrationHtml.includes('https://elimfilters.com/commercial-lines/duratech/')) {
    violations.push('/commercial-lines/duractech/ missing canonical destination');
  }
}

const BASE_URL = 'https://elimfilters.com';
const decodeXml = (value) => String(value || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
const normalizeUrl = (value) => {
  const parsed = new URL(decodeXml(value), BASE_URL);
  const pathName = parsed.pathname === '/' ? '/' : `${parsed.pathname.replace(/\/+$/, '')}/`;
  return `${parsed.origin}${pathName}`;
};
const extractLocs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1]));
const htmlForLoc = (loc) => {
  const pathname = new URL(loc).pathname;
  return pathname === '/' ? path.join(out, 'index.html') : path.join(out, pathname.replace(/^\/+|\/+$/g, ''), 'index.html');
};

const mainLocs = extractLocs(sitemap);
const mainSet = new Set(mainLocs.map(normalizeUrl));
for (const loc of mainLocs) {
  const normalized = normalizeUrl(loc);
  const pathname = new URL(normalized).pathname;
  if (pathname.startsWith('/videos/') && pathname !== '/videos/') violations.push(`sitemap.xml contains secondary video watch route: ${pathname}`);
  const htmlPath = htmlForLoc(normalized);
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) violations.push(`sitemap.xml contains noindex page: ${pathname}`);
  const canonicalTag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || html.match(/<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i) || [])[0];
  const href = canonicalTag?.match(/href=["']([^"']+)["']/i)?.[1];
  if (href && normalizeUrl(href) !== normalized) violations.push(`sitemap canonical mismatch: ${pathname} -> ${href}`);
}

const videoSitemap = read('video-sitemap.xml');
for (const retired of ['moleculas', '/products', '/video-thumbnails/']) {
  if (videoSitemap.includes(retired)) violations.push(`video-sitemap.xml contains retired/invalid signal: ${retired}`);
}
const videoBlocks = [...videoSitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
if (videoBlocks.length !== 11) violations.push(`video-sitemap.xml expected 11 governed videos, found ${videoBlocks.length}`);
const tagValue = (block, tag) => block.match(new RegExp(`<${tag}>([^<]+)<\\/${tag}>`))?.[1];
for (const block of videoBlocks) {
  const loc = tagValue(block, 'loc');
  const thumbnail = tagValue(block, 'video:thumbnail_loc');
  const content = tagValue(block, 'video:content_loc');
  if (!loc || !thumbnail || !content) {
    violations.push('video-sitemap.xml entry missing loc, thumbnail_loc, or content_loc');
    continue;
  }
  if (!mainSet.has(normalizeUrl(loc))) violations.push(`video sitemap loc is not a canonical main-sitemap URL: ${loc}`);
  for (const [kind, assetUrl] of [['thumbnail', thumbnail], ['content', content]]) {
    const pathname = decodeURIComponent(new URL(decodeXml(assetUrl)).pathname).replace(/^\/+/, '');
    if (!fs.existsSync(path.join(out, pathname))) violations.push(`video ${kind} asset missing from build output: ${assetUrl}`);
  }
}

if (violations.length) {
  console.error('[validate-index-hygiene] FAILED');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log('[validate-index-hygiene] PASS — sitemap, noindex surfaces, and legacy signals are clean');
