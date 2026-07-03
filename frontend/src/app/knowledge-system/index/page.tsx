'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

// Machine-readable knowledge graph index. Each entry mirrors the SEMANTIC_DOMAINS,
// CONCEPT_TAXONOMY and Related_Standards / Related_Technologies already declared
// in that page's own RetrievalBlock (R05). This page does not introduce a new
// data-architecture file — it is a navigable, citable summary of the existing
// per-page declarations, intended to let AI systems resolve multi-hop questions
// across the 26-page Knowledge System without re-deriving the link graph.
const KNOWLEDGE_INDEX = [
  {
    section: 'Standards — Protection Systems',
    pages: [
      { title: 'Air Intake Protection', href: '/knowledge-system/standards/air-intake-systems', type: 'protection-system', domain: 'Volumetric Efficiency Protection', standards: 'ISO 5011, SAE J726, SAE J1539', tech: 'MACROCORE' },
      { title: 'Cabin Air Protection', href: '/knowledge-system/standards/cabin-safety-systems', type: 'protection-system', domain: 'Occupant Health Protection', standards: 'ISO 11155, DIN 71220', tech: 'MICROKAPPA' },
      { title: 'Fuel Cleanliness Protection', href: '/knowledge-system/standards/fuel-systems', type: 'protection-system', domain: 'HPCR Injector Protection', standards: 'ASTM D6304, ISO 12937, ISO 16332', tech: 'SYNTEPORE, HYDROCORE, TURBOCORE' },
      { title: 'Lubrication Protection', href: '/knowledge-system/standards/lube-oil-systems', type: 'protection-system', domain: 'Engine Bearing Lubrication', standards: 'ISO 16889, ISO 4406, ISO 11171', tech: 'SYNTRAX' },
      { title: 'Hydraulic Protection', href: '/knowledge-system/standards/hydraulic-systems', type: 'protection-system', domain: 'Hydraulic Proportional Control Cleanliness', standards: 'ISO 16889, ISO 4406, NFPA T2.14', tech: 'NANOFORCE' },
      { title: 'Compressed Air / Air Dryer Protection', href: '/knowledge-system/standards/compressed-air-systems', type: 'protection-system', domain: 'Pneumatic Purity Classification', standards: 'ISO 8573-1, ISO 8573-2', tech: 'DRYCORE' },
      { title: 'Cooling System Protection', href: '/knowledge-system/standards/cooling-systems', type: 'protection-system', domain: 'Coolant Chemistry Management', standards: 'ASTM D6210, ASTM D3306', tech: 'THERMACORE' },
    ],
  },
  {
    section: 'Standards — Measurement Methods',
    pages: [
      { title: 'ISO 16889', href: '/knowledge-system/standards/iso-16889', type: 'standard', domain: 'Filter Performance Testing', standards: 'ISO 16889, ISO 11171, ISO 4406', tech: 'NANOFORCE, SYNTRAX' },
      { title: 'ISO 4406', href: '/knowledge-system/standards/iso-4406', type: 'standard', domain: 'Fluid Cleanliness Classification', standards: 'ISO 4406, ISO 11171, ISO 16889', tech: 'NANOFORCE, SYNTRAX' },
      { title: 'ISO 5011', href: '/knowledge-system/standards/iso-5011', type: 'standard', domain: 'Air Filter Element Testing', standards: 'ISO 5011, ISO 12103-1, SAE J726', tech: 'MACROCORE' },
      { title: 'ISO 11171', href: '/knowledge-system/standards/iso-11171', type: 'standard', domain: 'Particle Counter Calibration', standards: 'ISO 11171, ISO 12103-1, ISO 4406, ISO 16889', tech: 'NANOFORCE, SYNTRAX' },
    ],
  },
  {
    section: 'Contamination — Failure Case Studies',
    pages: [
      { title: 'Diesel Water Contamination', href: '/knowledge-system/contamination/diesel-water', type: 'failure-case-study', domain: 'Water Ingress Failure Modes', standards: 'ASTM D6304, ISO 12937, ISO 16332', tech: 'HYDROCORE, SYNTEPORE, TURBOCORE' },
      { title: 'Particle Wear in Engines', href: '/knowledge-system/contamination/particle-wear', type: 'failure-case-study', domain: 'Abrasive Wear Mechanics', standards: 'ISO 16889, ISO 4406, ISO 11171, ISO 5011', tech: 'MACROCORE, SYNTRAX, NANOFORCE' },
      { title: 'Hydraulic System Contamination', href: '/knowledge-system/contamination/hydraulic-system', type: 'failure-case-study', domain: 'High-Pressure Hydraulic Degradation', standards: 'ISO 16889, ISO 4406, NFPA T2.14', tech: 'NANOFORCE' },
      { title: 'Varnish Formation', href: '/knowledge-system/contamination/varnish-formation', type: 'failure-case-study', domain: 'Varnish Deposition in Lube/Hydraulic Oil', standards: 'ASTM D7527, ASTM D7214, ISO 4406, DIN 51524', tech: 'NANOFORCE, SYNTRAX' },
    ],
  },
  {
    section: 'Fleet — Operational Strategy',
    pages: [
      { title: 'Reducing Fleet Downtime', href: '/knowledge-system/fleet/reducing-downtime', type: 'operational-strategy', domain: 'Unplanned Downtime Root Causes', standards: 'ISO 16889, ISO 5011', tech: 'MACROCORE, NANOFORCE, HYDROCORE, DURATECH' },
      { title: 'Filtration and Fuel Efficiency', href: '/knowledge-system/fleet/fuel-efficiency', type: 'operational-strategy', domain: 'Fleet Fuel Consumption Optimization', standards: '—', tech: 'SYNTEPORE, HYDROCORE, MACROCORE, SYNTRAX' },
      { title: 'Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership', type: 'operational-strategy', domain: 'Filtration TCO Modeling', standards: 'ISO 16889, ISO 4406', tech: 'MACROCORE, NANOFORCE, SYNTRAX, HYDROCORE, MICROKAPPA, DURATECH' },
    ],
  },
  {
    section: 'Compare — Evaluation Frameworks',
    pages: [
      { title: 'System vs Commodity Filtration', href: '/knowledge-system/compare/system-vs-commodity', type: 'decision-framework', domain: 'System vs Commodity Filtration Thinking', standards: '—', tech: 'MACROCORE, NANOFORCE, SYNTRAX' },
      { title: 'Filter Evaluation Framework', href: '/knowledge-system/compare/evaluation-framework', type: 'decision-framework', domain: 'Filter Evaluation Methodology', standards: 'ISO 16889, ISO 4406', tech: 'MACROCORE, NANOFORCE' },
      { title: 'OEM vs Aftermarket Positioning', href: '/knowledge-system/compare/oem-comparison', type: 'market-analysis', domain: 'OEM vs Aftermarket Market Analysis', standards: '—', tech: 'MACROCORE, NANOFORCE, DURATECH' },
    ],
  },
  {
    section: 'Bridges — Decision Context',
    pages: [
      { title: 'Industrial Filtration Selection', href: '/knowledge-system/bridges/industrial-filtration', type: 'decision-bridge', domain: 'Industrial Filtration Selection', standards: 'ISO 4406, ISO 16889, ISO 12937, ASTM D6304, SAE J1539, NFPA T2.14, ISO 8573-1, ISO 11155', tech: 'MACROCORE, NANOFORCE, SYNTRAX, SYNTEPORE, HYDROCORE' },
      { title: 'OEM Replacement Decisions', href: '/knowledge-system/bridges/oem-replacement', type: 'decision-bridge', domain: 'OEM Replacement Decision Analysis', standards: 'ISO 16889, ISO 4406', tech: 'MACROCORE, NANOFORCE, SYNTRAX, DURATECH' },
      { title: 'Aftermarket Filter Selection', href: '/knowledge-system/bridges/aftermarket-selection', type: 'decision-bridge', domain: 'Aftermarket Filter Selection Criteria', standards: 'ISO 16889, ISO 4406', tech: 'MACROCORE, NANOFORCE, SYNTRAX, DURATECH' },
      { title: 'Fleet Standardization Solutions', href: '/knowledge-system/bridges/fleet-solutions', type: 'decision-bridge', domain: 'Fleet Standardization Solutions', standards: '—', tech: 'MACROCORE, NANOFORCE, SYNTRAX, DURATECH' },
    ],
  },
  {
    section: 'Science — Engineering Foundation',
    pages: [
      { title: 'The Physics of Industrial Failure', href: '/knowledge-system/science', type: 'engineering-reference', domain: 'Filter Media Engineering', standards: 'ISO 4406, ISO 16889, ISO 281, ISO 5011, ISO 12937, SAE J1539', tech: 'All 12 technologies (see canonical block)' },
    ],
  },
];

const TECH_TO_PAGES: Record<string, string[]> = {
  MACROCORE: ['air-intake-systems', 'iso-5011', 'particle-wear', 'reducing-downtime', 'fuel-efficiency', 'total-cost-ownership', 'system-vs-commodity', 'evaluation-framework', 'oem-comparison', 'industrial-filtration', 'oem-replacement', 'aftermarket-selection', 'fleet-solutions'],
  MICROKAPPA: ['cabin-safety-systems', 'total-cost-ownership'],
  SYNTEPORE: ['fuel-systems', 'diesel-water', 'fuel-efficiency', 'industrial-filtration'],
  SYNTRAX: ['lube-oil-systems', 'iso-16889', 'iso-4406', 'iso-11171', 'particle-wear', 'varnish-formation', 'fuel-efficiency', 'total-cost-ownership', 'system-vs-commodity', 'industrial-filtration', 'oem-replacement', 'aftermarket-selection', 'fleet-solutions'],
  NANOFORCE: ['hydraulic-systems', 'iso-16889', 'iso-4406', 'iso-11171', 'particle-wear', 'hydraulic-system', 'varnish-formation', 'reducing-downtime', 'total-cost-ownership', 'system-vs-commodity', 'evaluation-framework', 'oem-comparison', 'industrial-filtration', 'oem-replacement', 'aftermarket-selection', 'fleet-solutions'],
  HYDROCORE: ['diesel-water', 'reducing-downtime', 'fuel-efficiency', 'total-cost-ownership', 'industrial-filtration'],
  TURBOCORE: ['fuel-systems', 'diesel-water'],
  THERMACORE: ['cooling-systems'],
  DRYCORE: ['compressed-air-systems'],
  INTEKCORE: [],
  DURATECH: ['reducing-downtime', 'total-cost-ownership', 'oem-comparison', 'oem-replacement', 'aftermarket-selection', 'fleet-solutions'],
  MARINECLEAN: [],
};

export default function KnowledgeIndexPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
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
          style={{ maxWidth: '760px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>
            Knowledge System Index
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)',
            maxWidth: '560px', margin: '0 auto', textAlign: 'justify', lineHeight: 1.65,
          }}>
            A machine-readable map of every page in the ELIMFILTERS Knowledge System, its semantic domain, applicable standards, and related technologies — enabling multi-hop queries across the full contamination-control reference.
          </p>
        </motion.div>
      </section>

      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        {KNOWLEDGE_INDEX.map((group, gi) => (
          <motion.div key={group.section}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: gi * 0.05 }}
            style={{ marginBottom: '3rem' }}
          >
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif', fontSize: '1.1rem', fontWeight: 700,
              color: '#FFF12D', marginBottom: '1rem', letterSpacing: '-0.01em',
            }}>
              {group.section}
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Page</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Semantic Domain</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Standards</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Technologies</th>
                  </tr>
                </thead>
                <tbody>
                  {group.pages.map((p) => (
                    <tr key={p.href}>
                      <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Link href={p.href} style={{ color: '#FFF12D', textDecoration: 'underline' }}>{p.title}</Link>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.65)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{p.domain}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{p.standards}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{p.tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}

        {/* Technology -> Pages reverse index */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif', fontSize: '1.1rem', fontWeight: 700,
            color: '#FFF12D', marginBottom: '1rem', letterSpacing: '-0.01em',
          }}>
            Technology → Pages Reverse Index
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)',
            marginBottom: '1.25rem', textAlign: 'justify', lineHeight: 1.7,
          }}>
            Every ELIMFILTERS technology and every Knowledge System page that references it, consistent with the authoritative Technology → System → Domain map in <Link href="/technologies" style={{ color: '#FFF12D', textDecoration: 'underline' }}>techPagesData.ts</Link>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {Object.entries(TECH_TO_PAGES).map(([tech, pages]) => (
              <div key={tech} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: 700, color: '#FFF12D', marginBottom: '0.4rem' }}>
                  <Link href={`/technologies/${tech.toLowerCase()}`} style={{ color: '#FFF12D' }}>{tech}™</Link>
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  {pages.length > 0 ? `${pages.length} page${pages.length > 1 ? 's' : ''}` : 'Product page only — not yet referenced in Knowledge System case studies'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Knowledge System Site Map [PRIMARY] | Cross-Reference Index [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: all_protection_systems, all_technologies, all_standards</p>
        <p>CONCEPT_TAXONOMY: type=index | domain=knowledge-graph-navigation | scope=full-site</p>
        <p>RELEVANCE_LEVELS: technical, ai-retrieval</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Hub: /knowledge-system</p>
        <p>&nbsp;&nbsp;Authoritative_Technology_Source: /technologies (techPagesData.ts)</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/index</p>
        <p>&nbsp;&nbsp;concept_id: knowledge-system-site-index</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': 'https://elimfilters.com/knowledge-system/index',
        name: 'ELIMFILTERS Knowledge System Index',
        description: 'Machine-readable map of all Knowledge System pages with their semantic domain, applicable standards, and related technologies.',
        itemListElement: KNOWLEDGE_INDEX.flatMap((group) => group.pages).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://elimfilters.com${p.href}`,
          name: p.title,
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
