'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function PowerGeneration() {
  const css = `
    .pg{background:#000;color:#fff;min-height:100vh;}
    .pg-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .pg-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .pg-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/power-generation.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .pg-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .pg-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .pg-h1 span{color:#FFF12D;}
    .pg-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .pg-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-sec-inner{max-width:1400px;margin:0 auto;}
    .pg-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .pg-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .pg-sh2 span{color:#FFF12D;}
    .pg-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .pg-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .pg-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .pg-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .pg-video-wrap{position:relative;}
    .pg-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .pg-video-wrap:hover:before{opacity:0.5;}
    .pg-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .pg-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .pg-video-wrap:hover .pg-video-inner video{filter:grayscale(0);opacity:1;}
    .pg-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .pg-btn:hover{background:#fff;}
    .pg-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .pg-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .pg-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .pg-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .pg-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .pg-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .pg-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .pg-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .pg-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .pg-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .pg-cta{background:#FFF12D;padding:72px 6%;}
    .pg-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .pg-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .pg-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .pg-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .pg-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .pg-cta-btn:hover{background:#111;}
    .pg-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.pg-grid2{grid-template-columns:1fr;} .pg-grid3{grid-template-columns:repeat(2,1fr);} .pg-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.pg-grid3{grid-template-columns:1fr;} .pg-hero-p{font-size:12px;} .pg-cta-inner{flex-direction:column;} .pg-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="pg">
      <style>{css}</style>
      <a href="/" className="pg-back">&larr; HOME</a>

      <section className="pg-hero">
        <div className="pg-hero-inner">
          <div className="pg-eyebrow">// STRATEGIC POWER PROTECTION</div>
          <h1 className="pg-h1">POWER<br /><span>GENERATION CONTINUITY</span></h1>
          <p className="pg-hero-p">Industrial asset protection systems engineered for power generation facilities, turbine operations, and critical electrical infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from power-plant contamination – extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across power generation operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="pg-sec" style={{background:'#050505'}}>
        <div className="pg-sec-inner">
          <div className="pg-grid2">
            <div>
              <div className="pg-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="pg-sh2">GENERATION RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="pg-p">Power generation systems face demanding conditions: continuous operation, high temperature cycles, and critical uptime requirements. Our high-capacity filtration technologies are engineered for durability, fuel cleanliness, and extended intervals – keeping generation facilities running and power flowing worldwide.</p>
              <p className="pg-p">Operational uptime protects power supply, revenue, and electrical grid stability across all generation operations.</p>
              <div className="pg-tech-grid">
                <div><div className="pg-tech-label">FUEL SYSTEMS</div><div className="pg-tech-val">AQUAGUARD™</div></div>
                <div><div className="pg-tech-label">LUBRICATION</div><div className="pg-tech-val">SINTRAX™</div></div>
                <div><div className="pg-tech-label">HYDRAULICS</div><div className="pg-tech-val">NANOFORCE™</div></div>
                <div><div className="pg-tech-label">AIR INTAKE</div><div className="pg-tech-val">MACROCORE™</div></div>
              </div>
              <Link href="/technologies" className="pg-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="pg-video-wrap">
              <div className="pg-video-inner">
                <video src={`${WP}/2025/08/power-operations.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pg-sec" style={{background:'#000'}}>
        <div className="pg-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="pg-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FACILITY PROTECTION SYSTEMS</div>
            <h2 className="pg-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="pg-grid3">
            {[
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Advanced water separation and contamination removal for power plant fuel systems – protecting Common Rail injection systems in continuous operation.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Maintains oil viscosity and cleanliness under continuous high-temperature power generation duty – extending equipment life in generation facilities.'},
              {label:'Hydraulic Systems', title:'NANOFORCE™', desc:'Precision stability for hydraulic systems operating under continuous generation duty – protecting control systems and turbine equipment from contamination.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Protection against industrial particulate contamination in power plants – maintaining engine air quality in generation facilities.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Thermal protection for power generation cooling circuits – preventing scale buildup and corrosion in critical high-duty cooling systems.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Moisture elimination from pneumatic controls and safety systems – ensuring safety and reliability across all power generation operations.'},
            ].map((c, i) => (
              <div key={i} className="pg-card">
                <div className="pg-card-label">{c.label}</div>
                <div className="pg-card-title">{c.title}</div>
                <p className="pg-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-human">
        <div className="pg-human-inner">
          <div>
            <div className="pg-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="pg-sh2">PROTECTING <span>POWER OPERATIONS</span></h2>
            <p className="pg-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Power generation sustains societies. Protection ensures operational continuity and the reliability of electrical systems worldwide.</p>
          </div>
          <div className="pg-env">
            <p className="pg-env-p">Cleaner combustion and optimized fluid systems reduce emissions and environmental impact – contributing to sustainable power generation that protects both the environment and community health.</p>
            <div className="pg-env-strong">From generation to distribution: protection is mission-critical.</div>
          </div>
        </div>
      </section>

      <section className="pg-cta">
        <div className="pg-cta-inner">
          <div>
            <div className="pg-cta-label">// POWER GENERATION CROSS REFERENCE</div>
            <div className="pg-cta-h2">FACILITY UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="pg-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your facility. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="pg-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="pg-cta-footer">POWER GENERATION PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
