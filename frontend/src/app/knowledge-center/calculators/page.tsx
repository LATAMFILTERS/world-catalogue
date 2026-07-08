'use client';

import Link from 'next/link';
import { KC_CALCULATORS } from '@/lib/knowledge-center-data';

const CATEGORY_LABELS: Record<string, string> = {
  'fluid-cleanliness':    'FLUID CLEANLINESS',
  'filtration-efficiency':'FILTRATION EFFICIENCY',
  'pressure-drop':        'PRESSURE DROP',
  'service-interval':     'SERVICE INTERVAL',
  'air-intake':           'AIR INTAKE',
};

export default function CalculatorsHubPage() {
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
            { label: 'Engineering Calculators', href: undefined },
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
        maxWidth: '900px',
      }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.12em',
          color: 'rgba(255,241,45,0.5)',
          marginBottom: '1.25rem',
          textTransform: 'uppercase',
        }}>
          ENGINEERING CALCULATORS · 7 TOOLS
        </p>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(1.75rem, 4vw, 3rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          letterSpacing: '-0.02em',
        }}>
          Standards-Based Filtration<br />Engineering Calculators
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.65)',
          maxWidth: '620px',
          textAlign: 'justify',
        }}>
          Pure engineering tools derived from published ISO, SAE, and ASTM standards.
          Each calculator implements the exact formula from the governing standard,
          with worked examples and engineering notes. No approximations, no marketing claims.
        </p>
      </section>

      {/* Calculator Grid */}
      <section style={{
        padding: 'clamp(2rem, 6vw, 4rem) clamp(1.5rem, 5vw, 4rem)',
        maxWidth: '1200px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {KC_CALCULATORS.map((calc) => (
            <Link
              key={calc.slug}
              href={`/knowledge-center/calculators/${calc.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#000',
                padding: '2rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,241,45,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = '#000')}
              >
                {/* Category tag */}
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,241,45,0.45)',
                  textTransform: 'uppercase',
                }}>
                  {CATEGORY_LABELS[calc.category] ?? calc.category}
                </p>

                {/* Title */}
                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#fff',
                  lineHeight: 1.3,
                  margin: 0,
                }}>
                  {calc.title}
                </h2>

                {/* Description */}
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                  flex: 1,
                }}>
                  {calc.description}
                </p>

                {/* Standard */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.05em',
                  }}>
                    {calc.governingStandard}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(255,241,45,0.5)',
                    letterSpacing: '0.08em',
                  }}>
                    OPEN →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Engineering note */}
      <section style={{
        padding: '0 clamp(1.5rem, 5vw, 4rem) clamp(2rem, 6vw, 4rem)',
        maxWidth: '1200px',
      }}>
        <div style={{
          background: 'rgba(255,241,45,0.04)',
          border: '1px solid rgba(255,241,45,0.12)',
          borderRadius: '4px',
          padding: '1.25rem 1.5rem',
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
          }}>
            All calculators implement published standard formulae exactly as specified.
            Results are planning estimates suitable for engineering evaluation.
            For certification, specification, or procurement decisions, refer to the
            governing standard document directly.
          </p>
        </div>
      </section>

    </main>
  );
}
