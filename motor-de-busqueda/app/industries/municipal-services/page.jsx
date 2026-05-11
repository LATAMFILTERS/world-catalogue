'use client';
import Link from 'next/link';
import { WP } from '../../constants';

export default function MunicipalServices() {
  const css = `
    .ms{background:#000;color:#fff;min-height:100vh;}
    .ms-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ms-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ms-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('${WP}/wasted.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ms-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ms-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ms-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ms-h1 span{color:#FFF12D;}
    .ms-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ms-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ms-sec-inner{max-width:1400px;margin:0 auto;}
    .ms-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ms-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ms-sh2 span{color:#FFF12D;}
    .ms-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ms-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .ms-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .ms-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .ms-video-wrap{position:relative;}
    .ms-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .ms-video-wrap:hover:before{opacity:0.5;}
    .ms-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .ms-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .ms-video-wrap:hover .ms-video-inner video{filter:grayscale(0);opacity:1;}
    .ms-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .ms-btn:hover{background:#fff;}
    .ms-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ms-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .ms-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .ms-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ms-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .ms-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .ms-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ms-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ms-env{background:rgba(0,0,0,0.5);border:1px solid #1a1a1a;padding:40px;}
    .ms-env-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .ms-env-strong{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;line-height:1.4;}
    .ms-cta{background:#FFF12D;padding:72px 6%;}
    .ms-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .ms-cta-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .ms-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .ms-cta-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(0,0,0,0.7);line-height:1.7;max-width:480px;letter-spacing:0.05em;}
    .ms-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:background 0.2s;white-space:nowrap;}
    .ms-cta-btn:hover{background:#111;}
    .ms-cta-footer{background:#000;padding:12px 6%;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,241,45,0.4);text-transform:uppercase;}
    @media(max-width:1024px){.ms-grid2{grid-template-columns:1fr;} .ms-grid3{grid-template-columns:repeat(2,1fr);} .ms-human-inner{grid-template-columns:1fr;}}
    @media(max-width:768px){.ms-grid3{grid-template-columns:1fr;} .ms-hero-p{font-size:12px;} .ms-cta-inner{flex-direction:column;} .ms-tech-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ms">
      <style>{css}</style>
      <a href="/" className="ms-back">&larr; HOME</a>
      <section className="ms-hero">
        <div className="ms-hero-inner">
          <div className="ms-eyebrow">// STRATEGIC MUNICIPAL PROTECTION</div>
          <h1 className="ms-h1">MUNICIPAL<br /><span>PUBLIC SERVICE CONTINUITY</span></h1>
          <p className="ms-hero-p">Precision filtration engineered for refuse collection vehicles, road sweepers, gritters, street washers, sewer tankers, and municipal utility trucks. Our technology protects every critical fluid system, extending service intervals and keeping essential services running reliably. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>
      <section className="ms-sec" style={{background:'#050505'}}>
        <div className="ms-sec-inner">
          <div className="ms-grid2">
            <div>
              <div className="ms-eyebrow">// EXTENDED SERVICE ENGINEERING</div>
              <h2 className="ms-sh2">MUNICIPAL RELIABILITY<br /><span>ENGINEERED</span></h2>
              <p className="ms-p">Our extended-interval filtration technologies reduce emergency repair callouts and support predictive maintenance programmes across Volvo, Mercedes-Benz, MAN, and DAF platform vehicles.</p>
              <div className="ms-tech-grid">
                <div><div className="ms-tech-label">FUEL SYSTEMS</div><div className="ms-tech-val">AQUAGUARD™</div></div>
                <div><div className="ms-tech-label">LUBRICATION</div><div className="ms-tech-val">SINTRAX™</div></div>
                <div><div className="ms-tech-label">HYDRAULICS</div><div className="ms-tech-val">NANOFORCE™</div></div>
                <div><div className="ms-tech-label">AIR INTAKE</div><div className="ms-tech-val">MACROCORE™</div></div>
              </div>
              <Link href="/technologies" className="ms-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="ms-video-wrap">
              <div className="ms-video-inner">
                <video src={`${WP}/servicios.mp4`} autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="ms-cta">
        <div className="ms-cta-inner">
          <div>
            <div className="ms-cta-label">// MUNICIPAL CROSS REFERENCE</div>
            <div className="ms-cta-h2">FLEET UPTIME IS EVERYTHING.<br />FIND YOUR CROSS REFERENCE.</div>
            <p className="ms-cta-p">Access our global database. Search by OEM or part number to find the industrial-grade match for your fleet.</p>
          </div>
          <Link href="/search" className="ms-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="ms-cta-footer">MUNICIPAL PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}
