'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { LearningPath, LearningPathStep } from '@/lib/knowledge-center/learning-paths-registry';

const DIFFICULTY_LABELS: Record<string, string> = {
  foundation:   'Foundation',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  foundation:   '#44ff88',
  intermediate: '#FFF12D',
  advanced:     '#ff8c00',
};

const TYPE_LABELS: Record<LearningPathStep['type'], string> = {
  article:    'ARTICLE',
  standard:   'STANDARD',
  diagram:    'DIAGRAM',
  calculator: 'CALCULATOR',
  comparison: 'COMPARISON',
};

const TYPE_COLORS: Record<LearningPathStep['type'], string> = {
  article:    'rgba(255,255,255,0.25)',
  standard:   '#FFF12D',
  diagram:    '#44ff88',
  calculator: '#44aaff',
  comparison: '#ff8c00',
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function LearningPathContent({ path }: { path: LearningPath }) {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '1100px', margin: '0 auto' }}>
        <span>
          <Link href="/knowledge-center" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.4)',
            textDecoration: 'none',
          }}>
            KNOWLEDGE CENTER
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 0.5rem', fontSize: '0.65rem' }}>/</span>
          <Link href="/knowledge-center/learning-paths" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.4)',
            textDecoration: 'none',
          }}>
            LEARNING PATHS
          </Link>
        </span>
      </div>

      {/* Hero */}
      <section style={{ padding: '3.5rem 2rem 3rem', maxWidth: '860px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              color: DIFFICULTY_COLORS[path.difficulty],
              border: `1px solid ${DIFFICULTY_COLORS[path.difficulty]}40`,
              padding: '0.2rem 0.5rem',
              background: `${DIFFICULTY_COLORS[path.difficulty]}10`,
            }}>
              {DIFFICULTY_LABELS[path.difficulty].toUpperCase()}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.3)',
            }}>
              {formatMinutes(path.totalMinutes)} · {path.steps.length} steps
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: '0.75rem',
          }}>
            {path.title}
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,241,45,0.65)',
            marginBottom: '1.25rem',
          }}>
            {path.subtitle}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'justify',
            maxWidth: '680px',
          }}>
            {path.description}
          </p>
        </motion.div>

        {/* Meta cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1px',
            background: 'rgba(255,241,45,0.08)',
            border: '1px solid rgba(255,241,45,0.1)',
            marginTop: '2rem',
          }}
        >
          <div style={{ background: '#000', padding: '1rem 1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: '#FFF12D' }}>
              {path.steps.length}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
              Learning steps
            </p>
          </div>
          <div style={{ background: '#000', padding: '1rem 1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: '#FFF12D' }}>
              {formatMinutes(path.totalMinutes)}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
              Estimated total time
            </p>
          </div>
          <div style={{ background: '#000', padding: '1rem 1.25rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', color: DIFFICULTY_COLORS[path.difficulty] }}>
              {DIFFICULTY_LABELS[path.difficulty]}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
              Difficulty
            </p>
          </div>
        </motion.div>

        {/* Prerequisites */}
        {path.prerequisites && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              marginTop: '1.5rem',
              padding: '0.875rem 1rem',
              border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: '2px solid rgba(255,255,255,0.15)',
            }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '0.35rem',
            }}>
              PREREQUISITES
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              {path.prerequisites}
            </p>
          </motion.div>
        )}
      </section>

      {/* Steps */}
      <section style={{ padding: '0 2rem 4rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '1.5rem',
        }}>
          LEARNING SEQUENCE
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
          {path.steps.map((step, i) => (
            <motion.div
              key={`${step.type}-${step.slug}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
            >
              <Link href={step.href} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.025)', borderLeftColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    background: '#000',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Step number */}
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'rgba(255,241,45,0.3)',
                    minWidth: '1.75rem',
                    paddingTop: '0.1rem',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.55rem',
                        letterSpacing: '0.1em',
                        color: TYPE_COLORS[step.type],
                        border: `1px solid ${TYPE_COLORS[step.type]}30`,
                        padding: '0.15rem 0.4rem',
                        background: `${TYPE_COLORS[step.type]}08`,
                      }}>
                        {TYPE_LABELS[step.type]}
                      </span>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.2)',
                      }}>
                        {step.estimatedMinutes} min
                      </span>
                    </div>
                    <p style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: '#fff',
                      marginBottom: '0.3rem',
                      lineHeight: 1.2,
                    }}>
                      {step.title}
                    </p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.82rem',
                      lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.42)',
                      textAlign: 'justify',
                    }}>
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    color: 'rgba(255,241,45,0.2)',
                    paddingTop: '0.15rem',
                  }}>
                    →
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Outcome */}
      <section style={{ padding: '0 2rem 6rem', maxWidth: '860px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{
            padding: '1.5rem',
            border: '1px solid rgba(255,241,45,0.12)',
            background: 'rgba(255,241,45,0.02)',
          }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.75rem',
          }}>
            LEARNING OUTCOME
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'justify',
          }}>
            {path.outcomeStatement}
          </p>
        </motion.div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/knowledge-center/learning-paths" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            textDecoration: 'none',
          }}>
            ← ALL LEARNING PATHS
          </Link>
        </div>
      </section>

    </main>
  );
}
