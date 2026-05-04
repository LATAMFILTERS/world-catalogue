'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function AquaguardSeries() {
  const css = `
    .aq{background:#000;color:#fff;min-height:100vh;}
    .aq-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .aq-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .aq-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .aq-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_1av7l01av7l01av7.png') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .aq-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .aq-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .aq-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .aq-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .aq-h1 span{color:#FFF12D;}
    .aq-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .aq-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .aq-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .aq-stat-val{font-family:'Russo One',sans-serif;font-size:18px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .aq-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .aq-btn:hover{background:transparent;color:#FFF12D;}
    .aq-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .aq-sec-inner{max-width:1400px;margin:0 auto;}
    .aq-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .aq-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .aq-h2 span{color:#FFF12D;}
    .aq-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .aq-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .aq-spec{border-left:1px solid #27272a;padding-left:16px;}
    .aq-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .aq-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .aq-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .aq-img-wrap img{width:100%;height:auto;display:block;filter:contrast(1.05);}
    .aq-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .aq-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .aq-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .aq-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .aq-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .aq-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .aq-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .aq-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .aq-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .aq-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .aq-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .aq-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .aq-cta-inner{max-width:900px;margin:0 auto;}
    .aq-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .aq-cta-h2 span{color:#FFF12D;}
    .aq-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .aq-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.aq-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .aq-grid2{grid-template-columns:1fr;} .aq-grid3{grid-template-columns:repeat(2,1fr);} .aq-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.aq-grid3{grid-template-columns:1fr;} .aq-hero-p{font-size:12px;} .aq-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="aq">
      <style>{css}</style>
      <a href="/?skip=1" className="aq-back">&larr; HOME</a>

      <section className="aq-hero">
        <div className="aq-hero-bg" />
        <div className="aq-hero-ov" />
        <div className="aq-hero-c">
          <div className="aq-eyebrow">// FH TURBINE SEPARATION / S-SERIES</div>
          <h1 className="aq-h1">HYDROPHOBIC<br /><span>AQUAGUARD™</span></h1>
          <p className="aq-hero-p">Industrial asset protection systems engineered for FH Series turbine separators, diesel fuel systems, and critical injection infrastructure. AQUAGUARD™ technology shields fuel circuits from emulsified water and contamination — extending injector lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="aq-hero-stat">
            <Link href="/search" className="aq-btn">IDENTIFY SKU</Link>
            <div>
              <span className="aq-stat-label">CRITICAL PROTECTION</span>
              <span className="aq-stat-val">99.8% H2O SEPARATION</span>
            </div>
          </div>
        </div>
      </section>

      <section className="aq-sec" style={{background:'#050505'}}>
        <div className="aq-sec-inner">
          <div className="aq-grid2">
            <div>
              <div className="aq-eyebrow">// COALESCENCE DYNAMICS</div>
              <h2 className="aq-h2">ACTIVE MOLECULAR<br /><span>REPELLENCY</span></h2>
              <p className="aq-p">AQUAGUARD™ technology utilizes high-density hydrophobic coating media. This process forces the merging of emulsified water micro-particles, causing them to settle instantly before compromising injector integrity in FH Series turbine systems worldwide.</p>
              <p className="aq-p">Engineered for diesel fuel systems operating under continuous high-load conditions in mining, construction, agriculture, and heavy fleet operations across 12 industries.</p>
              <div className="aq-specs">
                <div className="aq-spec"><span className="aq-spec-label">SEPARATION EFFICIENCY</span><span className="aq-spec-sub">Superior Industrial Grade</span></div>
                <div className="aq-spec"><span className="aq-spec-label">COMPATIBILITY</span><span className="aq-spec-sub">FH Series Turbine Systems</span></div>
                <div className="aq-spec"><span className="aq-spec-label">H2O REMOVAL</span><span className="aq-spec-sub">99.8% Efficiency</span></div>
                <div className="aq-spec"><span className="aq-spec-label">OEM MATCHED</span><span className="aq-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="aq-img-wrap">
              <img src={`${WP}/2026/04/Gemini_Generated_Image_i2rhli2rhli2rhli.png`} alt="AQUAGUARD Technical Validation" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="aq-sec">
        <div className="aq-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="aq-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// WATER & PARTICLE CONTROL</div>
            <h2 className="aq-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span>DIESEL SYSTEMS</span></h2>
          </div>
          <div className="aq-grid3">
            {[
              {title:'HYDROPHOBIC MEDIA', desc:'Treated synthetic fibers designed to actively repel water under high-velocity flow conditions in FH Series turbine fuel systems operating worldwide.'},
              {title:'OPTIMIZED FLOW', desc:'Low-restriction design minimizes pressure drop while extending service life of the transfer pump and fuel delivery system across all heavy-duty applications.'},
              {title:'TOTAL PROTECTION', desc:'Eliminates risk of corrosion and pitting in Common Rail injection systems — protecting critical injector components from emulsified water damage.'},
              {title:'OEM INTEGRITY', desc:'Precision-matched to FH Series turbine separator specifications across 5,000+ cross-references — compatible with all major heavy-duty engine platforms.'},
              {title:'EXTENDED SERVICE', desc:'Advanced coalescence media extends service intervals by up to 40% versus conventional separators — reducing maintenance costs and downtime.'},
              {title:'COLD WEATHER OPS', desc:'Maintains full separation efficiency in sub-zero environments — protecting diesel fuel systems in arctic mining and construction operations worldwide.'},
            ].map((c, i) => (
              <div key={i} className="aq-card">
                <div className="aq-card-title">{c.title}</div>
                <p className="aq-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aq-sec" style={{background:'#000'}}>
        <div className="aq-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="aq-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="aq-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="aq-protocol-grid">
            {[
              {num:'01', title:'WATER ELIMINATION', desc:'Absolute emulsified water removal regardless of fuel quality or operating temperature — protecting FH Series turbine systems in all environments.'},
              {num:'02', title:'PARTICLE CONTROL', desc:'Multi-stage depth filtration captures fine particulates that standard separators miss — ensuring pure fuel delivery to Common Rail injection systems.'},
              {num:'03', title:'INJECTOR DEFENSE', desc:'Prevents injector erosion and pitting caused by water contamination — extending service life and maintaining peak combustion efficiency worldwide.'},
            ].map((p, i) => (
              <div key={i} className="aq-protocol-card">
                <div className="aq-protocol-num">{p.num}</div>
                <div className="aq-protocol-title">{p.title}</div>
                <p className="aq-protocol-p">{p.desc}</p>
                <div className="aq-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aq-cta">
        <div className="aq-cta-inner">
          <div className="aq-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="aq-cta-h2">SECURE YOUR FUEL<br /><span>USE AQUAGUARD™</span></div>
          <p className="aq-cta-p">Do not allow water contamination to compromise your fuel system integrity. Upgrade your turbine separator protection today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="aq-btn">FIND MY SKU &rarr;</Link>
          <p className="aq-cta-footer">// GLOBAL HEAVY DUTY ENGINEERING ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
