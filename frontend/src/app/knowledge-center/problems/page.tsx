import Link from 'next/link';
import { PROBLEM_STUBS, PROBLEM_CATEGORY_LABELS } from '@/lib/knowledge-center';
import type { ProblemCategory } from '@/lib/knowledge-center';

const categories: ProblemCategory[] = ['mechanical-wear','contamination','structural-failure','chemical-degradation','biological'];
const descriptions: Record<ProblemCategory,string> = {
  'mechanical-wear': 'Surface degradation caused by particle interaction, lubrication breakdown and loaded contact.',
  contamination: 'Particles, water and foreign material entering or accumulating in protected circuits.',
  'structural-failure': 'Mechanical damage associated with pressure, fatigue, restriction or component loading.',
  'chemical-degradation': 'Changes in fluid chemistry that create deposits, corrosion, instability or loss of protective properties.',
  biological: 'Microbial growth and biomass formation in fuel or fluid systems where water and nutrients are present.',
};

export default function ProblemsPage() {
  return <main style={{ background:'#000', color:'#fff', minHeight:'100vh', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
    <section style={{ maxWidth:'940px', margin:'0 auto' }}>
      <Link href="/knowledge-center/" style={{ color:'rgba(255,255,255,.45)', textDecoration:'none', fontFamily:'JetBrains Mono, monospace', fontSize:'.68rem' }}>← KNOWLEDGE CENTER</Link>
      <p style={{ color:'#FFF12D', fontFamily:'JetBrains Mono, monospace', fontSize:'.7rem', letterSpacing:'.12em', marginTop:'2rem' }}>FAILURE ENGINEERING</p>
      <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.8rem)', lineHeight:1.05, margin:'1rem 0' }}>Understand the Failure</h1>
      <p style={{ color:'rgba(255,255,255,.62)', lineHeight:1.75, maxWidth:'760px' }}>Start with the failure mechanism, identify the contamination source, determine the component affected and connect the problem to an appropriate protection strategy.</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem', marginTop:'1.4rem', alignItems:'center', fontFamily:'JetBrains Mono, monospace', fontSize:'.68rem' }}>{['FAILURE MECHANISM','CONTAMINATION SOURCE','COMPONENT AFFECTED','PROTECTION STRATEGY'].map((step,index)=><span key={step} style={{ display:'flex', gap:'.5rem' }}><b>{step}</b>{index<3?<span style={{ color:'#FFF12D' }}>→</span>:null}</span>)}</div>
    </section>

    <section style={{ maxWidth:'1100px', margin:'3rem auto 0', display:'grid', gap:'2.6rem' }}>
      {categories.map(category => {
        const problems = PROBLEM_STUBS.filter(problem => problem.category === category);
        return <article key={category}>
          <div style={{ borderBottom:'1px solid rgba(255,255,255,.1)', paddingBottom:'.8rem' }}><h2 style={{ margin:0 }}>{PROBLEM_CATEGORY_LABELS[category]}</h2><p style={{ color:'rgba(255,255,255,.48)', lineHeight:1.6, maxWidth:'760px' }}>{descriptions[category]}</p></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'.7rem', marginTop:'1rem' }}>{problems.map(problem => <div key={problem.slug} style={{ border:'1px solid rgba(255,255,255,.08)', background:'#050505', padding:'1rem 1.15rem' }}><strong style={{ display:'block', fontSize:'.95rem' }}>{problem.name}</strong><span style={{ display:'block', color:'rgba(255,255,255,.4)', fontFamily:'JetBrains Mono, monospace', fontSize:'.6rem', marginTop:'.7rem' }}>CAUSES → COMPONENTS → DETECTION → PROTECTION</span></div>)}</div>
        </article>;
      })}
    </section>

    <section style={{ maxWidth:'1100px', margin:'3rem auto 0', borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:'2rem' }}><p style={{ color:'rgba(255,255,255,.58)', lineHeight:1.7 }}>Use Engineering Search to connect a symptom or failure mechanism with standards, systems, contamination topics and validated ELIMFILTERS technical references.</p><Link href="/knowledge-center/search/" style={{ color:'#FFF12D', fontWeight:700, textDecoration:'none' }}>Search engineering knowledge →</Link></section>

    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'CollectionPage',name:'Industrial Failure Engineering — ELIMFILTERS Knowledge Center',description:'Failure mechanisms organized by causes, contamination sources, affected components, detection and protection strategy.',url:'https://elimfilters.com/knowledge-center/problems/',publisher:{'@id':'https://elimfilters.com/#organization'} }) }} />
  </main>;
}
