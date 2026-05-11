'use client';
import Link from 'next/link';
import { WP } from '../../constants';

export default function MarineIndustry() {
  const css = `
    .mi{background:#000;color:#fff;min-height:100vh;}
    .mi-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .mi-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .mi-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/marine.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .mi-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .mi-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .mi-h1 span{color:#FFF12D;}
    .mi-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .mi-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-sec-inner{max-width:1400px;margin:0 auto;}
    .mi-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mi-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .mi-sh2 span{color:#FFF12D;}
    .mi-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mi-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .mi-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .mi-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .mi-video-wrap{position:relative;}
    .mi-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .mi-video-wrap:hover:before{opacity:0.5;}
    .mi-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .mi-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .mi-video-wrap:hover .mi-video-inner video{filter:grayscale(0);opacity:1;}
    .mi-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .mi-btn:hover{background:#fff;}
    .mi-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .mi-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .mi-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .mi-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .mi-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .mi-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .mi-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .mi-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .mi-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .mi-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .mi-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .mi-cta{background:#FFF12D;padding:72px 6%;}
    .mi-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .mi-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .mi-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .mi-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .mi-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .mi-cta-btn:hover{background:#111;}
    .mi-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.mi-grid2{grid-template-columns:1fr;} .mi-grid3{grid-template-columns:repeat(2,1fr);} .mi-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.mi-grid3{grid-template-columns:1fr;} .mi-hero-p{font-size:12px;} .mi-cta-inner{flex-direction:column;} .mi-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="mi">
      <style>{css}</style>
      <a href="/" className="mi-back">&larr; HOME</a>
      <section className="mi-hero">
        <div className="mi-hero-inner">
          <div className="mi-eyebrow">// STRATEGIC MARINE PROTECTION</div>
          <h1 className="mi-h1">MARINE<br /><span>VESSEL CONTINUITY</span></h1>
          <p className="mi-hero-p">Precision filtration engineered for container ships, bulk carriers, offshore supply vessels, ferries, tugboats, and superyachts. Marine diesel engines operate continuously for weeks without the option of roadside assistance. Our technology protects main engines, auxiliary generators, hydraulic deck machinery, and seawater cooling circuits, keeping vessels on schedule and seaworthy across all ocean conditions worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>
      <section className="mi-sec" style={{background:'#050505'}}>
        <div className="mi-sec-inner">
          <div className="mi-grid2">
            <div>
              <div className="mi-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="mi-sh2">MARITIME RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="mi-p">Bunker fuel quality is among the most variable in any industry. Our marine filtration range covers MAN, Wärtsilä, Caterpillar Marine, and Cummins engine platforms.</p>
              <div className="mi-tech-grid">
                <div><div className="mi-tech-label">FUEL SYSTEMS</div><div className="mi-tech-val">AQUAGUARD™</div></div>
                <div><div className="mi-tech-label">LUBRICATION</div><div className="mi-tech-val">SINTRAX™</div></div>
                <div><div className="mi-tech-label">SEAWATER COOLING</div><div className="mi-tech-val">COOLTECH™</div></div>
                <div><div className="mi-tech-label">HYDRAULICS</div><div className="mi-tech-val">NANOFORCE™</div></div>
              </div>
              <Link href="/technologies" className="mi-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="mi-video-wrap">
              <div className="mi-video-inner">
                <video src={`${WP}/boat.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mi-cta">
        <div className="mi-cta-inner">
          <div>
            <div className="mi-cta-label">// MARINE CROSS REFERENCE</div>
            <div className="mi-cta-h2">VESSEL RELIABILITY IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="mi-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your vessel.</p>
          </div>
          <Link href="/search" className="mi-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="mi-cta-footer">MARINE PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
