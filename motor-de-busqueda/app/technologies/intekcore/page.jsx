'use client';
import Link from 'next/link';

import { WP } from '../../constants';

export default function Intekcore() {
  const css = `
    .ik{background:#000;color:#fff;min-height:100vh;}
    .ik-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ik-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ik-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .ik-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/04/pelon-air.png') center 40%/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 60%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 60%);z-index:1;}
    .ik-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 20%,rgba(0,0,0,0.2) 60%,transparent 100%);z-index:2;}
    .ik-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .ik-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ik-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .ik-h1 span{color:#FFF12D;}
    .ik-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ik-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .ik-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .ik-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .ik-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .ik-btn:hover{background:transparent;color:#FFF12D;}
    .ik-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .ik-sec-inner{max-width:1400px;margin:0 auto;}
    .ik-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .ik-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ik-h2 span{color:#FFF12D;}
    .ik-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .ik-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .ik-spec{border-left:1px solid #27272a;padding-left:16px;}
    .ik-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .ik-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .ik-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .ik-img-wrap img{width:100%;height:auto;display:block;filter:brightness(1.1) contrast(1.1);}
    .ik-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .ik-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .ik-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .ik-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .ik-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ik-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ik-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .ik-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .ik-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ik-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ik-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .ik-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .ik-cta-inner{max-width:900px;margin:0 auto;}
    .ik-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .ik-cta-h2 span{color:#FFF12D;}
    .ik-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .ik-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.ik-hero-bg{opacity:0.9;mask-image:none;-webkit-mask-image:none;} .ik-grid2{grid-template-columns:1fr;} .ik-grid3{grid-template-columns:repeat(2,1fr);} .ik-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.ik-grid3{grid-template-columns:1fr;} .ik-hero-p{font-size:12px;} .ik-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ik">
      <style>{css}</style>
      <a href="/?skip=1" className="ik-back">&larr; HOME</a>

      <section className="ik-hero">
        <div className="ik-hero-bg" />
        <div className="ik-hero-ov" />
        <div className="ik-hero-c">
          <div className="ik-eyebrow">// LIGHT DUTY / MOD-06</div>
          <h1 className="ik-h1">INDUCTION<br /><span>INTEKCORE™</span></h1>
          <p className="ik-hero-p">Industrial asset protection systems engineered for automotive air intake systems, light commercial housings, and critical induction infrastructure. INTEKCORE™ hybrid media technology delivers zero-leak radial seal integrity, maximum flow optimization, and absolute particle capture — protecting sensitive engine sensors and components in light-duty and automotive applications worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="ik-hero-stat">
            <Link href="/search" className="ik-btn">IDENTIFY SKU</Link>
            <div>
              <span className="ik-stat-label">HIGH PERFORMANCE</span>
              <span className="ik-stat-val">OPTIMIZED AIRFLOW</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ik-sec" style={{background:'#050505'}}>
        <div className="ik-sec-inner">
          <div className="ik-grid2">
            <div>
              <div className="ik-eyebrow">// SEALING INTEGRITY</div>
              <h2 className="ik-h2">ZERO LEAK<br /><span>INTEGRITY</span></h2>
              <p className="ik-p">INTEKCORE™ features high-density polyurethane radial seal engineering to ensure 100% leak-proof integrity under extreme vibration. This precision fit prevents unfiltered air from bypassing the media — protecting sensitive sensors and internal engine components in automotive and light commercial applications.</p>
              <p className="ik-p">Engineered for light-duty gasoline and diesel engines, automotive performance applications, and commercial vehicle induction systems requiring absolute intake protection.</p>
              <div className="ik-specs">
                <div className="ik-spec"><span className="ik-spec-label">SEAL MATERIAL</span><span className="ik-spec-sub">High-Density Polyurethane</span></div>
                <div className="ik-spec"><span className="ik-spec-label">APPLICATION</span><span className="ik-spec-sub">Light Engines / Automotive</span></div>
                <div className="ik-spec"><span className="ik-spec-label">BYPASS</span><span className="ik-spec-sub">Zero Bypass Design</span></div>
                <div className="ik-spec"><span className="ik-spec-label">OEM MATCHED</span><span className="ik-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="ik-img-wrap">
              <img src={`${WP}/2026/04/mecanica-air.png`} alt="INTEKCORE Technical Analysis" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="ik-sec">
        <div className="ik-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ik-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// PERFORMANCE ENGINEERING</div>
            <h2 className="ik-h2" style={{textAlign:'center'}}>INTAKE <span>OPTIMIZATION</span></h2>
          </div>
          <div className="ik-grid3">
            {[
              {title:'MAXIMUM FLOW', desc:'Deep-pleat structure increases surface area without obstructing induction — maximizing airflow volume while maintaining absolute particle capture in all operating conditions.'},
              {title:'RADIAL SEAL', desc:'Precision high-density polyurethane seal fits with absolute accuracy in both composite and metallic housings — eliminating bypass pathways in automotive and light commercial applications.'},
              {title:'ENGINE RESPONSE', desc:'Optimized air supply geometry improves throttle response and fuel economy — delivering measurable performance gains in gasoline and diesel light-duty engines worldwide.'},
              {title:'SENSOR PROTECTION', desc:'Zero-bypass design protects MAF sensors, MAP sensors, and intake temperature sensors from contamination-driven inaccuracy — maintaining engine management precision.'},
              {title:'VIBRATION RESISTANCE', desc:'High-density polyurethane seal maintains integrity under extreme vibration and thermal cycling — ensuring consistent sealing performance throughout the full service interval.'},
              {title:'OEM COMPATIBILITY', desc:'Precision-matched to OEM intake housing specifications across 5,000+ cross-references — compatible with all major automotive and light commercial platforms worldwide.'},
            ].map((c, i) => (
              <div key={i} className="ik-card">
                <div className="ik-card-title">{c.title}</div>
                <p className="ik-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ik-sec" style={{background:'#000'}}>
        <div className="ik-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="ik-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="ik-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="ik-protocol-grid">
            {[
              {num:'01', title:'ZERO BYPASS', desc:'High-density polyurethane radial seal prevents any unfiltered air from reaching the engine — protecting sensitive intake sensors and combustion chambers from contamination.'},
              {num:'02', title:'FLOW OPTIMIZATION', desc:'Deep-pleat geometry maximizes filtration surface area while maintaining low restriction — preserving engine power output and fuel efficiency throughout the service interval.'},
              {num:'03', title:'PRECISION FIT', desc:'OEM-matched dimensional tolerances ensure perfect installation in composite and metallic housings — eliminating fitment gaps across 5,000+ automotive cross-references.'},
            ].map((p, i) => (
              <div key={i} className="ik-protocol-card">
                <div className="ik-protocol-num">{p.num}</div>
                <div className="ik-protocol-title">{p.title}</div>
                <p className="ik-protocol-p">{p.desc}</p>
                <div className="ik-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ik-cta">
        <div className="ik-cta-inner">
          <div className="ik-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL LIGHT-DUTY ENGINEERING</div>
          <div className="ik-cta-h2">PEAK RESPONSE<br /><span>RUN INTEKCORE™</span></div>
          <p className="ik-cta-p">Do not allow intake bypass to compromise your engine performance. Upgrade to INTEKCORE™ zero-leak radial seal technology today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="ik-btn">SEARCH MY SKU &rarr;</Link>
          <p className="ik-cta-footer">// GLOBAL LIGHT-DUTY ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
