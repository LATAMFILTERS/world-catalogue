/**
 * Post-build Knowledge Center sitemap governance.
 *
 * Scans exported /knowledge-center/**/index.html files, excludes any noindex or
 * manifest-retired route, and applies the shared Recrawl Priority Manifest.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'frontend', 'out');
const KC_OUT_DIR = join(OUT_DIR, 'knowledge-center');
const OUT_SITEMAP = join(OUT_DIR, 'sitemap.xml');
const MANIFEST_PATH = join(ROOT, 'scripts', 'seo-geo-audit', 'recrawl-priority-manifest.json');
const BASE_URL = 'https://elimfilters.com';
const TODAY = new Date().toISOString().split('T')[0];
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

function normalizePath(value) {
  if (!value || value === '/') return '/';
  return `/${String(value).replace(/^\/+|\/+$/g, '')}`;
}

function matches(pathname, exactPaths = [], prefixes = []) {
  const normalized = normalizePath(pathname);
  if (exactPaths.some((candidate) => normalizePath(candidate) === normalized)) return true;
  return prefixes.some((prefix) => normalized.startsWith(`${normalizePath(prefix)}/`));
}

function tierFor(pathname) {
  if (matches(pathname, manifest.excluded.exactPaths, manifest.excluded.prefixes)) return 'EXCLUDED';
  for (const tier of ['P0', 'P1', 'P2']) {
    const config = manifest.tiers[tier];
    if (matches(pathname, config.exactPaths, config.prefixes)) return tier;
  }
  return 'P2';
}

function walkDir(dir, results = []) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) walkDir(fullPath, results);
    else if (entry === 'index.html') results.push(fullPath);
  }
  return results;
}

function buildUrl(indexPath) {
  const rel = relative(OUT_DIR, indexPath).replace(/\\/g, '/').replace(/\/index\.html$/, '');
  return `${BASE_URL}/${rel.replace(/^\/+|\/+$/g, '')}/`;
}

function buildEntry(url, tier) {
  const config = manifest.tiers[tier];
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${config.changeFrequency}</changefreq>\n    <priority>${Number(config.priority).toFixed(2)}</priority>\n  </url>`;
}

function isIndexable(htmlPath) {
  try {
    const html = readFileSync(htmlPath, 'utf8');
    return !html.includes('noindex');
  } catch {
    return true;
  }
}

function injectIntoSitemap(sitemapPath, entries) {
  if (!existsSync(sitemapPath)) throw new Error(`${sitemapPath} does not exist. Run next build first.`);
  const content = readFileSync(sitemapPath, 'utf8');
  if (!content.includes('</urlset>')) throw new Error(`${sitemapPath} is malformed: </urlset> missing.`);

  const withoutKnowledgeCenterEntries = content.replace(
    /\s*<url>\s*<loc>https:\/\/elimfilters\.com\/knowledge-center(?:\/[^<]*)?<\/loc>[\s\S]*?<\/url>/g,
    '',
  );
  const withoutKcBlock = withoutKnowledgeCenterEntries.replace(
    /\n  <!-- ── Knowledge Center ── -->[\s\S]*?(?=\n<\/urlset>)/,
    '',
  );
  const block = `\n  <!-- ── Knowledge Center · Recrawl Priority Manifest ${manifest.version} ── -->\n${entries.join('\n')}\n`;
  writeFileSync(sitemapPath, withoutKcBlock.replace('</urlset>', `${block}</urlset>`), 'utf8');
}

if (!existsSync(KC_OUT_DIR)) {
  console.error('[generate-kc-sitemap] ERROR: knowledge-center out dir not found. Run next build first.');
  process.exit(1);
}

const indexFiles = walkDir(KC_OUT_DIR);
const urls = [];
const entries = [];
const tierCounts = { P0: 0, P1: 0, P2: 0, EXCLUDED: 0, NOINDEX: 0 };

for (const htmlFile of indexFiles.sort()) {
  if (!isIndexable(htmlFile)) {
    tierCounts.NOINDEX += 1;
    continue;
  }
  const url = buildUrl(htmlFile);
  const pathname = new URL(url).pathname;
  const tier = tierFor(pathname);
  if (tier === 'EXCLUDED') {
    tierCounts.EXCLUDED += 1;
    continue;
  }
  tierCounts[tier] += 1;
  urls.push(url);
  entries.push(buildEntry(url, tier));
}

injectIntoSitemap(OUT_SITEMAP, entries);
console.log(`[generate-kc-sitemap] Manifest ${manifest.version} applied`);
console.log(`[generate-kc-sitemap] P0=${tierCounts.P0} P1=${tierCounts.P1} P2=${tierCounts.P2} excluded=${tierCounts.EXCLUDED} noindex=${tierCounts.NOINDEX}`);
console.log(`[generate-kc-sitemap] Done — ${urls.length} governed KC URLs added to sitemap`);
