'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Cooltech() {
  const css = `
    .ct{background:#000;color:#fff;min-height:100vh;}
    .ct-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ct-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ct-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .ct-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_7eigh77eigh77eig.png') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .ct-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .ct-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .ct-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ct-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .ct-h1 span{color:#FFF12D;}
    .ct-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ct-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .ct-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .ct-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .ct-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .ct-btn:hover{background:transparent;color:#FFF12D;}
    .ct-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .ct-sec-inner{max-width:1400px;margin:0 auto;}
    .ct-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .ct-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ct-h2 span{color:#FFF12D;}
    .ct-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .ct-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .ct-spec{border-left:1px solid #27272a;padding-left:16px;}
    .ct-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .ct-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .ct-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .ct-img-wrap img{width:100%;height:auto;display:block;filter:brightness(1.05) contrast(1.1);}
    .ct-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .ct-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .ct-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .ct-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .ct-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ct-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ct-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .ct-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .ct-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ct-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ct-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .ct-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .ct-cta-inner{max-width:900px;margin:0 auto;}
    .ct-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .ct-cta-h2 span{color:#FFF12D;}
    .ct-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .ct-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.ct-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .ct-grid2{grid-template-columns:1fr;} .ct-grid3{grid-template-columns:repeat(2,1fr);} .ct-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.ct-grid3{grid-template-columns:1fr;} .ct-hero-p{font-size:12px;} .ct-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ct">
      <style>{css}</style>
      <a href="/?skip=1" className="ct-back">&larr; HOME</a>

      <section className="ct-hero">
        <div className="ct-hero-bg" />
        <div className="ct-hero-ov" />
        <div className="ct-hero-c">
          <div className="ct-eyebrow">// THERMAL SYSTEM / MOD-06</div>
          <h1 className="ct-h1">MAXIMUM<br /><span>COOLTECH™</span></h1>
          <p className="ct-hero-p">Industrial asset protection systems engineered for engine cooling circuits, high-horsepower diesel infrastructure, and critical thermal management systems worldwide. COOLTECH™ technology eliminates cavitation, controls SCA chemistry, and shields cooling circuits from corrosion — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="ct-hero-stat">
            <Link href="/search" className="ct-btn">IDENTIFY SKU</Link>
            <div>
              <span className="ct-stat-label">CORROSION CONTROL</span>
              <span className="ct-stat-val">TOTAL THERMAL STABILITY</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-sec" style={{background:'#050505'}}>
        <div className="ct-sec-inner">
          <div className="ct-grid2">
            <div>
              <div className="ct-eyebrow">// COOLING DYNAMICS</div>
              <h2 className="ct-h2">CONTROLLED RELEASE<br /><span>SCA ADDITIVES</span></h2>
              <p className="ct-p">COOLTECH™ technology functions as an internal chemical reactor. By gradually releasing Supplemental Coolant Additives (SCA), it maintains coolant pH at optimal levels — creating a protective barrier on cylinder liners that prevents damage from vapor bubble implosion (cavitation).</p>
              <p className="ct-p">Engineered for high-horsepower diesel engines operating under continuous load in mining, construction, power generation, and heavy fleet operations across 12 industries worldwide.</p>
              <div className="ct-specs">
                <div className="ct-spec"><span className="ct-spec-label">CHEMICAL BALANCE</span><span className="ct-spec-sub">Scale Prevention</span></div>
                <div className="ct-spec"><span className="ct-spec-label">ENGINEERING</span><span className="ct-spec-sub">By-Pass Flow Filtration</span></div>
                <div className="ct-spec"><span className="ct-spec-label">SCA RELEASE</span><span className="ct-spec-sub">Controlled Chemistry</span></div>
                <div className="ct-spec"><span className="ct-spec-label">OEM MATCHED</span><span className="ct-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="ct-img-wrap">
              <img src={`${WP}/2026/04/COOLANT-FILTER.png`} alt="COOLTECH M-06 Engineering" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="ct-sec">
        <div className="ct-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ct-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// THERMAL ARMOR</div>
            <h2 className="ct-h2" style={{textAlign:'center'}}>COOLING <span>ENGINEERING</span></h2>
          </div>
          <div className="ct-grid3">
            {[
              {title:'ANTI-CAVITATION', desc:'Advanced formula protecting metallic surfaces against high-pressure bubble erosion — preventing liner pitting and catastrophic failure in high-load diesel engines.'},
              {title:'PH CONTROL', desc:'Maintains system alkalinity at optimal levels, preventing acidic corrosion in radiators, water pumps, and cooling circuit components across all operating conditions.'},
              {title:'SYNTHETIC MEDIA', desc:'High-capacity synthetic media traps sediment and chemical precipitates, keeping cooling passages unobstructed for maximum heat transfer efficiency.'},
              {title:'SCALE PREVENTION', desc:'Eliminates scale deposits that reduce heat exchange efficiency and restrict coolant flow — protecting radiators and heat exchangers from premature failure.'},
              {title:'LINER PROTECTION', desc:'Creates a continuous protective film on cylinder liner surfaces, shielding against cavitation erosion during high-load combustion cycles in industrial engines.'},
              {title:'EXTENDED INTERVALS', desc:'Controlled SCA release extends coolant service intervals significantly — reducing maintenance downtime and total cost of ownership across fleet operations worldwide.'},
            ].map((c, i) => (
              <div key={i} className="ct-card">
                <div className="ct-card-title">{c.title}</div>
                <p className="ct-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ct-sec" style={{background:'#000'}}>
        <div className="ct-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="ct-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="ct-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="ct-protocol-grid">
            {[
              {num:'01', title:'CAVITATION CONTROL', desc:'Absolute liner protection against vapor bubble implosion regardless of engine load or operating temperature — preserving cylinder integrity in all conditions.'},
              {num:'02', title:'CHEMISTRY MAINTENANCE', desc:'Controlled SCA release maintains optimal coolant pH throughout the entire service interval — preventing corrosive degradation of all cooling circuit metals.'},
              {num:'03', title:'THERMAL EFFICIENCY', desc:'Continuous removal of scale and sediment maintains maximum heat transfer efficiency — preventing overheating and protecting high-horsepower engines worldwide.'},
            ].map((p, i) => (
              <div key={i} className="ct-protocol-card">
                <div className="ct-protocol-num">{p.num}</div>
                <div className="ct-protocol-title">{p.title}</div>
                <p className="ct-protocol-p">{p.desc}</p>
                <div className="ct-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ct-cta">
        <div className="ct-cta-inner">
          <div className="ct-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="ct-cta-h2">STABILIZE YOUR ENGINE<br /><span>USE COOLTECH™</span></div>
          <p className="ct-cta-p">Do not allow coolant degradation to compromise your engine investment. Upgrade your thermal protection today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="ct-btn">FIND MY SKU &rarr;</Link>
          <p className="ct-cta-footer">// GLOBAL HEAVY DUTY ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
