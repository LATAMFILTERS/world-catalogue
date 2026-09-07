'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const LIBRARY_DOCS = [
  {
    id: 'filter-selection-guide',
    title: 'Filter Selection Framework',
    subtitle: 'Systematic methodology for selecting filtration products based on contamination targets, not product specifications.',
    type: 'SELECTION GUIDE',
    sections: ['Contamination target identification', 'ISO 4406 cleanliness code selection', 'Beta ratio calculation', 'Media selection criteria', 'Bypass valve specification'],
    standards: ['ISO 16889', 'ISO 4406'],
  },
  {
    id: 'failure-mode-analysis',
    title: 'Filtration Failure Mode Analysis',
    subtitle: 'Root cause analysis matrix for common filtration system failures and contamination-induced equipment damage.',
    type: 'TECHNICAL ANALYSIS',
    sections: ['Particle wear failure chain', 'Water contamination progression', 'Bypass valve failure modes', 'Media collapse indicators', 'Post-failure oil analysis interpretation'],
    standards: ['ISO 16889', 'ISO 4406', 'ISO 11171'],
  },
  {
    id: 'service-interval-methodology',
    title: 'Service Interval Engineering',
    subtitle: 'Engineering methodology for determining optimal filter replacement intervals based on operating conditions, not calendar time.',
    type: 'METHODOLOGY',
    sections: ['Dust concentration measurement', 'Restriction monitoring', 'Oil analysis intervals', 'Condition-based replacement triggers', 'Extended drain justification'],
    standards: ['ISO 5011', 'SAE J1858'],
  },
  {
    id: 'hydraulic-commissioning',
    title: 'Hydraulic System Commissioning Flush Protocol',
    subtitle: 'Step-by-step flushing procedure for new and rebuilt hydraulic systems to achieve target ISO 4406 cleanliness before startup.',
    type: 'PROCEDURE',
    sections: ['Pre-flush particle count baseline', 'Flushing circuit design', 'Target cleanliness thresholds', 'Particle count verification', 'Documentation requirements'],
    standards: ['ISO 4406', 'NAS 1638'],
  },
  {
    id: 'oil-analysis-guide',
    title: 'Oil Analysis and Condition Monitoring',
    subtitle: 'Interpretation guide for used oil analysis reports, particle count data, and wear metal trending for proactive maintenance.',
    type: 'INTERPRETATION GUIDE',
    sections: ['Wear metal identification', 'ISO 4406 report interpretation', 'Trend analysis methodology', 'Alarm threshold setting', 'Corrective action decision matrix'],
    standards: ['ISO 4406', 'ISO 11171'],
  },
  {
    id: 'cabin-air-assessment',
    title: 'Cabin Air Quality Assessment',
    subtitle: 'Assessment procedure for evaluating operator exposure risk and cabin filtration system adequacy in heavy equipment applications.',
    type: 'ASSESSMENT GUIDE',
    sections: ['PM2.5 exposure risk classification', 'Pressurization testing', 'Filter efficiency verification', 'Chemical vapor assessment', 'ISO 11155 compliance check'],
    standards: ['ISO 11155', 'DIN 71460', 'ISO 29463'],
  },
];

export default function TechnicalLibraryPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3.5rem, 6vw, 5.5rem) clamp(1.5rem, 4vw, 4rem)',
        minHeight: 'clamp(500px, 52vw, 620px)',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#050505',
        backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.70) 36%, rgba(0,0,0,0.42) 68%, rgba(0,0,0,0.20) 100%), url('/images/grupo3-oil.avif')",
        backgroundSize: '100% 100%, contain',
        backgroundPosition: 'center, 72% center',
        backgroundRepeat: 'no-repeat, no-repeat',
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Link href="/knowledge-center" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.42)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '2rem',
          }}>
            ← KNOWLEDGE CENTER
          </Link>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1rem',
            }}
          >
            05 / TECHNICAL LIBRARY
          </motion.p>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              lineHeight: 1.08,
              marginBottom: '1.1rem',
              maxWidth: '760px',
            }}
          >
            Technical Reference Library
          </motion.h1>

          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.68)',
              maxWidth: '820px',
            }}
          >
            Selection guides, failure analysis matrices, commissioning procedures, and assessment methodologies for filtration engineering teams and equipment maintenance operations.
          </motion.p>
        </div>
      </section>

      {/* Library Documents */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {LIBRARY_DOCS.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <motion.div
              whileHover={{ background: 'rgba(255,241,45,0.02)', borderLeftColor: '#FFF12D' }}
              style={{
                background: '#000',
                padding: '2rem',
                borderLeft: '3px solid transparent',
                transition: 'background 0.2s, border-left-color 0.2s',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  letterSpacing: '0.1em',
                  color: '#FFF12D',
                  opacity: 0.7,
                }}>
                  {doc.type}
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {doc.standards.map((std) => (
                    <span key={std} style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.58rem',
                      color: 'rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '0.15rem 0.4rem',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {std}
                    </span>
                  ))}
                </div>
              </div>

              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '1.15rem',
                color: '#fff',
                marginBottom: '0.5rem',
                lineHeight: 1.2,
              }}>
                {doc.title}
              </h2>

              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.87rem',
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '1.25rem',
                maxWidth: '640px',
              }}>
                {doc.subtitle}
              </p>

              <div>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.58rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: '0.5rem',
                }}>
                  CONTENTS
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {doc.sections.map((sec) => (
                    <span key={sec} style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.35)',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '0.2rem 0.6rem',
                    }}>
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </section>

      {/* Engineering CTA */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto 4rem',
        padding: '0 clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{
          border: '1px solid rgba(255,241,45,0.12)',
          background: 'rgba(255,241,45,0.02)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.1rem',
              color: '#fff',
              marginBottom: '0.35rem',
            }}>
              Engineering Reference Articles
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.45)',
            }}>
              14 technical articles covering filtration theory, media science, and contamination control.
            </p>
          </div>
          <Link href="/knowledge-center/engineering" style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '0.82rem',
            color: '#000',
            background: '#FFF12D',
            padding: '0.65rem 1.25rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            Engineering Articles →
          </Link>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Technical Reference Library — ELIMFILTERS Knowledge Center',
        description: 'Selection guides, failure analysis matrices, commissioning procedures, and assessment methodologies for filtration engineering.',
        url: 'https://elimfilters.com/knowledge-center/technical-library',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
      })}} />
    </main>
  );
}
