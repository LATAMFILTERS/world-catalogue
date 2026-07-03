'use client';

import Link from 'next/link';

import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const BRIDGE_PAGES = [
  {
    title: 'Industrial Filtration Selection',
    slug: 'industrial-filtration',
    description: 'Framework for evaluating filtration solutions across industrial applications. Understanding equipment protection requirements beyond filter product specifications.',
    icon: '🏭',
    href: '/knowledge-system/bridges/industrial-filtration',
  },
  {
    title: 'OEM Filter Replacement',
    slug: 'oem-replacement',
    description: 'Strategic approach to OEM filter selection and equivalent product evaluation. When OEM compliance matters and when system design is paramount.',
    icon: '🔄',
    href: '/knowledge-system/bridges/oem-replacement',
  },
  {
    title: 'Aftermarket Filter Strategy',
    slug: 'aftermarket-selection',
    description: 'Evaluating aftermarket filtration options through a system-level lens. Cost optimization without compromising equipment reliability.',
    icon: '⚙',
    href: '/knowledge-system/bridges/aftermarket-selection',
  },
  {
    title: 'Fleet Filtration Solutions',
    slug: 'fleet-solutions',
    description: 'Designing filtration strategies for fleet operations. Managing multiple equipment types, standardization, and lifecycle cost optimization.',
    icon: '🚚',
    href: '/knowledge-system/bridges/fleet-solutions',
  },
];

export default function BridgesHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <Link href="/knowledge-system"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← KNOWLEDGE SYSTEM</Link>

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
            From Product Selection to System Design
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Framework pages for evaluating filtration solutions from a system-level asset protection perspective.
          </p>
        </motion.div>
      </section>

      {/* Context Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ maxWidth: '900px', margin: '0 auto', padding: '0 0' }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            marginBottom: '1.5rem',
            textAlign: 'justify',
          }}>
            Industrial filter selection typically begins with a product-focused question: "Which filter brand should we use?" or "What's the OEM requirement?" or "What aftermarket filters are available?"
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            marginBottom: '1.5rem',
            textAlign: 'justify',
          }}>
            These pages bridge that product-selection thinking into system-level design. They reframe the filtration decision from "which filter product" into "how do we achieve contamination control and equipment asset protection?" The <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Industrial Filtration Selection</Link> framework provides the foundational model for evaluating filtration across all application domains.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            textAlign: 'justify',
          }}>
            Each page follows the same decision model: understand the traditional approach, identify its limitations, introduce system-level thinking, map technologies to application domains, and integrate relevant standards. The result is a framework for filtration decision-making that optimizes for equipment reliability and lifecycle cost, not product commodity selection. Fleet operations applying this approach can achieve measurable reductions in unplanned stoppages—see <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Reducing Fleet Downtime</Link> for operational impact analysis.
          </p>
        </motion.div>
      </section>

      {/* Bridge Pages */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
          gap: '1.75rem',
        }}>
          {BRIDGE_PAGES.map((page, i) => (
            <motion.div
              key={page.slug}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={page.href} style={{ textDecoration: 'none', display: 'block' }}>
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

                  <h2 style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.4,
                  }}>
                    {page.title}
                  </h2>

                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                    marginTop: 'auto',
                  }}>
                    {page.description}
                  </p>

                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,241,45,0.4)',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em',
                  }}>
                    READ BRIDGE →
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Filtration Selection Decision Bridges [PRIMARY] | OEM & Aftermarket Context [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, hydraulic, fuel, lube, air_intake, fleet</p>
        <p>CONCEPT_TAXONOMY: type=hub | domain=selection-decision-bridges | scope=oem-aftermarket-fleet-industrial</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, DURATECH</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/bridges</p>
        <p>&nbsp;&nbsp;concept_id: filtration-decision-bridges</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/bridges',
        headline: 'From Product Selection to System Design',
        description: 'Decision bridge hub connecting product-based filtration selection to system-level contamination control design—covering OEM requirements, aftermarket selection, and fleet standardization strategies.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['filtration decision bridge', 'OEM filter requirements', 'aftermarket filter selection', 'fleet filtration strategy', 'contamination control', 'ISO 16889', 'asset protection'],
        about: { '@type': 'Thing', name: 'Filtration Decision Bridges', description: 'Bridge framework connecting product-based filtration decisions to system-level contamination control across OEM, aftermarket, and fleet operation contexts.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'From Product Selection to System Design', item: 'https://elimfilters.com/knowledge-system/bridges' },
        ],
      }) }} />
    </main>
  );
}
