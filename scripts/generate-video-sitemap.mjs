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

  { id:'industrial-process', title:'Industrial & Process Filtration', description:'Engineering-led filtration and process protection for industrial air, dust and fume, gas, fluids and water.', page:'/industrial-process/', content:'/images/presentacion.mp4', thumbnail:'/images/planta_converted.avif' },

  { id:'aeremis', title:'AEREMIS™ Air Technologies', description:'Industrial air treatment for ventilation, critical-air and molecular-contamination applications.', page:'/industrial-process/aeremis/', content:'/images/Air%20Industrial-aviation%20(1).mp4', thumbnail:'/images/air%20industrial.jpg' },
  { id:'general-air-filtration', title:'General Air Filtration', description:'Particulate filtration for industrial ventilation, make-up air and general air-handling duties.', page:'/industrial-process/aeremis/general-air-filtration/', content:'/images/general%20filters%20(1).mp4', thumbnail:'/images/General%20Air%20Filtration.png' },
  { id:'he-criva', title:'HE-CRIVA™ High-Efficiency / Critical Air Filtration', description:'High-efficiency particulate control for critical and high-cleanliness air applications.', page:'/industrial-process/aeremis/he-criva/', content:'/images/HE-CRIVA-%20VIDEO%20(1).mp4', thumbnail:'/images/HE-CRIVA.png' },
  { id:'ma-trea', title:'MA-TREA™ Molecular Air Treatment', description:'Molecular-phase air treatment for gases, vapors, odors and corrosive molecular contaminants.', page:'/industrial-process/aeremis/ma-trea/', content:'/images/MA_TREA-VIDEO.mp4', thumbnail:'/images/MATREA.png' },

  { id:'partion', title:'PARTION™ Dust & Fume Technologies', description:'Industrial dust and fume filtration for process-generated particulate and extraction duties.', page:'/industrial-process/partion/', content:'/images/PARTION-VIDEO.mp4', thumbnail:'/images/PARTION%E2%84%A2.png' },
  { id:'fumevra', title:'FUMEVRA™ Fine Dust & Fume Filtration', description:'Process-generated fine dust and fume filtration for industrial extraction and dust-collection systems.', page:'/industrial-process/partion/fumevra/', content:'/images/fumevra-%20video.mp4', thumbnail:'/images/FUMEVRA%E2%84%A2.png' },

  { id:'coalvex', title:'COALVEX™ Gas Conditioning Technologies', description:'Gas conditioning architecture for coalescence and gas-liquid separation duties.', page:'/industrial-process/coalvex/', content:'/images/Oil%26Gas(1).mp4', thumbnail:'/images/coalvex.png' },
  { id:'coaleris', title:'COALERIS™ Gas Coalescence', description:'Gas coalescence treatment for entrained liquid aerosols and fine droplets in gas streams.', page:'/industrial-process/coalvex/coaleris/', content:'/images/COALERS-VIDEO.mp4', thumbnail:'/images/COALERIS.png' },
  { id:'gas-liquid-separation', title:'Gas-Liquid Separation', description:'Gas-liquid separation treatment for bulk or entrained liquid removal in gas-process applications.', page:'/industrial-process/coalvex/gas-liquid-separation/', content:'/images/Planta%20(1).mp4', thumbnail:'/images/Gas-Liquid%20Separation.png' },

  { id:'flurexis', title:'FLUREXIS™ Fluid Conditioning Technologies', description:'Industrial fluid conditioning for hydraulic cleanliness, lubrication filtration, water removal and oil remediation.', page:'/industrial-process/flurexis/', content:'/images/FLUREXIS-VIDEO.mp4', thumbnail:'/images/FLUREXIS%E2%84%A2.png' },
  { id:'hyltris', title:'HYLTRIS™ Hydraulic Fluid Filtration', description:'Hydraulic-fluid particulate contamination control for industrial hydraulic systems.', page:'/industrial-process/flurexis/hyltris/', content:'/images/HYLTRIS-VIDEO.mp4', thumbnail:'/images/HYITRIS-image.png' },
  { id:'lubreva', title:'LUBREVA™ Industrial Lubrication Filtration', description:'Industrial lubrication filtration for particulate cleanliness and lubricant-system protection.', page:'/industrial-process/flurexis/lubreva/', content:'/images/LUBREVA%20TECNICO.mp4', thumbnail:'/images/LUBREVA%20TECNICO.png' },
  { id:'dewatis', title:'DEWATIS™ Oil Dehydration & Water Removal', description:'Water-removal treatment for hydraulic and lubricating oils under validated application conditions.', page:'/industrial-process/flurexis/dewatis/', content:'/images/dewaits%20video.mp4', thumbnail:'/images/dewatis.png' },
  { id:'oilrevex', title:'OILREVEX™ Oil Condition Remediation', description:'Oil-condition remediation for varnish precursors and chemical contaminants not resolved by particulate filtration alone.', page:'/industrial-process/flurexis/oilrevex/', content:'/images/OILREVEX%20video.mp4', thumbnail:'/images/OILREVEX.png' },

  { id:'aquvexis', title:'AQUVEXIS™ Water Treatment Technologies', description:'Industrial water treatment organized around particulate control, adsorption, membrane separation and ion exchange.', page:'/industrial-process/aquvexis/', content:'/images/AQUVEXIS-video.mp4', thumbnail:'/images/AQUVEXIS%E2%84%A2.png' },
  { id:'depth-filtration', title:'Depth Filtration', description:'Depth-media particulate removal for industrial water pretreatment and process-water control.', page:'/industrial-process/aquvexis/depth-filtration/', content:'/images/Depth%20Filtration-video.mp4', thumbnail:'/images/Depth%20Filtration.png' },
  { id:'adsovex', title:'ADSOVEX™ Adsorptive Carbon Treatment', description:'Adsorptive carbon treatment for selected dissolved constituents and residual oxidants.', page:'/industrial-process/aquvexis/adsovex/', content:'/images/ADSOVEX%20video.mp4', thumbnail:'/images/ADSOVEX.png' },
  { id:'membravex', title:'MEMBRAVEX™ Membrane Separation', description:'Membrane separation architecture spanning reverse osmosis, ultrafiltration and nanofiltration.', page:'/industrial-process/aquvexis/membravex/', content:'/images/MEMBRAVEX.mp4', thumbnail:'/images/MEMBRAVEX.png' },
  { id:'ionvexa', title:'IONVEXA™ Ion Exchange', description:'Ion-exchange treatment for selective ionic removal, softening, demineralization and water conditioning.', page:'/industrial-process/aquvexis/ionvexa/', content:'/images/IONVEXA%E2%84%A2.mp4', thumbnail:'/images/IONVEXA%E2%84%A2.png' },
];

function escapeXml(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function generateVideoSitemap() {
  const entries = VIDEOS.map((video) => `
  <url>
    <loc>${escapeXml(BASE_URL + video.page)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(BASE_URL + (video.thumbnail || `/images/${video.id}-thumb.svg`))}</video:thumbnail_loc>
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
console.log(`[generate-video-sitemap] PASS — ${VIDEOS.length} governed videos`);
