'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

export default function TrucksFleets() {
  const css = `
    .tf{background:#000;color:#fff;min-height:100vh;}
    .tf-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .tf-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    
    .tf-hero{
      min-height: 80vh;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
      padding: 120px 6% 80px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .tf-hero::before {
      content: '';
      position: absolute;
      inset: -60%;
      background: url('https://cdn.elimfilters.com/tru.png') center/cover no-repeat;
      transform: rotate(-90deg); /* Corregido: Regresó a -45 grados */
      z-index: 0;
    }

    .tf-hero::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #000 55%, transparent 100%);
      z-index: 1;
    }

    .tf-hero-inner{position:relative; z-index:2; max-width:1400px;margin:0 auto;width:100%;}
    .tf-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .tf-h1{font-family:'Russo One',sans-serif;font-size:clamp(38px,6vw,85px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .tf-h1 span{color:#FFF12D;}
    .tf-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    
    /* ... resto de estilos se mantienen igual ... */
    .tf-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .tf-sec-inner{max-width:1400px;margin:0 auto;}
    .tf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .tf-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .tf-h2 span{color:#FFF12D;}
    .tf-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .tf-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;}
    .tf-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .tf-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .tf-video-wrap{background:#000;border:1px solid #1a1a1a;padding:4px;overflow:hidden;}
    .tf-video-wrap video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.5s;}
    .tf-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;margin-top:24px;}
  `;

  return (
    <div className="tf">
      <style>{css}</style>
      <a href="/?skip=1" className="tf-back">&larr; HOME</a>

      <section className="tf-hero">
        <div className="tf-hero-inner">
          <div className="tf-eyebrow">// LONG-HAUL & URBAN LOGISTICS</div>
          <h1 className="tf-h1">TRUCKS &amp;<br /><span>FLEETS</span></h1>
          <p className="tf-hero-p">Industrial asset protection systems engineered for long-haul trucking. Our filtration technology shields fuel systems, lubrication circuits, air intake systems, and pneumatic brakes from contamination.</p>
        </div>
      </section>

      <section className="tf-sec" style={{background:'#050505'}}>
        <div className="tf-sec-inner">
          <div className="tf-grid2">
            <div>
              <div className="tf-eyebrow">// FLEET PROTECTION PROTOCOL</div>
              <h2 className="tf-h2">EVERY MILE.<br /><span>EVERY LOAD.</span></h2>
              <p className="tf-p">ELIMFILTERS delivers complete fleet filtration architectures engineered for Cummins, Caterpillar, Detroit Diesel, MAN, Volvo, and all major truck platforms worldwide.</p>
              <div className="tf-tech-grid">
                <div><div className="tf-tech-label">FUEL SYSTEM</div><div className="tf-tech-val">SYNTEPORE™</div></div>
                <div><div className="tf-tech-label">LUBRICATION</div><div className="tf-tech-val">SYNTRAX™</div></div>
                <div><div className="tf-tech-label">AIR INTAKE</div><div className="tf-tech-val">MACROCORE™</div></div>
                <div><div className="tf-tech-label">AIR BRAKES</div><div className="tf-tech-val">DRYCORE™</div></div>
              </div>
              <Link href="/technologies" className="tf-btn">VIEW TECHNOLOGY</Link>
            </div>
            <div className="tf-video-wrap">
              <video src="/videos/trucks-highway-rear.mp4" autoPlay muted loop playsInline />
            </div>
          </div>
        </div>
      </section>

      <section className="tf-cta">
        <div className="tf-cta-inner">
          <div>
            <div className="tf-cta-label">// FLEET PROCUREMENT</div>
            <div className="tf-cta-h2">PROTECT YOUR FLEET.<br />MAXIMIZE UPTIME.</div>
            <p className="tf-cta-p">Search by OEM o part number para encontrar el match exacto de ELIMFILTERS.</p>
          </div>
          <Link href="/search" className="tf-cta-btn">FIND MY FILTER &rarr;</Link>
        </div>
      </section>
      <div className="tf-cta-footer">TRUCKS & FLEETS PROTECTION STANDARD // ELIMFILTERS GLOBAL</div>
    </div>
  );
}