'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function BusCoach() {
  const css = `
    .bc{background:#000;color:#fff;min-height:100vh;}
    .bc-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .bc-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .bc-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/ChatGPT-Image-7-ago-2025-05_57_57-p.m.webp') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .bc-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .bc-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .bc-h1 span{color:#FFF12D;}
    .bc-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .bc-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-sec-inner{max-width:1400px;margin:0 auto;}
    .bc-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .bc-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .bc-sh2 span{color:#FFF12D;}
    .bc-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .bc-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .bc-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .bc-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .bc-video-wrap{position:relative;}
    .bc-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .bc-video-wrap:hover:before{opacity:0.5;}
    .bc-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .bc-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .bc-video-wrap:hover .bc-video-inner video{filter:grayscale(0);opacity:1;}
    .bc-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .bc-btn:hover{background:#fff;}
    .bc-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .bc-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .bc-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .bc-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .bc-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .bc-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .bc-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .bc-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .bc-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .bc-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .bc-cta{background:#FFF12D;padding:72px 6%;}
    .bc-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .bc-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .bc-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .bc-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .bc-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .bc-cta-btn:hover{background:#111;}
    .bc-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.bc-grid2{grid-template-columns:1fr;} .bc-grid3{grid-template-columns:repeat(2,1fr);} .bc-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.bc-grid3{grid-template-columns:1fr;} .bc-hero-p{font-size:12px;} .bc-cta-inner{flex-direction:column;} .bc-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="bc">
      <style>{css}</style>
      <a href="/" className="bc-back">&larr; HOME</a>

      <section className="bc-hero">
        <div className="bc-hero-inner">
          <div className="bc-eyebrow">// STRATEGIC FLEET PROTECTION</div>
          <h1 className="bc-h1">BUS & COACH<br /><span>OPERATIONAL CONTINUITY</span></h1>
          <p className="bc-hero-p">Industrial asset protection systems engineered for mass transit fleets, bus operations, and critical diesel-powered urban infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, air intake systems, and pneumatic brake circuits from contamination – extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across urban transport operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="bc-sec" style={{background:'#050505'}}>
        <div className="bc-sec-inner">
          <div className="bc-grid2">
            <div>
              <div className="bc-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="bc-sh2">FLEET RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="bc-p">Mass transit systems operate under intense stop-and-go cycles and extended service hours. Our high-capacity filtration technologies are engineered for durability, fuel cleanliness, and extended intervals – keeping buses on schedule and protecting passenger safety.</p>
              <p className="bc-p">Urban mobility depends on reliability. Engineered protection ensures equipment performance, route continuity, and operational economics across all transit operations worldwide.</p>
              <div className="bc-tech-grid">
                <div><div className="bc-tech-label">AIR INTAKE</div><div className="bc-tech-val">MACROCORE™</div></div>
                <div><div className="bc-tech-label">LUBRICATION</div><div className="bc-tech-val">SINTRAX™</div></div>
                <div><div className="bc-tech-label">FUEL SYSTEM</div><div className="bc-tech-val">NANOFORCE™</div></div>
                <div><div className="bc-tech-label">BRAKING</div><div className="bc-tech-val">DRYCORE™</div></div>
              </div>
              <Link href="/technologies" className="bc-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="bc-video-wrap">
              <div className="bc-video-inner">
                <video src="https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/buses.mp4" autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bc-sec" style={{background:'#000'}}>
        <div className="bc-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="bc-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FLEET PROTECTION SYSTEMS</div>
            <h2 className="bc-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="bc-grid3">
            {[
              {label:'Air Module', title:'MACROCORE™', desc:'Optimized for urban environments with high concentrations of micro-particulates and industrial pollutants – protecting engines in the most demanding city driving conditions.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Maintains oil viscosity and cleanliness under severe thermal stress in intensive stop-and-go transit operations – extending engine life and reducing maintenance costs.'},
              {label:'Fuel Module', title:'NANOFORCE™', desc:'Maximum water separation and particulate removal to protect Common Rail injection systems during intensive daily operation across mass transit fleets worldwide.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Advanced air drying to prevent moisture corrosion in critical braking valves – ensuring constant safety and reliable pneumatic brake response in all conditions.'},
              {label:'Hydraulic Systems', title:'AQUAGUARD™', desc:'Protection for hydrostatic transmissions and control systems operating under continuous high-load conditions in urban driving cycles.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Thermal protection for bus and coach cooling circuits – preventing cavitation and scale buildup in high-load diesel engine cooling systems worldwide.'},
            ].map((c, i) => (
              <div key={i} className="bc-card">
                <div className="bc-card-label">{c.label}</div>
                <div className="bc-card-title">{c.title}</div>
                <p className="bc-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bc-human">
        <div className="bc-human-inner">
          <div>
            <div className="bc-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="bc-sh2">PROTECTING <span>URBAN MOBILITY</span></h2>
            <p className="bc-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Transit reliability protects passengers, routes, and the continuity of urban public transportation operations worldwide.</p>
          </div>
          <div className="bc-env">
            <p className="bc-env-p">Cleaner combustion and optimized fluid systems reduce emissions, improve fuel efficiency, and contribute to cleaner urban air quality – protecting both the environment and operational economics.</p>
            <div className="bc-env-strong">From city routes to regional services: protection is mission-critical.</div>
          </div>
        </div>
      </section>

      <section className="bc-cta">
        <div className="bc-cta-inner">
          <div>
            <div className="bc-cta-label">// BUS COACH CROSS REFERENCE</div>
            <div className="bc-cta-h2">ROUTE RELIABILITY IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="bc-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your fleet. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="bc-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="bc-cta-footer">BUS & COACH PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
