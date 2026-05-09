'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Construction() {
  const css = `
    .cn{background:#000;color:#fff;min-height:100vh;}
    .cn-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .cn-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .cn-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/excavadora.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cn-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .cn-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .cn-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .cn-h1 span{color:#FFF12D;}
    .cn-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .cn-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cn-sec-inner{max-width:1400px;margin:0 auto;}
    .cn-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .cn-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .cn-sh2 span{color:#FFF12D;}
    .cn-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .cn-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .cn-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .cn-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .cn-video-wrap{position:relative;}
    .cn-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .cn-video-wrap:hover:before{opacity:0.5;}
    .cn-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .cn-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .cn-video-wrap:hover .cn-video-inner video{filter:grayscale(0);opacity:1;}
    .cn-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .cn-btn:hover{background:#fff;}
    .cn-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .cn-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .cn-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .cn-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .cn-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .cn-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .cn-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cn-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .cn-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .cn-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .cn-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .cn-cta{background:#FFF12D;padding:72px 6%;}
    .cn-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .cn-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .cn-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .cn-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .cn-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .cn-cta-btn:hover{background:#111;}
    .cn-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.cn-grid2{grid-template-columns:1fr;} .cn-grid3{grid-template-columns:repeat(2,1fr);} .cn-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.cn-grid3{grid-template-columns:1fr;} .cn-hero-p{font-size:12px;} .cn-cta-inner{flex-direction:column;} .cn-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="cn">
      <style>{css}</style>
      <a href="/" className="cn-back">&larr; HOME</a>

      <section className="cn-hero">
        <div className="cn-hero-inner">
          <div className="cn-eyebrow">// STRATEGIC CONSTRUCTION PROTECTION</div>
          <h1 className="cn-h1">CONSTRUCTION<br /><span>ASSET CONTINUITY</span></h1>
          <p className="cn-hero-p">Industrial asset protection systems engineered for earthmoving equipment, heavy construction fleets, and critical diesel-powered machinery. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from abrasive contamination – extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across construction operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="cn-sec" style={{background:'#050505'}}>
        <div className="cn-sec-inner">
          <div className="cn-grid2">
            <div>
              <div className="cn-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="cn-sh2">SITE RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="cn-p">Construction equipment faces intense challenges: extreme abrasion from mineral dust, heavy loads, and continuous operation in harsh environments. Our high-capacity filtration technologies are engineered for durability, fuel cleanliness, and extended intervals – keeping machinery on-site and operational.</p>
              <p className="cn-p">Project economics depend on uptime. Engineered protection ensures equipment reliability, minimizes maintenance costs, and protects operational continuity across all construction operations worldwide.</p>
              <div className="cn-tech-grid">
                <div><div className="cn-tech-label">AIR INTAKE</div><div className="cn-tech-val">MACROCORE™</div></div>
                <div><div className="cn-tech-label">HYDRAULICS</div><div className="cn-tech-val">NANOFORCE™</div></div>
                <div><div className="cn-tech-label">FUEL SYSTEM</div><div className="cn-tech-val">AQUAGUARD™</div></div>
                <div><div className="cn-tech-label">LUBRICATION</div><div className="cn-tech-val">SINTRAX™</div></div>
              </div>
              <Link href="/technologies" className="cn-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="cn-video-wrap">
              <div className="cn-video-inner">
                <video src={`${WP}/2025/08/51102-463106269_medium.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cn-sec" style={{background:'#000'}}>
        <div className="cn-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="cn-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// MACHINERY PROTECTION SYSTEMS</div>
            <h2 className="cn-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="cn-grid3">
            {[
              {label:'Air Module', title:'MACROCORE™', desc:'Maximum particle retention in high-abrasion zones where silica dust is extreme – protecting engine cylinders and turbochargers from premature wear.'},
              {label:'Hydraulic Module', title:'NANOFORCE™', desc:'Precision stability for hydraulic systems under extreme pressure spikes and high duty cycles – protecting control valves and actuators from contamination damage.'},
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Hydrophobic protection against poor quality field fuel and injector corrosion on construction sites – ensuring pure fuel delivery to Common Rail injection systems.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Maintains oil viscosity and cleanliness under severe thermal stress and heavy loads – extending equipment life and reducing maintenance frequency significantly.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Thermal protection for heavy equipment cooling circuits – preventing cavitation and scale buildup in high-load diesel engine cooling systems.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Moisture elimination from air brake systems and pneumatic controls – ensuring reliability across all equipment platforms in harsh construction environments.'},
            ].map((c, i) => (
              <div key={i} className="cn-card">
                <div className="cn-card-label">{c.label}</div>
                <div className="cn-card-title">{c.title}</div>
                <p className="cn-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cn-human">
        <div className="cn-human-inner">
          <div>
            <div className="cn-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="cn-sh2">PROTECTING <span>CONSTRUCTION OPERATIONS</span></h2>
            <p className="cn-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Site uptime equals project profitability. Protection ensures equipment performance and the continuity of construction operations worldwide.</p>
          </div>
          <div className="cn-env">
            <p className="cn-env-p">Cleaner combustion and optimized fluid systems reduce emissions, improve fuel efficiency, and contribute to sustainable construction practices – protecting both the environment and project economics.</p>
            <div className="cn-env-strong">From excavation to completion: protection is mission-critical.</div>
          </div>
        </div>
      </section>

      <section className="cn-cta">
        <div className="cn-cta-inner">
          <div>
            <div className="cn-cta-label">// CONSTRUCTION CROSS REFERENCE</div>
            <div className="cn-cta-h2">ELIMINATE PROJECT DELAYS.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="cn-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your equipment. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="cn-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="cn-cta-footer">CONSTRUCTION PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
