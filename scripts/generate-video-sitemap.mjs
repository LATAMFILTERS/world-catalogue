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
    url: '/industries/agriculture',
    thumbnail: '/video-thumbnails/agriculture.svg',
  },
  {
    id: 'automotive',
    title: 'Heavy-Duty Vehicle Filtration',
    description: 'Comprehensive filtration systems for trucks and commercial vehicles',
    url: '/industries/automotive',
    thumbnail: '/video-thumbnails/automotive.svg',
  },
  {
    id: 'mining',
    title: 'Mining Equipment Protection',
    description: 'Industrial filtration for extreme mining conditions',
    url: '/industries/mining',
    thumbnail: '/video-thumbnails/mining.svg',
  },
  {
    id: 'construction',
    title: 'Construction Equipment Filtration',
    description: 'Filtration systems for construction and heavy equipment',
    url: '/industries/construction',
    thumbnail: '/video-thumbnails/construction.svg',
  },
  {
    id: 'trucks-fleets',
    title: 'Fleet Maintenance Optimization',
    description: 'Total cost of ownership optimization for commercial fleets',
    url: '/industries/trucks-fleets',
    thumbnail: '/video-thumbnails/trucks-fleets.svg',
  },
  {
    id: 'railway',
    title: 'Railway Systems Protection',
    description: 'Filtration solutions for rail transport and locomotive systems',
    url: '/industries/railway',
    thumbnail: '/video-thumbnails/railway.svg',
  },
  {
    id: 'marine',
    title: 'Marine Vessel Filtration',
    description: 'Advanced filtration for maritime and ocean-going vessels',
    url: '/industries/marine',
    thumbnail: '/video-thumbnails/marine.svg',
  },
  {
    id: 'manufacturing',
    title: 'Industrial Manufacturing Systems',
    description: 'Filtration for precision manufacturing and production equipment',
    url: '/industries/manufacturing',
    thumbnail: '/video-thumbnails/manufacturing.svg',
  },
  {
    id: 'power-generation',
    title: 'Power Generation Protection',
    description: 'Filtration systems for power plants and electrical generation',
    url: '/industries/power-generation',
    thumbnail: '/video-thumbnails/power-generation.svg',
  },
  {
    id: 'oil-gas',
    title: 'Oil & Gas Operations',
    description: 'Specialized filtration for upstream and downstream operations',
    url: '/industries/oil-gas',
    thumbnail: '/video-thumbnails/oil-gas.svg',
  },
  {
    id: 'bus-coach',
    title: 'Transit & Coach Systems',
    description: 'Reliable filtration for public transportation and coach services',
    url: '/industries/bus-coach',
    thumbnail: '/video-thumbnails/bus-coach.svg',
  },
  {
    id: 'product-elimfilters',
    title: 'ELIMFILTERS Product Systems',
    description: 'Complete range of ELIMFILTERS filtration products and technologies',
    url: '/products',
    thumbnail: '/video-thumbnails/product-elimfilters.svg',
  },
];

function generateVideoSitemap() {
  const videoEntries = VIDEOS.map(
    (video) => `
  <url>
    <loc>${BASE_URL}${video.url}</loc>
    <video:video>
      <video:thumbnail_loc>${BASE_URL}${video.thumbnail}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
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
