import React from 'react';

export const metadata = {
  title: 'COOLTECH™ | Heavy Duty Cooling Systems',
  description: 'Precision Chemical Balance and SCA technology by Elimfilters.',
}

export default function CooltechPage() {
  return (
    <div id="elim-cooltech-wrapper" className="bg-black text-white min-h-screen antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=JetBrains+Mono:wght@500&family=Montserrat:wght@900&display=swap" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        #elim-cooltech-wrapper {
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
        .hero-cooltech {
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
            background: url('https://elimfilters.com/wp-content/uploads/2026/02/Gemini_Generated_Image_7eigh77eigh77eig.png') center center/cover no-repeat;
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
        <header className="hero-cooltech px-[8%]">
          <div className="hero-bg-image"></div>
          <div className="hero-overlay"></div>
          <div className="relative z-10 w-full">
            <p className="font-tech-clean mb-4">// THERMAL_SYSTEM / MOD-06</p>
            <h1 className="font-impact-master text-7xl md:text-9xl">MAXIMUM</h1>
            <h1 className="font-impact-master text-6xl md:text-8xl text-[var(--volt)]">COOLTECH™</h1>
            <div className="mt-10 max-w-xl border-l-4 border-[var(--volt)] pl-10">
              <p className="text-zinc-200 text-2xl font-light leading-snug italic">
                Precision <strong>Chemical Balance</strong>. Engineered to eliminate cavitation and liner pitting.
              </p>
            </div>
            <div className="mt-12">
              <a href="https://world-catalogue-production.up.railway.app/" className="cta-pill">IDENTIFY SKU</a>
            </div>
          </div>
        </header>

        <section className="py-24 px-[8%] bg-[#050505] border-b border-white/5">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div>
              <p className="font-tech-clean mb-6">// COOLING DYNAMICS</p>
              <h2 className="font-impact-master text-5xl mb-8 leading-tight">CONTROLLED RELEASE<br/><span className="text-[var(--volt)]">SCA ADDITIVES</span></h2>
              <p className="text-zinc-400 text-lg mb-8 font-light">
                <strong>COOLTECH™</strong> maintains coolant pH at optimal levels, creating a protective barrier against cavitation damage.
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div className="border-l border-zinc-800 pl-4">
                  <span className="font-tech-clean text-[10px]">CHEMICAL BALANCE</span>
                  <p className="text-xs text-zinc-500 uppercase mt-1">Scale Prevention</p>
                </div>
                <div className="border-l border-zinc-800 pl-4">
                  <span className="font-tech-clean text-[10px]">ENGINEERING</span>
                  <p className="text-xs text-zinc-500 uppercase mt-1">By-Pass Flow Filtration</p>
                </div>
              </div>
            </div>
            <div className="bg-black border border-zinc-900 p-1">
              <img src="https://elimfilters.com/wp-content/uploads/2026/04/COOLANT-FILTER.png" alt="M-06 COOLTECH" className="w-full h-auto brightness-[1.05] contrast-[1.1]" />
            </div>
          </div>
        </section>

        <section className="py-24 px-[8%] text-center">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-impact-master text-6xl mb-16">COOLING <span className="text-[var(--volt)]">ENGINEERING.</span></h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="feature-card text-left">
                <h3 className="font-impact-master text-xl mb-4">ANTI-CAVITATION</h3>
                <p className="text-zinc-400 text-sm font-light">Protects metallic surfaces against high-pressure bubble erosion.</p>
              </div>
              <div className="feature-card text-left">
                <h3 className="font-impact-master text-xl mb-4">PH CONTROL</h3>
                <p className="text-zinc-400 text-sm font-light">Prevents acidic corrosion in radiators and water pumps.</p>
              </div>
              <div className="feature-card text-left">
                <h3 className="font-impact-master text-xl mb-4">SYNTHETIC MEDIA</h3>
                <p className="text-zinc-400 text-sm font-light">Traps sediment and chemical precipitates efficiently.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
