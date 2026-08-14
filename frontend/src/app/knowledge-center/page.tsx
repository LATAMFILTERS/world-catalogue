'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ASSET_PROTECTION_INTELLIGENCE } from '@/lib/asset-protection-intelligence';

const KNOWLEDGE_SECTIONS = [
  { id: 'standards', title: 'Industrial Standards', description: 'Governed technical standards and measurement frameworks for industrial filtration and contamination control.', href: '/knowledge-center/standards', count: 'Standards', color: 'rgba(63,81,181,0.1)' },
  { id: 'contamination', title: 'Contamination Control', description: 'Root-cause knowledge covering particles, water, restriction, degradation and failure mechanisms.', href: '/knowledge-center/contamination', count: 'Diagnostics', color: 'rgba(255,152,0,0.1)' },
  { id: 'technologies', title: 'Protection Technologies', description: 'Canonical ELIMFILTERS technology architectures and the engineering problems each technology is designed to control.', href: '/knowledge-center/technologies', count: '9 core technologies', color: 'rgba(76,175,80,0.1)' },
  { id: 'fleet', title: 'Fleet Optimization', description: 'Reliability, service-life and total-cost strategies for fleets and critical equipment operations.', href: '/knowledge-center/fleet-optimization', count: 'Operations', color: 'rgba(33,150,243,0.1)' },
  { id: 'industries', title: 'Industry Intelligence', description: 'Asset-protection context for agriculture, mining, construction, marine, power generation and other critical industries.', href: '/industries', count: '12 industries', color: 'rgba(233,30,99,0.1)' },
  { id: 'glossary', title: 'Technical Glossary', description: 'Shared terminology for filtration, contamination, reliability, standards and asset protection.', href: '/knowledge-center/glossary', count: 'Reference', color: 'rgba(121,85,72,0.1)' },
];

export default function KnowledgeCenterPage() {
  const architecture = ASSET_PROTECTION_INTELLIGENCE;

  return (
    <>
      <Navigation />
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
        <section style={{
          padding: 'clamp(6rem, 12vw, 10rem) clamp(1.25rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.5) 100%), linear-gradient(180deg, rgba(63,81,181,0.1) 0%, transparent 50%)',
          borderBottom: '1px solid rgba(255,241,45,0.1)',
        }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FFF12D', marginBottom: '1.5rem', fontWeight: 600 }}>
                {`// ${architecture.platform} / GOVERNED KNOWLEDGE`}
              </p>
              <h1 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', textTransform: 'uppercase', lineHeight: 1.05, marginBottom: '1.75rem', maxWidth: '940px' }}>
                Knowledge that strengthens asset-protection decisions.
              </h1>
              <p style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(1.15rem, 2.3vw, 1.5rem)', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: '860px', marginBottom: '1.5rem' }}>
                ELIMFILTERS connects reviewed technical knowledge, product intelligence and continuously discovered evidence without confusing discovery with authority.
              </p>
              <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.12rem)', lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', maxWidth: '900px' }}>
                HERMES identifies new evidence and knowledge gaps. The governed knowledge layer preserves reviewed technical memory. The World Catalogue remains the authority for ELIMFILTERS product data and SKU relationships.
              </p>
            </motion.div>
          </div>
        </section>

        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                ['HERMES', 'DISCOVERY', 'Finds and routes new external evidence into governed review.'],
                ['OBSIDIAN', 'SECOND BRAIN', 'Structures reviewed institutional and technical knowledge.'],
                ['WORLD CATALOGUE', 'PRODUCT AUTHORITY', 'Authorizes ELIMFILTERS SKU, applications, dimensions and cross-references.'],
                ['PART SEARCH', 'PRODUCT INTELLIGENCE', 'Turns validated catalogue data into fast technical discovery.'],
              ].map(([name, role, body]) => (
                <article key={name} style={{ padding: '1.3rem', background: '#050505', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.66rem', letterSpacing: '0.12em', margin: '0 0 0.65rem' }}>{role}</p>
                  <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: '1.05rem', margin: '0 0 0.55rem' }}>{name}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 5vw, 4rem)', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem' }}>
            {KNOWLEDGE_SECTIONS.map((section, idx) => (
              <motion.article key={section.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5, delay: idx * 0.05 }} style={{ background: section.color, border: '1px solid rgba(255,241,45,0.15)', padding: 'clamp(1.7rem, 3vw, 2.2rem)', display: 'flex', flexDirection: 'column', minHeight: '245px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFF12D', fontWeight: 600 }}>{section.count}</span>
                <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: '1.45rem', margin: '1rem 0 0.8rem' }}>{section.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.65, margin: 0 }}>{section.description}</p>
                <Link href={section.href} style={{ color: '#FFF12D', textDecoration: 'none', fontWeight: 700, marginTop: 'auto', paddingTop: '1.4rem' }}>Explore →</Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 5vw, 4rem)', borderTop: '1px solid rgba(255,241,45,0.1)', textAlign: 'center' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <p style={{ color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Safety. Reliability. Efficiency.</p>
            <h2 style={{ fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.7rem)', textTransform: 'uppercase', margin: '1rem 0 1.5rem' }}>
              Move from knowledge to the right product decision.
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={{ background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.82rem', padding: '1rem 1.5rem', textTransform: 'uppercase' }}>Search Product Intelligence</a>
              <Link href="/distributors" style={{ border: '1px solid rgba(255,241,45,0.4)', color: '#FFF12D', textDecoration: 'none', fontFamily: 'Chakra Petch, Barlow, Arial, sans-serif', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.82rem', padding: '1rem 1.5rem', textTransform: 'uppercase' }}>Global Network</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://elimfilters.com/knowledge-center/#collection',
          name: 'ELIMFILTERS Asset Protection Intelligence Knowledge Center',
          description: 'Governed technical knowledge, product intelligence and industrial asset protection resources from ELIMFILTERS.',
          url: 'https://elimfilters.com/knowledge-center/',
          isPartOf: { '@id': 'https://elimfilters.com/#website' },
          publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        })}
      </script>
    </>
  );
}