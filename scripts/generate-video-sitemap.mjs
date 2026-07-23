#!/usr/bin/env node
/**
 * Generate Video Sitemap
 * Creates Google Video Sitemap XML for all videos
 * Run: node scripts/generate-video-sitemap.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video metadata (mirror of src/lib/video-metadata.ts)
const VIDEOS = {
  moleculas: {
    title: 'ELIMFILTERS — Molecular Contamination Control',
    description: 'Advanced contamination control systems engineered to reduce wear, minimize downtime, and extend equipment lifespan across industrial operations.',
    thumbnailUrl: 'https://elimfilters.com/images/moleculas-thumb.jpg',
    uploadDate: '2024-01-15T00:00:00Z',
    duration: 'PT0H0M30S',
    url: 'https://elimfilters.com',
    contentUrl: 'https://elimfilters.com/images/moleculas.mp4',
  },
  agriculture: {
    title: 'ELIMFILTERS — Agricultural Equipment Protection',
    description: 'Filtration systems engineered for agricultural operations: tractors, combines, harvesters, sprayers protecting against crop residue, soil dust, and seasonal contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/agriculture-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/industries/agriculture',
    contentUrl: 'https://elimfilters.com/images/Agriculture-2.mp4',
  },
  automotive: {
    title: 'ELIMFILTERS — Automotive Filtration Systems',
    description: 'Protection systems for passenger vehicles and commercial fleets: engines, fuel systems, cabin air, hydraulic circuits protecting against urban particulate and highway contaminants.',
    thumbnailUrl: 'https://elimfilters.com/industries/automotive-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M10S',
    url: 'https://elimfilters.com/industries/automotive',
    contentUrl: 'https://elimfilters.com/images/Autos-Vin4.mp4',
  },
  mining: {
    title: 'ELIMFILTERS — Mining Equipment Asset Protection',
    description: 'Heavy-duty filtration for mining operations: excavators, haul trucks, processing equipment protecting against abrasive dust, hydraulic stress, and extreme duty cycles.',
    thumbnailUrl: 'https://elimfilters.com/industries/mining-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M20S',
    url: 'https://elimfilters.com/industries/mining',
    contentUrl: 'https://elimfilters.com/images/Minning4.mp4',
  },
  construction: {
    title: 'ELIMFILTERS — Construction Equipment Filtration',
    description: 'Asset protection for construction: excavators, loaders, bulldozers, graders protecting against silica dust, hydraulic load, and severe jobsite conditions.',
    thumbnailUrl: 'https://elimfilters.com/industries/construction-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/industries/construction',
    contentUrl: 'https://elimfilters.com/images/construction-2.mp4',
  },
  'trucks-fleets': {
    title: 'ELIMFILTERS — Fleet Truck Filtration Systems',
    description: 'Protection systems for commercial trucking and logistics: long-haul trucks, delivery fleets, municipal vehicles protecting against highway dust and fuel contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/trucks-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M10S',
    url: 'https://elimfilters.com/industries/trucks-and-fleets',
    contentUrl: 'https://elimfilters.com/images/Trucks&Feel-1.mp4',
  },
  railway: {
    title: 'ELIMFILTERS — Railway Locomotive Protection',
    description: 'Filtration systems for locomotives and rail equipment: diesel locomotives, passenger rail, freight trains protecting against vibration, soot, and fuel contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/railway-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/industries/railway',
    contentUrl: 'https://elimfilters.com/images/Train-2.mp4',
  },
  marine: {
    title: 'ELIMFILTERS — Marine Vessel Filtration Systems',
    description: 'Asset protection for maritime operations: commercial vessels, workboats, offshore equipment protecting against salt air, humidity, and fuel water contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/marine-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M20S',
    url: 'https://elimfilters.com/industries/marine',
    contentUrl: 'https://elimfilters.com/images/Marino-1.mp4',
  },
  manufacturing: {
    title: 'ELIMFILTERS — Industrial Manufacturing Protection',
    description: 'Filtration systems for manufacturing facilities: industrial engines, hydraulic systems, compressors, production equipment protecting against process dust and contamination.',
    thumbnailUrl: 'https://elimfilters.com/industries/manufacturing-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/industries/manufacturing',
    contentUrl: 'https://elimfilters.com/images/Manufacture-1.mp4',
  },
  'power-generation': {
    title: 'ELIMFILTERS — Power Generation Backup Systems',
    description: 'Asset protection for power generation: generator sets, standby power units, turbines protecting against fuel degradation, thermal cycling, and long idle periods.',
    thumbnailUrl: 'https://elimfilters.com/industries/power-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M15S',
    url: 'https://elimfilters.com/industries/power-generation',
    contentUrl: 'https://elimfilters.com/images/Power-1.mp4',
  },
  'oil-gas': {
    title: 'ELIMFILTERS — Oil & Gas Equipment Protection',
    description: 'Filtration systems for energy operations: compressors, pumps, turbines, offshore equipment protecting against salt air, fuel contamination, and extreme duty cycles.',
    thumbnailUrl: 'https://elimfilters.com/industries/oil-gas-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M20S',
    url: 'https://elimfilters.com/industries/oil-and-gas',
    contentUrl: 'https://elimfilters.com/images/Petro&Gas-1.mp4',
  },
  'bus-coach': {
    title: 'ELIMFILTERS — Transit Bus & Coach Protection',
    description: 'Asset protection for public transit and passenger vehicles: city buses, school buses, coaches protecting against urban dust, soot loading, and stop-go duty cycles.',
    thumbnailUrl: 'https://elimfilters.com/industries/bus-thumb.jpg',
    uploadDate: '2024-02-01T00:00:00Z',
    duration: 'PT0H1M10S',
    url: 'https://elimfilters.com/industries/bus-and-coach',
    contentUrl: 'https://elimfilters.com/images/buses-2.mp4',
  },
  'product-elimf': {
    title: 'ELIMFILTERS Product Overview',
    description: 'ELIMFILTERS filtration products: industrial-grade filter cartridges, housings, and systems engineered for asset protection across critical industrial domains.',
    thumbnailUrl: 'https://elimfilters.com/products-thumb.jpg',
    uploadDate: '2024-01-20T00:00:00Z',
    duration: 'PT0H0M45S',
    url: 'https://elimfilters.com/products',
    contentUrl: 'https://elimfilters.com/images/product-elimf.mp4',
  },
};

function generateVideoSitemap() {
  const videoEntries = Object.entries(VIDEOS)
    .map(([id, video]) => {
      return `  <url>
    <loc>${video.url}</loc>
    <video:video>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:thumbnail_loc>${video.thumbnailUrl}</video:thumbnail_loc>
      <video:duration>${video.duration.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '')}</video:duration>
      <video:content_loc>${video.contentUrl}</video:content_loc>
      <video:publication_date>${video.uploadDate}</video:publication_date>
    </video:video>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoEntries}
</urlset>`;

  return sitemap;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  const outputDir = path.join(__dirname, '../frontend/out');
  const outputFile = path.join(outputDir, 'video-sitemap.xml');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sitemap = generateVideoSitemap();
  fs.writeFileSync(outputFile, sitemap, 'utf-8');

  console.log(`[generate-video-sitemap] Generated video sitemap with ${Object.keys(VIDEOS).length} videos`);
  console.log(`[generate-video-sitemap] Output: ${outputFile}`);
}

main();
