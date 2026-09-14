#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'https://elimfilters.com';

const VIDEOS = [
  { id:'agriculture', title:'Filtration Solutions for Agriculture', description:'Heavy-duty filtration for agricultural equipment and harvesting operations', page:'/industries/agriculture/', content:'/images/Agriculture-2.mp4' },
  { id:'automotive', title:'Heavy-Duty Vehicle Filtration', description:'Comprehensive filtration systems for trucks and commercial vehicles', page:'/industries/automotive/', content:'/images/Autos-Vin4.mp4' },
  { id:'mining', title:'Mining Equipment Protection', description:'Industrial filtration for extreme mining conditions', page:'/industries/mining/', content:'/images/Mina-Video-1.mp4' },
  { id:'construction', title:'Construction Equipment Filtration', description:'Filtration systems for construction and heavy equipment', page:'/industries/construction/', content:'/images/construction-2.mp4' },
  { id:'trucks-fleets', title:'Fleet Maintenance Optimization', description:'Total cost of ownership optimization for commercial fleets', page:'/industries/trucks-fleets/', content:'/images/Trucks&Feel-1.mp4' },
  { id:'railway', title:'Railway Systems Protection', description:'Filtration solutions for rail transport and locomotive systems', page:'/industries/railway/', content:'/images/Train.mp4' },
  { id:'marine', title:'Marine Vessel Filtration', description:'Advanced filtration for maritime and ocean-going vessels', page:'/industries/marine/', content:'/images/Marino-1.mp4' },
  { id:'manufacturing', title:'Industrial Manufacturing Systems', description:'Filtration for precision manufacturing and production equipment', page:'/industries/manufacturing/', content:'/images/Manufacture-1.mp4' },
  { id:'power-generation', title:'Power Generation Protection', description:'Filtration systems for power plants and electrical generation', page:'/industries/power-generation/', content:'/images/powergenerator-Video-1.mp4' },
  { id:'oil-gas', title:'Oil & Gas Operations', description:'Specialized filtration for upstream and downstream operations', page:'/industries/oil-gas/', content:'/images/Petro&Gas-1.mp4' },
  { id:'bus-coach', title:'Transit & Coach Systems', description:'Reliable filtration for public transportation and coach services', page:'/industries/bus-coach/', content:'/images/buses-2.mp4' },
];

function escapeXml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function generateVideoSitemap() {
  const entries = VIDEOS.map((video) => `
  <url>
    <loc>${escapeXml(BASE_URL + video.page)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(`${BASE_URL}/images/${video.id}-thumb.svg`)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:content_loc>${escapeXml(BASE_URL + video.content)}</video:content_loc>
    </video:video>
  </url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${entries}
</urlset>`;
}

const outputDir = path.join(__dirname, '../frontend/out');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'video-sitemap.xml'), generateVideoSitemap(), 'utf-8');
console.log(`[generate-video-sitemap] PASS — ${VIDEOS.length} governed industry videos`);
