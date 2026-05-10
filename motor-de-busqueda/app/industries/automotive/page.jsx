'use client';
import Link from 'next/link';

const WP = 'https://cdn.elimfilters.com';

export default function Automotive() {
  const css = `
    .au{background:#000;color:#fff;min-height:100vh;}
    .au-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .au-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .au-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('https://cdn.elimfilters.com/autos.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
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
          <p className="au-hero-p">Precision filtration engineered for passenger cars, SUVs, light commercial vans, and high-performance gasoline and diesel platforms. Modern direct-injection engines operate under tighter tolerances than ever before, where fuel contamination above 4 microns damages injector tips and valve deposits accumulate within thousands of kilometres. Our technology shields air intake, fuel circuits, engine lubrication, and cabin HVAC from urban particulates, combustion by-products, and seasonal fuel variability – protecting powertrain investment and occupant health across every driving cycle. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="au-sec" style={{background:'#050505'}}>
        <div className="au-sec-inner">
          <div className="au-grid2">
            <div>
              <div className="au-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="au-sh2">URBAN RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="au-p">Passenger vehicles operate under demanding filtration cycles: frequent cold starts, stop-and-go traffic, and continuous exposure to urban PM2.5 particulates. Common Rail gasoline direct injection and turbocharged diesel engines share an intolerance for contaminated fuel and dirty oil – a single extended drain interval with degraded lubricant can cause accelerated camshaft lobe wear and increased blow-by emissions that void emissions warranties.</p>
              <p className="au-p">Fleet total cost of ownership depends on extending drain intervals without sacrificing engine cleanliness. Our filtration range is validated across ACEA C5, API SP, and Euro 6d-temp service categories, protecting turbocharged TGDI and mild-hybrid powertrains from the particulate and thermal stresses of modern urban driving cycles.</p>
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
                <video src="https://cdn.elimfilters.com/automotriz.mp4" autoPlay muted loop playsInline />
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
              {label:'Air Module', title:'MACROCORE™', desc:'Turbocharged gasoline and diesel engines demand air that meets ISO 5011 cleanliness standards at every operating condition. MACROCORE™ synthetic-blend media delivers high dust-holding capacity and low restriction growth across the service interval, maintaining the airflow volume and charge air temperature that turbocharged direct-injection engines require for rated power output and emissions compliance in urban stop-and-go cycles.'},
              {label:'Oil Module', title:'SINTRAX™', desc:'Modern passenger car lubricants carry high concentrations of soot, metallic wear particles, and oxidation products by mid-drain interval. SINTRAX™ high-efficiency filtration maintains ISO 4406 cleanliness codes in ACEA C-class low-SAPS oils used by Euro 6 engines with diesel particulate filters and gasoline particulate filters, preventing abrasive wear in variable valve timing actuators and turbocharger bearing journals across extended OEM service intervals.'},
              {label:'Fuel Module', title:'NANOFORCE™', desc:'Gasoline direct injection injectors operate at pressures up to 350 bar and are critically sensitive to particulate contamination above 5 microns. NANOFORCE™ nanofiber media provides the high-efficiency filtration needed to protect GDI injector nozzles and high-pressure pump check valves from particles that accelerate tip erosion, calibration drift, and injector deposits in turbocharged TGDI engines operating on variable-quality retail fuel.'},
              {label:'Cabin Air', title:'MICROKAPPA™', desc:'Urban air contains NO2, PM2.5, ozone, pollen, mold spores, and volatile organic compounds that penetrate standard HVAC filter media. MICROKAPPA™ activated-carbon combination filters capture sub-micron particulates and adsorb gaseous pollutants, protecting occupants with respiratory sensitivities and meeting the allergen-filtration standards required for vehicles equipped with recirculation auto-sensing systems in high-traffic urban corridors.'},
              {label:'Water Separation', title:'AQUAGUARD™', desc:'Biodiesel blends and long-term fuel storage promote water ingress and microbial growth in fuel tanks that feed directly to high-pressure Common Rail injection pumps. AQUAGUARD™ hydrophobic coalescence technology separates free and emulsified water before it reaches injection system components, protecting chrome-plated pump barrels and piezoelectric injector assemblies that cannot tolerate the corrosion and cavitation damage caused by even trace moisture contamination.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Aluminium cylinder heads, electric water pumps, and plastic cooling circuit components in modern passenger platforms are highly sensitive to coolant pH drift and silicate gel precipitation that clog thermostat housings and reduce radiator flow. COOLTECH™ supplemental coolant additive filtration removes abrasive particulates and deposits from the coolant circuit, maintaining heat transfer efficiency and protecting the aluminium casting surfaces of turbocharged engines against electrochemical corrosion.'},
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
            <p className="au-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Every kilometre begins with clean air, clean fuel, and clean oil. The quality of each directly determines engine longevity, cabin air quality, and the total maintenance cost paid over the vehicle's service life.</p>
          </div>
          <div className="au-env">
            <p className="au-env-p">Euro 6d and CAFE-compliant engines depend on clean fuel reaching GDI injectors and clean oil protecting DPF-regeneration intervals. Contaminated fluids elevate particulate emissions, trigger catalyst damage events, and accelerate the wear that increases blow-by hydrocarbon output. NANOFORCE™ and MACROCORE™ keep the fuel and air systems clean, protecting the emissions equipment that keeps vehicles on the road and compliant with urban low-emission zone regulations in cities across Europe, Asia, and the Americas.</p>
            <div className="au-env-strong">From daily commute to long-distance fleet: every filter protects the drive.</div>
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
