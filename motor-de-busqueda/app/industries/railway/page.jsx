'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Railway() {
  const css = `
    .ry{background:#000;color:#fff;min-height:100vh;}
    .ry-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ry-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ry-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/trenes.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
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
          <p className=”ry-hero-p”>Precision filtration engineered for diesel-electric freight locomotives, diesel multiple units, push-pull passenger sets, and shunting locomotives. Rail operations run to published timetables and freight contracts where locomotive failures cause missed paths, network cascade delays, and passenger compensation claims. Ballast dust, tunnel particulates, and biodiesel-blend fuel contamination create filtration challenges specific to rail that standard on-highway filters cannot address. Our technology protects EMD, GE, Cummins, MTU, and Caterpillar rail engine platforms – covering fuel systems, turbocharged air intake, engine lubrication, air brake circuits, and coolant systems – keeping traction units available across freight and passenger operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ry-sec" style={{background:'#050505'}}>
        <div className="ry-sec-inner">
          <div className="ry-grid2">
            <div>
              <div className="ry-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="ry-sh2">TRACKSIDE AVAILABILITY<br /><span>ENGINEERED</span></h2>
              <p className=”ry-p”>Heavy-haul diesel-electric locomotives operate at continuous rated output for thousands of kilometres between service depots, with diesel engines producing 3,000–4,400 kW under sustained load while air brake systems cycle at every grade, curve, and signal stop. Fuel contamination in locomotive engine fuel systems causes injector tip erosion and governor instability that reduces tractive effort and triggers fuel management faults that require shop visits outside the planned maintenance schedule – each one reducing fleet availability and disrupting the consists that freight operators have committed to customers.</p>
              <p className=”ry-p”>Passenger rail operators under performance regime contracts face direct financial penalties for delays attributable to traction failure. Our filtration range covers the extended-interval requirements of Class 66, SD70, Tier 4 EMD, and MTU Series 4000 locomotive engine platforms, with validated filter elements for fuel systems, lube circuits, intercooler air intake, and air brake supply – providing the system-wide protection that keeps traction units on the network and out of the depot.</p>
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
                <video src="https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/railway.mp4" autoPlay muted loop playsInline />
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
              {label:'Fuel Module', title:'SYNTEPORE™', desc:'Locomotive diesel fuel sourced from rail depot storage tanks is subject to biodiesel blend variability, seasonal condensation ingress, and microbial growth that produces acidic by-products capable of damaging high-pressure fuel pump bores and Common Rail injector tip geometry. SYNTEPORE™ synthetic media fuel filter elements for locomotive platforms provide high-efficiency particulate capture and moisture absorption, protecting the fuel injection systems that deliver the precise fuel metering and combustion stability required for rated tractive effort and compliance with Tier 4 and Stage V locomotive emissions standards on freight and passenger operations.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Diesel-electric locomotive engines producing over 3,000 kW operate at sustained high load for thousands of kilometres between depot visits, accumulating soot, metallic wear particles, and combustion by-products in oil that standard-grade filters cannot manage within OEM extended drain intervals. SINTRAX™ high-capacity locomotive oil filtration maintains ISO 4406 oil cleanliness in API CK-4 and JASO DH-2 lubricants, protecting turbocharger bearings, piston cooling jets, and valve train components on EMD, GE, and MTU Series 4000 locomotive engines operating across continental freight networks.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Locomotive engines operating through tunnels, rail yards, and industrial sidings ingest high concentrations of ballast dust, exhaust soot, brake pad wear particles, and metallic dust from rail grinding operations that rapidly saturate standard air filter elements and increase intake restriction. MACROCORE™ radial-seal synthetic-blend air filter elements for locomotive air intake housings provide extended dust capacity and reliable zero-bypass sealing under the vibration loads characteristic of rail traction applications, maintaining turbocharger inlet conditions for sustained rated output across long inter-service periods.'},
              {label:'Water Separation', title:'AQUAGUARD™', desc:'Biodiesel-blend and winter-grade diesel fuels used in locomotive operations are more susceptible to water entrainment and phase separation than standard diesel, particularly during the temperature swings between depot storage and operating conditions that accelerate condensation in fuel tanks. AQUAGUARD™ hydrophobic coalescence water separator modules remove free and emulsified water from locomotive fuel supply lines before it reaches high-pressure Common Rail injection pumps, protecting chrome-plated pump bores and precision injector nozzle assemblies that are irreversibly damaged by water-induced corrosion and cavitation at operating pressures above 1,600 bar.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Locomotive air brake systems and multiple-unit train pneumatic control circuits are safety systems regulated by national railway safety authorities with mandatory inspection and maintenance requirements. Moisture accumulation in brake reservoir tanks and distribution pipework causes corrosion that reduces reservoir capacity, diaphragm degradation in brake cylinders, and spring brake engagement failures on grades. DRYCORE™ desiccant air dryer elements for locomotive compressed air systems eliminate free water and moisture from the brake air supply, maintaining the dry air quality required for reliable full-service brake application and automatic brake release across the full operating temperature range of traction units in passenger and freight service.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'High-output locomotive diesel engines with wet-sleeve cylinder liners are particularly vulnerable to liner cavitation pitting caused by combustion pressure pulses in coolant that has lost its cavitation inhibitor concentration. Coolant system scale from hard water top-ups at depots and maintenance facilities reduces heat exchanger efficiency and elevates engine operating temperatures that increase thermal stress on cylinder heads and turbocharger housings. COOLTECH™ supplemental coolant filtration for locomotive cooling circuits removes scale deposits and corrosive particulates, maintaining coolant quality and heat transfer efficiency on high-output locomotive engines operating across extended service intervals between major maintenance events.'},
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
            <p className="ry-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>A locomotive failure mid-journey does not just inconvenience one driver – it delays every train behind it on the network. Traction availability is a system-level commitment, and the filter elements maintaining clean fuel and oil are the components that make it possible to keep that commitment.</p>
          </div>
          <div className="ry-env">
            <p className="ry-env-p">Rail transport produces approximately 30 times less CO2 per tonne-kilometre than road freight – but only when diesel traction operates at rated efficiency. Tier 4 and Stage V locomotive engines with aftertreatment systems reduce NOx and particulate emissions by over 90% compared to earlier generations, enabling operators to access urban terminals and emission-controlled areas. SYNTEPORE™ and MACROCORE™ protect the fuel and air systems that keep locomotive emissions aftertreatment functioning at rated conversion efficiency, supporting the decarbonisation case for rail versus road modal shift and allowing operators to meet the air quality requirements of city-centre rail terminals across Europe and North America.</p>
            <div className="ry-env-strong">From freight corridor to city terminal: clean traction moves nations.</div>
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

