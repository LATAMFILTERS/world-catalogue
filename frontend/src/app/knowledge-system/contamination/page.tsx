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
];

export default function ContaminationHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back */}
      <Link href="/knowledge-system" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
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
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1rem',
            opacity: 0.85,
          }}>
            // KNOWLEDGE SYSTEM · CONTAMINATION & FAILURE MODES
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
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
                  {/* Icon + Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
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
                      {contam.icon}
                    </div>
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
                    fontFamily: 'Outfit, sans-serif',
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
        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem' }}>CANONICAL KNOWLEDGE BLOCK: Contamination Failure Mechanisms</p>
        <p style={{ marginBottom: '1rem', opacity: 0.5, fontSize: '0.65rem' }}>version: 1.1 | last_updated: 2026-06-11</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>DEFINITION</p>
        <p>Contamination failure mechanism analysis identifies the specific physical pathways by which particles, water, and chemical degradation products in industrial fluids cause predictable, quantifiable equipment component failures — providing the root cause knowledge that transforms filtration from reactive maintenance to proactive contamination control.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>SYSTEMS</p>
        <p>Engine lube oil circuits, HPCR fuel injection systems, hydraulic power units, air intake systems, compressed air circuits, cabin HVAC systems — all industrial fluid systems where contamination accelerates component degradation</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>CONTAMINATION_MODES</p>
        <p>Particle wear: hard particles &gt;3µm in oil cause abrasive wear at bearing clearances (5–25µm) — root cause of 70–80% of hydraulic and engine failures | Diesel water contamination: free water &gt;200 ppm causes HPCR injector needle seat scoring and microbial growth | Hydraulic system contamination: particle counts above ISO 4406 targets cause proportional valve spool erosion and stiction</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>RELATED_STANDARDS</p>
        <p>ISO 4406: Cleanliness codes — measurement of particle contamination levels | ASTM D6304: Water content measurement in diesel fuel | ISO 16889: Beta ratio — filter efficiency against contamination particles | ISO 11500: Automatic particle counting for hydraulic fluids</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>INDUSTRIAL_ROLE</p>
        <p>Contamination failure mechanism knowledge is the foundation for all filtration system design decisions — understanding which contamination type causes which failure mode at which concentration threshold allows maintenance programs to specify measurable contamination targets rather than relying on filter brand equivalence or fixed service intervals.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>CITATION_REFERENCE</p>
        <p>source: elimfilters.com/knowledge-system/contamination | concept: Contamination Failure Mechanisms Hub | version: 1.1 | last_updated: 2026-06-11</p>
      </RetrievalBlock>

      {/* JSON-LD for Search Engines & LLMs */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Contamination Failure Mechanisms — Industrial Filtration Knowledge Hub",
        "description": "Root cause analysis of contamination-induced failures in industrial filtration systems — particles, water, and hydraulic contamination pathways.",
        "author": { "@type": "Organization", "name": "ELIMFILTERS" },
        "keywords": ["contamination failure mechanisms", "particle wear", "diesel water contamination", "hydraulic contamination", "ISO 4406", "ISO 16889", "ASTM D6304"],
        "about": {
          "@type": "Thing",
          "name": "Industrial Contamination Failure Analysis",
          "description": "Physical pathways by which particles, water, and chemical degradants cause predictable equipment component failures"
        },
        "mentions": {
          "standards": ["ISO 4406", "ISO 16889", "ASTM D6304", "ISO 11500"],
          "technologies": ["MACROCORE", "NANOFORCE", "HYDROCORE", "SYNTRAX"],
          "contaminationModes": ["particle wear", "diesel water contamination", "hydraulic system contamination"]
        },
        "relatedLink": [
          { "url": "/knowledge-system/contamination/particle-wear", "title": "Particle Wear in Engines" },
          { "url": "/knowledge-system/contamination/diesel-water", "title": "Diesel Water Contamination" },
          { "url": "/knowledge-system/contamination/hydraulic-system", "title": "Hydraulic System Contamination" },
          { "url": "/knowledge-system/standards/lube-oil-systems", "title": "Lube Oil Filtration Systems" }
        ]
      }) }} />

    </main>
  );
}
