'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function PowerGeneration() {
  const css = `
    .pg{background:#000;color:#fff;min-height:100vh;}
    .pg-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .pg-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .pg-hero{min-height:70vh;display:flex;align-items:center;background:linear-gradient(90deg,rgba(0,0,0,0.9) 35%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/ChatGPT-Image-7-ago-2025-10_09_26-a.m.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .pg-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .pg-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,6vw,85px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .pg-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);text-transform:uppercase;line-height:0.95;color:#FFF12D;margin:8px 0 0;}
    .pg-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .pg-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-sec-inner{max-width:1400px;margin:0 auto;}
    .pg-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .pg-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .pg-sh2 span{color:#FFF12D;}
    .pg-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .pg-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;}
    .pg-tech{border-left:1px solid #27272a;padding-left:16px;}
    .pg-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .pg-tech-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .pg-video-wrap{background:#000;border:1px solid rgba(255,255,255,0.1);padding:8px;}
    .pg-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .pg-video-wrap:hover video{filter:grayscale(0);opacity:1;}
    .pg-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .pg-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:32px;transition:all 0.3s;height:100%;}
    .pg-feature:hover{background:rgba(255,255,255,0.05);transform:translateY(-4px);border-color:#fff;}
    .pg-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .pg-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .pg-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .pg-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .pg-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .pg-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .pg-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .pg-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .pg-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .pg-cta{background:#FFF12D;padding:72px 6%;}
    .pg-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .pg-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .pg-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .pg-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .pg-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .pg-cta-btn:hover{background:#111;}
    .pg-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.pg-grid2{grid-template-columns:1fr;} .pg-grid3{grid-template-columns:repeat(2,1fr);} .pg-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.pg-grid3{grid-template-columns:1fr;} .pg-hero-p{font-size:12px;} .pg-cta-inner{flex-direction:column;} .pg-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="pg">
      <style>{css}</style>
      <a href="/?skip=1" className="pg-back">&larr; HOME</a>

      <section className="pg-hero">
        <div className="pg-hero-inner">
          <div className="pg-eyebrow">// CRITICAL ENERGY INFRASTRUCTURE</div>
          <h1 className="pg-h1">UNINTERRUPTED</h1>
          <div className="pg-h2">POWER SYSTEMS</div>
          <p className="pg-hero-p">Industrial asset protection systems engineered for stationary diesel generators, gas turbines, and critical power generation infrastructure. Our filtration technology shields fuel systems, lubrication circuits, cooling systems, and air intake systems from contamination — ensuring uninterrupted power supply for hospitals, data centers, and industrial facilities worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="pg-sec" style={{background:'#050505'}}>
        <div className="pg-sec-inner">
          <div className="pg-grid2">
            <div>
              <div className="pg-eyebrow">// TOTAL CONTINUITY</div>
              <h2 className="pg-sh2">CRITICAL OPERATION<br /><span>ZERO FAILURE.</span></h2>
              <p className="pg-p">Stationary engines operate under constant load and standby periods that accelerate fuel and lubricant degradation. ELIMFILTERS engineers protection architectures that ensure the thermal and chemical stability of your power assets worldwide.</p>
              <p className="pg-p">Hospitals, data centers, and industrial plants rely on filtration reliability to maintain continuous supply during any contingency — where failure is measured in lives, data loss, and production shutdown.</p>
              <div className="pg-tech-grid">
                <div className="pg-tech"><span className="pg-tech-label">SYNTEPORE™</span><span className="pg-tech-sub">Fuel Integrity</span></div>
                <div className="pg-tech"><span className="pg-tech-label">SINTRAX™</span><span className="pg-tech-sub">Lubrication</span></div>
                <div className="pg-tech"><span className="pg-tech-label">MACROCORE™</span><span className="pg-tech-sub">Air Purity</span></div>
                <div className="pg-tech"><span className="pg-tech-label">NANOFORCE™</span><span className="pg-tech-sub">Control Systems</span></div>
              </div>
            </div>
            <div className="pg-video-wrap">
              <video src={`${WP}/2025/08/Untitled-video-1.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="pg-sec">
        <div className="pg-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="pg-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// DNA TECHNOLOGY MATRIX</div>
            <h2 className="pg-sh2" style={{textAlign:'center'}}>DEFENSE <span>ARCHITECTURE</span></h2>
          </div>
          <div className="pg-grid3">
            {[
              {label:'SYNTEPORE™ / FUEL', title:'PURE DIESEL', desc:'Absolute removal of water and sediment to prevent corrosion in high-pressure injection systems — ensuring pure fuel delivery in stationary generators and gas turbines.'},
              {label:'SINTRAX™ / OIL', title:'STABLE LUBRICATION', desc:'Full-flow filtration designed to withstand extended periods of continuous service and emergency starts — protecting engine internals during standby and peak load cycles.'},
              {label:'MACROCORE™ / AIR', title:'AIR PURITY', desc:'Advanced protection against airborne contaminants in heavy industrial and urban environments — maintaining engine intake air quality in continuous power generation operations.'},
              {label:'COOLANT GUARD', title:'THERMAL CONTROL', desc:'Active prevention of cavitation and mineral deposits in large-scale generator cooling systems — maintaining thermal stability under continuous full-load operation.'},
              {label:'CRANKCASE PRO', title:'MIST CONTROL', desc:'Oil mist separation to protect alternators and sensitive electrical components from short circuits — maintaining electrical insulation integrity in power generation equipment.'},
              {label:'NANOFORCE™ / HYD.', title:'CONTROL SYSTEMS', desc:'High-precision filtration for hydraulic governors and load control systems — ensuring energy stability and precise power output regulation in all operating conditions.'},
            ].map((f, i) => (
              <div key={i} className="pg-feature">
                <div className="pg-feature-label">{f.label}</div>
                <div className="pg-feature-title">{f.title}</div>
                <p className="pg-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-sec" style={{background:'#030303'}}>
        <div className="pg-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="pg-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="pg-sh2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="pg-protocol-grid">
            {[
              {num:'01', title:'STANDBY RELIABILITY', desc:'Engineered for extended standby periods and instant-start reliability — ensuring generators deliver full power output from the first second of emergency activation.'},
              {num:'02', title:'CONTINUOUS LOAD', desc:'High-capacity filtration designed for 24/7 continuous operation under full load — protecting fuel, oil, and cooling systems during sustained power generation cycles.'},
              {num:'03', title:'MISSION CRITICAL', desc:'Protection architectures certified for hospital, data center, and critical infrastructure applications — where power continuity is non-negotiable and failure is not an option.'},
            ].map((p, i) => (
              <div key={i} className="pg-protocol-card">
                <div className="pg-protocol-num">{p.num}</div>
                <div className="pg-protocol-title">{p.title}</div>
                <p className="pg-protocol-p">{p.desc}</p>
                <div className="pg-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-cta">
        <div className="pg-cta-inner">
          <div>
            <div className="pg-cta-label">// ENERGY CONTINUITY PROTOCOL</div>
            <div className="pg-cta-h2">WHEN POWER CANNOT STOP,<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="pg-cta-p">Access our high-performance technical database. Search by OEM or competitor part number to find the exact ELIMFILTERS match for your power generation assets. 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="pg-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="pg-cta-footer">POWER GENERATION PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
