'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function Syntrax() {
  const css = `
    .sx{background:#000;color:#fff;min-height:100vh;}
    .sx-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .sx-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .sx-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .sx-hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.3;z-index:1;}
    .sx-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 40%,rgba(0,0,0,0.6) 70%,transparent 100%);z-index:2;}
    .sx-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .sx-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .sx-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .sx-h1 span{color:#FFF12D;}
    .sx-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .sx-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .sx-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .sx-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .sx-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .sx-btn:hover{background:transparent;color:#FFF12D;}
    .sx-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .sx-sec-inner{max-width:1400px;margin:0 auto;}
    .sx-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .sx-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .sx-h2 span{color:#FFF12D;}
    .sx-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .sx-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .sx-spec{border-left:1px solid #27272a;padding-left:16px;}
    .sx-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .sx-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .sx-img-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;}
    .sx-img-wrap img{width:100%;height:auto;display:block;filter:contrast(1.05);}
    .sx-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .sx-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .sx-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .sx-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .sx-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .sx-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .sx-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .sx-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .sx-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .sx-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .sx-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .sx-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .sx-cta-inner{max-width:900px;margin:0 auto;}
    .sx-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .sx-cta-h2 span{color:#FFF12D;}
    .sx-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .sx-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.sx-grid2{grid-template-columns:1fr;} .sx-grid3{grid-template-columns:repeat(2,1fr);} .sx-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.sx-grid3{grid-template-columns:1fr;} .sx-hero-p{font-size:12px;} .sx-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="sx">
      <style>{css}</style>
      <a href="/?skip=1" className="sx-back">&larr; HOME</a>

      <section className="sx-hero">
        <video className="sx-hero-video" src={`${WP}/2026/05/p554004.mp4`} autoPlay muted loop playsInline />
        <div className="sx-hero-ov" />
        <div className="sx-hero-c">
          <div className="sx-eyebrow">// LUBRICATION SYSTEMS / MOD-01</div>
          <h1 className="sx-h1">SYNTRAX™<br /><span>POWERED FILTRATION</span></h1>
          <p className="sx-hero-p">Industrial asset protection systems engineered for engine lubrication circuits, high-load diesel powertrains, and critical oil filtration infrastructure. SYNTRAX™ hybrid synthetic media delivers absolute soot capture, metal particle retention, and extended oil service intervals — protecting engines across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="sx-hero-stat">
            <Link href="/search" className="sx-btn">SEARCH MY SKU</Link>
            <div>
              <span className="sx-stat-label">POWERED FILTRATION</span>
              <span className="sx-stat-val">TOTAL ENGINE PROTECTION</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sx-sec" style={{background:'#050505'}}>
        <div className="sx-sec-inner">
          <div className="sx-grid2">
            <div>
              <div className="sx-eyebrow">// SYNTRAX™ ARCHITECTURE</div>
              <h2 className="sx-h2">HYBRID MEDIA<br /><span>TECHNOLOGY</span></h2>
              <p className="sx-p">SYNTRAX™ combines synthetic and cellulose fiber layers in a progressive density gradient — capturing soot, metallic wear particles, and oxidation byproducts before they degrade oil viscosity and accelerate engine wear in high-load diesel applications worldwide.</p>
              <p className="sx-p">Engineered for heavy-duty diesel engines operating under continuous load in mining, construction, long-haul transport, and industrial power generation across 12 industries worldwide.</p>
              <div className="sx-specs">
                <div className="sx-spec"><span className="sx-spec-label">MEDIA TYPE</span><span className="sx-spec-sub">Hybrid Synthetic</span></div>
                <div className="sx-spec"><span className="sx-spec-label">SOOT CAPACITY</span><span className="sx-spec-sub">High-Load Rated</span></div>
                <div className="sx-spec"><span className="sx-spec-label">ISO 16889</span><span className="sx-spec-sub">Certified Standard</span></div>
                <div className="sx-spec"><span className="sx-spec-label">OEM MATCHED</span><span className="sx-spec-sub">5,000+ Cross-Refs</span></div>
              </div>
            </div>
            <div className="sx-img-wrap">
              <img src={`${WP}/2025/08/Imagen1-1.webp`} alt="SYNTRAX Filter Engineering" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="sx-sec">
        <div className="sx-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="sx-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// ENGINE PROTECTION</div>
            <h2 className="sx-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span>TOTAL OIL PURITY</span></h2>
          </div>
          <div className="sx-grid3">
            {[
              {title:'SOOT CAPTURE', desc:'High-capacity synthetic media captures combustion soot before it degrades oil viscosity — maintaining film strength and protecting bearing surfaces under heavy load.'},
              {title:'METAL PARTICLE RETENTION', desc:'Progressive density gradient captures metallic wear particles — preventing abrasive damage to precision engine components during cold starts and peak load cycles.'},
              {title:'EXTENDED INTERVALS', desc:'Superior dirt-holding capacity extends oil filter service intervals by up to 2X — reducing maintenance frequency and total cost of ownership across fleet operations.'},
              {title:'THERMAL STABILITY', desc:'Hybrid media structure maintains filtration integrity across extreme temperature cycles — from arctic cold starts to desert heat in mining and construction worldwide.'},
              {title:'BYPASS VALVE PROTECTION', desc:'Precision bypass valve engineering ensures oil flow is never interrupted — protecting engines during cold starts when oil viscosity is at its highest.'},
              {title:'OEM INTEGRITY', desc:'Precision-matched to OEM lubrication system specifications across 5,000+ cross-references — ensuring zero-compromise protection in all heavy-duty engine applications.'},
            ].map((c, i) => (
              <div key={i} className="sx-card">
                <div className="sx-card-title">{c.title}</div>
                <p className="sx-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-sec" style={{background:'#000'}}>
        <div className="sx-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="sx-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="sx-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="sx-protocol-grid">
            {[
              {num:'01', title:'OIL CLEANLINESS', desc:'Maintains ISO cleanliness codes throughout the full service interval — protecting precision engine components from abrasive wear in high-load diesel applications worldwide.'},
              {num:'02', title:'SOOT MANAGEMENT', desc:'High-capacity soot capture prevents oil thickening and viscosity breakdown — maintaining consistent lubrication film strength during extended service intervals.'},
              {num:'03', title:'COLD START PROTECTION', desc:'Optimized bypass valve and media design ensures immediate oil flow from first ignition — protecting engine internals during the most critical wear period.'},
            ].map((p, i) => (
              <div key={i} className="sx-protocol-card">
                <div className="sx-protocol-num">{p.num}</div>
                <div className="sx-protocol-title">{p.title}</div>
                <p className="sx-protocol-p">{p.desc}</p>
                <div className="sx-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-cta">
        <div className="sx-cta-inner">
          <div className="sx-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</div>
          <div className="sx-cta-h2">PROTECT YOUR ENGINE<br /><span>USE SYNTRAX™</span></div>
          <p className="sx-cta-p">Do not allow lubrication contamination to accelerate engine wear. Upgrade to SYNTRAX™ hybrid synthetic media today. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <Link href="/search" className="sx-btn">SEARCH MY SKU &rarr;</Link>
          <p className="sx-cta-footer">// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</p>
        </div>
      </section>
    </div>
  );
}
