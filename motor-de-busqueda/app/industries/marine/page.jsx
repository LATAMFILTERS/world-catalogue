'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

export default function MarineIndustry() {
  const css = `
    .mi{background:#000;color:#fff;min-height:100vh;}
    .mi-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mi-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mi-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/marine.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mi-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mi-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mi-h1 span{color:#FFF12D;}
    .mi-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mi-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-sec-inner{max-width:1400px;margin:0 auto;}
    .mi-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mi-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mi-sh2 span{color:#FFF12D;}
    .mi-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mi-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .mi-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .mi-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .mi-video-wrap{position:relative;}
    .mi-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .mi-video-wrap:hover:before{opacity:0.5;}
    .mi-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .mi-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .mi-video-wrap:hover .mi-video-inner video{filter:grayscale(0);opacity:1;}
    .mi-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .mi-btn:hover{background:#fff;}
    .mi-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mi-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .mi-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .mi-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mi-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mi-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mi-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mi-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .mi-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mi-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .mi-cta{background:#FFF12D;padding:72px 6%;}
    .mi-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .mi-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .mi-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .mi-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .mi-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .mi-cta-btn:hover{background:#111;}
    .mi-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.mi-grid2{grid-template-columns:1fr;} .mi-grid3{grid-template-columns:repeat(2,1fr);} .mi-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.mi-grid3{grid-template-columns:1fr;} .mi-hero-p{font-size:12px;} .mi-cta-inner{flex-direction:column;} .mi-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mi">
      <style>{css}</style>
      <a href="/" className="mi-back">&larr; HOME</a>

      <section className="mi-hero">
        <div className="mi-hero-inner">
          <div className="mi-eyebrow">// STRATEGIC MARINE PROTECTION</div>
          <h1 className="mi-h1">MARINE<br /><span>VESSEL CONTINUITY</span></h1>
          <p className="mi-hero-p">Precision filtration engineered for container ships, bulk carriers, offshore supply vessels, ferries, tugboats, and superyachts. Marine diesel engines operate continuously for weeks without the option of roadside assistance – a fuel system failure 400 nautical miles offshore means emergency tow, cargo delay, and charterer claims that dwarf any maintenance budget. Salt spray, high humidity, vibration, and biofouled bunker fuel create contamination conditions found in no other industry. Our technology protects main engines, auxiliary generators, hydraulic deck machinery, and seawater cooling circuits, keeping vessels on schedule and seaworthy across all ocean conditions worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mi-sec" style={{background:'#050505'}}>
        <div className="mi-sec-inner">
          <div className="mi-grid2">
            <div>
              <div className="mi-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="mi-sh2">MARITIME RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="mi-p">Bunker fuel quality is among the most variable in any industry – HFO and VLSFO blends sourced from multiple ports carry varying levels of catalytic fines, water, and microbial contamination that reach main engine injection systems if fuel treatment trains are inadequate. Catfines above 15 mg/kg in engine fuel cause rapid piston ring and cylinder liner wear on two-stroke crosshead engines. Modern Tier III engines with SCR systems require clean fuel for accurate NOx reduction; any fuel contamination disrupts catalyst dosing and threatens port state control compliance.</p>
              <p className="mi-p">Planned maintenance intervals on deep-sea vessels are set to coincide with port calls weeks apart. Extended-duty filtration that maintains cleanliness targets throughout the passage reduces the risk of in-voyage failures that require deviation to a repair port. Our marine filtration range covers MAN, Wärtsilä, Caterpillar Marine, and Cummins engine platforms, providing the fuel, lube, and seawater cooling protection required for IMO-compliant deep-sea and coastal operations.</p>
              <div className="mi-tech-grid">
                <div><div className="mi-tech-label">FUEL SYSTEMS</div><div className="mi-tech-val">AQUAGUARD™</div></div>
                <div><div className="mi-tech-label">LUBRICATION</div><div className="mi-tech-val">SINTRAX™</div></div>
                <div><div className="mi-tech-label">SEAWATER COOLING</div><div className="mi-tech-val">COOLTECH™</div></div>
                <div><div className="mi-tech-label">HYDRAULICS</div><div className="mi-tech-val">NANOFORCE™</div></div>
              </div>
              <Link href="/technologies" className="mi-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="mi-video-wrap">
              <div className="mi-video-inner">
                <video src="https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/boat.mp4" autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mi-sec" style={{background:'#000'}}>
        <div className="mi-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mi-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// VESSEL PROTECTION SYSTEMS</div>
            <h2 className="mi-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="mi-grid3">
            {[
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Bunker fuel delivered at ports routinely contains free water, sludge, and catfine concentrations that threaten main engine injection systems on bulk carriers and tankers. AQUAGUARD™ fuel treatment modules with hydrophobic coalescence and high-efficiency particle capture protect Common Rail and jerk pump injection systems on both two-stroke and four-stroke marine diesel engines, removing water and particles before they reach the precision fuel pump barrel and plunger assemblies that cannot tolerate contaminated fuel under continuous high-load passage conditions.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Crosshead and trunk-piston marine engines operate at continuous rated load for weeks between ports, generating high soot and thermal oxidation products in system and cylinder oils. SINTRAX™ high-efficiency oil filtration maintains ISO 4406 cleanliness standards in large-bore MAN and Wärtsilä engine lubrication systems, capturing metallic wear debris from crosshead bearings, crankpins, and camshaft assemblies before it recirculates and causes accelerated surface fatigue in the bearing shells that support main engine crankshafts during transoceanic passages.'},
              {label:'Seawater Cooling', title:'COOLTECH™', desc:'Seawater cooling circuits on vessels operating across tropical and temperate zones are highly susceptible to biofouling, biological scale, and galvanic corrosion between copper alloy heat exchanger tubes and aluminium or steel hull structures. COOLTECH™ supplemental cooling circuit filtration removes particulate scale, organic deposits, and corrosion products from central cooling water systems, maintaining heat exchanger efficiency and preventing the tube fouling that increases sea water pump back-pressure and reduces thermal transfer in main engine jacket and charge air cooler circuits.'},
              {label:'Hydraulic Systems', title:'NANOFORCE™', desc:'Hydraulic deck cranes, hatch cover actuators, bow thrusters, and steering gear systems operate in the most corrosive environment of any hydraulic application – salt spray, condensation, and seawater splash combined with continuous duty cycles and high system pressures. NANOFORCE™ nanofiber elements maintain the ISO 16/14/11 hydraulic cleanliness required by proportional steering valves and variable-speed thruster drives, protecting the deck machinery systems that must perform reliably during port manoeuvring and cargo handling operations in all weather conditions.'},
              {label:'Air Intake', title:'SYNTEPORE™', desc:'Marine diesel generators and main engine turbochargers operating on vessels in heavy sea states ingest salt spray, humidity, and sea mist that accelerates compressor wheel corrosion and deposits salt crystals on turbine blades. SYNTEPORE™ synthetic media air intake elements provide efficient moisture-resistant filtration for marine auxiliary engine air intakes, maintaining the air quality and turbocharger efficiency needed to sustain rated generator output during heavy weather operations where main engines demand maximum auxiliary power support.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Pneumatic control systems on offshore supply vessels, bulk carriers, and tankers operate hatch covers, cargo valves, and safety shutdown actuators using compressed air that passes through unheated void spaces and exterior deck piping where condensation and freeze events are common. DRYCORE™ desiccant air dryer elements eliminate moisture from compressed air distribution systems, preventing corrosion in stainless and carbon steel valve bodies, ensuring reliable actuation of cargo and ballast control systems, and protecting the pneumatic safety circuits required by class society and flag state regulations.'},
            ].map((c, i) => (
              <div key={i} className="mi-card">
                <div className="mi-card-label">{c.label}</div>
                <div className="mi-card-title">{c.title}</div>
                <p className="mi-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mi-human">
        <div className="mi-human-inner">
          <div>
            <div className="mi-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="mi-sh2">PROTECTING <span>MARITIME OPERATIONS</span></h2>
            <p className="mi-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>The ocean offers no margin for mechanical failure. Clean fuel, clean oil, and dry pneumatic circuits are not service items – they are the engineering discipline that separates vessels that arrive on schedule from those that divert to emergency repair ports.</p>
          </div>
          <div className="mi-env">
            <p className="mi-env-p">IMO 2020 VLSFO compliance and the approaching IMO 2030 carbon intensity targets require marine engines to operate at their designed efficiency – which depends entirely on clean fuel delivery, effective seawater cooling, and low-friction lubrication. Fuel contamination that causes injector wear raises specific fuel oil consumption and elevates CO2 emissions per tonne-mile, directly impacting CII rating compliance. AQUAGUARD™ and COOLTECH™ protect the fuel and cooling systems that allow modern marine engines to maintain rated thermal efficiency throughout the passage, supporting both IMO compliance and the commercial fuel economy that determines voyage profitability.</p>
            <div className="mi-env-strong">From departure port to destination: clean systems complete the voyage.</div>
          </div>
        </div>
      </section>

      <section className="mi-cta">
        <div className="mi-cta-inner">
          <div>
            <div className="mi-cta-label">// MARINE CROSS REFERENCE</div>
            <div className="mi-cta-h2">VESSEL RELIABILITY IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="mi-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your vessel. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="mi-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="mi-cta-footer">MARINE PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
