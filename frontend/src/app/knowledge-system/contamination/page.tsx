'use client';

import Link from 'next/link';

import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const CONTAMINATION_TYPES = [
  {
    code: 'WATER',
    title: 'Diesel Water Contamination',
    href: '/knowledge-system/contamination/diesel-water',
    description: 'Free, emulsified, and sedimentary water ingress mechanisms, corrosion pathways, and microbial proliferation in fuel systems.',
    icon: '💧',
  },
  {
    code: 'PARTICLE',
    title: 'Particle Wear in Engines',
    href: '/knowledge-system/contamination/particle-wear',
    description: 'Abrasive contamination accumulation, three-body wear mechanisms, and degradation progression in combustion environments.',
    icon: '⚙',
  },
  {
    code: 'HYDRAULIC',
    title: 'Hydraulic System Contamination',
    href: '/knowledge-system/contamination/hydraulic-system',
    description: 'Component stiction, seal degradation, and catastrophic failure modes in pressurized fluid systems.',
    icon: '⚡',
  },
  {
    code: 'VARNISH',
    title: 'Varnish Formation',
    href: '/knowledge-system/contamination/varnish-formation',
    description: 'Thermal and oxidative fluid degradation producing insoluble deposits on valve and bearing surfaces, diagnosed via ASTM D7527 Membrane Patch Colorimetry.',
    icon: '🔥',
  },
];

export default function ContaminationHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Back */}
      <Link href="/knowledge-system"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← KNOWLEDGE</Link>

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}
        >
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}>
            Contamination & Failure Modes
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Root cause analysis of contamination-induced failures in industrial filtration systems.
          </p>
        </motion.div>
      </section>

      {/* Intro Context */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            textAlign: 'justify',
          }}>
            Contamination is the primary driver of industrial equipment failure. Understanding how specific contaminants enter systems and degrade components is the foundation of effective asset protection. Case studies such as <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>particle wear in engines</Link> document the abrasive wear progression that reduces bearing life from 15,000+ hours to under 3,000 hours when contamination control fails. These failure mechanisms are governed by measurement standards outlined in the <Link href="/knowledge-system/standards/lube-oil-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>lube oil filtration systems</Link> domain.
          </p>
        </motion.div>
      </section>

      {/* Contamination Types List */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
          gap: '1.75rem',
        }}>
          {CONTAMINATION_TYPES.map((contam, i) => (
            <motion.div
              key={contam.code}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={contam.href} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '2rem',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                  }}
                >
                  {/* Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#FFF12D',
                      letterSpacing: '0.05em',
                    }}>
                      {contam.code}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.4,
                  }}>
                    {contam.title}
                  </h2>

                  {/* Description */}
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                    marginTop: 'auto',
                  }}>
                    {contam.description}
                  </p>

                  {/* Arrow */}
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,241,45,0.4)',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em',
                  }}>
                    READ MORE →
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Contamination Failure Mechanisms [PRIMARY] | Root Cause Failure Analysis [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, hydraulic, fuel, lube, air_intake</p>
        <p>CONCEPT_TAXONOMY: type=hub | domain=failure-mechanism-case-studies | scope=particle-water-hydraulic-varnish</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406, ASTM D6304</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear, /knowledge-system/contamination/diesel-water, /knowledge-system/contamination/hydraulic-system, /knowledge-system/contamination/varnish-formation</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, HYDROCORE, SYNTRAX</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/contamination</p>
        <p>&nbsp;&nbsp;concept_id: contamination-failure-hub</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/contamination',
        headline: 'Contamination & Failure Modes',
        description: 'Root cause analysis of contamination-induced failures in industrial filtration systems, covering particle wear in engines, diesel water contamination, and hydraulic system contamination.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['contamination failure modes', 'particle wear', 'diesel water contamination', 'hydraulic contamination', 'ISO 16889', 'ISO 4406', 'industrial filtration', 'asset protection'],
        about: { '@type': 'Thing', name: 'Industrial Contamination & Failure Modes', description: 'Technical case studies of contamination-induced equipment failures in industrial filtration systems.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Contamination & Failure Modes', item: 'https://elimfilters.com/knowledge-system/contamination' },
        ],
      }) }} />

    </main>
  );
}
