'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

export default function CoolantSystems() {
  const css = `
    .cl{background:#000;color:#fff;min-height:100vh;}
    .cl-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .cl-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .cl-hero{min-height:72vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/Gemini_Generated_Image_ouz5l5ouz5l5ouz5.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cl-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .cl-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .cl-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .cl-h1 span{color:#FFF12D;}
    .cl-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .cl-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cl-sec-inner{max-width:1400px;margin:0 auto;}
    .cl-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .cl-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .cl-h2 span{color:#FFF12D;}
    .cl-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .cl-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}
    .cl-spec{border-left:1px solid #27272a;padding-left:16px;}
    .cl-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .cl-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .cl-img-wrap{background:#000;border:1px solid #1a1a1a;padding:15px;text-align:center;}
    .cl-img-wrap img{width:100%;max-width:450px;height:auto;display:inline-block;filter:contrast(1.08) brightness(1.02);}
    .cl-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.15em;padding:18px 40px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.25s;}
    .cl-btn:hover{background:#fff;transform:translateY(-3px);}
    .cl-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .cl-feature{background:transparent;border-left:1px solid rgba(255,241,45,0.2);padding:32px;transition:all 0.3s cubic-bezier(0.165,0.84,0.44,1);}
    .cl-feature:hover{background:rgba(255,255,255,0.03);border-left:4px solid #FFF12D;transform:translateX(8px);}
    .cl-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .cl-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .cl-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .cl-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .cl-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .cl-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .cl-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .cl-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .cl-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .cl-cta{padding:100px 6%;background:#030303;text-align:center;}
    .cl-cta-inner{max-width:900px;margin:0 auto;}
    .cl-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,7vw,90px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .cl-cta-h2 span{color:#FFF12D;}
    .cl-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    @media(max-width:1024px){.cl-grid2{grid-template-columns:1fr;} .cl-grid3{grid-template-columns:repeat(2,1fr);} .cl-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.cl-grid3{grid-template-columns:1fr;} .cl-hero-p{font-size:12px;} .cl-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="cl">
      <style>{css}</style>
      <a href="/?skip=1" className="cl-back">&larr; HOME</a>

      <section className="cl-hero">
        <div className="cl-hero-inner">
          <div className="cl-eyebrow">// COOLANT FILTRATION SYSTEMS / SYS-03</div>
          <h1 className="cl-h1">COOLANT FILTER<br /><span>SYSTEMS</span></h1>
          <p className="cl-hero-p">Industrial asset protection systems engineered for engine cooling circuits, high-horsepower diesel infrastructure, and critical thermal management systems. COOLTECH™ technology shields coolant circuits from corrosion, scale, and thermal degradation — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="cl-sec" style={{background:'#050505'}}>
        <div className="cl-sec-inner">
          <div className="cl-grid2">
            <div>
              <div className="cl-eyebrow">// COOLTECH™ TECHNOLOGY</div>
              <h2 className="cl-h2">TOTAL THERMAL<br /><span>BALANCE.</span></h2>
              <p className="cl-p">Every combustion cycle generates extreme thermal loads. Contaminated coolant accelerates corrosion, triggers liner cavitation, and destroys water pumps and radiators far ahead of their designed service life.</p>
              <p className="cl-p">ELIMFILTERS coolant filters with COOLTECH™ technology ensure efficient heat transfer while capturing rust, scale, and abrasive particles — delivering total thermal protection under the most demanding industrial conditions worldwide.</p>
              <div className="cl-specs">
                <div className="cl-spec"><span className="cl-spec-label">COOLTECH™</span><span className="cl-spec-sub">Thermal Management</span></div>
                <div className="cl-spec"><span className="cl-spec-label">CORROSION CONTROL</span><span className="cl-spec-sub">Active Inhibitor Tech</span></div>
                <div className="cl-spec"><span className="cl-spec-label">OEM MATCHED</span><span className="cl-spec-sub">5,000+ Cross-References</span></div>
                <div className="cl-spec"><span className="cl-spec-label">ISO 16889</span><span className="cl-spec-sub">Certified Standard</span></div>
              </div>
              <Link href="/technologies/cooltech" className="cl-btn">VIEW COOLTECH™ TECHNOLOGY</Link>
            </div>
            <div className="cl-img-wrap">
              <img src={`${WP}/2026/04/IMG_0221.png`} alt="ELIMFILTERS COOLTECH Coolant Filter System" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="cl-sec">
        <div className="cl-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="cl-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// THERMAL SYSTEMS</div>
            <h2 className="cl-h2" style={{textAlign:'center'}}>CYCLE BY CYCLE, <span>TOTAL PROTECTION</span></h2>
          </div>
          <div className="cl-grid3">
            {[
              {label:'COOLTECH™ / CORROSION', title:'CORROSION CONTROL', desc:'Active prevention against liner cavitation and scale buildup, extending the service life of the entire cooling circuit across all heavy-duty applications.'},
              {label:'COOLTECH™ / THERMAL', title:'THERMAL STABILITY', desc:'Maintains consistent temperatures across all load conditions, preventing catastrophic failure from extreme thermal cycling in continuous operations.'},
              {label:'COOLTECH™ / FLOW', title:'OPTIMIZED FLOW', desc:'Protects the water pump by continuously removing abrasive particles before they cause mechanical damage to cooling circuit components.'},
              {label:'COOLTECH™ / INHIBITORS', title:'ACTIVE RELEASE', desc:'Controlled release of corrosion inhibitors restores fluid protection throughout the full service interval — maintaining coolant chemistry at optimal levels.'},
              {label:'COOLTECH™ / RADIATOR', title:'RADIATOR GUARD', desc:'Eliminates scale deposits that reduce heat exchange efficiency, preventing overheating under peak load conditions in industrial operations worldwide.'},
              {label:'COOLTECH™ / DURABILITY', title:'EXTENDED LIFE', desc:'High contaminant-holding capacity reduces maintenance downtime and total cost of operation — extending service intervals across fleet operations.'},
            ].map((f, i) => (
              <div key={i} className="cl-feature">
                <div className="cl-feature-label">{f.label}</div>
                <div className="cl-feature-title">{f.title}</div>
                <p className="cl-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-sec" style={{background:'#000'}}>
        <div className="cl-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="cl-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="cl-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="cl-protocol-grid">
            {[
              {num:'01', title:'THERMAL STABILITY', desc:'Maintains consistent temperatures across all load cycles — preventing overheating damage in high-horsepower engines operating under continuous industrial conditions.'},
              {num:'02', title:'CORROSION SHIELD', desc:'Active inhibitor technology neutralizes corrosive agents and prevents cavitation erosion — protecting liners, water pumps, and radiators from premature failure.'},
              {num:'03', title:'CIRCUIT PURITY', desc:'Continuous removal of rust, scale, and abrasive particles protects all downstream cooling circuit components — extending total system service life significantly.'},
            ].map((p, i) => (
              <div key={i} className="cl-protocol-card">
                <div className="cl-protocol-num">{p.num}</div>
                <div className="cl-protocol-title">{p.title}</div>
                <p className="cl-protocol-p">{p.desc}</p>
                <div className="cl-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cl-cta">
        <div className="cl-cta-inner">
          <div className="cl-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// THERMAL CONTINUITY</div>
          <div className="cl-cta-h2">EVERY ENGINE.<br /><span>EVERY DEGREE.</span></div>
          <p className="cl-cta-p">Built to protect your cooling circuit investment and ensure thermal stability wherever your machinery runs. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="cl-btn">FIND MY COOLANT FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
