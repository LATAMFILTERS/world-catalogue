'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { PEP_SYSTEMS, PEP_FAMILIES } from '@/lib/pep-data';
import { KC_TECHNOLOGIES } from '@/lib/knowledge-center-data';

type ResultType = 'system' | 'family' | 'technology';

interface SearchResult {
  type: ResultType;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  PEP_SYSTEMS.forEach((s) => {
    results.push({
      type: 'system',
      slug: s.slug,
      title: s.name,
      subtitle: s.tagline,
      href: `/product-experience/systems/${s.slug}`,
      badge: s.number,
    });
  });

  PEP_FAMILIES.forEach((f) => {
    results.push({
      type: 'family',
      slug: f.slug,
      title: f.name,
      subtitle: f.purpose.slice(0, 120) + '…',
      href: `/product-experience/families/${f.slug}`,
      badge: [f.hdPrefix, f.ldPrefix].filter(Boolean).join(' / ') || undefined,
    });
  });

  KC_TECHNOLOGIES.forEach((t) => {
    results.push({
      type: 'technology',
      slug: t.slug,
      title: t.name,
      subtitle: t.tagline,
      href: `/product-experience/technologies/${t.slug}`,
      badge: t.domain,
    });
  });

  return results;
}

const INDEX = buildIndex();

const TYPE_LABELS: Record<ResultType, string> = {
  system: 'PROTECTION SYSTEM',
  family: 'PRODUCT FAMILY',
  technology: 'TECHNOLOGY',
};

const TYPE_COLORS: Record<ResultType, string> = {
  system: '#FFF12D',
  family: 'rgba(255,255,255,0.6)',
  technology: 'rgba(100,200,255,0.8)',
};

export default function PEPSearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ResultType | 'all'>('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return INDEX.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.slug.includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  const hasQuery = query.trim().length > 0;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #000 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
            }}
          >
            PRODUCT EXPERIENCE / SEARCH
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              lineHeight: 1.1,
              textAlign: 'justify',
              marginBottom: '2.5rem',
            }}
          >
            Platform Search
          </motion.h1>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ position: 'relative', marginBottom: '1.5rem' }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search systems, families, technologies…"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 0,
                padding: '1rem 3rem 1rem 1.25rem',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,241,45,0.4)';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            />
            <span style={{
              position: 'absolute',
              right: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.25)',
              pointerEvents: 'none',
            }}>
              {hasQuery ? `${results.length} RESULT${results.length !== 1 ? 'S' : ''}` : ''}
            </span>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
          >
            {(['all', 'system', 'family', 'technology'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  padding: '0.3rem 0.7rem',
                  background: filter === f ? 'rgba(255,241,45,0.12)' : 'transparent',
                  border: `1px solid ${filter === f ? 'rgba(255,241,45,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: filter === f ? '#FFF12D' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {f === 'all' ? 'ALL' : TYPE_LABELS[f]}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section style={{ padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {!hasQuery && (
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.08em',
                marginBottom: '2rem',
              }}>
                BROWSE BY CATEGORY
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.06)',
              }}>
                {[
                  { label: 'Protection Systems', count: PEP_SYSTEMS.length, href: '/product-experience', color: '#FFF12D' },
                  { label: 'Product Families', count: PEP_FAMILIES.length, href: '/product-experience/families', color: 'rgba(255,255,255,0.6)' },
                  { label: 'Technology Centers', count: KC_TECHNOLOGIES.length, href: '/product-experience/technologies/macrocore', color: 'rgba(100,200,255,0.8)' },
                ].map((cat) => (
                  <Link key={cat.label} href={cat.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <motion.div
                      whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                      style={{ background: '#000', padding: '1.75rem', cursor: 'pointer' }}
                    >
                      <p style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        fontSize: '2rem',
                        color: cat.color,
                        marginBottom: '0.25rem',
                      }}>
                        {cat.count}
                      </p>
                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.5)',
                      }}>
                        {cat.label}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>

              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.08em',
                marginTop: '3rem',
                textAlign: 'center',
              }}>
                LOOKING FOR A SPECIFIC PART NUMBER? USE{' '}
                <Link href="https://part-search.elimfilters.com" style={{ color: 'rgba(255,241,45,0.5)', textDecoration: 'none' }}>
                  PART SEARCH →
                </Link>
              </p>
            </div>
          )}

          {hasQuery && results.length === 0 && (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.08em',
                marginBottom: '0.75rem',
              }}>
                NO RESULTS FOR &quot;{query.toUpperCase()}&quot;
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.3)',
              }}>
                Try a technology name (MACROCORE, SYNTRAX), a system name (Air Intake, Hydraulic), or a standard code (ISO 16889).
              </p>
            </div>
          )}

          <AnimatePresence>
            {hasQuery && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  background: 'rgba(255,255,255,0.06)',
                }}
              >
                {results.map((result, i) => (
                  <motion.div
                    key={result.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link href={result.href} style={{ textDecoration: 'none', display: 'block' }}>
                      <motion.div
                        whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                        style={{
                          background: '#000',
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '1.5rem',
                          borderLeft: `3px solid transparent`,
                          transition: 'border-color 0.2s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderLeftColor = TYPE_COLORS[result.type] as string;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'transparent';
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.55rem',
                              color: TYPE_COLORS[result.type],
                              letterSpacing: '0.08em',
                              opacity: 0.7,
                            }}>
                              {TYPE_LABELS[result.type]}
                            </span>
                            {result.badge && (
                              <span style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '0.55rem',
                                color: 'rgba(255,255,255,0.25)',
                                letterSpacing: '0.06em',
                              }}>
                                {result.badge}
                              </span>
                            )}
                          </div>
                          <h3 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            color: '#fff',
                            marginBottom: '0.35rem',
                          }}>
                            {result.title}
                          </h3>
                          <p style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.8rem',
                            lineHeight: 1.5,
                            textAlign: 'justify',
                            color: 'rgba(255,255,255,0.4)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {result.subtitle}
                          </p>
                        </div>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.2)',
                          flexShrink: 0,
                        }}>→</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

    </main>
  );
}
