'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { search } from '@/lib/services';
import type { SearchResult } from '@/lib/services';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ConversionProvider } from '@/components/conversion';
import { EngineeringSearchBar } from '@/components/engineering';
import type { CustomerIntent } from '@/components/conversion';

// ─── Intent metadata ──────────────────────────────────────────────────────────

const INTENT_META: Record<CustomerIntent, { label: string; description: string; color: string }> = {
  KNOWN_PART: {
    label: 'Part Number Search',
    description: 'Searching for a specific part or OEM reference. Redirecting to Part Search.',
    color: '#FFF12D',
  },
  FAILURE_DIAGNOSIS: {
    label: 'Failure Diagnosis',
    description: 'Identified failure or contamination symptoms. Results prioritise failure modes and contamination mechanisms.',
    color: '#fca5a5',
  },
  PROACTIVE_PROTECTION: {
    label: 'Asset Protection',
    description: 'Seeking to prevent failures. Results show protection technologies and engineering principles.',
    color: '#86efac',
  },
  TECHNOLOGY_RESEARCH: {
    label: 'Technology Research',
    description: 'Researching filtration technologies, architectures, or engineering knowledge.',
    color: '#7dd3fc',
  },
  SUPPLIER_EVALUATION: {
    label: 'Standards & Compliance',
    description: 'Referenced an industrial standard. Results show applicable specifications and validated technologies.',
    color: '#c4b5fd',
  },
  EQUIPMENT_REPLACEMENT: {
    label: 'Equipment Replacement',
    description: 'Looking for replacement or upgrade options for existing equipment.',
    color: '#fdba74',
  },
  DISTRIBUTOR: {
    label: 'Distributor Search',
    description: 'Seeking authorised distribution or dealer information.',
    color: '#FFF12D',
  },
  UNKNOWN: {
    label: 'Engineering Search',
    description: 'Searching across the full Knowledge Graph.',
    color: 'rgba(255,255,255,0.4)',
  },
};

// ─── Entity type display config ───────────────────────────────────────────────

const ENTITY_CONFIG: Record<string, { label: string; color: string; bg: string; href: (id: string) => string }> = {
  FAILURE_MODE:            { label: 'FAILURE MODE',    color: '#fca5a5',  bg: 'rgba(252,165,165,0.1)',  href: id => `/engineering/failure-modes/${id}` },
  CONTAMINATION:           { label: 'CONTAMINATION',   color: '#fdba74',  bg: 'rgba(253,186,116,0.1)',  href: id => `/engineering/contamination/${id}` },
  TECHNOLOGY_ARCHITECTURE: { label: 'TECHNOLOGY',      color: '#FFF12D',  bg: 'rgba(255,241,45,0.08)',  href: id => `/engineering/technologies/${id}` },
  ENGINEERING_PRINCIPLE:   { label: 'PRINCIPLE',       color: '#7dd3fc',  bg: 'rgba(125,211,252,0.08)', href: id => `/engineering/principles/${id}` },
  STANDARD:                { label: 'STANDARD',        color: '#c4b5fd',  bg: 'rgba(196,181,253,0.08)', href: id => `/engineering/standards/${id}` },
  PROTECTION_MEDIA:        { label: 'PROTECTION MEDIA',color: '#86efac',  bg: 'rgba(134,239,172,0.08)', href: id => `/engineering/media/${id}` },
  ENGINEERING_MEMORY:      { label: 'FIELD RECORD',    color: '#FFF12D',  bg: 'rgba(255,241,45,0.05)',  href: id => `/knowledge-system` },
};

// ─── Group results by entity type ─────────────────────────────────────────────

type GroupedResults = Record<string, SearchResult[]>;

function groupByType(results: SearchResult[]): GroupedResults {
  const groups: GroupedResults = {};
  for (const r of results) {
    const t = r.entityType as string;
    if (!groups[t]) groups[t] = [];
    groups[t].push(r);
  }
  return groups;
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  const cfg = ENTITY_CONFIG[result.entityType as string] ?? {
    label: result.entityType, color: 'rgba(255,255,255,0.4)',
    bg: 'rgba(255,255,255,0.04)', href: () => '/knowledge-system',
  };

  return (
    <motion.a
      href={cfg.href(result.entityId)}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '6px', textDecoration: 'none',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = cfg.color + '40';
        (e.currentTarget as HTMLElement).style.background = cfg.bg;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
      }}
    >
      <span style={{
        fontSize: '0.58rem', padding: '0.2rem 0.5rem', borderRadius: '3px',
        background: cfg.bg, color: cfg.color,
        fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', marginTop: '0.15rem',
        flexShrink: 0,
      }}>
        {cfg.label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: '#fff', fontFamily: 'Outfit, sans-serif',
          fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem',
        }}>
          {result.label}
        </div>
        {result.excerpt && (
          <div style={{
            color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem',
            fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {result.excerpt}
          </div>
        )}
        <div style={{
          marginTop: '0.35rem', fontSize: '0.6rem',
          color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace',
          display: 'flex', gap: '0.5rem',
        }}>
          <span>{result.entityId}</span>
          {result.matchedFields.length > 0 && (
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>
              · matched: {result.matchedFields.slice(0, 3).join(', ')}
            </span>
          )}
        </div>
      </div>
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', marginTop: '0.15rem', flexShrink: 0 }}>→</span>
    </motion.a>
  );
}

// ─── Result group ─────────────────────────────────────────────────────────────

function ResultGroup({ entityType, results, groupIndex }: { entityType: string; results: SearchResult[]; groupIndex: number }) {
  const cfg = ENTITY_CONFIG[entityType];
  const label = cfg?.label ?? entityType;
  const color = cfg?.color ?? 'rgba(255,255,255,0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: groupIndex * 0.08 }}
      style={{ marginBottom: '2rem' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          fontSize: '0.62rem', color, fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.1em',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </div>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {results.map((r, i) => (
          <ResultCard key={r.nodeId} result={r} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── No results ───────────────────────────────────────────────────────────────

function NoResults({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '3rem 0', textAlign: 'center' }}
    >
      <div style={{
        fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem',
      }}>
        NO RESULTS
      </div>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        No engineering knowledge found for &ldquo;{query}&rdquo;.
      </p>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        justifyContent: 'center', marginBottom: '1.5rem',
      }}>
        {['filter blinding', 'particle wear', 'ISO 16889', 'hydraulic contamination', 'bearing failure'].map(s => (
          <a
            key={s}
            href={`/search?q=${encodeURIComponent(s)}`}
            style={{
              padding: '0.4rem 0.85rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.8rem', textDecoration: 'none',
            }}
          >
            {s}
          </a>
        ))}
      </div>
      <a href="/knowledge-system" style={{
        color: '#FFF12D', fontSize: '0.85rem', textDecoration: 'none',
      }}>
        Browse the Knowledge System →
      </a>
    </motion.div>
  );
}

// ─── Intent banner ────────────────────────────────────────────────────────────

function IntentBanner({ intent, query }: { intent: CustomerIntent; query: string }) {
  const meta = INTENT_META[intent];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '0.85rem 1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${meta.color}25`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: '0 6px 6px 0',
        marginBottom: '2rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div style={{
          fontSize: '0.6rem', color: meta.color,
          fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.25rem',
        }}>
          INTENT DETECTED: {meta.label.toUpperCase()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
          {meta.description}
        </div>
      </div>
      {intent === 'KNOWN_PART' && (
        <a
          href={`https://part-search.elimfilters.com?q=${encodeURIComponent(query)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.5rem 1.25rem',
            background: '#FFF12D', border: 'none', borderRadius: '4px',
            color: '#000', fontFamily: 'Outfit, sans-serif',
            fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
            whiteSpace: 'nowrap', alignSelf: 'center',
          }}
        >
          Search Parts →
        </a>
      )}
    </motion.div>
  );
}

// ─── Search page inner (needs useSearchParams) ────────────────────────────────

const TYPE_ORDER = [
  'FAILURE_MODE', 'CONTAMINATION', 'TECHNOLOGY_ARCHITECTURE',
  'ENGINEERING_PRINCIPLE', 'STANDARD', 'PROTECTION_MEDIA', 'ENGINEERING_MEMORY',
];

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState<CustomerIntent>('UNKNOWN');
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    const hits = search(q, { maxResults: 30 });
    setResults(hits);
    setHasSearched(true);
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  }, [router]);

  // Run on mount if query param present
  useEffect(() => {
    if (queryParam) runSearch(queryParam);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  function handleResult(hits: SearchResult[], detectedIntent: CustomerIntent) {
    setResults(hits);
    setIntent(detectedIntent);
    setHasSearched(true);
  }

  const grouped = groupByType(results);
  const orderedTypes = [
    ...TYPE_ORDER.filter(t => grouped[t]),
    ...Object.keys(grouped).filter(t => !TYPE_ORDER.includes(t)),
  ];

  return (
    <>
      <Navigation />
      <main style={{ background: '#000', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{
          padding: '3rem 8% 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: '#000',
        }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div style={{
              fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem',
              letterSpacing: '0.12em',
            }}>
              ENGINEERING KNOWLEDGE SEARCH
            </div>

            <EngineeringSearchBar
              initialQuery={queryParam}
              onResult={handleResult}
              placeholder="Failure mode, contamination, standard, technology…"
              autoFocus
            />
          </div>
        </div>

        {/* Results area */}
        <div style={{ padding: '2.5rem 8%' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>

            <AnimatePresence mode="wait">
              {!hasSearched && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ paddingTop: '2rem' }}
                >
                  {/* Entry points */}
                  <div style={{
                    fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)',
                    fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.5rem',
                  }}>
                    SUGGESTED SEARCHES
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Filter blinding', type: 'FAILURE' },
                      { label: 'Hydraulic contamination', type: 'CONTAMINATION' },
                      { label: 'ISO 16889', type: 'STANDARD' },
                      { label: 'MACROCORE', type: 'TECHNOLOGY' },
                      { label: 'Particle wear', type: 'FAILURE' },
                      { label: 'Diesel water contamination', type: 'CONTAMINATION' },
                      { label: 'Bearing failure', type: 'FAILURE' },
                      { label: 'Depth filtration', type: 'PRINCIPLE' },
                    ].map(s => (
                      <button
                        key={s.label}
                        onClick={() => runSearch(s.label)}
                        style={{
                          padding: '0.85rem 1rem', textAlign: 'left',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '6px', cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
                          fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.3rem',
                        }}>
                          {s.type}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
                          {s.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {hasSearched && results.length === 0 && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <NoResults query={query} />
                </motion.div>
              )}

              {hasSearched && results.length > 0 && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {/* Intent + summary */}
                  <IntentBanner intent={intent} query={query} />

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '1.75rem',
                  }}>
                    <div style={{
                      fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {results.length} RESULTS · {orderedTypes.length} CATEGORIES
                    </div>
                    <div style={{
                      fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      KNOWLEDGE GRAPH v2.0.0
                    </div>
                  </div>

                  {/* Grouped results */}
                  {orderedTypes.map((type, gi) => (
                    <ResultGroup
                      key={type}
                      entityType={type}
                      results={grouped[type]}
                      groupIndex={gi}
                    />
                  ))}

                  {/* Engineering CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      marginTop: '2rem', padding: '1.5rem',
                      background: 'rgba(255,241,45,0.03)',
                      border: '1px solid rgba(255,241,45,0.15)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{
                      fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
                      fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem',
                    }}>
                      NEED A GUIDED DIAGNOSIS?
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                      Our Engineering Intelligence Platform can trace your failure mode to its root cause and recommend the appropriate protection system.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a href="/engineering/diagnosis" style={{
                        padding: '0.55rem 1.25rem',
                        background: '#FFF12D', border: 'none', borderRadius: '4px',
                        color: '#000', fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                      }}>
                        Start Problem Diagnosis →
                      </a>
                      <a href="/engineering/asset-protection" style={{
                        padding: '0.55rem 1.25rem',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '4px', color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', textDecoration: 'none',
                      }}>
                        Protect Your Assets
                      </a>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── Page export (Suspense boundary for useSearchParams) ──────────────────────

export default function SearchPage() {
  return (
    <ConversionProvider>
      <Suspense fallback={
        <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
            Loading search…
          </div>
        </div>
      }>
        <SearchPageInner />
      </Suspense>
    </ConversionProvider>
  );
}
