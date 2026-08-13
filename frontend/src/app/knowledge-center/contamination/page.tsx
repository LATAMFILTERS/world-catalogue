import Link from 'next/link';

const contaminationDomains = [
  { title: 'Particle Contamination', path: ['SOURCE', 'INGRESS', 'SURFACE', 'WEAR'], href: '/knowledge-center/engineering/contamination-control/' },
  { title: 'Water Contamination', path: ['STORAGE', 'WATER', 'FUEL', 'SYSTEM RISK'], href: '/knowledge-center/search/' },
  { title: 'Chemical Degradation', path: ['FLUID', 'DEGRADATION', 'DEPOSITS', 'CONTROL'], href: '/knowledge-center/search/' },
  { title: 'Biological Contamination', path: ['WATER', 'MICROBIAL GROWTH', 'BIOMASS', 'RESTRICTION'], href: '/knowledge-center/search/' },
] as const;

export default function ContaminationHubPage() {
  return <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
    <section style={{ maxWidth: '980px', margin: '0 auto' }}>
      <Link href="/knowledge-center/" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '.68rem' }}>← KNOWLEDGE CENTER</Link>
      <p style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '.7rem', letterSpacing: '.12em', marginTop: '2rem' }}>CONTAMINATION ENGINEERING</p>
      <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', lineHeight: 1.05, margin: '1rem 0' }}>Contamination Sources, Pathways &amp; Failure Mechanisms</h1>
      <p style={{ color: 'rgba(255,255,255,.62)', lineHeight: 1.75, maxWidth: '760px' }}>Understand how particles, water, chemical degradation and biological contamination enter a system, reach critical components and create failure risk. Each topic connects the source to the affected component and the corresponding protection strategy.</p>
    </section>

    <section style={{ maxWidth: '1100px', margin: '3rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
      {contaminationDomains.map(domain => <Link key={domain.title} href={domain.href} style={{ color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.4rem', minHeight: '190px' }}>
        <h2 style={{ fontSize: '1.1rem' }}>{domain.title}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem', alignItems: 'center', marginTop: '1.2rem', color: 'rgba(255,255,255,.62)', fontFamily: 'JetBrains Mono, monospace', fontSize: '.64rem' }}>{domain.path.map((step,index) => <span key={step} style={{ display: 'flex', gap: '.45rem' }}><b>{step}</b>{index < domain.path.length - 1 ? <span style={{ color: '#FFF12D' }}>→</span> : null}</span>)}</div>
        <p style={{ color: '#FFF12D', fontSize: '.75rem', marginTop: '1.4rem' }}>Explore technical knowledge →</p>
      </Link>)}
    </section>

    <section style={{ maxWidth: '1100px', margin: '3rem auto 0', borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: '2rem' }}>
      <p style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '.68rem', letterSpacing: '.1em' }}>MEASUREMENT REFERENCE</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}><Link href="/knowledge-center/standards/iso-4406/" style={{ color: '#fff' }}>ISO 4406 — Cleanliness classification</Link><Link href="/knowledge-center/standards/iso-16889/" style={{ color: '#fff' }}>ISO 16889 — Filter performance</Link><Link href="/knowledge-center/standards/iso-5011/" style={{ color: '#fff' }}>ISO 5011 — Air cleaner performance</Link></div>
    </section>

    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'CollectionPage',name:'Contamination Engineering — ELIMFILTERS Knowledge Center',description:'Engineering reference for particle, water, chemical and biological contamination pathways and protection strategies.',url:'https://elimfilters.com/knowledge-center/contamination/',publisher:{'@id':'https://elimfilters.com/#organization'} }) }} />
  </main>;
}
