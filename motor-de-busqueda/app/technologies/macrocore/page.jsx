'use client';
import Link from 'next/link';

import { WP } from '../../constants';

export default function Macrocore() {
  const css = `
    #mc{--volt:#FFF12D;--bg:#000;--text-body:#a1a1aa;--border-soft:rgba(255,255,255,0.08);background:var(--bg);color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100vh;}
    .mc-impact{font-family:'Montserrat',sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;line-height:0.9;margin:0;}
    .mc-tech{font-family:'JetBrains Mono',monospace;font-weight:500;text-transform:uppercase;letter-spacing:0.25em;color:var(--volt);font-size:11px;}
    .mc-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 8% 80px;}
    .mc-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2025/08/Imagen1.png') right center/contain no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 65%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 65%);z-index:1;}
    .mc-hero-ov{position:absolute;inset:0;background:linear-gradient(90deg,#000 25%,rgba(0,0,0,0.7) 55%,transparent 100%);z-index:2;}
    .mc-hero-c{position:relative;z-index:3;max-width:900px;}
    .mc-sec{padding:90px 8%;border-bottom:1px solid var(--border-soft);}
    .mc-sec-inner{max-width:1400px;margin:0 auto;}
    .mc-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .mc-h1{font-size:clamp(50px,10vw,110px);color:#fff;margin-bottom:0;}
    .mc-h1-volt{color:var(--volt);display:block;}
    .mc-p{color:var(--text-body);font-size:lg;line-height:1.8;margin-bottom:20px;font-weight:300;}
    .mc-h2{font-size:clamp(32px,4.5vw,58px);margin-bottom:24px;line-height:0.95;}
    .mc-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .mc-spec{border-left:1px solid #27272a;padding-left:16px;}
    .mc-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:var(--volt);text-transform:uppercase;display:block;margin-bottom:4px;}
    .mc-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;}
    .mc-img{width:100%;height:auto;display:block;filter:contrast(1.05);border:1px solid #1a1a1a;padding:4px;background:#000;}
    .mc-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .mc-card{background:linear-gradient(145deg,#080808,#000);border:1px solid var(--border-soft);padding:45px 35px;transition:all 0.4s;}
    .mc-card:hover{border-color:var(--volt);transform:translateY(-5px);}
    .mc-card-title{font-family:'Montserrat',sans-serif;font-weight:900;font-size:20px;text-transform:uppercase;margin-bottom:16px;}
    .mc-btn{background:var(--volt);color:#000;font-family:'Montserrat',sans-serif;font-weight:900;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;font-size:13px;text-decoration:none;transition:all 0.3s;border:2px solid var(--volt);}
    .mc-btn:hover{background:transparent;color:var(--volt);transform:scale(1.05);}
    .mc-cta{padding:100px 8%;background:#000;text-align:center;border-top:1px solid #111;}
    .mc-cta-inner{max-width:900px;margin:0 auto;}
    .mc-cta-h2{font-size:clamp(40px,8vw,100px);margin-bottom:32px;line-height:0.95;}
    .mc-cta-p{font-size:13px;color:var(--text-body);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .mc-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:var(--volt);text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mc-back:hover{background:var(--volt);color:#000;}
    @media(max-width:1024px){.mc-grid2{grid-template-columns:1fr;} .mc-grid3{grid-template-columns:repeat(2,1fr);} .mc-hero-bg{opacity:0.4;background-size:cover;mask-image:none;-webkit-mask-image:none;} .mc-hero-ov{background:rgba(0,0,0,0.85);}}
    @media(max-width:768px){.mc-grid3{grid-template-columns:1fr;} .mc-p{font-size:12px;} .mc-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div id="mc">
      <style>{css}</style>
      <a href="/?skip=1" className="mc-back">&larr; HOME</a>
      <section className="mc-hero">
        <div className="mc-hero-bg" />
        <div className="mc-hero-ov" />
        <div className="mc-hero-c">
          <p className="mc-tech" style={{marginBottom:'24px'}}>// HEAVY_DUTY_AIR_SYSTEMS / SYS-01</p>
          <h1 className="mc-impact mc-h1">STRUCTURE</h1>
          <h1 className="mc-impact mc-h1"><span className="mc-h1-volt">MACROCORE™.</span></h1>
          <div style={{marginTop:'40px',maxWidth:'640px',borderLeft:'4px solid var(--volt)',paddingLeft:'40px'}}>
            <p className="mc-p" style={{fontSize:'22px',fontStyle:'italic',fontWeight:'300'}}><strong>Structural Reinforcement</strong> Technology — Engineering of Certainty. Absolute shield against collapse and media migration in high-displacement engines.</p>
          </div>
          <div style={{marginTop:'48px',display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap'}}>
            <Link href="/search" className="mc-btn">SEARCH MY SKU</Link>
            <div>
              <span className="mc-tech" style={{fontSize:'9px',opacity:0.4,display:'block',marginBottom:'4px'}}>GLOBAL PROTECTION</span>
              <span style={{color:'#fff',fontSize:'12px',letterSpacing:'0.05em',fontWeight:'bold'}}>100% SEALED</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mc-sec" style={{background:'#050505'}}>
        <div className="mc-sec-inner">
          <div className="mc-grid2">
            <div>
              <p className="mc-tech" style={{marginBottom:'24px'}}>// ANTI-COLLAPSE TECHNOLOGY</p>
              <h2 className="mc-impact mc-h2">HD ENGINEERING<br /><span style={{color:'var(--volt)'}}>VALIDATION.</span></h2>
              <p className="mc-p">The <strong>MACROCORE™</strong> architecture redefines mechanical stability. The radial support mesh system ensures the filter geometry remains unalterable, even under the extreme suction demands of heavy machinery.</p>
              <div className="mc-specs">
                <div className="mc-spec">
                  <span className="mc-spec-label">CRUSH RESISTANCE</span>
                  <p className="mc-spec-sub">Exceeds 62 PSI</p>
                </div>
                <div className="mc-spec">
                  <span className="mc-spec-label">STRUCTURAL GAIN</span>
                  <p className="mc-spec-sub">+35% vs OEM</p>
                </div>
              </div>
            </div>
            <div style={{background:'#000',border:'1px solid #1a1a1a',padding:'4px'}}>
              <img src={`${WP}/2026/04/Gemini_Generated_Image_pmclxypmclxypmcl.png`} alt="MACROCORE Engineering Validation" className="mc-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="mc-sec">
        <div className="mc-sec-inner">
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <p className="mc-tech" style={{marginBottom:'16px'}}>// INDUSTRIAL SHIELDING</p>
            <h2 className="mc-impact mc-h2" style={{textAlign:'center'}}>ENGINEERING FOR <span style={{color:'var(--volt)'}}>EXTREME CYCLES.</span></h2>
          </div>
          <div className="mc-grid3">
            {[
              {title:'REINFORCED CORE',desc:'Optimized central structure to nullify the risk of deformation in critical mining and construction operations.'},
              {title:'RADIAL SEALING',desc:'INTEKCORE™ technology ensuring a hermetic seal against contaminants in high-vibration environments.'},
              {title:'CYCLIC STABILITY',desc:'Maintains filter media integrity against constant motor pulsations under full load.'},
            ].map((c,i) => (
              <div key={i} className="mc-card">
                <h3 className="mc-impact" style={{fontSize:'20px',marginBottom:'16px'}}>{c.title}</h3>
                <p className="mc-p" style={{fontSize:'13px',color:'var(--text-body)'}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-cta">
        <div className="mc-cta-inner">
          <h2 className="mc-impact mc-cta-h2">ELIMINATE THE RISK.</h2>
          <h2 className="mc-impact mc-cta-h2"><span style={{color:'var(--volt)'}}>SECURE THE ASSET.</span></h2>
          <Link href="/search" className="mc-btn">SEARCH MY SKU</Link>
          <p className="mc-tech" style={{fontSize:'9px',opacity:0.3,marginTop:'48px',letterSpacing:'0.5em'}}>// ELIMFILTERS GLOBAL HEAVY DUTY ENGINEERING</p>
        </div>
      </section>
    </div>
  );
}
