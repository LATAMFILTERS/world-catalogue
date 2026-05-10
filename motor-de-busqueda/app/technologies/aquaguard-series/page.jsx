'use client';
import Link from 'next/link';

const WP = '/uploads';

export default function AquaguardSeries() {
  const css = `
    .aq-wrap{background:#000;color:#fff;min-height:100vh;}
    .aq-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .aq-back:hover{background:#FFF12D;color:#000;}
    .aq-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .aq-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/pexels-asadphoto-29318858-scaled.jpg') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .aq-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .aq-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .aq-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .aq-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .aq-h1 span{color:#FFF12D;}
    .aq-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
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
    .aq-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s;}
    .aq-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .aq-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .aq-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .aq-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .aq-cta-inner{max-width:900px;margin:0 auto;}
    .aq-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .aq-cta-h2 span{color:#FFF12D;}
    .aq-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .aq-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.aq-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .aq-grid2{grid-template-columns:1fr;} .aq-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.aq-grid3{grid-template-columns:1fr;} .aq-hero-p{font-size:12px;} .aq-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="aq-wrap">
      <style>{css}</style>
      <a href="/?skip=1" className="aq-back">&larr; HOME</a>
      <section className="aq-hero">
        <div className="aq-hero-bg" />
        <div className="aq-hero-ov" />
        <div className="aq-hero-c">
          <div className="aq-eyebrow">// TURBINE FUEL SEPARATION / MOD-08</div>
          <h1 className="aq-h1">AQUAGUARD<br /><span>SERIES PROTECTION</span></h1>
          <p className="aq-hero-p">Industrial asset protection systems engineered for turbine fuel systems, high-salinity marine environments, and critical water separation infrastructure. AQUAGUARD SERIES coalescing separator technology eliminates free and emulsified water from diesel and turbine fuel — protecting injection systems from corrosion and failure across offshore, industrial, and marine operations worldwide.</p>
          <div style={{marginTop:'32px',display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap'}}>
            <Link href="/search" className="aq-btn">FIND MY SKU</Link>
            <div><span className="aq-eyebrow" style={{marginBottom:'4px',fontSize:'9px'}}>TURBINE PROTECTION</span><span style={{color:'#fff',fontFamily:"'Russo One',sans-serif",fontSize:'16px',textTransform:'uppercase',letterSpacing:'0.1em'}}>99.9% WATER SEPARATION</span></div>
          </div>
        </div>
      </section>

      <section className="aq-sec" style={{background:'#050505'}}>
        <div className="aq-sec-inner">
          <div className="aq-grid2">
            <div>
              <div className="aq-eyebrow">// COALESCING TECHNOLOGY</div>
              <h2 className="aq-h2">ABSOLUTE WATER<br /><span>SEPARATION</span></h2>
              <p className="aq-p">AQUAGUARD SERIES utilizes advanced coalescing media to force emulsified water droplets to merge and separate from turbine and diesel fuel — protecting injection systems from water-induced corrosion and catastrophic failure in offshore and industrial operations.</p>
              <p className="aq-p">Engineered for offshore platforms, marine diesel engines, and industrial power generation requiring absolute fuel purity under all operating conditions worldwide.</p>
              <div className="aq-specs">
                <div className="aq-spec"><span className="aq-spec-label">WATER SEPARATION</span><span className="aq-spec-sub">99.9% Efficiency</span></div>
                <div className="aq-spec"><span className="aq-spec-label">MEDIA</span><span className="aq-spec-sub">Coalescing Grade</span></div>
                <div className="aq-spec"><span className="aq-spec-label">ENVIRONMENT</span><span className="aq-spec-sub">Offshore / Marine</span></div>
                <div className="aq-spec"><span className="aq-spec-label">OEM MATCHED</span><span className="aq-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="aq-img-wrap">
              <img src={`${WP}/2025/08/Imagen1-1.webp`} alt="AQUAGUARD SERIES Turbine Separator" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="aq-sec">
        <div className="aq-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="aq-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// TURBINE SEPARATION TECHNOLOGY</div>
            <h2 className="aq-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span>TURBINE PURITY</span></h2>
          </div>
          <div className="aq-grid3">
            {[
              {title:'COALESCENCE MEDIA', desc:'Advanced coalescing fibers force emulsified water droplets to merge and separate — eliminating water contamination before it reaches turbine injection systems.'},
              {title:'SALT SPRAY DEFENSE', desc:'Naval-grade housing resists galvanic corrosion and salt spray — maintaining filter integrity in continuous offshore and coastal marine operations.'},
              {title:'TURBINE PROTECTION', desc:'Absolute water separation protects turbine nozzles and injection components from corrosion-driven erosion — preserving combustion efficiency and system longevity.'},
              {title:'OFFSHORE RATED', desc:'Engineered for offshore platform fuel systems operating in the harshest marine environments — ensuring reliable fuel delivery under all sea conditions.'},
              {title:'EXTENDED SERVICE', desc:'High-capacity coalescing media extends service intervals — reducing maintenance frequency and total cost of ownership in remote offshore operations.'},
              {title:'OEM COMPATIBILITY', desc:'Precision-matched to OEM turbine and marine engine specifications across 5,000+ cross-references worldwide.'},
            ].map((c,i) => (
              <div key={i} className="aq-card">
                <div className="aq-card-title">{c.title}</div>
                <p className="aq-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aq-cta">
        <div className="aq-cta-inner">
          <div className="aq-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="aq-cta-h2">SECURE YOUR FUEL<br /><span>USE AQUAGUARD SERIES</span></div>
          <p className="aq-cta-p">Do not allow water contamination to compromise your turbine fuel system. Upgrade your separator protection today. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          <Link href="/search" className="aq-btn">FIND MY SKU &rarr;</Link>
          <p className="aq-cta-footer">// GLOBAL HEAVY DUTY ENGINEERING ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
