'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

export default function Cooltech() {
  const css = `
    #ct{--volt:#FFF12D;--bg:#000;--text-body:#a1a1aa;--border-soft:rgba(255,255,255,0.08);background:var(--bg);color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100vh;}
    .ct-impact{font-family:'Montserrat',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:0.9;margin:0;}
    .ct-tech{font-family:'JetBrains Mono',monospace;font-weight:500;text-transform:uppercase;letter-spacing:0.25em;color:var(--volt);font-size:11px;}
    .ct-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 8% 80px;}
    .ct-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/Gemini_Generated_Image_7eigh77eigh77eig.png') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .ct-hero-ov{position:absolute;inset:0;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .ct-hero-c{position:relative;z-index:3;max-width:900px;}
    .ct-sec{padding:90px 8%;border-bottom:1px solid var(--border-soft);}
    .ct-sec-inner{max-width:1400px;margin:0 auto;}
    .ct-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .ct-h1{font-size:clamp(50px,10vw,110px);color:#fff;margin-bottom:0;}
    .ct-h1-volt{color:var(--volt);display:block;}
    .ct-p{color:var(--text-body);font-size:lg;line-height:1.8;margin-bottom:20px;font-weight:300;}
    .ct-h2{font-size:clamp(32px,4.5vw,58px);margin-bottom:24px;line-height:0.95;}
    .ct-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .ct-spec{border-left:1px solid #27272a;padding-left:16px;}
    .ct-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:var(--volt);text-transform:uppercase;display:block;margin-bottom:4px;}
    .ct-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;}
    .ct-img{width:100%;height:auto;display:block;filter:brightness(1.05) contrast(1.1);border:1px solid #1a1a1a;padding:4px;background:#000;}
    .ct-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .ct-card{background:linear-gradient(145deg,#080808,#000);border:1px solid var(--border-soft);padding:45px 35px;transition:all 0.4s;}
    .ct-card:hover{border-color:var(--volt);transform:translateY(-5px);}
    .ct-card-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:20px;text-transform:uppercase;margin-bottom:16px;}
    .ct-btn{background:var(--volt);color:#000;font-family:'Montserrat',sans-serif;font-weight:900;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;font-size:13px;text-decoration:none;transition:all 0.3s;border:2px solid var(--volt);}
    .ct-btn:hover{background:transparent;color:var(--volt);transform:scale(1.05);}
    .ct-cta{padding:100px 8%;background:#000;text-align:center;border-top:1px solid #111;}
    .ct-cta-inner{max-width:900px;margin:0 auto;}
    .ct-cta-h2{font-size:clamp(40px,8vw,100px);margin-bottom:32px;line-height:0.95;}
    .ct-cta-p{font-size:13px;color:var(--text-body);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .ct-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:var(--volt);text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ct-back:hover{background:var(--volt);color:#000;}
    @media(max-width:1024px){.ct-grid2{grid-template-columns:1fr;} .ct-grid3{grid-template-columns:repeat(2,1fr);} .ct-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;}}
    @media(max-width:768px){.ct-grid3{grid-template-columns:1fr;} .ct-p{font-size:12px;} .ct-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div id="ct">
      <style>{css}</style>
      <a href="/?skip=1" className="ct-back">&larr; HOME</a>
      <section className="ct-hero">
        <div className="ct-hero-bg" />
        <div className="ct-hero-ov" />
        <div className="ct-hero-c">
          <p className="ct-tech" style={{marginBottom:'24px'}}>// THERMAL_SYSTEM / MOD-06</p>
          <h1 className="ct-impact ct-h1">MAXIMUM</h1>
          <h1 className="ct-impact ct-h1"><span className="ct-h1-volt">COOLTECH™</span></h1>
          <div style={{marginTop:'40px',maxWidth:'640px',borderLeft:'4px solid var(--volt)',paddingLeft:'40px'}}>
            <p className="ct-p" style={{fontSize:'22px',fontStyle:'italic',fontWeight:'300'}}>Precision <strong>Chemical Balance</strong>. Engineered to eliminate cavitation and cylinder liner pitting in high-load cooling systems</p>
          </div>
          <div style={{marginTop:'48px',display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap'}}>
            <Link href="/search" className="ct-btn">IDENTIFY SKU</Link>
            <div>
              <span className="ct-tech" style={{fontSize:'9px',opacity:0.4,display:'block',marginBottom:'4px'}}>CORROSION CONTROL</span>
              <span style={{color:'#fff',fontSize:'12px',letterSpacing:'0.05em',fontWeight:'bold'}}>TOTAL THERMAL STABILITY</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-sec" style={{background:'#050505'}}>
        <div className="ct-sec-inner">
          <div className="ct-grid2">
            <div>
              <p className="ct-tech" style={{marginBottom:'24px'}}>// COOLING DYNAMICS</p>
              <h2 className="ct-impact ct-h2">CONTROLLED RELEASE<br /><span style={{color:'var(--volt)'}}>SCA ADDITIVES</span></h2>
              <p className="ct-p"><strong>COOLTECH™</strong> technology functions as an internal chemical reactor. By gradually releasing Supplemental Coolant Additives (SCA), it maintains coolant pH at optimal levels, creating a protective barrier on cylinder liners that prevents damage from vapor bubble implosion (cavitation)</p>
              <div className="ct-specs">
                <div className="ct-spec">
                  <span className="ct-spec-label">CHEMICAL BALANCE</span>
                  <p className="ct-spec-sub">Scale Prevention</p>
                </div>
                <div className="ct-spec">
                  <span className="ct-spec-label">ENGINEERING</span>
                  <p className="ct-spec-sub">By-Pass Flow Filtration</p>
                </div>
              </div>
            </div>
            <div style={{background:'#000',border:'1px solid #1a1a1a',padding:'4px'}}>
              <img src={`${WP}/2026/04/COOLANT-FILTER.png`} alt="M-06 COOLTECH Engineering" className="ct-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="ct-sec">
        <div className="ct-sec-inner">
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <p className="ct-tech" style={{marginBottom:'16px'}}>// THERMAL ARMOR</p>
            <h2 className="ct-impact ct-h2" style={{textAlign:'center'}}>COOLING <span style={{color:'var(--volt)'}}>ENGINEERING</span></h2>
          </div>
          <div className="ct-grid3">
            {[
              {title:'ANTI-CAVITATION',desc:'Advanced formula protecting metallic surfaces against high-pressure bubble erosion'},
              {title:'PH CONTROL',desc:'Maintains system alkalinity, preventing acidic corrosion in radiators and water pumps'},
              {title:'SYNTHETIC MEDIA',desc:'Traps sediment and chemical precipitates, keeping the cooling passages unobstructed'},
            ].map((c,i) => (
              <div key={i} className="ct-card">
                <h3 className="ct-impact" style={{fontSize:'20px',marginBottom:'16px'}}>{c.title}</h3>
                <p className="ct-p" style={{fontSize:'13px',color:'var(--text-body)'}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ct-cta">
        <div className="ct-cta-inner">
          <h2 className="ct-impact ct-cta-h2">STABILIZE YOUR ENGINE</h2>
          <h2 className="ct-impact ct-cta-h2"><span style={{color:'var(--volt)'}}>USE COOLTECH™</span></h2>
          <Link href="/search" className="ct-btn">FIND MY SKU</Link>
          <p className="ct-tech" style={{fontSize:'9px',opacity:0.3,marginTop:'48px',letterSpacing:'0.5em'}}>// GLOBAL HEAVY DUTY ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
