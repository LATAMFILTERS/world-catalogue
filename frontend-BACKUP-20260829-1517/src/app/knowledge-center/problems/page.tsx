'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  PROBLEM_STUBS,
  PROBLEM_CATEGORY_LABELS,
  PROBLEM_SEVERITY_COLORS,
} from '@/lib/knowledge-center';
import type { ProblemCategory, ProblemStub } from '@/lib/knowledge-center';

const CATEGORY_ORDER: ProblemCategory[] = [
  'mechanical-wear',
  'contamination',
  'structural-failure',
  'chemical-degradation',
  'biological',
];

const CATEGORY_DESCRIPTIONS: Record<ProblemCategory, string> = {
  'mechanical-wear': 'Surface degradation caused by particle-to-surface and surface-to-surface contact under load.',
  'contamination': 'Entry or accumulation of particles, water, or other foreign matter in fluid and air circuits.',
  'structural-failure': 'Mechanical failure of filter or system components due to pressure, fatigue, or cavitation.',
  'chemical-degradation': 'Chemical changes in fluid composition resulting in deposits, viscosity loss, or acid formation.',
  'biological': 'Microbial contamination in fuel and fluid systems leading to biomass deposits and corrosion.',
};

export default function ProblemsPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: PROBLEM_CATEGORY_LABELS[cat],
    description: CATEGORY_DESCRIPTIONS[cat],
    problems: PROBLEM_STUBS.filter((p) => p.category === cat),
  }));

  const totalProblems = PROBLEM_STUBS.length;

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              KC-11 — Problem Graph
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#fff',
            }}>
              Industrial Equipment Failure Problems
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              {totalProblems} canonical failure problems across 5 categories. Each problem is a first-class
              entity in the Knowledge Graph, linking contamination sources, affected components,
              measurement standards, and filtration technologies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Groups */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)' }}>
        {grouped.map((group, gi) => (
          <motion.div
            key={group.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: gi * 0.07 }}
            style={{ marginBottom: '3.5rem' }}
          >
            {/* Category header */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
              marginBottom: '0.6rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '1.15rem',
                color: '#fff',
              }}>
                {group.label}
              </h2>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.06em',
              }}>
                {group.problems.length} PROBLEM{group.problems.length !== 1 ? 'S' : ''}
              </span>
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '1.25rem',
              lineHeight: 1.6,
            }}>
              {group.description}
            </p>

            {/* Problem cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.75rem',
            }}>
              {group.problems.map((problem) => (
                <ProblemCard key={problem.slug} problem={problem} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': 'https://elimfilters.com/knowledge-center/problems',
            'name': 'Industrial Equipment Failure Problems — Problem Graph',
            'description': `${totalProblems} canonical industrial failure problems mapped to contamination sources and filtration solutions.`,
            'url': 'https://elimfilters.com/knowledge-center/problems',
            'isPartOf': { '@id': 'https://elimfilters.com/knowledge-center' },
            'author': { '@id': 'https://elimfilters.com/#organization' },
            'numberOfItems': totalProblems,
          }),
        }}
      />
    </main>
  );
}

function ProblemCard({ problem }: { problem: ProblemStub }) {
  const severityColor = PROBLEM_SEVERITY_COLORS[problem.severity as keyof typeof PROBLEM_SEVERITY_COLORS];
  const hasContent = Boolean(problem.definition || (problem.sections && problem.sections.length > 0));

  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,255,255,0.03)' }}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '6px',
        padding: '1rem 1.25rem',
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'pointer',
      }}
    >
      <Link
        href={`/knowledge-center/problems/${problem.slug}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        {/* ID + severity */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.06em',
          }}>
            {problem.id}
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.06em',
            color: severityColor,
            textTransform: 'uppercase',
            border: `1px solid ${severityColor}40`,
            borderRadius: '3px',
            padding: '1px 6px',
          }}>
            {problem.severity}
          </span>
        </div>

        {/* Name */}
        <p style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          fontSize: '0.95rem',
          color: '#fff',
          marginBottom: '0.5rem',
        }}>
          {problem.name}
        </p>

        {/* Status */}
        {hasContent ? (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.58rem',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Engineering reference available
          </span>
        ) : (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.58rem',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Engineering content pending — Phase 3
          </span>
        )}
      </Link>
    </motion.div>
  );
}
