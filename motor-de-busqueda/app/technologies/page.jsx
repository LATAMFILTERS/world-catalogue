'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

const technologies = [
  { num: '01', category: 'AIR INTAKE', name: 'MACROCORE', tm: true, desc: 'Heavy-duty structural reinforcement preventing media migration and center tube collapse under severe pulsation.', slug: 'macrocore' },
  { num: '02', category: 'LUBRICATION', name: 'SINTRAX', tm: true, desc: 'Synthetic micro-glass media ensuring thermal stability and sub-micron cleanliness for critical engine components.', slug: 'sintrax' },
  { num: '03', category: 'HYDRAULIC', name: 'NANOFORCE', tm: true, desc: 'Multi-stage depth filtration engineered for HPCR systems, capturing fine particulates to prevent injector failure.', slug: 'nanoforce' },
  { num: '04', category: 'FUEL FILTRATION', name: 'SYNTEPORE', tm: true, desc: 'Reinforced synthetic mesh designed to withstand high-pressure spikes and extreme cyclic fatigue.', slug: 'syntepore' },
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
  const css = `
    .tp-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);} .tp-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;} .tp{background:#000;color:#fff;min-height:100vh;}
    .tp-hero{min-height:55vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.06);}
    .tp-hero-img{position:absolute;right:0;top:0;width:55%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_t6yjb4t6yjb4t6yj.png') no-repeat center right/contain;mask-image:linear-gradient(to left,black 50%,transparent 100%);-webkit-mask-image:linear-gradient(to left,black 50%,transparent 100%);opacity:0.9;}
    .tp-hero-c{position:relative;z-index:2;max-width:750px;}
    .tp-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .tp-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0 0 24px;}
    .tp-h1 span{color:#FFF12D;}
    .tp-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:520px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;}
    .tp-bar{background:#111;padding:12px 6%;display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);}
    .tp-bar span{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;}
    .tp-grid-sec{background:#000;padding:0;}
    .tp-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(255,255,255,0.08);}
    .tp-item{padding:52px 40px;border-right:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);display:block;text-decoration:none;transition:all 0.4s ease;}
    .tp-item:hover{background:rgba(255,241,45,0.03);border-right-color:#FFF12D;}
    .tp-item-num{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:8px;}
    .tp-item-cat{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;color:#444;text-transform:uppercase;margin-bottom:16px;}
    .tp-item-name{font-family:'Russo One',sans-serif;font-size:clamp(22px,2.5vw,32px);color:#fff;text-transform:uppercase;margin-bottom:16px;line-height:1;}
    .tp-item:hover .tp-item-name{color:#FFF12D;}
    .tp-item-desc{font-family:'JetBrains Mono',monospace;font-size:12px;color:#666;line-height:1.6;letter-spacing:0.03em;}
    .tp-perf{padding:80px 6%;border-top:1px solid rgba(255,255,255,0.06);background:#050505;}
    .tp-perf-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;}
    .tp-chart-wrap{background:#0a0a0a;border:1px solid #1a1a1a;padding:40px;}
    .tp-chart-title{font-family:'Russo One',sans-serif;font-size:18px;color:#fff;text-transform:uppercase;margin-bottom:32px;}
    .tp-chart-row{margin-bottom:24px;}
    .tp-chart-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;color:#FFF12D;text-transform:uppercase;display:flex;justify-content:space-between;margin-bottom:8px;}
    .tp-chart-label span:last-child{color:#FFF12D;}
    .tp-chart-label.muted span{color:#444;}
    .tp-chart-bar-wrap{height:12px;background:#111;overflow:hidden;}
    .tp-chart-bar{height:100%;background:#FFF12D;animation:barGrow 2s cubic-bezier(0.16,1,0.3,1) forwards;}
    .tp-chart-bar.muted{background:#333;}
    .tp-chart-note{margin-top:24px;padding:16px;background:#000;border:1px solid #1a1a1a;font-family:'JetBrains Mono',monospace;font-size:10px;color:#444;line-height:1.6;letter-spacing:0.05em;}
    .tp-chart-note strong{color:#fff;}
    .tp-perf-right{}
    .tp-perf-h2{font-family:'Russo One',sans-serif;font-size:clamp(36px,5vw,64px);color:#FFF12D;text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .tp-perf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:#888;line-height:1.7;margin-bottom:32px;letter-spacing:0.05em;}
    .tp-spec-list{display:flex;flex-direction:column;gap:24px;}
    .tp-spec-item{border-left:2px solid rgba(255,255,255,0.1);padding-left:24px;transition:all 0.3s ease;}
    .tp-spec-item:hover{border-left-color:#FFF12D;}
    .tp-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;color:#FFF12D;text-transform:uppercase;margin-bottom:8px;}
    .tp-spec-title{font-family:'Russo One',sans-serif;font-size:18px;color:#fff;text-transform:uppercase;margin-bottom:8px;}
    .tp-spec-desc{font-family:'JetBrains Mono',monospace;font-size:12px;color:#555;line-height:1.6;}
    .tp-cta{background:#FFF12D;padding:72px 6%;}
    .tp-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .tp-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .tp-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .tp-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;display:inline-block;transition:background 0.2s;}
    .tp-cta-btn:hover{background:#111;}
    @keyframes barGrow{from{width:0}to{width:var(--w)}}
    @media(max-width:1024px){.tp-grid{grid-template-columns:repeat(2,1fr);} .tp-perf-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.tp-hero-img{display:none;} .tp-grid{grid-template-columns:1fr;} .tp-item{padding:36px 24px;} .tp-cta-inner{flex-direction:column;} .tp-bar{flex-direction:column;gap:8px;}}
  `;

  return (
    <div className="tp"><a href="/?skip=1" className="tp-back">← HOME</a>
      <style>{css}</style>
      <section className="tp-hero">
        <div className="tp-hero-img" />
        <div className="tp-hero-c">
          <div className="tp-eyebrow">// PROPRIETARY TECHNOLOGY PORTFOLIO</div>
          <h1 className="tp-h1">12 TECHNOLOGIES.<br /><span>ONE MISSION.</span></h1>
          <p className="tp-hero-p">Advanced filtration technology developed to maximize engine life cycles under the world's most severe operating conditions.</p>
        </div>
      </section>
      <div className="tp-bar">
        <span>CORE TECHNOLOGY INDEX</span>
        <span>VERIFIED PROTECTION MODULES — 12 UNITS</span>
      </div>
      <section className="tp-grid-sec">
        <div className="tp-grid">
          {technologies.map((t, i) => (
            <Link key={i} href={`/technologies/${t.slug}`} className="tp-item">
              <div className="tp-item-num">{t.num}</div>
              <div className="tp-item-cat">{t.category}</div>
              <div className="tp-item-name">{t.name}{t.tm && '™'}</div>
              <div className="tp-item-desc">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="tp-perf">
        <div className="tp-perf-inner">
          <div className="tp-chart-wrap">
            <div className="tp-eyebrow" style={{marginBottom:'24px'}}>// ISO 19438 EFFICIENCY COMPARISON</div>
            <div className="tp-chart-title">CRITICAL PARTICLE CAPTURE (4µ–6µ)</div>
            <div className="tp-chart-row">
              <div className="tp-chart-label"><span>ELIMFILTERS NANOFORCE™</span><span>99.98% Beta &gt; 200</span></div>
              <div className="tp-chart-bar-wrap"><div className="tp-chart-bar" style={{'--w':'99.98%'}} /></div>
            </div>
            <div className="tp-chart-row">
              <div className="tp-chart-label muted"><span>HD INDUSTRY LEADERS (STD)</span><span>98.50% Beta &gt; 66</span></div>
              <div className="tp-chart-bar-wrap"><div className="tp-chart-bar muted" style={{'--w':'98.5%'}} /></div>
            </div>
            <div className="tp-chart-note"><strong>TELEMETRY ANALYSIS:</strong> Particles in the 4µ to 6µ range are the primary cause of mechanical erosion in HPCR systems. NANOFORCE™ captures sub-micron contaminants that conventional HD filters omit, preventing premature failure.</div>
          </div>
          <div>
            <div className="tp-eyebrow">// VERIFIED PERFORMANCE DATA</div>
            <div className="tp-perf-h2">AUDITABLE<br />RESULTS.</div>
            <p className="tp-perf-p">Our telemetry analytics confirm that ELIMFILTERS provides an absolute barrier against micron-level contamination, guaranteeing critical fluid purity for engine longevity.</p>
            <div className="tp-spec-list">
              <div className="tp-spec-item">
                <div className="tp-spec-label">ISO 5011 / ISO 19438 COMPLIANT</div>
                <div className="tp-spec-title">Efficiency Validation</div>
                <div className="tp-spec-desc">All proprietary media technologies are laboratory-tested to exceed performance standards established by original equipment manufacturers.</div>
              </div>
              <div className="tp-spec-item">
                <div className="tp-spec-label">HPCR PROTECTION (4µ–6µ)</div>
                <div className="tp-spec-title">Injector Life Cycle</div>
                <div className="tp-spec-desc">Advanced depth filtration specifically tuned for high-pressure common rail systems and Tier 4 Final / Stage V compliance.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="tp-cta">
        <div className="tp-cta-inner">
          <div>
            <div className="tp-eyebrow" style={{color:'rgba(0,0,0,0.5)'}}>// ENGINEERING ADVISORY</div>
            <div className="tp-cta-h2">REQUEST A<br />TECHNICAL AUDIT.</div>
            <p className="tp-cta-p">Our technical department provides full fleet analysis to determine the optimal filtration suite based on your ISO 4406 cleanliness requirements and operating environment severity.</p>
          </div>
          <Link href="/contact" className="tp-cta-btn">REQUEST AUDIT →</Link>
        </div>
      </section>
    </div>
  );
}