'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Automotive() {
  const css = `
    .au{background:#000;color:#fff;min-height:100vh;}
    .au-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .au-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .au-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2026/04/pexels-mohit-hambiria-92377455-31396372-scaled.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .au-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .au-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .au-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .au-h1 span{color:#FFF12D;}
    .au-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .au-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .au-sec-inner{max-width:1400px;margin:0 auto;}
    .au-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .au-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .au-h2 span{color:#FFF12D;}
    .au-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .au-tech-specs{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .au-tech-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .au-tech-spec-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .au-video-wrap{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;}
    .au-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;transition:all 0.7s;}
    .au-video-wrap:hover video{filter:grayscale(0);opacity:1;}
    .au-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .au-btn:hover{background:#fff;}
    .au-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
    .au-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .au-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .au-card.featured{border-top:3px solid #FFF12D;}
    .au-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .au-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .au-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .au-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .au-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .au-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .au-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .au-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .au-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .au-cta{background:#FFF12D;padding:72px 6%;}
    .au-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .au-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .au-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .au-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .au-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .au-cta-btn:hover{background:#111;}
    @media(max-width:1024px){.au-grid4{grid-template-columns:repeat(2,1fr);} .au-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.au-grid2{grid-template-columns:1fr;} .au-grid4{grid-template-columns:1fr;} .au-hero-p{font-size:12px;} .au-cta-inner{flex-direction:column;} .au-tech-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="au">
      <style>{css}</style>
      <a href="/?skip=1" className="au-back">&larr; HOME</a>

      <section className="au-hero">
        <div className="au-hero-inner">
          <div className="au-eyebrow">// LD AUTOMOTIVE SERIES</div>
          <h1 className="au-h1">INDUSTRIAL<br /><span>OVER-ENGINEERING.</span></h1>
          <p className="au-hero-p">Industrial asset protection systems engineered for passenger vehicles, light commercial fleets, and critical gasoline-powered infrastructure. Our filtration technology shields air intake systems, fuel circuits, lubrication lines, and cabin environments from contamination — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="au-sec" style={{background:'#050505'}}>
        <div className="au-sec-inner">
          <div className="au-grid2">
            <div>
              <div className="au-eyebrow">// URBAN PROTECTION PROTOCOL</div>
              <h2 className="au-h2">STABLE PERFORMANCE IN<br /><span>CRITICAL CONDITIONS</span></h2>
              <p className="au-p">Heavy traffic and frequent starts lead to accelerated engine degradation. Our filtration architecture neutralizes these risks using high-capacity synthetic media engineered for light and commercial vehicle applications worldwide.</p>
              <p className="au-p">Passenger vehicles deserve the same engineering discipline applied to ELIMFILTERS heavy-duty machinery — protecting every start, every mile, across 5,000+ OEM cross-references.</p>
              <div className="au-tech-specs">
                <div><div className="au-tech-spec-label">AIR INTAKE</div><div className="au-tech-spec-val">MACROCORE™</div></div>
                <div><div className="au-tech-spec-label">LUBRICATION</div><div className="au-tech-spec-val">SINTRAX™</div></div>
                <div><div className="au-tech-spec-label">FUEL SYSTEM</div><div className="au-tech-spec-val">NANOFORCE™</div></div>
                <div><div className="au-tech-spec-label">CABIN AIR</div><div className="au-tech-spec-val">MICROKAPPA™</div></div>
              </div>
              <Link href="/technologies" className="au-btn">VIEW TECHNOLOGY</Link>
            </div>
            <div className="au-video-wrap">
              <video src={`${WP}/2025/08/5309381-hd_1920_1080_25fps.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="au-sec" style={{background:'#000'}}>
        <div className="au-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="au-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// GLOBAL TECHNOLOGY MATRIX</div>
            <h2 className="au-h2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>ENGINEERING</span></h2>
          </div>
          <div className="au-grid4">
            {[
              {label:'Air Module', title:'MACROCORE™', desc:'Absolute capture of microscopic particles ensuring perfect stoichiometric combustion and maximum engine protection in urban environments.', featured:false},
              {label:'Oil Module', title:'SINTRAX™', desc:'Maintains oil viscosity and cleanliness under severe thermal stress in city environments — extending engine life and reducing maintenance costs.', featured:false},
              {label:'Fuel Module', title:'NANOFORCE™', desc:'Nanofiber technology designed to eliminate critical contaminants and water in injection systems — protecting Common Rail injectors from premature wear.', featured:true},
              {label:'Environmental Health', title:'MICROKAPPA™', desc:'Biological and chemical barrier against allergens and pollutants from urban exhaust — safeguarding operator health in light and commercial vehicles.', featured:false},
            ].map((c, i) => (
              <div key={i} className={`au-card${c.featured ? ' featured' : ''}`}>
                <div className="au-card-label">{c.label}</div>
                <div className="au-card-title">{c.title}</div>
                <p className="au-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="au-sec" style={{background:'#030303'}}>
        <div className="au-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="au-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="au-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="au-protocol-grid">
            {[
              {num:'01', title:'URBAN STRESS', desc:'Engineered for stop-and-go traffic cycles that accelerate contamination buildup — protecting engines in the most demanding city driving conditions worldwide.'},
              {num:'02', title:'COLD START OPS', desc:'Optimized media performance from the first second of ignition — reducing cold-start wear that accounts for 80% of total engine wear in light vehicles.'},
              {num:'03', title:'EXTENDED SERVICE', desc:'Advanced synthetic media extends service intervals versus conventional filters — reducing maintenance frequency and total cost of ownership significantly.'},
            ].map((p, i) => (
              <div key={i} className="au-protocol-card">
                <div className="au-protocol-num">{p.num}</div>
                <div className="au-protocol-title">{p.title}</div>
                <p className="au-protocol-p">{p.desc}</p>
                <div className="au-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="au-cta">
        <div className="au-cta-inner">
          <div>
            <div className="au-cta-label">// AUTOMOTIVE CROSS REFERENCE</div>
            <div className="au-cta-h2">FAILURE IS NOT AN OPTION.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="au-cta-p">Access our LD Series database. Search by OEM or part number to find the industrial-grade match for your vehicle. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="au-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
