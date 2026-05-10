'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

export default function Drycore() {
  const css = `
    .dr{background:#000;color:#fff;min-height:100vh;}
    .dr-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .dr-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .dr-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .dr-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_8slfcz8slfcz8slf.png') center top/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .dr-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .dr-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .dr-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .dr-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .dr-h1 span{color:#FFF12D;}
    .dr-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .dr-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .dr-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .dr-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .dr-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .dr-btn:hover{background:transparent;color:#FFF12D;}
    .dr-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .dr-sec-inner{max-width:1400px;margin:0 auto;}
    .dr-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .dr-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .dr-h2 span{color:#FFF12D;}
    .dr-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .dr-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .dr-spec{border-left:1px solid #27272a;padding-left:16px;}
    .dr-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .dr-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .dr-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .dr-img-wrap img{width:100%;height:auto;display:block;filter:brightness(1.1) contrast(1.1);}
    .dr-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .dr-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .dr-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .dr-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .dr-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .dr-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .dr-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .dr-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .dr-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .dr-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .dr-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .dr-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .dr-cta-inner{max-width:900px;margin:0 auto;}
    .dr-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .dr-cta-h2 span{color:#FFF12D;}
    .dr-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .dr-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.dr-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .dr-grid2{grid-template-columns:1fr;} .dr-grid3{grid-template-columns:repeat(2,1fr);} .dr-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.dr-grid3{grid-template-columns:1fr;} .dr-hero-p{font-size:12px;} .dr-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="dr">
      <style>{css}</style>
      <a href="/?skip=1" className="dr-back">&larr; HOME</a>

      <section className="dr-hero">
        <div className="dr-hero-bg" />
        <div className="dr-hero-ov" />
        <div className="dr-hero-c">
          <div className="dr-eyebrow">// PNEUMATICS / MOD-08</div>
          <h1 className="dr-h1">ADVANCED<br /><span>DRYCORE™</span></h1>
          <p className="dr-hero-p">Industrial asset protection systems engineered for pneumatic circuits, air brake systems, and critical compressed air infrastructure. DRYCORE™ molecular sieve technology eliminates moisture, prevents valve freezing, and shields pneumatic components from internal oxidation — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across fleets worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="dr-hero-stat">
            <Link href="/search" className="dr-btn">IDENTIFY SKU</Link>
            <div>
              <span className="dr-stat-label">BRAKE PROTECTION</span>
              <span className="dr-stat-val">TOTAL PNEUMATIC SECURITY</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dr-sec" style={{background:'#050505'}}>
        <div className="dr-sec-inner">
          <div className="dr-grid2">
            <div>
              <div className="dr-eyebrow">// CONDENSATION CONTROL</div>
              <h2 className="dr-h2">ANTI-FREEZE<br /><span>PROTECTION</span></h2>
              <p className="dr-p">DRYCORE™ technology utilizes high-adsorption desiccant beads that remove water vapor from compressed air before it enters the system. By preventing condensation, it eliminates valve freezing in cold climates and premature degradation through internal oxidation.</p>
              <p className="dr-p">Engineered for heavy-duty truck fleets, bus and coach operations, construction equipment, and any pneumatic brake system operating under continuous high-pressure conditions worldwide.</p>
              <div className="dr-specs">
                <div className="dr-spec"><span className="dr-spec-label">DESICCANT TYPE</span><span className="dr-spec-sub">Premium Molecular Sieve</span></div>
                <div className="dr-spec"><span className="dr-spec-label">DESIGN</span><span className="dr-spec-sub">High-Pressure Spin-on</span></div>
                <div className="dr-spec"><span className="dr-spec-label">PROTECTION</span><span className="dr-spec-sub">Total Moisture Extraction</span></div>
                <div className="dr-spec"><span className="dr-spec-label">OEM MATCHED</span><span className="dr-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="dr-img-wrap">
              <img src={`${WP}/2026/04/secante-de-frenos.png`} alt="DRYCORE M-08 Engineering" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="dr-sec">
        <div className="dr-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="dr-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// PNEUMATIC ARMOR</div>
            <h2 className="dr-h2" style={{textAlign:'center'}}>DRYING <span>ENGINEERING</span></h2>
          </div>
          <div className="dr-grid3">
            {[
              {title:'ACTIVE ADSORPTION', desc:'Capturing water molecules at a microscopic level for ultra-dry air delivery — protecting brake valves and pneumatic actuators from moisture damage in all climates.'},
              {title:'COALESCENCE', desc:'Integrated stage to separate oil aerosols from compressed airflow — neutralizing compressor carryover before it reaches sensitive ABS and brake control systems.'},
              {title:'EXTENDED LIFESPAN', desc:'Reinforced structure withstands constant discharge and regeneration cycles — delivering extended service life and reduced maintenance intervals across fleet operations.'},
              {title:'COLD WEATHER OPS', desc:'Prevents air line freezing in sub-zero environments — maintaining full pneumatic brake response and operational safety across arctic and high-altitude operations.'},
              {title:'VALVE PROTECTION', desc:'Eliminates moisture-driven corrosion in brake valves and control units — ensuring rapid response times and maximum braking reliability in all conditions.'},
              {title:'OEM INTEGRITY', desc:'Precision-matched to OEM specifications across 5,000+ cross-references — compatible with all major heavy-duty truck and bus platforms worldwide.'},
            ].map((c, i) => (
              <div key={i} className="dr-card">
                <div className="dr-card-title">{c.title}</div>
                <p className="dr-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dr-sec" style={{background:'#000'}}>
        <div className="dr-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="dr-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="dr-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="dr-protocol-grid">
            {[
              {num:'01', title:'MOISTURE EXTRACTION', desc:'Absolute water vapor removal regardless of ambient humidity or compressor duty cycle — protecting pneumatic systems in all operating environments worldwide.'},
              {num:'02', title:'FREEZE PREVENTION', desc:'Molecular sieve desiccant maintains dew point below freezing threshold — eliminating air line freeze risk in sub-zero operating conditions across global fleets.'},
              {num:'03', title:'OXIDATION CONTROL', desc:'Dry air delivery prevents internal oxidation of valves, actuators, and control units — extending pneumatic system service life by up to 45% versus standard filters.'},
            ].map((p, i) => (
              <div key={i} className="dr-protocol-card">
                <div className="dr-protocol-num">{p.num}</div>
                <div className="dr-protocol-title">{p.title}</div>
                <p className="dr-protocol-p">{p.desc}</p>
                <div className="dr-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dr-cta">
        <div className="dr-cta-inner">
          <div className="dr-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="dr-cta-h2">KEEP THE SYSTEM DRY<br /><span>USE DRYCORE™</span></div>
          <p className="dr-cta-p">Do not allow moisture contamination to compromise your pneumatic brake system. Upgrade your air drying protection today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="dr-btn">FIND MY SKU &rarr;</Link>
          <p className="dr-cta-footer">// GLOBAL HEAVY DUTY ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
