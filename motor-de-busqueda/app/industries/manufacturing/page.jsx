'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Manufacturing() {
  const css = `
    .mf{background:#000;color:#fff;min-height:100vh;}
    .mf-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mf-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mf-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/manufactura.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mf-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mf-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mf-h1 span{color:#FFF12D;}
    .mf-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mf-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-sec-inner{max-width:1400px;margin:0 auto;}
    .mf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mf-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mf-sh2 span{color:#FFF12D;}
    .mf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mf-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .mf-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .mf-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .mf-video-wrap{position:relative;}
    .mf-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .mf-video-wrap:hover:before{opacity:0.5;}
    .mf-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .mf-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .mf-video-wrap:hover .mf-video-inner video{filter:grayscale(0);opacity:1;}
    .mf-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .mf-btn:hover{background:#fff;}
    .mf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mf-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .mf-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .mf-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mf-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mf-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mf-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mf-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mf-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .mf-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mf-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .mf-cta{background:#FFF12D;padding:72px 6%;}
    .mf-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .mf-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .mf-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .mf-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .mf-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .mf-cta-btn:hover{background:#111;}
    .mf-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.mf-grid2{grid-template-columns:1fr;} .mf-grid3{grid-template-columns:repeat(2,1fr);} .mf-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.mf-grid3{grid-template-columns:1fr;} .mf-hero-p{font-size:12px;} .mf-cta-inner{flex-direction:column;} .mf-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mf">
      <style>{css}</style>
      <a href="/" className="mf-back">&larr; HOME</a>

      <section className="mf-hero">
        <div className="mf-hero-inner">
          <div className="mf-eyebrow">// STRATEGIC MANUFACTURING PROTECTION</div>
          <h1 className="mf-h1">MANUFACTURING<br /><span>PRODUCTION CONTINUITY</span></h1>
          <p className="mf-hero-p">Precision filtration engineered for CNC machining centres, hydraulic presses, injection moulding machines, industrial compressors, and continuous-process production lines. Manufacturing plants run on tight production schedules where contaminated hydraulic fluid causes servo valve hunting, contaminated cutting fluid produces out-of-tolerance parts, and dirty compressed air drives defect rates in pneumatic assembly systems. Our technology protects hydraulic, lubrication, compressed air, coolant, and process fluid circuits – eliminating the contamination-driven stoppages that erode OEE, damage precision tooling, and compromise product quality. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mf-sec" style={{background:'#050505'}}>
        <div className="mf-sec-inner">
          <div className="mf-grid2">
            <div>
              <div className="mf-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="mf-sh2">PLANT RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="mf-p">Hydraulic systems in stamping presses and injection moulding machines operate at pressures above 200 bar with servo valves that fail at contamination levels above ISO 16/14/11. A single contamination event causing a proportional valve to stick can halt an entire transfer line, triggering scrap costs, tooling damage, and production shortfalls that cascade through supply chain commitments. Standard-grade industrial filters cannot sustain target cleanliness codes under the high-cycle, high-ingression conditions of 24/7 production environments.</p>
              <p className="mf-p">OEE in world-class manufacturing facilities depends on preventing the micro-stoppages caused by contaminated fluids. Our filtration technologies are validated to ISO 4406 and DIN 51524 standards, maintaining the hydraulic and lubrication cleanliness levels demanded by Parker, Bosch Rexroth, and Moog servo systems – keeping precision production lines at rated output across multi-shift operations in automotive, aerospace, food, and pharmaceutical manufacturing environments.</p>
              <div className="mf-tech-grid">
                <div><div className="mf-tech-label">HYDRAULICS</div><div className="mf-tech-val">NANOFORCE™</div></div>
                <div><div className="mf-tech-label">COMPRESSED AIR</div><div className="mf-tech-val">MACROCORE™</div></div>
                <div><div className="mf-tech-label">LUBRICATION</div><div className="mf-tech-val">SINTRAX™</div></div>
                <div><div className="mf-tech-label">COOLING</div><div className="mf-tech-val">COOLTECH™</div></div>
              </div>
              <Link href="/technologies" className="mf-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="mf-video-wrap">
              <div className="mf-video-inner">
                <video src="https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/maquinaria.mp4" autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mf-sec" style={{background:'#000'}}>
        <div className="mf-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FACILITY PROTECTION SYSTEMS</div>
            <h2 className="mf-sh2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="mf-grid3">
            {[
              {label:'Hydraulic Module', title:'NANOFORCE™', desc:'Stamping presses, die-casting machines, and CNC transfer line clamping circuits require hydraulic fluid cleanliness at ISO 16/14/11 or better to protect servo proportional valves with spool clearances under 3 microns. NANOFORCE™ nanofiber elements maintain target cleanliness codes even in high-ingression environments where contaminant generation from cylinder seals and pump wear is continuous, protecting the Rexroth, Parker, and Moog servo systems that control positioning accuracy and cycle repeatability in precision manufacturing.'},
              {label:'Compressed Air', title:'MACROCORE™', desc:'Pneumatic assembly tools, pick-and-place robots, and precision air gauging systems require clean, dry compressed air that meets ISO 8573 Class 1-2 standards. Oil aerosol and water vapour in compressed air lines cause pneumatic actuator seal degradation, corrosion in stainless steel fittings, and contamination of products in cleanroom assembly environments. MACROCORE™ coalescing filter elements remove sub-micron oil mist and bulk liquid water from compressed air at flow rates from small toolroom compressors to large central plant systems.'},
              {label:'Lubrication Module', title:'SINTRAX™', desc:'Industrial gearboxes, spindle bearings, and circulating lube systems in machining centres accumulate metallic wear debris that accelerates bearing fatigue and gear flank micropitting. SINTRAX™ high-efficiency lube filtration maintains ISO 4406 oil cleanliness in both mineral and synthetic lubricants, extending oil drain intervals, protecting precision rolling-element bearings operating at high DN values, and reducing unplanned gearbox repairs in automated transfer lines and machining cell rotary tables.'},
              {label:'Cooling Module', title:'COOLTECH™', desc:'Central coolant systems serving multiple machining centres accumulate aluminium swarf, grinding grit, and tramp oil that cause corrosion of aluminium and cast iron components and degrade coolant biocide performance. Scale deposits in heat exchanger circuits reduce temperature control accuracy in climate-sensitive aerospace and medical device machining operations. COOLTECH™ coolant circuit filtration removes particulates and contaminants, maintaining heat exchanger efficiency and extending coolant service life across large centralised manufacturing cooling systems.'},
              {label:'Air Intake', title:'SYNTEPORE™', desc:'Welding fumes, grinding dust, paint spray aerosols, and chemical vapours in manufacturing halls present both occupational health risks and product quality threats in assembly and finishing operations. SYNTEPORE™ synthetic filter media combines high-efficiency particulate capture with controlled airflow resistance, providing reliable dust collection performance in welding extraction systems, robotic paint booth intake filters, and make-up air units in automotive body shops, fabrication plants, and electronics assembly clean zones.'},
              {label:'Process Fluids', title:'AQUAGUARD™', desc:'Metalworking coolants and cutting fluids contaminated with tramp oil, swarf fines, and bacterial growth cause workpiece surface finish degradation, accelerated tool wear, and dermatitis among machine operators. AQUAGUARD™ fluid management filtration removes tramp oil and fine particulates from coolant sumps, extending fluid service life and maintaining the pH and concentration control required for dimensional stability in close-tolerance CNC turning and grinding operations for automotive and aerospace precision components.'},
            ].map((c, i) => (
              <div key={i} className="mf-card">
                <div className="mf-card-label">{c.label}</div>
                <div className="mf-card-title">{c.title}</div>
                <p className="mf-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mf-human">
        <div className="mf-human-inner">
          <div>
            <div className="mf-eyebrow">// HUMAN + ENVIRONMENT</div>
            <h2 className="mf-sh2">PROTECTING <span>INDUSTRIAL OPERATIONS</span></h2>
            <p className="mf-p" style={{fontStyle:'italic',fontSize:'18px',color:'rgba(255,255,255,0.8)'}}>Every micro-stoppage caused by a contaminated servo valve, a seized spindle bearing, or an out-of-spec compressed air supply is a direct charge against OEE. The highest-performing plants treat filtration as precision infrastructure, not routine maintenance.</p>
          </div>
          <div className="mf-env">
            <p className="mf-env-p">Clean manufacturing fluids reduce waste disposal volumes, energy consumption, and hazardous chemical use. Cutting fluids managed with AQUAGUARD™ particle removal last three to five times longer than untreated sumps, dramatically reducing the volume of waste coolant requiring hazardous disposal. Hydraulic systems maintained at ISO 16/14/11 cleanliness consume less pump energy and generate less heat than contaminated circuits, lowering plant energy intensity. SYNTEPORE™ welding fume extraction protects worker respiratory health and reduces the ventilation energy cost of maintaining safe air quality in high-throughput production environments.</p>
            <div className="mf-env-strong">From precision cell to finished product: clean fluids build quality.</div>
          </div>
        </div>
      </section>

      <section className="mf-cta">
        <div className="mf-cta-inner">
          <div>
            <div className="mf-cta-label">// MANUFACTURING CROSS REFERENCE</div>
            <div className="mf-cta-h2">PRODUCTION UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="mf-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your systems. Precision-matched across 5,000+ cross-references worldwide.</p>
          </div>
          <Link href="/search" className="mf-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="mf-cta-footer">MANUFACTURING PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
