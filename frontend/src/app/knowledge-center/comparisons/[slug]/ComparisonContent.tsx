'use client';

import Link from 'next/link';
import type { KCComparison, KCComparisonCategory } from '@/lib/knowledge-center-data';

const CATEGORY_LABELS: Record<KCComparisonCategory, string> = {
  'standards':   'STANDARDS',
  'technology':  'TECHNOLOGY',
  'system':      'SYSTEM',
  'test-method': 'TEST METHOD',
};

const CATEGORY_COLORS: Record<KCComparisonCategory, string> = {
  'standards':   'rgba(255,241,45,0.8)',
  'technology':  'rgba(100,200,255,0.8)',
  'system':      'rgba(100,220,120,0.8)',
  'test-method': 'rgba(255,180,80,0.8)',
};

export default function ComparisonContent({
  comparison: c,
}: {
  comparison: KCComparison;
}) {
  const color = CATEGORY_COLORS[c.category];
  const colorMid = color.replace('0.8', '0.4');
  const colorDim = color.replace('0.8', '0.12');

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* Back nav */}
        <Link href="/knowledge-center/comparisons" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.35)',
          textDecoration: 'none',
          letterSpacing: '0.08em',
          display: 'block',
          marginBottom: '2.5rem',
        }}>
          ← COMPARISONS
        </Link>

        {/* Header */}
        <div style={{
          borderLeft: `3px solid ${color}`,
          paddingLeft: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: color,
            letterSpacing: '0.1em',
            background: colorDim,
            padding: '0.2rem 0.5rem',
            borderRadius: '2px',
            display: 'inline-block',
            marginBottom: '0.75rem',
          }}>
            {CATEGORY_LABELS[c.category]}
          </span>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.2,
          }}>
            {c.title}
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {c.subtitle}
          </p>
        </div>

        {/* Engineering objective + scope */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '2.5rem',
        }}>
          <div style={{ background: '#000', padding: '1.25rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.62rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}>ENGINEERING OBJECTIVE</p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.65,
              margin: 0,
              textAlign: 'justify',
            }}>
              {c.engineeringObjective}
            </p>
          </div>
          <div style={{ background: '#000', padding: '1.25rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.62rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}>COMPARISON SCOPE</p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.65,
              margin: 0,
              textAlign: 'justify',
            }}>
              {c.comparisonScope}
            </p>
          </div>
        </div>

        {/* Governing standards */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
            marginBottom: '0.6rem',
          }}>GOVERNING STANDARDS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {c.governingStandards.map(std => (
              <span key={std} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                color: color,
                border: `1px solid ${colorMid}`,
                padding: '0.2rem 0.55rem',
                borderRadius: '2px',
              }}>
                {std}
              </span>
            ))}
          </div>
        </div>

        {/* ── OPTION A vs B ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
          }}>OPTION DEFINITIONS</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}>
            {[c.optionA, c.optionB].map((opt, idx) => (
              <div key={opt.id} style={{
                background: '#000',
                padding: '1.5rem',
                borderTop: `3px solid ${idx === 0 ? 'rgba(100,200,255,0.6)' : 'rgba(255,180,80,0.6)'}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: idx === 0 ? 'rgba(100,200,255,0.9)' : 'rgba(255,180,80,0.9)',
                    background: idx === 0 ? 'rgba(100,200,255,0.08)' : 'rgba(255,180,80,0.08)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '2px',
                  }}>
                    {opt.id}
                  </span>
                  <span style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#fff',
                  }}>
                    {opt.label}
                  </span>
                </div>

                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.7,
                  marginBottom: '1rem',
                  textAlign: 'justify',
                }}>
                  {opt.description}
                </p>

                <div style={{ marginBottom: '0.85rem' }}>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(100,220,120,0.6)',
                    letterSpacing: '0.08em',
                    marginBottom: '0.4rem',
                  }}>ADVANTAGES</p>
                  {opt.advantages.map((adv, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'rgba(100,220,120,0.5)', flexShrink: 0, marginTop: '0.1rem' }}>+</span>
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.78rem',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.5,
                      }}>
                        {adv}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(255,80,80,0.6)',
                    letterSpacing: '0.08em',
                    marginBottom: '0.4rem',
                  }}>LIMITATIONS</p>
                  {opt.limitations.map((lim, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'rgba(255,80,80,0.5)', flexShrink: 0, marginTop: '0.1rem' }}>−</span>
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.78rem',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.5,
                      }}>
                        {lim}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.08em',
                    marginBottom: '0.4rem',
                  }}>TYPICAL APPLICATIONS</p>
                  {opt.typicalApplications.map((app, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>·</span>
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.78rem',
                        color: 'rgba(255,255,255,0.4)',
                        lineHeight: 1.5,
                      }}>
                        {app}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMPARISON MATRIX ─────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
            marginBottom: '1rem',
          }}>ENGINEERING COMPARISON MATRIX</p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.06em',
                    width: '28%',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    DIMENSION
                  </th>
                  <th style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'rgba(100,200,255,0.7)',
                    letterSpacing: '0.06em',
                    width: '34%',
                    background: 'rgba(100,200,255,0.04)',
                  }}>
                    A — {c.optionA.label}
                  </th>
                  <th style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'rgba(255,180,80,0.7)',
                    letterSpacing: '0.06em',
                    width: '34%',
                    background: 'rgba(255,180,80,0.04)',
                  }}>
                    B — {c.optionB.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.matrix.map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}>
                    <td style={{
                      padding: '0.55rem 0.75rem',
                      color: 'rgba(255,255,255,0.55)',
                      verticalAlign: 'top',
                    }}>
                      <div>{row.dimension}</div>
                      {row.engineeringNote && (
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '0.6rem',
                          color: 'rgba(255,255,255,0.25)',
                          marginTop: '0.25rem',
                          lineHeight: 1.4,
                        }}>
                          {row.engineeringNote}
                        </div>
                      )}
                    </td>
                    <td style={{
                      padding: '0.55rem 0.75rem',
                      color: 'rgba(100,200,255,0.7)',
                      verticalAlign: 'top',
                      lineHeight: 1.5,
                    }}>
                      {row.optionA}
                    </td>
                    <td style={{
                      padding: '0.55rem 0.75rem',
                      color: 'rgba(255,180,80,0.7)',
                      verticalAlign: 'top',
                      lineHeight: 1.5,
                    }}>
                      {row.optionB}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── WHEN TO USE / NOT ─────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          marginBottom: '2.5rem',
        }}>
          {/* When to use A */}
          <WhenBlock
            title="WHEN TO USE A"
            optionLabel={c.optionA.label}
            clauses={c.whenToUse.filter(w => w.option === 'A')}
            notClauses={c.whenNotToUse.filter(w => w.option === 'A')}
            accentColor="rgba(100,200,255,0.8)"
          />
          {/* When to use B */}
          <WhenBlock
            title="WHEN TO USE B"
            optionLabel={c.optionB.label}
            clauses={c.whenToUse.filter(w => w.option === 'B')}
            notClauses={c.whenNotToUse.filter(w => w.option === 'B')}
            accentColor="rgba(255,180,80,0.8)"
          />
        </div>

        {/* ── ENGINEERING IMPLICATIONS ──────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
            marginBottom: '0.75rem',
          }}>ENGINEERING IMPLICATIONS</p>
          <div style={{
            border: '1px solid rgba(255,241,45,0.15)',
            background: 'rgba(255,241,45,0.03)',
            padding: '1.25rem',
          }}>
            {c.engineeringImplications.map((impl, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: i < c.engineeringImplications.length - 1 ? '0.8rem' : 0 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  color: 'rgba(255,241,45,0.5)',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.65,
                  textAlign: 'justify',
                }}>
                  {impl}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RELATED ENTITIES ─────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.08em',
            marginBottom: '0.75rem',
          }}>RELATED KNOWLEDGE</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {c.relatedStandards.length > 0 && (
              <RelatedGroup
                label="STANDARDS"
                items={c.relatedStandards.map(s => ({
                  label: s.replace(/-/g, ' ').toUpperCase(),
                  href: `/knowledge-center/standards/${s}`,
                }))}
                color="rgba(255,241,45,0.6)"
              />
            )}
            {c.relatedTechnologies.length > 0 && (
              <RelatedGroup
                label="TECHNOLOGIES"
                items={c.relatedTechnologies.map(t => ({
                  label: t,
                  href: `/knowledge-center/technologies/${t.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                }))}
                color="rgba(100,200,255,0.6)"
              />
            )}
            {c.relatedArticles.length > 0 && (
              <RelatedGroup
                label="ARTICLES"
                items={c.relatedArticles.map(a => ({
                  label: a.replace(/-/g, ' '),
                  href: `/knowledge-center/articles/${a}`,
                }))}
                color="rgba(100,220,120,0.6)"
              />
            )}
          </div>
        </div>

        {/* Revision */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.2)',
          }}>
            {c.id} · v{c.revisionHistory[c.revisionHistory.length - 1].version} · {c.revisionHistory[c.revisionHistory.length - 1].date}
          </span>
          <Link href="/knowledge-center/comparisons" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.25)',
            textDecoration: 'none',
            letterSpacing: '0.06em',
          }}>
            ← ALL COMPARISONS
          </Link>
        </div>
      </div>
    </main>
  );
}

function WhenBlock({
  title,
  optionLabel,
  clauses,
  notClauses,
  accentColor,
}: {
  title: string;
  optionLabel: string;
  clauses: { conditions: string[] }[];
  notClauses: { conditions: string[] }[];
  accentColor: string;
}) {
  return (
    <div style={{
      background: '#000',
      padding: '1.25rem',
      borderTop: `2px solid ${accentColor.replace('0.8', '0.4')}`,
    }}>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem',
        color: accentColor,
        letterSpacing: '0.08em',
        marginBottom: '0.25rem',
      }}>
        {title}
      </p>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.35)',
        marginBottom: '0.75rem',
        fontStyle: 'italic',
      }}>
        {optionLabel}
      </p>

      {clauses.flatMap(cl => cl.conditions).map((cond, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'rgba(100,220,120,0.5)', flexShrink: 0 }}>✓</span>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.5,
          }}>
            {cond}
          </span>
        </div>
      ))}

      {notClauses.length > 0 && notClauses.flatMap(cl => cl.conditions).length > 0 && (
        <>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,80,80,0.5)',
            letterSpacing: '0.08em',
            margin: '0.75rem 0 0.35rem 0',
          }}>
            WHEN NOT TO USE
          </p>
          {notClauses.flatMap(cl => cl.conditions).map((cond, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{ color: 'rgba(255,80,80,0.45)', flexShrink: 0 }}>✗</span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.5,
              }}>
                {cond}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function RelatedGroup({
  label,
  items,
  color,
}: {
  label: string;
  items: { label: string; href: string }[];
  color: string;
}) {
  return (
    <div>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.6rem',
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.08em',
        marginBottom: '0.5rem',
      }}>
        {label}
      </p>
      {items.map(item => (
        <Link key={item.href} href={item.href} style={{
          display: 'block',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.78rem',
          color: color,
          textDecoration: 'none',
          marginBottom: '0.25rem',
          lineHeight: 1.4,
        }}>
          {item.label} →
        </Link>
      ))}
    </div>
  );
}
