'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

const INDUSTRIES = [
  { id:'mining',            name:'MINING',            desc:'Open-pit & underground operations',   img:`${WP}/2025/08/digger-1867268_1920.jpg` },
  { id:'construction',      name:'CONSTRUCTION',      desc:'Heavy equipment & earthmoving',        img:`${WP}/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg` },
  { id:'oil-gas',           name:'OIL & GAS',         desc:'Upstream & downstream protection',    img:`${WP}/2026/04/pexels-tomfisk-6767962-1-scaled.jpg` },
  { id:'marine',            name:'MARINE',            desc:'Offshore & inland waterway',           img:`${WP}/2025/08/raphael-biscaldi-wT-fHwcHoIo-unsplash-scaled.jpg` },
  { id:'power-generation',  name:'POWER GENERATION',  desc:'Diesel & gas turbine systems',        img:`${WP}/2025/08/ChatGPT-Image-7-ago-2025-10_09_26-a.m.png` },
  { id:'agriculture',       name:'AGRICULTURE',       desc:'Harvesting & field equipment',         img:`${WP}/2025/08/Imagen1-1.webp` },
  { id:'trucks-fleets',     name:'TRUCKS & FLEETS',   desc:'Long-haul & urban logistics',         img:`${WP}/2026/02/pexels-cottonbro-7018493-scaled.jpg` },
  { id:'manufacturing',     name:'MANUFACTURING',     desc:'Industrial process equipment',         img:`${WP}/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg` },
  { id:'bus-coach',         name:'BUS & COACH',       desc:'Mass transit & tourism fleets',       img:`${WP}/2025/08/Imagen1-1.webp` },
  { id:'railway',           name:'RAILWAY',           desc:'Diesel-electric & rail systems',      img:`${WP}/2025/08/train-3895307_1920.jpg` },
  { id:'automotive',        name:'AUTOMOTIVE',        desc:'Light & commercial vehicles',          img:`${WP}/2026/04/pelon-air.png` },
  { id:'municipal-services',name:'WASTE & MUNICIPAL', desc:'Critical urban services',             img:`${WP}/2025/08/Imagen1-1.webp` },
];

export default function IndustriesIndex() {
  const css = `
    .ind{background:#000;color:#fff;min-height:100vh;}
    .ind-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ind-back:hover{background:#FFF12D;color:#000;}
    .ind-hero{padding:140px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.06);background:#000;}
    .ind-hero-inner{max-width:1400px;margin:0 auto;}
    .ind-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ind-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,7vw,96px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0 0 24px;}
    .ind-h1 span{color:#FFF12D;}
    .ind-sub{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.7;max-width:600px;letter-spacing:0.05em;}
    .ind-grid{max-width:1400px;margin:0 auto;padding:80px 6%;display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:rgba(255,255,255,0.04);}
    .ind-card{position:relative;overflow:hidden;background:#000;aspect-ratio:3/4;display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none;}
    .ind-card-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0.25;transition:opacity 0.4s,transform 0.6s;}
    .ind-card:hover .ind-card-bg{opacity:0.5;transform:scale(1.05);}
    .ind-card-ov{position:absolute;inset:0;background:linear-gradient(to top,#000 0%,rgba(0,0,0,0.4) 50%,transparent 100%);}
    .ind-card-content{position:relative;z-index:2;padding:24px;}
    .ind-card-num{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.3em;color:rgba(255,241,45,0.5);text-transform:uppercase;margin-bottom:8px;}
    .ind-card-name{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;line-height:1;margin-bottom:6px;transition:color 0.2s;}
    .ind-card:hover .ind-card-name{color:#FFF12D;}
    .ind-card-desc{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;}
    .ind-card-arrow{position:absolute;top:16px;right:16px;z-index:2;font-family:'Russo One',sans-serif;font-size:18px;color:rgba(255,255,255,0.2);transition:all 0.2s;}
    .ind-card:hover .ind-card-arrow{color:#FFF12D;transform:translate(2px,-2px);}
    .ind-cta{padding:80px 6%;background:#000;border-top:1px solid rgba(255,255,255,0.06);text-align:center;}
    .ind-cta-inner{max-width:800px;margin:0 auto;}
    .ind-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,64px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .ind-cta-h2 span{color:#FFF12D;}
    .ind-cta-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.15em;padding:20px 48px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.2s;}
    .ind-cta-btn:hover{background:#fff;}
    @media(max-width:1200px){.ind-grid{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:900px){.ind-grid{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:560px){.ind-grid{grid-template-columns:1fr 1fr;gap:1px;} .ind-card-name{font-size:14px;} .ind-card{aspect-ratio:1/1;}}
  `;

  return (
    <div className="ind">
      <style>{css}</style>
      <a href="/?skip=1" className="ind-back">&larr; HOME</a>

      <div className="ind-hero">
        <div className="ind-hero-inner">
          <div className="ind-eyebrow">// 12 INDUSTRIES / GLOBAL OPERATIONS</div>
          <h1 className="ind-h1">INDUSTRIES<br /><span>WE PROTECT</span></h1>
          <p className="ind-sub">Industrial asset protection systems engineered for the machines that cannot stop. Precision-matched filtration across mining, energy, marine, transport, and industrial operations worldwide.</p>
        </div>
      </div>

      <div className="ind-grid">
        {INDUSTRIES.map((ind, i) => (
          <Link key={ind.id} href={`/industries/${ind.id}`} className="ind-card">
            <div className="ind-card-bg" style={{backgroundImage:`url('${ind.img}')`}} />
            <div className="ind-card-ov" />
            <div className="ind-card-arrow">&nearr;</div>
            <div className="ind-card-content">
              <div className="ind-card-num">// {String(i+1).padStart(2,'0')}</div>
              <div className="ind-card-name">{ind.name}</div>
              <div className="ind-card-desc">{ind.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="ind-cta">
        <div className="ind-cta-inner">
          <div className="ind-cta-h2">FIND YOUR<br /><span>FILTER NOW</span></div>
          <Link href="/search" className="ind-cta-btn">SEARCH BY OEM / CROSS REFERENCE &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
