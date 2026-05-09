'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Automotive() {
  const css = `
    .au{background:#000;color:#fff;min-height:100vh;}
    .au-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .au-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .au-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2026/04/pexels-mohit-hambiria-92377455-31396372-scaled.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .au-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .au-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .au-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .au-h1 span{color:#FFF12D;}
    .au-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .au-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .au-sec-inner{max-width:1400px;margin:0 auto;}
    .au-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .au-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .au-sh2 span{color:#FFF12D;}
    .au-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .au-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .au-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .au-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .au-video-wrap{position:relative;}
    .au-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .au-video-wrap:hover:before{opacity:0.5;}
    .au-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .au-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .au-video-wrap:hover .au-video-inner video{filter:grayscale(0);opacity:1;}
    .au-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .au-btn:hover{background:#fff;}
    .au-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .au-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .au-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .au-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .au-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .au-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .au-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .au-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .au-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .au-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .au-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .au-cta{background:#FFF12D;padding:72px 6%;}
    .au-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .au-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .au-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .au-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .au-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .au-cta-btn:hover{background:#111;}
    .au-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.au-grid2{grid-template-columns:1fr;} .au-grid3{grid-template-columns:repeat(2,1fr);} .au-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.au-grid3{grid-template-columns:1fr;} .au-hero-p{font-size:12px;} .au-cta-inner{flex-direction:column;} .au-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="au">
      <style>{css}</style>
      <a href="/" className="au-back">&larr; HOME</a>

      <section className="au-hero">
        <div className="au-hero-inner">
          <div className="au-eyebrow">// STRATEGIC VEHICLE PROTECTION</div>
          <h1 className="au-h1">AUTOMOTIVE<br /><span>PRECISION ENGINEERED</span></h1>
          <p className="au-hero-p">Industrial asset protection systems engineered for passenger vehicles, light commercial fleets, and critical gasoline-powered infrastructure. Our filtration technology shields air intake systems, fuel circuits, lubrication lines, and cabin environments from contamination – extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="au-sec" style={{background:'#050505'}}>
        <div className="au-sec-inner">
          <div className="au-grid2">
            <div>
              <div className="au-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="au-sh2">URBAN RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="au-p">Passenger vehicles face unique challenges: frequent cold starts, heavy traffic cycles, and severe contamination in urban environments. Our high-capacity filtration technologies are engineered for durability, fuel cleanliness, and extended intervals – keeping vehicles on the road and performing optimally.</p>
              <p className="au-p">Vehicle reliability protects investment, minimizes maintenance, and ensures operational continuity across all driving conditions worldwide.</p>
              <div className="au-tech-grid">
                <div><div className="au-tech-label">AIR INTAKE</div><div className="au-tech-val">MACROCORE™</div></div>
                <div><div className="au-tech-label">LUBRICATION</div><div className="au-tech-val">SINTRAX™</div></div>
                <div><div className="au-tech-label">FUEL SYSTEM</div><div className="au-tech-val">NANOFORCE™</div></div>
                <div><div className="au-tech-label">CABIN AIR</div><div className="au-tech-val">MICROKAPPA™</div></div>
              </div>
              <Link href="/technologies" className="au-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="au-video-wrap">
              <div className="au-video-inner">
                <video src={`${WP}/2025/08/5309381-hd_1920_1080_25fps.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="au-sec" style={{background:'#000'}}>
        <div className="au-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="au-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// VEHICLE PROTECTION SYSTEMS</div>
            <h2 className="au-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="au-grid3">
            {[
              {label:'Air Module', title:'MACROCORE™', desc:'Absolute capture of microscopic particles ensuring perfect combustion and maximum engine protection across all urban driving conditions.'},
              {label:'Oil Module', title:'SINTRAX™', desc:'Maintains oil viscosity and cleanliness under severe thermal stress in city environments – extending engine life and reducing maintenance costs.'},
              {label:'Fuel Module', title:'NANOFORCE™', desc:'Nanofiber technology designed to eliminate critical contaminants and water in injection systems – protecting Common Rail injectors from premature wear.'},
              {label:'Cabin Air', title:'MICROKAPPA™', desc:'Biological and chemical barrier against allergens and pollutants from urban exhaust – safeguarding occupant health in all weather conditions.'},
              {label:'Water Separation', title:'AQUAGUARD™', desc:'Advanced hydrophobic separation eliminates water contamination from fuel systems – protecting injection components during all driving seasons.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Thermal protection for vehicle cooling circuits – preventing cavitation and scale buildup in high-performance engine cooling systems worldwide.'},
            ].map((c, i) => (
              <div key={i} className="au-card">
                <div className="au-card-label">{c.label}</div>
                <div className="au-card-title">{c.title}</div>
                <p className="au-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="au-human">
        <div className="au-human-inner">
          <div>
            <div className="au-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="au-sh2">PROTECTING <span>VEHICLE PERFORMANCE</span></h2>
            <p className="au-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Vehicle reliability depends on filtration. Protection ensures performance, safety, and operational continuity in all driving conditions worldwide.</p>
          </div>
          <div className="au-env">
            <p className="au-env-p">Cleaner combustion and optimized fluid systems reduce emissions, improve fuel efficiency, and contribute to cleaner air quality – protecting both the environment and vehicle economics.</p>
            <div className="au-env-strong">From daily commutes to commercial operations: protection is mission-critical.</div>
          </div>
        </div>
      </section>

      <section className="au-cta">
        <div className="au-cta-inner">
          <div>
            <div className="au-cta-label">// AUTOMOTIVE CROSS REFERENCE</div>
            <div className="au-cta-h2">PERFORMANCE NEVER STOPS.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="au-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your vehicle. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="au-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="au-cta-footer">AUTOMOTIVE PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
