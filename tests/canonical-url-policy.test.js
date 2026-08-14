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

test('Knowledge Center primary layouts use trailing-slash canonicals', () => {
  const layouts = {
    'frontend/src/app/knowledge-center/search/layout.tsx': 'https://elimfilters.com/knowledge-center/search/',
    'frontend/src/app/knowledge-center/standards/layout.tsx': 'https://elimfilters.com/knowledge-center/standards/',
    'frontend/src/app/knowledge-center/systems/layout.tsx': 'https://elimfilters.com/knowledge-center/systems/',
    'frontend/src/app/knowledge-center/industries/layout.tsx': 'https://elimfilters.com/knowledge-center/industries/',
    'frontend/src/app/knowledge-center/technologies/layout.tsx': 'https://elimfilters.com/knowledge-center/technologies/',
  };

  for (const [file, canonical] of Object.entries(layouts)) {
    assert.ok(read(file).includes(`canonical: '${canonical}'`), `${file} must use ${canonical}`);
  }
});

test('Knowledge Center systems metadata describes exactly the five canonical systems', () => {
  const systems = read('frontend/src/app/knowledge-center/systems/layout.tsx');
  assert.match(systems, /five canonical ELIMFILTERS protection systems/i);
  assert.match(systems, /Air Intake & Airflow/);
  assert.match(systems, /Fuel Cleanliness/);
  assert.match(systems, /Lubrication/);
  assert.match(systems, /Hydraulic/);
  assert.match(systems, /Cooling System Protection/);
  assert.doesNotMatch(systems, /cabin air protection systems/i);
});

test('core system and family routes use one trailing-slash brand identity', () => {
  const systems = read('frontend/src/app/systems/[slug]/page.tsx');
  const families = read('frontend/src/app/families/[slug]/page.tsx');
  const familyIndex = read('frontend/src/app/families/page.tsx');

  assert.ok(systems.includes("const url = `${BASE_URL}/systems/${sys.slug}/`;"));
  assert.ok(systems.includes("siteName: 'ELIMFILTERS'"));
  assert.ok(systems.includes("url: systemUrl"));
  assert.ok(families.includes("const url = `${BASE_URL}/families/${fam.slug}/`;"));
  assert.ok(families.includes("siteName: 'ELIMFILTERS'"));
  assert.ok(familyIndex.includes("canonical: `${BASE_URL}/families/`"));
  assert.ok(familyIndex.includes("url: `${BASE_URL}/families/`"));
  assert.ok(familyIndex.includes("url: `${BASE_URL}/families/${family.slug}/`"));
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
