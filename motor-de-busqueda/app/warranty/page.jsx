'use client';
import Link from 'next/link';

const WP = 'https://cdn.elimfilters.com';

export default function Warranty() {
  const css = `
    .wt{background:#000;color:#fff;min-height:100vh;}
    .wt-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .wt-back:hover{background:#FFF12D;color:#000;border-color:#FFF12D;}
    .wt-hero{position:relative;padding:140px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .wt-hero-bg{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,rgba(0,0,0,1) 35%,rgba(0,0,0,0.6) 100%),url('${WP}/2025/08/302364330_779848490080329_2618508245054691040_n.png') center/cover no-repeat;z-index:0;}
    .wt-hero-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto;}
    .wt-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#FFF12D;text-transform:uppercase;margin-bottom:24px;}
    .wt-h1{font-family:'Russo One',sans-serif;font-size:clamp(38px,7vw,85px);text-transform:uppercase;line-height:0.95;color:#fff;margin:0 0 32px;}
    .wt-h1 span{color:#FFF12D;}
    .wt-hero-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;max-width:700px;border-left:4px solid #FFF12D;padding-left:20px;letter-spacing:0.05em;}
    .wt-stats{padding:50px 6%;background:#030303;border-bottom:1px solid #111;}
    .wt-stats-inner{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:8px;}
    .wt-stat{background:#050505;border:1px solid #1a1a1a;padding:40px 20px;text-align:center;flex:1;min-width:220px;transition:all 0.3s;}
    .wt-stat:hover{border-color:#FFF12D;background:#080808;}
    .wt-stat-n{font-family:'Russo One',sans-serif;font-size:48px;color:#FFF12D;line-height:1;display:block;margin-bottom:12px;}
    .wt-stat-l{font-family:'JetBrains Mono',monospace;font-size:10px;color:#666;text-transform:uppercase;letter-spacing:0.1em;display:block;}
    .wt-sec{padding:80px 6%;border-bottom:1px solid rgba(255,255,255,0.04);}
    .wt-sec-inner{max-width:1100px;margin:0 auto;}
    .wt-block{background:linear-gradient(90deg,#050505 0%,#080808 100%);border:1px solid #1a1a1a;border-left:4px solid #FFF12D;padding:44px;margin-bottom:4px;}
    .wt-block-title{font-family:'Russo One',sans-serif;font-size:18px;color:#FFF12D;text-transform:uppercase;margin-bottom:16px;}
    .wt-block-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;letter-spacing:0.05em;margin-bottom:12px;}
    .wt-cta{padding:110px 6% 140px;background:#030303;text-align:center;border-bottom:none;}
    .wt-cta-inner{max-width:900px;margin:0 auto;}
    .wt-cta-h2{font-family:'Russo One',sans-serif;font-size:clamp(32px,5vw,60px);text-transform:uppercase;line-height:0.95;margin-bottom:32px;}
    .wt-cta-h2 span{color:#FFF12D;}
    .wt-cta-p{font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.7;max-width:640px;margin:0 auto 48px;letter-spacing:0.05em;}
    .wt-btn{background:#FFF12D;color:#000;font-family:'Russo One',sans-serif;font-size:14px;letter-spacing:0.12em;padding:24px 50px;display:inline-block;text-transform:uppercase;text-decoration:none;transition:all 0.4s cubic-bezier(0.165,0.84,0.44,1);}
    .wt-btn:hover{background:#fff;transform:translateY(-5px);}
    .wt-version{margin-top:64px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.2);text-transform:uppercase;}
    @media(max-width:768px){.wt-stats-inner{flex-direction:column;} .wt-stat{min-width:100%;} .wt-hero-p{font-size:12px;} .wt-block{padding:28px;}}
  `;

  return (
    <div className="wt">
      <style>{css}</style>
      <a href="/?skip=1" className="wt-back">&larr; HOME</a>

      <header className="wt-hero">
        <div className="wt-hero-bg" />
        <div className="wt-hero-inner">
          <div className="wt-eyebrow">// GLOBAL WARRANTY PROGRAM — ELIMFILTERS</div>
          <h1 className="wt-h1">PROTECTION ENGINEERING<br /><span>WITH ABSOLUTE SUPPORT.</span></h1>
          <p className="wt-hero-p">Industrial asset protection systems backed by total technical coverage. Our warranty is an extension of our engineering quality — shielding your investment from the first mile until the end of the service cycle. Full non-prorated coverage for heavy-duty engines in on-road and off-road applications across 12 industries worldwide. Precision-matched to OEM specifications across 5,000+ cross-references.</p>
        </div>
      </header>

      <section className="wt-stats">
        <div className="wt-stats-inner">
          {[
            {n:'10K', l:'ON-ROAD KILOMETERS'},
            {n:'1000', l:'OFF-ROAD HOURS'},
            {n:'100%', l:'NON-PRORATED VALUE'},
            {n:'24H', l:'TECHNICAL RESPONSE'},
          ].map((s, i) => (
            <div key={i} className="wt-stat">
              <span className="wt-stat-n">{s.n}</span>
              <span className="wt-stat-l">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="wt-sec">
        <div className="wt-sec-inner">
          <div className="wt-eyebrow" style={{marginBottom:'48px'}}>// TECHNICAL SHIELDING TERMS</div>
          <div className="wt-block">
            <div className="wt-block-title">Direct Factory Support</div>
            <p className="wt-block-p">ELIMFILTERS warrants that every component has been manufactured under the strictest engineering standards, covering any defect in material or workmanship through an immediate replacement protocol across all product lines.</p>
          </div>
          <div className="wt-block">
            <div className="wt-block-title">Comprehensive Engine Protection</div>
            <p className="wt-block-p">In the event that a warrantable failure is the primary cause of equipment damage, ELIMFILTERS assumes responsibility for reasonable repair costs — ensuring your operation never stops and your assets remain protected.</p>
          </div>
          <div className="wt-block">
            <div className="wt-block-title">Coverage Transparency</div>
            <p className="wt-block-p">No complex wear-and-tear calculations. Our warranty is non-prorated — meaning the protection value remains intact throughout the entire recommended service life of the filter across on-road and off-road applications worldwide.</p>
          </div>
        </div>
      </section>

      <section className="wt-cta">
        <div className="wt-cta-inner">
          <div className="wt-eyebrow" style={{display:'flex',justifyContent:'center',marginBottom:'24px'}}>// ENGINEERING & SUPPORT PORTAL</div>
          <div className="wt-cta-h2">NEED TO VALIDATE<br /><span>A WARRANTY CLAIM?</span></div>
          <p className="wt-cta-p">Start your claim through our official support portal. Our team of engineers will validate your case within a maximum period of 24 to 48 business hours — protecting your investment and operational continuity.</p>
          <Link href="/contact" className="wt-btn">REQUEST TECHNICAL VALIDATION &rarr;</Link>
          <p className="wt-version">ELIMFILTERS GLOBAL WARRANTY PROTOCOL v2.6</p>
        </div>
      </section>
    </div>
  );
}
