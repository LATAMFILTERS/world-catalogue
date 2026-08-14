'use strict';

// Runs the real sitemap build cycle end to end and verifies its shape,
// instead of asserting on static snapshots. This is what actually caught
// the frontend/public/sitemap.xml regression that a file-existence-only
// check missed: the file was never rewritten, but the deploy log line
// claiming it was updated made it look otherwise.
//
// Cycle under test:
//   1. `next build` (frontend/src/app/sitemap.ts generates the core routes
//      into frontend/out/sitemap.xml)
//   2. `node scripts/generate-kc-sitemap.mjs` (postbuild — scans the real
//      frontend/out/knowledge-center/**/index.html files `next build` just
//      produced and appends them to that same frontend/out/sitemap.xml)
//   3. assertions against the resulting frontend/out/sitemap.xml
//
// No URL counts are hardcoded: core-route and Knowledge-Center counts are
// measured from this run, not pinned to a historical number, so the test
// keeps passing as real content is added or removed.
//
// Run: node --test tests/sitemap-integrity.test.js
// This executes a full `next build` twice (once per test) — expect ~1-2
// minutes per run, hence the extended per-test timeout below.

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const OUT_DIR = path.join(FRONTEND, 'out');
const KC_OUT_DIR = path.join(OUT_DIR, 'knowledge-center');
const OUT_SITEMAP = path.join(OUT_DIR, 'sitemap.xml');
const PUBLIC_SITEMAP = path.join(FRONTEND, 'public', 'sitemap.xml');
const GENERATOR_SCRIPT = path.join(ROOT, 'scripts', 'generate-kc-sitemap.mjs');

const RETIRED_URL_FRAGMENTS = ['TURBOCORE-series', 'aquaguard', 'THERMACORE'];
const BUILD_TIMEOUT_MS = 10 * 60 * 1000;

function countLocs(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
}

function walkIndexHtmlFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkIndexHtmlFiles(fullPath, results);
    } else if (entry === 'index.html') {
      results.push(fullPath);
    }
  }
  return results;
}

function isIndexable(htmlPath) {
  try {
    return !fs.readFileSync(htmlPath, 'utf8').includes('noindex');
  } catch {
    return true;
  }
}

/**
 * Runs `next build` from a clean frontend/out + frontend/.next (so the
 * result cannot be an artifact of a previous run), then the postbuild
 * sitemap generator, exactly as package.json's build/postbuild scripts do.
 * Returns the core-route count measured right after `next build`, before
 * the Knowledge Center block is injected.
 */
function runFullBuildCycle() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.rmSync(path.join(FRONTEND, '.next'), { recursive: true, force: true });
  if (fs.existsSync(PUBLIC_SITEMAP)) {
    throw new Error(
      `${PUBLIC_SITEMAP} exists before the build even ran — remove it from the working tree before testing.`
    );
  }

  execFileSync('npx', ['next', 'build'], { cwd: FRONTEND, stdio: 'pipe' });

  assert.ok(fs.existsSync(OUT_SITEMAP), 'frontend/out/sitemap.xml must exist immediately after `next build`');
  const coreRouteCount = countLocs(fs.readFileSync(OUT_SITEMAP, 'utf8')).length;

  execFileSync('node', [GENERATOR_SCRIPT], { cwd: ROOT, stdio: 'pipe' });

  return { coreRouteCount };
}

function assertCycleResult(coreRouteCount, label) {
  assert.equal(
    fs.existsSync(PUBLIC_SITEMAP),
    false,
    `[${label}] frontend/public/sitemap.xml exists after the build cycle — generate-kc-sitemap.mjs must only write frontend/out/sitemap.xml`
  );

  const legitimateKcFiles = walkIndexHtmlFiles(KC_OUT_DIR).filter(isIndexable);
  const legitimateKcCount = legitimateKcFiles.length;

  const sitemapXml = fs.readFileSync(OUT_SITEMAP, 'utf8');
  const locs = countLocs(sitemapXml);

  // Matches both the hub root (".../knowledge-center", no trailing segment)
  // and every nested page (".../knowledge-center/...").
  const kcLocs = locs.filter((loc) => loc.endsWith('/knowledge-center') || loc.includes('/knowledge-center/'));
  assert.equal(
    kcLocs.length,
    legitimateKcCount,
    `[${label}] sitemap has ${kcLocs.length} knowledge-center URLs but ${legitimateKcCount} legitimate ` +
      'indexable index.html files were found under frontend/out/knowledge-center'
  );

  assert.equal(
    locs.length,
    coreRouteCount + legitimateKcCount,
    `[${label}] expected total = core routes (${coreRouteCount}) + KC routes (${legitimateKcCount}) = ` +
      `${coreRouteCount + legitimateKcCount}, got ${locs.length}`
  );

  assert.equal(new Set(locs).size, locs.length, `[${label}] sitemap has duplicate <loc> entries`);

  for (const fragment of RETIRED_URL_FRAGMENTS) {
    const offenders = locs.filter((loc) => loc.toLowerCase().includes(fragment));
    assert.deepEqual(offenders, [], `[${label}] sitemap lists retired-technology URL(s) containing "${fragment}": ${offenders.join(', ')}`);
  }

  const turbocoreCount = locs.filter((loc) => loc === 'https://elimfilters.com/technologies/turbocore').length;
  const TURBOCORECount = locs.filter((loc) => loc === 'https://elimfilters.com/technologies/TURBOCORE').length;
  assert.equal(turbocoreCount, 1, `[${label}] /technologies/turbocore must appear exactly once, found ${turbocoreCount}`);
  assert.equal(TURBOCORECount, 1, `[${label}] /technologies/TURBOCORE must appear exactly once, found ${TURBOCORECount}`);

  return { total: locs.length, kc: legitimateKcCount, core: coreRouteCount };
}

test('sitemap build cycle — run 1 (clean state)', { timeout: BUILD_TIMEOUT_MS }, () => {
  const { coreRouteCount } = runFullBuildCycle();
  const result = assertCycleResult(coreRouteCount, 'run 1');
  console.log(`[sitemap-integrity] run 1 — core: ${result.core}, KC: ${result.kc}, total: ${result.total}`);
});

test('sitemap build cycle — run 2 (idempotent, from clean state again)', { timeout: BUILD_TIMEOUT_MS }, () => {
  const { coreRouteCount } = runFullBuildCycle();
  const result = assertCycleResult(coreRouteCount, 'run 2');
  console.log(`[sitemap-integrity] run 2 — core: ${result.core}, KC: ${result.kc}, total: ${result.total}`);
});

test('crawl-optimization.ts (the sitemap.ts source) never hardcodes a retired technology URL', () => {
  const src = fs.readFileSync(path.join(FRONTEND, 'src/lib/crawl-optimization.ts'), 'utf8');
  for (const fragment of RETIRED_URL_FRAGMENTS) {
    assert.equal(
      src.toLowerCase().includes(fragment),
      false,
      `frontend/src/lib/crawl-optimization.ts references retired technology "${fragment}"`
    );
  }
});
