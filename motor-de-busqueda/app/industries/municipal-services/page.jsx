'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function MunicipalServices() {
  const css = `
    .ms{background:#000;color:#fff;min-height:100vh;}
    .ms-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ms-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ms-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/pexels-oscar-sanchez197-9535766-scaled.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ms-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ms-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ms-h1{font-family:'Russo One',sans-serif;font-size:clamp(38px,6vw,80px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ms-h1 span{color:#FFF12D;}
    .ms-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ms-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ms-sec-inner{max-width:1400px;margin:0 auto;}
    .ms-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ms-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ms-h2 span{color:#FFF12D;}
    .ms-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ms-video-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;overflow:hidden;}
    .ms-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;}
    .ms-video-wrap:hover video{filter:grayscale(0);opacity:1;}
    .ms-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ms-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:32px;transition:all 0.3s;height:100%;}
    .ms-feature:hover{background:rgba(255,255,255,0.05);transform:translateY(-4px);}
    .ms-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ms-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ms-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ms-cta{background:#FFF12D;padding:72px 6%;}
    .ms-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .ms-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .ms-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .ms-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .ms-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .ms-btn:hover{background:#111;}
    .ms-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.ms-grid2{grid-template-columns:1fr;} .ms-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.ms-grid3{grid-template-columns:1fr;} .ms-hero-p{font-size:12px;} .ms-cta-inner{flex-direction:column;}}
  `;

  return (
    <div className="ms">
      <style>{css}</style>
      <a href="/" className="ms-back">&larr; HOME</a>

      <section className="ms-hero">
        <div className="ms-hero-inner">
          <div className="ms-eyebrow">// CRITICAL URBAN SERVICES</div>
          <h1 className="ms-h1">WASTE &amp; MUNICIPAL<br /><span>SERVICES</span></h1>
          <p className="ms-hero-p">Industrial asset protection systems engineered for waste collection fleets, municipal vehicles, and critical urban service infrastructure. Our filtration technology shields diesel engines, hydraulic compaction systems, and lubrication circuits from contamination â€” extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across municipal operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ms-sec" style={{background:'#050505'}}>
        <div className="ms-sec-inner">
          <div className="ms-grid2">
            <div>
              <div className="ms-eyebrow">// URBAN FLEET RELIABILITY</div>
              <h2 className="ms-h2">CRITICAL SERVICES<br /><span>CANNOT STOP.</span></h2>
              <p className="ms-p">Municipal waste and service vehicles operate under the most demanding stop-and-go cycles â€” multiple daily starts, heavy hydraulic loads, and contaminated environments that accelerate engine wear far beyond standard fleet applications.</p>
              <p className="ms-p">ELIMFILTERS delivers synchronized protection across fuel, lubrication, hydraulic, and air intake systems â€” ensuring every vehicle completes its route and every service is delivered on time worldwide.</p>
            </div>
            <div className="ms-video-wrap">
              <video src="/videos/servicios.mp4" autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="ms-sec">
        <div className="ms-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ms-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// PROTECTION MATRIX</div>
            <h2 className="ms-h2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>DEFENSE</span></h2>
          </div>
          <div className="ms-grid3">
            {[
              {label:'MACROCORE™ / AIR', title:'URBAN AIR INTAKE', desc:'High-capacity media for urban environments with elevated particulate concentrations â€” protecting engines from micro-particles, soot, and industrial pollutants in city operations.'},
              {label:'SYNTRAX™ / OIL', title:'STOP-GO PROTECTION', desc:'High-capacity soot control for engines under continuous stop-and-go cycles â€” maintaining oil cleanliness and protecting bearings during the frequent cold starts of municipal routes.'},
              {label:'NANOFORCE™ / HYD', title:'COMPACTION SYSTEM', desc:'Precision hydraulic filtration for waste compaction systems operating under continuous high-pressure cycles â€” protecting hydraulic valves and actuators from contamination.'},
              {label:'AQUAGUARD™ / FUEL', title:'FUEL PURITY', desc:'Water separation and particle removal for fuel systems in vehicles operating in wet and contaminated environments â€” ensuring reliable diesel delivery in all weather conditions.'},
              {label:'DRYCORE™ / AIR', title:'BRAKE RELIABILITY', desc:'Moisture elimination from pneumatic brake systems â€” ensuring full braking reliability and safety compliance in heavy municipal vehicles operating in all weather conditions.'},
              {label:'MICROKAPPA™ / CABIN', title:'OPERATOR HEALTH', desc:'HEPA-grade cabin protection for operators exposed to waste collection environments â€” eliminating biological contaminants, odors, and harmful gases from the operator cabin.'},
            ].map((f, i) => (
              <div key={i} className="ms-feature">
                <div className="ms-feature-label">{f.label}</div>
                <div className="ms-feature-title">{f.title}</div>
                <p className="ms-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ms-cta">
        <div className="ms-cta-inner">
          <div>
            <div className="ms-cta-label">// MUNICIPAL PROCUREMENT</div>
            <div className="ms-cta-h2">KEEP CITIES RUNNING.<br />FIND YOUR FILTER.</div>
            <p className="ms-cta-p">Municipal services depend on fleet reliability. Upgrade your waste and service vehicle protection with ELIMFILTERS. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="ms-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="ms-cta-footer">MUNICIPAL PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}




