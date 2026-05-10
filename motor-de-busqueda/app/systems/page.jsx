'use client';
import Link from 'next/link';

const WP = '/uploads';

const systems = [
  { name: 'Air Systems', desc: 'Advanced defense against abrasive particles and premature wear in extreme environments.', img: WP + '/2025/08/Imagen1.png', href: '/systems/air' },
  { name: 'Housings & Enclosures', desc: 'High-resistance housings designed for maximum sealing stability during thermal cycles.', img: WP + '/2025/08/ChatGPT-Image-22-ago-2025-09_32_51-p.m.webp', href: '/systems/housings' },
  { name: 'Fuel Systems', desc: 'Precision protection for injectors and pumps against water and sediment contamination.', img: WP + '/2025/08/Screenshot-2025-08-20-203844.webp', href: '/systems/fuel' },
  { name: 'Oil Systems', desc: 'Superior control of wear particles and chemical degradation of the lubricant.', img: WP + '/2025/08/Screenshot-2025-08-20-204026.webp', href: '/systems/oil' },
  { name: 'Hydraulic Systems', desc: 'High-pressure mesh protection engineered to withstand mechanical pulsations.', img: WP + '/2025/08/ChatGPT-Image-20-ago-2025-10_40_35-p.m.webp', href: '/systems/hydraulic' },
  { name: 'Cabin Systems', desc: 'Elite air quality control capturing toxic gases for maximum operator safety.', img: WP + '/2025/08/Screenshot-2025-08-20-203624.webp', href: '/systems/cabin' },
  { name: 'H-Series Turbines', desc: 'High-efficiency turbine filtration for maximum flow under high RPM conditions.', img: WP + '/2025/08/ChatGPT-Image-23-ago-2025-10_26_13-a.m.webp', href: '/systems/turbine' },
  { name: 'Coolant Systems', desc: 'Corrosion and deposit control to ensure engine thermal stability.', img: WP + '/2026/04/IMG_0221.png', href: '/systems/coolant' },
  { name: 'Air Dryers', desc: 'Critical removal of moisture and oil in pneumatic systems for safe braking.', img: WP + '/2026/02/Gemini_Generated_Image_mvib88mvib88mvib.png', href: '/systems/air-dryers' },
  { name: 'Gas Filters', desc: 'Specialized filtration for gas engines and industrial compressed air systems.', img: WP + '/2026/02/Gemini_Generated_Image_bak2csbak2csbak2.png', href: '/systems/gas' },
  { name: 'Marine Systems', desc: 'Protection against salinity and high humidity for outboard engines and marine vessels.', img: WP + '/2026/04/Gemini_Generated_Image_h8h7qkh8h7qkh8h7.png', href: '/systems/marine' },
  { name: 'Filter Kits', desc: 'Comprehensive maintenance solutions for fleets and heavy logistics equipment.', img: WP + '/2026/04/Gemini_Generated_Image_2qivu62qi.png', href: '/systems/kits' },
];

export default function Systems() {
  const css = `
    .sy{background:#000;color:#fff;min-height:100vh;}
    .sy-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .sy-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .sy-hero{position:relative;min-height:65vh;overflow:hidden;background:#000;display:flex;align-items:flex-end;padding:120px 5% 60px;}
    .sy-hero-bg{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,1) 100%),url('${WP}/2025/08/ChatGPT-Image-31-jul-2025-11_12_47-a.m.png') center 30%/cover no-repeat;filter:contrast(1.05) brightness(0.75);}
    .sy-hero-c{position:relative;z-index:10;max-width:1400px;margin:0 auto;width:100%;}
    .sy-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;display:flex;align-items:center;gap:16px;}
    .sy-eyebrow:before{content:'';display:block;width:40px;height:1px;background:#FFF12D;}
    .sy-h1{font-family:'Russo One',sans-serif;font-size:clamp(42px,8vw,110px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .sy-h1 span{color:#FFF12D;}
    .sy-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:520px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .sy-grid-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .sy-grid-inner{max-width:1400px;margin:0 auto;}
    .sy-sec-head{text-align:center;margin-bottom:64px;}
    .sy-sec-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:16px;}
    .sy-sec-eyebrow:before,.sy-sec-eyebrow:after{content:'';display:block;width:40px;height:1px;background:#FFF12D;}
    .sy-sec-h2{font-family:'Russo One',sans-serif;font-size:clamp(36px,6vw,80px);text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .sy-sec-h2 span{color:#FFF12D;}
    .sy-sec-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:#666;letter-spacing:0.05em;}
    .sy-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
    .sy-card{background:#0d0d0d;border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;text-decoration:none;overflow:hidden;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);}
    .sy-card:hover{border-color:#FFF12D;transform:translateY(-6px);background:#111;}
    .sy-card-img{width:100%;height:280px;overflow:hidden;background:#050505;display:flex;align-items:center;justify-content:center;}
    .sy-card-img img{width:100%;height:100%;object-fit:contain;padding:16px;filter:brightness(0.85) contrast(1.05);transition:transform 0.8s ease,filter 0.5s ease;}
    .sy-card:hover .sy-card-img img{transform:scale(1.05);filter:brightness(1.1);}
    .sy-card-body{padding:28px;}
    .sy-card-title{font-family:'Russo One',sans-serif;font-size:18px;color:#FFF12D;text-transform:uppercase;margin-bottom:10px;line-height:1;}
    .sy-card-desc{font-family:'JetBrains Mono',monospace;font-size:12px;color:#666;line-height:1.6;letter-spacing:0.03em;}
    .sy-cta{padding:100px 6%;background:#000;text-align:center;border-top:1px solid #111;position:relative;overflow:hidden;}
    .sy-cta-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:900px;height:900px;background:rgba(255,241,45,0.04);border-radius:50%;filter:blur(150px);pointer-events:none;}
    .sy-cta-inner{position:relative;z-index:2;max-width:900px;margin:0 auto;}
    .sy-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(48px,9vw,120px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .sy-cta-h2 span{color:#FFF12D;}
    .sy-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:#666;line-height:1.7;max-width:600px;margin:0 auto 48px;letter-spacing:0.05em;}
    .sy-cta-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:16px;padding:22px 52px;text-decoration:none;text-transform:uppercase;letter-spacing:0.15em;display:inline-block;transition:all 0.3s;}
    .sy-cta-btn:hover{background:#fff;transform:translateY(-2px);}
    @media(max-width:1024px){.sy-grid{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.sy-grid{grid-template-columns:1fr;} .sy-hero{align-items:center;} .sy-card-img{height:240px;}}
  `;

  return (
    <div className="sy">
      <style>{css}</style>
      <a href="/?skip=1" className="sy-back">← HOME</a>
      <section className="sy-hero">
        <div className="sy-hero-bg" />
        <div className="sy-hero-c">
          <div className="sy-eyebrow">// ENGINEERING HUB / SYS-01</div>
          <h1 className="sy-h1">FILTRATION<br /><span>SYSTEMS</span></h1>
          <p className="sy-hero-p">We design integrated protection systems for the rigorous demands of global industrial operations.</p>
        </div>
      </section>
      <section className="sy-grid-sec">
        <div className="sy-grid-inner">
          <div className="sy-sec-head">
            <div className="sy-sec-eyebrow">// FILTRATION SOLUTIONS</div>
            <div className="sy-sec-h2">EVERY SYSTEM.<br /><span>EVERY APPLICATION.</span></div>
            <p className="sy-sec-p">Precision engineering for specialized systems. One standard: Total protection.</p>
          </div>
          <div className="sy-grid">
            {systems.map((s, i) => (
              <Link key={i} href={s.href} className="sy-card">
                <div className="sy-card-img"><img src={s.img} alt={s.name} loading="lazy" /></div>
                <div className="sy-card-body">
                  <div className="sy-card-title">{s.name}</div>
                  <div className="sy-card-desc">{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="sy-cta">
        <div className="sy-cta-glow" />
        <div className="sy-cta-inner">
          <div className="sy-eyebrow" style={{justifyContent:'center',marginBottom:'24px'}}>// ELIMTEK™ PRECISION STANDARD</div>
          <div className="sy-cta-h2">ELIMINATE<br /><span>THE RISK.</span></div>
          <p className="sy-cta-p">Join operations that refuse to compromise engine life for a cheap part.</p>
          <Link href="/search" className="sy-cta-btn">START PRECISION SEARCH →</Link>
        </div>
      </section>
    </div>
  );
}
