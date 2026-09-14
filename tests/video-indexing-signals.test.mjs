import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
const crawlSource = fs.readFileSync('frontend/src/lib/crawl-optimization.ts', 'utf8');
const videoSitemapSource = fs.readFileSync('scripts/generate-video-sitemap.mjs', 'utf8');
const retired = ['moleculas', 'product-elimf', '/products'];
const industries = ['agriculture','automotive','mining','construction','trucks-fleets','railway','marine','manufacturing','power-generation','oil-gas','bus-coach'];

test('postbuild creates thumbnails before video sitemap', () => {
  const postbuild = packageJson.scripts.postbuild;
  assert.ok(postbuild.indexOf('generate-video-thumbnails.mjs') >= 0);
  assert.ok(postbuild.indexOf('generate-video-thumbnails.mjs') < postbuild.indexOf('generate-video-sitemap.mjs'));
});

test('main crawl sitemap keeps only the video hub', () => {
  assert.ok(crawlSource.includes("'/videos'"));
  assert.equal(/['"]\/videos\/[a-z0-9-]+['"]/.test(crawlSource), false);
});

test('video sitemap uses governed industry landing pages and real media', () => {
  for (const id of industries) assert.ok(videoSitemapSource.includes(`page:'/industries/${id}/'`), `missing ${id} landing page`);
  assert.ok(videoSitemapSource.includes('<video:content_loc>'));
  assert.ok(videoSitemapSource.includes('/images/${video.id}-thumb.svg'));
  assert.equal(videoSitemapSource.includes('/video-thumbnails/'), false);
  for (const signal of retired) assert.equal(videoSitemapSource.includes(signal), false, `retired video signal: ${signal}`);
});
