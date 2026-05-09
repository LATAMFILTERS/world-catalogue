'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function OilGas() {
  const css = `
    .og{background:#000;color:#fff;min-height:100vh;}
    .og-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .og-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .og-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/oil-gas-infrastructure.jpg') center/contain no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .og-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .og-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .og-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .og-h1 span{color:#FFF12D;}
    .og-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .og-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .og-sec-inner{max-width:1400px;margin:0 auto;}
    .og-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .og-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .og-sh2 span{color:#FFF12D;}
    .og-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .og-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .og-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .og-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .og-video-wrap{position:relative;}
    .og-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .og-video-wrap:hover:before{opacity:0.5;}
    .og-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .og-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .og-video-wrap:hover .og-video-inner video{filter:grayscale(0);opacity:1;}
    .og-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .og-btn:hover{background:#fff;}
    .og-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .og-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .og-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .og-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .og-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .og-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .og-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .og-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .og-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .og-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .og-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .og-cta{background:#FFF12D;padding:72px 6%;}
    .og-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .og-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .og-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .og-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .og-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .og-cta-btn:hover{background:#111;}
    .og-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.og-grid2{grid-template-columns:1fr;} .og-grid3{grid-template-columns:repeat(2,1fr);} .og-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.og-grid3{grid-template-columns:1fr;} .og-hero-p{font-size:12px;} .og-cta-inner{flex-direction:column;} .og-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="og">
      <style>{css}</style>
      <a href="/" className="og-back">&larr; HOME</a>

      <section className="og-hero">
        <div className="og-hero-inner">
          <div className="og-eyebrow">// STRATEGIC ENERGY PROTECTION</div>
          <h1 className="og-h1">OIL & GAS<br /><span>OPERATIONAL CONTINUITY</span></h1>
          <p className="og-hero-p">Precision filtration engineered for top-drive drilling rigs, mud pump packages, pressure pumping units, wellhead control systems, and pipeline compressor stations. Oil and gas operations in remote onshore and offshore environments have no tolerance for equipment failure – a hydraulic top-drive going down mid-run costs tens of thousands of dollars per hour in rig time, while a fuel system contamination event on a remote compression station can shut down a gas gathering system with no immediate access to service support. Our technology protects hydraulic power units, diesel prime movers, gas turbine lube circuits, and fuel systems under the extreme contamination and environmental conditions unique to upstream and midstream energy operations. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="og-sec" style={{background:'#050505'}}>
        <div className="og-sec-inner">
          <div className="og-grid2">
            <div>
              <div className="og-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="og-sh2">ENERGY RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="og-p">Hydraulic power units on drilling rigs operate directional control systems, pipe handling equipment, and blowout preventer actuation under the most demanding pressure and contamination conditions in any industrial application. BOP hydraulic systems are safety-critical – their performance directly determines well control response times in the event of a kick. Contaminated hydraulic fluid in a BOP control system is not an equipment reliability issue; it is a process safety risk that carries regulatory and liability consequences.</p>
              <p className="og-p">Diesel prime movers on remote compression stations and well-test units often run for 6-12 months between planned maintenance visits, demanding fuel system filtration that maintains injection cleanliness across extreme temperature swings and prolonged fuel storage. Our extended-interval technologies are validated for Caterpillar, Cummins, MTU, and GE drill rig packages, providing the fuel, lube, hydraulic, and pneumatic protection required to sustain continuous operations far from the nearest service infrastructure.</p>
              <div className="og-tech-grid">
                <div><div className="og-tech-label">FUEL SYSTEMS</div><div className="og-tech-val">AQUAGUARD™</div></div>
                <div><div className="og-tech-label">LUBRICATION</div><div className="og-tech-val">SINTRAX™</div></div>
                <div><div className="og-tech-label">HYDRAULICS</div><div className="og-tech-val">NANOFORCE™</div></div>
                <div><div className="og-tech-label">AIR INTAKE</div><div className="og-tech-val">MACROCORE™</div></div>
              </div>
              <Link href="/technologies" className="og-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="og-video-wrap">
              <div className="og-video-inner">
                <video src={`${WP}/2025/08/energy-operations.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="og-sec" style={{background:'#000'}}>
        <div className="og-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="og-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// EQUIPMENT PROTECTION SYSTEMS</div>
            <h2 className="og-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="og-grid3">
            {[
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Remote onshore production facilities and offshore platforms store diesel in fixed tanks exposed to seawater spray, temperature cycling, and condensation that promotes microbial growth and water accumulation. AQUAGUARD™ hydrophobic coalescence fuel treatment modules remove free and emulsified water, microbial biomass, and particulates from diesel supplied to Caterpillar, Cummins, and MTU diesel generator sets and prime mover engines operating in locations where injection system failure means production shutdown and expensive helicopter parts delivery.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Gas turbine lubrication systems and diesel engine oil circuits on production platforms run continuously for months between planned maintenance turnarounds. Extended-duty oil cleanliness in gas turbine lube systems is critical to bearing and gear mesh health; turbine bearing failure in a remote offshore production environment triggers platform shutdown and expensive crane-barge mobilisation to perform replacement. SINTRAX™ high-efficiency turbine and diesel oil filtration maintains ISO 4406 cleanliness across long service intervals, protecting precision bearings in both turbine-driven and diesel-driven rotating equipment on upstream production facilities.'},
              {label:'Hydraulic Systems', title:'NANOFORCE™', desc:'Blowout preventer hydraulic control systems, hydraulic workover units, and topside control systems on drilling platforms operate servo and proportional valves that must respond with precision and reliability under emergency conditions. Hydraulic system contamination above ISO 16/14/11 in BOP control circuits degrades valve response time and creates the risk of incomplete ram closure during well control events. NANOFORCE™ nanofiber filtration maintains the ultra-clean hydraulic fluid condition specified by BOP manufacturers and required by API 16D safety standards for blowout preventer control systems on drilling rigs and production platforms worldwide.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Diesel generators and gas engine prime movers on desert drilling sites and Arctic production facilities face extreme air intake challenges – fine silica dust in arid environments and ice crystal ingestion in sub-zero winter conditions can both destroy turbocharger compressor stages within hundreds of operating hours. MACROCORE™ high-performance air filtration provides reliable particle capture across temperature extremes from -40°C to +55°C, maintaining engine air quality for continuous-duty prime movers on remote production facilities where engine failure means immediate power outage and process safety system degradation.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'High-output diesel engines and gas compression units on offshore platforms and remote production sites rely on cooling circuits using hard local water for top-ups that deposits scale and raises dissolved solids concentrations above design limits. Wet-sleeve liner cavitation, heat exchanger tube fouling, and water pump impeller erosion are the predictable consequences of degraded coolant quality in remote operations. COOLTECH™ supplemental coolant filtration removes scale deposits and corrosive particulates from cooling circuits, extending the time between coolant drain and replace events and reducing the logistics cost of coolant management in remote energy production locations.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Pneumatic systems on drilling rigs and offshore platforms control choke manifolds, chemical injection valves, wellhead isolation valves, and safety shutdown actuators that are critical to well control and process safety. Moisture in instrument air systems causes corrosion in stainless steel valve bodies, hydrate formation in cold environments, and ice plug formation in pneumatic lines during Arctic operations – all of which create risk of valve actuation failure during emergency conditions. DRYCORE™ desiccant air dryer systems eliminate moisture from compressed instrument air networks, ensuring the dry air quality required by ISA and API standards for pneumatic safety system reliability on drilling and production facilities.'},
            ].map((c, i) => (
              <div key={i} className="og-card">
                <div className="og-card-label">{c.label}</div>
                <div className="og-card-title">{c.title}</div>
                <p className="og-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="og-human">
        <div className="og-human-inner">
          <div>
            <div className="og-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="og-sh2">PROTECTING <span>ENERGY OPERATIONS</span></h2>
            <p className="og-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>In upstream oil and gas, there is no calling a service technician. Equipment must perform between planned maintenance windows that are set weeks or months apart. The filter element installed today will protect systems that cannot be accessed until the next rig move or platform maintenance turnaround.</p>
          </div>
          <div className="og-env">
            <p className="og-env-p">Flaring and fugitive emissions from oil and gas production are under increasing scrutiny from regulators, investors, and community stakeholders. Diesel engines and gas compressors operating at their designed thermal efficiency contribute less to site emissions intensity per unit of production. AQUAGUARD™ protects the fuel injection systems that maintain combustion efficiency in diesel prime movers, while SINTRAX™ preserves lube oil cleanliness in gas compressor frames that operate continuously for months. Together they support the emissions intensity reduction commitments that upstream operators must demonstrate to maintain operating licences and investor confidence in an energy transition environment.</p>
            <div className="og-env-strong">From wellsite to processing facility: clean systems sustain production.</div>
          </div>
        </div>
      </section>

      <section className="og-cta">
        <div className="og-cta-inner">
          <div>
            <div className="og-cta-label">// OIL & GAS CROSS REFERENCE</div>
            <div className="og-cta-h2">OPERATIONAL UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="og-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your operations. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="og-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="og-cta-footer">OIL & GAS PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
