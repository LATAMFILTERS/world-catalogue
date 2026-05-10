'use client';
import Link from 'next/link';

const WP = 'https://cdn.elimfilters.com';

export default function AirDryers() {
  const css = `
    .ad{background:#000;color:#fff;min-height:100vh;}
    .ad-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ad-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ad-hero{min-height:72vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/Gemini_Generated_Image_7eigh77eigh77eig.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ad-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ad-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ad-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ad-h1 span{color:#FFF12D;}
    .ad-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ad-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ad-sec-inner{max-width:1400px;margin:0 auto;}
    .ad-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .ad-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ad-h2 span{color:#FFF12D;}
    .ad-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ad-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}
    .ad-spec{border-left:1px solid #27272a;padding-left:16px;}
    .ad-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .ad-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .ad-img-wrap{background:#000;border:1px solid #1a1a1a;padding:15px;text-align:center;}
    .ad-img-wrap img{width:100%;max-width:450px;height:auto;filter:contrast(1.05) brightness(1.05);}
    .ad-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;padding:18px 40px;display:inline-block;text-decoration:none;transition:all 0.25s;}
    .ad-btn:hover{background:#fff;transform:translateY(-3px);}
    .ad-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .ad-feature{background:transparent;border-left:1px solid rgba(255,241,45,0.2);padding:32px;transition:all 0.3s cubic-bezier(0.165,0.84,0.44,1);}
    .ad-feature:hover{background:rgba(255,255,255,0.03);border-left:4px solid #FFF12D;transform:translateX(8px);}
    .ad-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ad-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ad-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ad-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ad-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .ad-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .ad-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ad-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ad-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .ad-cta{padding:100px 6%;background:#030303;text-align:center;}
    .ad-cta-inner{max-width:900px;margin:0 auto;}
    .ad-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,7vw,90px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .ad-cta-h2 span{color:#FFF12D;}
    .ad-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    @media(max-width:1024px){.ad-grid2{grid-template-columns:1fr;} .ad-grid3{grid-template-columns:repeat(2,1fr);} .ad-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.ad-grid3{grid-template-columns:1fr;} .ad-hero-p{font-size:12px;}}
  `;

  return (
    <div className="ad">
      <style>{css}</style>
      <a href="/?skip=1" className="ad-back">&larr; HOME</a>

      <section className="ad-hero">
        <div className="ad-hero-inner">
          <div className="ad-eyebrow">// PNEUMATIC SAFETY SYSTEMS / SYS-09</div>
          <h1 className="ad-h1">AIR DRYER<br /><span>SYSTEMS</span></h1>
          <p className="ad-hero-p">Industrial asset protection systems engineered for pneumatic circuits, air brake systems, and critical compressed air infrastructure. DRYCORE™ technology shields pneumatic components from moisture, oil aerosols, and contamination — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across fleets worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ad-sec" style={{background:'#050505'}}>
        <div className="ad-sec-inner">
          <div className="ad-grid2">
            <div>
              <div className="ad-eyebrow">// DRYCORE™ ARCHITECTURE</div>
              <h2 className="ad-h2">ELIMINATING<br /><span>VARIABLES.</span></h2>
              <p className="ad-p">Moisture is responsible for over 60% of pneumatic component failures. Contaminated air triggers valve sticking, freezes lines, and destroys brake actuators far ahead of their service life.</p>
              <p className="ad-p">ELIMFILTERS air dryers with DRYCORE™ technology trap contaminants at the molecular level, ensuring zero-dew point performance and protecting sensitive ABS control units across all heavy-duty platforms.</p>
              <div className="ad-specs">
                <div className="ad-spec">
                  <span className="ad-spec-label">DRYCORE™</span>
                  <span className="ad-spec-sub">Molecular Absorption</span>
                </div>
                <div className="ad-spec">
                  <span className="ad-spec-label">COALESCING</span>
                  <span className="ad-spec-sub">Aerosol Separation</span>
                </div>
              </div>
              <Link href="/technologies/drycore" className="ad-btn">VIEW DRYCORE™ TECHNOLOGY</Link>
            </div>
            <div className="ad-img-wrap">
              <img src={`${WP}/2026/02/Gemini_Generated_Image_mvib88mvib88mvib.png`} alt="ELIMFILTERS Air Dryer DRYCORE Technology" />
            </div>
          </div>
        </div>
      </section>

      <section className="ad-sec">
        <div className="ad-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ad-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// PNEUMATIC SYSTEMS</div>
            <h2 className="ad-h2" style={{textAlign:'center'}}>PURITY FOR <span>SAFETY-CRITICAL</span> AIR</h2>
          </div>
          <div className="ad-grid3">
            {[
              {label:'DRYCORE™ / ABSORPTION', title:'DESICCANT MEDIA', desc:'High-capacity desiccant beds that maintain optimal dew point performance under extreme thermal loads and continuous duty cycles.'},
              {label:'DRYCORE™ / REGEN', title:'AUTO-PURGE', desc:'Integrated purge cycles that expel accumulated water, ensuring continuous moisture-free air delivery to safety-critical pneumatic systems.'},
              {label:'DRYCORE™ / OIL', title:'OIL COALESCING', desc:'Neutralizes compressor oil carryover, protecting sensitive control units and ABS systems from internal degradation and contamination.'},
              {label:'DRYCORE™ / FITMENT', title:'OEM INTEGRITY', desc:'Precision thread geometry for leak-free integration across all major heavy-duty platforms and OEM specifications worldwide.'},
              {label:'DRYCORE™ / VALVES', title:'VALVE PROTECTION', desc:'Prevents valve sticking and corrosion in the air brake system, ensuring rapid response times and maximum operational safety.'},
              {label:'DRYCORE™ / UPTIME', title:'SYSTEM UPTIME', desc:'Reduces maintenance downtime by extending the service life of pneumatic actuators by up to 45% across fleet operations.'},
            ].map((f, i) => (
              <div key={i} className="ad-feature">
                <div className="ad-feature-label">{f.label}</div>
                <div className="ad-feature-title">{f.title}</div>
                <p className="ad-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ad-sec" style={{background:'#000'}}>
        <div className="ad-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="ad-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="ad-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="ad-protocol-grid">
            {[
              {num:'01', title:'MOISTURE CONTROL', desc:'Absolute moisture removal regardless of ambient humidity or compressor duty cycle — protecting pneumatic systems in all operating conditions.'},
              {num:'02', title:'OIL FILTRATION', desc:'Coalescing technology removes oil mist that standard filters cannot capture, extending service life across all heavy-duty pneumatic applications.'},
              {num:'03', title:'COLD WEATHER OPS', desc:'Prevents air line freezing in sub-zero environments, maintaining full braking capability and system integrity in extreme weather conditions.'},
            ].map((p, i) => (
              <div key={i} className="ad-protocol-card">
                <div className="ad-protocol-num">{p.num}</div>
                <div className="ad-protocol-title">{p.title}</div>
                <p className="ad-protocol-p">{p.desc}</p>
                <div className="ad-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ad-cta">
        <div className="ad-cta-inner">
          <div className="ad-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// OPERATIONAL CONTINUITY</div>
          <div className="ad-cta-h2">EVERY STOP.<br /><span>EVERY VEHICLE.</span></div>
          <p className="ad-cta-p">Built to protect your pneumatic circuit and ensure safety-critical response wherever your fleet operates. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="ad-btn">FIND MY DRYER FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
