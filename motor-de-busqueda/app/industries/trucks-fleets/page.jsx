'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function TrucksFleets() {
  const css = `
    .tf{background:#000;color:#fff;min-height:100vh;}
    .tf-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .tf-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .tf-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/pexels-cottonbro-7018493-scaled.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .tf-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .tf-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .tf-h1{font-family:'Russo One',sans-serif;font-size:clamp(38px,6vw,85px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .tf-h1 span{color:#FFF12D;}
    .tf-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .tf-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .tf-sec-inner{max-width:1400px;margin:0 auto;}
    .tf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .tf-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .tf-h2 span{color:#FFF12D;}
    .tf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .tf-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;}
    .tf-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .tf-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .tf-video-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;overflow:hidden;}
    .tf-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.5s;}
    .tf-video-wrap:hover video{filter:grayscale(0);opacity:1;}
    .tf-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .tf-btn:hover{background:#fff;}
    .tf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .tf-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s;height:100%;}
    .tf-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .tf-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .tf-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .tf-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .tf-tco{background:#050505;border:1px solid rgba(255,241,45,0.2);padding:48px;}
    .tf-table{width:100%;border-collapse:collapse;}
    .tf-table th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);}
    .tf-table th:nth-child(2){color:#ef4444;}
    .tf-table th:nth-child(3){color:#FFF12D;}
    .tf-table td{font-family:'JetBrains Mono',monospace;font-size:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,0.05);}
    .tf-table td:nth-child(2){color:#ef4444;}
    .tf-table td:nth-child(3){color:#FFF12D;}
    .tf-cta{background:#FFF12D;padding:72px 6%;}
    .tf-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .tf-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .tf-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .tf-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .tf-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .tf-cta-btn:hover{background:#111;}
    .tf-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.tf-grid2{grid-template-columns:1fr;} .tf-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.tf-grid3{grid-template-columns:1fr;} .tf-hero-p{font-size:12px;} .tf-cta-inner{flex-direction:column;} .tf-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="tf">
      <style>{css}</style>
      <a href="/?skip=1" className="tf-back">&larr; HOME</a>

      <section className="tf-hero">
        <div className="tf-hero-inner">
          <div className="tf-eyebrow">// LONG-HAUL & URBAN LOGISTICS</div>
          <h1 className="tf-h1">TRUCKS &amp;<br /><span>FLEETS</span></h1>
          <p className="tf-hero-p">Industrial asset protection systems engineered for long-haul trucking, urban delivery fleets, and critical diesel-powered logistics infrastructure. Our filtration technology shields fuel systems, lubrication circuits, air intake systems, and pneumatic brakes from contamination — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across fleet operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="tf-sec" style={{background:'#050505'}}>
        <div className="tf-sec-inner">
          <div className="tf-grid2">
            <div>
              <div className="tf-eyebrow">// FLEET PROTECTION PROTOCOL</div>
              <h2 className="tf-h2">EVERY MILE.<br /><span>EVERY LOAD.</span></h2>
              <p className="tf-p">Long-haul and urban fleets face the dual challenge of extended highway operation and aggressive stop-and-go cycles — both accelerating contamination buildup in fuel, oil, and air systems at different rates requiring synchronized protection.</p>
              <p className="tf-p">ELIMFILTERS delivers complete fleet filtration architectures engineered for Cummins, Caterpillar, Detroit Diesel, MAN, Volvo, and all major truck platforms worldwide.</p>
              <div className="tf-tech-grid">
                <div><div className="tf-tech-label">FUEL SYSTEM</div><div className="tf-tech-val">SYNTEPORE™</div></div>
                <div><div className="tf-tech-label">LUBRICATION</div><div className="tf-tech-val">SYNTRAX™</div></div>
                <div><div className="tf-tech-label">AIR INTAKE</div><div className="tf-tech-val">MACROCORE™</div></div>
                <div><div className="tf-tech-label">AIR BRAKES</div><div className="tf-tech-val">DRYCORE™</div></div>
              </div>
              <Link href="/technologies" className="tf-btn">VIEW TECHNOLOGY</Link>
            </div>
            <div className="tf-video-wrap">
              <video src={`${WP}/2025/08/5309381-hd_1920_1080_25fps.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="tf-sec">
        <div className="tf-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="tf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FLEET DEFENSE SYSTEMS</div>
            <h2 className="tf-h2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="tf-grid3">
            {[
              {label:'Fuel Module', title:'SYNTEPORE™', desc:'Clean combustion and maximum torque for long-haul diesel engines — protecting Common Rail injection systems from water and particle contamination across thousands of miles.'},
              {label:'Lubrication Module', title:'SYNTRAX™', desc:'High-capacity soot control for heavy-duty truck engines during extended intervals — maintaining oil cleanliness and protecting engine internals under continuous highway loads.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Zero-bypass radial seal protection against highway dust and industrial particulates — maintaining engine air quality across all road conditions and geographic regions.'},
              {label:'Air Brake System', title:'DRYCORE™', desc:'Moisture elimination from pneumatic brake circuits — ensuring full braking reliability and regulatory compliance across all weather conditions and operating regions.'},
              {label:'Cabin Air', title:'MICROKAPPA™', desc:'HEPA-grade cabin filtration protecting drivers on long-haul routes from highway pollutants, diesel exhaust, and allergens — maintaining driver health and alertness.'},
              {label:'Coolant System', title:'COOLTECH™', desc:'Thermal protection for truck cooling circuits on extended highway runs — preventing cavitation and scale buildup in high-horsepower diesel engine cooling systems.'},
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

      <section className="tf-sec" style={{background:'#030303'}}>
        <div className="tf-sec-inner">
          <div className="tf-tco">
            <div style={{marginBottom:'40px'}}>
              <div className="tf-eyebrow" style={{marginBottom:'16px'}}>// TCO ANALYSIS</div>
              <h2 className="tf-h2">THE ECONOMICS OF<br /><span>FLEET UPTIME.</span></h2>
            </div>
            <table className="tf-table">
              <thead>
                <tr>
                  <th style={{textAlign:'left'}}>FLEET CHALLENGE</th>
                  <th style={{textAlign:'left'}}>STANDARD</th>
                  <th style={{textAlign:'left'}}>ELIMFILTERS</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Fuel Contamination</td><td>Injector Wear</td><td>Pure Delivery</td></tr>
                <tr><td>Highway Dust</td><td>Air Filter Clog</td><td>High Capacity Flow</td></tr>
                <tr><td>Brake Moisture</td><td>Valve Corrosion</td><td>Dry-Air Purity</td></tr>
                <tr><td>Service Intervals</td><td>Frequent Stops</td><td>Extended Coverage</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="tf-cta">
        <div className="tf-cta-inner">
          <div>
            <div className="tf-cta-label">// FLEET PROCUREMENT</div>
            <div className="tf-cta-h2">PROTECT YOUR FLEET.<br />MAXIMIZE UPTIME.</div>
            <p className="tf-cta-p">Search by OEM or part number to find the exact ELIMFILTERS match for your truck and fleet vehicles. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="tf-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="tf-cta-footer">TRUCKS & FLEETS PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
