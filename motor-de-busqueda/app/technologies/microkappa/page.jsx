'use client';
import Link from 'next/link';

const WP = 'https://media.elimfilters.com/wp-content/uploads';

export default function Microkappa() {
  const css = `
    .mk{background:#000;color:#fff;min-height:100vh;}
    .mk-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mk-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mk-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .mk-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_7csfs87csfs87csf.png') center top/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .mk-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .mk-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .mk-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mk-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .mk-h1 span{color:#FFF12D;}
    .mk-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mk-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .mk-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .mk-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .mk-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .mk-btn:hover{background:transparent;color:#FFF12D;}
    .mk-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .mk-sec-inner{max-width:1400px;margin:0 auto;}
    .mk-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .mk-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mk-h2 span{color:#FFF12D;}
    .mk-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .mk-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .mk-spec{border-left:1px solid #27272a;padding-left:16px;}
    .mk-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .mk-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .mk-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .mk-img-wrap img{width:100%;height:auto;display:block;filter:brightness(1.1) contrast(1.1);}
    .mk-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .mk-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .mk-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .mk-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mk-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mk-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mk-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .mk-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .mk-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .mk-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mk-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .mk-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .mk-cta-inner{max-width:900px;margin:0 auto;}
    .mk-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .mk-cta-h2 span{color:#FFF12D;}
    .mk-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .mk-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.mk-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .mk-grid2{grid-template-columns:1fr;} .mk-grid3{grid-template-columns:repeat(2,1fr);} .mk-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.mk-grid3{grid-template-columns:1fr;} .mk-hero-p{font-size:12px;} .mk-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mk">
      <style>{css}</style>
      <a href="/?skip=1" className="mk-back">&larr; HOME</a>

      <section className="mk-hero">
        <div className="mk-hero-bg" />
        <div className="mk-hero-ov" />
        <div className="mk-hero-c">
          <div className="mk-eyebrow">// CABIN AIR / MOD-05</div>
          <h1 className="mk-h1">PURIFICATION<br /><span>MICROKAPPA™</span></h1>
          <p className="mk-hero-p">Industrial asset protection systems engineered for operator cabin environments across mining, construction, agriculture, and heavy fleet operations. MICROKAPPA™ dual electrostatic system combines activated carbon and sub-micron synthetic fibers — neutralizing harmful gases, capturing allergens, and protecting operator health in the most demanding industrial environments worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="mk-hero-stat">
            <Link href="/search" className="mk-btn">IDENTIFY SKU</Link>
            <div>
              <span className="mk-stat-label">HEPA PROTECTION</span>
              <span className="mk-stat-val">CONTROLLED ATMOSPHERE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-sec" style={{background:'#050505'}}>
        <div className="mk-sec-inner">
          <div className="mk-grid2">
            <div>
              <div className="mk-eyebrow">// MULTI-LAYER BARRIER</div>
              <h2 className="mk-h2">NEUTRALIZATION OF<br /><span>HARMFUL GASES</span></h2>
              <p className="mk-p">MICROKAPPA™ technology combines electrostatic synthetic fibers with a high-porosity activated carbon core. This structure retains dust and pollen while absorbing exhaust gases, odors, and volatile organic compounds — guaranteeing a healthy operator environment in the most severe industrial conditions.</p>
              <p className="mk-p">Engineered for mining, construction, agriculture, and urban fleet operations — protecting every operator, every shift, in every industrial environment worldwide.</p>
              <div className="mk-specs">
                <div className="mk-spec"><span className="mk-spec-label">FILTRATION EFFICIENCY</span><span className="mk-spec-sub">HEPA Standard</span></div>
                <div className="mk-spec"><span className="mk-spec-label">DESIGN</span><span className="mk-spec-sub">Precision OEM Fit</span></div>
                <div className="mk-spec"><span className="mk-spec-label">DUAL SYSTEM</span><span className="mk-spec-sub">Electrostatic + Carbon</span></div>
                <div className="mk-spec"><span className="mk-spec-label">OEM MATCHED</span><span className="mk-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="mk-img-wrap">
              <img src={`${WP}/2026/04/filtro-de-cabina.png`} alt="MICROKAPPA M-05 Engineering" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mk-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// ENVIRONMENTAL PERFORMANCE</div>
            <h2 className="mk-h2" style={{textAlign:'center'}}>CABIN <span>ENGINEERING</span></h2>
          </div>
          <div className="mk-grid3">
            {[
              {title:'ACTIVATED CARBON', desc:'Specialized carbon layer absorbs acidic gases, exhaust fumes, and fuel vapors — creating a chemically neutral cabin atmosphere for operator health and productivity.'},
              {title:'0.3µ CAPTURE', desc:'Eliminates allergens and ultra-fine particles that standard filters miss — providing HEPA-level protection against biological and chemical airborne contaminants.'},
              {title:'OPTIMIZED FLOW', desc:'Low air restriction protects the HVAC blower motor from overload — maintaining full climate control performance throughout the filter service interval.'},
              {title:'ELECTROSTATIC MEDIA', desc:'Dual electrostatic fiber system actively attracts and captures sub-micron particles — exceeding standard filter efficiency across all industrial cabin environments.'},
              {title:'ZERO BYPASS', desc:'Precision OEM geometry ensures hermetic seal with no gaps for unfiltered air entry — protecting operators from contamination under all operating conditions.'},
              {title:'EXTENDED SERVICE', desc:'High-capacity construction extends cabin filter service intervals — reducing maintenance frequency and total cost of ownership across industrial and fleet operations.'},
            ].map((c, i) => (
              <div key={i} className="mk-card">
                <div className="mk-card-title">{c.title}</div>
                <p className="mk-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-sec" style={{background:'#000'}}>
        <div className="mk-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="mk-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="mk-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="mk-protocol-grid">
            {[
              {num:'01', title:'GAS NEUTRALIZATION', desc:'Activated carbon core absorbs NOx, VOCs, and exhaust gases — maintaining safe cabin air quality for operators in mining, construction, and industrial environments.'},
              {num:'02', title:'PARTICLE CAPTURE', desc:'Electrostatic synthetic media achieves HEPA-level efficiency — capturing pollen, dust, soot, and biological particles that standard cabin filters cannot retain.'},
              {num:'03', title:'HVAC PROTECTION', desc:'Optimized low restriction design prevents blower motor overload — extending HVAC system service life and maintaining full climate control across industrial fleet operations.'},
            ].map((p, i) => (
              <div key={i} className="mk-protocol-card">
                <div className="mk-protocol-num">{p.num}</div>
                <div className="mk-protocol-title">{p.title}</div>
                <p className="mk-protocol-p">{p.desc}</p>
                <div className="mk-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-cta">
        <div className="mk-cta-inner">
          <div className="mk-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="mk-cta-h2">PURE AIR ALWAYS<br /><span>USE MICROKAPPA™</span></div>
          <p className="mk-cta-p">Do not compromise operator health with inadequate cabin filtration. Upgrade to MICROKAPPA™ dual electrostatic protection today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="mk-btn">FIND MY SKU &rarr;</Link>
          <p className="mk-cta-footer">// GLOBAL HEAVY DUTY ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
