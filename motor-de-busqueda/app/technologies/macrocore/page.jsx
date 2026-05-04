'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Macrocore() {
  const css = `
    .mc{background:#000;color:#fff;min-height:100vh;}
    .mc-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mc-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mc-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .mc-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2025/08/Imagen1.png') right center/contain no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 65%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 65%);z-index:1;}
    .mc-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 25%,rgba(0,0,0,0.7) 55%,transparent 100%);z-index:2;}
    .mc-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .mc-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mc-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .mc-h1 span{color:#FFF12D;}
    .mc-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mc-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .mc-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .mc-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .mc-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .mc-btn:hover{background:transparent;color:#FFF12D;}
    .mc-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .mc-sec-inner{max-width:1400px;margin:0 auto;}
    .mc-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .mc-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mc-h2 span{color:#FFF12D;}
    .mc-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .mc-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .mc-spec{border-left:1px solid #27272a;padding-left:16px;}
    .mc-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .mc-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .mc-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .mc-img-wrap img{width:100%;height:auto;display:block;filter:contrast(1.05);}
    .mc-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mc-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .mc-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .mc-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mc-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mc-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mc-protocol-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);padding:40px;position:relative;overflow:hidden;}
    .mc-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:90px;color:rgba(255,241,45,0.06);line-height:1;}
    .mc-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .mc-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mc-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .mc-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .mc-cta-inner{max-width:900px;margin:0 auto;}
    .mc-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .mc-cta-h2 span{color:#FFF12D;}
    .mc-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .mc-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.mc-hero-bg{background-size:cover;opacity:0.4;mask-image:none;-webkit-mask-image:none;} .mc-hero-ov{background:rgba(0,0,0,0.85);} .mc-grid2{grid-template-columns:1fr;} .mc-grid3{grid-template-columns:repeat(2,1fr);} .mc-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.mc-grid3{grid-template-columns:1fr;} .mc-hero-p{font-size:12px;} .mc-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mc">
      <style>{css}</style>
      <a href="/?skip=1" className="mc-back">&larr; HOME</a>

      <section className="mc-hero">
        <div className="mc-hero-bg" />
        <div className="mc-hero-ov" />
        <div className="mc-hero-c">
          <div className="mc-eyebrow">// HEAVY DUTY AIR SYSTEMS / SYS-01</div>
          <h1 className="mc-h1">STRUCTURE<br /><span>MACROCORE™.</span></h1>
          <p className="mc-hero-p">Industrial asset protection systems engineered for high-displacement diesel engines, heavy-duty air intake systems, and critical industrial filtration infrastructure. MACROCORE™ structural reinforcement technology eliminates filter collapse and media migration — extending engine lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 5011 and ISO 16889 standards.</p>
          <div className="mc-hero-stat">
            <Link href="/search" className="mc-btn">SEARCH MY SKU</Link>
            <div>
              <span className="mc-stat-label">GLOBAL PROTECTION</span>
              <span className="mc-stat-val">100% SEALED</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mc-sec" style={{background:'#050505'}}>
        <div className="mc-sec-inner">
          <div className="mc-grid2">
            <div>
              <div className="mc-eyebrow">// ANTI-COLLAPSE TECHNOLOGY</div>
              <h2 className="mc-h2">HD ENGINEERING<br /><span>VALIDATION.</span></h2>
              <p className="mc-p">The MACROCORE™ architecture redefines mechanical stability. The radial support mesh system ensures the filter geometry remains unalterable — even under the extreme suction demands of heavy machinery in mining, construction, and industrial operations worldwide.</p>
              <p className="mc-p">Engineered to exceed OEM structural requirements by 35% — delivering absolute protection against collapse and media migration in the most demanding heavy-duty applications globally.</p>
              <div className="mc-specs">
                <div className="mc-spec"><span className="mc-spec-label">CRUSH RESISTANCE</span><span className="mc-spec-sub">Exceeds 62 PSI</span></div>
                <div className="mc-spec"><span className="mc-spec-label">STRUCTURAL GAIN</span><span className="mc-spec-sub">+35% vs OEM</span></div>
                <div className="mc-spec"><span className="mc-spec-label">ISO 5011</span><span className="mc-spec-sub">Air Filtration Certified</span></div>
                <div className="mc-spec"><span className="mc-spec-label">OEM MATCHED</span><span className="mc-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="mc-img-wrap">
              <img src={`${WP}/2026/04/Gemini_Generated_Image_pmclxypmclxypmcl.png`} alt="MACROCORE Engineering Validation" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="mc-sec">
        <div className="mc-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mc-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// INDUSTRIAL SHIELDING</div>
            <h2 className="mc-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span>EXTREME CYCLES.</span></h2>
          </div>
          <div className="mc-grid3">
            {[
              {title:'REINFORCED CORE', desc:'Optimized central structure nullifies the risk of deformation in critical mining and construction operations — maintaining filter geometry under extreme suction and vibration.'},
              {title:'RADIAL SEALING', desc:'INTEKCORE™ radial seal technology ensures a hermetic barrier against contaminants in high-vibration environments — eliminating bypass pathways completely.'},
              {title:'CYCLIC STABILITY', desc:'Maintains filter media integrity against constant motor pulsations under full load — protecting engines during continuous 24/7 duty cycles in industrial operations.'},
              {title:'MEDIA INTEGRITY', desc:'Advanced synthetic media construction prevents migration and deformation — ensuring consistent 99.9% particle retention throughout the full service interval.'},
              {title:'THERMAL RESISTANCE', desc:'Engineered to maintain structural performance across extreme temperature cycles — from arctic cold starts to desert heat in mining and construction worldwide.'},
              {title:'EXTENDED SERVICE', desc:'Superior structural design extends service intervals beyond conventional air filters — reducing maintenance frequency and total cost of ownership across fleet operations.'},
            ].map((c, i) => (
              <div key={i} className="mc-card">
                <div className="mc-card-title">{c.title}</div>
                <p className="mc-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-sec" style={{background:'#030303'}}>
        <div className="mc-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="mc-eyebrow">// METRICS OF CERTAINTY</div>
            <h2 className="mc-h2" style={{marginTop:'8px'}}>SAFETY PROTOCOLS</h2>
          </div>
          <div className="mc-protocol-grid">
            {[
              {num:'01', title:'MECHANICAL DESIGN', desc:'Laminar flow optimization maximizes equipment power and fuel efficiency — reducing intake restriction while maintaining absolute particle capture across all operating conditions.'},
              {num:'02', title:'ISO 5011 STANDARD', desc:'Certified under international air filtration standards for global heavy machinery — ensuring compliance with the most stringent performance requirements worldwide.'},
              {num:'03', title:'COMPATIBILITY', desc:'Developed for total protection of relevant assets and heavy fleets — precision-matched to OEM specifications across 5,000+ cross-references worldwide.'},
            ].map((p, i) => (
              <div key={i} className="mc-protocol-card">
                <div className="mc-protocol-num">{p.num}</div>
                <div className="mc-protocol-title">{p.title}</div>
                <p className="mc-protocol-p">{p.desc}</p>
                <div className="mc-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-cta">
        <div className="mc-cta-inner">
          <div className="mc-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="mc-cta-h2">ELIMINATE THE RISK.<br /><span>SECURE THE ASSET.</span></div>
          <p className="mc-cta-p">Do not allow filter collapse to compromise your engine investment. Upgrade your air intake protection with MACROCORE™ today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 5011 and ISO 16889 standards.</p>
          <Link href="/search" className="mc-btn">SEARCH MY SKU &rarr;</Link>
          <p className="mc-cta-footer">// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</p>
        </div>
      </section>
    </div>
  );
}
