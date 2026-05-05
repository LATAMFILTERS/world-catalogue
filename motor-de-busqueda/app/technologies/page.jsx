'use client';
import Link from 'next/link';

const technologies = [
  { num: '01', name: 'MACROCORE', slug: 'macrocore', desc: 'Heavy-duty structural reinforcement preventing media migration.' },
  { num: '02', name: 'SYNTRAX', slug: 'syntrax', desc: 'AI-developed hybrid of synthetic material and cellulose.' },
  { num: '03', name: 'NANOFORCE', slug: 'nanoforce', desc: 'Multi-stage depth filtration engineered for HPCR systems.' },
  { num: '04', name: 'SYNTEPORE', slug: 'syntepore', desc: 'Reinforced synthetic mesh for high-pressure spikes.' },
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
  return (
    <div style={{ background:'#000', color:'#fff', minHeight:'100vh', fontFamily:'sans-serif' }}>
      <style>{\
        .tp-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1px; background: rgba(255,255,255,0.1); }
        .tp-item { background:#000; padding: 40px; text-decoration:none; color:#fff; transition: 0.3s; border-bottom: 1px solid #222; }
        .tp-item:hover { background:#111; }
        .tp-item:hover h2 { color:#FFF12D; }
      \}</style>
      
      <div style={{ padding: '80px 6% 10px' }}>
        <h1 style={{ fontSize:'60px', fontWeight:'900', textTransform:'uppercase', lineHeight:'1' }}>CORE TECHNOLOGIES</h1>
        <p style={{ color:'#888', maxWidth:'800px', fontSize:'18px', marginTop:'20px' }}>
          Engineering precision for heavy-duty environments. Our proprietary filtration modules are designed to extend equipment life cycles under the world's most severe operating conditions.
        </p>
      </div>

      <div className="tp-grid">
        {technologies.map(t => (
          <Link key={t.slug} href={\/technologies/\\} className="tp-item">
            <div style={{ color:'#FFF12D', marginBottom:'10px', fontFamily:'monospace' }}>{t.num}</div>
            <h2 style={{ fontSize:'24px', marginBottom:'10px', fontWeight:'700' }}>{t.name}™</h2>
            <p style={{ color:'#666', fontSize:'14px', lineHeight:'1.4' }}>{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
