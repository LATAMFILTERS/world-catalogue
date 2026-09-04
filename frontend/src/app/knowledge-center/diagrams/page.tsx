'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ENGINEERING_DIAGRAMS } from '@/lib/knowledge-center-data';
import { ArticleSchema } from '@/components/knowledge-center';

const TYPE_LABELS: Record<string, string> = {
  flow:            'FLOW DIAGRAM',
  schematic:       'SCHEMATIC',
  'cross-section': 'CROSS-SECTION',
  system:          'SYSTEM DIAGRAM',
  process:         'PROCESS DIAGRAM',
  chart:           'CHART',
};

export default function DiagramsHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{
        padding: '1.25rem clamp(1.5rem, 5vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[
            { label: 'Knowledge Center', href: '/knowledge-center' },
            { label: 'Engineering Diagrams', href: undefined },
          ].map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>›</span>}
              {crumb.href ? (
                <Link href={crumb.href} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.35)',
                  textDecoration: 'none',
                }}>
                  {crumb.label.toUpperCase()}
                </Link>
              ) : (
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,241,45,0.6)',
                }}>
                  {crumb.label.toUpperCase()}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Hero */}
      <section style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '1200px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,241,45,0.6)',
            marginBottom: '1.25rem',
          }}>
            KNOWLEDGE CENTER · ENGINEERING DIAGRAMS
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em',
          }}>
            Engineering Diagrams
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.05rem',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '820px',
          }}>
            Standards-accurate engineering diagrams covering ISO 16889 test circuits, ISO 4406 cleanliness
            scales, hydraulic contamination paths, lubrication oil circuits, fuel filtration stages,
            compressed air treatment trains, and particle wear mechanisms. Each diagram is governed by
            the applicable industrial standard and linked to related engineering articles.
          </p>

          <div style={{ marginTop: '2rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#FFF12D',
              lineHeight: 1,
            }}>
              {ENGINEERING_DIAGRAMS.length}
            </p>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.3)',
              marginTop: '0.3rem',
            }}>
              DIAGRAMS
            </p>
          </div>
        </motion.div>
      </section>

      {/* Diagram Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {ENGINEERING_DIAGRAMS.map((diagram, i) => (
            <Link
              key={diagram.entityId}
              href={`/knowledge-center/diagrams/${diagram.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                whileHover={{ background: 'rgba(255,255,255,0.025)' }}
                style={{
                  padding: '1.75rem',
                  background: '#000',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,241,45,0.55)',
                    padding: '0.2rem 0.5rem',
                    border: '1px solid rgba(255,241,45,0.2)',
                  }}>
                    {TYPE_LABELS[diagram.diagramType] ?? diagram.diagramType.toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.15)',
                    letterSpacing: '0.06em',
                  }}>
                    {diagram.entityId}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: '#fff',
                  lineHeight: 1.3,
                  margin: 0,
                }}>
                  {diagram.title}
                </h2>

                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.6,
                  margin: 0,
                  flexGrow: 1,
                }}>
                  {diagram.engineeringPurpose.slice(0, 140)}…
                </p>

                {diagram.governingStandards.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {diagram.governingStandards.slice(0, 3).map((stdId) => (
                      <span key={stdId} style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.25)',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '0.15rem 0.4rem',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        {stdId.replace('STD-', '')}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Engineering Diagrams — ELIMFILTERS Knowledge Center',
        description:
          'Standards-accurate engineering diagrams covering ISO 16889 filter test circuits, ISO 4406 cleanliness scales, hydraulic contamination paths, and more.',
        url: 'https://elimfilters.com/knowledge-center/diagrams',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
      }} />
    </main>
  );
}
