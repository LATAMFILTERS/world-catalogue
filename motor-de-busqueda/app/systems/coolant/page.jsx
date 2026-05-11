'use client';
import Link from 'next/link';

import { WP } from '../../constants';

export default function CoolantSystems() {
  const css = `
    .ct{background:#000;color:#fff;min-height:100vh;}
    .ct-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ct-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ct-hero{min-height:75vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2026/02/Gemini_Generated_Image_rlc2zgrlc2zgrlc2-scaled.jpg') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ct-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ct-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ct-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ct-h1 span{color:#FFF12D;}
    .ct-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ct-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ct-sec-inner{max-width:1400px;margin:0 auto;}
    .ct-grid2{display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
    .ct-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,4vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ct-h2 span{color:#FFF12D;}
    .ct-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ct-video-wrap{position:relative;}
    .ct-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .ct-video-wrap:hover:before{opacity:0.5;}
    .ct-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .ct-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .ct-video-wrap:hover .ct-video-inner video{filter:grayscale(0);opacity:1;}
    .ct-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .ct-btn:hover{background:#fff;}
    .ct-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ct-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .ct-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .ct-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ct-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .ct-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ct-cta{background:#FFF12D;padding:72px 6%;}
    .ct-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .ct-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .ct-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .ct-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .ct-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .ct-cta-btn:hover{background:#111;}
    .ct-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.ct-grid2{grid-template-columns:1fr;}.ct-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.ct-grid3{grid-template-columns:1fr;}.ct-hero-p{font-size:12px;}.ct-cta-inner{flex-direction:column;}}
  `;

  return (
    <div className="ct">
      <style>{css}</style>
      <a href="/" className="ct-back">&larr; HOME</a>

      <section className="ct-hero">
        <div className="ct-hero-inner">
          <div className="ct-eyebrow">// THERMAL SYSTEM PROTECTION</div>
          <h1 className="ct-h1">COOLANT SYSTEMS<br /><span>THERMAL STABILITY.</span></h1>
          <p className="ct-hero-p">Engine coolant filtration and thermal system protection engineered for continuous-duty industrial and commercial vehicles — preventing scale accumulation, silicate gel formation, and corrosion that compromise cooling efficiency and engine reliability. ISO 16889 certified coolant filtration protecting charge-air coolers, radiators, and thermal circuits.</p>
        </div>
      </section>

      <section className="ct-sec" style={{background:'#050505'}}>
        <div className="ct-sec-inner">
          <div className="ct-grid2">
            <div>
              <div className="ct-eyebrow">// COOLANT SYSTEM ENGINEERING</div>
              <h2 className="ct-h2">THERMAL PROTECTION<br /><span>ENGINEERED</span></h2>
              <p className="ct-p">Engine coolant systems subject to continuous full-load operation accumulate particulate contamination and silicate degradation products that cause scale deposition and corrosion inside radiator cores and charge-air cooler circuits. Silicate gel formation reduces heat transfer efficiency and causes overtemperature conditions that damage wet-sleeve cylinder liners and head gaskets.</p>
              <p className="ct-p">COOLTECH supplemental coolant filtration removes particulates and silicate degradation products, preventing thermal system failure on heavy-duty engines operating at sustained load on mountain grades and in high-ambient industrial environments.</p>
              <Link href="/technologies" className="ct-btn">VIEW THERMAL TECHNOLOGIES</Link>
            </div>
            <div className="ct-video-wrap">
              <div className="ct-video-inner">
                <video src={`${WP}/2025/08/thermovision-2024-10-01-at-11.33.39-PM-ezgif.com-video-to-gif-converter.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-sec" style={{background:'#000'}}>
        <div className="ct-sec-inner">
          <div style={{textAlign:'center',marginBottom:'52px'}}>
            <div className="ct-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>// THERMAL CIRCUIT PROTECTION</div>
            <h2 className="ct-h2" style={{textAlign:'center'}}>SYSTEM-BY-SYSTEM <span>PROTECTION</span></h2>
          </div>
          <div className="ct-grid3">
            {[
              {label:'Coolant Filtration', title:'COOLTECH', desc:'Supplemental coolant filtration removing particulates and silicate degradation products from engine cooling circuits — preventing radiator core blockage and charge-air cooler pitting that cause thermal system overtemperature and catastrophic engine failure under sustained full-load duty.'},
            ].map((c, i) => (
              <div key={i} className="ct-card">
                <div className="ct-card-label">{c.label}</div>
                <div className="ct-card-title">{c.title}</div>
                <p className="ct-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ct-cta">
        <div className="ct-cta-inner">
          <div>
            <div className="ct-cta-label">// COOLANT SYSTEMS CROSS REFERENCE</div>
            <div className="ct-cta-h2">THERMAL STABILITY PROTECTS ENGINES.<br />FIND YOUR FILTER.</div>
            <p className="ct-cta-p">Access our global database. Search by OEM or part number to find precision coolant filtration for your fleet. Certified to ISO 16889 standards.</p>
          </div>
          <Link href="/search" className="ct-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="ct-cta-footer">COOLANT SYSTEMS PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}