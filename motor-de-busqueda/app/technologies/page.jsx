'use client';
import Link from 'next/link';

const technologies = [
  { num: '01', name: 'MACROCORE', slug: 'macrocore', desc: 'Heavy-duty structural reinforcement preventing media migration.' },
  { num: '02', name: 'SYNTRAX', slug: 'syntrax', desc: 'Hybrid synthetic and cellulose for engine oil protection.' },
  { num: '03', name: 'NANOFORCE', slug: 'nanoforce', desc: 'Multi-stage depth filtration engineered for HPCR systems.' },
  { num: '04', name: 'SYNTEPORE', slug: 'syntepore', desc: 'Reinforced synthetic mesh for high-pressure fuel systems.' },
  { num: '05', name: 'MICROKAPPA', slug: 'microkappa', desc: 'Dual-layer HEPA and activated carbon system.' },
  { num: '06', name: 'COOLTECH', slug: 'cooltech', desc: 'Precision additive balance to eliminate cavitation.' },
  { num: '07', name: 'AQUAGUARD', slug: 'aquaguard', desc: 'Hydrophobic water separation for turbines.' },
  { num: '08', name: 'DRYCORE', slug: 'drycore', desc: 'Molecular air dryer technology.' },
  { num: '09', name: 'INTEKCORE', slug: 'intekcore', desc: 'Leak-proof housing seal technology.' },
  { num: '10', name: 'DURATECH', slug: 'duratech', desc: 'Optimized maintenance kits (EK5/EK3).' },
  { num: '11', name: 'AQUAGUARD SERIES', slug: 'aquaguard-series', desc: 'Advanced turbine fuel filtration.' },
  { num: '12', name: 'MARINECLEAN', slug: 'marineclean', desc: 'Corrosion-resistant marine technology.' }
];

export default function Technologies() {
  const css = `
    .tp { background:#000; color:#fff; min-height:100vh; font-family:'JetBrains Mono',monospace; }
    .tp-back{position:fixed;top:24px;right:24px;z-index:999;background:rgba(0,0,0,0.8);border:1px solid rgba(255,241,45,0.4);padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-decoration:none;text-transform:uppercase;transition:all 0.2s;backdrop-filter:blur(8px);}
    .tp-back:hover{background:#FFF12D;color:#000;}
    .tp-header { padding:80px 6% 40px; }
    .tp-header h1 { font-family:'Russo One',sans-serif; font-size:clamp(50px,10vw,100px); font-weight:900; text-transform:uppercase; line-height:0.9; margin:0 0 16px 0; }
    .tp-header p { font-size:16px; color:#888; max-width:800px; line-height:1.7; }
    .tp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1px; background:rgba(255,255,255,0.1); padding:0 6%; margin:40px 0; }
    .tp-item { background:#000; padding:40px; text-decoration:none; color:#fff; transition:all 0.3s; border-bottom:1px solid #222; display:flex; flex-direction:column; }
    .tp-item:hover { background:#111; border-bottom-color:#FFF12D; }
    .tp-item:hover h2 { color:#FFF12D; }
    .tp-num { font-size:11px; letter-spacing:0.25em; color:#FFF12D; text-transform:uppercase; margin-bottom:8px; }
    .tp-item h2 { font-family:'Russo One',sans-serif; font-size:20px; font-weight:900; text-transform:uppercase; margin:8px 0 12px 0; transition:color 0.3s; }
    .tp-item p { font-size:12px; color:#999; line-height:1.6; margin:0; }
    @media(max-width:768px){.tp-grid{grid-template-columns:repeat(2,1fr)}.tp-item{padding:24px}}
    @media(max-width:480px){.tp-grid{grid-template-columns:1fr}.tp-header h1{font-size:clamp(32px,8vw,60px)}}
  `;

  return (
    <div className="tp">
      <style>{css}</style>
      <a href="/?skip=1" className="tp-back">&larr; HOME</a>
      <div className="tp-header">
        <h1>CORE TECHNOLOGIES</h1>
        <p>Engineering precision for heavy-duty environments. Our proprietary filtration modules are designed to extend equipment life cycles under the world's most severe operating conditions.</p>
      </div>

      <div className="tp-grid">
        {technologies.map((tech) => (
          <Link
            key={tech.slug}
            href={`/technologies/${tech.slug}`}
            className="tp-item"
          >
            <span className="tp-num">{tech.num}</span>
            <h2>{tech.name}</h2>
            <p>{tech.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
