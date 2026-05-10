'use client';
import Link from 'next/link';

const WP = 'https://media.elimfilters.com/wp-content/uploads';

export default function TrucksFleets() {
  const css = `
    .tf{background:#000;color:#fff;min-height:100vh;}
    .tf-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .tf-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .tf-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/trucks-fleets.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .tf-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .tf-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .tf-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .tf-h1 span{color:#FFF12D;}
    .tf-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .tf-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .tf-sec-inner{max-width:1400px;margin:0 auto;}
    .tf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .tf-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .tf-sh2 span{color:#FFF12D;}
    .tf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .tf-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .tf-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .tf-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .tf-video-wrap{position:relative;}
    .tf-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .tf-video-wrap:hover:before{opacity:0.5;}
    .tf-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .tf-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .tf-video-wrap:hover .tf-video-inner video{filter:grayscale(0);opacity:1;}
    .tf-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .tf-btn:hover{background:#fff;}
    .tf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .tf-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .tf-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .tf-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .tf-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .tf-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .tf-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .tf-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .tf-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .tf-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .tf-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .tf-cta{background:#FFF12D;padding:72px 6%;}
    .tf-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .tf-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .tf-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .tf-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .tf-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .tf-cta-btn:hover{background:#111;}
    .tf-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.tf-grid2{grid-template-columns:1fr;} .tf-grid3{grid-template-columns:repeat(2,1fr);} .tf-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.tf-grid3{grid-template-columns:1fr;} .tf-hero-p{font-size:12px;} .tf-cta-inner{flex-direction:column;} .tf-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="tf">
      <style>{css}</style>
      <a href="/" className="tf-back">&larr; HOME</a>

      <section className="tf-hero">
        <div className="tf-hero-inner">
          <div className="tf-eyebrow">// STRATEGIC COMMERCIAL PROTECTION</div>
          <h1 className="tf-h1">TRUCKS & FLEETS<br /><span>OPERATION CONTINUITY</span></h1>
          <p className="tf-hero-p">Industrial asset protection systems engineered for commercial trucks, heavy haul fleets, and critical diesel-powered transportation infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from road and operational contamination – extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across commercial operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="tf-sec" style={{background:'#050505'}}>
        <div className="tf-sec-inner">
          <div className="tf-grid2">
            <div>
              <div className="tf-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="tf-sh2">COMMERCIAL RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="tf-p">Commercial fleets face relentless conditions: continuous operation, heavy loads, and demanding maintenance schedules. Our high-capacity filtration technologies are engineered for durability, fuel cleanliness, and extended intervals – keeping fleets on the road and productivity flowing.</p>
              <p className="tf-p">Operational uptime protects revenue, schedules, and commercial profitability across all transportation operations worldwide.</p>
              <div className="tf-tech-grid">
                <div><div className="tf-tech-label">FUEL SYSTEMS</div><div className="tf-tech-val">AQUAGUARD™</div></div>
                <div><div className="tf-tech-label">LUBRICATION</div><div className="tf-tech-val">SINTRAX™</div></div>
                <div><div className="tf-tech-label">HYDRAULICS</div><div className="tf-tech-val">NANOFORCE™</div></div>
                <div><div className="tf-tech-label">AIR INTAKE</div><div className="tf-tech-val">MACROCORE™</div></div>
              </div>
              <Link href="/technologies" className="tf-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="tf-video-wrap">
              <div className="tf-video-inner">
                <video src={`${WP}/2025/08/fleet-operations.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tf-sec" style={{background:'#000'}}>
        <div className="tf-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="tf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FLEET PROTECTION SYSTEMS</div>
            <h2 className="tf-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="tf-grid3">
            {[
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Advanced water separation and contamination removal for commercial diesel fuel systems – protecting Common Rail injection systems across continuous long-haul operations.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Maintains oil viscosity and cleanliness under continuous heavy-haul duty cycles – extending engine life in commercial and heavy truck fleets.'},
              {label:'Hydraulic Systems', title:'NANOFORCE™', desc:'Precision stability for hydraulic systems operating under continuous commercial duty – protecting brake systems and control equipment from contamination.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Protection against road dust and environmental particulate contamination – maintaining engine air quality across all highway driving conditions.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Thermal protection for truck and fleet cooling circuits – preventing scale buildup and corrosion in high-duty commercial engine cooling systems.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Moisture elimination from pneumatic brakes and controls – ensuring safety and reliability across all commercial vehicle operations.'},
            ].map((c, i) => (
              <div key={i} className="tf-card">
                <div className="tf-card-label">{c.label}</div>
                <div className="tf-card-title">{c.title}</div>
                <p className="tf-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tf-human">
        <div className="tf-human-inner">
          <div>
            <div className="tf-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="tf-sh2">PROTECTING <span>COMMERCIAL OPERATIONS</span></h2>
            <p className="tf-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Commercial fleets drive economies. Protection ensures operational continuity and the profitability of transportation operations worldwide.</p>
          </div>
          <div className="tf-env">
            <p className="tf-env-p">Cleaner combustion and optimized fluid systems reduce emissions, improve fuel efficiency, and contribute to cleaner air quality – protecting both the environment and commercial economics.</p>
            <div className="tf-env-strong">From local routes to international logistics: protection is mission-critical.</div>
          </div>
        </div>
      </section>

      <section className="tf-cta">
        <div className="tf-cta-inner">
          <div>
            <div className="tf-cta-label">// TRUCKS & FLEETS CROSS REFERENCE</div>
            <div className="tf-cta-h2">FLEET UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="tf-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your fleet. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="tf-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="tf-cta-footer">TRUCKS & FLEETS PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
