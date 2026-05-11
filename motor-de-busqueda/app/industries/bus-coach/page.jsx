'use client';
import Link from 'next/link';

export default function BusCoach() {
  const css = `
    .bc{background:#000;color:#fff;min-height:100vh;}
    .bc-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .bc-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .bc-hero{min-height:80vh;display:flex;align-items:center;background:linear-gradient(to right,rgba(0,0,0,0.9) 30%,rgba(0,0,0,0.2) 100%),url('https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/buses.avif') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .bc-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .bc-h1{font-family:'Russo One',sans-serif;font-size:clamp(45px,8vw,90px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .bc-h1 span{color:#FFF12D;}
    .bc-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .bc-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .bc-sec-inner{max-width:1400px;margin:0 auto;}
    .bc-grid2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .bc-sh2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .bc-sh2 span{color:#FFF12D;}
    .bc-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;}
    .bc-tech-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;}
    .bc-tech-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:6px;}
    .bc-tech-val{font-family:'Russo One',sans-serif;font-size:16px;color:#fff;text-transform:uppercase;}
    .bc-video-wrap{position:relative;}
    .bc-video-wrap:before{content:'';position:absolute;inset:-4px;background:rgba(255,241,45,0.2);filter:blur(8px);opacity:0.25;transition:opacity 0.3s;}
    .bc-video-inner{position:relative;background:#000;border:1px solid rgba(255,255,255,0.1);padding:4px;z-index:1;}
    .bc-video-inner video{width:100%;filter:grayscale(1);opacity:0.7;display:block;transition:all 0.7s;}
    .bc-video-wrap:hover .bc-video-inner video{filter:grayscale(0);opacity:1;}
    .bc-btn{font-family:'Russo One',sans-serif;background:#FFF12D;color:#000;padding:20px 40px;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;display:inline-block;text-decoration:none;transition:all 0.2s;margin-top:24px;}
    .bc-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .bc-card{background:#080808;border:1px solid rgba(255,255,255,0.05);padding:36px;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);height:100%;}
    .bc-card:hover{border-color:#FFF12D;transform:translateY(-5px);background:#0a0a0a;}
    .bc-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .bc-card-title{font-family:'Russo One',sans-serif;font-size:22px;text-transform:uppercase;color:#fff;margin-bottom:16px;}
    .bc-card-p{font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;letter-spacing:0.03em;}
    .bc-cta{background:#FFF12D;padding:72px 6%;}
    .bc-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .bc-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .bc-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:18px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;}
    @media(max-width:1024px){.bc-grid2{grid-template-columns:1fr;} .bc-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.bc-grid3{grid-template-columns:1fr;}}
  `;

  return (
    <div className="bc">
      <style>{css}</style>
      <Link href="/" className="bc-back">&larr; HOME</Link>

      <section className="bc-hero">
        <div className="bc-hero-inner">
          <div className="bc-eyebrow">// PASSENGER FLEET UPTIME</div>
          <h1 className="bc-h1">BUS & COACH<br /><span>OPERATIONAL EXCELLENCE</span></h1>
          <p className="bc-hero-p">Maximizing uptime for urban transit and long-distance coach networks. In the passenger transport industry, a single filter failure doesn't just mean a downed vehicle—it means a broken schedule and compromised safety. Our filtration systems are engineered to handle the constant thermal cycling of city stop-and-go routes and the high-mileage demands of intercity travel, ensuring Euro 6 compliance and protecting Common Rail systems from fuel-borne contaminants.</p>
        </div>
      </section>

      <section className="bc-sec" style={{background:'#050505'}}>
        <div className="bc-sec-inner">
          <div className="bc-grid2">
            <div>
              <h2 className="bc-sh2">RELIABILITY FOR <span>THE PUBLIC SECTOR</span></h2>
              <p className="bc-p">Public transport engines operate under unique stress. Frequent idling and stop-start cycles accelerate soot loading in engine oil and particulate buildup in DPF systems. ELIMFILTERS provides high-capacity media that extends service intervals without risking turbocharger health or fuel injector precision.</p>
              <div className="bc-tech-grid">
                <div><div className="bc-tech-label">LUBRICATION</div><div className="bc-tech-val">SINTRAX™</div></div>
                <div><div className="bc-tech-label">FUEL SYSTEM</div><div className="bc-tech-val">NANOFORCE™</div></div>
                <div><div className="bc-tech-label">WATER SEP</div><div className="bc-tech-val">AQUAGUARD™</div></div>
                <div><div className="bc-tech-label">CABIN AIR</div><div className="bc-tech-val">MICROKAPPA™</div></div>
              </div>
              <Link href="/technologies" className="bc-btn">VIEW ENGINEERING</Link>
            </div>
            <div className="bc-video-wrap">
              <div className="bc-video-inner">
                <video src="https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/buses-2.mp4" autoPlay muted loop playsInline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bc-sec">
        <div className="bc-sec-inner">
          <div className="bc-grid3">
            {[
              {label:'Oil Module', title:'SINTRAX™', desc:'Optimized for heavy-duty cycle lubrication, capturing ultra-fine soot particles that cause abrasive wear in overhead cams.'},
              {label:'Fuel Module', title:'NANOFORCE™', desc:'High-efficiency particle retention for high-pressure Common Rail systems, preventing injector erosion and calibration drift.'},
              {label:'Water separation', title:'AQUAGUARD™', desc:'Essential for preventing corrosion and microbial growth in large-capacity fuel tanks typical of coach fleets.'},
              {label:'Air Intake', title:'MACROCORE™', desc:'Ensures high airflow volume and maximum dust retention for urban environments with high PM10 levels.'},
              {label:'Cabin Comfort', title:'MICROKAPPA™', desc:'Advanced multi-stage cabin filtration to ensure passenger health by removing allergens and urban pollutants.'},
              {label:'Cooling System', title:'COOLTECH™', desc:'Maintains chemical balance in large-volume cooling circuits to prevent cavitation and electrochemical corrosion.'},
            ].map((c, i) => (
              <div key={i} className="bc-card">
                <div className="bc-card-label">{c.label}</div>
                <div className="bc-card-title">{c.title}</div>
                <p className="bc-card-p">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bc-cta">
        <div className="bc-cta-inner">
          <div>
            <div className="bc-cta-h2">OPTIMIZE YOUR FLEET<br />MAINTENANCE TODAY.</div>
          </div>
          <Link href="/search" className="bc-cta-btn">SEARCH CATALOGUE &rarr;</Link>
        </div>
      </section>
    </div>
  );
}