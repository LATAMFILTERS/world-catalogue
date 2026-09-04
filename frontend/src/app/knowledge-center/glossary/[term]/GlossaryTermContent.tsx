'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { TERMINOLOGY_REGISTRY, termIdToSlug, getGlossarySidebarData, TERM_CATEGORY_LABELS } from '@/lib/knowledge-center';
import type { TerminologyEntry } from '@/lib/knowledge-center';
import {
  ArticleBreadcrumb,
  ArticleHero,
  SpecificationTable,
  ArticleSchema,
} from '@/components/knowledge-center';

export default function GlossaryTermContent({
  entry,
  slug,
}: {
  entry: TerminologyEntry;
  slug: string;
}) {
  const sidebar = getGlossarySidebarData(slug);
  const relatedEntries = entry.relatedTerms
    .map((id) => TERMINOLOGY_REGISTRY[id])
    .filter(Boolean) as TerminologyEntry[];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <ArticleBreadcrumb items={[
        { label: 'Knowledge Center', href: '/knowledge-center' },
        { label: 'Glossary', href: '/knowledge-center/glossary' },
        { label: entry.term },
      ]} />

      <ArticleHero
        overline={entry.id}
        title={entry.term}
        gradient={false}
      >
        {/* Category chip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: '#FFF12D',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          {TERM_CATEGORY_LABELS[entry.category]}
        </motion.p>

        {entry.aliases.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            Also: {entry.aliases.join(' · ')}
          </motion.p>
        )}

        {entry.abbreviations.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,241,45,0.35)',
              letterSpacing: '0.04em',
            }}
          >
            Abbrev: {entry.abbreviations.join(' · ')}
          </motion.p>
        )}
      </ArticleHero>

      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
      }}>

        {/* Canonical definition */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            Canonical Definition
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.8)',
          }}>
            {entry.definition}
          </p>
        </motion.div>

        {/* Engineering context */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.13 }}
          style={{
            marginBottom: '3rem',
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px',
            padding: '1.5rem',
          }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(255,241,45,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            Engineering Context
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
          }}>
            {entry.engineeringContext}
          </p>
        </motion.div>

        {/* Applicable standards */}
        {sidebar.relatedStandards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Applicable Standards
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sidebar.relatedStandards.map((std) => (
                std.slug ? (
                  <Link
                    key={std.permanentId}
                    href={`/knowledge-center/standards/${std.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <motion.span
                      whileHover={{ borderColor: 'rgba(255,241,45,0.6)', color: '#FFF12D' }}
                      style={{
                        display: 'inline-block',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.72rem',
                        color: '#FFF12D',
                        border: '1px solid rgba(255,241,45,0.25)',
                        borderRadius: '4px',
                        padding: '3px 10px',
                        transition: 'border-color 0.2s, color 0.2s',
                        cursor: 'pointer',
                      }}
                    >
                      {std.code}
                    </motion.span>
                  </Link>
                ) : (
                  <span key={std.permanentId} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.72rem',
                    color: '#FFF12D',
                    border: '1px solid rgba(255,241,45,0.25)',
                    borderRadius: '4px',
                    padding: '3px 10px',
                  }}>
                    {std.code}
                  </span>
                )
              ))}
            </div>
          </motion.div>
        )}

        {/* Related technologies */}
        {sidebar.relatedTechnologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Related Technologies
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sidebar.relatedTechnologies.map((tech) => (
                <Link
                  key={tech.slug}
                  href={`/knowledge-center/technologies/${tech.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.span
                    whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                    style={{
                      display: 'inline-block',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      padding: '3px 10px',
                      transition: 'background 0.2s',
                    }}
                  >
                    {tech.name}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related systems */}
        {sidebar.relatedSystems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Protection Systems
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sidebar.relatedSystems.map((sys) => (
                <Link
                  key={sys.slug}
                  href={`/knowledge-center/systems/${sys.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.span
                    whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.55)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      padding: '4px 12px',
                      transition: 'background 0.2s',
                    }}
                  >
                    {sys.title}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Related articles (graph-driven) */}
        {sidebar.relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Knowledge Center Articles
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
              {sidebar.relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/knowledge-center/${article.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    whileHover={{ borderLeftColor: '#FFF12D', background: 'rgba(255,255,255,0.02)' }}
                    style={{
                      borderLeft: '2px solid rgba(255,255,255,0.08)',
                      padding: '0.75rem 1rem',
                      transition: 'border-left-color 0.2s, background 0.2s',
                    }}
                  >
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.58rem',
                      color: 'rgba(255,255,255,0.25)',
                      marginBottom: '0.3rem',
                    }}>
                      {article.readTime}
                    </p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.4,
                    }}>
                      {article.title}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* KC-00 Governance Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          style={{ marginBottom: '3rem' }}
        >
          <SpecificationTable
            title="KC-00 Governance Metadata"
            rows={[
              { label: 'Permanent ID', value: entry.id },
              { label: 'Category', value: TERM_CATEGORY_LABELS[entry.category] },
              { label: 'Status', value: entry.status.charAt(0).toUpperCase() + entry.status.slice(1) },
              { label: 'Version', value: entry.version },
              { label: 'Last Reviewed', value: entry.lastReviewed },
            ]}
          />
        </motion.div>

        {/* Related terms — pill links */}
        {relatedEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Related Terms
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {relatedEntries.map((t) => (
                <Link
                  key={t.id}
                  href={`/knowledge-center/glossary/${termIdToSlug(t.id)}`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    padding: '4px 12px',
                  }}
                >
                  {t.term}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ArticleSchema data={{
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        '@id': `https://elimfilters.com/knowledge-center/glossary/${slug}`,
        name: entry.term,
        description: entry.definition,
        identifier: entry.id,
        inDefinedTermSet: { '@id': 'https://elimfilters.com/knowledge-center/glossary' },
        author: { '@id': 'https://elimfilters.com/#organization' },
        version: entry.version,
        dateModified: entry.lastReviewed,
        alternateName: entry.aliases,
      }} />

      {/* BreadcrumbList JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Knowledge Center', item: 'https://elimfilters.com/knowledge-center' },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://elimfilters.com/knowledge-center/glossary' },
          { '@type': 'ListItem', position: 3, name: entry.term, item: `https://elimfilters.com/knowledge-center/glossary/${slug}` },
        ],
      }) }} />
    </main>
  );
}
