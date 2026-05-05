'use client';
import Intro from './components/Intro';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const WP = 'https://elimfilters.com/wp-content/uploads';
const IMAGES = {
  hero: WP + '/2026/02/pexels-cottonbro-7018493-scaled.jpg',
  mechanic: WP + '/2026/02/Gemini_Generated_Image_8slfcz8slfcz8slf.png',
  logo: WP + '/2025/11/logo-sin-fondo.png',
  seal: WP + '/2025/08/a2ec2ccf-d6ed-4acf-bcda-337b5669f007_removalai_preview.png',
};

const industries = [
  { name: 'MINING', slug: 'mining', desc: 'Open-pit & underground operations', img: WP + '/2025/08/digger-1867268_1920.jpg' },
  { name: 'CONSTRUCTION', slug: 'construction', desc: 'Heavy equipment & earthmoving', img: WP + '/2025/08/construction.jpg' },
  { name: 'OIL & GAS', slug: 'oil-gas', desc: 'Upstream & downstream protection', img: WP + '/2026/04/pexels-tomfisk-6767962-1-scaled.jpg' },
  { name: 'MARINE', slug: 'marine', desc: 'Offshore & inland waterway', img: WP + '/2025/08/Screenshot-2025-08-07-075322.png' },
  { name: 'POWER GENERATION', slug: 'power-generation', desc: 'Diesel & gas turbine systems', img: WP + '/2025/08/ChatGPT-Image-7-ago-2025-10_09_26-a.m.png' },
  { name: 'AGRICULTURE', slug: 'agriculture', desc: 'Harvesting & field equipment', img: WP + '/2025/08/darla-hueske-Uz8xk0S_35c-unsplash-1-scaled.jpg' },
  { name: 'TRUCKS & FLEETS', slug: 'trucks-fleets', desc: 'Long-haul & urban logistics', img: WP + '/2026/02/pexels-cottonbro-7018493-scaled.jpg' },
  { name: 'MANUFACTURING', slug: 'manufacturing', desc: 'Industrial process equipment', img: WP + '/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg' },
  { name: 'BUS & COACH', slug: 'bus-coach', desc: 'Mass transit & tourism fleets', img: WP + '/2025/08/ChatGPT-Image-7-ago-2025-05_57_57-p.m.webp' },
  { name: 'RAILWAY', slug: 'railway', desc: 'Diesel-electric & compressed air', img: WP + '/2025/08/train-3895307_1920.jpg' },
  { name: 'AUTOMOTIVE', slug: 'automotive', desc: 'Light & commercial vehicles', img: WP + '/2026/04/pexels-mohit-hambiria-92377455-31396372-scaled.jpg' },
  { name: 'WASTE & MUNICIPAL', slug: 'waste-municipal', desc: 'Critical urban services', img: WP + '/2026/02/pexels-oscar-sanchez197-9535766-scaled.jpg' },
];

const technologies = [
  { name: 'MACROCORE', desc: 'Air Filtration' },
  { name: 'INTEKCORE', desc: 'Housing & Intake Systems' },
  { name: 'SYNTEPORE', desc: 'Fuel Filtration' },
  { name: 'AQUAGUARD', desc: 'Fuel Water Separator' },
  { name: 'SYNTRAX', desc: 'Lube Filters' },
  { name: 'NANOFORCE', desc: 'Hydraulic Filters' },
  { name: 'AQUAGUARD SERIES', desc: 'Turbine Serie FH' },
  { name: 'COOLTECH', desc: 'Coolant Filters' },
  { name: 'MICROKAPPA', desc: 'Cabin Filters' },
  { name: 'DRYCORE', desc: 'Air Dryer Filters' },
  { name: 'DURATECH', desc: 'Maintenance Filter Kits' },
  { name: 'MARINECLEAN', desc: 'Marine Filters' },
];

const stats = [
  { value: '99.9%', label: 'MEDIA EFFICIENCY' },
  { value: '5,000+', label: 'ACTIVE SKUs' },
  { value: '15', label: 'TECHNOLOGIES' },
  { value: '12', label: 'INDUSTRIES' },
];

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--y:#FFF12D;--b:#000;--g9:#0a0a0a;--g8:#111;--g7:#1a1a1a;--g4:#666;--g3:#999;--w:#fff;}
  body{background:var(--b);color:var(--w);font-family:'Barlow',sans-serif;overflow-x:hidden;}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 5%;display:flex;justify-content:space-between;align-items:center;transition:all .3s;}
  .nav.sc{background:rgba(0,0,0,.96);border-bottom:1px solid var(--g7);backdrop-filter:blur(10px);}
  .nav-logo{height:auto;width:220px;object-fit:contain;}
  .nav-links{display:flex;gap:28px;align-items:center;list-style:none;}
  .nav-links a{font-family:'Russo One',sans-serif;font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--w);text-decoration:none;transition:color .2s;}
  .nav-links a:hover{color:var(--y);}
  .nav-cta{background:var(--y)!important;color:var(--b)!important;padding:6px 14px!important;font-weight:700!important;font-size:14px!important;}
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:80px 5% 120px;position:relative;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center top;animation:kenburns 10s ease-out forwards;}
  .hero-ov{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,.97) 100%);}
  .hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,241,45,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,241,45,.03) 1px,transparent 1px);background-size:60px 60px;}
  .hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.3em;color:var(--y);text-transform:uppercase;margin-bottom:20px;opacity:.9;}
  .hero-title{font-family:'Russo One',sans-serif;font-weight:900;font-size:clamp(29px,4.8vw,66px);line-height:.9;text-transform:uppercase;color:var(--y);margin-bottom:8px;}
  .hero-sub{font-family:'Russo One',sans-serif;font-weight:400;font-size:clamp(18px,3vw,36px);text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:36px;}
  .hero-bot{display:grid;grid-template-columns:1fr auto;align-items:end;gap:40px;}
  .hero-tag{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,.85);line-height:1.7;border-left:4px solid var(--y);padding-left:24px;letter-spacing:0.05em;}
  .hero-cta-btn{background:var(--y);color:var(--b);border:none;padding:13px 31px;font-family:'Russo One',sans-serif;font-size:13px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;display:inline-block;text-decoration:none;margin-top:32px;}
  .ticker{background:var(--y);padding:12px 0;overflow:hidden;white-space:nowrap;}
  .ticker-in{display:inline-flex;animation:tick 28s linear infinite;}
  .t-item{font-family:'Russo One',sans-serif;font-size:14px;font-weight:700;letter-spacing:.2em;color:var(--b);padding:0 32px;}
  @keyframes kenburns{from{transform:scale(1.08) translateX(-3%);}to{transform:scale(1.0) translateX(0%);}}
  @keyframes tick{from{transform:translateX(0);}to{transform:translateX(-50%);}}
  .stats{padding:72px 5%;background:var(--g9);border-bottom:1px solid var(--g7);}
  .stats-grid{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--g7);}
  .stat{background:var(--g9);padding:44px 36px;text-align:center;}
  .stat-n{font-family:'Russo One',sans-serif;font-size:60px;font-weight:700;color:var(--y);line-height:1;margin-bottom:10px;}
  .stat-l{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.25em;color:var(--g4);text-transform:uppercase;}
  .problem{padding:100px 5%;background:var(--b);}
  .prob-in{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;}
  .s-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.28em;color:var(--y);text-transform:uppercase;margin-bottom:16px;opacity:.8;}
  .s-title{font-family:'Russo One',sans-serif;font-weight:800;font-size:clamp(29px,4.25vw,51px);line-height:1;text-transform:uppercase;margin-bottom:36px;}
  .s-title span{color:var(--y);}
  .prob-list{display:flex;flex-direction:column;gap:28px;}
  .prob-item{display:flex;gap:16px;align-items:flex-start;}
  .prob-num{font-family:'Russo One',sans-serif;font-size:12px;font-weight:700;color:#c33;background:rgba(204,51,51,.1);border:1px solid rgba(204,51,51,.3);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .prob-text h3{font-family:'Russo One',sans-serif;font-size:18px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:5px;}
  .prob-text p{font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--g4);line-height:1.6;}
  .prob-img{position:relative;overflow:hidden;}
  .prob-img img{width:100%;height:520px;object-fit:cover;object-position:center top;display:block;}
  .prob-img-ov{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.92),transparent);padding:36px 28px 28px;}
  .dmg-badge{display:inline-block;background:#c33;color:var(--w);font-family:'Russo One',sans-serif;font-size:44px;font-weight:900;padding:6px 16px;margin-bottom:8px;}
  .dmg-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;color:rgba(255,255,255,.65);text-transform:uppercase;}
  .tech-sec{padding:80px 5%;background:var(--g9);}
  .tech-hd{max-width:1400px;margin:0 auto;display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:52px;}
  .sec-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,64px);text-transform:uppercase;line-height:1;}
  .sec-h2 span{color:var(--y);}
  .btn-out{background:transparent;border:1px solid var(--g7);color:var(--w);font-family:'Russo One',sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none;transition:all .2s;}
  .btn-out:hover{border-color:var(--y);color:var(--y);}
  .tech-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--g7);}
  .tech-card{background:var(--b);padding:40px 32px;position:relative;cursor:pointer;transition:all .3s;display:flex;flex-direction:column;gap:12px;border:1px solid var(--g7);border-top:3px solid transparent;align-items:center;text-align:center;}
  .tech-card:hover{background:var(--g8);border-top-color:var(--y);}
  .tech-name-big{font-family:'Russo One',sans-serif;font-size:24px;color:var(--w);text-transform:uppercase;line-height:1;margin-bottom:8px;}
  .tech-desc{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:var(--g3);text-transform:uppercase;}
  .ind-sec{padding:100px 5%;background:var(--b);}
  .ind-in{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;position:relative;}
  .ind-preview{position:relative;overflow:hidden;height:320px;}
  .ind-preview img{width:100%;height:100%;object-fit:cover;}
  .ind-preview-ov{position:absolute;bottom:0;left:0;right:0;padding:28px;background:linear-gradient(to top,rgba(0,0,0,.9),transparent);}
  .ind-preview-name{font-family:'Russo One',sans-serif;font-size:28px;font-weight:800;text-transform:uppercase;color:var(--y);}
  .ind-list{display:flex;flex-direction:column;gap:4px;}
  .ind-item{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--g7);cursor:pointer;transition:all .2s;position:relative;}
  .ind-item:hover{border-bottom-color:var(--y);}
  .ind-item:hover .ind-arrow{color:var(--y);opacity:1;transform:translateX(4px);}
  .ind-item:hover .ind-connector{opacity:1;}
  .ind-item.active .ind-name{color:var(--y);}
  .ind-name{font-family:'Russo One',sans-serif;font-size:14px;text-transform:uppercase;letter-spacing:.1em;}
  .ind-sub{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:400;text-transform:none;color:var(--g4);margin-top:1px;}
  .ind-arrow{color:var(--g4);font-size:18px;transition:all .2s;opacity:.6;text-decoration:none;cursor:pointer;}
  .ind-arrow:hover{color:var(--y);}
  .ind-connector{position:absolute;left:100%;top:50%;width:60px;height:2px;background:linear-gradient(to right,var(--y),transparent);pointer-events:none;opacity:0;transition:opacity .2s;}
  .cta{background:var(--y);padding:80px 5%;}
  .cta-in{max-width:1400px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:40px;}
  .cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(36px,6vw,80px);color:var(--b);text-transform:uppercase;line-height:.95;}
  .cta-btn{background:var(--b);color:var(--w);font-family:'Russo One',sans-serif;font-size:18px;letter-spacing:.15em;text-transform:uppercase;padding:22px 52px;text-decoration:none;transition:background .2s;}
  .cta-btn:hover{background:var(--g8);}
  .cta-btn2{background:transparent;color:var(--b);border:2px solid var(--b);font-family:'Russo One',sans-serif;font-size:18px;letter-spacing:.15em;text-transform:uppercase;padding:22px 52px;text-decoration:none;transition:all .2s;}
  .cta-btn2:hover{background:var(--b);color:var(--w);}
  .footer{background:var(--g9);padding:0;}
  .footer-top-bar{display:none;}
  .footer-in{max-width:1400px;margin:0 auto;padding:72px 5% 0;}
  .footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid var(--g7);}
  .footer-brand{display:flex;flex-direction:column;gap:12px;padding-right:60px;}
  .f-logo{height:auto;width:220px;object-fit:contain;display:block;}
  .f-tagline{font-family:'Russo One',sans-serif;font-size:11px;color:var(--y);text-transform:uppercase;letter-spacing:.15em;}
  .f-corp{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--g4);letter-spacing:.15em;text-transform:uppercase;}
  .f-seal{display:none;}
  .f-social{display:flex;gap:10px;}
  .f-social-link{width:34px;height:34px;border:1px solid var(--g6);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--g3);text-decoration:none;transition:all .2s;border-radius:4px;}
  .f-social-link:hover{border-color:var(--y);color:var(--y);}
  .f-col-t{font-family:'Russo One',sans-serif;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--w);margin-bottom:20px;}
  .f-link{display:block;font-size:13px;color:var(--g4);text-decoration:none;margin-bottom:10px;transition:color .2s;}
  .f-link:hover{color:var(--y);}
  .f-bot{padding:24px 0 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}
  .f-copy{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.15em;color:var(--g4);text-transform:uppercase;}
  .f-copy strong{color:var(--w);}
  .kleo-w{position:fixed;bottom:28px;right:28px;z-index:999;}
  .kleo-btn{width:52px;height:52px;background:var(--y);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(255,241,45,.3);}
  @media(max-width:768px){
    .hero-tag{font-size:15px;text-align:left;}
    .hero-bot{display:flex;flex-direction:column;gap:20px;}
    .stats-grid{grid-template-columns:1fr 1fr;gap:1px;}
    .stat-n{font-size:clamp(36px,8vw,60px);}
    .tech-grid{grid-template-columns:1fr 1fr;}
    .ind-in{grid-template-columns:1fr;}
    .ind-preview{order:2;height:240px;}
    .ind-list{order:1;}
    .ind-connector{display:none;}
    .footer-grid{grid-template-columns:1fr;gap:32px;}
    .footer-brand{padding-right:0;}
    .nav-logo{border:none!important;background:transparent!important;}
    .hero-cta-btn{width:100%;text-align:center;padding:16px 24px;}
    .cta-in{flex-direction:column;gap:16px;}
    .prob-in{grid-template-columns:1fr;}
  }
  @media(max-width:480px){
    .tech-grid{grid-template-columns:1fr;}
    .stat-n{font-size:clamp(28px,7vw,48px);}
  }
`;

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [hoveredIndustry, setHoveredIndustry] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const skip = new URLSearchParams(window.location.search).get('skip');
      if (skip) setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveIndustry(p => (p + 1) % industries.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) window.location.href = '/search?q=' + encodeURIComponent(searchQuery);
  };

  return (
    <>
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      <style>{CSS}</style>
      <nav className={'nav ' + (scrollY > 50 ? 'sc' : '')}>
        <a href="/"><img src={IMAGES.logo} alt="ELIMFILTERS" className="nav-logo" /></a>
        <ul className="nav-links">
          <li><a href="/industries">Industries</a></li>
          <li><a href="/technologies">Technologies</a></li>
          <li><a href="/systems">Systems</a></li>
          <li><a href="/knowledge">Knowledge Hub</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/search" className="nav-cta">Part Search</a></li>
        </ul>
      </nav>

      <section className="hero">
        <div className="hero-bg" style={{backgroundImage: 'url(' + IMAGES.hero + ')'}} />
        <div className="hero-ov" />
        <div className="hero-grid" />
        <div className="hero-c">
          <p className="eyebrow">// ELIMFILTERS | TOTAL ASSET PROTECTION SYSTEMS</p>
          <h1 className="hero-title">ASSET<br />PROTECTION</h1>
          <h2 className="hero-sub">Industrial Filtration Intelligence</h2>
          <div className="hero-bot">
            <p className="hero-tag">Industrial asset protection systems engineered for fleets, mining operations, and critical diesel and gasoline-powered infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from contamination, extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
            <a href="/search" className="hero-cta-btn">FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-in">
          {[...industries, ...industries].map((ind, i) => (
            <span key={i} className="t-item">{ind.name} &bull;</span>
          ))}
        </div>
      </div>

      <section className="stats">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <div className="stat-n">{s.value}</div>
              <div className="stat-l">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="problem">
        <div className="prob-in">
          <div>
            <p className="s-label">// OPERATIONAL RISK DIAGNOSIS</p>
            <h2 className="s-title">WHAT YOU CANNOT SEE<br /><span>IS DESTROYING YOUR FLEET</span></h2>
            <div className="prob-list">
              {[
                { title: 'Injector Erosion', desc: 'Micronic particles deform spray orifices, causing immediate power loss and poor combustion.' },
                { title: 'Critical Bearing Friction', desc: 'Contaminated oil accelerates metal wear, reducing engine block life by up to 40%.' },
                { title: 'Fuel Drainage', desc: 'A restricted engine consumes up to 8% more diesel to maintain the same torque levels.' },
              ].map((item, i) => (
                <div key={i} className="prob-item">
                  <div className="prob-num">0{i + 1}</div>
                  <div className="prob-text"><h3>{item.title}</h3><p>{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="prob-img">
            <img src={IMAGES.mechanic} alt="ELIMFILTERS technician" />
            <div className="prob-img-ov">
              <div className="dmg-badge">80%</div>
              <div className="dmg-label">Of premature failures are caused by contamination</div>
            </div>
          </div>
        </div>
      </section>

      <section className="tech-sec">
        <div className="tech-hd">
          <h2 className="sec-h2">15 TECHNOLOGIES.<br /><span>ONE MISSION.</span></h2>
          <a href="/technologies" className="btn-out">VIEW ALL</a>
        </div>
        <div className="tech-grid">
          {technologies.map((t, i) => (
            <div key={i} className="tech-card">
              <div className="tech-name-big">{t.name}</div>
              <div className="tech-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="ind-sec">
        <div className="ind-in">
          <div className="ind-preview">
            <img src={industries[hoveredIndustry !== null ? hoveredIndustry : activeIndustry].img} alt={industries[hoveredIndustry !== null ? hoveredIndustry : activeIndustry].name} />
            <div className="ind-preview-ov">
              <div className="ind-preview-name">{industries[hoveredIndustry !== null ? hoveredIndustry : activeIndustry].name}</div>
            </div>
          </div>
          <div>
            <p className="s-label">// INDUSTRIES WE PROTECT</p>
            <h2 className="sec-h2" style={{marginBottom:'32px'}}>WE UNDERSTAND<br /><span>YOUR OPERATION</span></h2>
            <div className="ind-list">
              {industries.map((ind, i) => (
                <div 
                  key={i} 
                  className="ind-item"
                  onMouseEnter={() => setHoveredIndustry(i)}
                  onMouseLeave={() => setHoveredIndustry(null)}
                  onClick={() => setActiveIndustry(i)}
                >
                  <div>
                    <div className="ind-name">{ind.name}</div>
                    <div className="ind-sub">{ind.desc}</div>
                  </div>
                  <Link href={`/industries/${ind.slug}`} className="ind-arrow">→</Link>
                  <div className="ind-connector" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-in">
          <h2 className="cta-h2">PROTECT YOUR ASSETS.</h2>
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            <a href="/search" className="cta-btn">FIND MY FILTER</a>
            <a href="/dealers" className="cta-btn2">BECOME A DEALER</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-in">
          <div className="footer-top-bar"></div>
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={IMAGES.logo} alt="ELIMFILTERS" className="f-logo" />
              <p className="f-tagline">Asset Protection Technology</p>
              <p className="f-corp">A FILTVEX TECHNOLOGY LLC BRAND</p>
              <div className="f-social">
                <a href="https://instagram.com/elimfilters.global" className="f-social-link" title="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                <a href="https://youtube.com/@elimfilters9112" className="f-social-link" title="YouTube"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg></a>
                <a href="https://linkedin.com/company/elimfilters" className="f-social-link" title="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                <a href="https://facebook.com/elimfilters" className="f-social-link" title="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                <a href="https://x.com/elimfilters" className="f-social-link" title="X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                <a href="https://threads.net/@elimfilters.global" className="f-social-link" title="Threads"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.516.85-6.37 2.495-8.423C5.845 1.341 8.6.16 12.18.136h.014c3.58.023 6.334 1.204 8.184 3.508C22.022 5.697 22.5 8.551 22.5 12.068c0 3.518-.85 6.372-2.495 8.424C18.358 22.795 15.603 23.976 12.186 24z"/></svg></a>
              </div>
            </div>
            <div>
              <div className="f-col-t">Products</div>
              <a href="/search" className="f-link">Part Search</a>
              <a href="/technologies" className="f-link">Technologies</a>
              <a href="/systems" className="f-link">Systems</a>
              <a href="/warranty" className="f-link">Warranty</a>
            </div>
            <div>
              <div className="f-col-t">Industries</div>
              <a href="/industries/mining" className="f-link">Mining</a>
              <a href="/industries/construction" className="f-link">Construction</a>
              <a href="/industries/oil-gas" className="f-link">Oil &amp; Gas</a>
              <a href="/industries/marine" className="f-link">Marine</a>
              <a href="/industries" className="f-link">View All 12 &rarr;</a>
            </div>
            <div>
              <div className="f-col-t">Company</div>
              <a href="/about" className="f-link">About FILTVEX</a>
              <a href="/knowledge" className="f-link">Knowledge Hub</a>
              <a href="/dealers" className="f-link">Become a Dealer</a>
              <a href="/contact" className="f-link">Contact</a>
            </div>
            <div>
              <div className="f-col-t">Support</div>
              <a href="/warranty" className="f-link">Warranty</a>
              <a href="/contact" className="f-link">Technical Support</a>
              <a href="/dealers" className="f-link">Dealer Portal</a>
              <a href="/knowledge" className="f-link">Documentation</a>
            </div>
          </div>
          <div className="f-bot">
            <span className="f-copy">&copy; 2015&ndash;2026 FILTVEX TECHNOLOGY LLC</span>
            <span className="f-copy">ELIMFILTERS&reg; is a registered trademark of FILTVEX TECHNOLOGY LLC</span>
            <span className="f-copy"><strong>FRISCO, TX</strong> | UNITED STATES</span>
          </div>
        </div>
      </footer>

      <div className="kleo-w">
        <div className="kleo-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#000"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
      </div>
    </>
  );
}
