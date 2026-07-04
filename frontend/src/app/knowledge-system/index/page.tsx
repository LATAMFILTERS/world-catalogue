'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

// Engineering navigation index. Lists every page currently published under
// /knowledge-system, grouped by section, for direct navigation. This is not
// a sitemap (sitemap.xml remains the crawl-discovery mechanism) and does not
// introduce new architecture — it is a static list of existing routes.
const SECTIONS = [
  {
    name: 'Standards',
    href: '/knowledge-system/standards',
    pages: [
      { title: 'Air Intake Filtration Systems', href: '/knowledge-system/standards/air-intake-systems' },
      { title: 'Cabin / Human Safety Filtration Systems', href: '/knowledge-system/standards/cabin-safety-systems' },
      { title: 'Compressed Air Systems', href: '/knowledge-system/standards/compressed-air-systems' },
      { title: 'Fuel Filtration Systems', href: '/knowledge-system/standards/fuel-systems' },
      { title: 'Hydraulic Systems', href: '/knowledge-system/standards/hydraulic-systems' },
      { title: 'Lube / Oil Filtration Systems', href: '/knowledge-system/standards/lube-oil-systems' },
      { title: 'ISO 16889', href: '/knowledge-system/standards/iso-16889' },
      { title: 'ISO 4406', href: '/knowledge-system/standards/iso-4406' },
      { title: 'ISO 5011', href: '/knowledge-system/standards/iso-5011' },
    ],
  },
  {
    name: 'Contamination',
    href: '/knowledge-system/contamination',
    pages: [
      { title: 'Diesel Water Contamination', href: '/knowledge-system/contamination/diesel-water' },
      { title: 'Particle Wear in Engines', href: '/knowledge-system/contamination/particle-wear' },
      { title: 'Hydraulic System Contamination', href: '/knowledge-system/contamination/hydraulic-system' },
      { title: 'Varnish Formation in Hydraulic Systems', href: '/knowledge-system/contamination/varnish-formation' },
      { title: 'Coolant System Contamination', href: '/knowledge-system/contamination/coolant-contamination' },
      { title: 'Compressed Air Contamination', href: '/knowledge-system/contamination/compressed-air-contamination' },
      { title: 'Fuel Injector Wear from Contamination', href: '/knowledge-system/contamination/fuel-injector-wear' },
    ],
  },
  {
    name: 'Fleet',
    href: '/knowledge-system/fleet',
    pages: [
      { title: 'Reducing Fleet Downtime', href: '/knowledge-system/fleet/reducing-downtime' },
      { title: 'Filtration and Fuel Efficiency', href: '/knowledge-system/fleet/fuel-efficiency' },
      { title: 'Total Cost of Ownership in Filtration', href: '/knowledge-system/fleet/total-cost-ownership' },
      { title: 'Filtration ROI Calculator', href: '/knowledge-system/fleet/roi-calculator' },
    ],
  },
  {
    name: 'Compare',
    href: '/knowledge-system/compare',
    pages: [
      { title: 'System vs Commodity Filtration', href: '/knowledge-system/compare/system-vs-commodity' },
      { title: 'Filter Evaluation Framework', href: '/knowledge-system/compare/evaluation-framework' },
      { title: 'OEM vs Aftermarket Analysis', href: '/knowledge-system/compare/oem-comparison' },
      { title: 'Total Cost of Ownership', href: '/knowledge-system/compare/total-cost-ownership' },
    ],
  },
  {
    name: 'Bridges',
    href: '/knowledge-system/bridges',
    pages: [
      { title: 'Industrial Filtration Selection Framework', href: '/knowledge-system/bridges/industrial-filtration' },
      { title: 'OEM Filter Requirements Strategy', href: '/knowledge-system/bridges/oem-replacement' },
      { title: 'Aftermarket Filter Selection Strategy', href: '/knowledge-system/bridges/aftermarket-selection' },
      { title: 'Fleet Filtration Solutions Framework', href: '/knowledge-system/bridges/fleet-solutions' },
    ],
  },
  {
    name: 'Science',
    href: '/knowledge-system/science',
    pages: [
      { title: 'The Physics of Industrial Failure', href: '/knowledge-system/science' },
    ],
  },
];

export default function KnowledgeSystemIndexPage() {
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

      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)', paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>
            Knowledge System Index
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)',
            maxWidth: '540px', margin: '0 auto', textAlign: 'justify', lineHeight: 1.65,
          }}>
            A direct navigation index of every page published under the Knowledge System, grouped by section.
          </p>
        </motion.div>
      </section>

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
        {SECTIONS.map((section, gi) => (
          <motion.div key={section.name}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: gi * 0.05 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif', fontSize: '1.1rem', fontWeight: 700,
              color: '#FFF12D', marginBottom: '0.9rem', letterSpacing: '-0.01em',
            }}>
              <Link href={section.href} style={{ color: '#FFF12D', textDecoration: 'underline' }}>{section.name}</Link>
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
              {section.pages.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} style={{
                    display: 'block', padding: '0.6rem 0.9rem',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.85rem',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>

      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Knowledge System Site Map [PRIMARY] | Cross-Reference Index [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: all_protection_systems, all_technologies, all_standards</p>
        <p>CONCEPT_TAXONOMY: type=index | domain=knowledge-graph-navigation | scope=full-site</p>
        <p>RELEVANCE_LEVELS: technical, ai-retrieval</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Hub: /knowledge-system</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/index</p>
        <p>&nbsp;&nbsp;concept_id: knowledge-system-site-index</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': 'https://elimfilters.com/knowledge-system/index',
        name: 'Knowledge System Index',
        description: 'A direct navigation index of every page published under the ELIMFILTERS Knowledge System, grouped by section.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        hasPart: SECTIONS.flatMap((s) => s.pages).map((p) => ({
          '@type': 'WebPage',
          name: p.title,
          url: `https://elimfilters.com${p.href}`,
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Index', item: 'https://elimfilters.com/knowledge-system/index' },
        ],
      }) }} />
    </main>
  );
}
