'use client';

import Link from 'next/link';

import { motion } from 'motion/react';

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
            Filter Selection Technical Guides
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.65,
            textAlign: 'justify',
          }}>
            Technical reference guides for industrial filtration selection across OEM, aftermarket, and fleet operation contexts.
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
                    textAlign: 'justify',
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


      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/bridges',
        headline: 'Filter Selection Technical Guides',
        description: 'Technical reference guides for industrial filtration selection covering OEM requirements, aftermarket evaluation, and fleet standardization strategies based on ISO 16889 and ISO 4406 criteria.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['filtration decision bridge', 'OEM filter requirements', 'aftermarket filter selection', 'fleet filtration strategy', 'contamination control', 'ISO 16889', 'asset protection'],
        about: { '@type': 'Thing', name: 'Filtration Decision Bridges', description: 'Bridge framework connecting product-based filtration decisions to system-level contamination control across OEM, aftermarket, and fleet operation contexts.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': 'https://elimfilters.com/knowledge-system/bridges#collection',
        name: 'Filtration Decision Bridges',
        isPartOf: { '@id': 'https://elimfilters.com/knowledge-system#collection' },
        hasPart: BRIDGE_PAGES.map((b) => ({
          '@type': 'WebPage',
          name: b.title,
          description: b.description,
          url: `https://elimfilters.com${b.href}`,
        })),
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
