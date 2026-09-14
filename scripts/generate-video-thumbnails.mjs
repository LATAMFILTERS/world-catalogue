#!/usr/bin/env node
/**
 * Generate Video Thumbnails
 * Creates optimized placeholder thumbnails for video metadata
 * Run: node scripts/generate-video-thumbnails.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video configurations with branding info
const VIDEOS = {
  agriculture: { title: 'Agricultural Equipment Protection', industry: 'agriculture', color: '#8BC34A' },
  automotive: { title: 'Automotive Filtration Systems', industry: 'automotive', color: '#2196F3' },
  mining: { title: 'Mining Equipment Asset Protection', industry: 'mining', color: '#FF9800' },
  construction: { title: 'Construction Equipment Filtration', industry: 'construction', color: '#FFC107' },
  'trucks-fleets': { title: 'Fleet Truck Filtration Systems', industry: 'trucks', color: '#795548' },
  railway: { title: 'Railway Locomotive Protection', industry: 'railway', color: '#3F51B5' },
  marine: { title: 'Marine Vessel Filtration Systems', industry: 'marine', color: '#2196F3' },
  manufacturing: { title: 'Industrial Manufacturing Protection', industry: 'manufacturing', color: '#00BCD4' },
  'power-generation': { title: 'Power Generation Backup Systems', industry: 'power', color: '#FF5722' },
  'oil-gas': { title: 'Oil & Gas Equipment Protection', industry: 'oil-gas', color: '#424242' },
  'bus-coach': { title: 'Transit Bus & Coach Protection', industry: 'bus', color: '#9C27B0' },
};

/**
 * Generate SVG thumbnail as data URI
 * This creates high-quality SVG thumbnails with brand colors
 */
function generateThumbnailSVG(title, color, videoId) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="grad_${videoId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad_${videoId})"/>

  <!-- Accent bar -->
  <rect width="1200" height="12" fill="${color}"/>

  <!-- Play button overlay -->
  <circle cx="600" cy="315" r="80" fill="none" stroke="${color}" stroke-width="3" opacity="0.7"/>
  <polygon points="570,290 570,340 630,315" fill="${color}" opacity="0.8"/>

  <!-- Title -->
  <text x="600" y="420" font-family="Outfit, Arial, sans-serif" font-size="48" font-weight="700"
        fill="white" text-anchor="middle" letter-spacing="1">
    ${title}
  </text>

  <!-- Subtitle -->
  <text x="600" y="480" font-family="Inter, Arial, sans-serif" font-size="24"
        fill="rgba(255,255,255,0.7)" text-anchor="middle">
    ELIMFILTERS Industrial Filtration
  </text>

  <!-- Logo/Mark -->
  <text x="100" y="570" font-family="JetBrains Mono, monospace" font-size="16"
        fill="${color}" letter-spacing="2">
    ELIMFILTERS
  </text>

  <!-- Video indicator -->
  <rect x="1050" y="550" width="120" height="60" fill="rgba(0,0,0,0.6)" rx="4"/>
  <text x="1110" y="585" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700"
        fill="${color}" text-anchor="middle">
    VIDEO
  </text>
</svg>`;

  return svg;
}

function main() {
  const outputDir = path.join(__dirname, '../frontend/out/images');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let count = 0;

  // Generate SVG thumbnails
  Object.entries(VIDEOS).forEach(([id, config]) => {
    const outputFile = path.join(outputDir, `${id}-thumb.svg`);
    const svg = generateThumbnailSVG(config.title, config.color, id);

    fs.writeFileSync(outputFile, svg, 'utf-8');
    count++;
  });

  console.log(`[generate-video-thumbnails] Generated ${count} SVG thumbnails`);
  console.log(`[generate-video-thumbnails] Output directory: ${outputDir}`);
  console.log(`[generate-video-thumbnails] Ready to convert to PNG/WebP with ImageMagick or similar`);

  // Create conversion guide
  const guide = `# Video Thumbnail Conversion Guide

Generated ${count} high-quality SVG thumbnails for ELIMFILTERS videos.

## Convert SVG to PNG (1200x630)
\`\`\`bash
for file in images/*-thumb.svg; do
  convert "$file" -density 150 "\${file%.svg}.png"
done
\`\`\`

## Convert to WebP for smaller file size
\`\`\`bash
for file in images/*-thumb.png; do
  cwebp -q 80 "$file" -o "\${file%.png}.webp"
done
\`\`\`

## Verify thumbnails
\`\`\`bash
ls -lh images/*-thumb.{png,webp}
\`\`\`

SVG files are optimized for:
✅ Scalability (1.2MB total vs 50MB+ PNGs)
✅ Brand consistency (ELIMFILTERS colors)
✅ Fast delivery (text-based, compresses well)
✅ SEO-friendly (can be crawled, indexed as images)

Note: Google Search Console and SERP preview engines prefer PNG/WebP thumbnails.
Consider converting to PNG for maximum compatibility.
`;

  fs.writeFileSync(path.join(outputDir, 'THUMBNAIL_GUIDE.md'), guide, 'utf-8');
}

main();
