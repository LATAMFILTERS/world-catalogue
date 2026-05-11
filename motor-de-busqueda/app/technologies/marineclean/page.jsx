'use client';
import Link from 'next/link';

import { WP } from '../../constants';

export default function Marineclean() {
  const css = `
    .mc{background:#000;color:#fff;min-height:100vh;}
    .mc-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mc-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mc-hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#000;padding:120px 6% 80px;}
    .mc-hero-bg{position:absolute;top:0;right:0;width:100%;height:100%;background:url('${WP}/2026/02/pexels-asadphoto-29318858-scaled.jpg') center/cover no-repeat;mask-image:linear-gradient(to right,transparent 0%,black 85%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 85%);z-index:1;}
    .mc-hero-ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,#000 35%,rgba(0,0,0,0.5) 70%,transparent 100%);z-index:2;}
    .mc-hero-c{position:relative;z-index:3;max-width:1400px;margin:0 auto;width:100%;}
    .mc-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mc-h1{font-family:'Russo One',sans-serif;font-size:clamp(50px,10vw,110px);text-transform:uppercase;line-height:0.9;color:#fff;margin:0;}
    .mc-h1 span{color:#FFF12D;}
    .mc-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mc-hero-stat{margin-top:32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;}
    .mc-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.4);text-transform:uppercase;display:block;margin-bottom:4px;}
    .mc-stat-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:0.1em;}
    .mc-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:22px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border:2px solid #FFF12D;}
    .mc-btn:hover{background:transparent;color:#FFF12D;}
    .mc-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.06);}
    .mc-sec-inner{max-width:1400px;margin:0 auto;}
    .mc-grid2{display:grid;grid-template-columns:1.1fr 1.1fr;gap:60px;align-items:center;}
    .mc-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4.5vw,58px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mc-h2 span{color:#FFF12D;}
    .mc-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:20px;}
    .mc-specs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;}
    .mc-spec{border-top:1px solid #27272a;padding-top:12px;}
    .mc-spec-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;display:block;margin-bottom:4px;}
    .mc-spec-sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;letter-spacing:0.1em;}
    .mc-img-wrap{background:radial-gradient(circle at center,#111 0%,#000 100%);border:1px solid #1a1a1a;padding:15px;text-align:center;}
    .mc-img-wrap img{width:100%;max-width:450px;height:auto;display:inline-block;filter:brightness(1.1) contrast(1.1);}
    .mc-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .mc-card{background:linear-gradient(145deg,#080808,#000);border:1px solid rgba(255,255,255,0.08);padding:40px 32px;transition:all 0.4s;}
    .mc-card:hover{border-color:#FFF12D;transform:translateY(-5px);}
    .mc-card-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mc-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mc-protocol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mc-protocol-card{background:rgba(255,255,255,0.01);border:1px solid rgba(255,255,255,0.05);padding:40px 30px;position:relative;overflow:hidden;}
    .mc-protocol-num{position:absolute;right:-5px;top:-5px;font-family:'Russo One',sans-serif;font-size:70px;color:rgba(255,241,45,0.03);}
    .mc-protocol-title{font-family:'Russo One',sans-serif;font-size:18px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .mc-protocol-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mc-protocol-line{margin-top:24px;height:2px;width:40px;background:#FFF12D;}
    .mc-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;}
    .mc-cta-inner{max-width:900px;margin:0 auto;}
    .mc-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .mc-cta-h2 span{color:#FFF12D;}
    .mc-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .mc-cta-footer{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-top:48px;}
    @media(max-width:1024px){.mc-hero-bg{opacity:0.6;mask-image:none;-webkit-mask-image:none;} .mc-grid2{grid-template-columns:1fr;} .mc-grid3{grid-template-columns:repeat(2,1fr);} .mc-protocol-grid{grid-template-columns:1fr;}}
    @media(max-width:768px){.mc-grid3{grid-template-columns:1fr;} .mc-hero-p{font-size:12px;} .mc-specs{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mc">
      <style>{css}</style>
      <a href="/?skip=1" className="mc-back">&larr; HOME</a>
      <section className="mc-hero">
        <div className="mc-hero-bg" />
        <div className="mc-hero-ov" />
        <div className="mc-hero-c">
          <div className="mc-eyebrow">// NAVAL SYSTEMS / MOD-09</div>
          <h1 className="mc-h1">MARINECLEAN™<br /><span>NAVAL PROTECTION</span></h1>
          <p className="mc-hero-p">Industrial asset protection systems engineered for offshore vessels, marine diesel engines, and critical naval fuel infrastructure. MARINECLEAN™ anti-corrosion technology shields fuel systems and lubrication circuits from salt spray, galvanic corrosion, and water contamination — ensuring maximum operational continuity in offshore and coastal environments. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
          <div className="mc-hero-stat">
            <Link href="/search" className="mc-btn">IDENTIFY SKU</Link>
            <div>
              <span className="mc-stat-label">NAVAL GRADE</span>
              <span className="mc-stat-val">TOTAL MARINE PROTECTION</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mc-sec" style={{background:'#050505'}}>
        <div className="mc-sec-inner">
          <div className="mc-grid2">
            <div>
              <div className="mc-eyebrow">// ANTI-CORROSION ENGINEERING</div>
              <h2 className="mc-h2">SALT SPRAY<br /><span>RESISTANCE</span></h2>
              <p className="mc-p">MARINECLEAN™ systems are engineered with naval-grade alloy housings and hydrophobic coalescence media to neutralize galvanic corrosion and water contamination in high-salinity marine environments — protecting critical engine components in offshore and coastal operations worldwide.</p>
              <p className="mc-p">Engineered for commercial vessels, offshore platforms, fishing fleets, and naval applications requiring absolute fuel and lubrication protection under continuous marine operating conditions.</p>
              <div className="mc-specs">
                <div className="mc-spec"><span className="mc-spec-label">PURIFICATION</span><span className="mc-spec-sub">99.9% Water/Sediment</span></div>
                <div className="mc-spec"><span className="mc-spec-label">PROTECTION</span><span className="mc-spec-sub">Naval Grade Alloy</span></div>
                <div className="mc-spec"><span className="mc-spec-label">CORROSION SHIELD</span><span className="mc-spec-sub">Galvanic Protection</span></div>
                <div className="mc-spec"><span className="mc-spec-label">OEM MATCHED</span><span className="mc-spec-sub">5,000+ Cross-References</span></div>
              </div>
            </div>
            <div className="mc-img-wrap">
              <img src={`${WP}/2026/04/Gemini_Generated_Image_wg6rfqwg6rfqwg6r.png`} alt="MARINECLEAN Naval Filter" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="mc-sec">
        <div className="mc-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mc-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// MARINE TECHNOLOGY DNA</div>
            <h2 className="mc-h2" style={{textAlign:'center'}}>NAVAL <span>ENGINEERING</span></h2>
          </div>
          <div className="mc-grid3">
            {[
              {title:'HYDROPHOBIC SEPARATION', desc:'Eliminates water carryover that causes catastrophic injector failure in marine diesel engines operating in high-humidity offshore environments worldwide.'},
              {title:'SALT CORROSION DEFENSE', desc:'Naval-grade alloy housing construction resists galvanic corrosion from salt spray and marine atmosphere — extending filter service life in the harshest offshore conditions.'},
              {title:'COALESCENCE MEDIA', desc:'Advanced coalescence media captures micro-water droplets and fine sediment — ensuring pure fuel delivery to marine injection systems in all sea conditions.'},
              {title:'VIBRATION RESISTANCE', desc:'Maintains filtration efficiency under constant hull vibrations and marine shock loads — protecting marine engines in all sea states and vessel operating speeds.'},
              {title:'EXTENDED INTERVALS', desc:'High-capacity marine-grade media extends service intervals — reducing maintenance frequency and total cost of ownership across offshore and coastal fleet operations.'},
              {title:'OEM COMPATIBILITY', desc:'Precision-matched to OEM marine engine specifications across 5,000+ cross-references — compatible with all major commercial and naval marine engine platforms.'},
            ].map((c, i) => (
              <div key={i} className="mc-card">
                <div className="mc-card-title">{c.title}</div>
                <p className="mc-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-sec" style={{background:'#000'}}>
        <div className="mc-sec-inner">
          <div style={{marginBottom:'52px',borderLeft:'4px solid #FFF12D',paddingLeft:'20px'}}>
            <div className="mc-eyebrow">// SYSTEM VALIDATION</div>
            <h2 className="mc-h2" style={{marginTop:'8px'}}>PERFORMANCE PROTOCOL</h2>
          </div>
          <div className="mc-protocol-grid">
            {[
              {num:'01', title:'WATER ELIMINATION', desc:'99.9% water and sediment separation regardless of sea conditions or fuel quality — protecting marine injection systems from contamination-driven failure worldwide.'},
              {num:'02', title:'CORROSION CONTROL', desc:'Naval-grade alloy housing and hydrophobic media neutralize galvanic corrosion and salt spray — maintaining filter integrity in continuous offshore operations.'},
              {num:'03', title:'MARINE RELIABILITY', desc:'Designed for continuous-duty marine operations where failure is not an option — ensuring every vessel, every voyage, in every sea condition worldwide.'},
            ].map((p, i) => (
              <div key={i} className="mc-protocol-card">
                <div className="mc-protocol-num">{p.num}</div>
                <div className="mc-protocol-title">{p.title}</div>
                <p className="mc-protocol-p">{p.desc}</p>
                <div className="mc-protocol-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-cta">
        <div className="mc-cta-inner">
          <div className="mc-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL NAVAL ENGINEERING</div>
          <div className="mc-cta-h2">EVERY VESSEL<br /><span>USE MARINECLEAN™</span></div>
          <p className="mc-cta-p">Do not allow marine corrosion to compromise your vessel's propulsion systems. Upgrade to MARINECLEAN™ naval-grade protection today. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
          <Link href="/search" className="mc-btn">FIND MY SKU &rarr;</Link>
          <p className="mc-cta-footer">// GLOBAL NAVAL ENGINEERING BY ELIMFILTERS</p>
        </div>
      </section>
    </div>
  );
}
