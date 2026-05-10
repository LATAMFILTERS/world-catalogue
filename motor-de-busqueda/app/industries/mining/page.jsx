'use client';
import Link from 'next/link';

const WP = '/uploads';

export default function Mining() {
  const css = `
    .mn{background:#000;color:#fff;min-height:100vh;}
    .mn-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mn-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mn-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/Mining.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mn-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mn-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mn-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mn-h1 span{color:#FFF12D;}
    .mn-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mn-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mn-sec-inner{max-width:1400px;margin:0 auto;}
    .mn-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mn-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mn-sh2 span{color:#FFF12D;}
    .mn-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mn-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .mn-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .mn-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .mn-video-wrap{position:relative;}
    .mn-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .mn-video-wrap:hover:before{opacity:0.5;}
    .mn-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .mn-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .mn-video-wrap:hover .mn-video-inner video{filter:grayscale(0);opacity:1;}
    .mn-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .mn-btn:hover{background:#fff;}
    .mn-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mn-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .mn-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .mn-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mn-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mn-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mn-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mn-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mn-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .mn-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mn-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .mn-cta{background:#FFF12D;padding:72px 6%;}
    .mn-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .mn-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .mn-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .mn-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .mn-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .mn-cta-btn:hover{background:#111;}
    .mn-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.mn-grid2{grid-template-columns:1fr;} .mn-grid3{grid-template-columns:repeat(2,1fr);} .mn-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.mn-grid3{grid-template-columns:1fr;} .mn-hero-p{font-size:12px;} .mn-cta-inner{flex-direction:column;} .mn-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mn">
      <style>{css}</style>
      <a href="/" className="mn-back">&larr; HOME</a>

      <section className="mn-hero">
        <div className="mn-hero-inner">
          <div className="mn-eyebrow">// STRATEGIC MINING PROTECTION</div>
          <h1 className="mn-h1">MINING<br /><span>EXTRACTION CONTINUITY</span></h1>
          <p className="mn-hero-p">Precision filtration engineered for ultra-class haul trucks, rope shovels, hydraulic face shovels, underground LHD loaders, and rotary drill rigs. Mining represents the most severe filtration environment in any industry – ore dust concentrations above 1,000 mg/m³, fuel stored in remote bulk tanks exposed to condensation and microbial growth, hydraulic systems cycling under extreme shock loads, and machine values exceeding US$5 million where a single contamination failure triggers production losses that compound daily. Our technology protects every critical fluid circuit, extending component life and eliminating the unplanned downtime that directly reduces ore production and mine profitability. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mn-sec" style={{background:'#050505'}}>
        <div className="mn-sec-inner">
          <div className="mn-grid2">
            <div>
              <div className="mn-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="mn-sh2">MINE RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="mn-p">A Caterpillar 797 haul truck carries 363 tonnes of payload and burns over 300 litres of diesel per hour. Its hydraulic system operates at pressures above 350 bar through rock-impact load cycles that spike contamination ingression rates far beyond anything experienced in on-highway applications. Silica particles above ISO 19/17/14 in the hydraulic circuit cause rapid pump wear, hoist cylinder scoring, and steering accumulator failure – all of which halt production in a fleet where every unit going offline reduces mine throughput by hundreds of tonnes per hour.</p>
              <p className="mn-p">Fuel cleanliness is equally critical. Remote mine sites store diesel in above-ground tanks exposed to temperature cycling and condensation, creating the ideal conditions for microbial growth and water accumulation that damages high-pressure injection pumps and requires costly injector replacement. Our extended-interval filtration technologies are validated for Caterpillar, Komatsu, Liebherr, and Hitachi mining platforms, protecting the most capital-intensive mobile equipment assets in any industry.</p>
              <div className="mn-tech-grid">
                <div><div className="mn-tech-label">FUEL SYSTEMS</div><div className="mn-tech-val">AQUAGUARD™</div></div>
                <div><div className="mn-tech-label">LUBRICATION</div><div className="mn-tech-val">SINTRAX™</div></div>
                <div><div className="mn-tech-label">HYDRAULICS</div><div className="mn-tech-val">NANOFORCE™</div></div>
                <div><div className="mn-tech-label">AIR INTAKE</div><div className="mn-tech-val">MACROCORE™</div></div>
              </div>
              <Link href="/technologies" className="mn-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="mn-video-wrap">
              <div className="mn-video-inner">
                <video src="https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/mineria.mp4" autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mn-sec" style={{background:'#000'}}>
        <div className="mn-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mn-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// EQUIPMENT PROTECTION SYSTEMS</div>
            <h2 className="mn-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="mn-grid3">
            {[
              {label:'Fuel Module', title:'AQUAGUARD™', desc:'Mine site bulk diesel storage in above-ground tanks experiences daily thermal cycling that draws moist ambient air into tank headspaces, promoting condensation and microbial growth that produces acidic by-products capable of corroding injection pump bores. AQUAGUARD™ hydrophobic coalescence modules are installed in the fuel transfer train between storage tanks and equipment to remove free water, microbial biomass, and particulates before they reach high-pressure Common Rail injection systems on Tier 4 haul truck and drill rig engines operating in remote locations without nearby service support.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'High-output mine truck diesel engines running at continuous maximum load generate elevated soot concentrations and metallic wear particles that compromise oil performance long before standard drain intervals expire. SINTRAX™ high-capacity oil filtration sustains ISO 4406 cleanliness targets across extended OEM drain intervals on Caterpillar, MTU, and Cummins mining engines, capturing carbonaceous soot agglomerates and ferrous wear debris from crankshaft bearings, turbocharger thrust bearings, and camshaft lobes in engines producing over 2,500 kW of continuous output.'},
              {label:'Hydraulic Systems', title:'NANOFORCE™', desc:'Rope shovels, hydraulic face shovels, and LHD underground loaders depend on hydraulic systems operating at pressures up to 420 bar to deliver the force required for rock breaking, hoist, crowd, and swing functions. Rock impact shock loads generate instantaneous contamination ingression spikes that rapidly degrade hydraulic cleanliness to ISO 21/19/16 or worse without high-capacity return filtration. NANOFORCE™ nanofiber return and pressure elements maintain cleanliness at ISO 16/14/11, protecting proportional control valves and variable displacement piston pumps from the silica and iron ore contamination endemic to hard-rock mining environments.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Underground and open-pit mining machines operate in dust concentrations that can reach 2,000 mg/m³ in ore loading and blasting zones, requiring air filter elements that combine extremely high dust-holding capacity with zero-bypass radial seal designs that prevent circumferential air leakage under vibration. MACROCORE™ synthetic-blend elements for mining machines deliver triple the dust capacity of standard cellulose elements while maintaining restriction below the turbocharger inlet pressure limit, protecting engine cylinders and turbocharger wheels on Komatsu and Liebherr mining trucks from the abrasive silica and iron ore particles that cause rapid engine wear when air filter integrity fails.'},
              {label:'Cooling Systems', title:'COOLTECH™', desc:'Ultra-class mining trucks operating at full payload rating in high-ambient-temperature environments at altitude place severe demands on cooling systems. Radiators partially blocked by ore dust, coolant system scale from hard mine water top-ups, and liner cavitation pitting on wet-sleeve engines are the primary cooling-related failure modes in surface mining. COOLTECH™ supplemental coolant filtration removes scale deposits and abrasive particles from the cooling circuit, maintaining heat transfer efficiency and preventing the liner pitting that creates cylinder gas leakage on high-output mining engines with hundreds of litres of coolant volume.'},
              {label:'Pneumatic Systems', title:'DRYCORE™', desc:'Underground mining equipment relies on compressed air for rock drill actuation, shotcrete nozzle control, and ventilation door operation in environments where humidity levels approach 100% and temperature differentials between surface and underground workings cause severe condensation in airline systems. DRYCORE™ desiccant air dryer elements eliminate free water and high-moisture air from compressed air networks in underground mines, preventing valve freezing in surface infrastructure during winter shutdowns, protecting pneumatic rock drill feed mechanisms, and ensuring reliable remote control actuation of ventilation and blast safety interlocks.'},
            ].map((c, i) => (
              <div key={i} className="mn-card">
                <div className="mn-card-label">{c.label}</div>
                <div className="mn-card-title">{c.title}</div>
                <p className="mn-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mn-human">
        <div className="mn-human-inner">
          <div>
            <div className="mn-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="mn-sh2">PROTECTING <span>MINING OPERATIONS</span></h2>
            <p className="mn-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>In mining, failures do not happen at convenient times. They happen mid-blast cycle, mid-haul, and mid-shift – when every idle machine multiplies into tonnes of unrecovered ore and lost revenue. Filtration that prevents failures is the lowest-cost investment in the mine plan.</p>
          </div>
          <div className="mn-env">
            <p className="mn-env-p">Mining operations face increasing regulatory scrutiny of diesel particulate emissions in underground environments, where DPM concentrations directly affect worker health under mine safety legislation. Tier 4 Final and Stage V engines with DPF and SCR systems dramatically reduce underground DPM exposure – but only when fuel injection systems are kept clean and EGR systems receive clean oil. AQUAGUARD™ and SINTRAX™ protect the injection and lubrication systems that allow emissions aftertreatment to function as designed, supporting mine operators in maintaining compliance with underground diesel emissions standards and ESG reporting obligations to investors and regulators.</p>
            <div className="mn-env-strong">From ore face to haul road: clean systems protect people and production.</div>
          </div>
        </div>
      </section>

      <section className="mn-cta">
        <div className="mn-cta-inner">
          <div>
            <div className="mn-cta-label">// MINING CROSS REFERENCE</div>
            <div className="mn-cta-h2">UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="mn-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your equipment. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="mn-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="mn-cta-footer">MINING PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
