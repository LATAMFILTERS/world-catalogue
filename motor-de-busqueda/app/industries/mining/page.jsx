'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Mining() {
  const css = `
    .mn{background:#000;color:#fff;min-height:100vh;}
    .mn-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mn-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mn-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 35%,transparent 100%),url('${WP}/2025/08/digger-1867268_1920.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mn-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mn-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;display:flex;align-items:center;gap:16px;}
    .mn-eyebrow:before{content:'';display:block;width:48px;height:1px;background:#FFF12D;}
    .mn-h1{font-family:'Russo One',sans-serif;font-size:clamp(35px,5vw,75px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mn-h1 span{color:#FFF12D;}
    .mn-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mn-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mn-sec-inner{max-width:1400px;margin:0 auto;}
    .mn-card{background:#050505;border:1px solid #1a1a1a;padding:44px;}
    .mn-card-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mn-card-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.5;}
    .mn-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mn-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mn-h2 span{color:#FFF12D;}
    .mn-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mn-video-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;overflow:hidden;}
    .mn-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;}
    .mn-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mn-feature{background:rgba(255,255,255,0.02);border-left:3px solid #FFF12D;padding:28px;transition:all 0.3s;min-height:140px;}
    .mn-feature:hover{background:rgba(255,255,255,0.05);transform:translateY(-3px);border-left-width:6px;}
    .mn-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mn-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mn-tco{background:#050505;border:1px solid rgba(255,241,45,0.2);padding:48px;}
    .mn-tco-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
    .mn-table{width:100%;border-collapse:collapse;}
    .mn-table th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);}
    .mn-table th:nth-child(2){color:#ef4444;}
    .mn-table th:nth-child(3){color:#FFF12D;}
    .mn-table td{font-family:'JetBrains Mono',monospace;font-size:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .mn-table tr:hover td{background:rgba(255,255,255,0.03);}
    .mn-table td:nth-child(2){color:#ef4444;}
    .mn-table td:nth-child(3){color:#FFF12D;}
    .mn-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-top:32px;}
    .mn-stat-n{font-family:'Russo One',sans-serif;font-size:40px;color:#FFF12D;margin-bottom:6px;}
    .mn-stat-n.white{color:#fff;}
    .mn-stat-l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;}
    .mn-cta{background:#FFF12D;padding:72px 6%;}
    .mn-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .mn-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .mn-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .mn-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .mn-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .mn-cta-btn:hover{background:#111;}
    .mn-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.mn-grid2{grid-template-columns:1fr;} .mn-grid3{grid-template-columns:repeat(2,1fr);} .mn-tco-grid{grid-template-columns:1fr;} .mn-hero{background:linear-gradient(0deg,rgba(0,0,0,0.8) 30%,transparent 100%),url('${WP}/2025/08/digger-1867268_1920.jpg') center/contain no-repeat;}}
    @media(max-width:768px){.mn-grid3{grid-template-columns:1fr;} .mn-hero-p{font-size:12px;} .mn-cta-inner{flex-direction:column;} .mn-stats{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mn">
      <style>{css}</style>
      <a href="/?skip=1" className="mn-back">&larr; HOME</a>

      <section className="mn-hero">
        <div className="mn-hero-inner">
          <div className="mn-eyebrow">// EXTREME EXTRACTION DEFENSE</div>
          <h1 className="mn-h1">PROTECTING CRITICAL<br /><span>MINING ASSETS.</span></h1>
          <p className="mn-hero-p">Industrial asset protection systems engineered for open-pit and underground mining operations, heavy extraction equipment, and critical diesel-powered mining infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from abrasive mineral contamination â€” extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mn-sec">
        <div className="mn-sec-inner">
          <div className="mn-card">
            <p className="mn-card-p">In the pit, downtime is measured in thousands of dollars per minute. A filtration failure is more than a repair â€” it is a massive disruption to the global supply chain, affecting production targets, contractor schedules, and commodity delivery commitments worldwide.</p>
            <div className="mn-card-strong">ELIMFILTERS engineering targets mechanical risk reduction and service life extension for massive assets in haulage, extraction, and crushing environments.</div>
          </div>
        </div>
      </section>

      <section className="mn-sec" style={{background:'#050505'}}>
        <div className="mn-sec-inner">
          <div className="mn-grid2">
            <div>
              <div className="mn-eyebrow" style={{display:'flex',marginBottom:'20px'}}>// MISSION RELIABILITY</div>
              <h2 className="mn-h2">BUILT FOR <span>24/7 CYCLES.</span></h2>
              <p className="mn-p">Mining exposes engines and hydraulics to extreme abrasive dust and thermal shocks that compromise critical internal tolerances â€” accelerating wear and triggering catastrophic failures in the most expensive machinery on earth.</p>
              <p className="mn-p">Our architectures maintain absolute fluid stability, shielding high-pressure injectors and hydrostatic pumps from catastrophic wear during continuous 24/7 extraction cycles in the harshest environments worldwide.</p>
            </div>
            <div className="mn-video-wrap">
              <video src={`${WP}/2025/08/4203127-uhd_3840_2160_25fps.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="mn-sec">
        <div className="mn-sec-inner">
          <div className="mn-eyebrow" style={{display:'flex',marginBottom:'20px'}}>// ENGINEERING MATRIX</div>
          <h2 className="mn-h2">SOLUTIONS FOR <span>HIGH-LOAD SYSTEMS</span></h2>
          <div className="mn-grid3" style={{marginTop:'40px'}}>
            {[
              {label:'AIR INTAKE / MACROCOREâ„¢', desc:'Superior dust control for massive diesel engines â€” ensuring maximum airflow with multi-stage particle capture in high-silica open-pit and underground mining environments.'},
              {label:'FUEL / AQUAGUARDâ„¢', desc:'99.9% water separation and micro-particle removal for high-pressure Common Rail systems operating on remote mining sites with variable fuel quality.'},
              {label:'HYDRAULIC / NANOFORCEâ„¢', desc:'Zero-leakage precision filtration protecting actuators and pumps from fine metallic particulate wear in excavators, haul trucks, and crushing equipment.'},
              {label:'LUBE / SINTRAXâ„¢', desc:'High-capacity soot and metal particle capture in engine lubrication systems â€” extending oil service life and protecting engine internals during extended shift cycles.'},
              {label:'CABIN / MICROKAPPAâ„¢', desc:'HEPA-grade operator cabin protection against mine dust, silica particles, and exhaust gases â€” protecting worker health in underground and surface mining operations.'},
              {label:'AIR DRYER / DRYCOREâ„¢', desc:'Moisture elimination from pneumatic brake systems in haul trucks and mining equipment â€” ensuring full braking reliability in all weather and altitude conditions.'},
            ].map((f, i) => (
              <div key={i} className="mn-feature">
                <div className="mn-feature-label">{f.label}</div>
                <p className="mn-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mn-sec" style={{background:'#030303'}}>
        <div className="mn-sec-inner">
          <div className="mn-tco">
            <div className="mn-tco-grid">
              <div>
                <div className="mn-eyebrow" style={{display:'flex',marginBottom:'16px'}}>// TCO ANALYSIS</div>
                <h2 className="mn-h2">THE ECONOMICS OF<br /><span>MINING UPTIME.</span></h2>
                <p className="mn-p">Protection is not a cost â€” it is a financial strategy. Every hour of unplanned downtime in a large open-pit operation can cost more than the entire annual filtration budget for that asset.</p>
                <div className="mn-stats">
                  <div><div className="mn-stat-n">+35%</div><div className="mn-stat-l">COMPONENT LIFE</div></div>
                  <div><div className="mn-stat-n white">ZERO</div><div className="mn-stat-l">VALVE EROSION</div></div>
                  <div><div className="mn-stat-n">99.9%</div><div className="mn-stat-l">FUEL PURITY</div></div>
                  <div><div className="mn-stat-n white">ROI</div><div className="mn-stat-l">MAXIMIZED UPTIME</div></div>
                </div>
              </div>
              <table className="mn-table">
                <thead>
                  <tr>
                    <th style={{textAlign:'left'}}>MINING CHALLENGE</th>
                    <th style={{textAlign:'left'}}>STANDARD</th>
                    <th style={{textAlign:'left'}}>ELIMFILTERS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Silica Dust</td><td>Rapid Clogging</td><td>High Capacity Flow</td></tr>
                  <tr><td>Hydraulic Spikes</td><td>Bypass Leakage</td><td>Static Integrity</td></tr>
                  <tr><td>Fuel Quality</td><td>Injector Wear</td><td>Pure Delivery</td></tr>
                  <tr><td>Service Intervals</td><td>Frequent Stops</td><td>Extended Coverage</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="mn-cta">
        <div className="mn-cta-inner">
          <div>
            <div className="mn-cta-label">// OPERATIONAL STABILITY PROTOCOL</div>
            <div className="mn-cta-h2">ELIMINATE THE REVENUE STOP.<br />SECURE YOUR MINING UPTIME.</div>
            <p className="mn-cta-p">In mining, protection is not a choice â€” it is a financial strategy. Secure your productivity with ELIMFILTERS. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="mn-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="mn-cta-footer">MINING PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}


