'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_LEARNING_PATHS } from '@/lib/knowledge-center/learning-paths-registry';

const DIFFICULTY_LABELS: Record<string, string> = {
  foundation:    'Foundation',
  intermediate:  'Intermediate',
  advanced:      'Advanced',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  foundation:    '#44ff88',
  intermediate:  '#FFF12D',
  advanced:      '#ff8c00',
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function LearningPathsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '1100px', margin: '0 auto' }}>
        <Link href="/knowledge-center" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,241,45,0.5)',
          textDecoration: 'none',
        }}>
          ← KNOWLEDGE CENTER
        </Link>
      </div>

      {/* Hero */}
      <section style={{ padding: '4rem 2rem 3rem', maxWidth: '860px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '1rem',
          }}>
            ENGINEERING LEARNING PATHS
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}>
            Structured Engineering<br />Learning Sequences
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '600px',
            textAlign: 'justify',
          }}>
            Curated sequences of articles, standards, diagrams, and calculators drawn from the Engineering Knowledge Graph. Each path builds understanding progressively from foundational concepts to applied engineering decisions.
          </p>
        </motion.div>
      </section>

      {/* Paths grid */}
      <section style={{ padding: '0 2rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {KC_LEARNING_PATHS.map((path, i) => (
            <motion.div
              key={path.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link href={`/knowledge-center/learning-paths/${path.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                <motion.div
                  whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                  style={{
                    background: '#000',
                    padding: '2rem',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
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
                      whiteSpace: 'nowrap',
                    }}>
                      {formatMinutes(path.totalMinutes)} · {path.steps.length} steps
                    </span>
                  </div>

                  <div>
                    <h2 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      fontSize: '1.15rem',
                      color: '#fff',
                      marginBottom: '0.4rem',
                      lineHeight: 1.2,
                    }}>
                      {path.title}
                    </h2>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(255,241,45,0.6)',
                      lineHeight: 1.4,
                    }}>
                      {path.subtitle}
                    </p>
                  </div>

                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.83rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.45)',
                    flexGrow: 1,
                    textAlign: 'justify',
                  }}>
                    {path.description}
                  </p>

                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,241,45,0.4)',
                  }}>
                    START PATH →
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

    </main>
  );
}
