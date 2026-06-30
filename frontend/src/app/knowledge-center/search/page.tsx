'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ENGINEERING_ARTICLES, KC_STANDARDS, KC_SYSTEMS, KC_INDUSTRIES } from '@/lib/knowledge-center-data';

type ResultItem = {
  type: 'article' | 'standard' | 'system' | 'industry';
  title: string;
  subtitle: string;
  href: string;
  tags: string[];
};

const ALL_RESULTS: ResultItem[] = [
  ...ENGINEERING_ARTICLES.map((a) => ({
    type: 'article' as const,
    title: a.title,
    subtitle: a.subtitle,
    href: `/knowledge-center/engineering/${a.slug}`,
    tags: [...a.keywords, ...a.relatedStandards, ...a.relatedTechnologies, a.category],
  })),
  ...KC_STANDARDS.map((s) => ({
    type: 'standard' as const,
    title: s.code,
    subtitle: s.scope,
    href: `/knowledge-center/standards/${s.slug}`,
    tags: [...s.relatedTopics, ...s.relatedTechnologies, s.code],
  })),
  ...KC_SYSTEMS.map((sys) => ({
    type: 'system' as const,
    title: sys.title,
    subtitle: sys.description,
    href: `/knowledge-center/systems`,
    tags: [...sys.technologies, ...sys.standards, ...sys.challenges],
  })),
  ...KC_INDUSTRIES.map((ind) => ({
    type: 'industry' as const,
    title: ind.title,
    subtitle: ind.description,
    href: `/knowledge-center/industries`,
    tags: [ind.title, ind.dust],
  })),
];

const TYPE_LABELS: Record<string, string> = {
  article: 'ENGINEERING',
  standard: 'STANDARD',
  system: 'SYSTEM',
  industry: 'INDUSTRY',
};

const QUICK_SEARCHES = [
  'ISO 16889',
  'beta ratio',
  'hydraulic',
  'cabin air',
  'fuel contamination',
  'pressure drop',
  'cleanliness codes',
  'wear particles',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return ALL_RESULTS.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query]);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <Link href="/knowledge-center" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.35)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '2rem',
          }}>
            ← KNOWLEDGE CENTER
          </Link>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
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
            06 / KNOWLEDGE SEARCH
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.15,
              textAlign: 'justify',
              marginBottom: '2rem',
            }}
          >
            Search Engineering Knowledge
          </motion.h1>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by topic, standard code, symptom, or technology..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  padding: '1rem 1.25rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.35)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.25rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>

          {/* Quick searches */}
          {!query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{ marginTop: '1.5rem' }}
            >
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.25)',
                marginBottom: '0.75rem',
              }}>
                COMMON SEARCHES
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {QUICK_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.78rem',
                      color: 'rgba(255,255,255,0.5)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '0.35rem 0.75rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,241,45,0.3)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#FFF12D';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Results */}
      <section style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        {query.length >= 2 && (
          <>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '1.5rem',
            }}>
              {results.length > 0 ? `${results.length} RESULTS FOR "${query.toUpperCase()}"` : `NO RESULTS FOR "${query.toUpperCase()}"`}
            </p>

            {results.length === 0 && (
              <div style={{
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '2.5rem',
                textAlign: 'center',
              }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '1rem',
                }}>
                  No matches found. Try a standard code (ISO 16889), technology name (MACROCORE), or contamination type (silica dust).
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {QUICK_SEARCHES.slice(0, 4).map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.7rem',
                        color: '#FFF12D',
                        background: 'transparent',
                        border: '1px solid rgba(255,241,45,0.3)',
                        padding: '0.3rem 0.65rem',
                        cursor: 'pointer',
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {results.map((item, i) => (
                <motion.div
                  key={`${item.type}-${item.title}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                    <motion.div
                      whileHover={{ borderColor: 'rgba(255,241,45,0.25)', background: 'rgba(255,241,45,0.02)' }}
                      style={{
                        border: '1px solid rgba(255,255,255,0.07)',
                        padding: '1.25rem 1.5rem',
                        transition: 'border-color 0.2s, background 0.2s',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        color: '#FFF12D',
                        background: 'rgba(255,241,45,0.08)',
                        padding: '0.2rem 0.4rem',
                        whiteSpace: 'nowrap',
                        marginTop: '0.15rem',
                      }}>
                        {TYPE_LABELS[item.type]}
                      </span>
                      <div>
                        <p style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 600,
                          fontSize: '0.98rem',
                          color: '#fff',
                          marginBottom: '0.25rem',
                          lineHeight: 1.25,
                          textAlign: 'justify',
                        }}>
                          {item.title}
                        </p>
                        <p style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.8rem',
                          color: 'rgba(255,255,255,0.4)',
                          lineHeight: 1.5,
                          textAlign: 'justify',
                        }}>
                          {item.subtitle.length > 120 ? item.subtitle.slice(0, 120) + '…' : item.subtitle}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {!query && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}>
            {[
              { label: `${ENGINEERING_ARTICLES.length} Engineering Articles`, href: '/knowledge-center/engineering', icon: '📐' },
              { label: `${KC_STANDARDS.length} Standards`, href: '/knowledge-center/standards', icon: '📋' },
              { label: `${KC_SYSTEMS.length} Protection Systems`, href: '/knowledge-center/systems', icon: '⚙️' },
              { label: `${KC_INDUSTRIES.length} Industry Profiles`, href: '/knowledge-center/industries', icon: '🏭' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.25)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '1.25rem',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <p style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{item.icon}</p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                    {item.label}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
