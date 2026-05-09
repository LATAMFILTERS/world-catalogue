'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Railway() {
  const css = `
    .ry{background:#000;color:#fff;min-height:100vh;}
    .ry-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ry-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ry-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/train-3895307_1920.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ry-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ry-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ry-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ry-h1 span{color:#FFF12D;}
    .ry-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ry-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ry-sec-inner{max-width:1400px;margin:0 auto;}
    .ry-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ry-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ry-sh2 span{color:#FFF12D;}
    .ry-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ry-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .ry-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .ry-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .ry-video-wrap{position:relative;}
    .ry-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .ry-video-wrap:hover:before{opacity:0.5;}
    .ry-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .ry-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .ry-video-wrap:hover .ry-video-inner video{filter:grayscale(0);opacity:1;}
    .ry-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .ry-btn:hover{background:#fff;}
    .ry-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ry-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .ry-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .ry-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ry-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .ry-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ry-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ry-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ry-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .ry-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ry-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .ry-cta{background:#FFF12D;padding:72px 6%;}
    .ry-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .ry-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .ry-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .ry-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .ry-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .ry-cta-btn:hover{background:#111;}
    .ry-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.ry-grid2{grid-template-columns:1fr;} .ry-grid3{grid-template-columns:repeat(2,1fr);} .ry-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.ry-grid3{grid-template-columns:1fr;} .ry-hero-p{font-size:12px;} .ry-cta-inner{flex-direction:column;} .ry-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ry">
      <style>{css}</style>
      <a href="/" className="ry-back">&larr; HOME</a>

      <section className="ry-hero">
        <div className="ry-hero-inner">
          <div className="ry-eyebrow">// STRATEGIC HEAVY MOBILITY</div>
          <h1 className="ry-h1">RAILWAY<br /><span>UNINTERRUPTED POWER</span></h1>
          <p className="ry-hero-p">Industrial asset protection systems engineered for diesel-electric locomotives, rolling stock, and critical railway infrastructure. Our filtration technology shields fuel systems, lubrication circuits, air intake systems, and water separation units from contamination â€” extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across freight and passenger rail operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ry-sec" style={{background:'#050505'}}>
        <div className="ry-sec-inner">
          <div className="ry-grid2">
            <div>
              <div className="ry-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="ry-sh2">TRACKSIDE AVAILABILITY<br /><span>ENGINEERED</span></h2>
              <p className="ry-p">Railway systems operate under high vibration and heavy loads across extreme service cycles. Our high-capacity filtration technologies are engineered for durability, fuel cleanliness, and extended intervals â€” keeping locomotives on the track and cargo moving.</p>
              <p className="ry-p">Rail infrastructure connects economies. Reliability protects equipment, cargo, and the continuity of national supply chains across freight and passenger operations worldwide.</p>
              <div className="ry-tech-grid">
                <div><div className="ry-tech-label">FUEL SYSTEMS</div><div className="ry-tech-val">SYNTEPORE™</div></div>
                <div><div className="ry-tech-label">LUBRICATION</div><div className="ry-tech-val">SINTRAX™</div></div>
                <div><div className="ry-tech-label">WATER SEPARATION</div><div className="ry-tech-val">AQUAGUARD™</div></div>
                <div><div className="ry-tech-label">AIR INTAKE</div><div className="ry-tech-val">MACROCORE™</div></div>
              </div>
              <Link href="/technologies" className="ry-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="ry-video-wrap">
              <div className="ry-video-inner">
                <video src={`${WP}/2025/08/6613634-uhd_3840_2160_25fps.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ry-sec" style={{background:'#000'}}>
        <div className="ry-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ry-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// RAIL DEFENSE SYSTEMS</div>
            <h2 className="ry-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="ry-grid3">
            {[
              {label:'Fuel Module', title:'SYNTEPORE™', desc:'Clean combustion and torque stability for high-horsepower freight locomotives across extreme duty cycles â€” protecting Common Rail injection systems from fuel contamination.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'High-flow oil filtration designed for extended intervals and soot control in heavy-duty locomotive engines â€” maintaining oil cleanliness across long-haul operations.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Protection against ballast dust and metallic particles with zero-bypass radial seal technology â€” maintaining engine air quality across all railway operating environments.'},
              {label:'Water Separation', title:'AQUAGUARD™', desc:'Advanced hydrophobic separation eliminates water contamination from locomotive fuel systems â€” protecting injection components during all-weather railway operations.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Moisture elimination from air brake systems and pneumatic controls â€” ensuring full braking reliability and pneumatic safety across all locomotive and rolling stock platforms.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Thermal protection for locomotive cooling circuits â€” preventing cavitation and scale buildup in high-horsepower diesel-electric engine cooling systems worldwide.'},
            ].map((c, i) => (
              <div key={i} className="ry-card">
                <div className="ry-card-label">{c.label}</div>
                <div className="ry-card-title">{c.title}</div>
                <p className="ry-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ry-human">
        <div className="ry-human-inner">
          <div>
            <div className="ry-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="ry-sh2">PROTECTING <span>CRITICAL MOBILITY</span></h2>
            <p className="ry-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Rail infrastructure connects economies. Reliability protects equipment, cargo, and the continuity of national supply chains worldwide.</p>
          </div>
          <div className="ry-env">
            <p className="ry-env-p">Cleaner combustion and optimized fluid systems reduce emissions, improve fuel efficiency, and contribute to sustainable transportation networks â€” protecting both the environment and operational economics.</p>
            <div className="ry-env-strong">From locomotives to logistics corridors: protection is mission-critical.</div>
          </div>
        </div>
      </section>

      <section className="ry-cta">
        <div className="ry-cta-inner">
          <div>
            <div className="ry-cta-label">// RAILWAY CROSS REFERENCE</div>
            <div className="ry-cta-h2">FAILURE IS NOT AN OPTION.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="ry-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for railway operations. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="ry-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="ry-cta-footer">RAILWAY PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}

