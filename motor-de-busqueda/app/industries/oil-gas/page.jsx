'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function OilGas() {
  const css = `
    .og{background:#000;color:#fff;min-height:100vh;}
    .og-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .og-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .og-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/04/pexels-tomfisk-6767962-1-scaled.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .og-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .og-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .og-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,100px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .og-h1 span{color:#FFF12D;}
    .og-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .og-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .og-sec-inner{max-width:1400px;margin:0 auto;}
    .og-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .og-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .og-h2 span{color:#FFF12D;}
    .og-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .og-video-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;overflow:hidden;}
    .og-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:opacity 0.3s;}
    .og-video-wrap:hover video{opacity:1;}
    .og-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .og-feature{background:rgba(255,255,255,0.02);border-left:3px solid #FFF12D;padding:36px;transition:all 0.3s;}
    .og-feature:hover{background:rgba(255,255,255,0.05);transform:translateY(-4px);}
    .og-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .og-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .og-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .og-tco{background:#050505;border:1px solid rgba(255,241,45,0.2);padding:48px;}
    .og-tco-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;}
    .og-table{width:100%;border-collapse:collapse;}
    .og-table th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);}
    .og-table th:nth-child(2){color:#ef4444;}
    .og-table th:nth-child(3){color:#FFF12D;}
    .og-table td{font-family:'JetBrains Mono',monospace;font-size:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .og-table tr:hover td{background:rgba(255,255,255,0.03);}
    .og-table td:nth-child(2){color:#ef4444;}
    .og-table td:nth-child(3){color:#FFF12D;}
    .og-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-top:32px;}
    .og-stat-n{font-family:'Russo One',sans-serif;font-size:40px;color:#FFF12D;margin-bottom:6px;}
    .og-stat-n.white{color:#fff;}
    .og-stat-l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;}
    .og-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .og-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .og-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .og-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .og-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .og-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .og-cta{background:#FFF12D;padding:72px 6%;}
    .og-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .og-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .og-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .og-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .og-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .og-cta-btn:hover{background:#111;}
    .og-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.og-grid2{grid-template-columns:1fr;} .og-grid3{grid-template-columns:repeat(2,1fr);} .og-tco-grid{grid-template-columns:1fr;} .og-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.og-grid3{grid-template-columns:1fr;} .og-hero-p{font-size:12px;} .og-cta-inner{flex-direction:column;} .og-stats{grid-template-columns:1fr;}}
  `;

  return (
    <div className="og">
      <style>{css}</style>
      <a href="/" className="og-back">&larr; HOME</a>

      <section className="og-hero">
        <div className="og-hero-inner">
          <div className="og-eyebrow">// UPSTREAM â€¢ MIDSTREAM â€¢ DOWNSTREAM</div>
          <h1 className="og-h1">OIL & GAS<br /><span>MISSION-CRITICAL.</span></h1>
          <p className="og-hero-p">Industrial asset protection systems engineered for upstream drilling operations, midstream pipeline infrastructure, and downstream refinery equipment. Our filtration technology shields turbines, hydraulic BOP systems, fuel circuits, and air intake systems from H2S exposure, salt mist, and abrasive contamination â€” ensuring uninterrupted energy output across global oil and gas operations. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="og-sec" style={{background:'#050505'}}>
        <div className="og-sec-inner">
          <div className="og-grid2">
            <div>
              <div className="og-eyebrow">// ZERO FAILURE ENERGY CONTINUITY</div>
              <h2 className="og-h2">ENGINEERED FOR<br /><span>UNINTERRUPTED FLOW.</span></h2>
              <p className="og-p">Remote assets and corrosive atmospheres demand protection that exceeds standard OEM specifications. We neutralize H2S exposure, salt mist, and abrasive mineral contamination across upstream, midstream, and downstream energy infrastructure worldwide.</p>
              <p className="og-p">Energy infrastructure cannot stop. Filtration is not maintenance â€” it is operational survival for turbines, high-pressure injection systems, and hydraulic control circuits in the world's most critical energy operations.</p>
            </div>
            <div className="og-video-wrap">
              <video src={`${WP}/2025/08/5123350-uhd_3840_2160_30fps.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="og-sec">
        <div className="og-sec-inner">
          <div className="og-eyebrow" style={{marginBottom:'20px'}}>// DNA TECHNOLOGY MATRIX</div>
          <h2 className="og-h2">CORE <span>SYSTEMS</span></h2>
          <div className="og-grid3" style={{marginTop:'40px'}}>
            {[
              {label:'MACROCORE™', title:'AIR INTAKE', desc:'High-capacity media engineered for offshore platforms and abrasive dust environments â€” protecting gas turbines and diesel generators from intake contamination.'},
              {label:'AQUAGUARD™', title:'FUEL PURITY', desc:'99.9% water separation protecting critical energy platforms â€” ensuring pure fuel delivery to injection systems in remote upstream and offshore operations.'},
              {label:'NANOFORCE™', title:'HYDRAULIC', desc:'Precision filtration for BOP systems, subsea controls, and wellhead hydraulic circuits â€” maintaining cleanliness codes in safety-critical oil and gas applications.'},
              {label:'SINTRAX™', title:'LUBRICATION', desc:'High-capacity oil filtration for compressors, pumps, and power generation equipment â€” extending lubricant service life in continuous-duty energy operations.'},
              {label:'AQUAGUARD SERIES', title:'TURBINE SEPARATION', desc:'FH Series turbine separator technology eliminates water contamination from fuel systems â€” protecting diesel generators and gas-powered equipment on remote sites.'},
              {label:'DRYCORE™', title:'PNEUMATIC SAFETY', desc:'Moisture elimination from instrument air and pneumatic control systems â€” protecting safety-critical valves and control actuators from corrosion in H2S environments.'},
            ].map((f, i) => (
              <div key={i} className="og-feature">
                <div className="og-feature-label">{f.label}</div>
                <div className="og-feature-title">{f.title}</div>
                <p className="og-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="og-sec" style={{background:'#030303'}}>
        <div className="og-sec-inner">
          <div className="og-tco">
            <div className="og-tco-grid">
              <div>
                <div className="og-eyebrow" style={{marginBottom:'16px'}}>// TCO ANALYSIS</div>
                <h2 className="og-h2">THE ECONOMICS OF<br /><span>ENERGY UPTIME.</span></h2>
                <p className="og-p">In oil and gas operations, every hour of unplanned downtime can cost hundreds of thousands of dollars in lost production, regulatory penalties, and emergency maintenance across upstream and midstream assets.</p>
                <div className="og-stats">
                  <div><div className="og-stat-n">99.9%</div><div className="og-stat-l">FUEL PURITY</div></div>
                  <div><div className="og-stat-n white">ZERO</div><div className="og-stat-l">BYPASS TOLERANCE</div></div>
                  <div><div className="og-stat-n">+35%</div><div className="og-stat-l">COMPONENT LIFE</div></div>
                  <div><div className="og-stat-n white">ROI</div><div className="og-stat-l">ENERGY UPTIME</div></div>
                </div>
              </div>
              <table className="og-table">
                <thead>
                  <tr>
                    <th style={{textAlign:'left'}}>FIELD CHALLENGE</th>
                    <th style={{textAlign:'left'}}>STANDARD</th>
                    <th style={{textAlign:'left'}}>ELIMFILTERS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>H2S Corrosion</td><td>Component Failure</td><td>Full Neutralization</td></tr>
                  <tr><td>Salt Mist Exposure</td><td>Rapid Degradation</td><td>Naval Grade Shield</td></tr>
                  <tr><td>Water in Fuel</td><td>Injector Erosion</td><td>99.9% Separation</td></tr>
                  <tr><td>Remote Site Ops</td><td>Frequent Stops</td><td>Extended Intervals</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="og-sec" style={{background:'#000'}}>
        <div className="og-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="og-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="og-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="og-protocol-grid">
            {[
              {num:'01', title:'CORROSION DEFENSE', desc:'Engineered to withstand H2S exposure, salt mist, and corrosive atmospheres in offshore and sour gas environments â€” protecting critical energy infrastructure worldwide.'},
              {num:'02', title:'REMOTE RELIABILITY', desc:'Extended service intervals designed for remote site operations â€” reducing maintenance logistics and ensuring continuous protection in locations far from supply chains.'},
              {num:'03', title:'SAFETY COMPLIANCE', desc:'Filtration systems engineered to meet oil and gas industry safety standards â€” protecting BOP systems, subsea controls, and safety-critical hydraulic circuits from contamination.'},
            ].map((p, i) => (
              <div key={i} className="og-protocol-card">
                <div className="og-protocol-num">{p.num}</div>
                <div className="og-protocol-title">{p.title}</div>
                <p className="og-protocol-p">{p.desc}</p>
                <div className="og-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="og-cta">
        <div className="og-cta-inner">
          <div>
            <div className="og-cta-label">// STRATEGIC PROCUREMENT</div>
            <div className="og-cta-h2">ELIMINATE FIELD DOWNTIME.<br />SECURE YOUR YIELD.</div>
            <p className="og-cta-p">Do not allow inadequate filtration to compromise your energy output. Upgrade your oil and gas infrastructure defense today. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="og-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="og-cta-footer">ENERGY PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}

