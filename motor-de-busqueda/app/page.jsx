'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

const WP = 'https://elimfilters.com/wp-content/uploads';

const IMAGES = {
  hero: WP + '/2026/02/pexels-cottonbro-7018493-scaled.jpg',
  mechanic: WP + '/2026/02/Gemini_Generated_Image_8slfcz8slfcz8slf.png',
  logo: WP + '/2025/11/logo-sin-fondo.png',
  seal: WP + '/2025/08/a2ec2ccf-d6ed-4acf-bcda-337b5669f007_removalai_preview.png',
};

const industries = [
  { name: 'MINING', desc: 'Open-pit & underground operations', img: WP + '/2025/08/digger-1867268_1920.jpg' },
  { name: 'CONSTRUCTION', desc: 'Heavy equipment & earthmoving', img: WP + '/2025/08/construction.jpg' },
  { name: 'OIL & GAS', desc: 'Upstream & downstream protection', img: WP + '/2026/04/pexels-tomfisk-6767962-1-scaled.jpg' },
  { name: 'MARINE', desc: 'Offshore & inland waterway', img: WP + '/2025/08/Screenshot-2025-08-07-075322.png' },
  { name: 'POWER GENERATION', desc: 'Diesel & gas turbine systems', img: WP + '/2025/08/ChatGPT-Image-7-ago-2025-10_09_26-a.m.png' },
  { name: 'AGRICULTURE', desc: 'Harvesting & field equipment', img: WP + '/2025/08/darla-hueske-Uz8xk0S_35c-unsplash-1-scaled.jpg' },
  { name: 'TRUCKS & FLEETS', desc: 'Long-haul & urban logistics', img: WP + '/2026/02/pexels-cottonbro-7018493-scaled.jpg' },
  { name: 'MANUFACTURING', desc: 'Industrial process equipment', img: WP + '/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg' },
  { name: 'BUS & COACH', desc: 'Mass transit & tourism fleets', img: WP + '/2025/08/ChatGPT-Image-7-ago-2025-05_57_57-p.m.webp' },
  { name: 'RAILWAY', desc: 'Diesel-electric & compressed air', img: WP + '/2025/08/train-3895307_1920.jpg' },
  { name: 'AUTOMOTIVE', desc: 'Light & commercial vehicles', img: WP + '/2026/04/pexels-mohit-hambiria-92377455-31396372-scaled.jpg' },
  { name: 'WASTE & MUNICIPAL', desc: 'Critical urban services', img: WP + '/2026/02/pexels-oscar-sanchez197-9535766-scaled.jpg' },
];

const technologies = [
  { name: 'MACROCORE', desc: 'Air Filtration', logo: '/assets/logo-macrocore.png' },
  { name: 'INTEKCORE', desc: 'Housing & Intake Systems', logo: '/assets/logo-intekcore.png' },
  { name: 'SYNTEPORE', desc: 'Fuel Filtration', logo: '/assets/logo-syntepore.png' },
  { name: 'AQUAGUARD', desc: 'Fuel Water Separator', logo: '/assets/logo-aquaguard.png' },
  { name: 'SINTRAX', desc: 'Lube Filters', logo: '/assets/logo-sintrax.png' },
  { name: 'NANOFORCE', desc: 'Hydraulic Filters', logo: '/assets/logo-nanoforce.png' },
  { name: 'AQUAGUARD SERIES', desc: 'Turbine Serie FH', logo: '/assets/logo-aquaguard.png' },
  { name: 'COOLTECH', desc: 'Coolant Filters', logo: '/assets/logo-cooltech.png' },
  { name: 'MICROKAPPA', desc: 'Cabin Filters', logo: '/assets/logo-microkappa.png' },
  { name: 'DRYCORE', desc: 'Air Dryer Filters', logo: '/assets/logo-drycore.png' },
  { name: 'DURATECH', desc: 'Maintenance Filter Kits', logo: '/assets/logo-duratech.png' },
  { name: 'MARINECLEAN', desc: 'Marine Filters', logo: '/assets/logo-marineclean.png' },
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
  .nav-logo{height:70px;width:auto;}
  .nav-links{display:flex;gap:28px;align-items:center;list-style:none;}
  .nav-links a{font-family:'Russo One',sans-serif;font-size:14px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--w);text-decoration:none;transition:color .2s;}
  .nav-links a:hover{color:var(--y);}
  .nav-cta{background:var(--y)!important;color:var(--b)!important;padding:6px 14px!important;font-weight:700!important;font-size:14px!important;}
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:80px 5% 120px;position:relative;overflow:hidden;}
  .hero-bg{position:absolute;inset:0;background-size:cover;background-position:center top;}
  .hero-ov{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,.97) 100%);}
  .hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,241,45,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,241,45,.03) 1px,transparent 1px);background-size:60px 60px;}
  .hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.3em;color:var(--y);text-transform:uppercase;margin-bottom:20px;opacity:.9;}
  .hero-title{font-family:'Russo One',sans-serif;font-weight:900;font-size:clamp(29px,4.8vw,66px);line-height:.9;text-transform:uppercase;color:var(--y);margin-bottom:8px;}
  .hero-sub{font-family:'Russo One',sans-serif;font-weight:400;font-size:clamp(24px,4vw,52px);text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:44px;}
  .hero-bot{display:grid;grid-template-columns:1fr auto;align-items:end;gap:40px;}
  .hero-tag{font-size:19px;font-weight:300;color:rgba(255,255,255,.85);line-height:1.65;border-left:4px solid var(--y);padding-left:24px;text-align:justify;}
  .hero-search{display:flex;flex:1;max-width:460px;}
  .hero-search input{flex:1;background:rgba(0,0,0,.65);border:1px solid rgba(255,255,255,.18);border-right:none;color:var(--w);padding:15px 18px;font-family:'JetBrains Mono',monospace;font-size:12px;outline:none;transition:border-color .2s;backdrop-filter:blur(12px);}
  .hero-search input:focus{border-color:var(--y);}
  .hero-cta-btn{background:var(--y);color:var(--b);border:none;padding:13px 31px;font-family:'Russo One',sans-serif;font-size:13px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;display:inline-block;text-decoration:none;margin-top:32px;}
  .ticker{background:var(--y);padding:12px 0;overflow:hidden;white-space:nowrap;}
  .ticker-in{display:inline-flex;animation:tick 28s linear infinite;}
  .t-item{font-family:'Russo One',sans-serif;font-size:14px;font-weight:700;letter-spacing:.2em;color:var(--b);padding:0 32px;}
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
  .prob-text p{font-size:16px;color:var(--g4);line-height:1.6;}
  .prob-img{position:relative;overflow:hidden;}
  .prob-img img{width:100%;height:520px;object-fit:cover;object-position:center top;display:block;}
  .prob-img-ov{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.92),transparent);padding:36px 28px 28px;}
  .dmg-badge{display:inline-block;background:#c33;color:var(--w);font-family:'Russo One',sans-serif;font-size:44px;font-weight:900;padding:6px 16px;margin-bottom:8px;}
  .dmg-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;color:rgba(255,255,255,.65);text-transform:uppercase;}
  .tech-sec{padding:100px 5%;background:var(--g9);border-top:1px solid var(--g7);}
  .tech-in{max-width:1400px;margin:0 auto;}
  .tech-hdr{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px;}
  .tech-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--g7);}
  .tech-card{background:var(--b);padding:40px 32px;position:relative;cursor:pointer;transition:all .3s;display:flex;flex-direction:column;gap:12px;border:1px solid var(--g7);border-top:3px solid transparent;align-items:center;text-align:center;}
  .tech-card:hover{background:var(--g8);border-color:var(--y);}
  .tech-logo{height:96px;width:auto;object-fit:contain;object-position:left;}
  .tech-name-big{font-family:'Russo One',sans-serif;font-size:24px;color:var(--w);text-transform:uppercase;line-height:1;margin-bottom:8px;} .tech-desc{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:var(--g3);text-transform:uppercase;}
  .tech-pfx{position:absolute;top:20px;right:20px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#333;}
  .ind-sec{padding:100px 5%;background:var(--b);border-top:1px solid var(--g7);}
  .ind-in{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;}
  .ind-preview{position:relative;overflow:hidden;height:320px;}
  .ind-preview img{width:100%;height:100%;object-fit:cover;}
  .ind-preview-ov{position:absolute;bottom:0;left:0;right:0;padding:28px;background:linear-gradient(to top,rgba(0,0,0,.9),transparent);}
  .ind-preview-name{font-family:'Russo One',sans-serif;font-size:28px;font-weight:800;text-transform:uppercase;color:var(--y);}
  .ind-list{display:flex;flex-direction:column;gap:2px;}
  .ind-item{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border:1px solid transparent;cursor:pointer;transition:all .2s;font-family:'Russo One',sans-serif;font-size:18px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--g4);}
  .ind-item.active{border-color:var(--y);color:var(--w);background:rgba(255,241,45,.03);}
  .ind-sub{font-family:'Barlow',sans-serif;font-size:14px;font-weight:400;text-transform:none;color:var(--g4);margin-top:1px;}
  .ind-item.active .ind-sub{color:rgba(255,241,45,.55);}
  .cta{padding:100px 5%;background:var(--y);position:relative;overflow:hidden;}
  .cta-in{max-width:1400px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:40px;position:relative;z-index:1;}
  .cta-title{font-family:'Russo One',sans-serif;font-size:clamp(44px,7vw,88px);font-weight:900;text-transform:uppercase;color:var(--b);line-height:.88;}
  .cta-btns{display:flex;gap:14px;}
  .btn-p{background:var(--b);color:var(--y);padding:16px 32px;font-family:'Russo One',sans-serif;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:none;cursor:pointer;text-decoration:none;display:inline-block;}
  .btn-s{background:transparent;color:var(--b);padding:16px 32px;font-family:'Russo One',sans-serif;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:2px solid var(--b);cursor:pointer;text-decoration:none;display:inline-block;}
  .footer{background:var(--g9);padding:0;} .footer-in-wrap{padding:72px 5% 0;max-width:1400px;margin:0 auto;}
  .footer-in{max-width:1400px;margin:0 auto;padding:72px 5% 0;}
  .footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid var(--g7);}
  .f-logo{height:auto;width:220px;object-fit:contain;margin-bottom:12px;display:block;} .f-tagline{font-family:'Barlow',sans-serif;font-size:11px;color:var(--y);text-transform:uppercase;letter-spacing:.15em;} .f-corp{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--g4);letter-spacing:.15em;text-transform:uppercase;} .footer-top-bar{display:none;} .footer-brand{display:flex;flex-direction:column;gap:12px;padding-right:60px;} .f-social{display:flex;gap:10px;} .f-social-link{width:34px;height:34px;border:1px solid var(--g6);display:flex;align-items:center;justify-content:center;font-family:'Russo One',sans-serif;font-size:10px;color:var(--g3);text-decoration:none;text-transform:uppercase;transition:all .2s;} .f-social-link:hover{border-color:var(--y);color:var(--y);}
  
  .f-seal{display:none;}
  .f-col-t{font-family:'Russo One',sans-serif;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--w);margin-bottom:18px;}
  .f-link{display:block;font-size:13px;color:var(--g4);text-decoration:none;margin-bottom:9px;}
  .f-link:hover{color:var(--y);}
  .f-bot{padding:24px 0 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}
  .f-copy{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;color:var(--g4);text-transform:uppercase;}
  .kleo-w{position:fixed;bottom:28px;right:28px;z-index:999;}
  .kleo-btn{background:var(--y);color:var(--b);width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 8px 28px rgba(255,241,45,.28);}
  @media(max-width:1024px){.stats-grid{grid-template-columns:repeat(2,1fr);}.tech-grid{grid-template-columns:repeat(2,1fr);}.prob-in,.ind-in{grid-template-columns:1fr;}.footer-grid{grid-template-columns:1fr 1fr;}.cta-in{flex-direction:column;align-items:flex-start;}.nav-links{display:none;}}
  @media(max-width:640px){.stats-grid{grid-template-columns:1fr 1fr;}.tech-grid{grid-template-columns:1fr;}.footer-grid{grid-template-columns:1fr;}.hero-bot{flex-direction:column;}.hero-search{max-width:100%;width:100%;}}
`;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [activeIndustry, setActiveIndustry] = useState(0);

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
            <p className="hero-tag">Industrial asset protection systems engineered for fleets, mining operations, and critical diesel and gasoline-powered infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from contamination, extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p><a href="/search" className="hero-cta-btn">FIND MY FILTER</a>
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
        <div className="tech-in">
          <div className="tech-hdr">
            <div>
              <p className="s-label">// PROPRIETARY TECHNOLOGY PORTFOLIO</p>
              <h2 className="s-title" style={{ fontSize: 'clamp(32px,4.5vw,56px)', marginBottom: 0 }}>15 TECHNOLOGIES.<br /><span>ONE MISSION.</span></h2>
            </div>
            <a href="/technologies" className="btn-s" style={{ borderColor: '#333', color: '#777' }}>VIEW ALL</a>
          </div>
          <div className="tech-grid">
            {technologies.map((t, i) => (
              <div key={i} className="tech-card">
                <div className="tech-name-big">{t.name}</div><div className="tech-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ind-sec">
        <div className="ind-in">
          <div className="ind-preview">
            <img src={industries[activeIndustry].img} alt={industries[activeIndustry].name} />
            <div className="ind-preview-ov">
              <div className="ind-preview-name">{industries[activeIndustry].name}</div>
            </div>
          </div>
          <div>
            <p className="s-label">// INDUSTRIES WE PROTECT</p>
            <h2 className="s-title" style={{ fontSize: 'clamp(32px,4.5vw,56px)', marginBottom: '32px' }}>WE UNDERSTAND<br /><span>YOUR OPERATION</span></h2>
            <div className="ind-list">
              {industries.map((ind, i) => (
                <div key={i} className={'ind-item ' + (activeIndustry === i ? 'active' : '')} onClick={() => setActiveIndustry(i)}>
                  <div>
                    <div>{ind.name}</div>
                    <div className="ind-sub">{ind.desc}</div>
                  </div>
                  <span>&#8594;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-in">
          <h2 className="cta-title">PROTECT<br />YOUR<br />ASSETS.</h2>
          <div className="cta-btns">
            <a href="/search" className="btn-p">FIND MY FILTER</a>
            <a href="/dealers" className="btn-s">BECOME A DEALER</a>
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
              <img src={IMAGES.seal} alt="Authorized" className="f-seal" />
              <div className="f-social">
                <a href="https://linkedin.com/company/elimfilters" className="f-social-link">in</a>
                <a href="https://instagram.com/elimfilters.global" className="f-social-link">ig</a>
                <a href="https://youtube.com/@elimfilters9112" className="f-social-link">yt</a>
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
              <a href="/industries" className="f-link">View All 12 &#8594;</a>
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
            <span className="f-copy">&#169; 2015&#8211;2026 FILTVEX TECHNOLOGY LLC</span>
            <span className="f-copy">ELIMFILTERS&#174; is a registered trademark of FILTVEX TECHNOLOGY LLC</span>
            <span className="f-copy"><strong>FRISCO, TX</strong> &#124; UNITED STATES</span>
          </div>
        </div>
      </footer>

      <div className="kleo-w">
        <button className="kleo-btn" onClick={() => window.open('https://wa.me/message/XXXXXXXXXX', '_blank')}>
          &#128172;
        </button>
      </div>
    </>
  );
}