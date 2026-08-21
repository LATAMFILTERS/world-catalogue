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

if (violations.length) {
  console.error('[validate-index-hygiene] FAILED');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log('[validate-index-hygiene] PASS — sitemap, noindex surfaces, and legacy signals are clean');
