'use client';
import Link from 'next/link';

const WP = 'https://cdn.elimfilters.com';

export default function AirSystems() {
  const css = `
    .as{background:#000;color:#fff;min-height:100vh;}
    .as-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .as-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .as-hero{min-height:85vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.92) 15%,rgba(0,0,0,0.3) 100%),url('${WP}/2026/02/Gemini_Generated_Image_18sjp118sjp118sj.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .as-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .as-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .as-h1{font-family:'Russo One',sans-serif;font-size:clamp(42px,7vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .as-h1 span{color:#FFF12D;}
    .as-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .as-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .as-sec-inner{max-width:1400px;margin:0 auto;}
    .as-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .as-h2 span{color:#FFF12D;}
    .as-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .as-card{background:#050505;border:1px solid #111;padding:48px;}
    .as-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:40px;flex-wrap:wrap;margin-bottom:40px;}
    .as-specs{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:32px;}
    .as-spec{border-left:1px solid rgba(255,255,255,0.1);padding-left:16px;}
    .as-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .as-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .as-table{width:100%;border-collapse:collapse;min-width:400px;}
    .as-table th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);}
    .as-table th:nth-child(2){color:#ef4444;}
    .as-table th:nth-child(3){color:#FFF12D;}
    .as-table td{font-family:'JetBrains Mono',monospace;font-size:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .as-table tr:hover td{background:rgba(255,255,255,0.03);}
    .as-table td:nth-child(2){color:#ef4444;}
    .as-table td:nth-child(3){color:#FFF12D;}
    .as-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .as-feature{background:transparent;border-left:1px solid rgba(255,241,45,0.2);padding:32px;transition:all 0.3s cubic-bezier(0.165,0.84,0.44,1);}
    .as-feature:hover{background:rgba(255,255,255,0.03);border-left:4px solid #FFF12D;transform:translateX(8px);}
    .as-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .as-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .as-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .as-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .as-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .as-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .as-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .as-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .as-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .as-cta{background:#FFF12D;padding:72px 6%;}
    .as-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .as-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .as-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .as-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .as-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .as-btn:hover{background:#111;}
    @media(max-width:1024px){.as-grid3{grid-template-columns:repeat(2,1fr);} .as-protocol-grid{grid-template-columns:1fr;} .as-card-top{flex-direction:column;}}
    @media(max-width:768px){.as-grid3{grid-template-columns:1fr;} .as-hero-p{font-size:12px;} .as-cta-inner{flex-direction:column;} .as-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="as">
      <style>{css}</style>
      <a href="/?skip=1" className="as-back">&larr; HOME</a>

      <section className="as-hero">
        <div className="as-hero-inner">
          <div className="as-eyebrow">// AIR FILTRATION SYSTEMS / SYS-01</div>
          <h1 className="as-h1">100% PURE AIR.<br /><span>PROTECTED ENGINE.</span></h1>
          <p className="as-hero-p">Industrial asset protection systems engineered for high-displacement engines, heavy-duty fleets, and critical diesel-powered infrastructure. MACROCORE™ technology shields air intake systems from abrasive contaminants — extending engine lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 5011 and ISO 16889 standards.</p>
        </div>
      </section>

      <section className="as-sec">
        <div className="as-sec-inner">
          <div className="as-card">
            <div className="as-eyebrow" style={{marginBottom:'20px'}}>// MACROCORE™ ARCHITECTURE</div>
            <h2 className="as-h2">INTAKE IS NO LONGER<br /><span>A WEAK POINT.</span></h2>
            <div className="as-card-top">
              <div style={{maxWidth:'480px'}}>
                <p className="as-p">MACROCORE™ neutralizes abrasive risks before they ever touch the cylinders — eliminating wear-by-suction in heavy-duty diesel engines and critical industrial equipment worldwide.</p>
                <p className="as-p">Engineered for high-displacement engines operating under continuous load in mining, construction, agriculture, and fleet operations across 12 industries.</p>
              </div>
              <div style={{overflowX:'auto'}}>
                <table className="as-table">
                  <thead>
                    <tr>
                      <th style={{textAlign:'left'}}>INTAKE SCENARIO</th>
                      <th style={{textAlign:'left'}}>STANDARD</th>
                      <th style={{textAlign:'left'}}>MACROCORE™</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Silica Retention</td><td>Inconsistent</td><td>99.9% Absolute</td></tr>
                    <tr><td>Operating Cost</td><td>Reactive Expense</td><td>Life Investment</td></tr>
                    <tr><td>Bypass Protection</td><td>Variable</td><td>Zero Bypass</td></tr>
                    <tr><td>OEM Compatibility</td><td>Limited</td><td>5,000+ Cross-Ref</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="as-specs">
              <div className="as-spec"><span className="as-spec-label">ISO 5011</span><span className="as-spec-sub">Global Efficiency Certification</span></div>
              <div className="as-spec"><span className="as-spec-label">ZERO BYPASS</span><span className="as-spec-sub">Structural Integrity Sealing</span></div>
              <div className="as-spec"><span className="as-spec-label">MACROCORE™</span><span className="as-spec-sub">Abrasive Particle Capture</span></div>
              <div className="as-spec"><span className="as-spec-label">OEM MATCHED</span><span className="as-spec-sub">5,000+ Cross-References</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="as-sec" style={{background:'#030303'}}>
        <div className="as-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="as-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// MACROCORE™ TECHNOLOGY DNA</div>
            <h2 className="as-h2" style={{textAlign:'center'}}>TOTAL AIR <span>INTAKE DEFENSE</span></h2>
          </div>
          <div className="as-grid3">
            {[
              {label:'MACROCORE™ / MEDIA', title:'ABRASIVE CAPTURE', desc:'Multi-layer synthetic media engineered for 99.9% particle retention, preventing silica and carbon deposits from reaching critical engine components.'},
              {label:'MACROCORE™ / SEAL', title:'ZERO BYPASS', desc:'Structural integrity sealing eliminates bypass pathways — ensuring 100% of intake air passes through the filtration media under all operating conditions.'},
              {label:'MACROCORE™ / FLOW', title:'OPTIMIZED AIRFLOW', desc:'Low restriction design maintains maximum engine power output while delivering absolute contamination control in high-dust environments.'},
              {label:'MACROCORE™ / STRUCTURE', title:'COLLAPSE RESISTANCE', desc:'Heavy-duty center tube and pleat geometry prevent media collapse under severe pulsation and high-vacuum conditions in turbocharged engines.'},
              {label:'MACROCORE™ / SERVICE', title:'EXTENDED LIFE', desc:'Extended service intervals reduce maintenance costs and downtime — delivering up to 40% longer service life versus conventional air filtration systems.'},
              {label:'MACROCORE™ / OEM', title:'OEM INTEGRITY', desc:'Precision-matched to OEM specifications across 5,000+ cross-references — compatible with all major heavy-duty engine platforms worldwide.'},
            ].map((f, i) => (
              <div key={i} className="as-feature">
                <div className="as-feature-label">{f.label}</div>
                <div className="as-feature-title">{f.title}</div>
                <p className="as-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="as-sec" style={{background:'#000'}}>
        <div className="as-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="as-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="as-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="as-protocol-grid">
            {[
              {num:'01', title:'PARTICLE CONTROL', desc:'Absolute particle retention regardless of dust concentration or engine load — protecting cylinders and turbochargers in all operating environments.'},
              {num:'02', title:'PRESSURE DROP', desc:'Optimized pleat geometry maintains low restriction across the full service interval, preserving engine power and fuel efficiency at all times.'},
              {num:'03', title:'HIGH TEMP OPS', desc:'Engineered to maintain structural integrity at extreme temperatures — protecting engines in desert mining, agriculture, and construction operations worldwide.'},
            ].map((p, i) => (
              <div key={i} className="as-protocol-card">
                <div className="as-protocol-num">{p.num}</div>
                <div className="as-protocol-title">{p.title}</div>
                <p className="as-protocol-p">{p.desc}</p>
                <div className="as-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="as-cta">
        <div className="as-cta-inner">
          <div>
            <div className="as-cta-label">// FINAL ENGINEERING DECISION</div>
            <div className="as-cta-h2">SECURE EVERY<br />BREATH.</div>
            <p className="as-cta-p">Do not allow abrasive contamination to compromise your engine life. Upgrade your air intake protection today. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="as-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
