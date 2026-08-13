import Link from 'next/link';
import { PUBLIC_SYSTEMS } from '@/lib/public-taxonomy';

export default function SystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,4vw,4rem)' }}>
      <section style={{ maxWidth: '920px', margin: '0 auto 3rem' }}>
        <Link href="/knowledge-center/" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>← KNOWLEDGE CENTER</Link>
        <p style={{ color: '#FFF12D', marginTop: '2rem', letterSpacing: '.12em' }}>03 / PROTECTION SYSTEMS</p>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)', margin: '.8rem 0 1rem' }}>ELIMFILTERS Protection Systems</h1>
        <p style={{ color: 'rgba(255,255,255,.68)', lineHeight: 1.75 }}>
          {PUBLIC_SYSTEMS.length} canonical asset-protection systems form the public ELIMFILTERS architecture. Cabin air, compressed-air drying, housings and engine intake are governed inside Air Intake &amp; Airflow Protection rather than published as conflicting standalone domains.
        </p>
      </section>

      <section style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1rem' }}>
        {PUBLIC_SYSTEMS.map((system) => (
          <Link key={system.slug} href={`/knowledge-center/systems/${system.slug}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article style={{ height: '100%', border: '1px solid rgba(255,255,255,.1)', padding: '1.6rem', background: '#050505' }}>
              <h2 style={{ color: '#fff', marginBottom: '.8rem' }}>{system.title}</h2>
              <p style={{ color: 'rgba(255,255,255,.62)', lineHeight: 1.65 }}>{system.description}</p>
              <p style={{ color: '#FFF12D', marginTop: '1.2rem', fontSize: '.85rem' }}>{system.technologies.join(' · ')}</p>
            </article>
          </Link>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'ELIMFILTERS Protection Systems',
        description: `${PUBLIC_SYSTEMS.length} canonical industrial asset-protection systems mapped to contamination targets, standards and ELIMFILTERS technologies.`,
        url: 'https://elimfilters.com/knowledge-center/systems/',
        publisher: { '@id': 'https://elimfilters.com/#organization' },
        mainEntity: { '@type': 'ItemList', itemListElement: PUBLIC_SYSTEMS.map((s, index) => ({ '@type': 'ListItem', position: index + 1, name: s.title, url: `https://elimfilters.com/knowledge-center/systems/${s.slug}/` })) },
      }) }} />
    </main>
  );
}
