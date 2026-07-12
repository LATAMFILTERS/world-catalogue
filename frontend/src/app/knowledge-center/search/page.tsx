'use client';

/**
 * search/page.tsx
 * ELIMFILTERS Knowledge Center — Engineering Search
 *
 * Phase 6E: Engineering Search
 *
 * Deterministic graph-aware search across all 10 KC entity types.
 * Zero runtime APIs — scoring is pure client-side computation over
 * the pre-built KC_SEARCH_INDEX.
 *
 * Fuse.js not used — custom deterministic scoring engine.
 * Bundle cost: route-split by Next.js; no shared bundle impact.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_SEARCH_INDEX, KC_SEARCH_TYPE_COUNTS } from '@/lib/knowledge-center/search-index';
import { search, explainResult } from '@/lib/knowledge-center/search-engine';
import type { KCSearchEntityType, KCSearchFilter, KCSearchResult } from '@/lib/knowledge-center/search-types';

// ── Display config ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<KCSearchEntityType, string> = {
  article:     'ARTICLE',
  standard:    'STANDARD',
  technology:  'TECHNOLOGY',
  term:        'GLOSSARY',
  system:      'SYSTEM',
  diagram:     'DIAGRAM',
  calculator:  'CALCULATOR',
  comparison:  'COMPARISON',
  industry:    'INDUSTRY',
  problem:     'PROBLEM',
};

const TYPE_COLORS: Record<KCSearchEntityType, string> = {
  article:     'rgba(100,180,255,0.8)',
  standard:    'rgba(255,241,45,0.8)',
  technology:  'rgba(100,220,120,0.8)',
  term:        'rgba(200,160,255,0.8)',
  system:      'rgba(255,180,80,0.8)',
  diagram:     'rgba(80,220,220,0.8)',
  calculator:  'rgba(255,130,130,0.8)',
  comparison:  'rgba(255,200,80,0.8)',
  industry:    'rgba(180,180,180,0.8)',
  problem:     'rgba(255,100,100,0.8)',
};

const FILTER_OPTIONS: { type: KCSearchFilter; label: string }[] = [
  { type: 'all',         label: 'ALL' },
  { type: 'standard',   label: 'STANDARDS' },
  { type: 'technology', label: 'TECHNOLOGIES' },
  { type: 'article',    label: 'ARTICLES' },
  { type: 'term',       label: 'GLOSSARY' },
  { type: 'diagram',    label: 'DIAGRAMS' },
  { type: 'calculator', label: 'CALCULATORS' },
  { type: 'comparison', label: 'COMPARISONS' },
  { type: 'system',     label: 'SYSTEMS' },
];

const QUICK_SEARCHES = [
  'ISO 16889',
  'beta ratio',
  'hydraulic',
  'cabin air',
  'fuel contamination',
  'pressure drop',
  'cleanliness codes',
  'wear particles',
  'MACROCORE',
  'bypass valve',
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultCard({ result, index }: { result: KCSearchResult; index: number }) {
  const doc   = result.document;
  const color = TYPE_COLORS[doc.type];
  const expl  = explainResult(result);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Link href={doc.href} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '1rem 1.25rem',
            display: 'flex',
            gap: '0.85rem',
            alignItems: 'flex-start',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = 'rgba(255,255,255,0.18)';
            el.style.background  = 'rgba(255,255,255,0.025)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = 'rgba(255,255,255,0.07)';
            el.style.background  = '';
          }}
        >
          {/* Type badge */}
          <span style={{
            fontFamily:    'JetBrains Mono, monospace',
            fontSize:      '0.55rem',
            fontWeight:    700,
            color:         color,
            background:    color.replace('0.8', '0.07'),
            border:        `1px solid ${color.replace('0.8', '0.3')}`,
            padding:       '0.18rem 0.45rem',
            whiteSpace:    'nowrap',
            marginTop:     '0.18rem',
            letterSpacing: '0.07em',
            flexShrink:    0,
          }}>
            {TYPE_LABELS[doc.type]}
          </span>

          <div style={{ minWidth: 0, flex: 1 }}>
            {/* Title */}
            <p style={{
              fontFamily:   'Outfit, sans-serif',
              fontWeight:   600,
              fontSize:     '0.95rem',
              color:        '#fff',
              marginBottom: '0.2rem',
              lineHeight:   1.25,
            }}>
              {doc.label}
            </p>

            {/* Subtitle */}
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize:   '0.78rem',
              color:      'rgba(255,255,255,0.42)',
              lineHeight: 1.45,
            }}>
              {doc.subtitle.length > 110
                ? doc.subtitle.slice(0, 110) + '…'
                : doc.subtitle}
            </p>

            {/* Explanation */}
            {expl && (
              <p style={{
                fontFamily:  'JetBrains Mono, monospace',
                fontSize:    '0.57rem',
                color:       'rgba(255,255,255,0.22)',
                marginTop:   '0.3rem',
                letterSpacing: '0.02em',
              }}>
                {expl}
              </p>
            )}
          </div>

          {/* Score badge (graph connections) */}
          {doc.edgeCount > 0 && (
            <span style={{
              fontFamily:  'JetBrains Mono, monospace',
              fontSize:    '0.55rem',
              color:       'rgba(255,241,45,0.35)',
              whiteSpace:  'nowrap',
              marginTop:   '0.2rem',
              flexShrink:  0,
            }}>
              {doc.edgeCount}↔
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query,      setQuery]      = useState('');
  const [activeFilter, setFilter]   = useState<KCSearchFilter>('all');

  // Run search engine — deterministic, no external APIs
  const allResults = useMemo(() => {
    if (!query || query.length < 2) return [];
    return search(KC_SEARCH_INDEX, query, 80);
  }, [query]);

  // Apply entity-type filter
  const results: KCSearchResult[] = useMemo(() => {
    if (activeFilter === 'all') return allResults;
    return allResults.filter(r => r.document.type === activeFilter);
  }, [allResults, activeFilter]);

  // Count per type among unfiltered results
  const countByType = useMemo(() => {
    const m: Partial<Record<KCSearchEntityType, number>> = {};
    for (const r of allResults) {
      m[r.document.type] = (m[r.document.type] ?? 0) + 1;
    }
    return m;
  }, [allResults]);

  const hasQuery = query.length >= 2;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* ── Hero + input ──────────────────────────────────────────────────────── */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding:      'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>

          <Link href="/knowledge-center" style={{
            fontFamily:    'JetBrains Mono, monospace',
            fontSize:      '0.65rem',
            letterSpacing: '0.1em',
            color:         'rgba(255,255,255,0.35)',
            textDecoration:'none',
            display:       'inline-block',
            marginBottom:  '2rem',
          }}>
            ← KNOWLEDGE CENTER
          </Link>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              fontFamily:    'JetBrains Mono, monospace',
              fontSize:      '0.65rem',
              letterSpacing: '0.12em',
              color:         '#FFF12D',
              marginBottom:  '0.75rem',
            }}
          >
            06 / ENGINEERING SEARCH
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.07 }}
            style={{
              fontFamily:   'Outfit, sans-serif',
              fontWeight:   700,
              fontSize:     'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight:   1.15,
              marginBottom: '0.5rem',
            }}
          >
            Search Engineering Knowledge
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            style={{
              fontFamily:   'Inter, sans-serif',
              fontSize:     '0.85rem',
              color:        'rgba(255,255,255,0.4)',
              marginBottom: '1.75rem',
              lineHeight:   1.6,
            }}
          >
            {KC_SEARCH_INDEX.length} entities indexed across {Object.keys(KC_SEARCH_TYPE_COUNTS).length} entity types.
            Deterministic graph-aware ranking — standards, technologies, articles, glossary, diagrams, calculators, comparisons, systems, and more.
          </motion.p>

          {/* Search input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14 }}
            style={{ position: 'relative' }}
          >
            <input
              type="text"
              placeholder="Search by standard code, topic, technology, term, or symptom…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              style={{
                width:      '100%',
                background: 'rgba(255,255,255,0.04)',
                border:     '1px solid rgba(255,255,255,0.15)',
                color:      '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize:   '1rem',
                padding:    '0.95rem 2.5rem 0.95rem 1.2rem',
                outline:    'none',
                boxSizing:  'border-box',
                borderRadius: 0,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position:  'absolute',
                  right:     '1rem',
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  background:'none',
                  border:    'none',
                  color:     'rgba(255,255,255,0.35)',
                  cursor:    'pointer',
                  fontSize:  '0.9rem',
                  padding:   '0.25rem',
                }}
              >
                ✕
              </button>
            )}
          </motion.div>

          {/* Quick searches (shown when no query) */}
          {!hasQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.22 }}
              style={{ marginTop: '1.25rem' }}
            >
              <p style={{
                fontFamily:    'JetBrains Mono, monospace',
                fontSize:      '0.58rem',
                letterSpacing: '0.1em',
                color:         'rgba(255,255,255,0.22)',
                marginBottom:  '0.65rem',
              }}>
                COMMON SEARCHES
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {QUICK_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    style={{
                      fontFamily:  'JetBrains Mono, monospace',
                      fontSize:    '0.68rem',
                      color:       'rgba(255,255,255,0.45)',
                      background:  'rgba(255,255,255,0.03)',
                      border:      '1px solid rgba(255,255,255,0.08)',
                      padding:     '0.3rem 0.65rem',
                      cursor:      'pointer',
                      transition:  'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.borderColor = 'rgba(255,241,45,0.35)';
                      el.style.color       = '#FFF12D';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.borderColor = 'rgba(255,255,255,0.08)';
                      el.style.color       = 'rgba(255,255,255,0.45)';
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

      {/* ── Results ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '880px',
        margin:   '0 auto',
        padding:  'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 4rem)',
      }}>

        {hasQuery && (
          <>
            {/* Filter pills + result count */}
            <div style={{
              display:       'flex',
              alignItems:    'center',
              gap:           '0.4rem',
              flexWrap:      'wrap',
              marginBottom:  '1.25rem',
            }}>
              <span style={{
                fontFamily:    'JetBrains Mono, monospace',
                fontSize:      '0.6rem',
                color:         'rgba(255,255,255,0.25)',
                letterSpacing: '0.06em',
                marginRight:   '0.3rem',
              }}>
                {allResults.length > 0
                  ? `${results.length} OF ${allResults.length} RESULTS`
                  : `0 RESULTS FOR "${query.toUpperCase()}"`}
              </span>

              {FILTER_OPTIONS.map(opt => {
                const count = opt.type === 'all'
                  ? allResults.length
                  : (countByType[opt.type as KCSearchEntityType] ?? 0);
                if (opt.type !== 'all' && count === 0) return null;
                const isActive = activeFilter === opt.type;
                return (
                  <button
                    key={opt.type}
                    onClick={() => setFilter(opt.type)}
                    style={{
                      fontFamily:    'JetBrains Mono, monospace',
                      fontSize:      '0.57rem',
                      letterSpacing: '0.07em',
                      color:         isActive ? '#000' : 'rgba(255,255,255,0.4)',
                      background:    isActive ? '#FFF12D' : 'rgba(255,255,255,0.04)',
                      border:        `1px solid ${isActive ? '#FFF12D' : 'rgba(255,255,255,0.1)'}`,
                      padding:       '0.22rem 0.55rem',
                      cursor:        'pointer',
                      transition:    'all 0.15s',
                    }}
                  >
                    {opt.label}
                    {count > 0 && ` (${count})`}
                  </button>
                );
              })}
            </div>

            {/* Engine attribution */}
            <div style={{
              fontFamily:    'JetBrains Mono, monospace',
              fontSize:      '0.52rem',
              color:         'rgba(255,255,255,0.12)',
              letterSpacing: '0.03em',
              marginBottom:  '1rem',
            }}>
              DETERMINISTIC SCORING · NO LLM · NO RUNTIME API · GRAPH-DENSITY WEIGHTED · STATIC EXPORT
            </div>

            {/* No results */}
            {results.length === 0 && (
              <div style={{
                border:    '1px solid rgba(255,255,255,0.07)',
                padding:   '2.5rem',
                textAlign: 'center',
              }}>
                <p style={{
                  fontFamily:   'Inter, sans-serif',
                  fontSize:     '0.88rem',
                  color:        'rgba(255,255,255,0.38)',
                  marginBottom: '1rem',
                }}>
                  {activeFilter !== 'all'
                    ? `No ${TYPE_LABELS[activeFilter as KCSearchEntityType]} results. Try clearing the filter.`
                    : 'No matches. Try a standard code (ISO 16889), technology (MACROCORE), or contamination type (silica).'}
                </p>
                {activeFilter !== 'all' ? (
                  <button
                    onClick={() => setFilter('all')}
                    style={{
                      fontFamily:  'JetBrains Mono, monospace',
                      fontSize:    '0.7rem',
                      color:       '#FFF12D',
                      background:  'transparent',
                      border:      '1px solid rgba(255,241,45,0.35)',
                      padding:     '0.35rem 0.75rem',
                      cursor:      'pointer',
                    }}
                  >
                    CLEAR FILTER
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {QUICK_SEARCHES.slice(0, 4).map(term => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize:   '0.68rem',
                          color:      '#FFF12D',
                          background: 'transparent',
                          border:     '1px solid rgba(255,241,45,0.3)',
                          padding:    '0.3rem 0.65rem',
                          cursor:     'pointer',
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Results list */}
            {results.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {results.map((result, i) => (
                  <ResultCard
                    key={result.document.id}
                    result={result}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state — overview grid */}
        {!hasQuery && (
          <div>
            <p style={{
              fontFamily:    'JetBrains Mono, monospace',
              fontSize:      '0.6rem',
              letterSpacing: '0.08em',
              color:         'rgba(255,255,255,0.22)',
              marginBottom:  '1rem',
            }}>
              INDEX OVERVIEW
            </p>
            <div style={{
              display:               'grid',
              gridTemplateColumns:   'repeat(auto-fill, minmax(180px, 1fr))',
              gap:                   '1px',
              background:            'rgba(255,255,255,0.04)',
              border:                '1px solid rgba(255,255,255,0.04)',
              marginBottom:          '2rem',
            }}>
              {(Object.entries(KC_SEARCH_TYPE_COUNTS) as [KCSearchEntityType, number][])
                .sort(([,a],[,b]) => b - a)
                .map(([type, count]) => {
                  const color = TYPE_COLORS[type] ?? 'rgba(255,255,255,0.5)';
                  return (
                    <div key={type} style={{
                      background: 'rgba(255,255,255,0.02)',
                      padding:    '1rem',
                    }}>
                      <div style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize:   '1.35rem',
                        fontWeight: 700,
                        color,
                        lineHeight: 1,
                        marginBottom: '0.35rem',
                      }}>
                        {count}
                      </div>
                      <div style={{
                        fontFamily:    'JetBrains Mono, monospace',
                        fontSize:      '0.58rem',
                        color:         'rgba(255,255,255,0.3)',
                        letterSpacing: '0.07em',
                      }}>
                        {TYPE_LABELS[type] ?? type.toUpperCase()}
                      </div>
                    </div>
                  );
              })}
            </div>

            <p style={{
              fontFamily:    'JetBrains Mono, monospace',
              fontSize:      '0.52rem',
              color:         'rgba(255,255,255,0.12)',
              letterSpacing: '0.03em',
            }}>
              DETERMINISTIC GRAPH-AWARE SEARCH ENGINE · PHASE 6E · STATIC EXPORT · ZERO RUNTIME APIS
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
