'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Aquaguard() {
  const css = `
    .ag{background:#000;color:#fff;min-height:100vh;}
    .ag-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ag-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ag-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .ag-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_e9qpvne9qpvne9qp.png') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .ag-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .ag-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .ag-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ag-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .ag-h1 span{color:#FFF12D;}
    .ag-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ag-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .ag-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .ag-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .ag-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .ag-btn:hover{background:transparent;color:#FFF12D;}
    .ag-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .ag-sec-inner{max-width:1400px;margin:0 auto;}
    .ag-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .ag-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ag-h2 span{color:#FFF12D;}
    .ag-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .ag-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .ag-spec{border-left:1px solid #27272a;padding-left:16px;}
    .ag-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .ag-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .ag-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .ag-img-wrap img{width:100%;height:auto;display:block;filter:contrast(1.05);}
    .ag-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .ag-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s;}
    .ag-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .ag-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .ag-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ag-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ag-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .ag-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .ag-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ag-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ag-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .ag-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .ag-cta-inner{max-width:900px;margin:0 auto;}
    .ag-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .ag-cta-h2 span{color:#FFF12D;}
    .ag-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .ag-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.ag-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .ag-grid2{grid-template-columns:1fr;} .ag-grid3{grid-template-columns:repeat(2,1fr);} .ag-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.ag-grid3{grid-template-columns:1fr;} .ag-hero-p{font-size:12px;} .ag-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ag">
      <style>{css}</style>
      <a href="/?skip=1" className="ag-back">&larr; HOME</a>
      <section className="ag-hero">
        <div className="ag-hero-bg" />
        <div className="ag-hero-ov" />
        <div className="ag-hero-c">
          <div className="ag-eyebrow">// FUEL WATER SEPARATION / MOD-07</div>
          <h1 className="ag-h1">AQUAGUARD™<br /><span>TOTAL SEPARATION</span></h1>
          <p className="ag-hero-p">Industrial asset protection systems engineered for diesel fuel circuits, water separator housings, and critical injection infrastructure. AQUAGUARD™ hydrophobic coalescence technology eliminates free and emulsified water from fuel — protecting Common Rail injectors from corrosion, cavitation, and premature failure across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="ag-hero-stat">
            <Link href="/search" className="ag-btn">IDENTIFY SKU</Link>
            <div>
              <span className="ag-stat-label">CRITICAL PROTECTION</span>
              <span className="ag-stat-val">99.9% H2O SEPARATION</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ag-sec" style={{background:'#050505'}}>
        <div className="ag-sec-inner">
          <div className="ag-grid2">
            <div>
              <div className="ag-eyebrow">// HYDROPHOBIC TECHNOLOGY</div>
              <h2 className="ag-h2">ABSOLUTE WATER<br /><span>ELIMINATION</span></h2>
              <p className="ag-p">AQUAGUARD™ utilizes advanced hydrophobic coalescence media that forces emulsified water micro-droplets to merge and settle — eliminating water contamination before it reaches precision injection components in diesel fuel systems worldwide.</p>
              <p className="ag-p">Engineered for heavy-duty diesel engines in mining, construction, agriculture, marine, and fleet operations requiring absolute fuel purity under all operating conditions.</p>
              <div className="ag-specs">
                <div className="ag-spec"><span className="ag-spec-label">WATER SEPARATION</span><span className="ag-spec-sub">99.9% Efficiency</span></div>
                <div className="ag-spec"><span className="ag-spec-label">MEDIA TYPE</span><span className="ag-spec-sub">Hydrophobic Coalescence</span></div>
                <div className="ag-spec"><span className="ag-spec-label">ISO 16889</span><span className="ag-spec-sub">Certified Standard</span></div>
                <div className="ag-spec"><span className="ag-spec-label">OEM MATCHED</span><span className="ag-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="ag-img-wrap">
              <img src={`${WP}/2025/08/Imagen1-1.webp`} alt="AQUAGUARD Water Separator" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="ag-sec">
        <div className="ag-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ag-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// WATER SEPARATION TECHNOLOGY</div>
            <h2 className="ag-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span>PURE FUEL DELIVERY</span></h2>
          </div>
          <div className="ag-grid3">
            {[
              {title:'COALESCENCE MEDIA', desc:'Advanced hydrophobic fibers force emulsified water droplets to merge and separate — eliminating water contamination before it reaches Common Rail injection systems.'},
              {title:'INJECTOR DEFENSE', desc:'99.9% water separation prevents injector corrosion, pitting, and cavitation — protecting precision spray geometry and maintaining peak combustion efficiency.'},
              {title:'FIELD FUEL QUALITY', desc:'Engineered for variable fuel quality in remote mining, construction, and agricultural sites — delivering consistent injection protection regardless of fuel source.'},
              {title:'OPTIMIZED FLOW', desc:'Low restriction design maintains consistent fuel pressure and flow rate — protecting transfer pumps and preserving engine power output throughout service life.'},
              {title:'EXTENDED SERVICE', desc:'High-capacity water separation extends filter service intervals — reducing maintenance frequency and total cost of ownership across heavy-duty fleet operations.'},
              {title:'OEM COMPATIBILITY', desc:'Precision-matched to OEM fuel system specifications across 5,000+ cross-references — compatible with all major diesel engine platforms and fuel system designs.'},
            ].map((c, i) => (
              <div key={i} className="ag-card">
                <div className="ag-card-title">{c.title}</div>
                <p className="ag-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-sec" style={{background:'#000'}}>
        <div className="ag-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="ag-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="ag-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="ag-protocol-grid">
            {[
              {num:'01', title:'WATER ELIMINATION', desc:'99.9% water separation efficiency regardless of fuel quality or emulsification level — protecting injection systems in all operating environments worldwide.'},
              {num:'02', title:'COALESCENCE EFFICIENCY', desc:'Progressive hydrophobic media forces micro-droplet coalescence and separation — capturing both free and emulsified water before it reaches precision fuel components.'},
              {num:'03', title:'INJECTOR LONGEVITY', desc:'Total water elimination prevents the corrosion and pitting that destroys Common Rail injectors — extending injection system service life and maintaining combustion precision.'},
            ].map((p, i) => (
              <div key={i} className="ag-protocol-card">
                <div className="ag-protocol-num">{p.num}</div>
                <div className="ag-protocol-title">{p.title}</div>
                <p className="ag-protocol-p">{p.desc}</p>
                <div className="ag-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-cta">
        <div className="ag-cta-inner">
          <div className="ag-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="ag-cta-h2">PURE FUEL<br /><span>USE AQUAGUARD™</span></div>
          <p className="ag-cta-p">Do not allow water contamination to destroy your injection system. Upgrade to AQUAGUARD™ hydrophobic coalescence protection today. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          <Link href="/search" className="ag-btn">FIND MY SKU &rarr;</Link>
          <p className="ag-cta-footer">// GLOBAL HEAVY DUTY ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
