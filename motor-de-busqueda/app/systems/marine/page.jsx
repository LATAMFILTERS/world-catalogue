'use client';
import Link from 'next/link';

const WP = 'https://cdn.elimfilters.com';

export default function MarineSystems() {
  const css = `
    .mr{background:#000;color:#fff;min-height:100vh;}
    .mr-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mr-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mr-hero{min-height:85vh;display:flex;align-items:center;background:linear-gradient(90deg,rgba(0,0,0,0.9) 35%,rgba(0,0,0,0) 100%),url('${WP}/2026/02/pexels-asadphoto-29318858-scaled.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mr-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mr-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mr-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,9vw,85px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mr-h1 span{color:#FFF12D;}
    .mr-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:580px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);}
    .mr-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mr-sec-inner{max-width:1400px;margin:0 auto;}
    .mr-grid2{display:grid;grid-template-columns:1fr 1.1fr;gap:64px;align-items:center;}
    .mr-grid2r{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .mr-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mr-h2 span{color:#FFF12D;}
    .mr-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .mr-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}
    .mr-spec{border-top:1px solid #27272a;padding-top:12px;}
    .mr-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .mr-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;letter-spacing:0.05em;}
    .mr-product-card{background:radial-gradient(circle at center,#111 0%,#000 100%);border:1px solid #1a1a1a;padding:15px;}
    .mr-product-card img{width:100%;height:auto;display:block;}
    .mr-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:13px;letter-spacing:0.1em;padding:22px 45px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;}
    .mr-btn:hover{transform:translateY(-3px);}
    .mr-tspec{border-left:3px solid #FFF12D;padding:15px 0 15px 24px;margin-bottom:20px;background:rgba(255,241,45,0.02);}
    .mr-tspec-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:8px;}
    .mr-tspec-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;letter-spacing:0.03em;}
    .mr-quote-card{background:linear-gradient(145deg,#080808,#000);border:1px solid #1a1a1a;padding:48px;}
    .mr-quote-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.7;font-style:italic;letter-spacing:0.05em;}
    .mr-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mr-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:36px 28px;transition:all 0.3s;height:100%;}
    .mr-feature:hover{transform:translateY(-5px);background:rgba(255,255,255,0.05);}
    .mr-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mr-feature-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .mr-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mr-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mr-protocol-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .mr-protocol-num{position:absolute;right:-10px;top:-10px;font-family:'Russo One',sans-serif;font-size:80px;color:rgba(255,241,45,0.03);line-height:1;}
    .mr-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .mr-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mr-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .mr-cta{padding:120px 6%;background:#000;text-align:center;}
    .mr-cta-inner{max-width:900px;margin:0 auto;}
    .mr-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(42px,8vw,90px);text-transform:uppercase;line-height:0.95;margin-bottom:40px;}
    .mr-cta-h2 span{color:#FFF12D;}
    .mr-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.3em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:40px;}
    @media(max-width:1024px){.mr-grid2{grid-template-columns:1fr;} .mr-grid2r{grid-template-columns:1fr;} .mr-grid3{grid-template-columns:repeat(2,1fr);} .mr-protocol-grid{grid-template-columns:1fr;} .mr-hero{background:linear-gradient(to bottom,rgba(0,0,0,1) 20%,rgba(0,0,0,0.2) 50%,rgba(0,0,0,0.9) 100%),url('${WP}/2026/02/pexels-asadphoto-29318858-scaled.jpg') 75% center/cover no-repeat;}}
    @media(max-width:768px){.mr-grid3{grid-template-columns:1fr;} .mr-hero-p{font-size:12px;} .mr-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mr">
      <style>{css}</style>
      <a href="/?skip=1" className="mr-back">&larr; HOME</a>

      <section className="mr-hero">
        <div className="mr-hero-inner">
          <div className="mr-eyebrow">// NAVAL SYSTEMS / SYS-13</div>
          <h1 className="mr-h1">MARINE<br /><span>FILTRATION.</span></h1>
          <p className="mr-hero-p">Industrial asset protection systems engineered for offshore vessels, marine engines, and critical naval fuel infrastructure. MARINECLEAN™ technology provides advanced anti-corrosion shielding — protecting fuel systems, hydraulic circuits, and lubrication lines from salt spray, water contamination, and galvanic corrosion. Extending asset lifespan and ensuring maximum operational continuity in offshore environments. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mr-sec" style={{background:'#050505'}}>
        <div className="mr-sec-inner">
          <div className="mr-grid2">
            <div className="mr-product-card">
              <img src={`${WP}/2026/04/Gemini_Generated_Image_wg6rfqwg6rfqwg6r.png`} alt="ELIMFILTERS MARINECLEAN fuel filter for marine engines" loading="lazy" />
            </div>
            <div>
              <div className="mr-eyebrow">// ANTI-CORROSION ENGINEERING</div>
              <h2 className="mr-h2">SALT SPRAY<br /><span>RESISTANCE.</span></h2>
              <p className="mr-p">ELIMFILTERS systems are engineered to neutralize the impact of galvanic corrosion — protecting critical engine components in high-salinity environments across offshore, coastal, and inland waterway operations worldwide.</p>
              <p className="mr-p">MARINECLEAN™ delivers 99.9% water and sediment separation using naval-grade alloy housings — ensuring reliable fuel delivery in the most demanding marine operating conditions.</p>
              <div className="mr-specs">
                <div className="mr-spec"><span className="mr-spec-label">PURIFICATION</span><span className="mr-spec-sub">99.9% Water/Sediment</span></div>
                <div className="mr-spec"><span className="mr-spec-label">PROTECTION</span><span className="mr-spec-sub">Naval Grade Alloy</span></div>
                <div className="mr-spec"><span className="mr-spec-label">CORROSION SHIELD</span><span className="mr-spec-sub">Galvanic Protection</span></div>
                <div className="mr-spec"><span className="mr-spec-label">OEM MATCHED</span><span className="mr-spec-sub">5,000+ Cross-Refs</span></div>
              </div>
              <Link href="/search" className="mr-btn">ACCESS SEARCH ENGINE &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mr-sec" style={{background:'#000'}}>
        <div className="mr-sec-inner">
          <div className="mr-grid2r">
            <div>
              <div className="mr-eyebrow">// CRITICAL SPECIFICATIONS</div>
              <h2 className="mr-h2">SAFETY IN<br /><span>OPEN WATERS.</span></h2>
              <div className="mr-tspec">
                <div className="mr-tspec-title">HYDROPHOBIC SEPARATION</div>
                <p className="mr-tspec-p">Eliminates water carryover that causes catastrophic injector failure in marine diesel and gasoline engines operating in high-humidity offshore environments.</p>
              </div>
              <div className="mr-tspec">
                <div className="mr-tspec-title">HIGH-IMPACT HOUSING</div>
                <p className="mr-tspec-p">Superior structural integrity against constant hull vibrations and marine shock loads — maintaining filter performance and seal integrity in all sea states.</p>
              </div>
              <div className="mr-tspec">
                <div className="mr-tspec-title">SALT SPRAY RESISTANCE</div>
                <p className="mr-tspec-p">Naval-grade alloy construction resists corrosion from salt spray and marine atmosphere — extending housing service life in the harshest offshore conditions.</p>
              </div>
            </div>
            <div className="mr-quote-card">
              <div className="mr-eyebrow" style={{marginBottom:'24px'}}>// MARINECLEAN™ ENGINEERING</div>
              <p className="mr-quote-p">"Marine reliability requires components that do not yield to the environment. MARINECLEAN™ is our technical response to the oceanic challenge — protecting every vessel, every voyage, in every sea condition worldwide."</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mr-sec">
        <div className="mr-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mr-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// MARINECLEAN™ TECHNOLOGY DNA</div>
            <h2 className="mr-h2" style={{textAlign:'center'}}>TOTAL MARINE <span>SYSTEM DEFENSE</span></h2>
          </div>
          <div className="mr-grid3">
            {[
              {label:'MARINECLEAN™ / FUEL', title:'WATER SEPARATION', desc:'Molecular water separation for both diesel and gasoline fuels — eliminating water carryover that destroys injectors and causes engine failure in offshore operations.'},
              {label:'MARINECLEAN™ / HOUSING', title:'NAVAL GRADE BUILD', desc:'Naval-grade alloy housings resist galvanic corrosion and salt spray — maintaining structural integrity and seal performance in the harshest marine environments.'},
              {label:'MARINECLEAN™ / STABILITY', title:'VIBRATION RESISTANCE', desc:'Maintains filtration efficiency under extreme pressure fluctuations and constant hull vibrations — protecting marine engines in all sea states and vessel speeds.'},
              {label:'MARINECLEAN™ / COALESCENCE', title:'MOLECULAR FILTRATION', desc:'Advanced coalescence media captures micro-water droplets and fine sediment — ensuring pure fuel delivery to Common Rail injection systems in marine diesel engines.'},
              {label:'MARINECLEAN™ / OEM', title:'PRECISION FIT', desc:'Perfect fitment under international OEM standards across 5,000+ cross-references — compatible with all major marine engine platforms worldwide.'},
              {label:'MARINECLEAN™ / SERVICE', title:'EXTENDED INTERVALS', desc:'High-capacity marine-grade media extends service intervals — reducing maintenance frequency and total cost of ownership across offshore and coastal fleet operations.'},
            ].map((f, i) => (
              <div key={i} className="mr-feature">
                <div className="mr-feature-label">{f.label}</div>
                <div className="mr-feature-title">{f.title}</div>
                <p className="mr-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mr-sec" style={{background:'#050505'}}>
        <div className="mr-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="mr-eyebrow">// NAVAL VALIDATION</div>
            <h2 className="mr-h2" style={{marginTop:'8px'}}>PROVEN PERFORMANCE</h2>
          </div>
          <div className="mr-protocol-grid">
            {[
              {num:'01', title:'STABILITY', desc:'Maintains filtration efficiency under extreme pressure fluctuations and constant vessel movement — protecting marine engines in all sea states and operating conditions worldwide.'},
              {num:'02', title:'COALESCENCE', desc:'Molecular water separation technology for both diesel and gasoline fuels — eliminating the water contamination that causes catastrophic injector failure in marine engines.'},
              {num:'03', title:'PRECISION', desc:'Perfect fitment under international OEM standards — precision-matched to OEM specifications across 5,000+ cross-references for all major marine engine platforms.'},
            ].map((p, i) => (
              <div key={i} className="mr-protocol-card">
                <div className="mr-protocol-num">{p.num}</div>
                <div className="mr-protocol-title">{p.title}</div>
                <p className="mr-protocol-p">{p.desc}</p>
                <div className="mr-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mr-cta">
        <div className="mr-cta-inner">
          <div className="mr-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// ELIMFILTERS GLOBAL MANUFACTURING STANDARDS 2026</div>
          <div className="mr-cta-h2">EVERY VESSEL.<br /><span>EVERY VOYAGE.</span></div>
          <Link href="/search" className="mr-btn">SEARCH MY FILTER &rarr;</Link>
          <p className="mr-cta-footer">// ELIMFILTERS GLOBAL MANUFACTURING STANDARDS 2026</p>
        </div>
      </section>
    </div>
  );
}
