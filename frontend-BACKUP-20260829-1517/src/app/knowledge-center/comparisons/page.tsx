'use client';

import Link from 'next/link';
import { KC_COMPARISONS } from '@/lib/knowledge-center-data';
import type { KCComparisonCategory } from '@/lib/knowledge-center-data';

const CATEGORY_LABELS: Record<KCComparisonCategory, string> = {
  'standards':   'STANDARDS',
  'technology':  'TECHNOLOGY',
  'system':      'SYSTEM',
  'test-method': 'TEST METHOD',
};

const CATEGORY_COLORS: Record<KCComparisonCategory, string> = {
  'standards':   'rgba(255,241,45,0.7)',
  'technology':  'rgba(100,200,255,0.7)',
  'system':      'rgba(100,220,120,0.7)',
  'test-method': 'rgba(255,180,80,0.7)',
};

export default function ComparisonsPage() {
  const byCategory = {
    standards:   KC_COMPARISONS.filter(c => c.category === 'standards'),
    technology:  KC_COMPARISONS.filter(c => c.category === 'technology'),
    system:      KC_COMPARISONS.filter(c => c.category === 'system'),
    'test-method': KC_COMPARISONS.filter(c => c.category === 'test-method'),
  } satisfies Record<KCComparisonCategory, typeof KC_COMPARISONS>;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* Back nav */}
        <Link href="/knowledge-center" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none',
          letterSpacing: '0.08em',
          display: 'block',
          marginBottom: '2.5rem',
        }}>
          ← KNOWLEDGE CENTER
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            color: 'rgba(255,241,45,0.5)',
            letterSpacing: '0.1em',
            marginBottom: '0.75rem',
          }}>
            ENGINEERING COMPARISON ENGINE
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 1rem 0',
            lineHeight: 1.15,
          }}>
            Engineering Comparisons
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '640px',
            lineHeight: 1.7,
          }}>
            Side-by-side technical comparisons across filtration standards, technologies,
            system architectures, and test methods. Each comparison documents engineering
            trade-offs, decision criteria, and governing standards references.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          padding: '1rem 0',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '3rem',
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Comparisons', value: KC_COMPARISONS.length.toString() },
            { label: 'Categories',  value: '4' },
            { label: 'Standards referenced', value: Array.from(new Set(KC_COMPARISONS.flatMap(c => c.relatedStandards))).length.toString() },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#FFF12D',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.06em',
                marginTop: '0.1rem',
              }}>
                {stat.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Comparisons by category */}
        {(Object.entries(byCategory) as [KCComparisonCategory, typeof KC_COMPARISONS][]).map(([cat, items]) => (
          items.length === 0 ? null : (
            <section key={cat} style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  color: CATEGORY_COLORS[cat],
                  letterSpacing: '0.1em',
                  border: `1px solid ${CATEGORY_COLORS[cat].replace('0.7', '0.3')}`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '2px',
                }}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.2)',
                }}>
                  {items.length} comparison{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {items.map(comp => (
                  <ComparisonCard key={comp.id} comparison={comp} categoryColor={CATEGORY_COLORS[cat]} />
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </main>
  );
}

function ComparisonCard({
  comparison,
  categoryColor,
}: {
  comparison: typeof KC_COMPARISONS[number];
  categoryColor: string;
}) {
  return (
    <Link
      href={`/knowledge-center/comparisons/${comparison.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          padding: '1.25rem',
          cursor: 'pointer',
          transition: 'background 0.15s',
          height: '100%',
          boxSizing: 'border-box',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
        }}
      >
        {/* VS indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: categoryColor,
            background: categoryColor.replace('0.7', '0.08'),
            padding: '0.15rem 0.4rem',
            borderRadius: '2px',
          }}>
            A vs B
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.2)',
          }}>
            {comparison.matrix.length} dimensions
          </span>
        </div>

        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#fff',
          margin: '0 0 0.4rem 0',
          lineHeight: 1.3,
        }}>
          {comparison.title}
        </h3>

        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.4)',
          margin: '0 0 0.75rem 0',
          lineHeight: 1.5,
        }}>
          {comparison.subtitle}
        </p>

        {/* Option pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.04)',
            padding: '0.2rem 0.45rem',
            borderRadius: '2px',
          }}>
            A: {comparison.optionA.label}
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.04)',
            padding: '0.2rem 0.45rem',
            borderRadius: '2px',
          }}>
            B: {comparison.optionB.label}
          </span>
        </div>

        <div style={{
          marginTop: '0.75rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: categoryColor,
          letterSpacing: '0.06em',
        }}>
          COMPARE →
        </div>
      </div>
    </Link>
  );
}
