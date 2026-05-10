'use client';
import Link from 'next/link';

const WP = 'https://6b5071d61650157117074aefcbb8bf5b.r2.cloudflarestorage.com/elimfilters-renders';

export default function Syntrax() {
  const css = `
    #sx{--volt:#FFF12D;--bg:#000;--text-body:#a1a1aa;--border-soft:rgba(255,255,255,0.08);background:var(--bg);color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100vh;}
    .sx-impact{font-family:'Montserrat',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:0.9;margin:0;}
    .sx-tech{font-family:'JetBrains Mono',monospace;font-weight:500;text-transform:uppercase;letter-spacing:0.25em;color:var(--volt);font-size:11px;}
    .sx-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 8% 80px;}
    .sx-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2025/08/Screenshot-2025-08-07-223807.webp') center 40%/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 60%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 60%);z-index:1;}
    .sx-hero-ov{position:absolute;inset:0;background:linear-gradient(90deg,#000 20%,rgba(0,0,0,0.3) 60%,transparent 100%);z-index:2;}
    .sx-hero-c{position:relative;z-index:3;max-width:900px;}
    .sx-sec{padding:90px 8%;border-bottom:1px solid var(--border-soft);}
    .sx-sec-inner{max-width:1400px;margin:0 auto;}
    .sx-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .sx-h1{font-size:clamp(50px,10vw,110px);color:#fff;margin-bottom:0;}
    .sx-h1-volt{color:var(--volt);display:block;}
    .sx-p{color:var(--text-body);font-size:lg;line-height:1.8;margin-bottom:20px;font-weight:300;}
    .sx-h2{font-size:clamp(32px,4.5vw,58px);margin-bottom:24px;line-height:0.95;}
    .sx-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .sx-spec{border-left:1px solid #27272a;padding-left:16px;}
    .sx-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:var(--volt);text-transform:uppercase;display:block;margin-bottom:4px;}
    .sx-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;}
    .sx-img{width:100%;height:auto;display:block;filter:brightness(1.1) contrast(1.1);border:1px solid #1a1a1a;padding:4px;background:#000;}
    .sx-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .sx-card{background:linear-gradient(145deg,#080808,#000);border:1px solid var(--border-soft);padding:45px 35px;transition:all 0.4s;}
    .sx-card:hover{border-color:var(--volt);transform:translateY(-5px);}
    .sx-card-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:20px;text-transform:uppercase;margin-bottom:16px;}
    .sx-btn{background:var(--volt);color:#000;font-family:'Montserrat',sans-serif;font-weight:900;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;font-size:13px;text-decoration:none;transition:all 0.3s;border:2px solid var(--volt);}
    .sx-btn:hover{background:transparent;color:var(--volt);transform:scale(1.05);}
    .sx-cta{padding:100px 8%;background:#000;text-align:center;border-top:1px solid #111;}
    .sx-cta-inner{max-width:900px;margin:0 auto;}
    .sx-cta-h2{font-size:clamp(40px,8vw,100px);margin-bottom:32px;line-height:0.95;}
    .sx-cta-p{font-size:13px;color:var(--text-body);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .sx-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:var(--volt);text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .sx-back:hover{background:var(--volt);color:#000;}
    @media(max-width:1024px){.sx-grid2{grid-template-columns:1fr;} .sx-grid3{grid-template-columns:repeat(2,1fr);} .sx-hero-bg{opacity:0.9;mask-image:none;-webkit-mask-image:none;background-position:center!important;}}
    @media(max-width:768px){.sx-grid3{grid-template-columns:1fr;} .sx-p{font-size:12px;} .sx-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div id="sx">
      <style>{css}</style>
      <a href="/?skip=1" className="sx-back">&larr; HOME</a>
      <section className="sx-hero">
        <div className="sx-hero-bg" />
        <div className="sx-hero-ov" />
        <div className="sx-hero-c">
          <p className="sx-tech" style={{marginBottom:'24px'}}>// 02 / LUBRICATION TECHNOLOGY</p>
          <h1 className="sx-impact sx-h1">SYNTRAX™</h1>
          <h1 className="sx-impact sx-h1"><span className="sx-h1-volt">HYBRID MEDIA</span></h1>
          <div style={{marginTop:'40px',maxWidth:'640px',borderLeft:'4px solid var(--volt)',paddingLeft:'40px'}}>
            <p className="sx-p" style={{fontSize:'22px',fontStyle:'italic',fontWeight:'300'}}><strong>IA Core</strong> Architecture. Exclusive filter media that fuses synthetic fibers and cellulose for a perfect balance between flow and particle retention.</p>
          </div>
          <div style={{marginTop:'48px',display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap'}}>
            <Link href="/search" className="sx-btn">IDENTIFY SKU</Link>
            <div>
              <span className="sx-tech" style={{fontSize:'9px',opacity:0.4,display:'block',marginBottom:'4px'}}>OPT-IA DESIGN</span>
              <span style={{color:'#fff',fontSize:'12px',letterSpacing:'0.05em',fontWeight:'bold'}}>HYBRID MEDIA TECHNOLOGY</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sx-sec" style={{background:'#050505'}}>
        <div className="sx-sec-inner">
          <div className="sx-grid2">
            <div>
              <p className="sx-tech" style={{marginBottom:'24px'}}>// ADVANCED STRUCTURE</p>
              <h2 className="sx-impact sx-h2">HYBRID<br /><span style={{color:'var(--volt)'}}>IA ENGINEERING</span></h2>
              <p className="sx-p"><strong>SYNTRAX™</strong> is an exclusive filtration media developed through artificial intelligence. It is not just a simple medium: it is a <strong>molecular fusion</strong> that intertwines the absorption capacity of cellulose with the structural strength of synthetic fibers. This combination achieves constant sub-micron cleanliness, protecting critical components under extreme pressure conditions.</p>
              <div className="sx-specs">
                <div className="sx-spec">
                  <span className="sx-spec-label">MEDIA TYPE</span>
                  <p className="sx-spec-sub">Hybrid (Synthetic + Cellulose)</p>
                </div>
                <div className="sx-spec">
                  <span className="sx-spec-label">CORE DESIGN</span>
                  <p className="sx-spec-sub">AI-Developed</p>
                </div>
              </div>
            </div>
            <div style={{background:'#000',border:'1px solid #1a1a1a',padding:'4px'}}>
              <img src={`${WP}/2026/02/Gemini_Generated_Image_p9ajwtp9ajwtp9aj.png`} alt="SYNTRAX Hybrid Technical Analysis" className="sx-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="sx-sec">
        <div className="sx-sec-inner">
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <p className="sx-tech" style={{marginBottom:'16px'}}>// PERFORMANCE ATTRIBUTES</p>
            <h2 className="sx-impact sx-h2" style={{textAlign:'center'}}>STABILITY <span style={{color:'var(--volt)'}}>& FLOW</span></h2>
          </div>
          <div className="sx-grid3">
            {[
              {title:'HYBRID MATRIX',desc:'Intertwined structure designed to capture sub-micron contaminants without restricting oil flow.'},
              {title:'AI OPTIMIZATION',desc:'Fiber configuration precisely calculated to maximize filter lifespan and thermal stability.'},
              {title:'TURBO PROTECTION',desc:'Ensures a lubricant free of abrasive particles, vital for modern turbochargers and engines.'},
            ].map((c,i) => (
              <div key={i} className="sx-card">
                <h3 className="sx-impact" style={{fontSize:'20px',marginBottom:'16px'}}>{c.title}</h3>
                <p className="sx-p" style={{fontSize:'13px',color:'var(--text-body)'}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-cta">
        <div className="sx-cta-inner">
          <h2 className="sx-impact sx-cta-h2">HYBRID SCIENCE</h2>
          <h2 className="sx-impact sx-cta-h2"><span style={{color:'var(--volt)'}}>USE SYNTRAX™</span></h2>
          <Link href="/search" className="sx-btn">FIND MY SKU</Link>
          <p className="sx-tech" style={{fontSize:'9px',opacity:0.3,marginTop:'48px',letterSpacing:'0.5em'}}>// EXCLUSIVE IA CORE TECHNOLOGY BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
