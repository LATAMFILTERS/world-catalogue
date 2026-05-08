'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function FuelSystems() {
  const css = `
    .fl{background:#000;color:#fff;min-height:100vh;}
    .fl-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .fl-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .fl-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 40%,transparent 100%),url('${WP}/2026/02/Gemini_Generated_Image_e9qpvne9qpvne9qp.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .fl-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .fl-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .fl-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .fl-h1 span{color:#FFF12D;}
    .fl-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:650px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .fl-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .fl-sec-inner{max-width:1400px;margin:0 auto;}
    .fl-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .fl-h2{font-family:'Russo One',sans-serif;font-size:clamp(30px,4vw,55px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .fl-h2 span{color:#FFF12D;}
    .fl-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .fl-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}
    .fl-spec{border-left:2px solid #333;padding-left:16px;}
    .fl-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .fl-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .fl-img-wrap img{width:100%;height:auto;display:block;border:1px solid #1a1a1a;filter:brightness(0.9);}
    .fl-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.1em;padding:20px 45px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.25s;}
    .fl-btn:hover{background:#fff;transform:translateY(-2px);}
    .fl-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .fl-feature{background:rgba(255,255,255,0.03);border-left:4px solid #FFF12D;padding:36px 28px;transition:all 0.3s;height:100%;}
    .fl-feature:hover{transform:translateY(-5px);background:rgba(255,255,255,0.06);}
    .fl-feature-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .fl-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.03em;}
    .fl-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .fl-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .fl-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .fl-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .fl-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .fl-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .fl-cta{padding:100px 6%;background:radial-gradient(circle at center,#111 0%,#000 100%);text-align:center;}
    .fl-cta-inner{max-width:900px;margin:0 auto;}
    .fl-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:40px;}
    .fl-cta-h2 span{color:#FFF12D;}
    @media(max-width:1024px){.fl-grid2{grid-template-columns:1fr;} .fl-grid3{grid-template-columns:repeat(2,1fr);} .fl-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.fl-grid3{grid-template-columns:1fr;} .fl-hero-p{font-size:12px;} .fl-specs{grid-template-columns:1fr;} .fl-hero{background-position:center;}}
  `;

  return (
    <div className="fl">
      <style>{css}</style>
      <a href="/?skip=1" className="fl-back">&larr; HOME</a>

      <section className="fl-hero">
        <div className="fl-hero-inner">
          <div className="fl-eyebrow">// FUEL FILTRATION SYSTEMS / SYS-02</div>
          <h1 className="fl-h1">FUEL FILTER<br /><span>SYSTEMS</span></h1>
          <p className="fl-hero-p">Industrial asset protection systems engineered for diesel, biodiesel, and gasoline fuel circuits in heavy-duty engines, marine applications, and critical fleet infrastructure. SYNTEPORE™ technology shields injection systems from contamination — extending injector lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16332 and ISO 16889 standards.</p>
        </div>
      </section>

      <section className="fl-sec" style={{background:'#050505'}}>
        <div className="fl-sec-inner">
          <div className="fl-grid2">
            <div>
              <div className="fl-eyebrow">// SYNTEPORE™ ARMOR</div>
              <h2 className="fl-h2">SYNTHETIC BARRIER.<br /><span>ABSOLUTE PURITY.</span></h2>
              <p className="fl-p">Fuel cleanliness is critical. ELIMFILTERS SYNTEPORE™ delivers a synthetic armor layer that guarantees consistent fuel purity — preventing contamination-driven injector wear and unplanned downtime in heavy-duty engines worldwide.</p>
              <p className="fl-p">Engineered for diesel, biodiesel, and gasoline applications in mining, construction, agriculture, marine, and long-haul fleet operations across 12 industries.</p>
              <div className="fl-specs">
                <div className="fl-spec"><span className="fl-spec-label">ISO 16332</span><span className="fl-spec-sub">Certified Standard</span></div>
                <div className="fl-spec"><span className="fl-spec-label">SYNTEPORE™</span><span className="fl-spec-sub">Synthetic Media</span></div>
                <div className="fl-spec"><span className="fl-spec-label">ZERO BYPASS</span><span className="fl-spec-sub">100% Media Flow</span></div>
                <div className="fl-spec"><span className="fl-spec-label">OEM MATCHED</span><span className="fl-spec-sub">5,000+ Cross-Refs</span></div>
              </div>
              <Link href="/technologies/syntepore" className="fl-btn">EXPLORE SYNTEPORE™ TECHNOLOGY</Link>
            </div>
            <div className="fl-img-wrap">
              <img src={`${WP}/2026/02/Screenshot-2026-02-08-023100.png`} alt="ELIMFILTERS SYNTEPORE Fuel Filter System" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="fl-sec">
        <div className="fl-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="fl-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// ENGINE PROTECTION PROTOCOL</div>
            <h2 className="fl-h2" style={{textAlign:'center'}}>MISSION CRITICAL <span>FEATURES</span></h2>
          </div>
          <div className="fl-grid3">
            {[
              {title:'PARTICLE CAPTURE', desc:'Synthetic media traps solid particles and rust before they reach engine injectors — protecting Common Rail systems from abrasive wear and premature failure.'},
              {title:'MEDIA ARMOR', desc:'Reinforced synthetic filtration maintains high efficiency under extreme industrial vibration and pressure fluctuations in continuous heavy-duty operations.'},
              {title:'EXTENDED LIFE', desc:'High dirt-holding capacity engineered to reduce operational costs and extend service intervals — delivering measurable TCO reduction across fleet operations.'},
              {title:'ZERO BYPASS', desc:'Precision sealing surfaces ensure 100% of the fuel passes through the SYNTEPORE™ media — eliminating any risk of unfiltered fuel reaching the injection system.'},
              {title:'HD HOUSING', desc:'Structural integrity designed to survive thermal cycles and mechanical stress in the field — maintaining filter performance throughout the full service interval.'},
              {title:'COMPATIBILITY', desc:'Certified for Diesel, Biodiesel, and Gasoline in commercial, mining, agriculture, and marine applications across 5,000+ OEM cross-references worldwide.'},
            ].map((f, i) => (
              <div key={i} className="fl-feature">
                <div className="fl-feature-title">{f.title}</div>
                <p className="fl-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fl-sec" style={{background:'#000'}}>
        <div className="fl-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="fl-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="fl-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="fl-protocol-grid">
            {[
              {num:'01', title:'INJECTION DEFENSE', desc:'Absolute particle removal before fuel reaches Common Rail injectors — protecting precision components from wear, erosion, and premature failure in all conditions.'},
              {num:'02', title:'WATER SEPARATION', desc:'Multi-stage water removal prevents injector corrosion and pitting — ensuring pure fuel delivery in field storage, marine, and high-humidity operating environments.'},
              {num:'03', title:'PRESSURE STABILITY', desc:'Low restriction media maintains consistent fuel pressure throughout service life — protecting injection pump performance and combustion efficiency in high-load operations.'},
            ].map((p, i) => (
              <div key={i} className="fl-protocol-card">
                <div className="fl-protocol-num">{p.num}</div>
                <div className="fl-protocol-title">{p.title}</div>
                <p className="fl-protocol-p">{p.desc}</p>
                <div className="fl-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fl-cta">
        <div className="fl-cta-inner">
          <div className="fl-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// FUEL PROTECTION MANDATE</div>
          <div className="fl-cta-h2">EVERY ENGINE.<br /><span>EVERY DROP.</span></div>
          <Link href="/search" className="fl-btn" style={{display:'inline-block'}}>FIND MY FUEL FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
