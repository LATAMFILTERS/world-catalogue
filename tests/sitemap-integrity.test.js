'use strict';

// Guards against retired technology URLs reappearing in the sitemap.
//
// frontend/public/sitemap.xml used to be a hand-maintained static file that
// was NEVER actually served (Next's static export always regenerates
// out/sitemap.xml fresh from src/app/sitemap.ts during `next build`,
// overwriting whatever public/sitemap.xml contained). It sat stale, got
// dirtied by every postbuild run, and carried /technologies/hydrocore-series
// and /systems/hydrocore-series — URLs that never existed as real pages.
// It was deleted for that reason. This test makes sure it doesn't come back,
// and that the real generated sitemap (frontend/out/sitemap.xml, produced by
// src/app/sitemap.ts + scripts/generate-kc-sitemap.mjs) never lists a
// retired technology as an indexable URL.
//
// Run: node --test tests/sitemap-integrity.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RETIRED_URL_FRAGMENTS = ['hydrocore-series', 'aquaguard', 'cooltech'];

test('frontend/public/sitemap.xml must not exist — it is dead static content, never served', () => {
  const staticSitemap = path.join(ROOT, 'frontend/public/sitemap.xml');
  assert.equal(
    fs.existsSync(staticSitemap),
    false,
    'frontend/public/sitemap.xml was reintroduced. It is never served (out/sitemap.xml is always ' +
      'regenerated fresh from src/app/sitemap.ts during `next build`), so its only effect is to ' +
      're-carry stale/retired URLs and dirty the repo on every postbuild run. Do not re-add it — ' +
      'if crawl entries need to change, edit frontend/src/lib/crawl-optimization.ts instead.'
  );
});

test('the generated sitemap (frontend/out/sitemap.xml) never lists a retired technology URL, if a build exists', () => {
  const generatedSitemap = path.join(ROOT, 'frontend/out/sitemap.xml');
  if (!fs.existsSync(generatedSitemap)) {
    console.log('[SKIP] frontend/out/sitemap.xml not present — run `npm run build` in frontend/ first');
    return;
  }

  const xml = fs.readFileSync(generatedSitemap, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

  for (const fragment of RETIRED_URL_FRAGMENTS) {
    const offenders = locs.filter((loc) => loc.toLowerCase().includes(fragment));
    assert.deepEqual(
      offenders,
      [],
      `frontend/out/sitemap.xml lists retired-technology URL(s) containing "${fragment}": ${offenders.join(', ')}`
    );
  }

  const turbocoreCount = locs.filter((loc) => loc === 'https://elimfilters.com/technologies/turbocore').length;
  const hydrocoreCount = locs.filter((loc) => loc === 'https://elimfilters.com/technologies/hydrocore').length;
  assert.equal(turbocoreCount, 1, `/technologies/turbocore must appear exactly once in the sitemap, found ${turbocoreCount}`);
  assert.equal(hydrocoreCount, 1, `/technologies/hydrocore must appear exactly once in the sitemap, found ${hydrocoreCount}`);
});

test('crawl-optimization.ts (the real sitemap source) never hardcodes a retired technology URL', () => {
  const src = fs.readFileSync(path.join(ROOT, 'frontend/src/lib/crawl-optimization.ts'), 'utf8');
  for (const fragment of RETIRED_URL_FRAGMENTS) {
    assert.equal(
      src.toLowerCase().includes(fragment),
      false,
      `frontend/src/lib/crawl-optimization.ts references retired technology "${fragment}"`
    );
  }
});
