'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function MarineIndustry() {
  const css = `
    .mi{background:#000;color:#fff;min-height:100vh;}
    .mi-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mi-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mi-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,rgba(0,0,0,0.9) 35%,rgba(0,0,0,0.2) 100%),url('${WP}/2025/08/raphael-biscaldi-wT-fHwcHoIo-unsplash-scaled.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mi-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mi-h1{font-family:'Russo One',sans-serif;font-size:clamp(35px,5vw,75px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mi-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4.5vw,60px);text-transform:uppercase;line-height:0.95;color:#FFF12D;margin:8px 0 0;}
    .mi-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:580px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mi-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-sec-inner{max-width:1400px;margin:0 auto;}
    .mi-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mi-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mi-sh2 span{color:#FFF12D;}
    .mi-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mi-p-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;margin-bottom:24px;}
    .mi-video-wrap{background:#000;border:1px solid rgba(255,255,255,0.1);padding:8px;position:relative;}
    .mi-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .mi-video-wrap:hover video{filter:grayscale(0);opacity:1;}
    .mi-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.15em;padding:20px 40px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.2s;}
    .mi-btn:hover{background:#fff;}
    .mi-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mi-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:32px;transition:all 0.3s;height:100%;}
    .mi-feature:hover{background:rgba(255,255,255,0.05);transform:translateY(-5px);border-color:#fff;}
    .mi-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mi-feature-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .mi-feature-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mi-cta{background:#FFF12D;padding:72px 6%;}
    .mi-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .mi-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .mi-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .mi-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .mi-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .mi-cta-btn:hover{background:#111;}
    .mi-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.mi-grid2{grid-template-columns:1fr;} .mi-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.mi-grid3{grid-template-columns:1fr;} .mi-hero-p{font-size:12px;} .mi-cta-inner{flex-direction:column;} .mi-hero{background-position:75% center;}}
  `;

  return (
    <div className="mi">
      <style>{css}</style>
      <a href="/?skip=1" className="mi-back">&larr; HOME</a>

      <section className="mi-hero">
        <div className="mi-hero-inner">
          <div className="mi-eyebrow">// OFFSHORE • COMMERCIAL • NAVAL</div>
          <h1 className="mi-h1">MARINE OPERATIONS</h1>
          <div className="mi-h2">ZERO-FAILURE RELIABILITY.</div>
          <p className="mi-hero-p">Industrial asset protection systems engineered for offshore vessels, commercial maritime fleets, and critical naval propulsion infrastructure. Our filtration technology shields fuel systems, hydraulic controls, lubrication lines, and air intake systems from salt corrosion, humidity, and contamination — extending asset lifespan and ensuring uninterrupted maritime operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>

      <section className="mi-sec" style={{background:'#050505'}}>
        <div className="mi-sec-inner">
          <div className="mi-grid2">
            <div>
              <div className="mi-eyebrow">// CONTINUOUS NAVIGATION</div>
              <h2 className="mi-sh2">CONTINUOUS SAILING<br /><span>UNDER EXTREME LOADS.</span></h2>
              <p className="mi-p">Marine propulsion systems operate under constant vibration and saline atmospheres. A protection failure means critical downtime in the middle of the ocean — with consequences measured in cargo loss, vessel damage, and crew safety.</p>
              <div className="mi-p-strong">We safeguard propulsion engines, fuel systems, and hydraulic controls across global maritime fleets.</div>
              <Link href="/technologies" className="mi-btn">VIEW TECHNOLOGY</Link>
            </div>
            <div className="mi-video-wrap">
              <video src={`${WP}/2025/08/Untitled-video-13-1.mp4`} autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="mi-sec">
        <div className="mi-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="mi-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// DNA TECHNOLOGY MATRIX</div>
            <h2 className="mi-sh2" style={{textAlign:'center'}}>MARINE DEFENSE <span>ARCHITECTURE</span></h2>
          </div>
          <div className="mi-grid3">
            {[
              {label:'TURBINE SERIES™', title:'FUEL PURITY', desc:'Eliminates free and emulsified water to protect injection systems and thermal efficiency — ensuring pure fuel delivery in offshore and coastal marine operations.'},
              {label:'SINTRAX™', title:'LUBRICATION', desc:'High-capacity soot control for large displacement marine engines during long-haul voyages — maintaining oil cleanliness and protecting critical engine components.'},
              {label:'NANOFORCE™', title:'HYDRAULIC CONTROL', desc:'Precision filtration for cranes, steering systems, and deck equipment exposed to high salinity environments — protecting hydraulic circuits from marine contamination.'},
              {label:'MACROCORE™', title:'AIR INTAKE', desc:'Blocks salt particles and moisture before they reach the combustion chamber — protecting marine diesel engines from intake contamination in all sea conditions.'},
              {label:'COOLANT GUARD', title:'THERMAL CONTROL', desc:'Chemical protection that prevents cavitation erosion in liners and heat exchangers — maintaining thermal stability in continuous-duty marine propulsion systems.'},
              {label:'GEAR SHIELD', title:'TRANSMISSIONS', desc:'Protection for marine gears under extreme torque and continuous load cycles — ensuring reliable power transmission across all vessel types and operating conditions.'},
            ].map((f, i) => (
              <div key={i} className="mi-feature">
                <div className="mi-feature-label">{f.label}</div>
                <div className="mi-feature-title">{f.title}</div>
                <p className="mi-feature-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mi-cta">
        <div className="mi-cta-inner">
          <div>
            <div className="mi-cta-label">// MARITIME CROSS REFERENCE</div>
            <div className="mi-cta-h2">WHERE MOTION NEVER STOPS,<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="mi-cta-p">Access our maritime engineering database. Search by OEM or part number to find the ELIMFILTERS match for your vessel's propulsion and auxiliary systems. Precision-matched across 5,000+ cross-references.</p>
          </div>
          <Link href="/search" className="mi-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="mi-cta-footer">GLOBAL MARITIME PROTECTION STANDARD // ELIMFILTERS OFFSHORE</div>
    </div>
  );
}
