'use client';
import Link from 'next/link';

import { WP } from '../../constants';

export default function HydraulicSystems() {
  const css = `
    .hy{background:#000;color:#fff;min-height:100vh;}
    .hy-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .hy-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .hy-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/pexels-yury-kim-181374-585419-scaled.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .hy-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .hy-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .hy-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .hy-h1 span{color:#FFF12D;}
    .hy-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:650px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .hy-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .hy-sec-inner{max-width:1400px;margin:0 auto;}
    .hy-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .hy-h2{font-family:'Russo One',sans-serif;font-size:clamp(30px,4vw,55px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .hy-h2 span{color:#FFF12D;}
    .hy-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .hy-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}
    .hy-spec{border-left:1px solid #27272a;padding-left:16px;}
    .hy-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .hy-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .hy-img-wrap{background:#000;padding:10px;border:1px solid #1a1a1a;position:relative;}
    .hy-img-wrap:after{content:'';position:absolute;top:-10px;right:-10px;width:50px;height:50px;border-top:2px solid #FFF12D;border-right:2px solid #FFF12D;}
    .hy-img-wrap img{width:100%;height:auto;display:block;filter:grayscale(0.1) contrast(1.1);}
    .hy-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.1em;padding:20px 45px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.25s;border:2px solid #FFF12D;}
    .hy-btn:hover{background:transparent;color:#FFF12D;}
    .hy-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .hy-feature{background:rgba(255,255,255,0.03);border-left:4px solid #FFF12D;padding:36px 28px;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);height:100%;}
    .hy-feature:hover{transform:translateY(-5px);background:rgba(255,255,255,0.06);}
    .hy-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .hy-feature-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .hy-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.03em;}
    .hy-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .hy-protocol-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;}
    .hy-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .hy-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .hy-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .hy-cta{padding:100px 6%;background:radial-gradient(circle at center,#111 0%,#000 100%);text-align:center;}
    .hy-cta-inner{max-width:900px;margin:0 auto;}
    .hy-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(35px,7vw,85px);text-transform:uppercase;line-height:0.95;margin-bottom:40px;}
    .hy-cta-h2 span{color:#FFF12D;}
    @media(max-width:1024px){.hy-grid2{grid-template-columns:1fr;} .hy-grid3{grid-template-columns:repeat(2,1fr);} .hy-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.hy-grid3{grid-template-columns:1fr;} .hy-hero-p{font-size:12px;} .hy-specs{grid-template-columns:1fr;} .hy-img-wrap:after{display:none;}}
  `;

  return (
    <div className="hy">
      <style>{css}</style>
      <a href="/?skip=1" className="hy-back">&larr; HOME</a>

      <section className="hy-hero">
        <div className="hy-hero-inner">
          <div className="hy-eyebrow">// HYDRAULIC SYSTEMS / MOD-NANOFORCE</div>
          <h1 className="hy-h1">HYDRAULIC<br /><span>FILTRATION.</span></h1>
          <p className="hy-hero-p">Industrial asset protection systems engineered for hydraulic circuits, high-pressure actuation systems, and critical fluid power infrastructure. NANOFORCE™ technology achieves 99.99% efficiency to capture contaminants before they compromise actuator response, valve precision, and pump performance — extending asset lifespan and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="hy-sec" style={{background:'#050505'}}>
        <div className="hy-sec-inner">
          <div className="hy-grid2">
            <div>
              <div className="hy-eyebrow">// NANOFORCE™ TECHNOLOGY</div>
              <h2 className="hy-h2">TOTAL HYDRAULIC<br /><span>INTEGRITY.</span></h2>
              <p className="hy-p">Precision valve control and pump efficiency rely on absolute fluid purity. NANOFORCE™ achieves 99.99% efficiency to capture contaminants before they compromise actuator response in mining, construction, and heavy industrial equipment worldwide.</p>
              <p className="hy-p">Engineered for hydraulic systems operating under extreme pressure cycles, high contamination environments, and continuous duty in the most demanding industrial applications globally.</p>
              <div className="hy-specs">
                <div className="hy-spec"><span className="hy-spec-label">EFFICIENCY</span><span className="hy-spec-sub">99.99% Particle Capture</span></div>
                <div className="hy-spec"><span className="hy-spec-label">PRESSURE RATING</span><span className="hy-spec-sub">Up to 450 PSI</span></div>
                <div className="hy-spec"><span className="hy-spec-label">ISO CERTIFIED</span><span className="hy-spec-sub">Contamination Control</span></div>
                <div className="hy-spec"><span className="hy-spec-label">OEM MATCHED</span><span className="hy-spec-sub">5,000+ Cross-Refs</span></div>
              </div>
              <Link href="/technologies/nanoforce" className="hy-btn">VIEW NANOFORCE™ TECHNOLOGY</Link>
            </div>
            <div className="hy-img-wrap">
              <img src={`${WP}/2025/08/ChatGPT-Image-20-ago-2025-10_40_35-p.m.png`} alt="ELIMFILTERS NANOFORCE Hydraulic Filter" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="hy-sec">
        <div className="hy-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="hy-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// PROTECTION STROKE BY STROKE</div>
            <h2 className="hy-h2" style={{textAlign:'center'}}>STRUCTURAL <span>DEFENSE</span></h2>
          </div>
          <div className="hy-grid3">
            {[
              {label:'SYNTHETIC MEDIA', title:'99.99% EFFICIENCY', desc:'Traps abrasive micro-particles before they reach precision pumps and servo valves — protecting hydraulic actuators from contamination-driven failure.'},
              {label:'ZERO CAVITATION', title:'FLOW STABILITY', desc:'Maintains maximum flow rates under high viscosity and cold start conditions — protecting hydraulic pumps from cavitation damage during startup cycles.'},
              {label:'HYDROGUARD', title:'WATER SEPARATION', desc:'Superior water separation prevents fluid oxidation and moisture-driven degradation — protecting hydraulic system components from corrosion and premature wear.'},
              {label:'STEEL STRUCTURE', title:'PRESSURE INTEGRITY', desc:'Steel-reinforced canisters withstand pressure spikes up to 450 PSI — maintaining structural integrity under extreme duty cycles in mining and construction.'},
              {label:'EXTENDED INTERVALS', title:'TCO OPTIMIZATION', desc:'High dirt-holding capacity extends change intervals significantly — reducing downtime and operational costs across heavy-duty hydraulic system maintenance.'},
              {label:'OEM COMPATIBILITY', title:'SYSTEM INTEGRITY', desc:'Precision-matched to OEM hydraulic system specifications across 5,000+ cross-references — ensuring zero-compromise protection in all industrial applications.'},
            ].map((f, i) => (
              <div key={i} className="hy-feature">
                <div className="hy-feature-label">{f.label}</div>
                <div className="hy-feature-title">{f.title}</div>
                <p className="hy-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hy-sec" style={{background:'#030303'}}>
        <div className="hy-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="hy-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="hy-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="hy-protocol-grid">
            {[
              {title:'ISO COMPLIANCE', desc:'Certified contamination control that eliminates high-velocity particles in field operations — ensuring hydraulic fluid cleanliness meets ISO 4406 target cleanliness codes.'},
              {title:'PRESSURE RATING', desc:'Steel-reinforced canisters designed to withstand pressure spikes up to 450 PSI in extreme duty cycles — maintaining filter integrity under the most demanding conditions.'},
              {title:'TCO OPTIMIZATION', desc:'High contaminant-holding capacity extends change intervals, reducing downtime and operational costs — delivering measurable savings across fleet hydraulic maintenance programs.'},
            ].map((p, i) => (
              <div key={i} className="hy-protocol-card">
                <div className="hy-protocol-title">{p.title}</div>
                <p className="hy-protocol-p">{p.desc}</p>
                <div className="hy-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hy-cta">
        <div className="hy-cta-inner">
          <div className="hy-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// HYDRAULIC PROTECTION MANDATE</div>
          <div className="hy-cta-h2">EVERY SYSTEM.<br /><span>EVERY STROKE.</span></div>
          <Link href="/search" className="hy-btn" style={{display:'inline-block'}}>FIND MY HYDRAULIC FILTER &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
