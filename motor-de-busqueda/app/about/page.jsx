'use client';
import Link from 'next/link';
import { WP } from '../constants';

export default function About() {
  const css = `
    .ab{background:#000;color:#fff;min-height:100vh;}
    .ab-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .ab-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .ab-hero{min-height:72vh;display:flex;align-items:center;background:linear-gradient(90deg,#000 45%,transparent 100%),url('${WP}/2025/08/Screenshot-2025-08-20-204050.png') center/cover no-repeat;padding:120px 6% 80px;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ab-hero-inner{max-width:1400px;margin:0 auto;width:100%;}
    .ab-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .ab-h1{font-family:'Russo One',sans-serif;font-size:clamp(48px,8vw,95px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0;}
    .ab-h1 span{color:#FFF12D;}
    .ab-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:640px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;margin-top:32px;}
    .ab-hero-p strong{color:#fff;}
    .ab-phil{padding:80px 6%;background:#050505;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ab-phil-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ab-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:24px;}
    .ab-h2 span{color:#FFF12D;}
    .ab-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:16px;border-left:4px solid #FFF12D;padding-left:20px;}
    .ab-card{background:#0a0a0a;border:1px solid #1a1a1a;padding:36px;display:flex;flex-direction:column;gap:24px;}
    .ab-card-item{border-top:1px solid #1a1a1a;padding-top:24px;}
    .ab-card-item:first-child{border-top:none;padding-top:0;}
    .ab-card-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ab-card-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;}
    .ab-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;padding:18px 40px;display:inline-block;text-decoration:none;transition:background 0.25s;margin-top:16px;}
    .ab-btn:hover{background:#fff;}
    .ab-env{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ab-env-inner{max-width:1400px;margin:0 auto;}
    .ab-env-head{text-align:center;margin-bottom:52px;}
    .ab-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
    .ab-feature{background:rgba(255,255,255,0.02);border-left:4px solid #FFF12D;padding:28px;transition:all 0.3s;}
    .ab-feature:hover{background:rgba(255,255,255,0.05);transform:translateY(-4px);}
    .ab-feature-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:12px;}
    .ab-feature-title{font-family:'Russo One',sans-serif;font-size:20px;text-transform:uppercase;color:#fff;margin-bottom:12px;}
    .ab-feature-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;}
    .ab-human{padding:80px 6%;background:#030303;border-bottom:1px solid rgba(255,255,255,0.04);}
    .ab-human-inner{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
    .ab-human-card{background:linear-gradient(145deg,#030303,#000);border:1px solid #1a1a1a;padding:36px;}
    .ab-mandate{padding:80px 6%;background:#030303;text-align:center;}
    .ab-mandate-inner{max-width:900px;margin:0 auto;}
    .ab-mandate-h2{font-family:'Russo One',sans-serif;font-size:clamp(28px,5vw,56px);text-transform:uppercase;line-height:0.95;margin-bottom:8px;}
    .ab-mandate-h2 span{color:#FFF12D;}
    .ab-mandate-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:700px;margin:24px auto 0;letter-spacing:0.05em;}
    @media(max-width:1024px){.ab-phil-inner{grid-template-columns:1fr;} .ab-human-inner{grid-template-columns:1fr;} .ab-grid3{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:768px){.ab-grid3{grid-template-columns:1fr;} .ab-hero-p{font-size:12px;}}
  `;

  return (
    <div className="ab">
      <style>{css}</style>
      <a href="/?skip=1" className="ab-back">&larr; HOME</a>

      <section className="ab-hero">
        <div className="ab-hero-inner">
          <div className="ab-eyebrow">// GLOBAL ENGINEERING MISSION</div>
          <h1 className="ab-h1">ENGINEERING OF<br /><span>CERTAINTY.</span></h1>
          <p className="ab-hero-p">
            Industrial asset protection systems engineered for fleets, mining operations, and critical diesel and gasoline-powered infrastructure. Our filtration technology shields hydraulic circuits, fuel systems, lubrication lines, and air intake systems from contamination — extending asset lifespan, eliminating unplanned downtime, and reducing total cost of ownership across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.
          </p>
        </div>
      </section>

      <section className="ab-phil">
        <div className="ab-phil-inner">
          <div>
            <div className="ab-eyebrow">// ENGINEERING PHILOSOPHY</div>
            <h2 className="ab-h2">RISK FIRST.<br /><span>ALWAYS.</span></h2>
            <p className="ab-p">Every industrial failure has a root cause. Our engineering process begins by identifying that cause — before recommending any solution. We do not sell parts. We eliminate risk.</p>
            <p className="ab-p">ELIMFILTERS designs integrated protection systems that defend engines, hydraulics, fuel systems, and airflow as a unified structure — not a collection of components.</p>
            <Link href="/systems" className="ab-btn">VIEW ENGINEERING TECHNOLOGY</Link>
          </div>
          <div className="ab-card">
            <div className="ab-card-item">
              <div className="ab-card-label">01 / RISK-FIRST ENGINEERING</div>
              <p className="ab-card-p">We analyze the impact of failure before designing solutions. Our goal is not to sell parts — it is to eliminate risk and protect what matters most to our clients.</p>
            </div>
            <div className="ab-card-item">
              <div className="ab-card-label">02 / SYSTEMS, NOT COMPONENTS</div>
              <p className="ab-card-p">We design integrated protection architectures that defend engines, hydraulics, fuel systems, and airflow as a single unified structure across 12 industries worldwide.</p>
            </div>
            <div className="ab-card-item">
              <div className="ab-card-label">03 / STRATEGIC ALLIANCE</div>
              <p className="ab-card-p">We operate as a technical ally for fleets, industries, and infrastructure worldwide. Your operational availability and asset protection becomes our responsibility.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ab-env">
        <div className="ab-env-inner">
          <div className="ab-env-head">
            <div className="ab-eyebrow" style={{display:'flex',justifyContent:'center'}}>// ENVIRONMENTAL RESPONSIBILITY</div>
            <h2 className="ab-h2" style={{textAlign:'center',marginTop:'16px'}}>PROTECTING MACHINES.<br /><span>PROTECTING THE PLANET.</span></h2>
          </div>
          <div className="ab-grid3">
            <div className="ab-feature">
              <div className="ab-feature-label">ORGANIC MEDIA</div>
              <div className="ab-feature-title">RECYCLABLE FILTRATION</div>
              <p className="ab-feature-p">Many ELIMFILTERS solutions utilize organic and recyclable media designed to minimize environmental impact at the end of their service life cycle.</p>
            </div>
            <div className="ab-feature">
              <div className="ab-feature-label">EXTENDED SERVICE LIFE</div>
              <div className="ab-feature-title">LESS WASTE</div>
              <p className="ab-feature-p">Longer replacement intervals mean fewer discarded filters, less fluid waste, and a smaller industrial footprint per operation worldwide.</p>
            </div>
            <div className="ab-feature">
              <div className="ab-feature-label">FUEL EFFICIENCY</div>
              <div className="ab-feature-title">LOWER EMISSIONS</div>
              <p className="ab-feature-p">Clean fuel delivery and optimized airflow improve combustion efficiency — directly reducing emissions in fleet operations across 12 industries.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ab-human">
        <div className="ab-human-inner">
          <div>
            <div className="ab-eyebrow">// HUMAN IMPACT</div>
            <h2 className="ab-h2">BEYOND<br /><span>THE MACHINES.</span></h2>
            <p className="ab-p" style={{fontStyle:'italic',fontSize:'15px',color:'rgba(255,255,255,0.6)'}}>In the end, metal can be replaced — people cannot.</p>
          </div>
          <div className="ab-human-card">
            <p className="ab-card-p" style={{marginBottom:'16px'}}>Our mission is to protect the operator, the investment, and the family that depends on both. From the engine block to the home, protection is non-negotiable.</p>
            <p className="ab-card-p">We build filtration systems that go beyond mechanical performance — safeguarding the people who operate the equipment, the companies that rely on operational availability, and the communities that depend on industrial continuity.</p>
          </div>
        </div>
      </section>

      <section className="ab-mandate">
        <div className="ab-mandate-inner">
          <div className="ab-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// GLOBAL PROTECTION MANDATE</div>
          <div className="ab-mandate-h2">WHERE FAILURE IS NOT AN OPTION,<br /><span>ELIMFILTERS EXISTS.</span></div>
          <p className="ab-mandate-p">From heavy construction to marine operations, from agriculture to power generation — ELIMFILTERS delivers precision filtration designed for the demands of real-world industrial operations worldwide. Precision-matched to OEM specifications across 5,000+ cross-references. Certified to ISO 16889 standards.</p>
        </div>
      </section>
    </div>
  );
