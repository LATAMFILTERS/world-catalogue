'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Agriculture() {
  const css = `
    .ag{background:#000;color:#fff;min-height:100vh;}
    .ag-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ag-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ag-hero{min-height:85vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.92) 15%,rgba(0,0,0,0.3) 100%),url('${WP}/2025/08/darla-hueske-Uz8xk0S_35c-unsplash-1-scaled.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ag-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ag-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ag-h1{font-family:'Russo One',sans-serif;font-size:clamp(42px,7vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ag-h1 span{color:#FFF12D;}
    .ag-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ag-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ag-sec-inner{max-width:1400px;margin:0 auto;}
    .ag-grid2{display:grid;grid-template-columns:5fr 7fr;gap:64px;align-items:center;}
    .ag-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ag-h2 span{color:#FFF12D;}
    .ag-line{height:3px;width:80px;background:#FFF12D;margin-bottom:24px;}
    .ag-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .ag-specs{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .ag-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:8px;}
    .ag-spec-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;}
    .ag-video{background:#000;border:1px solid rgba(255,255,255,0.05);position:relative;overflow:hidden;}
    .ag-video video{width:100%;filter:grayscale(1);opacity:0.6;transition:opacity 0.7s;}
    .ag-video:hover video{opacity:0.9;}
    .ag-video-tag{position:absolute;bottom:16px;right:16px;font-family:'JetBrains Mono',monospace;font-size:9px;background:rgba(0,0,0,0.8);padding:6px 12px;border:1px solid rgba(255,255,255,0.1);color:#FFF12D;letter-spacing:0.2em;}
    .ag-quote{background:#050505;border-left:4px solid #FFF12D;padding:24px;margin-top:24px;}
    .ag-quote p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;font-style:italic;letter-spacing:0.05em;}
    .ag-tech-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .ag-tech-card{background:#050505;border:1px solid #111;padding:36px;transition:border-color 0.4s;}
    .ag-tech-card:hover{border-color:rgba(255,241,45,0.3);}
    .ag-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ag-tech-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ag-tech-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ag-tco{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ag-tco-inner{max-width:1400px;margin:0 auto;background:#050505;border:1px solid rgba(255,241,45,0.2);padding:48px;}
    .ag-tco-top{display:flex;justify-content:space-between;align-items:flex-start;gap:40px;flex-wrap:wrap;margin-bottom:48px;}
    .ag-table{width:100%;border-collapse:collapse;}
    .ag-table th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);}
    .ag-table th:nth-child(2){color:#ef4444;}
    .ag-table th:nth-child(3){color:#FFF12D;}
    .ag-table td{font-family:'JetBrains Mono',monospace;font-size:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .ag-table tr:hover td{background:rgba(255,255,255,0.03);}
    .ag-table td:nth-child(2){color:#ef4444;}
    .ag-table td:nth-child(3){color:#FFF12D;}
    .ag-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding-top:40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;}
    .ag-stat-n{font-family:'Russo One',sans-serif;font-size:40px;color:#FFF12D;margin-bottom:8px;}
    .ag-stat-n.white{color:#fff;}
    .ag-stat-l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;}
    .ag-cta{background:#FFF12D;padding:72px 6%;}
    .ag-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .ag-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .ag-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .ag-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .ag-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .ag-cta-btn:hover{background:#111;}
    @media(max-width:1024px){.ag-grid2{grid-template-columns:1fr;} .ag-tech-grid{grid-template-columns:repeat(2,1fr);} .ag-stats{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.ag-tech-grid{grid-template-columns:1fr;} .ag-tco-top{flex-direction:column;} .ag-cta-inner{flex-direction:column;} .ag-hero-p{font-size:12px;}}
  `;

  return (
    <div className="ag">
      <style>{css}</style>
      <a href="/" className="ag-back">&larr; HOME</a>

      <section className="ag-hero">
        <div className="ag-hero-inner">
          <div className="ag-eyebrow">// AGRO OPERATIONAL CONTINUITY</div>
          <h1 className="ag-h1">MAXIMIZING AVAILABILITY<br /><span>DURING CRITICAL HARVEST.</span></h1>
          <p className="ag-hero-p">Industrial asset protection systems engineered for agricultural fleets, harvesting equipment, and critical diesel-powered farm infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from organic contamination â€” extending asset lifespan, eliminating unplanned downtime during harvest windows, and reducing total cost of ownership. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ag-sec" style={{background:'#000'}}>
        <div className="ag-sec-inner">
          <div className="ag-grid2">
            <div>
              <div className="ag-eyebrow">// HARVEST PROTECTION PROTOCOL</div>
              <h2 className="ag-h2">SYSTEMIC<br /><span>ASSET</span><br />PROTECTION.</h2>
              <div className="ag-line" />
              <p className="ag-p">ELIMFILTERS implements filtration architectures engineered to neutralize organic contaminants and maintain peak performance under heavy duty agricultural cycles and extreme harvest conditions.</p>
              <div className="ag-specs">
                <div>
                  <div className="ag-spec-label">01. DEBRIS CONTROL</div>
                  <p className="ag-spec-p">Specialized media for fine dust and crop residue, preventing airflow restriction in critical intake systems.</p>
                </div>
                <div>
                  <div className="ag-spec-label">02. THERMAL STABILITY</div>
                  <p className="ag-spec-p">Structural integrity under extreme heat cycles and variable engine loads during harvest operations.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="ag-video">
                <video src="/videos/agriculture.mp4" autoPlay muted loop playsInline />
                <div className="ag-video-tag">LIVE TECH FEED // AG-77</div>
              </div>
              <div className="ag-quote">
                <p>"Our engineering eliminates the financial risk associated with mechanical downtime during the critical harvest window â€” protecting yield, investment, and operational continuity."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ag-sec" style={{background:'#030303'}}>
        <div className="ag-sec-inner">
          <div className="ag-eyebrow" style={{marginBottom:'40px',textAlign:'center'}}>// AGRICULTURE TECH DNA</div>
          <div className="ag-tech-grid">
            <div className="ag-tech-card">
              <div className="ag-tech-label">SYNTEPORE™ / AIR INTAKE</div>
              <div className="ag-tech-title">OPTIMIZED FLOW</div>
              <p className="ag-tech-p">Engineered to handle high concentrations of organic matter while maintaining maximum engine protection and air intake efficiency during harvest operations.</p>
            </div>
            <div className="ag-tech-card">
              <div className="ag-tech-label">AQUAGUARD™ / FUEL</div>
              <div className="ag-tech-title">TOTAL SEPARATION</div>
              <p className="ag-tech-p">99.9% water removal efficiency to protect Common Rail injectors from field-storage fuel contamination across all agricultural equipment.</p>
            </div>
            <div className="ag-tech-card">
              <div className="ag-tech-label">NANOFORCE™ / HYDRAULIC</div>
              <div className="ag-tech-title">SYSTEM STABILITY</div>
              <p className="ag-tech-p">Critical protection for hydrostatic transmissions and harvest control actuators operating under continuous high-load conditions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ag-tco">
        <div className="ag-tco-inner">
          <div className="ag-tco-top">
            <div>
              <div className="ag-eyebrow">// TCO ANALYSIS</div>
              <h2 className="ag-h2">THE DIFFERENCE IN<br /><span>FIELD PRODUCTIVITY.</span></h2>
              <p className="ag-p" style={{maxWidth:'480px'}}>We calculate the impact of poor filtration not in the cost of the filter, but in the grain tonnage lost during unplanned downtime and missed harvest windows.</p>
            </div>
            <table className="ag-table" style={{maxWidth:'520px',width:'100%'}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left'}}>FIELD CHALLENGE</th>
                  <th style={{textAlign:'left'}}>CONVENTIONAL</th>
                  <th style={{textAlign:'left'}}>ELIMFILTERS</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Dust Saturation</td><td>Restricted Power</td><td>Maximum Intake</td></tr>
                <tr><td>Harvest Uptime</td><td>High Risk</td><td>100% Reliability</td></tr>
                <tr><td>Fuel Quality</td><td>Injector Wear</td><td>Pure Delivery</td></tr>
              </tbody>
            </table>
          </div>
          <div className="ag-stats">
            <div><div className="ag-stat-n">0%</div><div className="ag-stat-l">BYPASS TOLERANCE</div></div>
            <div><div className="ag-stat-n white">+40%</div><div className="ag-stat-l">COMPONENT LIFE</div></div>
            <div><div className="ag-stat-n">99.9%</div><div className="ag-stat-l">WATER SEPARATION</div></div>
            <div><div className="ag-stat-n white">ROI</div><div className="ag-stat-l">MAXIMIZED HARVEST</div></div>
          </div>
        </div>
      </section>

      <section className="ag-cta">
        <div className="ag-cta-inner">
          <div>
            <div className="ag-cta-label">// STRATEGIC PROCUREMENT</div>
            <div className="ag-cta-h2">ELIMINATE FIELD DOWNTIME.<br />SECURE YOUR YIELD.</div>
            <p className="ag-cta-p">Do not allow inadequate filtration to compromise your harvest window. Upgrade your agricultural asset protection today. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="ag-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}

