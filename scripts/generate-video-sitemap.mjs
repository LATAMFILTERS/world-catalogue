#!/usr/bin/env node
/**
 * Generate Video Sitemap
 * Creates XML video sitemap for Google Video Search indexing
 * Run: node scripts/generate-video-sitemap.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://elimfilters.com';

const VIDEOS = [
  {
    id: 'moleculas',
    title: 'ELIMFILTERS Contamination Control Technology',
    description: 'How ELIMFILTERS technologies protect industrial assets from contamination',
    url: '/videos/moleculas',
    thumbnail: '/video-thumbnails/moleculas.svg',
  },
  {
    id: 'agriculture',
    title: 'Filtration Solutions for Agriculture',
    description: 'Heavy-duty filtration for agricultural equipment and harvesting operations',
    url: '/videos/agriculture',
    thumbnail: '/video-thumbnails/agriculture.svg',
  },
  {
    id: 'automotive',
    title: 'Heavy-Duty Vehicle Filtration',
    description: 'Comprehensive filtration systems for trucks and commercial vehicles',
    url: '/videos/automotive',
    thumbnail: '/video-thumbnails/automotive.svg',
  },
  {
    id: 'mining',
    title: 'Mining Equipment Protection',
    description: 'Industrial filtration for extreme mining conditions',
    url: '/videos/mining',
    thumbnail: '/video-thumbnails/mining.svg',
  },
  {
    id: 'construction',
    title: 'Construction Equipment Filtration',
    description: 'Filtration systems for construction and heavy equipment',
    url: '/videos/construction',
    thumbnail: '/video-thumbnails/construction.svg',
  },
  {
    id: 'trucks-fleets',
    title: 'Fleet Maintenance Optimization',
    description: 'Total cost of ownership optimization for commercial fleets',
    url: '/videos/trucks-fleets',
    thumbnail: '/video-thumbnails/trucks-fleets.svg',
  },
  {
    id: 'railway',
    title: 'Railway Systems Protection',
    description: 'Filtration solutions for rail transport and locomotive systems',
    url: '/videos/railway',
    thumbnail: '/video-thumbnails/railway.svg',
  },
  {
    id: 'marine',
    title: 'Marine Vessel Filtration',
    description: 'Advanced filtration for maritime and ocean-going vessels',
    url: '/videos/marine',
    thumbnail: '/video-thumbnails/marine.svg',
  },
  {
    id: 'manufacturing',
    title: 'Industrial Manufacturing Systems',
    description: 'Filtration for precision manufacturing and production equipment',
    url: '/videos/manufacturing',
    thumbnail: '/video-thumbnails/manufacturing.svg',
  },
  {
    id: 'power-generation',
    title: 'Power Generation Protection',
    description: 'Filtration systems for power plants and electrical generation',
    url: '/videos/power-generation',
    thumbnail: '/video-thumbnails/power-generation.svg',
  },
  {
    id: 'oil-gas',
    title: 'Oil & Gas Operations',
    description: 'Specialized filtration for upstream and downstream operations',
    url: '/videos/oil-gas',
    thumbnail: '/video-thumbnails/oil-gas.svg',
  },
  {
    id: 'bus-coach',
    title: 'Transit & Coach Systems',
    description: 'Reliable filtration for public transportation and coach services',
    url: '/videos/bus-coach',
    thumbnail: '/video-thumbnails/bus-coach.svg',
  },];

function generateVideoSitemap() {
  const videoEntries = VIDEOS.map(
    (video) => `
  <url>
    <loc>${BASE_URL}${video.url}</loc>
    <video:video>
      <video:thumbnail_loc>${BASE_URL}${video.thumbnail}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:content_loc>${BASE_URL}/images/${escapeXml(video.id === 'moleculas' ? 'moleculas.mp4' : ({ agriculture: 'Agriculture-2.mp4', automotive: 'Autos-Vin4.mp4', mining: 'Minning4.mp4', construction: 'construction-2.mp4', 'trucks-fleets': 'Trucks&amp;Feel-1.mp4', railway: 'Train-2.mp4', marine: 'Marino-1.mp4', manufacturing: 'Manufacture-1.mp4', 'power-generation': 'Power-1.mp4', 'oil-gas': 'Petro&amp;Gas-1.mp4', 'bus-coach': 'buses-2.mp4' })[video.id])}</video:content_loc>
    </video:video>
  </url>`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoEntries}
</urlset>`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  const outputDir = path.join(__dirname, '../frontend/out');
  const sitemapFile = path.join(outputDir, 'video-sitemap.xml');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sitemapContent = generateVideoSitemap();
  fs.writeFileSync(sitemapFile, sitemapContent, 'utf-8');

  console.log(`[generate-video-sitemap] Generated video sitemap`);
  console.log(`[generate-video-sitemap] Videos indexed: ${VIDEOS.length}`);
  console.log(`[generate-video-sitemap] Output: ${sitemapFile}`);
}

main();
