'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

export default function CabinSystems() {
  const css = `
    .cb{background:#000;color:#fff;min-height:100vh;}
    .cb-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .cb-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .cb-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/Gemini_Generated_Image_w9i6zgw9i6zgw9i6-e1772079558684.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cb-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .cb-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .cb-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .cb-h1 span{color:#FFF12D;}
    .cb-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .cb-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cb-sec-inner{max-width:1400px;margin:0 auto;}
    .cb-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .cb-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .cb-h2 span{color:#FFF12D;}
    .cb-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .cb-img-wrap{background:#000;padding:10px;border:1px solid #1a1a1a;}
    .cb-img-wrap img{width:100%;height:auto;display:block;filter:grayscale(0.2) contrast(1.1);}
    .cb-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.1em;padding:20px 45px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.25s;border:2px solid #FFF12D;margin-top:24px;}
    .cb-btn:hover{background:transparent;color:#FFF12D;}
    .cb-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .cb-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:36px 28px;transition:all 0.3s;height:100%;box-sizing:border-box;}
    .cb-feature:hover{transform:translateY(-5px);background:rgba(255,255,255,0.06);}
    .cb-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .cb-feature-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .cb-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .cb-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .cb-protocol-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .cb-protocol-num{position:absolute;right:-10px;top:-10px;font-family:'Russo One',sans-serif;font-size:80px;color:rgba(255,241,45,0.03);line-height:1;}
    .cb-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .cb-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .cb-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .cb-cta{padding:100px 6%;background:radial-gradient(circle at center,#111 0%,#000 100%);text-align:center;}
    .cb-cta-inner{max-width:900px;margin:0 auto;}
    .cb-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,7vw,90px);text-transform:uppercase;line-height:0.9;margin-bottom:40px;}
    .cb-cta-h2 span{color:#FFF12D;}
    @media(max-width:1024px){.cb-grid2{grid-template-columns:1fr;} .cb-grid3{grid-template-columns:repeat(2,1fr);} .cb-protocol-grid{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.cb-grid3{grid-template-columns:1fr;} .cb-protocol-grid{grid-template-columns:1fr;} .cb-hero-p{font-size:12px;} .cb-hero{background:linear-gradient(0deg,rgba(0,0,0,0.7) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/2026/02/Gemini_Generated_Image_w9i6zgw9i6zgw9i6-e1772079558684.png') 85% center/cover no-repeat;}}
  `;

  return (
    <div className="cb">
      <style>{css}</style>
      <a href="/?skip=1" className="cb-back">&larr; HOME</a>

      <section className="cb-hero">
        <div className="cb-hero-inner">
          <div className="cb-eyebrow">// CABIN FILTRATION / SYS-02</div>
          <h1 className="cb-h1">CABIN<br /><span>FILTERS.</span></h1>
          <p className="cb-hero-p">Industrial asset protection systems engineered for operator cabin environments in mining, construction, agriculture, and heavy fleet operations. MICROKAPPA™ technology shields cabin air from allergens, soot, harmful gases, and fine particulates — protecting operator health, extending HVAC lifespan, and ensuring zero-compromise air quality across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="cb-sec" style={{background:'#050505'}}>
        <div className="cb-sec-inner">
          <div className="cb-grid2">
            <div>
              <div className="cb-eyebrow">// MICROKAPPA™ TECHNOLOGY</div>
              <h2 className="cb-h2">100% PURE AIR.<br /><span>PROTECTED OPERATOR.</span></h2>
              <p className="cb-p">Operators are exposed to allergens, soot, and harmful gases every shift. MICROKAPPA™ utilizes multi-stage filtration to guarantee a neutral and safe atmosphere, ensuring productivity and long-term health across all industrial environments.</p>
              <p className="cb-p">Engineered for mining, construction, agriculture, and urban fleet operations — protecting every operator, every shift, across 5,000+ OEM cross-references worldwide.</p>
              <Link href="/technologies/microkappa" className="cb-btn">VIEW MICROKAPPA™ TECHNOLOGY</Link>
            </div>
            <div className="cb-img-wrap">
              <img src={`${WP}/2025/08/Screenshot-2025-08-20-203624.webp`} alt="ELIMFILTERS MICROKAPPA Cabin Filter System" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="cb-sec">
        <div className="cb-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="cb-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// LAYER BY LAYER PROTECTION</div>
            <h2 className="cb-h2" style={{textAlign:'center'}}>TOTAL <span>DEFENSE</span></h2>
          </div>
          <div className="cb-grid3">
            {[
              {label:'PRIMARY LAYER', title:'COARSE CAPTURE', desc:'Intercepts dust, pollen, and large debris before they reach the high-efficiency core media — extending filter service life and maintaining peak performance.'},
              {label:'MAIN MEDIA', title:'SUB-MICRON CORE', desc:'MICROKAPPA™ fibers retain fine soot and allergens with 99.9% efficiency in every cycle — protecting operator health in the most demanding industrial environments.'},
              {label:'ACTIVATED CARBON', title:'CHEMICAL BARRIER', desc:'Neutralizes harmful NOx gases and persistent external odors — creating a safe and productive cabin environment across mining, construction, and agricultural operations.'},
              {label:'SEALING TECH', title:'ZERO BYPASS', desc:'Precision-engineered OEM geometry ensures a hermetic seal, leaving no room for unfiltered air to enter the cabin under any operating condition.'},
              {label:'STRUCTURE', title:'REINFORCED FRAME', desc:'Maintains structural integrity under high HVAC flow and extreme vibrations typical of industrial sites — ensuring consistent filtration performance throughout service life.'},
              {label:'HVAC CARE', title:'BLOWER DEFENSE', desc:'Optimized airflow resistance prevents blower motor overload, extending HVAC system service life and reducing maintenance costs across fleet operations.'},
            ].map((f, i) => (
              <div key={i} className="cb-feature">
                <div className="cb-feature-label">{f.label}</div>
                <div className="cb-feature-title">{f.title}</div>
                <p className="cb-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cb-sec" style={{background:'#030303'}}>
        <div className="cb-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="cb-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="cb-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="cb-protocol-grid">
            {[
              {num:'01', title:'AIRFLOW OPTIMIZATION', desc:'Maximum permeability with minimum pressure drop — maintaining full climate control performance and operator comfort in all industrial operating conditions.'},
              {num:'02', title:'BIOPROTECTION', desc:'Physical barrier against organic micro-particles, allergens, and biological contaminants — drastically improving occupational health and operator wellbeing.'},
              {num:'03', title:'CERTIFIED FIT', desc:'Validated for Mining, Construction, and Agriculture operations across global fleets — precision-matched to OEM specifications across 5,000+ cross-references.'},
            ].map((p, i) => (
              <div key={i} className="cb-protocol-card">
                <div className="cb-protocol-num">{p.num}</div>
                <div className="cb-protocol-title">{p.title}</div>
                <p className="cb-protocol-p">{p.desc}</p>
                <div className="cb-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cb-cta">
        <div className="cb-cta-inner">
          <div className="cb-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// OPERATOR PROTECTION MANDATE</div>
          <div className="cb-cta-h2">EVERY CABIN.<br /><span>EVERY BREATH.</span></div>
          <Link href="/search" className="cb-btn" style={{display:'inline-block'}}>FIND MY CABIN FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
