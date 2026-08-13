import Link from 'next/link';
import { ENGINEERING_DIAGRAMS } from '@/lib/knowledge-center-data';

const labels: Record<string,string> = {
  flow: 'FLOW DIAGRAM',
  schematic: 'SCHEMATIC',
  'cross-section': 'CROSS-SECTION',
  system: 'SYSTEM DIAGRAM',
  process: 'PROCESS DIAGRAM',
  chart: 'CHART',
};

export default function DiagramsHubPage() {
  return (
    <main style={{ background:'#000', color:'#fff', minHeight:'100vh', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
      <section style={{ maxWidth:'920px', margin:'0 auto' }}>
        <Link href="/knowledge-center/" style={{ color:'rgba(255,255,255,.45)', textDecoration:'none' }}>← KNOWLEDGE CENTER</Link>
        <p style={{ color:'#FFF12D', fontFamily:'JetBrains Mono, monospace', fontSize:'.7rem', letterSpacing:'.12em', marginTop:'2rem' }}>TECHNICAL VISUAL LIBRARY</p>
        <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', lineHeight:1.05, margin:'1rem 0' }}>Engineering Diagrams &amp; Measurement References</h1>
        <p style={{ color:'rgba(255,255,255,.62)', lineHeight:1.75, maxWidth:'760px' }}>Visual references for filtration systems, contamination pathways, test methods, failure mechanisms and measurement concepts. Graphics use controlled engineering terminology and short technical labels to reduce ambiguity across languages and channels.</p>
      </section>

      <section style={{ maxWidth:'1100px', margin:'3rem auto 0', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'.8rem' }}>
        {ENGINEERING_DIAGRAMS.map((diagram) => (
          <Link key={diagram.entityId} href={`/knowledge-center/diagrams/${diagram.slug}/`} style={{ color:'#fff', textDecoration:'none', border:'1px solid rgba(255,255,255,.09)', background:'#050505', padding:'1.3rem', minHeight:'190px', display:'flex', flexDirection:'column' }}>
            <span style={{ color:'#FFF12D', fontFamily:'JetBrains Mono, monospace', fontSize:'.6rem', letterSpacing:'.08em' }}>{labels[diagram.diagramType] ?? diagram.diagramType.toUpperCase()}</span>
            <h2 style={{ fontSize:'1.08rem', lineHeight:1.35, margin:'1rem 0 .6rem' }}>{diagram.title}</h2>
            <p style={{ color:'rgba(255,255,255,.48)', fontSize:'.84rem', lineHeight:1.6 }}>{diagram.engineeringPurpose}</p>
            <div aria-hidden="true" style={{ marginTop:'auto', paddingTop:'1rem' }}><div style={{ height:'1px', background:'rgba(255,255,255,.24)' }} /><div style={{ height:'1px', width:'68%', background:'rgba(255,241,45,.55)', marginTop:'.45rem' }} /></div>
          </Link>
        ))}
      </section>
    </main>
  );
}
