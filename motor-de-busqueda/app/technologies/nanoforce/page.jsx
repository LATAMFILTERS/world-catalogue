'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

export default function Nanoforce() {
  const css = `
    .nf{background:#000;color:#fff;min-height:100vh;}
    .nf-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .nf-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .nf-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .nf-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/pexels-cottonbro-7018493-scaled.jpg') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .nf-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .nf-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .nf-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .nf-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .nf-h1 span{color:#FFF12D;}
    .nf-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .nf-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .nf-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .nf-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .nf-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .nf-btn:hover{background:transparent;color:#FFF12D;}
    .nf-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .nf-sec-inner{max-width:1400px;margin:0 auto;}
    .nf-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .nf-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .nf-h2 span{color:#FFF12D;}
    .nf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .nf-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .nf-spec{border-left:1px solid #27272a;padding-left:16px;}
    .nf-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .nf-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .nf-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .nf-img-wrap img{width:100%;height:auto;display:block;filter:contrast(1.1);}
    .nf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .nf-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .nf-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .nf-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .nf-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .nf-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .nf-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .nf-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .nf-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .nf-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .nf-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .nf-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .nf-cta-inner{max-width:900px;margin:0 auto;}
    .nf-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .nf-cta-h2 span{color:#FFF12D;}
    .nf-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .nf-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.nf-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .nf-grid2{grid-template-columns:1fr;} .nf-grid3{grid-template-columns:repeat(2,1fr);} .nf-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.nf-grid3{grid-template-columns:1fr;} .nf-hero-p{font-size:12px;} .nf-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="nf">
      <style>{css}</style>
      <a href="/?skip=1" className="nf-back">&larr; HOME</a>

      <section className="nf-hero">
        <div className="nf-hero-bg" />
        <div className="nf-hero-ov" />
        <div className="nf-hero-c">
          <div className="nf-eyebrow">// FUEL FILTRATION SYSTEM / MOD-03</div>
          <h1 className="nf-h1">PROTECTION<br /><span>NANOFORCE™</span></h1>
          <p className="nf-hero-p">Industrial asset protection systems engineered for high-pressure Common Rail injection systems, hydraulic circuits, and critical fuel infrastructure. NANOFORCE™ depth filtration with density gradient architecture captures contaminants at 4 microns absolute — protecting injectors, pumps, and valves across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="nf-hero-stat">
            <Link href="/search" className="nf-btn">SEARCH MY SKU</Link>
            <div>
              <span className="nf-stat-label">CRITICAL PROTECTION</span>
              <span className="nf-stat-val">99.9% EFFICIENCY</span>
            </div>
          </div>
        </div>
      </section>

      <section className="nf-sec" style={{background:'#050505'}}>
        <div className="nf-sec-inner">
          <div className="nf-grid2">
            <div>
              <div className="nf-eyebrow">// DEPTH ENGINEERING</div>
              <h2 className="nf-h2">ACTIVE DENSITY<br /><span>GRADIENT</span></h2>
              <p className="nf-p">The NANOFORCE™ architecture is not a simple barrier. It is a labyrinth of fibers with progressive density that captures microscopic contaminants — eliminating the risk of erosion in Common Rail injectors and precision hydraulic components worldwide.</p>
              <p className="nf-p">Engineered for the latest generation high-pressure injection systems requiring absolute fuel purity — delivering 4 micron absolute filtration and +2X service cycles versus conventional filters.</p>
              <div className="nf-specs">
                <div className="nf-spec"><span className="nf-spec-label">PARTICLE CAPTURE</span><span className="nf-spec-sub">4 Microns Absolute</span></div>
                <div className="nf-spec"><span className="nf-spec-label">OPERATIONAL LIFE</span><span className="nf-spec-sub">+2X Service Cycles</span></div>
                <div className="nf-spec"><span className="nf-spec-label">EFFICIENCY</span><span className="nf-spec-sub">99.9% Retention</span></div>
                <div className="nf-spec"><span className="nf-spec-label">OEM MATCHED</span><span className="nf-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="nf-img-wrap">
              <img src={`${WP}/2026/04/Gemini_Generated_Image_itztkyitztkyitzt.png`} alt="NANOFORCE Technology Engineering" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="nf-sec">
        <div className="nf-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="nf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// FUEL SHIELDING</div>
            <h2 className="nf-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span>CRITICAL SYSTEMS</span></h2>
          </div>
          <div className="nf-grid3">
            {[
              {title:'UNIQUE MEDIA', desc:'Synthetic fibers engineered with progressive density gradient to maximize contaminant retention — capturing particles at 4 microns absolute across the full service interval.'},
              {title:'ZERO MIGRATION', desc:'Stable depth structure prevents particle passage and media migration under high pressure peaks — maintaining filter integrity in Common Rail injection systems up to 30,000 PSI.'},
              {title:'TOTAL PROTECTION', desc:'Maintains the absolute fuel purity required by the latest generation diesel injection systems — protecting precision components from contamination-driven erosion and failure.'},
              {title:'HYDRAULIC DEFENSE', desc:'NANOFORCE™ depth filtration architecture also protects hydraulic circuits — capturing metallic particles and contaminants before they reach servo valves and precision actuators.'},
              {title:'EXTENDED CAPACITY', desc:'High dirt-holding capacity extends service intervals by up to 2X versus standard filters — reducing maintenance frequency and total cost of ownership across fleet operations.'},
              {title:'ISO COMPLIANCE', desc:'Certified to ISO 16889 filtration standards — ensuring contamination control compliance across all heavy-duty fuel and hydraulic system applications worldwide.'},
            ].map((c, i) => (
              <div key={i} className="nf-card">
                <div className="nf-card-title">{c.title}</div>
                <p className="nf-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nf-sec" style={{background:'#000'}}>
        <div className="nf-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="nf-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="nf-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="nf-protocol-grid">
            {[
              {num:'01', title:'DEPTH FILTRATION', desc:'Progressive density gradient captures contaminants throughout the media depth — not just on the surface — maximizing dirt-holding capacity and extending service life significantly.'},
              {num:'02', title:'PRESSURE STABILITY', desc:'Stable fiber structure maintains filter integrity under high-pressure spikes and pulsations — preventing media collapse and particle migration in demanding injection systems.'},
              {num:'03', title:'INJECTOR DEFENSE', desc:'Absolute 4 micron particle capture protects Common Rail injector nozzles from erosion — preserving spray pattern geometry and maintaining peak combustion efficiency.'},
            ].map((p, i) => (
              <div key={i} className="nf-protocol-card">
                <div className="nf-protocol-num">{p.num}</div>
                <div className="nf-protocol-title">{p.title}</div>
                <p className="nf-protocol-p">{p.desc}</p>
                <div className="nf-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nf-cta">
        <div className="nf-cta-inner">
          <div className="nf-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="nf-cta-h2">PROTECT YOUR ASSET<br /><span>USE NANOFORCE™</span></div>
          <p className="nf-cta-p">Do not allow fuel contamination to erode your injection system investment. Upgrade to NANOFORCE™ depth filtration today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="nf-btn">SEARCH MY SKU &rarr;</Link>
          <p className="nf-cta-footer">// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</p>
        </div>
      </section>
    </div>
  );
}
