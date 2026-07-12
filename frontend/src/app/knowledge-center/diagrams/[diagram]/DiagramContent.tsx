'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { KCDiagram } from '@/lib/knowledge-center-data';
import { ArticleSchema } from '@/components/knowledge-center';
import DiagramBlock from '@/components/knowledge-center/DiagramBlock';

const TYPE_LABELS: Record<string, string> = {
  flow:            'FLOW DIAGRAM',
  schematic:       'SCHEMATIC',
  'cross-section': 'CROSS-SECTION',
  system:          'SYSTEM DIAGRAM',
  process:         'PROCESS DIAGRAM',
  chart:           'CHART',
};

const STATUS_COLOR: Record<string, string> = {
  current:    '#44ff88',
  draft:      '#FFF12D',
  superseded: '#ff4444',
};

export default function DiagramContent({ diagram }: { diagram: KCDiagram }) {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{
        padding: '1.25rem clamp(1.5rem, 5vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Knowledge Center', href: '/knowledge-center' },
            { label: 'Diagrams', href: '/knowledge-center/diagrams' },
            { label: diagram.title },
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

      {/* Header */}
      <section style={{
        padding: 'clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '1000px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.6)',
              padding: '0.2rem 0.6rem',
              border: '1px solid rgba(255,241,45,0.25)',
            }}>
              {TYPE_LABELS[diagram.diagramType] ?? diagram.diagramType.toUpperCase()}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.06em',
              color: STATUS_COLOR[diagram.revisionMetadata.status] ?? 'rgba(255,255,255,0.3)',
              padding: '0.2rem 0.6rem',
              border: `1px solid ${STATUS_COLOR[diagram.revisionMetadata.status] ?? 'rgba(255,255,255,0.1)'}30`,
            }}>
              {diagram.revisionMetadata.status.toUpperCase()} · v{diagram.revisionMetadata.version}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.55rem',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.06em',
              marginLeft: 'auto',
            }}>
              {diagram.entityId}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em',
          }}>
            {diagram.title}
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '720px',
            textAlign: 'justify',
          }}>
            {diagram.engineeringPurpose}
          </p>
        </motion.div>
      </section>

      {/* Main SVG Diagram */}
      <section style={{
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DiagramBlock
            id={diagram.svgComponentId}
            caption={diagram.accessibility.desc}
            aspectRatio="unset"
          />
        </motion.div>
      </section>

      {/* Metadata + Links Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
      }}>

        {/* Governing Standards */}
        {diagram.governingStandards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '0.75rem',
            }}>
              GOVERNING STANDARDS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {diagram.governingStandards.map((stdId) => (
                <div key={stdId} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  color: '#FFF12D',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgba(255,241,45,0.15)',
                  background: 'rgba(255,241,45,0.04)',
                }}>
                  {stdId.replace('STD-', '').replace(/-/g, ' ')}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related Technologies */}
        {diagram.relatedTechnologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '0.75rem',
            }}>
              ELIMFILTERS TECHNOLOGIES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {diagram.relatedTechnologies.map((tech) => (
                <div key={tech} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {tech}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Applicable Systems */}
        {diagram.applicableSystems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '0.75rem',
            }}>
              APPLICABLE SYSTEMS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {diagram.applicableSystems.map((sys) => (
                <Link key={sys} href={`/knowledge-center/systems/${sys}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.2)', color: 'rgba(255,255,255,0.75)' }}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.5)',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {sys.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Revision Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
          }}>
            REVISION METADATA
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[
              ['Version', `v${diagram.revisionMetadata.version}`],
              ['Status', diagram.revisionMetadata.status],
              ['Last Reviewed', diagram.revisionMetadata.lastReviewed],
              ['Next Review', diagram.revisionMetadata.nextReview],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.4rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.25)',
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Related Articles */}
      {diagram.relatedArticles.length > 0 && (
        <section style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem)',
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '1rem',
          }}>
            RELATED ENGINEERING ARTICLES
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {diagram.relatedArticles.map((slug) => (
              <Link
                key={slug}
                href={`/knowledge-center/engineering/${slug}`}
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: '#000',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    color: 'rgba(255,241,45,0.5)',
                  }}>→</span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.82rem',
                    color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.4,
                  }}>
                    {slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: diagram.title,
        description: diagram.metaDescription,
        url: `https://elimfilters.com/knowledge-center/diagrams/${diagram.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        about: {
          '@type': 'Thing',
          name: diagram.title,
          description: diagram.engineeringPurpose,
        },
        mentions: diagram.governingStandards.map((id) => ({
          '@type': 'DefinedTerm',
          name: id.replace('STD-', '').replace(/-/g, ' '),
        })),
      }} />
    </main>
  );
}
