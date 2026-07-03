'use client';

import Link from 'next/link';

import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const FRAMEWORK_SECTIONS = [
  {
    title: 'System vs Commodity Filtration',
    slug: 'system-vs-commodity',
    description: 'Why filtration is not a product choice but a system design decision. Understanding the gap between commodity filters and integrated contamination control.',
    icon: '⚙',
    href: '/knowledge-system/compare/system-vs-commodity',
  },
  {
    title: 'Filter Evaluation Framework',
    slug: 'evaluation-framework',
    description: 'Shift from product specifications to system performance metrics. Evaluating filters through contamination control efficiency and asset protection impact.',
    icon: '🔍',
    href: '/knowledge-system/compare/evaluation-framework',
  },
  {
    title: 'Total Cost of Ownership Analysis',
    slug: 'total-cost-ownership',
    description: 'Moving beyond purchase price to system-level economics. How contamination control affects downtime, maintenance, and equipment lifespan.',
    icon: '💰',
    href: '/knowledge-system/fleet/total-cost-ownership',
  },
  {
    title: 'OEM vs Aftermarket Positioning',
    slug: 'oem-comparison',
    description: 'Specification alignment, performance claims, and compatibility considerations. Understanding when OEM selection impacts system reliability.',
    icon: '⚖',
    href: '/knowledge-system/compare/oem-comparison',
  },
];

export default function ComparisonHubPage() {
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
            System vs Commodity Thinking
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Move beyond filter product selection to integrated asset protection system design.
          </p>
        </motion.div>
      </section>

      {/* Category Reframing Narrative */}
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
          }}>
            Industrial filtration has been marketed as a commodity product category. Purchase decisions are driven by brand name recognition, OEM specification alignment, and price competition between Donaldson, Fleetguard, Mann, Wix, Baldwin, and aftermarket suppliers. The <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration selection</Link> framework explains why this product-first approach systematically underperforms a system-level contamination control strategy.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            marginBottom: '1.5rem',
          }}>
            ELIMFILTERS reframes this conversation: <strong style={{ color: '#FFF12D' }}>Filtration is not a product selection problem. It is a contamination control system problem.</strong> The performance of your equipment is determined not by the filter brand, but by how effectively your total filtration system controls contamination across all critical domains—air, fuel, hydraulic, cabin, lube, and compressed air.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            This framework explains why <Link href="/knowledge-system/compare/system-vs-commodity" style={{ color: '#FFF12D', textDecoration: 'underline' }}>system vs commodity thinking</Link> changes equipment reliability, extends asset lifespan, and reduces total cost of ownership—regardless of which physical filter products are installed.
          </p>
        </motion.div>
      </section>

      {/* Framework Cards */}
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
          {FRAMEWORK_SECTIONS.map((section, i) => (
            <motion.div
              key={section.slug}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={section.href} style={{ textDecoration: 'none', display: 'block' }}>
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
                    {section.title}
                  </h2>

                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                    marginTop: 'auto',
                  }}>
                    {section.description}
                  </p>

                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,241,45,0.4)',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em',
                  }}>
                    EXPLORE →
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Filtration Evaluation Frameworks [PRIMARY] | Purchasing Decision Analysis [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, hydraulic, fuel, lube, fleet</p>
        <p>CONCEPT_TAXONOMY: type=hub | domain=filtration-evaluation | scope=system-oem-tco-frameworks</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime, /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/compare</p>
        <p>&nbsp;&nbsp;concept_id: filtration-comparison-hub</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'System vs Commodity Thinking',
        description: 'Reframes industrial filtration evaluation from product-based commodity selection to system-level contamination control strategy, covering OEM comparison, filter evaluation frameworks, and total cost of ownership analysis.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['system vs commodity filtration', 'OEM filter comparison', 'filter evaluation', 'total cost of ownership', 'contamination control', 'ISO 16889', 'asset protection', 'industrial filtration'],
        about: { '@type': 'Thing', name: 'System vs Commodity Filtration Thinking', description: 'Framework for evaluating industrial filtration decisions based on contamination control system performance rather than product price or brand.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'System vs Commodity Thinking', item: 'https://elimfilters.com/knowledge-system/compare' },
        ],
      }) }} />
    </main>
  );
}
