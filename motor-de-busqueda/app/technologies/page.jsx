'use client';
import Link from 'next/link';
const WP = 'https://elimfilters.com/wp-content/uploads';

const technologies = [
  { num: '01', name: 'MACROCORE', slug: 'macrocore', desc: 'Heavy-duty air intake protection.' },
  { num: '02', name: 'SYNTRAX', slug: 'syntrax', desc: 'Synthetic micro-glass lubrication.' },
  { num: '03', name: 'NANOFORCE', slug: 'nanoforce', desc: 'Multi-stage fuel filtration.' },
  { num: '04', name: 'SYNTEPORE', slug: 'syntepore', desc: 'Reinforced hydraulic mesh.' },
  { num: '05', name: 'MICROKAPPA', slug: 'microkappa', desc: 'Dual-layer cabin air filtration.' },
  { num: '06', name: 'COOLTECH', slug: 'cooltech', desc: 'Thermal cavitation protection.' },
  { num: '07', name: 'AQUAGUARD', slug: 'aquaguard', desc: 'Hydrophobic water separation.' },
  { num: '08', name: 'DRYCORE', slug: 'drycore', desc: 'Molecular air dryer tech.' },
  { num: '09', name: 'INTEKCORE', slug: 'intekcore', desc: 'Leak-proof housing seal.' },
  { num: '10', name: 'DURATECH', slug: 'duratech', desc: 'Optimized maintenance kits.' },
  { num: '11', name: 'AQUAGUARD SERIES', slug: 'aquaguard-series', desc: 'Advanced turbine fuel tech.' },
  { num: '12', name: 'MARINECLEAN', slug: 'marineclean', desc: 'Corrosion-resistant marine tech.' }
];

export default function Technologies() {
  const css = \
    .tp { background:#000; color:#fff; min-height:100vh; font-family: sans-serif; }
    .tp-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1px; background: rgba(255,255,255,0.1); }
    .tp-item { background:#000; padding: 40px; text-decoration:none; color:#fff; transition: 0.3s; }
    .tp-item:hover { background:#111; color:#FFF12D; }
    .tp-back { position:fixed; top:20px; right:20px; color:#FFF12D; text-decoration:none; font-family:monospace; z-index:100; }
  \;
  return (
    <div className="tp">
      <style>{css}</style>
      <Link href="/" className="tp-back">← BACK TO SEARCH</Link>
      <h1 style={{padding:'80px 6% 40px', fontSize:'60px', fontFamily:'sans-serif'}}>TECHNOLOGIES</h1>
      <div className="tp-grid">
        {technologies.map(t => (
          <Link key={t.slug} href={\/technologies/\\} className="tp-item">
            <div style={{color:'#FFF12D', marginBottom:'10px'}}>{t.num}</div>
            <h2 style={{fontSize:'24px', marginBottom:'10px'}}>{t.name}™</h2>
            <p style={{color:'#888', fontSize:'14px'}}>{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}


