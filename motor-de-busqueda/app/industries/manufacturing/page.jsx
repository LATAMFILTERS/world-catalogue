'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Manufacturing() {
  const css = `
    .mf{background:#000;color:#fff;min-height:100vh;}
    .mf-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mf-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mf-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mf-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mf-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,6vw,75px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mf-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,58px);text-transform:uppercase;line-height:0.95;color:#FFF12D;margin:8px 0 0;}
    .mf-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mf-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-sec-inner{max-width:1400px;margin:0 auto;}
    .mf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mf-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mf-sh2 span{color:#FFF12D;}
    .mf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .mf-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .mf-tech{border-left:1px solid #27272a;padding-left:16px;}
    .mf-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .mf-tech-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .mf-video-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;overflow:hidden;}
    .mf-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;}
    .mf-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:13px;letter-spacing:0.15em;padding:20px 45px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.25s;margin-top:24px;}
    .mf-btn:hover{background:#fff;}
    .mf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mf-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:32px;transition:all 0.3s;height:100%;}
    .mf-feature:hover{background:rgba(255,255,255,0.05);transform:translateY(-5px);}
    .mf-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mf-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .mf-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mf-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mf-env{background:linear-gradient(145deg,#030303,#000);border:1px solid #1a1a1a;padding:44px;}
    .mf-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mf-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .mf-cta{padding:100px 6%;background:#000;text-align:center;}
    .mf-cta-inner{max-width:900px;margin:0 auto;}
    .mf-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:8px;}
    .mf-cta-h2 span{color:#FFF12D;}
    @media(max-width:1024px){.mf-grid2{grid-template-columns:1fr;} .mf-grid3{grid-template-columns:repeat(2,1fr);} .mf-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.mf-grid3{grid-template-columns:1fr;} .mf-hero-p{font-size:12px;} .mf-tech-grid{grid-template-columns:1fr;} .mf-hero{background-position:70% center;}}
  `;

  return (
    <div className="mf">
      <style>{css}</style>
      <a href="/?skip=1" className="mf-back">&larr; HOME</a>

      <section className="mf-hero">
        <div className="mf-hero-inner">
          <div className="mf-eyebrow">// INDUSTRIAL PRODUCTIVITY / V-200</div>
          <h1 className="mf-h1">ALWAYS-ON PLANT</h1>
          <div className="mf-h2">ZERO CRITICAL DOWNTIME</div>
          <p className="mf-hero-p">Industrial asset protection systems engineered for manufacturing plants, process equipment, and critical industrial infrastructure. Our filtration technology shields hydraulic circuits, compressed air systems, lubrication lines, and cooling circuits from contamination â€” extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mf-sec" style={{background:'#050505'}}>
        <div className="mf-sec-inner">
          <div className="mf-grid2">
            <div>
              <div className="mf-eyebrow">// CONTINUOUS PROCESS ENGINEERING</div>
              <h2 className="mf-sh2">RELIABILITY <span>BY DESIGN</span></h2>
              <p className="mf-p">Industrial contamination in hydraulic fluids, lubricants, and compressed air systems creates inefficiencies that translate directly into shutdowns and economic losses across manufacturing operations worldwide.</p>
              <p className="mf-p">ELIMFILTERS delivers synchronized protection across all critical fluid systems â€” ensuring plant uptime, process consistency, and operator safety in every production environment.</p>
              <div className="mf-tech-grid">
                <div className="mf-tech"><span className="mf-tech-label">NANOFORCEâ„¢</span><span className="mf-tech-sub">Hydraulics</span></div>
                <div className="mf-tech"><span className="mf-tech-label">MACROCOREâ„¢</span><span className="mf-tech-sub">Compressed Air</span></div>
                <div className="mf-tech"><span className="mf-tech-label">SINTRAXâ„¢</span><span className="mf-tech-sub">Lubrication</span></div>
                <div className="mf-tech"><span className="mf-tech-label">COOLTECHâ„¢</span><span className="mf-tech-sub">Cooling Systems</span></div>
              </div>
              <Link href="/technologies" className="mf-btn">EXPLORE TECHNOLOGY</Link>
            </div>
            <div className="mf-video-wrap">
              <video src={`${WP}/2025/08/20250807_2255_Slow-Motion-Conveyor_simple_compose_01k23x2xaxe78b3h6m0dbxvyxm.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="mf-sec">
        <div className="mf-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// PROTECTION MATRIX</div>
            <h2 className="mf-sh2" style={{textAlign:'center'}}>SYSTEM BY SYSTEM <span>TOTAL DEFENSE</span></h2>
          </div>
          <div className="mf-grid3">
            {[
              {label:'NANOFORCEâ„¢ / HYDRAULIC', title:'PRECISION CONTROL', desc:'Maintains ISO cleanliness codes for proportional valves and servo systems â€” protecting hydraulic actuators and precision control circuits from contamination-driven failure.'},
              {label:'MACROCOREâ„¢ / AIR', title:'PNEUMATIC RELIABILITY', desc:'Eliminates oil mist and water vapor to protect pneumatic actuators and precision tools â€” ensuring consistent air quality across all manufacturing process systems.'},
              {label:'SINTRAXâ„¢ / LUBE', title:'GEARBOX DEFENSE', desc:'Captures wear-inducing metal particles in heavy industrial drives and gearboxes â€” extending lubricant life and protecting critical rotating machinery components.'},
              {label:'COOLTECHâ„¢ / COOLANT', title:'THERMAL STABILITY', desc:'Prevents scaling and corrosion to ensure thermal stability in critical cooling circuits â€” maintaining process temperatures and protecting heat exchanger integrity.'},
              {label:'MACROCOREâ„¢ / EMISSIONS', title:'AIR QUALITY', desc:'High-efficiency dust collection and air filtration protects operational personnel and maintains workplace air quality standards in industrial manufacturing environments.'},
              {label:'NANOFORCEâ„¢ / PROCESS', title:'MACHINING CONSISTENCY', desc:'Maintains coolant integrity and dimensional precision of manufactured parts â€” protecting CNC machining centers and precision manufacturing processes from fluid contamination.'},
            ].map((f, i) => (
              <div key={i} className="mf-feature">
                <div className="mf-feature-label">{f.label}</div>
                <div className="mf-feature-title">{f.title}</div>
                <p className="mf-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mf-human">
        <div className="mf-human-inner">
          <div>
            <div className="mf-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="mf-sh2">PROTECTING <span>OPERATIONS</span></h2>
            <p className="mf-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Industrial systems sustain supply chains. Our engineering protects equipment, operators, and the continuity of the production environment.</p>
          </div>
          <div className="mf-env">
            <p className="mf-env-p">Cleaner fluids improve energy efficiency and reduce waste â€” contributing to a more sustainable and responsible manufacturing model that protects both operations and the environment.</p>
            <div className="mf-env-strong">From machine precision to environmental responsibility â€” protection is non-negotiable.</div>
          </div>
        </div>
      </section>

      <section className="mf-cta">
        <div className="mf-cta-inner">
          <div className="mf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// PRODUCTION CONTINUITY</div>
          <div className="mf-cta-h2">EVERY SHIFT. EVERY CYCLE.</div>
          <div className="mf-cta-h2"><span>FAILURE IS NOT AN OPTION.</span></div>
          <Link href="/search" className="mf-btn" style={{marginTop:'40px',display:'inline-block'}}>SEARCH BY OEM / CROSS REFERENCE &rarr;</Link>
        </div>
      </section>
    </div>
  );
}

