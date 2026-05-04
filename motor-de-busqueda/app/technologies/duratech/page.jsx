'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Duratech() {
  const css = `
    .dt{background:#000;color:#fff;min-height:100vh;}
    .dt-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .dt-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .dt-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .dt-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/04/taller-npr.png') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 60%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 60%);z-index:1;}
    .dt-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 20%,rgba(0,0,0,0.4) 60%,transparent 100%);z-index:2;}
    .dt-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .dt-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .dt-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .dt-h1 span{color:#FFF12D;}
    .dt-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .dt-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .dt-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .dt-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .dt-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .dt-btn:hover{background:transparent;color:#FFF12D;}
    .dt-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .dt-sec-inner{max-width:1400px;margin:0 auto;}
    .dt-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .dt-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .dt-h2 span{color:#FFF12D;}
    .dt-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .dt-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .dt-spec{border-left:1px solid #27272a;padding-left:16px;}
    .dt-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .dt-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .dt-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .dt-img-wrap img{width:100%;height:auto;display:block;filter:brightness(1.1) contrast(1.1);}
    .dt-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .dt-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .dt-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .dt-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .dt-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .dt-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .dt-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .dt-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .dt-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .dt-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .dt-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .dt-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .dt-cta-inner{max-width:900px;margin:0 auto;}
    .dt-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .dt-cta-h2 span{color:#FFF12D;}
    .dt-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .dt-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.dt-hero-bg{opacity:0.9;mask-image:none;-webkit-mask-image:none;} .dt-grid2{grid-template-columns:1fr;} .dt-grid3{grid-template-columns:repeat(2,1fr);} .dt-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.dt-grid3{grid-template-columns:1fr;} .dt-hero-p{font-size:12px;} .dt-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="dt">
      <style>{css}</style>
      <a href="/?skip=1" className="dt-back">&larr; HOME</a>

      <section className="dt-hero">
        <div className="dt-hero-bg" />
        <div className="dt-hero-ov" />
        <div className="dt-hero-c">
          <div className="dt-eyebrow">// HEAVY DUTY / MASTER KIT</div>
          <h1 className="dt-h1">RELIABILITY<br /><span>DURATECH™</span></h1>
          <p className="dt-hero-p">Industrial asset protection systems engineered for heavy-duty fleet maintenance, Master Kit optimization, and total OEM interchangeability. DURATECH™ consolidates all critical filtration components under a single reference — extending service intervals, eliminating field incompatibility risks, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="dt-hero-stat">
            <Link href="/search" className="dt-btn">IDENTIFY SKU</Link>
            <div>
              <span className="dt-stat-label">MAXIMUM UPTIME</span>
              <span className="dt-stat-val">TOTAL INTERCHANGEABILITY</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dt-sec" style={{background:'#050505'}}>
        <div className="dt-sec-inner">
          <div className="dt-grid2">
            <div>
              <div className="dt-eyebrow">// OEM COMPATIBILITY</div>
              <h2 className="dt-h2">PRECISION<br /><span>REPLACEMENT</span></h2>
              <p className="dt-p">DURATECH™ technology is engineered for fleets demanding operational consistency. Our Master Kits consolidate all critical components under a single reference — ensuring every filter meets or exceeds original manufacturer flow and retention specs, eliminating field incompatibility risks.</p>
              <p className="dt-p">Engineered for heavy-duty truck fleets, construction equipment, mining machinery, and any operation requiring synchronized maintenance intervals across multiple filtration systems worldwide.</p>
              <div className="dt-specs">
                <div className="dt-spec"><span className="dt-spec-label">SERVICE TYPE</span><span className="dt-spec-sub">Heavy Duty / Fleets</span></div>
                <div className="dt-spec"><span className="dt-spec-label">STANDARD</span><span className="dt-spec-sub">Full OEM Cross-Reference</span></div>
                <div className="dt-spec"><span className="dt-spec-label">COVERAGE</span><span className="dt-spec-sub">5,000+ Cross-References</span></div>
                <div className="dt-spec"><span className="dt-spec-label">CERTIFICATION</span><span className="dt-spec-sub">ISO 16889 Certified</span></div>
              </div>
            </div>
            <div className="dt-img-wrap">
              <img src={`${WP}/2026/04/Gemini_Generated_Image_1m7yyd1m7yyd1m7y.png`} alt="DURATECH Master Kit Technical Analysis" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="dt-sec">
        <div className="dt-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="dt-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// MAINTENANCE ENGINEERING</div>
            <h2 className="dt-h2" style={{textAlign:'center'}}>OPTIMIZED <span>SERVICE</span></h2>
          </div>
          <div className="dt-grid3">
            {[
              {title:'STREAMLINED LOGISTICS', desc:'A single SKU contains everything needed for preventive service — drastically reducing inventory errors, procurement complexity, and field incompatibility risks.'},
              {title:'EXTENDED INTERVALS', desc:'High-capacity filter media designed to withstand severe operating conditions without loss of efficiency — extending service intervals and reducing maintenance frequency.'},
              {title:'TOTAL PROTECTION', desc:'Ensures the integrity of lubrication, fuel, air, and hydraulic systems — maximizing total engine service life and operational availability across fleet operations.'},
              {title:'OEM INTERCHANGEABILITY', desc:'Every DURATECH™ Master Kit is precision-matched to OEM specifications across 5,000+ cross-references — eliminating field compatibility issues in heavy-duty applications.'},
              {title:'COST REDUCTION', desc:'Consolidated service kits reduce parts procurement costs, storage requirements, and technician time — delivering measurable TCO reduction across fleet maintenance programs.'},
              {title:'FLEET STANDARDIZATION', desc:'Uniform service specifications across mixed fleets simplify maintenance scheduling and reduce downtime — ensuring every unit receives the same engineering-grade protection.'},
            ].map((c, i) => (
              <div key={i} className="dt-card">
                <div className="dt-card-title">{c.title}</div>
                <p className="dt-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dt-sec" style={{background:'#000'}}>
        <div className="dt-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="dt-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="dt-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="dt-protocol-grid">
            {[
              {num:'01', title:'OEM PRECISION', desc:'Every component in the DURATECH™ Master Kit is validated to meet or exceed original manufacturer specifications — ensuring zero-compromise protection in all applications.'},
              {num:'02', title:'INTERVAL OPTIMIZATION', desc:'High-capacity media engineering extends service intervals beyond standard replacement cycles — reducing fleet downtime and maintenance costs significantly.'},
              {num:'03', title:'SYSTEM SYNCHRONIZATION', desc:'All filtration systems serviced simultaneously under a single kit reference — eliminating the risk of mismatched service intervals and unprotected operating windows.'},
            ].map((p, i) => (
              <div key={i} className="dt-protocol-card">
                <div className="dt-protocol-num">{p.num}</div>
                <div className="dt-protocol-title">{p.title}</div>
                <p className="dt-protocol-p">{p.desc}</p>
                <div className="dt-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dt-cta">
        <div className="dt-cta-inner">
          <div className="dt-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="dt-cta-h2">GUARANTEED UPTIME<br /><span>USE DURATECH™</span></div>
          <p className="dt-cta-p">Stop managing multiple part numbers for a single service. Consolidate your fleet maintenance with DURATECH™ Master Kits today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="dt-btn">FIND MY SKU &rarr;</Link>
          <p className="dt-cta-footer">// GLOBAL HEAVY DUTY ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
