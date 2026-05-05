'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

const technologies = [
  { num: '01', category: 'AIR INTAKE', name: 'MACROCORE', tm: true, desc: 'Heavy-duty structural reinforcement preventing media migration and center tube collapse under severe pulsation.', slug: 'macrocore' },
  { num: '02', category: 'LUBRICATION', name: 'SYNTRAX', tm: true, desc: 'Synthetic micro-glass media ensuring thermal stability and sub-micron cleanliness for critical engine components.', slug: 'syntrax' },
  { num: '03', category: 'FUEL FILTRATION', name: 'NANoforce', tm: true, desc: 'Multi-stage depth filtration engineered for HPCR systems, capturing fine particulates to prevent injector failure.', slug: 'nanoforce' },
  { num: '04', category: 'HYDRAULIC', name: 'SYNTEPORE', tm: true, desc: 'Reinforced synthetic mesh designed to withstand high-pressure spikes and extreme cyclic fatigue.', slug: 'syntepore' },
  { num: '05', category: 'CABIN AIR', name: 'MICROKAPPA', tm: true, desc: 'Dual-layer HEPA and activated carbon system for gas neutralization and high-efficiency particle arrestance.', slug: 'microkappa' },
  { num: '06', category: 'COOLANT', name: 'COOLTECH', tm: true, desc: 'Precision additive balance technology designed to eliminate cavitation and liner pitting in cooling systems.', slug: 'cooltech' },
  { num: '07', category: 'WATER SEPARATION', name: 'AQUAGUARD', tm: true, desc: 'Proprietary hydrophobic barrier achieving 99.9% emulsified water removal from low-grade diesel fuel.', slug: 'aquaguard' },
  { num: '08', category: 'AIR DRYER', name: 'DRYCORE', tm: true, desc: 'Molecular sieve desiccant technology for total moisture extraction in air brake and pneumatic circuits.', slug: 'drycore' },
  { num: '09', category: 'HOUSING & INTAKE', name: 'INTEKCORE', tm: true, desc: 'High-density polyurethane radial seal engineering to ensure 100% leak-proof integrity under extreme vibration.', slug: 'intekcore' },
  { num: '10', category: 'MAINTENANCE KITS', name: 'DURATECH', tm: true, desc: 'Master kit optimization ensuring full OEM interchangeability and maximum service interval reliability.', slug: 'duratech' },
  { num: '11', category: 'TURBINE SERIE FH', name: 'AQUAGUARD SERIES', tm: true, desc: 'Advanced water separation engineered for turbine fuel systems operating in high-contamination environments.', slug: 'aquaguard-series' },
  { num: '12', category: 'MARINE', name: 'MARINECLEAN', tm: true, desc: 'Corrosion-resistant filtration technology for marine diesel engines operating in saltwater environments.', slug: 'marineclean' },
];

export default function Technologies() {
  const css = \
    .tp-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);} 
    .tp-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;} 
    .tp{background:#000;color:#fff;min-height:100vh;}
    .tp-hero{min-height:55vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.06);}
    .tp-hero-img{position:absolute;right:0;top:0;width:55%;height:100%;background:url('\/2026/02/Gemini_Generated_Image_t6yjb4t6yjb4t6yj.png') no-repeat center right/contain;mask-image:linear-gradient(to left,black 50%,transparent 100%);-webkit-mask-image:linear-gradient(to left,black 50%,transparent 100%);opacity:0.9;}
    .tp-hero-c{position:relative;z-index:2;max-width:750px;}
    .tp-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .tp-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0 0 24px;}
    .tp-h1 span{color:#FFF12D;}
    .tp-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:520px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;}
    .tp-bar{background:#111;padding:12px 6%;display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);}
    .tp-bar span{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;}
    .tp-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(255,255,255,0.08);}
    .tp-item{padding:52px 40px;border-right:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);display:block;text-decoration:none;transition:all 0.4s ease;}
    .tp-item:hover{background:rgba(255,241,45,0.03);border-right-color:#FFF12D;}
    .tp-item-num{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:8px;}
    .tp-item-name{font-family:'Russo One',sans-serif;font-size:clamp(22px,2.5vw,32px);color:#fff;text-transform:uppercase;margin-bottom:16px;line-height:1;}
    .tp-item:hover .tp-item-name{color:#FFF12D;}
    .tp-item-desc{font-family:'JetBrains Mono',monospace;font-size:12px;color:#666;line-height:1.6;letter-spacing:0.03em;}
    .tp-cta{background:#FFF12D;padding:72px 6%;}
    .tp-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;display:inline-block;}
    @media(max-width:1024px){.tp-grid{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.tp-grid{grid-template-columns:1fr;}}
  \;

  return (
    <div className="tp">
      <style>{css}</style>
      <Link href="/?skip=1" className="tp-back">← HOME</Link>
      <section className="tp-hero">
        <div className="tp-hero-img" />
        <div className="tp-hero-c">
          <div className="tp-eyebrow">// PROPRIETARY TECHNOLOGY PORTFOLIO</div>
          <h1 className="tp-h1">12 TECHNOLOGIES.<br /><span>ONE MISSION.</span></h1>
          <p className="tp-hero-p">Advanced filtration technology developed to maximize engine life cycles under severe operating conditions.</p>
        </div>
      </section>
      <div className="tp-bar">
        <span>CORE TECHNOLOGY INDEX</span>
        <span>VERIFIED PROTECTION MODULES — 12 UNITS</span>
      </div>
      <section className="tp-grid-sec">
        <div className="tp-grid">
          {technologies.map((t, i) => (
            <Link key={i} href={/technologies/\} className="tp-item">
              <div className="tp-item-num">{t.num}</div>
              <div className="tp-item-name">{t.name}{t.tm && '™'}</div>
              <div className="tp-item-desc">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="tp-cta" style={{textAlign:'center'}}>
        <h2 style={{fontFamily:'Russo One', fontSize:'40px', color:'#000'}}>READY FOR A TECHNICAL AUDIT?</h2>
        <Link href="/search" className="tp-cta-btn" style={{marginTop:'24px'}}>GO TO SEARCH PRO</Link>
      </section>
    </div>
  );
}
