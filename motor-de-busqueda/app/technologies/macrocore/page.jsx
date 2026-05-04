import React from 'react';

export const metadata = {
  title: 'MACROCORE™ | Heavy Duty Air Systems',
  description: 'Structural Reinforcement Technology by Elimfilters',
}

export default function MacrocorePage() {
  return (
    <div id="elim-macrocore-wrapper" className="bg-black text-white min-h-screen">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=JetBrains+Mono:wght@500&family=Montserrat:wght@900&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        #elim-macrocore-wrapper {
            --volt: #FFF12D;
            --bg: #000000;
            --text-body: #a1a1aa;
            --border-soft: rgba(255,255,255,0.08);
        }
        .font-impact-master {
            font-family: 'Montserrat', sans-serif;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.04em;
            line-height: 0.9;
        }
        .font-tech-clean {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            color: var(--volt);
            font-size: 11px;
        }
        .hero-macrocore {
            position: relative;
            min-height: 80vh;
            display: flex;
            align-items: center;
            overflow: hidden;
            background-color: #000;
        }
        .hero-bg-image {
            position: absolute;
            top: 0; right: 0;
            width: 100%; height: 100%;
            background: url('https://elimfilters.com/wp-content/uploads/2025/08/Imagen1.png') right center/contain no-repeat;
            mask-image: linear-gradient(to right, transparent 0%, black 65%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 65%);
            z-index: 1;
        }
        .cta-pill {
            background: var(--volt);
            color: #000;
            font-family: 'Montserrat', sans-serif;
            font-weight: 900;
            padding: 22px 50px;
            display: inline-block;
            text-transform: uppercase;
            font-size: 13px;
            transition: all 0.3s ease;
            border: 2px solid var(--volt);
        }
        .cta-pill:hover {
            background: transparent;
            color: var(--volt);
            transform: scale(1.05);
        }
        .feature-card {
            background: linear-gradient(145deg, #080808, #000);
            border: 1px solid var(--border-soft);
            padding: 45px 35px;
            transition: all 0.4s ease;
        }
        .feature-card:hover { border-color: var(--volt); }
      `}} />

      <main>
        <section className="hero-macrocore px-[8%]">
          <div className="hero-bg-image"></div>
          <div className="relative z-10 max-w-4xl">
            <p className="font-tech-clean mb-4">// HEAVY_DUTY_AIR_SYSTEMS / SYS-01</p>
            <h1 className="font-impact-master text-7xl md:text-9xl mb-2">STRUCTURE</h1>
            <h1 className="font-impact-master text-6xl md:text-8xl text-[var(--volt)]">MACROCORE™.</h1>
            <div className="mt-10 max-w-xl border-l-4 border-[var(--volt)] pl-10">
              <p className="text-zinc-200 text-2xl font-light italic leading-snug">
                <strong>Structural Reinforcement</strong> Technology — Absolute shield against collapse in high-displacement engines.
              </p>
            </div>
            <div className="mt-12">
              <a href="https://world-catalogue-production.up.railway.app/" className="cta-pill">SEARCH MY SKU</a>
            </div>
          </div>
        </section>

        <section className="py-24 px-[8%] bg-[#050505] border-t border-[var(--border-soft)]">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <p className="font-tech-clean mb-6">// ANTI-COLLAPSE TECHNOLOGY</p>
              <h2 className="font-impact-master text-5xl mb-8">HD ENGINEERING <span className="text-[var(--volt)]">VALIDATION.</span></h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed font-light">
                The <strong>MACROCORE™</strong> architecture ensures the filter geometry remains unalterable under extreme suction.
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div className="border-l border-zinc-800 pl-4">
                  <span className="font-tech-clean text-[10px]">CRUSH RESISTANCE</span>
                  <p className="text-xs text-zinc-500 uppercase mt-1">Exceeds 62 PSI</p>
                </div>
                <div className="border-l border-zinc-800 pl-4">
                  <span className="font-tech-clean text-[10px]">STRUCTURAL GAIN</span>
                  <p className="text-xs text-zinc-500 uppercase mt-1">+35% vs OEM</p>
                </div>
              </div>
            </div>
            <div className="border border-zinc-800 p-2 bg-black">
              <img src="https://elimfilters.com/wp-content/uploads/2026/04/Gemini_Generated_Image_pmclxypmclxypmcl.png" alt="Validation" className="w-full h-auto opacity-90" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
