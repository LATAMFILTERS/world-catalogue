'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
}

test('Next static export uses trailing slash canonicals', () => {
  const config = read('frontend/next.config.mjs');
  assert.match(config, /trailingSlash:\s*true/);
});

test('core crawl profiles normalize URLs to the trailing-slash policy', () => {
  const source = read('frontend/src/lib/crawl-optimization.ts');
  assert.ok(source.includes('function canonicalUrl(path: string): string'));
  assert.ok(source.includes("pathname !== '/' && !pathname.endsWith('/')"));
  assert.ok(source.includes('url: canonicalUrl(entity.href)'));
  assert.ok(source.includes('.map((node) => canonicalUrl(node.href))'));
});

test('failure entities resolve to current Knowledge Center canonicals, never legacy Knowledge System routes', () => {
  const failures = read('frontend/src/lib/failure-knowledge.ts');
  const graph = read('frontend/src/lib/entity-graph.ts');

  assert.ok(failures.includes("href: '/knowledge-center/engineering/contamination-control/'"));
  assert.ok(failures.includes("href: '/knowledge-center/engineering/fluid-cleanliness/'"));
  assert.ok(graph.includes('href: failure.href'));
  assert.doesNotMatch(graph, /\/knowledge-system\/contamination\//);
});

test('Knowledge Center sitemap generator emits trailing-slash URLs', () => {
  const source = read('scripts/generate-kc-sitemap.mjs');
  assert.ok(source.includes(".replace(/\\\\/g, '/')"));
  assert.ok(source.includes("return `${BASE_URL}/${rel.replace(/^\\/+|\\/+$/g, '')}/`;"));
});

test('technology portfolio and Knowledge Center definitions share one entity ID pattern', () => {
  const portfolio = read('frontend/src/app/technologies/[slug]/page.tsx');
  const knowledge = read('frontend/src/app/knowledge-center/technologies/[slug]/page.tsx');
  assert.ok(portfolio.includes('return `${technologyUrl(slug)}#technology`;'));
  assert.ok(knowledge.includes('return `${BASE_URL}/technologies/${slug}/#technology`;'));
  assert.match(portfolio, /alternates:\s*\{ canonical: url \}/);
  assert.match(knowledge, /alternates:\s*\{ canonical: url \}/);
});

test('AI sitemap contains both portfolio and technical definitions for all nine core technologies', () => {
  const xml = read('frontend/public/sitemap-ai.xml');
  const slugs = ['macrocore', 'microkappa', 'drycore', 'intekcore', 'syntapore', 'turbocore', 'syntrax', 'nanoforce', 'thermacore'];
  for (const slug of slugs) {
    assert.ok(xml.includes(`https://elimfilters.com/technologies/${slug}/`), `missing portfolio URL for ${slug}`);
    assert.ok(xml.includes(`https://elimfilters.com/knowledge-center/technologies/${slug}/`), `missing Knowledge Center URL for ${slug}`);
  }
});
