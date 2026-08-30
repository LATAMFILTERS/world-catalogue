'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_DASHBOARD_DATA } from '@/lib/knowledge-center/dashboard-analytics';
import type { KCRankedNode, KCRecentStandard, KCTypeConnectivity } from '@/lib/knowledge-center/dashboard-types';

// ── Palette ───────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  standard:    '#FFF12D',
  technology:  '#4FC3F7',
  article:     '#A5D6A7',
  term:        '#CE93D8',
  system:      '#FFAB40',
  diagram:     '#80DEEA',
  calculator:  '#EF9A9A',
  comparison:  '#F48FB1',
  industry:    '#BCAAA4',
  problem:     '#FF7043',
};

const TYPE_LABEL: Record<string, string> = {
  standard:    'Standard',
  technology:  'Technology',
  article:     'Article',
  term:        'Term',
  system:      'System',
  diagram:     'Diagram',
  calculator:  'Calculator',
  comparison:  'Comparison',
  industry:    'Industry',
  problem:     'Problem',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily:    'JetBrains Mono, monospace',
      fontSize:      '0.6rem',
      letterSpacing: '0.1em',
      color:         'rgba(255,255,255,0.3)',
      marginBottom:  '1rem',
    }}>
      {children}
    </p>
  );
}

function StatCard({ value, label, accent = '#FFF12D' }: { value: string | number; label: string; accent?: string }) {
  return (
    <div style={{
      background: '#0a0a0a',
      border:     '1px solid rgba(255,255,255,0.07)',
      padding:    '1.25rem 1.5rem',
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700,
        fontSize:   'clamp(1.4rem, 2.5vw, 1.8rem)',
        color:      accent,
        lineHeight: 1,
        marginBottom: '0.4rem',
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize:   '0.72rem',
        color:      'rgba(255,255,255,0.4)',
      }}>
        {label}
      </p>
    </div>
  );
}

function EdgeBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span style={{
      fontFamily:  'JetBrains Mono, monospace',
      fontSize:    '0.6rem',
      color:       'rgba(255,241,45,0.5)',
      background:  'rgba(255,241,45,0.06)',
      border:      '1px solid rgba(255,241,45,0.12)',
      padding:     '0.1rem 0.4rem',
      marginLeft:  '0.5rem',
      whiteSpace:  'nowrap',
    }}>
      {count} ↔
    </span>
  );
}

function RankedNodeCard({ node, rank }: { node: KCRankedNode; rank: number }) {
  const color = TYPE_COLOR[node.type] ?? '#fff';
  return (
    <Link href={node.href} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ background: 'rgba(255,255,255,0.03)' }}
        style={{
          display:       'flex',
          alignItems:    'flex-start',
          gap:           '0.75rem',
          padding:       '0.75rem 0',
          borderBottom:  '1px solid rgba(255,255,255,0.05)',
          transition:    'background 0.15s',
          cursor:        'pointer',
        }}
      >
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize:   '0.65rem',
          color:      'rgba(255,255,255,0.2)',
          minWidth:   '1.5rem',
          paddingTop: '0.1rem',
        }}>
          {String(rank).padStart(2, '0')}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: node.code ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
              fontWeight: 600,
              fontSize:   '0.82rem',
              color:      '#fff',
            }}>
              {node.label}
            </span>
            <EdgeBadge count={node.edgeCount} />
          </div>
          {node.meta && (
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize:   '0.68rem',
              color:      'rgba(255,255,255,0.3)',
              marginTop:  '0.15rem',
            }}>
              {node.meta}
            </p>
          )}
        </div>
        <span style={{
          fontFamily:    'JetBrains Mono, monospace',
          fontSize:      '0.55rem',
          color:         color,
          opacity:       0.7,
          letterSpacing: '0.05em',
          paddingTop:    '0.15rem',
          whiteSpace:    'nowrap',
        }}>
          {TYPE_LABEL[node.type] ?? node.type}
        </span>
      </motion.div>
    </Link>
  );
}

function RankedPanel({ title, nodes }: { title: string; nodes: KCRankedNode[] }) {
  return (
    <div style={{
      background: '#050505',
      border:     '1px solid rgba(255,255,255,0.07)',
      padding:    '1.25rem 1.5rem',
    }}>
      <SectionLabel>{title}</SectionLabel>
      {nodes.map((node, i) => (
        <RankedNodeCard key={node.key} node={node} rank={i + 1} />
      ))}
    </div>
  );
}

function ConnectivityRow({ row }: { row: KCTypeConnectivity }) {
  const color = TYPE_COLOR[row.type] ?? '#fff';
  const fillPct = row.nodeCount > 0 ? Math.round((row.nodeCount - row.isolated) / row.nodeCount * 100) : 0;
  return (
    <div style={{
      display:       'grid',
      gridTemplateColumns: '90px 1fr 52px 52px 52px',
      gap:           '1rem',
      alignItems:    'center',
      padding:       '0.6rem 0',
      borderBottom:  '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{
        fontFamily:    'JetBrains Mono, monospace',
        fontSize:      '0.62rem',
        color,
        letterSpacing: '0.04em',
      }}>
        {TYPE_LABEL[row.type] ?? row.type}
      </span>
      <div style={{ background: 'rgba(255,255,255,0.05)', height: '3px', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          width:      `${fillPct}%`,
          height:     '100%',
          background: color,
          opacity:    0.5,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
        {row.avg}
      </span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
        {row.max}
      </span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: row.isolated > 0 ? '#FF7043' : 'rgba(255,255,255,0.2)', textAlign: 'right' }}>
        {row.isolated}
      </span>
    </div>
  );
}

function RecentStandardCard({ s }: { s: KCRecentStandard }) {
  return (
    <Link href={s.href} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ background: 'rgba(255,241,45,0.04)' }}
        style={{
          border:     '1px solid rgba(255,255,255,0.07)',
          padding:    '0.875rem 1rem',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize:   '0.78rem',
            color:      '#FFF12D',
          }}>
            {s.code}
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize:   '0.6rem',
            color:      'rgba(255,241,45,0.4)',
            whiteSpace: 'nowrap',
          }}>
            {s.year}
            {s.edgeCount > 0 && <> · {s.edgeCount} ↔</>}
          </span>
        </div>
        <p style={{
          fontFamily:   'Inter, sans-serif',
          fontSize:     '0.7rem',
          color:        'rgba(255,255,255,0.4)',
          marginTop:    '0.25rem',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
        }}>
          {s.title}
        </p>
      </motion.div>
    </Link>
  );
}

// ── Entity count grid ─────────────────────────────────────────────────────────

function EntityCountGrid() {
  const { entityCounts } = KC_DASHBOARD_DATA;
  const ORDER = ['article', 'standard', 'technology', 'term', 'system', 'diagram', 'calculator', 'comparison', 'industry', 'problem'] as const;
  return (
    <div style={{
      display:               'grid',
      gridTemplateColumns:   'repeat(auto-fit, minmax(100px, 1fr))',
      gap:                   '1px',
      background:            'rgba(255,255,255,0.05)',
      border:                '1px solid rgba(255,255,255,0.07)',
    }}>
      {ORDER.map(type => {
        const count = entityCounts[type] ?? 0;
        const color = TYPE_COLOR[type] ?? '#fff';
        return (
          <div key={type} style={{ background: '#000', padding: '1rem 0.875rem' }}>
            <p style={{
              fontFamily:  'JetBrains Mono, monospace',
              fontWeight:  700,
              fontSize:    '1.4rem',
              color,
              lineHeight:  1,
              marginBottom:'0.3rem',
            }}>
              {count}
            </p>
            <p style={{
              fontFamily:    'JetBrains Mono, monospace',
              fontSize:      '0.58rem',
              letterSpacing: '0.08em',
              color:         'rgba(255,255,255,0.3)',
            }}>
              {type.toUpperCase()}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { graphSummary, typeConnectivity, topStandards, topTechnologies, topArticles,
          topTerms, topDiagrams, topCalculators, topComparisons, recentStandards,
          graphVersion } = KC_DASHBOARD_DATA;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/knowledge-center" style={{
          fontFamily:    'JetBrains Mono, monospace',
          fontSize:      '0.65rem',
          color:         'rgba(255,255,255,0.35)',
          textDecoration:'none',
          letterSpacing: '0.06em',
        }}>
          ← KNOWLEDGE CENTER
        </Link>
      </div>

      {/* Hero */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem) 3rem', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p style={{
            fontFamily:    'JetBrains Mono, monospace',
            fontSize:      '0.62rem',
            letterSpacing: '0.12em',
            color:         'rgba(255,241,45,0.5)',
            marginBottom:  '1rem',
          }}>
            ENGINEERING INTELLIGENCE DASHBOARD · {graphVersion}
          </p>
          <h1 style={{
            fontFamily:   'Outfit, sans-serif',
            fontWeight:   700,
            fontSize:     'clamp(1.8rem, 4vw, 3rem)',
            lineHeight:   1.1,
            marginBottom: '1rem',
          }}>
            Knowledge Graph Analytics
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize:   '0.95rem',
            lineHeight: 1.7,
            color:      'rgba(255,255,255,0.55)',
            maxWidth:   '600px',
          }}>
            Graph-driven analytics across all engineering entities.
            Rankings, connectivity, and coverage derived entirely from graph metadata — no manual curation.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem) 6rem' }}>

        {/* Graph Statistics */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <SectionLabel>GRAPH STATISTICS</SectionLabel>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap:                 '1px',
            background:          'rgba(255,241,45,0.08)',
            border:              '1px solid rgba(255,241,45,0.12)',
          }}>
            <StatCard value={graphSummary.totalNodes}                                     label="Total Entities"       />
            <StatCard value={graphSummary.totalEdges}                                     label="Graph Connections"    />
            <StatCard value={`${graphSummary.avgConnections}`}                            label="Avg Connections"      />
            <StatCard value={`${graphSummary.connectivityPct}%`}                          label="Entities Connected"   accent="rgba(255,241,45,0.7)" />
            <StatCard value={graphSummary.isolatedNodes}                                  label="Isolated Entities"    accent={graphSummary.isolatedNodes > 0 ? '#FF7043' : 'rgba(255,255,255,0.4)'} />
            <StatCard value={graphSummary.connectedNodes}                                 label="Connected Entities"   accent="#A5D6A7" />
          </div>
        </motion.section>

        {/* Entity Coverage */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ marginBottom: '3rem' }}
        >
          <SectionLabel>ENTITY COVERAGE</SectionLabel>
          <EntityCountGrid />
        </motion.section>

        {/* Top Standards + Top Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '1px',
            marginBottom:        '1px',
          }}
        >
          <RankedPanel title="MOST CONNECTED STANDARDS"    nodes={topStandards}    />
          <RankedPanel title="MOST CONNECTED TECHNOLOGIES" nodes={topTechnologies} />
        </motion.section>

        {/* Top Articles + Top Terms */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '1px',
            marginBottom:        '3rem',
          }}
        >
          <RankedPanel title="MOST REFERENCED ARTICLES"   nodes={topArticles}     />
          <RankedPanel title="MOST LINKED GLOSSARY TERMS" nodes={topTerms}        />
        </motion.section>

        {/* Recently Added Standards */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <SectionLabel>RECENTLY ADDED STANDARDS</SectionLabel>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap:                 '1px',
            background:          'rgba(255,255,255,0.05)',
          }}>
            {recentStandards.map(s => (
              <RecentStandardCard key={s.slug} s={s} />
            ))}
          </div>
        </motion.section>

        {/* Diagrams + Comparisons */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '1px',
            marginBottom:        '3rem',
          }}
        >
          <RankedPanel title="FEATURED DIAGRAMS"     nodes={topDiagrams}    />
          <RankedPanel title="FEATURED COMPARISONS"  nodes={topComparisons} />
        </motion.section>

        {/* Calculators */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={{ marginBottom: '3rem' }}
        >
          <SectionLabel>ENGINEERING CALCULATORS</SectionLabel>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap:                 '1px',
            background:          'rgba(255,255,255,0.05)',
          }}>
            {topCalculators.map((calc, i) => (
              <Link key={calc.key} href={calc.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ background: 'rgba(239,154,154,0.05)' }}
                  style={{
                    background: '#000',
                    padding:    '1rem 1.25rem',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{
                      fontFamily:    'JetBrains Mono, monospace',
                      fontSize:      '0.6rem',
                      color:         'rgba(239,154,154,0.5)',
                      letterSpacing: '0.06em',
                    }}>
                      CALC {String(i + 1).padStart(2, '0')}
                    </span>
                    {calc.edgeCount > 0 && (
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize:   '0.58rem',
                        color:      'rgba(239,154,154,0.4)',
                      }}>
                        {calc.edgeCount} ↔
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontFamily:   'Inter, sans-serif',
                    fontWeight:   600,
                    fontSize:     '0.78rem',
                    color:        '#fff',
                    marginBottom: '0.2rem',
                    lineHeight:   1.3,
                  }}>
                    {calc.label}
                  </p>
                  {calc.code && (
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize:   '0.62rem',
                      color:      '#FFF12D',
                      opacity:    0.6,
                    }}>
                      {calc.code}
                    </p>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Type Connectivity Table */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          style={{ marginBottom: '3rem' }}
        >
          <SectionLabel>GRAPH CONNECTIVITY BY ENTITY TYPE</SectionLabel>
          <div style={{
            background: '#050505',
            border:     '1px solid rgba(255,255,255,0.07)',
            padding:    '1.25rem 1.5rem',
          }}>
            {/* Column headers */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: '90px 1fr 52px 52px 52px',
              gap:                 '1rem',
              paddingBottom:       '0.5rem',
              borderBottom:        '1px solid rgba(255,255,255,0.08)',
              marginBottom:        '0.25rem',
            }}>
              {['TYPE', 'CONNECTED', 'AVG', 'MAX', 'ISO'].map(h => (
                <span key={h} style={{
                  fontFamily:    'JetBrains Mono, monospace',
                  fontSize:      '0.58rem',
                  letterSpacing: '0.08em',
                  color:         'rgba(255,255,255,0.2)',
                  textAlign:     h === 'TYPE' || h === 'CONNECTED' ? 'left' : 'right',
                }}>
                  {h}
                </span>
              ))}
            </div>
            {typeConnectivity.map(row => (
              <ConnectivityRow key={row.type} row={row} />
            ))}
          </div>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize:   '0.58rem',
            color:      'rgba(255,255,255,0.2)',
            marginTop:  '0.5rem',
          }}>
            AVG = average connections per entity · MAX = highest single entity · ISO = isolated (0 connections)
          </p>
        </motion.section>

        {/* Attribution */}
        <div style={{
          borderTop:  '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.5rem',
          display:    'flex',
          gap:        '1.5rem',
          flexWrap:   'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{
            fontFamily:    'JetBrains Mono, monospace',
            fontSize:      '0.58rem',
            color:         'rgba(255,255,255,0.2)',
            letterSpacing: '0.06em',
          }}>
            ENGINEERING INTELLIGENCE DASHBOARD · GRAPH-DRIVEN · DETERMINISTIC · NO LLM · NO RUNTIME API · STATIC EXPORT
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize:   '0.58rem',
            color:      'rgba(255,241,45,0.3)',
          }}>
            {graphVersion}
          </p>
        </div>

      </div>
    </main>
  );
}
