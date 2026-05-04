'use client';
import Link from 'next/link';

const WP = 'https://elimfilters.com/wp-content/uploads';

const industries = [
  { name: 'Bus & Coach', desc: 'Mechanical reliability for mass transit systems and tourism fleets.', img: WP + '/2025/08/ChatGPT-Image-7-ago-2025-05_57_57-p.m.webp', slug: 'bus-coach' },
  { name: 'Railway', desc: 'Precision filtration for diesel-electric engines and compressed air systems.', img: WP + '/2025/08/train-3895307_1920.jpg', slug: 'railway' },
  { name: 'Construction', desc: 'Hydraulic and engine protection for the most abrasive terrains.', img: WP + '/2025/08/construction.jpg', slug: 'construction' },
  { name: 'Manufacturing', desc: 'Critical industrial process protection for continuous-cycle plants.', img: WP + '/2026/04/pexels-bence-szemerey-337043-6804258-scaled.jpg', slug: 'manufacturing' },
  { name: 'Marine', desc: 'Total defense against salinity and corrosion in offshore operations.', img: WP + '/2025/08/Screenshot-2025-08-07-075322.png', slug: 'marine' },
  { name: 'Trucks & Fleets', desc: 'Operational efficiency and TCO reduction for heavy transport.', img: WP + '/2026/02/pexels-cottonbro-7018493-scaled.jpg', slug: 'trucks-fleets' },
  { name: 'Automotive', desc: 'Premium standards for light and commercial vehicles.', img: WP + '/2026/04/pexels-mohit-hambiria-92377455-31396372-scaled.jpg', slug: 'automotive' },
  { name: 'Mining', desc: 'Extreme filtration for 24/7 operations in hostile conditions.', img: WP + '/2025/08/digger-1867268_1920.jpg', slug: 'mining' },
  { name: 'Agriculture', desc: 'SYNTEPORE™ technology for critical harvesting windows.', img: WP + '/2025/08/darla-hueske-Uz8xk0S_35c-unsplash-1-scaled.jpg', slug: 'agriculture' },
  { name: 'Waste & Municipal', desc: 'Zero downtime for critical urban services.', img: WP + '/2026/02/pexels-oscar-sanchez197-9535766-scaled.jpg', slug: 'waste-municipal' },
  { name: 'Oil & Gas', desc: 'Engineering for drilling and compression in remote environments.', img: WP + '/2026/04/pexels-tomfisk-6767962-1-scaled.jpg', slug: 'oil-gas' },
  { name: 'Power Generation', desc: 'Energy continuity for power plants and data centers.', img: WP + '/2025/08/ChatGPT-Image-7-ago-2025-10_09_26-a.m.png', slug: 'power-generation' },
];

export default function Industries() {
  const css = `
    .ind-page{background:#000;color:#fff;min-height:100vh;}
    .ind-hero{min-height:50vh;display:flex;align-items:center;background:linear-gradient(90deg,rgba(0,0,0,0.95) 30%,rgba(0,0,0,0.4) 100%),url('${WP}/2025/08/construction.jpg') center/cover no-repeat;padding:120px 6% 80px;}
    .ind-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ind-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ind-hero-h1{font-family:'Russo One',sans-serif;font-size:clamp(40px,8vw,100px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ind-hero-h1 span{color:#FFF12D;}
    .ind-grid-sec{padding:72px 6%;background:#050505;}
    .ind-grid-inner{max-width:1400px;margin:0 auto;}
    .ind-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
    .ind-card{background:rgba(255,255,255,0.02);border-left:3px solid #1a1a1a;display:flex;flex-direction:column;text-decoration:none;overflow:hidden;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .ind-card:hover{background:rgba(255,255,255,0.05);border-left-color:#FFF12D;transform:translateY(-5px);}
    .ind-card-img-wrap{width:100%;aspect-ratio:16/9;overflow:hidden;background:#111;}
    .ind-card-img{width:100%;height:100%;object-fit:cover;transition:0.6s ease;filter:grayscale(1) contrast(1.1);}
    .ind-card:hover .ind-card-img{filter:grayscale(0);transform:scale(1.05);}
    .ind-card-body{padding:20px;}
    .ind-card-title{font-family:'Russo One',sans-serif;font-size:17px;color:#fff;text-transform:uppercase;margin-bottom:8px;}
    .ind-card:hover .ind-card-title{color:#FFF12D;}
    .ind-card-desc{color:#888;font-size:13px;line-height:1.4;font-family:'JetBrains Mono',monospace;letter-spacing:0.05em;}
    .ind-cta{background:#FFF12D;padding:60px 6%;}
    .ind-cta-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;}
    .ind-cta-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:rgba(0,0,0,0.6);text-transform:uppercase;margin-bottom:12px;}
    .ind-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,4vw,52px);color:#000;text-transform:uppercase;line-height:0.95;margin-bottom:16px;}
    .ind-cta-p{color:rgba(0,0,0,0.8);font-size:13px;font-family:'JetBrains Mono',monospace;letter-spacing:0.05em;line-height:1.7;max-width:480px;}
    .ind-cta-btn{background:#000;color:#fff;font-family:'Russo One',sans-serif;font-size:20px;padding:24px 48px;text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;transition:all 0.2s;white-space:nowrap;}
    .ind-cta-btn:hover{background:#111;}
    @media(max-width:1024px){.ind-grid{grid-template-columns:repeat(3,1fr);}}
    @media(max-width:768px){.ind-grid{grid-template-columns:repeat(2,1fr);} .ind-card-img{filter:none;} .ind-cta-inner{flex-direction:column;}}
    @media(max-width:480px){.ind-grid{grid-template-columns:1fr;}}
  `;

  return (
    <div className="ind-page">
      <style>{css}</style>
      <section className="ind-hero">
        <div className="ind-hero-inner">
          <div className="ind-eyebrow">// GLOBAL SECTOR COVERAGE</div>
          <h1 className="ind-hero-h1">INDUSTRIES WE<br /><span>PROTECT.</span></h1>
        </div>
      </section>
      <section className="ind-grid-sec">
        <div className="ind-grid-inner">
          <div className="ind-eyebrow" style={{marginBottom:'40px'}}>// ACTIVE SECTORS MATRIX — 12 UNITS</div>
          <div className="ind-grid">
            {industries.map((ind, i) => (
              <Link key={i} href={`/industries/${ind.slug}`} className="ind-card">
                <div className="ind-card-img-wrap">
                  <img src={ind.img} alt={ind.name} className="ind-card-img" loading="lazy" />
                </div>
                <div className="ind-card-body">
                  <div className="ind-card-title">{ind.name}</div>
                  <div className="ind-card-desc">{ind.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="ind-cta">
        <div className="ind-cta-inner">
          <div>
            <div className="ind-cta-label">// CROSS REFERENCE PROTOCOL</div>
            <div className="ind-cta-h2">ENGINEERED PROTECTION<br />FOR EVERY SECTOR.</div>
            <p className="ind-cta-p">Regardless of your industry, ELIMFILTERS eliminates unplanned downtime. Find your technical equivalent now.</p>
          </div>
          <Link href="/search" className="ind-cta-btn">FIND MY FILTER →</Link>
        </div>
      </section>
    </div>
  );
}