'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Construction() {
  const css = `
    .cn{background:#000;color:#fff;min-height:100vh;}
    .cn-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .cn-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .cn-hero{min-height:85vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2025/08/excavadora.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cn-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .cn-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;display:flex;align-items:center;gap:16px;}
    .cn-eyebrow:before{content:'';display:block;width:40px;height:1px;background:#FFF12D;}
    .cn-h1{font-family:'Russo One',sans-serif;font-size:clamp(38px,6vw,85px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .cn-h1 span{color:#FFF12D;}
    .cn-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .cn-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cn-sec-inner{max-width:1400px;margin:0 auto;}
    .cn-grid2{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;}
    .cn-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .cn-h2 span{color:#FFF12D;}
    .cn-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .cn-stats{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .cn-stat-n{font-family:'Russo One',sans-serif;font-size:40px;color:#FFF12D;margin-bottom:6px;}
    .cn-stat-n.white{color:#fff;}
    .cn-stat-l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;}
    .cn-table{width:100%;border-collapse:collapse;}
    .cn-table th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:16px;border-bottom:1px solid #1a1a1a;background:rgba(255,255,255,0.05);}
    .cn-table th:nth-child(2){color:#ef4444;}
    .cn-table th:nth-child(3){color:#FFF12D;}
    .cn-table td{font-family:'JetBrains Mono',monospace;font-size:12px;padding:16px;border-bottom:1px solid #0a0a0a;color:rgba(255,255,255,0.8);}
    .cn-table tr:hover td{background:rgba(255,255,255,0.03);}
    .cn-table td:nth-child(2){color:#ef4444;}
    .cn-table td:nth-child(3){color:#FFF12D;}
    .cn-video-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;overflow:hidden;}
    .cn-video-wrap video{width:100%;filter:grayscale(1);opacity:0.8;transition:all 0.5s;}
    .cn-video-wrap:hover video{filter:grayscale(0);opacity:1;}
    .cn-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .cn-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:36px 28px;transition:all 0.3s cubic-bezier(0.165,0.84,0.44,1);}
    .cn-feature:hover{background:rgba(255,255,255,0.04);transform:translateY(-4px);border-left-width:8px;}
    .cn-feature-top{display:flex;justify-content:space-between;margin-bottom:16px;}
    .cn-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;}
    .cn-feature-cat{font-family:'JetBrains Mono',monospace;font-size:10px;color:#333;text-transform:uppercase;letter-spacing:0.1em;}
    .cn-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .cn-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .cn-cta{background:#FFF12D;padding:72px 6%;}
    .cn-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .cn-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .cn-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .cn-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .cn-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .cn-cta-btn:hover{background:#111;}
    .cn-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.cn-grid2{grid-template-columns:1fr;} .cn-grid3{grid-template-columns:repeat(2,1fr);} .cn-hero{min-height:60vh;background:linear-gradient(0deg,#000 40%,transparent 100%),url('${WP}/2025/08/excavadora.jpg') center/contain no-repeat;}}
    @media(max-width:768px){.cn-grid3{grid-template-columns:1fr;} .cn-hero-p{font-size:12px;} .cn-cta-inner{flex-direction:column;} .cn-stats{grid-template-columns:1fr;}}
  `;

  return (
    <div className="cn">
      <style>{css}</style>
      <a href="/?skip=1" className="cn-back">&larr; HOME</a>

      <section className="cn-hero">
        <div className="cn-hero-inner">
          <div className="cn-eyebrow">// HEAVY DUTY DEFENSE</div>
          <h1 className="cn-h1">PROTECTING CRITICAL<br /><span>CONSTRUCTION ASSETS.</span></h1>
          <p className="cn-hero-p">Industrial asset protection systems engineered for earthmoving equipment, heavy construction fleets, and critical diesel-powered machinery. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from abrasive contamination â€” extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across construction operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="cn-sec" style={{background:'#000'}}>
        <div className="cn-sec-inner">
          <div className="cn-grid2">
            <div>
              <div className="cn-eyebrow" style={{display:'flex',marginBottom:'16px'}}>// TCO OPTIMIZATION</div>
              <h2 className="cn-h2">THE ECONOMICS OF<br /><span>SITE UPTIME.</span></h2>
              <p className="cn-p">In heavy construction, the most expensive filter is the one that causes a machine to stop. We reduce maintenance frequency and eliminate component wear costs across excavators, bulldozers, and heavy earthmoving equipment.</p>
              <div className="cn-stats">
                <div><div className="cn-stat-n">+35%</div><div className="cn-stat-l">COMPONENT LIFE</div></div>
                <div><div className="cn-stat-n white">ZERO</div><div className="cn-stat-l">VALVE EROSION</div></div>
              </div>
            </div>
            <div style={{background:'#050505',border:'1px solid #1a1a1a',overflow:'hidden'}}>
              <table className="cn-table">
                <thead>
                  <tr>
                    <th style={{textAlign:'left'}}>SITE CHALLENGE</th>
                    <th style={{textAlign:'left'}}>STANDARD</th>
                    <th style={{textAlign:'left'}}>ELIMFILTERS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Extreme Vibration</td><td>Media Fatigue</td><td>Reinforced Mesh</td></tr>
                  <tr><td>Hydraulic Spikes</td><td>Bypass Leakage</td><td>Static Integrity</td></tr>
                  <tr><td>Silica Dust</td><td>Rapid Clogging</td><td>High Capacity Flow</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="cn-sec" style={{background:'#050505'}}>
        <div className="cn-sec-inner">
          <div className="cn-grid2" style={{alignItems:'center'}}>
            <div>
              <div className="cn-eyebrow" style={{display:'flex',marginBottom:'16px'}}>// PROTECTION TECHNOLOGY</div>
              <h2 className="cn-h2">STABILITY UNDER<br /><span>HIGH MECHANICAL LOADS.</span></h2>
              <p className="cn-p">Our specialized media handles abrasive mineral dust, sudden hydraulic pressure peaks, and fuel contamination during 24/7 duty cycles in the most demanding construction environments worldwide.</p>
              <p className="cn-p">Engineered for excavators, bulldozers, cranes, and heavy earthmoving equipment operating under continuous high-load conditions across global construction projects.</p>
            </div>
            <div className="cn-video-wrap">
              <video src={`${WP}/2025/08/51102-463106269_medium.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="cn-sec">
        <div className="cn-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="cn-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// ASSET MATRIX</div>
            <h2 className="cn-h2" style={{textAlign:'center'}}>SYSTEM-WIDE <span>ENGINEERING.</span></h2>
          </div>
          <div className="cn-grid3">
            {[
              {label:'MACROCOREâ„¢', cat:'Air Intake', title:'DUST CONTROL', desc:'Maximum particle retention in high-abrasion excavation zones where silica levels are extreme â€” protecting engine cylinders and turbochargers from premature wear.'},
              {label:'NANOFORCEâ„¢', cat:'Hydraulic', title:'VALVE DEFENSE', desc:'Precision stability for hydraulic systems under extreme pressure spikes and high duty cycles â€” protecting control valves and hydraulic actuators from contamination damage.'},
              {label:'AQUAGUARDâ„¢', cat:'Fuel Tech', title:'WATER SEPARATION', desc:'Hydrophobic protection against poor quality field fuel and injector corrosion in off-road sites â€” ensuring pure fuel delivery to Common Rail injection systems.'},
            ].map((f, i) => (
              <div key={i} className="cn-feature">
                <div className="cn-feature-top">
                  <span className="cn-feature-label">{f.label}</span>
                  <span className="cn-feature-cat">{f.cat}</span>
                </div>
                <div className="cn-feature-title">{f.title}</div>
                <p className="cn-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cn-cta">
        <div className="cn-cta-inner">
          <div>
            <div className="cn-cta-label">// STRATEGIC ASSET DECISION</div>
            <div className="cn-cta-h2">STOP THE DOWNTIME.<br />SECURE YOUR PROJECT ROI.</div>
            <p className="cn-cta-p">Unplanned failure is a cost you can eliminate. Protect your heavy-duty construction machinery with ELIMFILTERS engineering. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="cn-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="cn-cta-footer">CONSTRUCTION PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}

