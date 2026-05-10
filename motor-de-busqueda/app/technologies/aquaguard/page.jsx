'use client';
import Link from 'next/link';

const WP = 'https://media.elimfilters.com/wp-content/uploads';

export default function Aquaguard() {
  const css = `
    #aq{--volt:#FFF12D;--bg:#000;--text-body:#a1a1aa;--border-soft:rgba(255,255,255,0.08);background:var(--bg);color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100vh;}
    .aq-impact{font-family:'Montserrat',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:0.9;margin:0;}
    .aq-tech{font-family:'JetBrains Mono',monospace;font-weight:500;text-transform:uppercase;letter-spacing:0.25em;color:var(--volt);font-size:11px;}
    .aq-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 8% 80px;}
    .aq-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_gxn7azgxn7azgxn7.png') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .aq-hero-ov{position:absolute;inset:0;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .aq-hero-c{position:relative;z-index:3;max-width:900px;}
    .aq-sec{padding:90px 8%;border-bottom:1px solid var(--border-soft);}
    .aq-sec-inner{max-width:1400px;margin:0 auto;}
    .aq-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .aq-h1{font-size:clamp(50px,10vw,110px);color:#fff;margin-bottom:0;}
    .aq-h1-volt{color:var(--volt);display:block;}
    .aq-p{color:var(--text-body);font-size:lg;line-height:1.8;margin-bottom:20px;font-weight:300;}
    .aq-h2{font-size:clamp(32px,4.5vw,58px);margin-bottom:24px;line-height:0.95;}
    .aq-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .aq-spec{border-left:1px solid #27272a;padding-left:16px;}
    .aq-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:var(--volt);text-transform:uppercase;display:block;margin-bottom:4px;}
    .aq-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;}
    .aq-img{width:100%;height:auto;display:block;filter:contrast(1.05);border:1px solid #1a1a1a;padding:4px;background:#000;}
    .aq-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .aq-card{background:linear-gradient(145deg,#080808,#000);border:1px solid var(--border-soft);padding:45px 35px;transition:all 0.4s;}
    .aq-card:hover{border-color:var(--volt);transform:translateY(-5px);}
    .aq-card-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:20px;text-transform:uppercase;margin-bottom:16px;}
    .aq-btn{background:var(--volt);color:#000;font-family:'Montserrat',sans-serif;font-weight:900;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;font-size:13px;text-decoration:none;transition:all 0.3s;border:2px solid var(--volt);}
    .aq-btn:hover{background:transparent;color:var(--volt);transform:scale(1.05);}
    .aq-cta{padding:100px 8%;background:#000;text-align:center;border-top:1px solid #111;}
    .aq-cta-inner{max-width:900px;margin:0 auto;}
    .aq-cta-h2{font-size:clamp(40px,8vw,100px);margin-bottom:32px;line-height:0.95;}
    .aq-cta-p{font-size:13px;color:var(--text-body);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .aq-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:var(--volt);text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .aq-back:hover{background:var(--volt);color:#000;}
    @media(max-width:1024px){.aq-grid2{grid-template-columns:1fr;} .aq-grid3{grid-template-columns:repeat(2,1fr);} .aq-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;}}
    @media(max-width:768px){.aq-grid3{grid-template-columns:1fr;} .aq-p{font-size:12px;} .aq-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div id="aq">
      <style>{css}</style>
      <a href="/?skip=1" className="aq-back">&larr; HOME</a>
      <section className="aq-hero">
        <div className="aq-hero-bg" />
        <div className="aq-hero-ov" />
        <div className="aq-hero-c">
          <p className="aq-tech" style={{marginBottom:'24px'}}>// DIESEL_FILTRATION / S_SERIES</p>
          <h1 className="aq-impact aq-h1">HYDROPHOBIC</h1>
          <h1 className="aq-impact aq-h1"><span className="aq-h1-volt">AQUAGUARD™</span></h1>
          <div style={{marginTop:'40px',maxWidth:'640px',borderLeft:'4px solid var(--volt)',paddingLeft:'40px'}}>
            <p className="aq-p" style={{fontSize:'22px',fontStyle:'italic',fontWeight:'300'}}>Advanced shielding for <strong>Fuel Water Separator Filters</strong>. Extreme coalescence engineering for total water removal from fuel systems.</p>
          </div>
          <div style={{marginTop:'48px',display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap'}}>
            <Link href="/search" className="aq-btn">IDENTIFY SKU</Link>
            <div>
              <span className="aq-tech" style={{fontSize:'9px',opacity:0.4,display:'block',marginBottom:'4px'}}>CRITICAL PROTECTION</span>
              <span style={{color:'#fff',fontSize:'12px',letterSpacing:'0.05em',fontWeight:'bold'}}>99.8% H2O SEPARATION</span>
            </div>
          </div>
        </div>
      </section>

      <section className="aq-sec" style={{background:'#050505'}}>
        <div className="aq-sec-inner">
          <div className="aq-grid2">
            <div>
              <p className="aq-tech" style={{marginBottom:'24px'}}>// COALESCENCE DYNAMICS</p>
              <h2 className="aq-impact aq-h2">ACTIVE MOLECULAR<br /><span style={{color:'var(--volt)'}}>REPELLENCY</span></h2>
              <p className="aq-p"><strong>AQUAGUARD™</strong> technology utilizes a high-density hydrophobic coated media. This process forces emulsified water micro-particles to bond, ensuring they settle instantly before compromising injector integrity.</p>
              <div className="aq-specs">
                <div className="aq-spec">
                  <span className="aq-spec-label">SEPARATION EFFICIENCY</span>
                  <p className="aq-spec-sub">Superior Industrial Grade</p>
                </div>
                <div className="aq-spec">
                  <span className="aq-spec-label">APPLICATION</span>
                  <p className="aq-spec-sub">Fuel Water Separators</p>
                </div>
              </div>
            </div>
            <div style={{background:'#000',border:'1px solid #1a1a1a',padding:'4px'}}>
              <img src={`${WP}/2026/04/2025-07-29_11-21-15_000.jpg`} alt="AQUAGUARD Technical Validation" className="aq-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="aq-sec">
        <div className="aq-sec-inner">
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <p className="aq-tech" style={{marginBottom:'16px'}}>// WATER & PARTICLE CONTROL</p>
            <h2 className="aq-impact aq-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span style={{color:'var(--volt)'}}>DIESEL SYSTEMS</span></h2>
          </div>
          <div className="aq-grid3">
            {[
              {title:'HYDROPHOBIC MEDIA',desc:'Treated fibers designed to actively repel water even under high-velocity flow conditions.'},
              {title:'OPTIMIZED FLOW',desc:'Engineered to minimize restriction, extending the service life of the transfer pump.'},
              {title:'TOTAL PROTECTION',desc:'Eliminates the risk of corrosion and pitting in Common Rail injection systems.'},
            ].map((c,i) => (
              <div key={i} className="aq-card">
                <h3 className="aq-impact" style={{fontSize:'20px',marginBottom:'16px'}}>{c.title}</h3>
                <p className="aq-p" style={{fontSize:'13px',color:'var(--text-body)'}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aq-cta">
        <div className="aq-cta-inner">
          <h2 className="aq-impact aq-cta-h2">SECURE YOUR FUEL</h2>
          <h2 className="aq-impact aq-cta-h2"><span style={{color:'var(--volt)'}}>USE AQUAGUARD™</span></h2>
          <Link href="/search" className="aq-btn">FIND MY SKU</Link>
          <p className="aq-tech" style={{fontSize:'9px',opacity:0.3,marginTop:'48px',letterSpacing:'0.5em'}}>// ELIMFILTERS HEAVY DUTY GLOBAL ENGINEERING</p>
        </div>
      </section>
    </div>
  );
}
