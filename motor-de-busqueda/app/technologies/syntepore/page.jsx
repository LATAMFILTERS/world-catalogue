import React from 'react';

export const metadata = {
  title: 'SYNTEPORE™ | Precision Hydraulic Filtration',
  description: 'Advanced Synthetic Fiber technology for high-pressure hydraulic systems by Elimfilters.',
}

export default function SynteporePage() {
  return (
    <div id="elim-syntepore-wrapper" className="bg-black text-white min-h-screen antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=JetBrains+Mono:wght@500&family=Montserrat:wght@900&display=swap" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        #elim-syntepore-wrapper {
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
        .hero-syntepore {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            overflow: hidden;
            background-color: #000;
        }
        .hero-bg-image {
            position: absolute;
            top: 0; right: 0; width: 100%; height: 100%;
            background: url('https://elimfilters.com/wp-content/uploads/2026/02/pexels-yury-kim-181374-585419-scaled.jpg') center center/cover no-repeat;
            mask-image: linear-gradient(to right, transparent 0%, black 85%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 85%);
            z-index: 1;
        }
        .hero-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(90deg, #000 35%, rgba(0,0,0,0.5) 70%, transparent 100%);
            z-index: 2;
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
        .feature-card:hover { border-color: var(--volt); transform: translateY(-5px); }
      `}} />

      <main>
        <header className="hero-syntepore px-[8%]">
          <div className="hero-bg-image"></div>
          <div className="hero-overlay"></div>
          <div className="relative z-10 w-full">
            <p className="font-tech-clean mb-4">// HYDRAULIC_HIGH_PRESSURE / MOD-04</p>
            <h1 className="font-impact-master text-7xl md:text-9xl">PRECISION</h1>
            <h1 className="font-impact-master text-6xl md:text-8xl text-[var(--volt)]">SYNTEPORE™</h1>
            <div className="mt-10 max-w-xl border-l-4 border-[var(--volt)] pl-10">
              <p className="text-zinc-200 text-2xl font-light leading-snug italic">
                Advanced <strong>Synthetic Fiber</strong> technology for hydraulic systems. Engineered for absolute flow stability.
              </p>
            </div>
            <div className="mt-12">
              <a href="https://world-catalogue-production.up.railway.app/" className="cta-pill">SEARCH MY SKU</a>
            </div>
          </div>
        </header>

        <section className="py-24 px-[8%] bg-[#050505] border-b border-white/5">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <p className="font-tech-clean mb-6">// FLOW OPTIMIZATION</p>
              <h2 className="font-impact-master text-5xl mb-8 leading-tight">ELIMINATE<br/><span className="text-[var(--volt)]">CONTAMINATION</span></h2>
              <p className="text-zinc-400 text-lg mb-8 font-light">
                The <strong>SYNTEPORE™</strong> matrix provides superior dirt-holding capacity while maintaining extremely low pressure drops.
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div className="border-l border-zinc-800 pl-4">
                  <span className="font-tech-clean text-[10px]">BETA RATIO</span>
                  <p className="text-xs text-zinc-500 uppercase mt-1">β(c) &gt; 1000</p>
                </div>
                <div className="border-l border-zinc-800 pl-4">
                  <span className="font-tech-clean text-[10px]">PRESSURE RATING</span>
                  <p className="text-xs text-zinc-500 uppercase mt-1">High-Differential Ready</p>
                </div>
              </div>
            </div>
            <div className="bg-black border border-zinc-900 p-1">
              <img src="https://elimfilters.com/wp-content/uploads/2026/04/Gemini_Generated_Image_jkwmrkjkwmrkjkwm.png" alt="SYNTEPORE" className="w-full h-auto contrast-[1.05]" />
            </div>
          </div>
        </section>

        <section className="py-24 px-[8%]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-tech-clean mb-4">// HYDRAULIC PROTECTION</p>
              <h2 className="font-impact-master text-5xl">ENGINEERING FOR <span className="text-[var(--volt)]">PEAK POWER</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="feature-card">
                <h3 className="font-impact-master text-xl mb-4">THERMAL STABILITY</h3>
                <p className="text-zinc-400 text-sm font-light">Resistant to high operating temperatures without structural breakdown.</p>
              </div>
              <div className="feature-card">
                <h3 className="font-impact-master text-xl mb-4">AI-VALIDATED MATRIX</h3>
                <p className="text-zinc-400 text-sm font-light">Fiber distribution optimized via AI to prevent premature clogging.</p>
              </div>
              <div className="feature-card">
                <h3 className="font-impact-master text-xl mb-4">ACTUATOR SAFETY</h3>
                <p className="text-zinc-400 text-sm font-light">Critical protection for proportional valves and precision components.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
