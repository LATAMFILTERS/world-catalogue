'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_TECHNOLOGIES } from '@/lib/knowledge-center-data';

export default function TechnologiesPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <Link href="/knowledge-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>← KNOWLEDGE CENTER</Link>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#FFF12D', marginBottom: '1rem' }}>05 / FILTRATION TECHNOLOGIES</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.15, textAlign: 'justify', marginBottom: '1.25rem' }}>ELIMFILTERS Technology Registry</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, textAlign: 'justify', color: 'rgba(255,255,255,0.6)', maxWidth: '620px' }}>
            Ten canonical core filtration technologies engineered for specific contamination domains. Each technology is mapped to the contamination modes it controls, the technical standards referenced where applicable, and the industrial protection system it supports.
          </motion.p>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
        {KC_TECHNOLOGIES.map((tech, i) => (
          <motion.div key={tech.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
            <Link href={`/knowledge-center/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ background: 'rgba(255,241,45,0.035)', borderLeftColor: '#FFF12D' }} style={{ background: '#000', padding: '2rem', borderLeft: '3px solid transparent', transition: 'background 0.2s, border-left-color 0.2s', height: '100%' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{tech.domain}</p>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>{tech.name}</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'justify', color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem' }}>{tech.tagline}</p>
                {tech.performanceSpecs.length > 0 && <div style={{ marginBottom: '1rem' }}><p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>GOVERNED SPEC</p><p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', fontWeight: 700 }}>{tech.performanceSpecs[0].value}<span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginLeft: '0.4rem' }}>{tech.performanceSpecs[0].label}</span></p></div>}
                {tech.standards.length > 0 && <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>{tech.standards.map((s) => <span key={s} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.4rem', border: '1px solid rgba(255,255,255,0.07)' }}>{s}</span>)}</div>}
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': 'https://elimfilters.com/knowledge-center/technologies/#collection',
        name: 'ELIMFILTERS Technology Registry — Filtration Technologies',
        description: 'Ten canonical core ELIMFILTERS filtration technologies mapped to contamination domains, technical standards where applicable, and industrial protection systems.',
        url: 'https://elimfilters.com/knowledge-center/technologies/', isPartOf: { '@id': 'https://elimfilters.com/knowledge-center/#collection' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
      })}} />
    </main>
  );
}
