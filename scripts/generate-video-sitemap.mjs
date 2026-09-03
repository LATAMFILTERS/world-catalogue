#!/usr/bin/env node
/**
 * Generate the ELIMFILTERS video sitemap from dedicated watch-page entries.
 * The thumbnail path intentionally matches generate-video-thumbnails.mjs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'https://elimfilters.com';

const VIDEOS = [
  ['moleculas', 'ELIMFILTERS Contamination Control Technology', 'How ELIMFILTERS technologies protect industrial assets from contamination', 'moleculas.mp4'],
  ['agriculture', 'Filtration Solutions for Agriculture', 'Heavy-duty filtration for agricultural equipment and harvesting operations', 'Agriculture-2.mp4'],
  ['automotive', 'Heavy-Duty Vehicle Filtration', 'Comprehensive filtration systems for trucks and commercial vehicles', 'Autos-Vin4.mp4'],
  ['mining', 'Mining Equipment Protection', 'Industrial filtration for extreme mining conditions', 'Minning4.mp4'],
  ['construction', 'Construction Equipment Filtration', 'Filtration systems for construction and heavy equipment', 'construction-2.mp4'],
  ['trucks-fleets', 'Fleet Maintenance Optimization', 'Total cost of ownership optimization for commercial fleets', 'Trucks&Feel-1.mp4'],
  ['railway', 'Railway Systems Protection', 'Filtration solutions for rail transport and locomotive systems', 'Train-2.mp4'],
  ['marine', 'Marine Vessel Filtration', 'Advanced filtration for maritime and ocean-going vessels', 'Marino-1.mp4'],
  ['manufacturing', 'Industrial Manufacturing Systems', 'Filtration for precision manufacturing and production equipment', 'Manufacture-1.mp4'],
  ['power-generation', 'Power Generation Protection', 'Filtration systems for power plants and electrical generation', 'Power-1.mp4'],
  ['oil-gas', 'Oil & Gas Operations', 'Specialized filtration for upstream and downstream operations', 'Petro&Gas-1.mp4'],
  ['bus-coach', 'Transit & Coach Systems', 'Reliable filtration for public transportation and coach services', 'buses-2.mp4'],
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateVideoSitemap() {
  const videoEntries = VIDEOS.map(([id, title, description, contentFile]) => `
  <url>
    <loc>${BASE_URL}/videos/${id}/</loc>
    <video:video>
      <video:thumbnail_loc>${BASE_URL}/images/${id}-thumb.svg</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      <video:content_loc>${BASE_URL}/images/${escapeXml(contentFile)}</video:content_loc>
    </video:video>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoEntries}
</urlset>`;
}

function main() {
  const outputDir = path.join(__dirname, '../frontend/out');
  const sitemapFile = path.join(outputDir, 'video-sitemap.xml');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(sitemapFile, generateVideoSitemap(), 'utf-8');
  console.log(`[generate-video-sitemap] Generated video sitemap`);
  console.log(`[generate-video-sitemap] Videos indexed: ${VIDEOS.length}`);
  console.log(`[generate-video-sitemap] Thumbnail source: /images/<video-id>-thumb.svg`);
  console.log(`[generate-video-sitemap] Output: ${sitemapFile}`);
}

main();
