#!/usr/bin/env node
/**
 * Generate Sitemap Index
 * Creates XML sitemap index referencing all sub-sitemaps
 * Run: node scripts/generate-sitemap-index.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://elimfilters.com';
const SITEMAPS = [
  { url: 'sitemap.xml', name: 'Main Sitemap (Pages)' },
  { url: 'sitemap-ai.xml', name: 'AI-Focused Sitemap' },
  { url: 'video-sitemap.xml', name: 'Video Sitemap' },
];

function generateSitemapIndex() {
  const sitemapEntries = SITEMAPS.map(
    (sm) => `
  <sitemap>
    <loc>${BASE_URL}/${sm.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
              xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapEntries}
</sitemapindex>`;
}

function main() {
  const outputDir = path.join(__dirname, '../frontend/out');
  const indexFile = path.join(outputDir, 'sitemap-index.xml');

  const indexContent = generateSitemapIndex();
  fs.writeFileSync(indexFile, indexContent, 'utf-8');

  console.log(`[generate-sitemap-index] Generated sitemap index`);
  console.log(`[generate-sitemap-index] Sitemaps indexed:`);
  SITEMAPS.forEach((sm) => {
    console.log(`  - ${sm.url} (${sm.name})`);
  });
  console.log(`[generate-sitemap-index] Output: ${indexFile}`);
  console.log(`[generate-sitemap-index] Submit to GSC: ${BASE_URL}/sitemap-index.xml`);
}

main();
