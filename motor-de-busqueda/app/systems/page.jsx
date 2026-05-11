'use client';
import Link from 'next/link';

import { WP } from '../constants';

export default function SystemsPage() {
  const systems = [
    { slug:'air',        name:'Air Filtration',      desc:'Engine intake air protection',           tech:'MACROCORE' },
    { slug:'fuel',       name:'Fuel Systems',         desc:'High-pressure common rail protection',    tech:'SYNTEPORE / NANOFORCE' },
    { slug:'hydraulic',  name:'Hydraulic Systems',    desc:'Precision hydraulic circuit defense',     tech:'NANOFORCE' },
    { slug:'coolant',    name:'Coolant Systems',      desc:'Thermal stability and corrosion control', tech:'COOLTECH' },
    { slug:'cabin',      name:'Cabin Systems',        desc:'Occupant air quality and HVAC protection',tech:'MICROKAPPA' },
    { slug:'marine',     name:'Marine Systems',       desc:'Saltwater and offshore protection',        tech:'MARINECLEAN' },
    { slug:'housings',   name:'Filter Housings',      desc:'Structural filter housing systems',        tech:'INTEKCORE' },
    { slug:'air-dryers', name:'Air Dryers',           desc:'Pneumatic brake and control moisture',     tech:'DRYCORE' },
    { slug:'gas',        name:'Gas Systems',          desc:'CNG and LNG engine protection',           tech:'SYNTEPORE' },
  ];

  const css = `
    .sy{background:#000;color:#fff;min-height:100vh;}
    .sy-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .sy-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .sy-hero{min-height:60vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 50%,transparent 100%),url('${WP}/2026/02/pexels-mohit-hambiria-92377455-31396372-scaled.jpg') right/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .sy-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .sy-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .sy-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .sy-h1 span{color:#FFF12D;}
    .sy-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .sy-grid{padding:80px 6%;background:#050505;}
    .sy-grid-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:2px;}
    .sy-card{background:#080808;padding:36px;border:1px solid rgba(255,255,255,0.04);text-decoration:none;display:block;transition:all 0.3s;}
    .sy-card:hover{background:#0d0d0d;border-color:#FFF12D;}
    .sy-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .sy-card-name{font-family:'Russo One',sans-serif;font-size:24px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .sy-card-desc{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:16px;}
    .sy-card-tech{font-family:'JetBrains Mono',monospace;font-size:10px;color:#FFF12D;letter-spacing:0.15em;text-transform:uppercase;}
    @media(max-width:1024px){.sy-grid-inner{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.sy-grid-inner{grid-template-columns:1fr;}.sy-hero-p{font-size:12px;}}
  `;

  return (
    <div className="sy">
      <style>{css}</style>
      <a href="/" className="sy-back">&larr; HOME</a>
      <section className="sy-hero">
        <div className="sy-hero-inner">
          <div className="sy-eyebrow">// INTEGRATED SYSTEM PROTECTION</div>
          <h1 className="sy-h1">FILTRATION<br /><span>SYSTEMS</span></h1>
          <p className="sy-hero-p">Complete protection across all critical fluid and air systems — engineered as an integrated defense architecture, not individual components. Certified to ISO 16889 standards.</p>
        </div>
      </section>
      <section className="sy-grid">
        <div className="sy-grid-inner">
          {systems.map((s) => (
            <Link key={s.slug} href={`/systems/${s.slug}`} className="sy-card">
              <div className="sy-card-label">SYSTEM MODULE</div>
              <div className="sy-card-name">{s.name}</div>
              <div className="sy-card-desc">{s.desc}</div>
              <div className="sy-card-tech">{s.tech}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}