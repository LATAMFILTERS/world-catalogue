'use client';
import Link from 'next/link';

const WP = 'https://cdn.elimfilters.com';

export default function PowerGeneration() {
  const css = `
    .pg{background:#000;color:#fff;min-height:100vh;}
    .pg-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .pg-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .pg-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/power-generator.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .pg-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .pg-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .pg-h1 span{color:#FFF12D;}
    .pg-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .pg-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-sec-inner{max-width:1400px;margin:0 auto;}
    .pg-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .pg-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .pg-sh2 span{color:#FFF12D;}
    .pg-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .pg-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .pg-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .pg-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .pg-video-wrap{position:relative;}
    .pg-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .pg-video-wrap:hover:before{opacity:0.5;}
    .pg-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .pg-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .pg-video-wrap:hover .pg-video-inner video{filter:grayscale(0);opacity:1;}
    .pg-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .pg-btn:hover{background:#fff;}
    .pg-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .pg-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .pg-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .pg-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .pg-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .pg-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .pg-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .pg-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .pg-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .pg-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .pg-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .pg-cta{background:#FFF12D;padding:72px 6%;}
    .pg-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .pg-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .pg-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .pg-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .pg-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .pg-cta-btn:hover{background:#111;}
    .pg-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.pg-grid2{grid-template-columns:1fr;} .pg-grid3{grid-template-columns:repeat(2,1fr);} .pg-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.pg-grid3{grid-template-columns:1fr;} .pg-hero-p{font-size:12px;} .pg-cta-inner{flex-direction:column;} .pg-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="pg">
      <style>{css}</style>
      <a href="/" className="pg-back">&larr; HOME</a>

      <section className="pg-hero">
        <div className="pg-hero-inner">
          <div className="pg-eyebrow">// STRATEGIC POWER PROTECTION</div>
          <h1 className="pg-h1">POWER<br /><span>GENERATION CONTINUITY</span></h1>
          <p className="pg-hero-p">Precision filtration engineered for diesel gensets, gas reciprocating engines, gas turbines, HFO power plants, and combined heat and power installations. Grid operators and independent power producers face the same fundamental constraint: electricity cannot be stored at grid scale, so generation assets must be available when dispatch is required. Unplanned outages on spinning reserve or peaking capacity translate directly into grid stability incidents and contractual non-performance penalties. Our technology protects fuel systems, turbine lubricant circuits, hydraulic governing systems, and intake air from the contamination modes that cause the most costly unplanned outages in power generation. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="pg-sec" style={{background:'#050505'}}>
        <div className="pg-sec-inner">
          <div className="pg-grid2">
            <div>
              <div className="pg-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="pg-sh2">GENERATION RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="pg-p">Gas turbines operating in peaking or combined-cycle roles are among the most contamination-sensitive machines in industrial use – turbine inlet air quality directly determines blade erosion rates, compressor fouling intervals, and thermal efficiency. ISO 29461 defines the inlet air filtration standards for gas turbines; sub-standard filtration that allows silica or salt particles to reach the compressor stages causes accelerated blade erosion that progressively reduces output and increases heat rate, ultimately requiring expensive compressor section replacement or blade refurbishment.</p>
              <p className="pg-p">Diesel and gas gensets providing baseload, emergency standby, or island-grid power in remote locations accumulate fuel contamination and oil degradation at rates that standard-duty filters cannot manage across the extended hours between planned maintenance. Our power generation filtration range is validated for Caterpillar, Cummins, MTU, Jenbacher, and Wärtsilä reciprocating engine platforms – providing the fuel, lube, hydraulic, and air protection required to sustain availability commitments under PPA and grid service contracts.</p>
              <div className="pg-tech-grid">
                <div><div className="pg-tech-label">FUEL SYSTEMS</div><div className="pg-tech-val">AQUAGUARD™</div></div>
                <div><div className="pg-tech-label">LUBRICATION</div><div className="pg-tech-val">SINTRAX™</div></div>
                <div><div className="pg-tech-label">HYDRAULICS</div><div className="pg-tech-val">NANOFORCE™</div></div>
                <div><div className="pg-tech-label">AIR INTAKE</div><div className="pg-tech-val">MACROCORE™</div></div>
              </div>
              <Link href="/technologies" className="pg-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="pg-video-wrap">
              <div className="pg-video-inner">
                <video src={`${WP}/power.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pg-sec" style={{background:'#000'}}>
        <div className="pg-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="pg-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FACILITY PROTECTION SYSTEMS</div>
            <h2 className="pg-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="pg-grid3">
            {[
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Diesel fuel for standby and peaking generation assets is often stored for months in above-ground tanks where condensation and microbial growth produce water, sludge, and acidic by-products that damage high-pressure injection systems when engines start for emergency dispatch. AQUAGUARD™ fuel polishing and treatment modules maintain storage tank fuel quality during standby periods and remove water and particulates during engine operation, protecting Common Rail injection systems on Caterpillar, Cummins, and MTU standby and prime power diesel engines where start-up reliability is contractually mandated.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Gas turbine lube systems and large reciprocating engine oil circuits in continuous power generation run at high temperatures that accelerate oil oxidation and varnish precursor formation. Varnish deposits in turbine lube systems clog oil jet nozzles and contaminate hydraulic fluid that shares the lube oil reservoir in some turbine designs, leading to governor valve stiction and turbine control instability. SINTRAX™ high-efficiency filtration captures varnish precursors and wear particles from turbine and engine oil circuits, extending oil service life and protecting the precision bearings and hydraulic governors that determine turbine reliability.'},
              {label:'Hydraulic Systems', title:'NANOFORCE™', desc:'Gas turbine hydraulic governing and fuel control systems use hydraulic fluid at cleanliness levels of ISO 15/13/10 or better to ensure precise actuator response for inlet guide vane positioning, variable nozzle control, and fuel metering valve actuation. Contamination above target cleanliness in turbine hydraulic systems causes governor hunting, speed control instability, and failure of the fast-acting fuel shutoff valves that provide the emergency trip function required by turbine safety interlocks. NANOFORCE™ nanofiber elements maintain the ultra-clean hydraulic conditions specified by GE, Siemens, and Mitsubishi turbine lube and control oil system standards.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Gas turbines in combined-cycle and open-cycle power plants are specified with inlet air filtration systems rated to ISO 29461 F9 efficiency standards because every particle above 1 micron that reaches the compressor stages contributes to blade erosion and compressor fouling that progressively degrades thermal efficiency and output. MACROCORE™ pulse-cleaned cartridge filter elements for gas turbine inlet housings provide sustained high-efficiency filtration across multi-year service lives in industrial environments, maintaining the compressor inlet air quality that preserves turbine heat rate and defers the costly compressor washing intervals that reduce plant availability.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Combined-cycle plants and large reciprocating generator sets rely on closed-circuit cooling systems using deionised or treated water where pH control and corrosion inhibitor concentration are critical to protecting aluminium and copper alloy heat exchanger surfaces. Scale deposits in jacket water coolers and charge air coolers reduce heat transfer rates, elevating engine operating temperatures that increase thermal stress on cylinder heads and increase NOx formation above environmental permit limits. COOLTECH™ supplemental coolant filtration maintains closed-circuit water quality, extending coolant service intervals and protecting heat exchanger surfaces on high-output power generation equipment operating under continuous availability obligations.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Pneumatic systems in power generation facilities actuate turbine inlet guide vane controls, fuel gas stop valves, and safety shutdown systems that must perform with full reliability under emergency trip conditions. Moisture and oil contamination in instrument air systems causes corrosion in stainless steel valve bodies, membrane swelling in pneumatic actuators, and sticking in solenoid pilot valves that control safety interlock responses. DRYCORE™ desiccant air dryer elements maintain instrument air quality to ISO 8573 Class 1 standards, ensuring the dry, clean compressed air required for reliable actuation of the safety-critical pneumatic systems that protect power generation assets and grid connectivity.'},
            ].map((c, i) => (
              <div key={i} className="pg-card">
                <div className="pg-card-label">{c.label}</div>
                <div className="pg-card-title">{c.title}</div>
                <p className="pg-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-human">
        <div className="pg-human-inner">
          <div>
            <div className="pg-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="pg-sh2">PROTECTING <span>POWER OPERATIONS</span></h2>
            <p className="pg-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Electricity demand does not pause when generation equipment fails. Grid operators and IPPs under availability contracts face financial penalties measured in megawatt-hours when dispatchable capacity goes offline. The filter element protecting a turbine lube system or diesel standby set is the engineering foundation of contractual reliability.</p>
          </div>
          <div className="pg-env">
            <p className="pg-env-p">Power generation is under increasing pressure to reduce emissions intensity per megawatt-hour as decarbonisation targets tighten. Gas-fired reciprocating engines and turbines operating at their rated thermal efficiency produce the lowest possible CO2 per unit of output – and that efficiency depends on clean inlet air, clean fuel, and low-friction lubrication. MACROCORE™ preserves gas turbine compressor efficiency by preventing blade erosion and fouling, while AQUAGUARD™ protects the fuel injection systems that maintain complete combustion in diesel and dual-fuel reciprocating engines. Together they support the operational efficiency that determines both the commercial viability and the environmental performance of dispatchable generation in a low-carbon grid.</p>
            <div className="pg-env-strong">From standby genset to spinning turbine: clean systems keep the grid stable.</div>
          </div>
        </div>
      </section>

      <section className="pg-cta">
        <div className="pg-cta-inner">
          <div>
            <div className="pg-cta-label">// POWER GENERATION CROSS REFERENCE</div>
            <div className="pg-cta-h2">FACILITY UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="pg-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your facility. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="pg-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="pg-cta-footer">POWER GENERATION PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
