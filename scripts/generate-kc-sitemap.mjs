/**
 * Post-build script: appends all /knowledge-center/* routes to sitemap.xml
 * Scans frontend/out/knowledge-center/ for index.html files, builds URL entries,
 * and injects them into both frontend/public/sitemap.xml and frontend/out/sitemap.xml.
 *
 * Run automatically via package.json "postbuild" script.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'frontend', 'out');
const KC_OUT_DIR = join(OUT_DIR, 'knowledge-center');
const PUBLIC_SITEMAP = join(ROOT, 'frontend', 'public', 'sitemap.xml');
const OUT_SITEMAP = join(OUT_DIR, 'sitemap.xml');
const BASE_URL = 'https://elimfilters.com';
const TODAY = new Date().toISOString().split('T')[0];

function walkDir(dir, results = []) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, results);
    } else if (entry === 'index.html') {
      results.push(fullPath);
    }
  }
  return results;
}

function buildUrl(indexPath) {
  const rel = relative(OUT_DIR, indexPath).replace(/\/index\.html$/, '').replace(/\\index\.html$/, '');
  return `${BASE_URL}/${rel}`;
}

function priorityFor(url) {
  const depth = url.replace(BASE_URL, '').split('/').filter(Boolean).length;
  if (depth === 1) return '0.8';
  if (depth === 2) return '0.7';
  return '0.6';
}

function buildEntry(url) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priorityFor(url)}</priority>
  </url>`;
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
  if (!existsSync(sitemapPath)) {
    console.warn(`  [warn] sitemap not found: ${sitemapPath}`);
    return;
  }
  let content = readFileSync(sitemapPath, 'utf8');

  // Remove any previously injected KC block
  content = content.replace(/\n  <!-- ── Knowledge Center ── -->[\s\S]*?(?=\n<\/urlset>)/, '');

  const block = `\n  <!-- ── Knowledge Center ── -->\n${entries.join('\n')}\n`;
  content = content.replace('</urlset>', `${block}</urlset>`);
  writeFileSync(sitemapPath, content, 'utf8');
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (!existsSync(KC_OUT_DIR)) {
  console.error('[generate-kc-sitemap] ERROR: knowledge-center out dir not found. Run `next build` first.');
  process.exit(1);
}

const indexFiles = walkDir(KC_OUT_DIR);
const urls = [];
const entries = [];
for (const htmlFile of indexFiles.sort()) {
  if (isIndexable(htmlFile)) {
    const url = buildUrl(htmlFile);
    urls.push(url);
    entries.push(buildEntry(url));
  }
}

console.log(`[generate-kc-sitemap] Found ${urls.length} knowledge-center pages`);

injectIntoSitemap(PUBLIC_SITEMAP, entries);
console.log(`[generate-kc-sitemap] Updated: ${PUBLIC_SITEMAP}`);

injectIntoSitemap(OUT_SITEMAP, entries);
console.log(`[generate-kc-sitemap] Updated: ${OUT_SITEMAP}`);

console.log(`[generate-kc-sitemap] Done — ${urls.length} KC URLs added to sitemap`);
