'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Agriculture() {
  const css = `
    .ag{background:#000;color:#fff;min-height:100vh;}
    .ag-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ag-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ag-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/agriculture.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ag-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ag-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ag-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ag-h1 span{color:#FFF12D;}
    .ag-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ag-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ag-sec-inner{max-width:1400px;margin:0 auto;}
    .ag-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ag-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ag-sh2 span{color:#FFF12D;}
    .ag-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ag-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .ag-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .ag-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .ag-video-wrap{position:relative;}
    .ag-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .ag-video-wrap:hover:before{opacity:0.5;}
    .ag-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .ag-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .ag-video-wrap:hover .ag-video-inner video{filter:grayscale(0);opacity:1;}
    .ag-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .ag-btn:hover{background:#fff;}
    .ag-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ag-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .ag-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .ag-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ag-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .ag-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ag-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ag-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ag-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .ag-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ag-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .ag-cta{background:#FFF12D;padding:72px 6%;}
    .ag-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .ag-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .ag-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .ag-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .ag-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .ag-cta-btn:hover{background:#111;}
    .ag-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.ag-grid2{grid-template-columns:1fr;} .ag-grid3{grid-template-columns:repeat(2,1fr);} .ag-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.ag-grid3{grid-template-columns:1fr;} .ag-hero-p{font-size:12px;} .ag-cta-inner{flex-direction:column;} .ag-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ag">
      <style>{css}</style>
      <a href="/" className="ag-back">&larr; HOME</a>

      <section className="ag-hero">
        <div className="ag-hero-inner">
          <div className="ag-eyebrow">// STRATEGIC HARVEST PROTECTION</div>
          <h1 className="ag-h1">AGRICULTURE<br /><span>HARVEST SECURITY</span></h1>
          <p className="ag-hero-p">Precision filtration engineered for combine harvesters, tractors, sprayers, and self-propelled agricultural machinery. Crop production runs on narrow seasonal windows where a single mechanical failure during planting or harvest translates directly into yield loss and revenue damage. Our technology shields fuel injection systems, hydraulic circuits, engine lubrication, and air intake from chaff, pollen, grain dust, and field-stored fuel contamination – extending service intervals, protecting high-value powertrain components, and eliminating unplanned downtime across grain, row crop, and specialty operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ag-sec" style={{background:'#050505'}}>
        <div className="ag-sec-inner">
          <div className="ag-grid2">
            <div>
              <div className="ag-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="ag-sh2">FIELD RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="ag-p">Agricultural equipment runs in some of the harshest filtration environments on earth. Combine harvesters generate dense chaff clouds, field-stored diesel accumulates microbial growth and water ingress, and hydraulic systems on planters and sprayers cycle continuously for 18-hour shifts. Standard-duty filters cannot maintain the ISO cleanliness codes required to protect high-pressure Common Rail injection and proportional hydraulic controls under these conditions.</p>
              <p className="ag-p">Harvest timing is non-negotiable. Every hour of unplanned downtime during a critical window costs more than weeks of preventive maintenance. Our extended-interval filtration technologies are engineered specifically to match the load profiles of Tier 4-compliant farm engines, keeping equipment productive from pre-season preparation through post-harvest strip-down.</p>
              <div className="ag-tech-grid">
                <div><div className="ag-tech-label">FUEL SYSTEMS</div><div className="ag-tech-val">AQUAGUARD™</div></div>
                <div><div className="ag-tech-label">LUBRICATION</div><div className="ag-tech-val">MACROCORE™</div></div>
                <div><div className="ag-tech-label">HYDRAULICS</div><div className="ag-tech-val">NANOFORCE™</div></div>
                <div><div className="ag-tech-label">AIR INTAKE</div><div className="ag-tech-val">SYNTEPORE™</div></div>
              </div>
              <Link href="/technologies" className="ag-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="ag-video-wrap">
              <div className="ag-video-inner">
                <video src="https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/agriculture.mp4" autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ag-sec" style={{background:'#000'}}>
        <div className="ag-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ag-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FIELD PROTECTION SYSTEMS</div>
            <h2 className="ag-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="ag-grid3">
            {[
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Field-stored diesel is among the most contaminated fuel in any industry – subject to microbial growth, free water, and particulate ingress from portable tanks and bulk storage. AQUAGUARD™ combines hydrophobic coalescence with high-efficiency particle capture to protect Common Rail injectors operating at pressures above 2,000 bar, where even 4-micron particles cause injector tip erosion and calibration drift in tractors and combines.'},
              {label:'Lubrication Module', title:'MACROCORE™', desc:'Agricultural engines run at high soot loads during field operations, and extended oil drain intervals are standard practice to reduce downtime mid-season. MACROCORE™ high-capacity oil filtration maintains ISO cleanliness targets across 500+ hour service intervals, capturing metallic wear particles, carbon soot, and oxidation by-products that accelerate bearing and cam surface degradation in high-torque diesel engines powering harvesters and large tractors.'},
              {label:'Air Intake', title:'SYNTEPORE™', desc:'Harvesting operations generate dense airborne loads of chaff, pollen, grain dust, and fine soil particulates that rapidly load standard paper elements. SYNTEPORE™ synthetic media delivers greater dust-holding capacity and lower restriction growth over the filter life compared to cellulose, maintaining the clean air delivery essential for turbocharger efficiency and combustion quality in engines powering combines operating through continuous 14-hour harvest shifts.'},
              {label:'Hydraulic Systems', title:'NANOFORCE™', desc:'Modern precision agriculture relies on closed-loop hydraulic systems controlling variable-rate seeders, auto-steer actuators, header lift circuits, and hydrostatic transmissions. Particle contamination above ISO 16/14/11 causes proportional valve spool stiction and accelerated pump wear. NANOFORCE™ nanofiber elements maintain target cleanliness codes even under high-cycle conditions, protecting the precision hydraulic architecture of current-generation planters and self-propelled sprayers.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'High-horsepower agricultural engines operating in ambient temperatures above 40°C and surrounded by crop residue that blocks radiator airflow are highly vulnerable to coolant system scale and cavitation erosion. COOLTECH™ coolant filtration removes silicate gel deposits, rust particles, and electrolytic contaminants from the cooling circuit, preventing liner pitting on wet-sleeve diesel engines and maintaining heat transfer efficiency in combine and tractor cooling systems across extended seasonal operation.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Air brake systems on large articulated tractors and self-propelled harvesting equipment depend on dry, clean compressed air for reliable valve actuation and chamber response. Moisture in the air supply causes valve corrosion, diaphragm swelling, and sluggish pedal response – critical failures on equipment operating on slopes and in proximity to workers. DRYCORE™ desiccant elements eliminate free water from the brake circuit, ensuring consistent pneumatic performance across full seasonal operation.'},
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-label">{c.label}</div>
                <div className="ag-card-title">{c.title}</div>
                <p className="ag-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-human">
        <div className="ag-human-inner">
          <div>
            <div className="ag-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="ag-sh2">PROTECTING <span>AGRICULTURAL CONTINUITY</span></h2>
            <p className="ag-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Harvest windows close in days, not weeks. Filtration that keeps equipment running through those windows is not a maintenance cost – it is an investment in yield security and farm profitability.</p>
          </div>
          <div className="ag-env">
            <p className="ag-env-p">Optimized combustion and clean hydraulic fluids reduce diesel particulate emissions, extend lubricant drain intervals, and lower the volume of hazardous waste fluids generated per season. Tier 4 and Stage V engine compliance depends on clean fuel reaching the injectors – AQUAGUARD™ and MACROCORE™ protect the emissions control systems that enable agricultural operations to meet environmental permits and sustainability commitments across global growing regions.</p>
            <div className="ag-env-strong">From seedbed to grain store: protection sustains the harvest.</div>
          </div>
        </div>
      </section>

      <section className="ag-cta">
        <div className="ag-cta-inner">
          <div>
            <div className="ag-cta-label">// AGRICULTURE CROSS REFERENCE</div>
            <div className="ag-cta-h2">HARVEST SECURITY IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="ag-cta-p">Access our global database. Search by OEM part number or equipment model to find the precision-matched replacement for your harvester, tractor, or sprayer. Covering John Deere, CNH, AGCO, Claas, and 200+ additional OEM platforms across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="ag-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="ag-cta-footer">AGRICULTURE PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
