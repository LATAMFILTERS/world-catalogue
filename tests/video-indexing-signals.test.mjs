import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
const crawlSource = fs.readFileSync('frontend/src/lib/crawl-optimization.ts', 'utf8');
const videoSitemapSource = fs.readFileSync('scripts/generate-video-sitemap.mjs', 'utf8');

const VIDEO_IDS = [
  'moleculas', 'agriculture', 'automotive', 'mining', 'construction', 'trucks-fleets',
  'railway', 'marine', 'manufacturing', 'power-generation', 'oil-gas', 'bus-coach',
];

test('postbuild creates video thumbnails before generating video sitemap', () => {
  const postbuild = packageJson.scripts.postbuild;
  const thumb = postbuild.indexOf('generate-video-thumbnails.mjs');
  const sitemap = postbuild.indexOf('generate-video-sitemap.mjs');
  assert.ok(thumb >= 0, 'thumbnail generator must run in postbuild');
  assert.ok(sitemap >= 0, 'video sitemap generator must run in postbuild');
  assert.ok(thumb < sitemap, 'thumbnails must exist before sitemap generation');
});

test('all watch pages are included in the core crawl sitemap source', () => {
  assert.ok(crawlSource.includes("'/videos'"), 'video library must be crawlable');
  for (const id of VIDEO_IDS) {
    assert.ok(crawlSource.includes(`'/videos/${id}'`), `missing /videos/${id} crawl route`);
  }
});

test('video sitemap uses canonical watch URLs and generated thumbnail location', () => {
  assert.ok(videoSitemapSource.includes('/videos/${id}/'), 'watch URLs must use canonical trailing slash');
  assert.ok(videoSitemapSource.includes('/images/${id}-thumb.svg'), 'video sitemap must use generated thumbnail path');
  assert.equal(videoSitemapSource.includes('/video-thumbnails/'), false, 'retired mismatched thumbnail directory must not be used');
});
