import Link from 'next/link';
import { getPublishedTerms, termIdToSlug, TERM_CATEGORY_LABELS } from '@/lib/knowledge-center';
import type { TermCategory } from '@/lib/knowledge-center';

export default function GlossaryPage() {
  const terms = getPublishedTerms();
  const categories = (Object.keys(TERM_CATEGORY_LABELS) as TermCategory[]).filter((category) => terms.some((term) => term.category === category));

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)' }}>
      <section style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/knowledge-center/" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}>← KNOWLEDGE CENTER</Link>
        <p style={{ color: '#FFF12D', letterSpacing: '.12em', marginTop: '2rem' }}>TECHNICAL GLOSSARY</p>
        <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', margin: '1rem 0' }}>Controlled Engineering Terminology</h1>
        <p style={{ color: 'rgba(255,255,255,.62)', lineHeight: 1.75, maxWidth: '760px' }}>{terms.length} governed filtration and contamination-control terms used consistently across ELIMFILTERS technical content.</p>
        <Link href="/knowledge-center/search/" style={{ color: '#FFF12D', textDecoration: 'none', fontWeight: 700 }}>Search technical terminology →</Link>
      </section>

      <section style={{ maxWidth: '1000px', margin: '3rem auto 0' }}>
        {categories.map((category) => {
          const categoryTerms = terms.filter((term) => term.category === category);
          return (
            <article key={category} style={{ marginBottom: '3rem' }}>
              <h2 style={{ borderBottom: '1px solid rgba(255,255,255,.1)', paddingBottom: '.7rem' }}>{TERM_CATEGORY_LABELS[category]}</h2>
              <div style={{ display: 'grid', gap: '.5rem' }}>
                {categoryTerms.map((term) => (
                  <Link key={term.id} href={`/knowledge-center/glossary/${termIdToSlug(term.id)}/`} style={{ color: '#fff', textDecoration: 'none', borderLeft: '2px solid rgba(255,241,45,.35)', background: '#050505', padding: '1rem 1.2rem' }}>
                    <strong style={{ display: 'block', marginBottom: '.35rem' }}>{term.term}</strong>
                    <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.86rem', lineHeight: 1.55, margin: 0 }}>{term.definition}</p>
                    {term.aliases.length ? <small style={{ display: 'block', color: 'rgba(255,255,255,.3)', marginTop: '.5rem' }}>Also referenced as: {term.aliases.slice(0, 3).join(' · ')}</small> : null}
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
