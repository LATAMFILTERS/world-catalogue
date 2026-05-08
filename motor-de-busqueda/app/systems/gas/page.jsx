'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function GasSystems() {
  const css = `
    .gs{background:#000;color:#fff;min-height:100vh;}
    .gs-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .gs-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .gs-hero{min-height:72vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2025/08/automobiles-1.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .gs-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .gs-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .gs-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .gs-h1 span{color:#FFF12D;}
    .gs-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .gs-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .gs-sec-inner{max-width:1400px;margin:0 auto;}
    .gs-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .gs-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .gs-h2 span{color:#FFF12D;}
    .gs-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .gs-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}
    .gs-spec{border-left:1px solid #27272a;padding-left:16px;}
    .gs-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .gs-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .gs-img-wrap{background:#000;border:1px solid #1a1a1a;padding:28px;text-align:center;}
    .gs-img-wrap img{width:100%;max-width:400px;height:auto;display:inline-block;filter:contrast(1.1) brightness(1.05);}
    .gs-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.15em;padding:18px 40px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.25s;}
    .gs-btn:hover{background:#fff;transform:translateY(-3px);}
    .gs-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .gs-feature{background:transparent;border-left:1px solid rgba(255,241,45,0.2);padding:32px;transition:all 0.3s cubic-bezier(0.165,0.84,0.44,1);}
    .gs-feature:hover{background:rgba(255,255,255,0.03);border-left:4px solid #FFF12D;transform:translateX(8px);}
    .gs-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .gs-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .gs-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .gs-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .gs-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .gs-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .gs-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .gs-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .gs-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .gs-cta{padding:100px 6%;background:#030303;text-align:center;}
    .gs-cta-inner{max-width:900px;margin:0 auto;}
    .gs-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,7vw,90px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .gs-cta-h2 span{color:#FFF12D;}
    .gs-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    @media(max-width:1024px){.gs-grid2{grid-template-columns:1fr;} .gs-grid3{grid-template-columns:repeat(2,1fr);} .gs-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.gs-grid3{grid-template-columns:1fr;} .gs-hero-p{font-size:12px;} .gs-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="gs">
      <style>{css}</style>
      <a href="/?skip=1" className="gs-back">&larr; HOME</a>

      <section className="gs-hero">
        <div className="gs-hero-inner">
          <div className="gs-eyebrow">// GAS FILTRATION SYSTEMS / LPG-CNG</div>
          <h1 className="gs-h1">GAS SYSTEM<br /><span>PURITY.</span></h1>
          <p className="gs-hero-p">Industrial asset protection systems engineered for LPG and CNG fuel circuits, gas-powered fleets, and critical alternative fuel infrastructure. GASULTRA™ technology eliminates paraffin deposits and micro-impurities from gas injection systems — extending injector lifespan, eliminating unplanned downtime, and reducing total cost of ownership. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 safety standards.</p>
        </div>
      </section>

      <section className="gs-sec" style={{background:'#050505'}}>
        <div className="gs-sec-inner">
          <div className="gs-grid2">
            <div>
              <div className="gs-eyebrow">// GASULTRA™ ARCHITECTURE</div>
              <h2 className="gs-h2">MOLECULAR<br /><span>BARRIER.</span></h2>
              <p className="gs-p">Liquid and vapor phase contaminants are the leading cause of injector failure in gas systems. GASULTRA™ neutralizes heavy hydrocarbons and paraffin deposits before they reach the combustion chamber — protecting LPG and CNG injection systems worldwide.</p>
              <p className="gs-p">Engineered for automotive gas conversions, commercial LPG fleets, CNG bus operations, and industrial gas-powered machinery operating under continuous load conditions.</p>
              <div className="gs-specs">
                <div className="gs-spec"><span className="gs-spec-label">PARAFFIN TRAP</span><span className="gs-spec-sub">Advanced Separation</span></div>
                <div className="gs-spec"><span className="gs-spec-label">ISO CERTIFIED</span><span className="gs-spec-sub">Safety Standards</span></div>
                <div className="gs-spec"><span className="gs-spec-label">LPG / CNG</span><span className="gs-spec-sub">Dual System Coverage</span></div>
                <div className="gs-spec"><span className="gs-spec-label">OEM MATCHED</span><span className="gs-spec-sub">5,000+ Cross-Refs</span></div>
              </div>
              <Link href="/search" className="gs-btn">FIND MY GAS FILTER</Link>
            </div>
            <div className="gs-img-wrap">
              <img src={`${WP}/2026/02/Gemini_Generated_Image_bak2csbak2csbak2.png`} alt="GASULTRA Filter Core" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="gs-sec">
        <div className="gs-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="gs-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// GASULTRA™ TECHNOLOGY DNA</div>
            <h2 className="gs-h2" style={{textAlign:'center'}}>TOTAL GAS <span>SYSTEM DEFENSE</span></h2>
          </div>
          <div className="gs-grid3">
            {[
              {label:'GASULTRA™ / PARAFFIN', title:'PARAFFIN CONTROL', desc:'Advanced separation media captures heavy hydrocarbon deposits before they clog LPG and CNG injectors — preventing premature failure and power loss.'},
              {label:'GASULTRA™ / VAPOR', title:'VAPOR PHASE FILTER', desc:'Eliminates liquid and vapor phase contaminants from the gas stream — ensuring consistent fuel quality delivery to the combustion chamber under all conditions.'},
              {label:'GASULTRA™ / INJECTOR', title:'INJECTOR DEFENSE', desc:'Molecular barrier prevents micro-impurities from reaching gas injection nozzles — extending injector service life and maintaining peak combustion efficiency.'},
              {label:'GASULTRA™ / FLOW', title:'OPTIMIZED FLOW', desc:'Low restriction media design maintains consistent gas pressure and flow rate throughout the service interval — preserving engine power and fuel economy.'},
              {label:'GASULTRA™ / SAFETY', title:'SAFETY COMPLIANCE', desc:'Engineered to meet ISO certified safety standards for LPG and CNG applications — ensuring full compliance with gas system regulations worldwide.'},
              {label:'GASULTRA™ / SERVICE', title:'EXTENDED INTERVALS', desc:'High-capacity filtration media extends service intervals beyond conventional gas filters — reducing maintenance frequency and total cost of ownership.'},
            ].map((f, i) => (
              <div key={i} className="gs-feature">
                <div className="gs-feature-label">{f.label}</div>
                <div className="gs-feature-title">{f.title}</div>
                <p className="gs-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gs-sec" style={{background:'#000'}}>
        <div className="gs-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="gs-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="gs-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="gs-protocol-grid">
            {[
              {num:'01', title:'PARAFFIN ELIMINATION', desc:'Absolute removal of paraffin and heavy hydrocarbon deposits regardless of fuel quality or ambient temperature — protecting gas injectors in all operating conditions.'},
              {num:'02', title:'MOLECULAR FILTRATION', desc:'High-precision secondary filtration captures micro-impurities that standard gas filters miss — ensuring maximum engine life in LPG and CNG applications worldwide.'},
              {num:'03', title:'SYSTEM LONGEVITY', desc:'Consistent fuel purity delivered at every combustion cycle — protecting injectors, regulators, and combustion chamber components from contamination-driven failure.'},
            ].map((p, i) => (
              <div key={i} className="gs-protocol-card">
                <div className="gs-protocol-num">{p.num}</div>
                <div className="gs-protocol-title">{p.title}</div>
                <p className="gs-protocol-p">{p.desc}</p>
                <div className="gs-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gs-cta">
        <div className="gs-cta-inner">
          <div className="gs-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// OPERATIONAL CONTINUITY</div>
          <div className="gs-cta-h2">PROTECT YOUR<br /><span>INJECTORS.</span></div>
          <p className="gs-cta-p">Investing in GASULTRA™ is investing in the long-term health of your engine. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 safety standards for LPG and CNG applications worldwide.</p>
          <Link href="/search" className="gs-btn">FIND MY GAS FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
