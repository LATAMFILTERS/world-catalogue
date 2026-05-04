'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function BusCoach() {
  const css = `
    .bc{background:#000;color:#fff;min-height:100vh;}
    .bc-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .bc-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .bc-hero{min-height:85vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.92) 15%,rgba(0,0,0,0.3) 100%),url('${WP}/2025/08/ChatGPT-Image-7-ago-2025-05_57_57-p.m.webp') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .bc-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .bc-h1{font-family:'Russo One',sans-serif;font-size:clamp(42px,7vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .bc-h1 span{color:#FFF12D;}
    .bc-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .bc-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-sec-inner{max-width:1400px;margin:0 auto;}
    .bc-grid2{display:grid;grid-template-columns:5fr 7fr;gap:64px;align-items:center;}
    .bc-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .bc-h2 span{color:#FFF12D;}
    .bc-line{height:3px;width:80px;background:#FFF12D;margin-bottom:24px;}
    .bc-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .bc-specs{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .bc-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:8px;}
    .bc-spec-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;}
    .bc-video{background:#000;border:1px solid rgba(255,255,255,0.05);position:relative;overflow:hidden;}
    .bc-video video{width:100%;filter:grayscale(1);opacity:0.6;transition:opacity 0.7s;}
    .bc-video:hover video{opacity:0.9;}
    .bc-video-tag{position:absolute;bottom:16px;right:16px;font-family:'JetBrains Mono',monospace;font-size:9px;background:rgba(0,0,0,0.8);padding:6px 12px;border:1px solid rgba(255,255,255,0.1);color:#FFF12D;letter-spacing:0.2em;}
    .bc-quote{background:#050505;border-left:4px solid #FFF12D;padding:24px;margin-top:24px;}
    .bc-quote p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;font-style:italic;letter-spacing:0.05em;}
    .bc-tech-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .bc-tech-card{background:#050505;border:1px solid #111;padding:36px;transition:border-color 0.4s;}
    .bc-tech-card:hover{border-color:rgba(255,241,45,0.3);}
    .bc-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .bc-tech-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .bc-tech-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .bc-tco{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-tco-inner{max-width:1400px;margin:0 auto;background:#050505;border:1px solid rgba(255,241,45,0.2);padding:48px;}
    .bc-tco-top{display:flex;justify-content:space-between;align-items:flex-start;gap:40px;flex-wrap:wrap;margin-bottom:48px;}
    .bc-table{width:100%;border-collapse:collapse;}
    .bc-table th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);}
    .bc-table th:nth-child(2){color:#ef4444;}
    .bc-table th:nth-child(3){color:#FFF12D;}
    .bc-table td{font-family:'JetBrains Mono',monospace;font-size:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .bc-table tr:hover td{background:rgba(255,255,255,0.03);}
    .bc-table td:nth-child(2){color:#ef4444;}
    .bc-table td:nth-child(3){color:#FFF12D;}
    .bc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding-top:40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;}
    .bc-stat-n{font-family:'Russo One',sans-serif;font-size:40px;color:#FFF12D;margin-bottom:8px;}
    .bc-stat-n.white{color:#fff;}
    .bc-stat-l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;}
    .bc-cta{background:#FFF12D;padding:72px 6%;}
    .bc-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .bc-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .bc-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .bc-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .bc-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .bc-cta-btn:hover{background:#111;}
    .bc-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.bc-grid2{grid-template-columns:1fr;} .bc-tech-grid{grid-template-columns:repeat(2,1fr);} .bc-stats{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.bc-tech-grid{grid-template-columns:1fr;} .bc-tco-top{flex-direction:column;} .bc-cta-inner{flex-direction:column;} .bc-hero-p{font-size:12px;} .bc-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="bc">
      <style>{css}</style>
      <a href="/?skip=1" className="bc-back">&larr; HOME</a>

      <section className="bc-hero">
        <div className="bc-hero-inner">
          <div className="bc-eyebrow">// TRANSIT OPERATIONAL CONTINUITY</div>
          <h1 className="bc-h1">MAXIMIZING UPTIME<br /><span>FOR URBAN MOBILITY.</span></h1>
          <p className="bc-hero-p">Industrial asset protection systems engineered for mass transit fleets, bus operations, and critical diesel-powered urban infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, air intake systems, and pneumatic brake circuits from contamination — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across urban transport operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="bc-sec" style={{background:'#000'}}>
        <div className="bc-sec-inner">
          <div className="bc-grid2">
            <div>
              <div className="bc-eyebrow">// PASSENGER SAFETY PROTOCOL</div>
              <h2 className="bc-h2">STRATEGIC<br /><span>FLEET</span><br />AVAILABILITY.</h2>
              <div className="bc-line" />
              <p className="bc-p">ELIMFILTERS develops filtration systems designed to extend service intervals and ensure that every unit stays on its route, mile after mile — protecting mass transit reliability and passenger safety.</p>
              <div className="bc-specs">
                <div>
                  <div className="bc-spec-label">01. ZERO DOWNTIME</div>
                  <p className="bc-spec-p">Engineered to eliminate unplanned stops, maximizing the return on investment per mile across urban transport fleets.</p>
                </div>
                <div>
                  <div className="bc-spec-label">02. SYSTEM PURITY</div>
                  <p className="bc-spec-p">Protection for advanced injection systems and automatic transmissions under continuous high-load urban conditions.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="bc-video">
                <video src={`${WP}/2025/08/29507-375947255_medium.mp4`} autoPlay muted loop playsInline />
                <div className="bc-video-tag">LIVE TECH FEED // BUS-TRANSIT</div>
              </div>
              <div className="bc-quote">
                <p>"Our technology doesn't just filter — it guarantees the operational flow of the city by keeping passenger units in motion and protecting every start, every mile."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bc-sec" style={{background:'#030303'}}>
        <div className="bc-sec-inner">
          <div className="bc-eyebrow" style={{marginBottom:'40px',textAlign:'center'}}>// BUS ENGINEERING DNA</div>
          <div className="bc-tech-grid">
            <div className="bc-tech-card">
              <div className="bc-tech-label">MACROCORE™ / AIR INTAKE</div>
              <div className="bc-tech-title">CITY BREATHING</div>
              <p className="bc-tech-p">Optimized for urban environments with high concentrations of micro-particulates and industrial pollutants — protecting engines in the most demanding city conditions.</p>
            </div>
            <div className="bc-tech-card">
              <div className="bc-tech-label">AQUAGUARD™ / BRAKES</div>
              <div className="bc-tech-title">PNEUMATIC SAFETY</div>
              <p className="bc-tech-p">Advanced air drying to prevent moisture corrosion in critical braking valves, ensuring constant safety and reliable pneumatic brake response across all operating conditions.</p>
            </div>
            <div className="bc-tech-card">
              <div className="bc-tech-label">NANOFORCE™ / FUEL</div>
              <div className="bc-tech-title">INJECTION PRECISION</div>
              <p className="bc-tech-p">Maximum water separation and particulate removal to protect Common Rail injection systems during intensive daily operation across mass transit fleets worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bc-tco">
        <div className="bc-tco-inner">
          <div className="bc-tco-top">
            <div>
              <div className="bc-eyebrow">// TCO ANALYSIS</div>
              <h2 className="bc-h2">THE ECONOMICS OF<br /><span>URBAN MOBILITY.</span></h2>
              <p className="bc-p" style={{maxWidth:'480px'}}>Efficiency is measured in cost per mile. We reduce maintenance frequency, allowing fleets to operate longer without technical interruptions — protecting public transport investment and operational continuity.</p>
            </div>
            <table className="bc-table" style={{maxWidth:'520px',width:'100%'}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left'}}>FLEET CHALLENGE</th>
                  <th style={{textAlign:'left'}}>STANDARD</th>
                  <th style={{textAlign:'left'}}>ELIMFILTERS</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Stop-and-Go Wear</td><td>High Oil Stress</td><td>SINTRAX™ Stability</td></tr>
                <tr><td>Service Intervals</td><td>Frequent Stops</td><td>Extended Coverage</td></tr>
                <tr><td>Braking Reliability</td><td>Valve Corrosion</td><td>Dry-Air Purity</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bc-stats">
            <div><div className="bc-stat-n">100%</div><div className="bc-stat-l">BRAKE PROTECTION</div></div>
            <div><div className="bc-stat-n white">+25%</div><div className="bc-stat-l">SERVICE LIFE</div></div>
            <div><div className="bc-stat-n">99.9%</div><div className="bc-stat-l">FUEL PURITY</div></div>
            <div><div className="bc-stat-n white">ZERO</div><div className="bc-stat-l">SYSTEM BYPASS</div></div>
          </div>
        </div>
      </section>

      <section className="bc-cta">
        <div className="bc-cta-inner">
          <div>
            <div className="bc-cta-label">// FLEET PROCUREMENT</div>
            <div className="bc-cta-h2">REDUCE FLEET OVERHEAD.<br />MAXIMIZE UPTIME.</div>
            <p className="bc-cta-p">Don't let inadequate filtration stall your fleet. Optimize your bus and coach operation with ELIMFILTERS engineering today. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="bc-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="bc-cta-footer">BUS & COACH PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
