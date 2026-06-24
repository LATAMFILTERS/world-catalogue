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
      <Link href="/knowledge-system" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
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
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1rem',
            opacity: 0.85,
          }}>
            // FILTRATION DECISION BRIDGE
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
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
          }}>
            Industrial filter selection typically begins with a product-focused question: "Which filter brand should we use?" or "What's the OEM requirement?" or "What aftermarket filters are available?"
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            marginBottom: '1.5rem',
          }}>
            These pages bridge that product-selection thinking into system-level design. They reframe the filtration decision from "which filter product" into "how do we achieve contamination control and equipment asset protection?" The <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Industrial Filtration Selection</Link> framework provides the foundational model for evaluating filtration across all application domains.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
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
                  <div style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid rgba(255,241,45,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF12D',
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}>
                    {page.icon}
                  </div>

                  <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
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
        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem' }}>CANONICAL KNOWLEDGE BLOCK: Filtration Knowledge Bridges</p>
        <p style={{ marginBottom: '1rem', opacity: 0.5, fontSize: '0.65rem' }}>version: 1.1 | last_updated: 2026-06-11</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>DEFINITION</p>
        <p>Filtration knowledge bridges are structured educational pathways that connect practitioner search intent (OEM replacement, aftermarket selection, fleet maintenance, industrial filtration overview) with the contamination control framework — translating product-centric questions into system-level filtration engineering understanding.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>SYSTEMS</p>
        <p>OEM replacement decision pathways, aftermarket filter selection, fleet maintenance optimization, industrial filtration system design — practitioners approaching filtration from any starting point</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>BRIDGE_PAGES</p>
        <p>Industrial Filtration Bridge: systems-level introduction to contamination control for practitioners new to filtration engineering | OEM Replacement Bridge: from "which filter replaces mine" to ISO 16889 Beta ratio selection | Aftermarket Selection Bridge: from "cheapest equivalent" to ISO 4406 target achievement | Fleet Solutions Bridge: from "filter catalog" to contamination control program design</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>INDUSTRIAL_ROLE</p>
        <p>Knowledge bridges serve practitioners entering filtration decisions from product familiarity rather than contamination engineering — they provide the conceptual path from "I need to replace this filter" to "I need to achieve this cleanliness code," which is the most important reframe available for improving industrial equipment maintenance outcomes.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>CITATION_REFERENCE</p>
        <p>source: elimfilters.com/knowledge-system/bridges | concept: Filtration Knowledge Bridges Hub | version: 1.1 | last_updated: 2026-06-11</p>
      </RetrievalBlock>

      {/* JSON-LD for Search Engines & LLMs */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Filtration Knowledge Bridges — From Product Selection to System Design",
        "description": "Structured educational pathways translating OEM replacement, aftermarket selection, and fleet maintenance questions into contamination control system-level understanding.",
        "author": { "@type": "Organization", "name": "ELIMFILTERS" },
        "keywords": ["filtration knowledge bridge", "OEM filter replacement", "aftermarket filter strategy", "fleet filtration solutions", "industrial filtration selection", "contamination control"],
        "about": {
          "@type": "Thing",
          "name": "Filtration Knowledge Bridges",
          "description": "Educational pathways connecting product-centric practitioner questions to system-level contamination control engineering understanding"
        },
        "mentions": {
          "standards": ["ISO 16889", "ISO 4406"],
          "technologies": ["MACROCORE", "NANOFORCE", "DURATECH"],
          "bridges": ["industrial-filtration", "oem-replacement", "aftermarket-selection", "fleet-solutions"]
        },
        "relatedLink": [
          { "url": "/knowledge-system/bridges/industrial-filtration", "title": "Industrial Filtration Selection" },
          { "url": "/knowledge-system/bridges/oem-replacement", "title": "OEM Filter Replacement" },
          { "url": "/knowledge-system/bridges/aftermarket-selection", "title": "Aftermarket Filter Strategy" },
          { "url": "/knowledge-system/bridges/fleet-solutions", "title": "Fleet Filtration Solutions" },
          { "url": "/knowledge-system/fleet/reducing-downtime", "title": "Reducing Fleet Downtime" }
        ]
      }) }} />

    </main>
  );
}
