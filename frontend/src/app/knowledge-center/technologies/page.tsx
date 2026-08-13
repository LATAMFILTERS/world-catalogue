import Link from 'next/link';
import { PUBLIC_TECHNOLOGIES } from '@/lib/public-taxonomy';

export default function TechnologiesPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/knowledge-center/" style={{ color: '#FFF12D' }}>Knowledge Center</Link>
        <h1>ELIMFILTERS Technology Registry</h1>
        <p>{PUBLIC_TECHNOLOGIES.length} canonical ELIMFILTERS technologies mapped to protection systems and technical standards.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginTop: '2rem' }}>
          {PUBLIC_TECHNOLOGIES.map((tech) => (
            <Link key={tech.slug} href={`/knowledge-center/technologies/${tech.slug}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{ border: '1px solid rgba(255,255,255,.12)', padding: '1.5rem', height: '100%' }}>
                <p>{tech.domain}</p><h2 style={{ color: '#FFF12D' }}>{tech.name}</h2><p>{tech.tagline}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'CollectionPage',name:'ELIMFILTERS Technology Registry',url:'https://elimfilters.com/knowledge-center/technologies/',numberOfItems:PUBLIC_TECHNOLOGIES.length,publisher:{'@id':'https://elimfilters.com/#organization'} }) }} />
    </main>
  );
}
