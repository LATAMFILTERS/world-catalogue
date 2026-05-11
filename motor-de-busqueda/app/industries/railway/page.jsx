'use client';
import Link from 'next/link';
import { WP } from '../../constants';

export default function Railway() {
  const css = `
    .ry{background:#000;color:#fff;min-height:100vh;}
    .ry-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ry-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ry-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/trenes.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
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
          <p className="ry-hero-p">Precision filtration engineered for diesel-electric freight locomotives, diesel multiple units, push-pull passenger sets, and shunting locomotives. Rail operations run to published timetables and freight contracts where locomotive failures cause missed paths, network cascade delays, and passenger compensation claims. Ballast dust, tunnel particulates, and biodiesel-blend fuel contamination create filtration challenges specific to rail that standard on-highway filters cannot address. Our technology protects EMD, GE, Cummins, MTU, and Caterpillar rail engine platforms - covering fuel systems, turbocharged air intake, engine lubrication, air brake circuits, and coolant systems - keeping traction units available across freight and passenger operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ry-sec" style={{background:'#050505'}}>
        <div className="ry-sec-inner">
          <div className="ry-grid2">
            <div>
              <div className="ry-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="ry-sh2">LOCOMOTIVE RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="ry-p">Rail traction units operate under extreme duty cycles - full-load haul gradients, dynamic braking heat, and idling in depots with recirculated exhaust - that rapidly degrade lubricant and saturate fuel and air filtration systems. EMD and GE diesel-electric platforms rely on clean fuel to maintain injection timing precision; contaminated fuel causes injector tip erosion and power loss that forces unplanned locomotive changes mid-consist.</p>
              <p className="ry-p">Freight operators under take-or-pay haulage contracts cannot afford locomotive failures. Our extended-interval filtration technologies are validated for the duty cycles of Class I freight locomotives, regional passenger DMUs, and shunting fleets, protecting traction assets from first service through full overhaul cycles and reducing total fleet maintenance cost per kilometre.</p>
              <div className="ry-tech-grid">
                <div><div className="ry-tech-label">AIR INTAKE</div><div className="ry-tech-val">MACROCORE</div></div>
                <div><div className="ry-tech-label">LUBRICATION</div><div className="ry-tech-val">SINTRAX</div></div>
                <div><div className="ry-tech-label">FUEL SYSTEM</div><div className="ry-tech-val">NANOFORCE</div></div>
                <div><div className="ry-tech-label">BRAKING AIR</div><div className="ry-tech-val">DRYCORE</div></div>
              </div>
              <Link href="/technologies" className="ry-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="ry-video-wrap">
              <div className="ry-video-inner">
                <video src={`${WP}/railway.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ry-sec" style={{background:'#000'}}>
        <div className="ry-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ry-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FLEET PROTECTION SYSTEMS</div>
            <h2 className="ry-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="ry-grid3">
            {[
              {label:'Air Module', title:'MACROCORE', desc:'Diesel-electric locomotives operating in tunnel bores, rail yards, and industrial corridors ingest silica dust, carbon soot, and metallic particulates that rapidly load air filter elements. MACROCORE synthetic-blend media delivers extended dust-holding capacity and stable airflow restriction across the full service interval, maintaining the air mass and boost pressure that turbocharged rail engines require for efficient combustion and reduced exhaust emissions across all traction duty profiles.'},
              {label:'Lubrication Module', title:'SINTRAX', desc:'Rail traction engines subject to continuous full-load duty generate elevated soot loading, high thermal cycling, and acid accumulation in engine oil that degrade lubricant faster than highway applications. SINTRAX high-capacity oil filtration captures soot agglomerates and metallic wear particles, maintaining oil cleanliness across extended drain intervals specified by EMD and GE OEM maintenance programs for Class I freight and regional passenger locomotive fleets.'},
              {label:'Fuel Module', title:'NANOFORCE', desc:'Rail fuelling operations at remote depots and line-side tankage are vulnerable to water ingress, microbial contamination, and particulate loading that degrade fuel quality over seasonal storage cycles. NANOFORCE nanofiber media combines high-efficiency particulate removal with coalescing water separation, protecting Common Rail and unit injector systems on modern rail engines where fuel cleanliness above ISO 12/9/6 causes injector tip erosion and power delivery inconsistency under full-load traction demand.'},
              {label:'Pneumatic Systems', title:'DRYCORE', desc:'Compressed air brake systems on freight wagons and passenger coaches are safety-critical components subject to mandatory inspection intervals. Moisture accumulation in brake reservoirs causes diaphragm corrosion, triple valve malfunction, and sluggish brake cylinder response - failure modes that trigger train examination delays and service prohibition under rail safety authority requirements. DRYCORE desiccant air dryer cartridges eliminate free and condensed water from compressed air supplies.'},
              {label:'Hydraulic Systems', title:'AQUAGUARD', desc:'Hydraulic systems on rail maintenance vehicles, track geometry cars, and on-track plant operate under continuous duty with fluid temperatures that promote oxidation and water ingress. AQUAGUARD protects these hydrostatic circuits by removing free water and maintaining ISO 16/14/11 cleanliness codes, preventing proportional valve spool wear and pump cavitation that cause positioning inaccuracy in track maintenance equipment and ballast tamping machines operating to tight tolerances.'},
              {label:'Cooling Systems', title:'COOLTECH', desc:'Rail traction engines operating at sustained full load on mountain grades with minimal airflow through radiator cores are highly vulnerable to coolant system overtemperature and silicate gel deposition. COOLTECH supplemental coolant filtration removes particulates and neutralises acidic degradation products from the coolant circuit, preventing wet-sleeve liner pitting on high-output rail diesel engines and protecting the charge-air cooler cores critical to maintaining rated traction power on steep ruling grades.'},
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
            <div className="ry-eyebrow">// INFRASTRUCTURE + ENVIRONMENT</div>
            <h2 className="ry-sh2">PROTECTING <span>RAIL NETWORKS</span></h2>
            <p className="ry-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Every locomotive on a scheduled path carries freight or passengers who depend on its arrival. Clean fuel, clean air, and dry brake circuits are the engineering foundation of a railway that national supply chains trust.</p>
          </div>
          <div className="ry-env">
            <p className="ry-env-p">Modern rail traction units equipped with selective catalytic reduction and closed-crankcase ventilation systems produce dramatically lower NOx and particulate emissions than previous generations - but only when fuel and lubricant systems are kept clean. Contaminated fuel degrades SCR dosing accuracy and causes unnecessary regeneration events that raise CO2 output per tonne-kilometre. NANOFORCE and MACROCORE protect the injection and air systems that keep emissions control systems functioning as designed, helping rail operators comply with environmental regulations across national and cross-border rail networks.</p>
            <div className="ry-env-strong">From departure yard to destination terminal: every consist is protected.</div>
          </div>
        </div>
      </section>

      <section className="ry-cta">
        <div className="ry-cta-inner">
          <div>
            <div className="ry-cta-label">// RAILWAY CROSS REFERENCE</div>
            <div className="ry-cta-h2">UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="ry-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your fleet. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="ry-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="ry-cta-footer">RAILWAY PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
