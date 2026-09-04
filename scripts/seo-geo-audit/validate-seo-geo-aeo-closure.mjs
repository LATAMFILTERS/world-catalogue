#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'frontend', 'out');
const REPORT_DIR = path.join(ROOT, 'seo-geo-audit-out');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'recrawl-priority-manifest.json'), 'utf8'));
const BASE_URL = MANIFEST.baseUrl;
const failures = [];
const gates = [];

function gate(name, ok, detail) {
  gates.push({ name, score: ok ? 10 : 0, ok, detail });
  if (!ok) failures.push(`${name}: ${detail}`);
}

function read(rel) {
  const file = path.join(OUT, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

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
  if (matches(pathname, MANIFEST.excluded.exactPaths, MANIFEST.excluded.prefixes)) return 'EXCLUDED';
  for (const tier of ['P0', 'P1', 'P2']) {
    const config = MANIFEST.tiers[tier];
    if (matches(pathname, config.exactPaths, config.prefixes)) return tier;
  }
  return 'P2';
}

function canonicalUrl(pathname) {
  const normalized = normalizePath(pathname);
  return normalized === '/' ? `${BASE_URL}/` : `${BASE_URL}${normalized}/`;
}

const sitemap = read('sitemap.xml');
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
  const block = match[1];
  return {
    url: block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
    priority: Number(block.match(/<priority>([^<]+)<\/priority>/)?.[1] ?? NaN),
    changeFrequency: block.match(/<changefreq>([^<]+)<\/changefreq>/)?.[1] ?? '',
  };
});
const urls = entries.map((entry) => entry.url).filter(Boolean);
const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

// 1. Manifest integrity.
const manifestOk = MANIFEST.version === '1.0'
  && MANIFEST.tiers.P0.exactPaths.length >= 7
  && new Set(MANIFEST.excluded.exactPaths).size === MANIFEST.excluded.exactPaths.length;
gate('01 Recrawl manifest integrity', manifestOk, `version=${MANIFEST.version}; P0=${MANIFEST.tiers.P0.exactPaths.length}; excluded=${MANIFEST.excluded.exactPaths.length}`);

// 2. Every P0 owner is present.
const missingP0 = MANIFEST.tiers.P0.exactPaths.filter((pathname) => !byUrl.has(canonicalUrl(pathname)));
gate('02 P0 authority coverage', missingP0.length === 0, missingP0.length ? `missing ${missingP0.join(', ')}` : `${MANIFEST.tiers.P0.exactPaths.length}/${MANIFEST.tiers.P0.exactPaths.length} P0 URLs present`);

// 3. Excluded/retired URLs are absent.
const leakedExcluded = MANIFEST.excluded.exactPaths.filter((pathname) => byUrl.has(canonicalUrl(pathname)));
gate('03 Excluded and retired hygiene', leakedExcluded.length === 0, leakedExcluded.length ? `leaked ${leakedExcluded.join(', ')}` : `${MANIFEST.excluded.exactPaths.length} excluded routes absent from sitemap`);

// 4. Sitemap priorities match manifest tiers.
const priorityMismatches = entries.filter((entry) => {
  if (!entry.url.startsWith(`${BASE_URL}/knowledge-center`)) return false;
  const pathname = new URL(entry.url).pathname;
  const tier = tierFor(pathname);
  if (tier === 'EXCLUDED') return true;
  const expected = Number(MANIFEST.tiers[tier].priority);
  return Math.abs(entry.priority - expected) > 0.001 || entry.changeFrequency !== MANIFEST.tiers[tier].changeFrequency;
});
gate('04 Sitemap tier enforcement', priorityMismatches.length === 0, priorityMismatches.length ? `${priorityMismatches.length} priority/frequency mismatches` : 'all Knowledge Center sitemap entries follow manifest tiers');

// 5. Canonical URL hygiene: no duplicates and canonical trailing slash.
const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
const invalidSlash = urls.filter((url) => url !== `${BASE_URL}/` && !url.endsWith('/'));
const normalizedKeys = urls.map((url) => url.replace(/\/$/, ''));
const duplicateVariants = normalizedKeys.filter((key, index) => normalizedKeys.indexOf(key) !== index);
gate('05 Canonical URL hygiene', duplicateUrls.length === 0 && invalidSlash.length === 0 && duplicateVariants.length === 0, `duplicates=${duplicateUrls.length}; unslashed=${invalidSlash.length}; slashVariants=${duplicateVariants.length}`);

// 6. Internal search is explicitly noindex and absent from sitemap.
const searchHtml = read('knowledge-center/search/index.html');
const searchNoindex = /name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(searchHtml)
  || /content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(searchHtml);
const searchAbsent = !byUrl.has(`${BASE_URL}/knowledge-center/search/`);
gate('06 Internal search isolation', searchNoindex && searchAbsent, `noindex=${searchNoindex}; sitemapAbsent=${searchAbsent}`);

// 7. Citation API exposes all ten canonical technologies, including TURBOCORE.
const technologyIndexPath = path.join(ROOT, 'frontend', 'public', 'api', 'citation', 'type', 'technology.json');
let citationKeys = [];
if (fs.existsSync(technologyIndexPath)) {
  const parsed = JSON.parse(fs.readFileSync(technologyIndexPath, 'utf8'));
  citationKeys = (parsed.entities || []).map((entity) => entity.key);
}
const requiredTech = ['MACROCORE','MICROKAPPA','DRYCORE','INTEKCORE','SYNTAPORE','HYDROCORE','TURBOCORE','SYNTRAX','NANOFORCE','THERMACORE'];
const missingTech = requiredTech.filter((key) => !citationKeys.includes(key));
gate('07 GEO citation technology coverage', missingTech.length === 0, missingTech.length ? `missing ${missingTech.join(', ')}` : '10/10 canonical technologies citation-grade');

// 8. Retired NFPA authority surfaces are not generated as indexable pages.
const retiredFiles = [
  'knowledge-center/standards/nfpa-t2-14/index.html',
  'knowledge-center/engineering/nfpa-t2-14-hydraulic-cleanliness/index.html',
];
const retiredIndexable = retiredFiles.filter((rel) => {
  const html = read(rel);
  return html && !html.includes('noindex');
});
gate('08 Retired authority removal', retiredIndexable.length === 0, retiredIndexable.length ? `indexable retired surfaces: ${retiredIndexable.join(', ')}` : 'NFPA T2.14 authority surfaces absent or non-indexable');

// 9. AEO FAQ hub is indexable and exposes FAQ structured data.
const faqHtml = read('knowledge-center/faq/index.html');
const faqSchema = faqHtml.includes('FAQPage');
const faqNoindex = faqHtml.includes('noindex');
const faqInSitemap = byUrl.has(`${BASE_URL}/knowledge-center/faq/`);
gate('09 AEO answer surface', faqSchema && !faqNoindex && faqInSitemap, `FAQPage=${faqSchema}; indexable=${!faqNoindex}; sitemap=${faqInSitemap}`);

// 10. Sitemap index and robots discovery are wired to current canonical sitemaps.
const sitemapIndex = read('sitemap-index.xml');
const robots = read('robots.txt');
const sitemapIndexOk = ['sitemap.xml', 'sitemap-ai.xml', 'video-sitemap.xml'].every((name) => sitemapIndex.includes(`${BASE_URL}/${name}`));
const robotsOk = robots.includes(`${BASE_URL}/sitemap-index.xml`) || robots.includes(`${BASE_URL}/sitemap.xml`);
gate('10 Discovery wiring', sitemapIndexOk && robotsOk, `sitemapIndex=${sitemapIndexOk}; robots=${robotsOk}`);

const score = gates.reduce((sum, item) => sum + item.score, 0);
const report = {
  generatedAt: new Date().toISOString(),
  score,
  maximumScore: 100,
  status: score === 100 ? 'PASS' : 'FAIL',
  manifestVersion: MANIFEST.version,
  sitemapUrlCount: urls.length,
  gates,
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORT_DIR, 'seo-geo-aeo-closure-report.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(
  path.join(REPORT_DIR, 'seo-geo-aeo-closure-report.md'),
  `# ELIMFILTERS SEO / GEO / AEO Closure Report\n\n**Score: ${score}/100 — ${report.status}**\n\n${gates.map((item) => `- ${item.ok ? 'PASS' : 'FAIL'} — ${item.name}: ${item.detail}`).join('\n')}\n`,
);

console.log('SEO / GEO / AEO CLOSURE REPORT');
console.log('==============================');
for (const item of gates) console.log(`${item.ok ? 'PASS' : 'FAIL'}  ${item.score}/10  ${item.name} — ${item.detail}`);
console.log('------------------------------');
console.log(`FINAL SCORE: ${score}/100 — ${report.status}`);
console.log(`REPORT: ${path.join(REPORT_DIR, 'seo-geo-aeo-closure-report.md')}`);

if (score !== 100) process.exit(1);
