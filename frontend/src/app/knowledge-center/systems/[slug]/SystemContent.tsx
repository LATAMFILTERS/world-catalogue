import Link from 'next/link';
import type { KCSystemDetail } from '@/lib/knowledge-center-data';
import type { PublicSystem } from '@/lib/public-systems';

const standardRoutes: Record<string,string> = {
  'ISO 16889': 'iso-16889',
  'ISO 5011': 'iso-5011',
  'ISO 4406': 'iso-4406',
  'NAS 1638': 'nas-1638',
  'SAE J1858': 'sae-j1858',
  'ISO 8573-1': 'iso-8573-1',
  'ISO 12937': 'iso-12937',
  'ISO 11155': 'iso-11155',
  'ASTM D6304': 'astm-d6304',
  'ASTM D6210': 'astm-d6210',
  'ISO 16332': 'iso-16332',
};

const technologyRoutes: Record<string,string> = {
  'MACROCORE™': 'macrocore',
  'MICROKAPPA™': 'microkappa',
  'DRYCORE™': 'drycore',
  'INTEKCORE™': 'intekcore',
  'SYNTAPORE™': 'syntapore',
  'TURBOCORE™': 'turbocore',
  'THERMACORE™': 'thermacore',
  'SYNTRAX™': 'syntrax',
  'NANOFORCE™': 'nanoforce',
};

export default function SystemContent({ system, detail }: { system: PublicSystem; detail: KCSystemDetail | null }) {
  return (
    <main style={{ background:'#000', color:'#fff', minHeight:'100vh', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
      <section style={{ maxWidth:'980px', margin:'0 auto' }}>
        <nav style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', fontSize:'.7rem' }}><Link href="/knowledge-center/" style={{ color:'rgba(255,255,255,.4)', textDecoration:'none' }}>KNOWLEDGE CENTER</Link><span>›</span><Link href="/knowledge-center/systems/" style={{ color:'rgba(255,255,255,.4)', textDecoration:'none' }}>SYSTEMS</Link></nav>
        <p style={{ color:'#FFF12D', fontFamily:'JetBrains Mono, monospace', fontSize:'.68rem', letterSpacing:'.1em', marginTop:'2rem' }}>PROTECTION SYSTEM</p>
        <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', lineHeight:1.05, margin:'1rem 0' }}>{system.title}</h1>
        <p style={{ color:'rgba(255,255,255,.64)', lineHeight:1.75, maxWidth:'780px' }}>{system.description}</p>
      </section>

      {detail ? <>
        <section style={{ maxWidth:'980px', margin:'2.5rem auto 0', border:'1px solid rgba(255,255,255,.1)', background:'#050505', padding:'1.5rem' }}><p style={{ color:'#FFF12D', fontFamily:'JetBrains Mono, monospace', fontSize:'.64rem', letterSpacing:'.1em' }}>FAILURE MECHANISM</p><p style={{ color:'rgba(255,255,255,.68)', lineHeight:1.75 }}>{detail.failureMechanism}</p></section>
        <section style={{ maxWidth:'980px', margin:'2.5rem auto 0', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'.7rem' }}>{detail.keyMetrics.map((metric)=><div key={metric.label} style={{ borderTop:'2px solid #FFF12D', background:'#050505', padding:'1.15rem' }}><strong style={{ display:'block', color:'#FFF12D', marginBottom:'.4rem' }}>{metric.value}</strong><span style={{ color:'rgba(255,255,255,.46)', fontSize:'.78rem' }}>{metric.label}</span></div>)}</section>
        <section style={{ maxWidth:'980px', margin:'2.5rem auto 0' }}><h2>Contamination Target</h2><p style={{ color:'rgba(255,255,255,.66)', lineHeight:1.75 }}>{detail.contaminationTarget}</p><div style={{ marginTop:'1rem', borderLeft:'2px solid #FFF12D', paddingLeft:'1rem' }}><strong style={{ display:'block', color:'#FFF12D', fontSize:'.72rem' }}>ENGINEERING BASIS</strong><p style={{ color:'rgba(255,255,255,.56)', lineHeight:1.65 }}>{detail.targetCleanliness}</p></div></section>
        {detail.sections.map((section)=><section key={section.heading} style={{ maxWidth:'980px', margin:'2.5rem auto 0', borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:'1.5rem' }}><h2>{section.heading}</h2><p style={{ color:'rgba(255,255,255,.66)', lineHeight:1.8 }}>{section.body}</p></section>)}
      </> : null}

      <section style={{ maxWidth:'980px', margin:'3rem auto 0', borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:'2rem' }}><p style={{ color:'#FFF12D', fontFamily:'JetBrains Mono, monospace', fontSize:'.65rem' }}>ELIMFILTERS TECHNOLOGIES</p><div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem', marginTop:'1rem' }}>{system.technologies.map((technology)=><Link key={technology} href={`/knowledge-center/technologies/${technologyRoutes[technology]}/`} style={{ color:'#fff', textDecoration:'none', border:'1px solid rgba(255,255,255,.12)', padding:'.55rem .75rem' }}>{technology}</Link>)}</div></section>

      <section style={{ maxWidth:'980px', margin:'2rem auto 0' }}><p style={{ color:'#FFF12D', fontFamily:'JetBrains Mono, monospace', fontSize:'.65rem' }}>TECHNICAL REFERENCES</p><div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem', marginTop:'1rem' }}>{system.standards.map((standard)=>{const slug=standardRoutes[standard];return slug?<Link key={standard} href={`/knowledge-center/standards/${slug}/`} style={{ color:'rgba(255,255,255,.75)', textDecoration:'none' }}>{standard}</Link>:<span key={standard} style={{ color:'rgba(255,255,255,.75)' }}>{standard}</span>;})}</div></section>
    </main>
  );
}
