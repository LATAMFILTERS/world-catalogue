'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

const INDUSTRIES = [
  { id:'bus-coach',          name:'Bus & Coach',       desc:'Mechanical reliability for mass transit and tourism fleets.',           img:`${WP}/2025/08/ChatGPT-Image-7-ago-2025-05_57_57-p.m.webp` },
  { id:'railway',            name:'Railway',            desc:'Precision filtration for diesel-electric engines and compressed air.',  img:`${WP}/2025/08/train-3895307_1920.jpg` },
  { id:'construction',       name:'Construction',       desc:'Hydraulic and engine shielding for the most abrasive terrains.',       img:`${WP}/2025/08/construction.jpg` },
  { id:'manufacturing',      name:'Manufacturing',      desc:'Critical industrial process protection for continuous-cycle plants.',   img:`${WP}/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg` },
  { id:'marine',             name:'Marine',             desc:'Total defense against salinity and corrosion offshore.',               img:`${WP}/2025/08/raphael-biscaldi-wT-fHwcHoIo-unsplash-scaled.jpg` },
  { id:'trucks-fleets',      name:'Trucks & Fleets',    desc:'Operational efficiency and TCO reduction for heavy transport.',        img:'https://cdn.elimfilters.com/tru.png' },
  { id:'automotive',         name:'Automotive',         desc:'Premium standards for light and commercial vehicles.',                 img:`${WP}/2026/04/pexels-mohit-hambiria-92377455-31396372-scaled.jpg` },
  { id:'mining',             name:'Mining',             desc:'Extreme filtration for 24/7 operations in hostile conditions.',        img:`${WP}/2025/08/digger-1867268_1920.jpg` },
  { id:'agriculture',        name:'Agriculture',        desc:'SYNTEPORE technology for critical harvest windows.',                   img:`${WP}/2025/08/darla-hueske-Uz8xk0S_35c-unsplash-1-scaled.jpg` },
  { id:'municipal-services', name:'Waste & Municipal',  desc:'Zero downtime for critical urban services.',                          img:`${WP}/2026/02/pexels-oscar-sanchez197-9535766-scaled.jpg` },
  { id:'oil-gas',            name:'Oil & Gas',          desc:'Engineering for drilling and compression in remote environments.',     img:`${WP}/2026/04/pexels-tomfisk-6767962-1-scaled.jpg` },
  { id:'power-generation',   name:'Power Generation',   desc:'Energy continuity for plants, hospitals and data centers.',           img:`${WP}/2025/08/ChatGPT-Image-7-ago-2025-10_09_26-a.m.png` },
];

export default function IndustriesIndex() {
  const css = `
    .ind{background:#000;color:#fff;min-height:100vh;}
    .ind-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ind-back:hover{background:#FFF12D;color:#000;}
    .ind-hero{min-height:50vh;display:flex;align-items:center;background:linear-gradient(90deg,rgba(0,0,0,0.95) 30%,rgba(0,0,0,0.4) 100%),url('${WP}/2025/08/construction.jpg') center/contain no-repeat;padding:120px 6% 60px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ind-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ind-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ind-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ind-h1 span{color:#FFF12D;}
    .ind-sec{padding:60px 6%;background:#050505;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ind-sec-inner{max-width:1400px;margin:0 auto;}
    .ind-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
    .ind-card{background:rgba(255,255,255,0.02);border-left:3px solid #1a1a1a;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);display:flex;flex-direction:column;text-decoration:none;overflow:hidden;}
    .ind-card:hover{background:rgba(255,255,255,0.05);border-left-color:#FFF12D;transform:translateY(-5px);}
    .ind-card-img-wrap{width:100%;aspect-ratio:16/9;overflow:hidden;background:#111;}
    .ind-card-img{width:100%;height:100%;object-fit:cover;transition:all 0.6s ease;}
    @media(min-width:1024px){.ind-card-img{filter:grayscale(1) contrast(1.1);} .ind-card:hover .ind-card-img{filter:grayscale(0);transform:scale(1.05);}}
    .ind-card-content{padding:20px;}
    .ind-card-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:17px;color:#fff;text-transform:uppercase;margin-bottom:8px;transition:color 0.2s;}
    .ind-card:hover .ind-card-title{color:#FFF12D;}
    .ind-card-desc{color:#888;font-size:13px;line-height:1.4;font-weight:300;}
    .ind-cta{background:#FFF12D;}
    .ind-cta-inner{max-width:1400px;margin:0 auto;padding:0 6%;display:flex;flex-direction:row;align-items:stretch;}
    .ind-cta-text{padding:48px 0;flex:1;}
    .ind-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid rgba(0,0,0,0.1);display:inline-block;}
    .ind-cta-h2{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:clamp(30px,5vw,54px);color:#000;text-transform:uppercase;line-height:0.9;margin-bottom:16px;}
    .ind-cta-p{font-size:16px;font-weight:500;color:rgba(0,0,0,0.8);max-width:440px;line-height:1.5;}
    .ind-cta-btn-wrap{display:flex;align-items:center;justify-content:flex-end;padding:0 0 0 48px;}
    .ind-cta-btn{background:#000;color:#fff;font-family:'Montserrat',sans-serif;font-weight:900;font-size:20px;padding:32px 40px;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;display:inline-flex;align-items:center;gap:16px;transition:background 0.2s;white-space:nowrap;box-shadow:10px 10px 0px rgba(0,0,0,0.15);}
    .ind-cta-btn:hover{background:#111;box-shadow:none;transform:translate(1px,1px);}
    .ind-cta-icon{color:#FFF12D;}
    @media(max-width:1280px){.ind-grid{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:900px){.ind-grid{grid-template-columns:repeat(2,1fr);} .ind-cta-inner{flex-direction:column;} .ind-cta-btn-wrap{padding:0 0 48px;justify-content:flex-start;}}
    @media(max-width:560px){.ind-grid{grid-template-columns:repeat(2,1fr);gap:8px;}}
  `;

  return (
    <div className="ind">
      <style>{css}</style>
      <a href="/?skip=1" className="ind-back">&larr; HOME</a>

      <section className="ind-hero">
        <div className="ind-hero-inner">
          <div className="ind-eyebrow">// GLOBAL SECTOR COVERAGE</div>
          <h1 className="ind-h1">INDUSTRIES WE<br /><span>PROTECT.</span></h1>
        </div>
      </section>

      <section className="ind-sec">
        <div className="ind-sec-inner">
          <div className="ind-eyebrow" style={{marginBottom:'40px'}}>// ACTIVE SECTORS MATRIX [12 UNITS]</div>
          <div className="ind-grid">
            {INDUSTRIES.map(ind => (
              <Link key={ind.id} href={`/industries/${ind.id}`} className="ind-card">
                <div className="ind-card-img-wrap">
                  <img src={ind.img} alt={ind.name} className="ind-card-img" loading="lazy" />
                </div>
                <div className="ind-card-content">
                  <div className="ind-card-title">{ind.name}</div>
                  <p className="ind-card-desc">{ind.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ind-cta">
        <div className="ind-cta-inner">
          <div className="ind-cta-text">
            <div className="ind-cta-label">// CROSS REFERENCE PROTOCOL</div>
            <div className="ind-cta-h2">ENGINEERED PROTECTION<br /><span>FOR EVERY SECTOR.</span></div>
            <p className="ind-cta-p">Regardless of your industry, ELIMFILTERS eliminates unplanned downtime. Search your technical cross-reference now.</p>
          </div>
          <div className="ind-cta-btn-wrap">
            <Link href="/search" className="ind-cta-btn">
              <span>FIND MY FILTER</span>
              <span className="ind-cta-icon">&#8250;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

