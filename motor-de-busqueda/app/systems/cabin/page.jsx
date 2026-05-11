'use client';
import Link from 'next/link';

import { WP } from '../../constants';

export default function CabinSystems() {
  const css = `
    .cb{background:#000;color:#fff;min-height:100vh;}
    .cb-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .cb-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .cb-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/Gemini_Generated_Image_w9i6zgw9i6zgw9i6-e1772079558684.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cb-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .cb-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .cb-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .cb-h1 span{color:#FFF12D;}
    .cb-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .cb-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .cb-sec-inner{max-width:1400px;margin:0 auto;}
    .cb-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .cb-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .cb-h2 span{color:#FFF12D;}
    .cb-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .cb-video-wrap{position:relative;}
    .cb-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .cb-video-wrap:hover:before{opacity:0.5;}
    .cb-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .cb-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .cb-video-wrap:hover .cb-video-inner video{filter:grayscale(0);opacity:1;}
    .cb-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .cb-btn:hover{background:#fff;}
    .cb-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .cb-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .cb-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .cb-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .cb-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .cb-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .cb-cta{background:#FFF12D;padding:72px 6%;}
    .cb-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .cb-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .cb-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .cb-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .cb-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .cb-cta-btn:hover{background:#111;}
    .cb-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.cb-grid2{grid-template-columns:1fr;} .cb-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.cb-grid3{grid-template-columns:1fr;} .cb-hero-p{font-size:12px;} .cb-cta-inner{flex-direction:column;}}
  `;

  return (
    <div className="cb">
      <style>{css}</style>
      <a href="/" className="cb-back">&larr; HOME</a>

      <section className="cb-hero">
        <div className="cb-hero-inner">
          <div className="cb-eyebrow">// CABIN SYSTEMS PROTECTION</div>
          <h1 className="cb-h1">CABIN AIR & CLIMATE<br /><span>OPERATIONAL QUALITY.</span></h1>
          <p className="cb-hero-p">Cabin air filtration and climate control protection engineered for commercial vehicles, buses, and fleet operations — maintaining operator comfort and equipment reliability across continuous duty cycles. ISO 16889 certified filtration protecting occupant air quality and vehicle environmental systems.</p>
        </div>
      </section>

      <section className="cb-sec" style={{background:'#050505'}}>
        <div className="cb-sec-inner">
          <div className="cb-grid2">
            <div>
              <div className="cb-eyebrow">// CLIMATE SYSTEM ENGINEERING</div>
              <h2 className="cb-h2">CABIN PROTECTION<br /><span>INTEGRATED</span></h2>
              <p className="cb-p">Cabin air quality and vehicle climate systems operate under continuous stress in commercial fleet environments. Contaminated cabin air impacts operator health and equipment efficiency. Cabin filters protect air intake, HVAC systems, and recirculation paths from road dust, pollen, and particulate loading — maintaining clean air and optimal climate control performance across all duty cycles.</p>
              <p className="cb-p">MICROKAPPA cabin filtration technology maintains occupant comfort and protects critical climate control electronics from contamination-induced failure.</p>
              <Link href="/technologies" className="cb-btn">VIEW CABIN TECHNOLOGIES</Link>
            </div>
            <div className="cb-video-wrap">
              <div className="cb-video-inner">
                <video src={`${WP}/2025/08/Limpiad-orio-de-la-gota-2024-10-01-at-11.41.24-PM-ezgif.com-video-to-gif-converter.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cb-sec" style={{background:'#000'}}>
        <div className="cb-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="cb-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// CABIN CLIMATE PROTECTION</div>
            <h2 className="cb-h2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="cb-grid3">
            {[
              {label:'Cabin Air', title:'MICROKAPPA', desc:'Advanced multi-layer HEPA and activated carbon filtration protecting cabin air intake and climate recirculation systems from particulate contamination and odor sources.'},
            ].map((c, i) => (
              <div key={i} className="cb-card">
                <div className="cb-card-label">{c.label}</div>
                <div className="cb-card-title">{c.title}</div>
                <p className="cb-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cb-cta">
        <div className="cb-cta-inner">
          <div>
            <div className="cb-cta-label">// CABIN SYSTEMS CROSS REFERENCE</div>
            <div className="cb-cta-h2">CABIN QUALITY IS OCCUPANT HEALTH.<br />FIND YOUR FILTER.</div>
            <p className="cb-cta-p">Access our global database. Search by OEM or part number to find precision cabin filtration for your fleet. Certified to ISO 16889 standards.</p>
          </div>
          <Link href="/search" className="cb-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="cb-cta-footer">CABIN SYSTEMS PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
