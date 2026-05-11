'use client';
import Link from 'next/link';

import { WP } from '../constants';

export default function Syntepore() {
  const css = `
    .sy{background:#000;color:#fff;min-height:100vh;}
    .sy-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .sy-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .sy-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .sy-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/pexels-yury-kim-181374-585419-scaled.jpg') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .sy-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .sy-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .sy-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .sy-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .sy-h1 span{color:#FFF12D;}
    .sy-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .sy-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .sy-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .sy-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .sy-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .sy-btn:hover{background:transparent;color:#FFF12D;}
    .sy-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .sy-sec-inner{max-width:1400px;margin:0 auto;}
    .sy-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .sy-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .sy-h2 span{color:#FFF12D;}
    .sy-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .sy-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .sy-spec{border-left:1px solid #27272a;padding-left:16px;}
    .sy-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .sy-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .sy-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .sy-img-wrap img{width:100%;height:auto;display:block;filter:contrast(1.05);}
    .sy-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .sy-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .sy-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .sy-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .sy-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .sy-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .sy-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .sy-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .sy-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .sy-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .sy-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .sy-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .sy-cta-inner{max-width:900px;margin:0 auto;}
    .sy-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .sy-cta-h2 span{color:#FFF12D;}
    .sy-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .sy-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.sy-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .sy-grid2{grid-template-columns:1fr;} .sy-grid3{grid-template-columns:repeat(2,1fr);} .sy-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.sy-grid3{grid-template-columns:1fr;} .sy-hero-p{font-size:12px;} .sy-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="sy">
      <style>{css}</style>
      <a href="/?skip=1" className="sy-back">&larr; HOME</a>

      <section className="sy-hero">
        <div className="sy-hero-bg" />
        <div className="sy-hero-ov" />
        <div className="sy-hero-c">
          <div className="sy-eyebrow">// HYDRAULIC HIGH PRESSURE / MOD-04</div>
          <h1 className="sy-h1">PRECISION<br /><span>SYNTEPORE&#x2122;</span></h1>
          <p className="sy-hero-p">Industrial asset protection systems engineered for high-pressure hydraulic circuits, fuel filtration systems, and critical fluid power infrastructure. SYNTEPORE&#x2122; advanced synthetic fiber technology delivers absolute flow stability and zero component wear &mdash; protecting proportional valves, actuators, and precision hydraulic components across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="sy-hero-stat">
            <Link href="/search" className="sy-btn">SEARCH MY SKU</Link>
            <div>
              <span className="sy-stat-label">GLOBAL ENGINEERING</span>
              <span className="sy-stat-val">100% RELIABILITY</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sy-sec" style={{background:'#050505'}}>
        <div className="sy-sec-inner">
          <div className="sy-grid2">
            <div>
              <div className="sy-eyebrow">// FLOW OPTIMIZATION</div>
              <h2 className="sy-h2">ELIMINATE<br /><span>CONTAMINATION</span></h2>
              <p className="sy-p">The SYNTEPORE&#x2122; matrix provides superior dirt-holding capacity while maintaining extremely low pressure drops. This ensures that hydraulic pumps and valves operate under peak performance without the risk of cavitation or internal erosion in high-pressure applications.</p>
              <p className="sy-p">Engineered for construction, mining, agriculture, and industrial hydraulic systems operating under extreme pressure cycles and continuous high-load conditions worldwide.</p>
              <div className="sy-specs">
                <div className="sy-spec"><span className="sy-spec-label">BETA RATIO</span><span className="sy-spec-sub">&beta;(c) &gt; 1000</span></div>
                <div className="sy-spec"><span className="sy-spec-label">PRESSURE RATING</span><span className="sy-spec-sub">High-Differential Ready</span></div>
                <div className="sy-spec"><span className="sy-spec-label">THERMAL RANGE</span><span className="sy-spec-sub">Extreme Temp Stable</span></div>
                <div className="sy-spec"><span className="sy-spec-label">OEM MATCHED</span><span className="sy-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="sy-img-wrap">
              <img src={`${WP}/2026/04/Gemini_Generated_Image_jkwmrkjkwmrkjkwm.png`} alt="SYNTEPORE Hydraulic Filter Engineering" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="sy-sec">
        <div className="sy-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="sy-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// HYDRAULIC PROTECTION</div>
            <h2 className="sy-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span>PEAK POWER</span></h2>
          </div>
          <div className="sy-grid3">
            {[
              {title:'THERMAL STABILITY', desc:'Resistant to high operating temperatures without structural breakdown &mdash; maintaining fiber integrity and filtration efficiency across extreme thermal cycles in industrial applications.'},
              {title:'AI-VALIDATED MATRIX', desc:'Fiber distribution optimized to prevent premature clogging &mdash; maximizing dirt-holding capacity and extending service life in high-pressure hydraulic and fuel systems worldwide.'},
              {title:'ACTUATOR SAFETY', desc:'Critical protection for proportional valves and precision hydraulic components &mdash; eliminating contamination-driven erosion in servo systems and high-precision actuation circuits.'},
              {title:'FLOW STABILITY', desc:'Extremely low pressure drop design maintains consistent hydraulic flow &mdash; protecting pumps from cavitation and ensuring stable performance under variable load conditions.'},
              {title:'ZERO MIGRATION', desc:'Synthetic fiber structure prevents media migration under high pressure peaks &mdash; maintaining absolute particle capture throughout the full service interval in demanding applications.'},
              {title:'ISO COMPLIANCE', desc:'Beta ratio exceeding &beta;(c) &gt; 1000 &mdash; certified to ISO 16889 standards for absolute contamination control in high-pressure hydraulic and fuel system applications worldwide.'},
            ].map((c, i) => (
              <div key={i} className="sy-card">
                <div className="sy-card-title">{c.title}</div>
                <p className="sy-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sy-sec" style={{background:'#000'}}>
        <div className="sy-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="sy-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="sy-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="sy-protocol-grid">
            {[
              {num:'01', title:'HIGH PRESSURE INTEGRITY', desc:'Beta ratio exceeding &beta;(c) &gt; 1000 ensures absolute particle capture in high-pressure hydraulic systems &mdash; protecting precision components from contamination-driven wear and failure.'},
              {num:'02', title:'FLOW OPTIMIZATION', desc:'Low pressure drop matrix design maintains consistent hydraulic flow rates throughout service life &mdash; protecting pumps from cavitation and preserving system efficiency under full load.'},
              {num:'03', title:'THERMAL RESISTANCE', desc:'Synthetic fiber structure maintains performance across extreme temperature cycles &mdash; ensuring consistent filtration in high-temperature hydraulic systems in industrial and mobile applications.'},
            ].map((p, i) => (
              <div key={i} className="sy-protocol-card">
                <div className="sy-protocol-num">{p.num}</div>
                <div className="sy-protocol-title">{p.title}</div>
                <p className="sy-protocol-p">{p.desc}</p>
                <div className="sy-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sy-cta">
        <div className="sy-cta-inner">
          <div className="sy-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="sy-cta-h2">MAXIMIZE UPTIME<br /><span>USE SYNTEPORE&#x2122;</span></div>
          <p className="sy-cta-p">Do not allow hydraulic contamination to compromise your system performance. Upgrade to SYNTEPORE&#x2122; advanced synthetic fiber technology today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="sy-btn">SEARCH MY SKU &rarr;</Link>
          <p className="sy-cta-footer">// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</p>
        </div>
      </section>
    </div>
  );
}
