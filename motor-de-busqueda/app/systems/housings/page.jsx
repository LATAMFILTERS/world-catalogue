'use client';
import Link from 'next/link';

const WP = 'https://media.elimfilters.com/wp-content/uploads';

export default function HousingSystems() {
  const css = `
    .ho{background:#000;color:#fff;min-height:100vh;}
    .ho-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ho-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ho-hero{min-height:72vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2025/08/construction.jpg') right center/contain no-repeat;background-color:#000;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ho-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ho-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ho-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,6vw,80px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ho-h1 span{color:#FFF12D;}
    .ho-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ho-sec{padding:70px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ho-sec-inner{max-width:1400px;margin:0 auto;}
    .ho-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .ho-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ho-h2 span{color:#FFF12D;}
    .ho-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .ho-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px;}
    .ho-spec{border-left:1px solid #27272a;padding-left:16px;}
    .ho-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .ho-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;}
    .ho-img-wrap{background:#000;border:1px solid #1a1a1a;padding:8px;}
    .ho-img-wrap img{width:100%;height:auto;display:block;filter:grayscale(0.3) contrast(1.1) brightness(0.9);}
    .ho-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:13px;letter-spacing:0.15em;padding:18px 40px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.25s;}
    .ho-btn:hover{background:#fff;transform:translateY(-3px);}
    .ho-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ho-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:36px 28px;transition:all 0.3s;height:100%;}
    .ho-feature:hover{transform:translateY(-5px);background:rgba(255,255,255,0.05);}
    .ho-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ho-feature-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ho-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.03em;}
    .ho-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ho-protocol-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .ho-protocol-num{position:absolute;right:-10px;top:-10px;font-family:'Russo One',sans-serif;font-size:80px;color:rgba(255,241,45,0.03);line-height:1;}
    .ho-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ho-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ho-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .ho-cta{padding:100px 6%;background:#030303;text-align:center;}
    .ho-cta-inner{max-width:900px;margin:0 auto;}
    .ho-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,7vw,90px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .ho-cta-h2 span{color:#FFF12D;}
    @media(max-width:1024px){.ho-grid2{grid-template-columns:1fr;} .ho-grid3{grid-template-columns:repeat(2,1fr);} .ho-protocol-grid{grid-template-columns:1fr;} .ho-hero{background:linear-gradient(to top,#000 60%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/construction.jpg') top center/cover no-repeat;}}
    @media(max-width:768px){.ho-grid3{grid-template-columns:1fr;} .ho-hero-p{font-size:12px;} .ho-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ho">
      <style>{css}</style>
      <a href="/?skip=1" className="ho-back">&larr; HOME</a>

      <section className="ho-hero">
        <div className="ho-hero-inner">
          <div className="ho-eyebrow">// HOUSING & INTAKE SYSTEMS / SYS-02</div>
          <h1 className="ho-h1">HOUSING &amp;<br /><span>INTAKES</span></h1>
          <p className="ho-hero-p">Industrial asset protection systems engineered for air intake housings, filter enclosures, and critical airflow infrastructure. INTEKCORE™ technology delivers optimized flow geometry and maximum mechanical resilience — eliminating air bypass, protecting engines from abrasive contamination, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="ho-sec" style={{background:'#050505'}}>
        <div className="ho-sec-inner">
          <div className="ho-grid2">
            <div>
              <div className="ho-eyebrow">// INTEKCORE™ TECHNOLOGY</div>
              <h2 className="ho-h2">STRUCTURAL<br /><span>INTEGRITY.</span></h2>
              <p className="ho-p">Bypass allows abrasive particles to enter directly into the combustion chamber. Our INTEKCORE™ housings withstand extreme vibration without seal deformation — protecting engines in the most demanding mining, construction, and industrial environments worldwide.</p>
              <p className="ho-p">Engineered for heavy-duty air intake systems requiring zero-bypass performance under continuous high-load conditions — from underground mining to open-pit excavation operations globally.</p>
              <div className="ho-specs">
                <div className="ho-spec"><span className="ho-spec-label">RADIAL SEAL</span><span className="ho-spec-sub">Zero-Bypass</span></div>
                <div className="ho-spec"><span className="ho-spec-label">HI-FLOW</span><span className="ho-spec-sub">Unrestricted Geometry</span></div>
                <div className="ho-spec"><span className="ho-spec-label">VIBRATION RATED</span><span className="ho-spec-sub">Mining & Construction</span></div>
                <div className="ho-spec"><span className="ho-spec-label">OEM MATCHED</span><span className="ho-spec-sub">5,000+ Cross-Refs</span></div>
              </div>
              <Link href="/technologies/intekcore" className="ho-btn">EXPLORE INTEKCORE™ TECHNOLOGY</Link>
            </div>
            <div className="ho-img-wrap">
              <img src={`${WP}/2025/08/ChatGPT-Image-22-ago-2025-09_32_51-p.m.webp`} alt="ELIMFILTERS INTEKCORE Industrial Housing System" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="ho-sec">
        <div className="ho-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ho-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// INTEKCORE™ TECHNOLOGY DNA</div>
            <h2 className="ho-h2" style={{textAlign:'center'}}>TOTAL INTAKE <span>DEFENSE</span></h2>
          </div>
          <div className="ho-grid3">
            {[
              {label:'INTEKCORE™ / SEAL', title:'RADIAL SEAL TECH', desc:'Precision radial seal geometry eliminates bypass pathways — ensuring 100% of intake air passes through the filtration media under all vibration and thermal conditions.'},
              {label:'INTEKCORE™ / FLOW', title:'HI-FLOW GEOMETRY', desc:'Optimized internal airflow geometry maximizes volume throughput without pressure drops — maintaining engine power under continuous high-load operating conditions.'},
              {label:'INTEKCORE™ / STRUCTURE', title:'VIBRATION RESISTANCE', desc:'Reinforced housing structure withstands extreme vibration fatigue and thermal cycling in mining, construction, and heavy industrial environments worldwide.'},
              {label:'INTEKCORE™ / OEM', title:'PRECISION FIT', desc:'Exact tolerances engineered for direct installation on major global platforms — eliminating fitment issues and ensuring immediate operational confidence.'},
              {label:'INTEKCORE™ / MATERIAL', title:'HD MATERIALS', desc:'Industrial-grade materials selected for resistance to UV, chemical exposure, and extreme temperature cycles in the most demanding field conditions.'},
              {label:'INTEKCORE™ / SERVICE', title:'EXTENDED LIFE', desc:'Robust construction extends housing service life beyond conventional air intake systems — reducing replacement frequency and total maintenance costs.'},
            ].map((f, i) => (
              <div key={i} className="ho-feature">
                <div className="ho-feature-label">{f.label}</div>
                <div className="ho-feature-title">{f.title}</div>
                <p className="ho-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ho-sec" style={{background:'#000'}}>
        <div className="ho-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="ho-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="ho-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="ho-protocol-grid">
            {[
              {num:'01', title:'HI-FLOW GEOMETRY', desc:'Maximum airflow volume without pressure drops under continuous load — maintaining full engine power output in mining, construction, and heavy industrial operations.'},
              {num:'02', title:'MECHANICAL RESILIENCE', desc:'Withstands vibration fatigue and extreme thermal cycles in mining and construction — maintaining housing integrity and seal performance throughout service life.'},
              {num:'03', title:'PRECISION OEM FIT', desc:'Exact tolerances engineered for direct installation on major global platforms — ensuring zero-compromise air intake protection across 5,000+ cross-references.'},
            ].map((p, i) => (
              <div key={i} className="ho-protocol-card">
                <div className="ho-protocol-num">{p.num}</div>
                <div className="ho-protocol-title">{p.title}</div>
                <p className="ho-protocol-p">{p.desc}</p>
                <div className="ho-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ho-cta">
        <div className="ho-cta-inner">
          <div className="ho-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// FLOW CONTINUITY</div>
          <div className="ho-cta-h2">EVERY ENGINE.<br /><span>EVERY BREATH.</span></div>
          <Link href="/search" className="ho-btn" style={{display:'inline-block'}}>FIND MY HOUSING &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
