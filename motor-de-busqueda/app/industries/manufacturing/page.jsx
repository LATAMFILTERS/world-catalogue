'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Manufacturing() {
  const css = `
    .mf{background:#000;color:#fff;min-height:100vh;}
    .mf-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mf-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mf-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mf-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mf-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mf-h1 span{color:#FFF12D;}
    .mf-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mf-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-sec-inner{max-width:1400px;margin:0 auto;}
    .mf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mf-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mf-sh2 span{color:#FFF12D;}
    .mf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mf-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .mf-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .mf-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .mf-video-wrap{position:relative;}
    .mf-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .mf-video-wrap:hover:before{opacity:0.5;}
    .mf-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .mf-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .mf-video-wrap:hover .mf-video-inner video{filter:grayscale(0);opacity:1;}
    .mf-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .mf-btn:hover{background:#fff;}
    .mf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mf-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .mf-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .mf-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mf-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mf-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mf-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mf-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .mf-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mf-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .mf-cta{background:#FFF12D;padding:72px 6%;}
    .mf-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .mf-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .mf-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .mf-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .mf-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .mf-cta-btn:hover{background:#111;}
    .mf-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.mf-grid2{grid-template-columns:1fr;} .mf-grid3{grid-template-columns:repeat(2,1fr);} .mf-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.mf-grid3{grid-template-columns:1fr;} .mf-hero-p{font-size:12px;} .mf-cta-inner{flex-direction:column;} .mf-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mf">
      <style>{css}</style>
      <a href="/" className="mf-back">&larr; HOME</a>

      <section className="mf-hero">
        <div className="mf-hero-inner">
          <div className="mf-eyebrow">// STRATEGIC MANUFACTURING PROTECTION</div>
          <h1 className="mf-h1">MANUFACTURING<br /><span>PRODUCTION CONTINUITY</span></h1>
          <p className="mf-hero-p">Industrial asset protection systems engineered for manufacturing plants, process equipment, and critical industrial infrastructure. Our filtration technology shields hydraulic circuits, compressed air systems, lubrication lines, and cooling circuits from contamination – extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mf-sec" style={{background:'#050505'}}>
        <div className="mf-sec-inner">
          <div className="mf-grid2">
            <div>
              <div className="mf-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="mf-sh2">PLANT RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="mf-p">Manufacturing systems face unique challenges: continuous duty cycles, precision requirements, and multiple fluid systems running simultaneously. Our high-capacity filtration technologies are engineered for durability, fluid cleanliness, and extended intervals – keeping lines running and production flowing.</p>
              <p className="mf-p">Production continuity protects schedules, revenue, and operational competitiveness across all manufacturing operations worldwide.</p>
              <div className="mf-tech-grid">
                <div><div className="mf-tech-label">HYDRAULICS</div><div className="mf-tech-val">NANOFORCE™</div></div>
                <div><div className="mf-tech-label">COMPRESSED AIR</div><div className="mf-tech-val">MACROCORE™</div></div>
                <div><div className="mf-tech-label">LUBRICATION</div><div className="mf-tech-val">SINTRAX™</div></div>
                <div><div className="mf-tech-label">COOLING</div><div className="mf-tech-val">COOLTECH™</div></div>
              </div>
              <Link href="/technologies" className="mf-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="mf-video-wrap">
              <div className="mf-video-inner">
                <video src={`${WP}/2025/08/20250807_2255_Slow-Motion-Conveyor_simple_compose_01k23x2xaxe78b3h6m0dbxvyxm.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mf-sec" style={{background:'#000'}}>
        <div className="mf-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FACILITY PROTECTION SYSTEMS</div>
            <h2 className="mf-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="mf-grid3">
            {[
              {label:'Hydraulic Module', title:'NANOFORCE™', desc:'Maintains ISO cleanliness codes for proportional valves and servo systems – protecting hydraulic actuators and precision control circuits from contamination damage.'},
              {label:'Pneumatic Module', title:'MACROCORE™', desc:'Eliminates oil mist and water vapor to protect pneumatic actuators and precision tools – ensuring consistent air quality across all manufacturing systems.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Captures wear-inducing metal particles in heavy industrial drives and gearboxes – extending lubricant life and protecting critical rotating machinery.'},
              {label:'Cooling Module', title:'COOLTECH™', desc:'Prevents scaling and corrosion to ensure thermal stability in critical cooling circuits – maintaining process temperatures and protecting heat exchangers.'},
              {label:'Air Quality', title:'SYNTEPORE™', desc:'High-efficiency dust collection and air filtration protects operational personnel and maintains workplace air quality standards in manufacturing environments.'},
              {label:'Process Fluids', title:'AQUAGUARD™', desc:'Maintains coolant integrity and dimensional precision of manufactured parts – protecting CNC machining centers and precision processes from fluid contamination.'},
            ].map((c, i) => (
              <div key={i} className="mf-card">
                <div className="mf-card-label">{c.label}</div>
                <div className="mf-card-title">{c.title}</div>
                <p className="mf-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mf-human">
        <div className="mf-human-inner">
          <div>
            <div className="mf-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="mf-sh2">PROTECTING <span>INDUSTRIAL OPERATIONS</span></h2>
            <p className="mf-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Manufacturing sustains economies. Protection ensures equipment performance and the continuity of production operations worldwide.</p>
          </div>
          <div className="mf-env">
            <p className="mf-env-p">Cleaner fluids improve energy efficiency and reduce waste – contributing to a more sustainable manufacturing model that protects both operations and the environment.</p>
            <div className="mf-env-strong">From production lines to environmental responsibility: protection is mission-critical.</div>
          </div>
        </div>
      </section>

      <section className="mf-cta">
        <div className="mf-cta-inner">
          <div>
            <div className="mf-cta-label">// MANUFACTURING CROSS REFERENCE</div>
            <div className="mf-cta-h2">PRODUCTION UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="mf-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your systems. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="mf-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="mf-cta-footer">MANUFACTURING PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
